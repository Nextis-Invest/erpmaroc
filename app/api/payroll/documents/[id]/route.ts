import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";
import { documentStorageService } from "@/services/DocumentStorageService";
import { documentStatusService } from "@/services/DocumentStatusService";
import {
  DocumentStatus,
  getStatusDisplayText,
  getStatusColor,
  getValidNextStatuses
} from "@/types/document-workflow";

// Document access cache (use Redis in production)
const accessCache = new Map<string, {
  document: any;
  timestamp: number;
  accessCount: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

// GET /api/payroll/documents/[id] - Get specific document with optimization
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const startTime = Date.now();

  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Non autorisé",
          code: "UNAUTHORIZED",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const userId = session.user.sub || session.user.id || session.user.email;
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;

    // Query parameters for optimization
    const includePdf = searchParams.get("includePdf") === "true";
    const includeHistory = searchParams.get("includeHistory") === "true";
    const includeMetrics = searchParams.get("includeMetrics") === "true";
    const includeRelated = searchParams.get("includeRelated") === "true";
    const useCache = searchParams.get("cache") !== "false"; // Default to true
    const fields = searchParams.get("fields"); // Specific fields to return
    const format = searchParams.get("format") || "full"; // full, summary, minimal

    // Check cache first if enabled and PDF not requested
    const cacheKey = `doc_${id}_${includePdf}_${format}`;
    if (useCache && !includePdf) {
      const cached = accessCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        cached.accessCount++;

        return NextResponse.json({
          success: true,
          data: cached.document,
          meta: {
            cached: true,
            cacheAge: Date.now() - cached.timestamp,
            accessCount: cached.accessCount,
            processingTime: Date.now() - startTime
          }
        });
      }
    }

    // Build projection based on format and requirements
    let projection: any = {};

    switch (format) {
      case "minimal":
        projection = {
          documentId: 1,
          documentType: 1,
          status: 1,
          employeeName: 1,
          periodLabel: 1,
          createdAt: 1,
          updatedAt: 1
        };
        break;

      case "summary":
        projection = {
          pdfData: 0 // Exclude PDF data by default for summary
        };
        break;

      case "full":
      default:
        if (!includePdf) {
          projection.pdfData = 0;
        }
        break;
    }

    // Handle specific field selection
    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      projection = {};
      requestedFields.forEach(field => {
        projection[field] = 1;
      });

      // Always include essential fields
      projection._id = 1;
      projection.documentId = 1;
      projection.isDeleted = 1;
    }

    // Find document with optimized query
    let query = PayrollDocument.findOne({
      $or: [
        { _id: id },
        { documentId: id }
      ],
      isDeleted: false
    }, projection);

    // Add population based on format
    if (format !== "minimal") {
      query = query
        .populate('employeeId', 'firstName lastName employeeId email department team')
        .populate('generatedBy', 'name email')
        .populate('approvedBy', 'name email');
    }

    const document = await query.lean(); // Use lean() for better performance

    if (!document) {
      return NextResponse.json(
        {
          error: "Document introuvable",
          code: "DOCUMENT_NOT_FOUND",
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Initialize services if additional data requested
    let statusInfo = null;
    let metrics = null;
    let relatedDocuments = null;

    if (includeHistory || includeMetrics || includeRelated) {
      await documentStatusService.initialize();
      await documentStorageService.initialize();
    }

    // Get status information and history
    if (includeHistory) {
      try {
        const currentStatus = await documentStatusService.getCurrentStatus(document.documentId);
        const statusHistory = await documentStatusService.getStatusHistory(document.documentId, 10);

        statusInfo = {
          current: {
            status: currentStatus || document.status,
            displayText: getStatusDisplayText(currentStatus || document.status),
            color: getStatusColor(currentStatus || document.status)
          },
          validTransitions: getValidNextStatuses(currentStatus || document.status).map(status => ({
            status,
            displayText: getStatusDisplayText(status),
            color: getStatusColor(status)
          })),
          history: statusHistory.map(audit => ({
            fromStatus: audit.fromStatus,
            toStatus: audit.toStatus,
            fromDisplayText: getStatusDisplayText(audit.fromStatus),
            toDisplayText: getStatusDisplayText(audit.toStatus),
            changedBy: audit.changedBy,
            changedAt: audit.changedAt,
            reason: audit.reason,
            processingTime: audit.processingTime
          }))
        };
      } catch (error) {
        console.warn("Failed to get status information:", error);
      }
    }

    // Get performance metrics
    if (includeMetrics) {
      try {
        const storageMetrics = await documentStorageService.getStorageMetrics();

        metrics = {
          document: {
            fileSize: document.pdfData?.size || 0,
            version: document.version || 1,
            generationTime: calculateGenerationTime(document),
            accessCount: getDocumentAccessCount(document.documentId)
          },
          storage: {
            totalFiles: storageMetrics.totalFiles,
            averageFileSize: storageMetrics.avgFileSize,
            storageUtilization: storageMetrics.storageUtilization
          }
        };
      } catch (error) {
        console.warn("Failed to get metrics:", error);
      }
    }

    // Get related documents
    if (includeRelated) {
      try {
        relatedDocuments = await PayrollDocument.find({
          employeeId: document.employeeId,
          documentType: document.documentType,
          periodYear: document.periodYear,
          _id: { $ne: document._id },
          isDeleted: false
        }, {
          documentId: 1,
          status: 1,
          periodLabel: 1,
          version: 1,
          createdAt: 1
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

        relatedDocuments = relatedDocuments.map(doc => ({
          ...doc,
          statusDisplayText: getStatusDisplayText(doc.status),
          statusColor: getStatusColor(doc.status)
        }));
      } catch (error) {
        console.warn("Failed to get related documents:", error);
      }
    }

    // Build response data
    const responseData: any = {
      document: {
        ...document,
        statusDisplayText: getStatusDisplayText(document.status),
        statusColor: getStatusColor(document.status),
        fileSizeFormatted: document.pdfData?.size ? formatFileSize(document.pdfData.size) : null
      }
    };

    if (statusInfo) responseData.statusInfo = statusInfo;
    if (metrics) responseData.metrics = metrics;
    if (relatedDocuments) responseData.relatedDocuments = relatedDocuments;

    // Update cache if applicable
    if (useCache && !includePdf && format !== "minimal") {
      // Clean cache if it's getting too large
      if (accessCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = Array.from(accessCache.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        accessCache.delete(oldestKey);
      }

      accessCache.set(cacheKey, {
        document: responseData,
        timestamp: Date.now(),
        accessCount: 1
      });
    }

    // Log document access for analytics
    logDocumentAccess(document.documentId, userId, {
      includePdf,
      format,
      cached: false,
      userAgent: req.headers.get('user-agent'),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.ip
    });

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        cached: false,
        format,
        includesPdf: includePdf,
        includesHistory: includeHistory,
        includesMetrics: includeMetrics,
        includesRelated: includeRelated,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du document:", error);

    // Log error details
    const errorDetails = {
      documentId: id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      endpoint: `/api/payroll/documents/${id}`,
      method: "GET"
    };

    console.error("Document retrieval error details:", errorDetails);

    // Handle specific error types
    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          error: "ID de document invalide",
          code: "INVALID_DOCUMENT_ID",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Erreur serveur lors de la récupération du document",
        code: "INTERNAL_SERVER_ERROR",
        requestId: `doc_get_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

// PUT /api/payroll/documents/[id] - Update document metadata
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Fields that can be updated
    const allowedUpdates = [
      'title',
      'description',
      'status',
      'tags',
      'category',
      'approvedBy',
      'approvedAt',
      'sentAt',
      'sentTo'
    ];

    const updateData: any = {};
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle approval
    if (body.status === 'approved' && !updateData.approvedBy) {
      updateData.approvedBy = session.user.sub;
      updateData.approvedAt = new Date();
    }

    // Handle sending
    if (body.status === 'sent' && !updateData.sentAt) {
      updateData.sentAt = new Date();
    }

    const updatedDocument = await PayrollDocument.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId', 'firstName lastName employeeId')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!updatedDocument) {
      return NextResponse.json(
        { error: "Document introuvable" },
        { status: 404 }
      );
    }

    // Remove PDF data from response
    const responseDocument = updatedDocument.toObject();
    delete responseDocument.pdfData;

    return NextResponse.json({
      success: true,
      message: "Document mis à jour avec succès",
      data: { document: responseDocument }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du document:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// DELETE /api/payroll/documents/[id] - Soft delete document
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDB();

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const document = await PayrollDocument.findOne({
      _id: id,
      isDeleted: false
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document introuvable" },
        { status: 404 }
      );
    }

    // Soft delete
    await document.softDelete();

    return NextResponse.json({
      success: true,
      message: "Document supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// Helper functions for document optimization

function calculateGenerationTime(document: any): number {
  if (document.createdAt && document.updatedAt) {
    return document.updatedAt.getTime() - document.createdAt.getTime();
  }
  return 0;
}

function getDocumentAccessCount(documentId: string): number {
  // This would be stored in a proper analytics database in production
  // For now, return a mock value
  return Math.floor(Math.random() * 100) + 1;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function logDocumentAccess(documentId: string, userId: string, metadata: any): void {
  // This would log to a proper analytics system in production
  console.log(`Document access: ${documentId} by ${userId}`, {
    timestamp: new Date().toISOString(),
    ...metadata
  });
}
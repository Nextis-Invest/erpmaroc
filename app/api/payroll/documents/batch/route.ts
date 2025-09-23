import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";
import Employee from "@/model/hr/employee";
import { documentStorageService } from "@/services/DocumentStorageService";
import { documentStatusService } from "@/services/DocumentStatusService";
import {
  DocumentStatus,
  DocumentType,
  BatchDocumentOperation,
  ProcessingPriority,
  DocumentErrorCode
} from "@/types/document-workflow";

// Batch operation configuration
const BATCH_CONFIG = {
  maxDocuments: 100, // Maximum documents per batch operation
  maxConcurrent: 10, // Maximum concurrent operations
  timeout: 600000, // 10 minutes
  chunkSize: 25 // Process in chunks
};

// In-memory batch operation tracking (use Redis in production)
const batchOperations = new Map<string, BatchDocumentOperation>();

// POST /api/payroll/documents/batch - Initiate batch operation
export const POST = async (req: NextRequest) => {
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
    const body = await req.json();

    const {
      operationType,
      criteria,
      parameters = {},
      priority = ProcessingPriority.NORMAL,
      async = true
    } = body;

    // Validate operation type
    const validOperations = ['GENERATE', 'APPROVE', 'SEND', 'ARCHIVE', 'DELETE', 'EXPORT'];
    if (!operationType || !validOperations.includes(operationType)) {
      return NextResponse.json(
        {
          error: "Type d'opération invalide",
          code: "INVALID_OPERATION_TYPE",
          details: {
            received: operationType,
            allowed: validOperations
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate criteria
    if (!criteria || typeof criteria !== 'object') {
      return NextResponse.json(
        {
          error: "Critères de sélection requis",
          code: "MISSING_CRITERIA",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Initialize services
    await documentStorageService.initialize();
    await documentStatusService.initialize();

    // Build document selection query
    const selectionQuery = await buildSelectionQuery(criteria);

    // Get matching documents
    const matchingDocuments = await PayrollDocument.find(selectionQuery)
      .populate('employeeId', 'firstName lastName employeeId')
      .select('documentId documentType status employeeName periodLabel createdAt')
      .lean();

    if (matchingDocuments.length === 0) {
      return NextResponse.json(
        {
          error: "Aucun document correspondant aux critères",
          code: "NO_MATCHING_DOCUMENTS",
          details: { criteria },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    if (matchingDocuments.length > BATCH_CONFIG.maxDocuments) {
      return NextResponse.json(
        {
          error: "Trop de documents sélectionnés",
          code: "TOO_MANY_DOCUMENTS",
          details: {
            selected: matchingDocuments.length,
            maximum: BATCH_CONFIG.maxDocuments
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate operation permissions
    const permissionCheck = await validateOperationPermissions(
      operationType,
      matchingDocuments,
      userId
    );

    if (!permissionCheck.valid) {
      return NextResponse.json(
        {
          error: "Permissions insuffisantes",
          code: "INSUFFICIENT_PERMISSIONS",
          details: permissionCheck.errors,
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      );
    }

    // Create batch operation
    const operationId = `batch_${operationType.toLowerCase()}_${Date.now()}`;
    const batchOperation: BatchDocumentOperation = {
      operationId,
      operationType: operationType as any,
      criteria,
      parameters,
      status: 'QUEUED',
      totalDocuments: matchingDocuments.length,
      processedDocuments: 0,
      successfulDocuments: 0,
      failedDocuments: 0,
      createdAt: new Date(),
      initiatedBy: userId,
      errors: [],
      results: []
    };

    // Store batch operation
    batchOperations.set(operationId, batchOperation);

    // If async mode, process in background
    if (async) {
      // Start processing asynchronously
      processBatchOperation(operationId, matchingDocuments, parameters, userId)
        .catch(error => {
          console.error(`Batch operation ${operationId} failed:`, error);
          const operation = batchOperations.get(operationId);
          if (operation) {
            operation.status = 'FAILED';
            operation.errors.push({
              documentId: 'SYSTEM',
              errorMessage: error.message,
              errorCode: 'BATCH_PROCESSING_FAILED',
              retryable: false
            });
          }
        });

      return NextResponse.json({
        success: true,
        message: "Opération en lot initiée",
        data: {
          operationId,
          status: 'QUEUED',
          totalDocuments: matchingDocuments.length,
          estimatedDuration: estimateBatchDuration(operationType, matchingDocuments.length)
        },
        meta: {
          async: true,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Process synchronously (for smaller batches)
    const result = await processBatchOperation(operationId, matchingDocuments, parameters, userId);

    return NextResponse.json({
      success: true,
      message: "Opération en lot terminée",
      data: result,
      meta: {
        async: false,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'opération en lot:", error);

    // Log error details
    const errorDetails = {
      operationType: body?.operationType,
      criteria: body?.criteria,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      endpoint: "/api/payroll/documents/batch",
      method: "POST"
    };

    console.error("Batch operation error details:", errorDetails);

    return NextResponse.json(
      {
        error: "Erreur serveur lors de l'opération en lot",
        code: "BATCH_OPERATION_FAILED",
        requestId: `batch_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

// GET /api/payroll/documents/batch - Get batch operation status
export const GET = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const operationId = searchParams.get("operationId");
    const includeResults = searchParams.get("includeResults") === "true";

    if (operationId) {
      // Get specific operation
      const operation = batchOperations.get(operationId);
      if (!operation) {
        return NextResponse.json(
          { error: "Opération en lot introuvable" },
          { status: 404 }
        );
      }

      const response: any = {
        operationId,
        operationType: operation.operationType,
        status: operation.status,
        progress: {
          total: operation.totalDocuments,
          processed: operation.processedDocuments,
          successful: operation.successfulDocuments,
          failed: operation.failedDocuments,
          percentage: operation.totalDocuments > 0
            ? Math.round((operation.processedDocuments / operation.totalDocuments) * 100)
            : 0
        },
        timing: {
          createdAt: operation.createdAt,
          startedAt: operation.startedAt,
          completedAt: operation.completedAt,
          duration: operation.completedAt && operation.startedAt
            ? operation.completedAt.getTime() - operation.startedAt.getTime()
            : null
        },
        initiatedBy: operation.initiatedBy
      };

      if (operation.errors.length > 0) {
        response.errors = operation.errors;
      }

      if (includeResults && operation.results) {
        response.results = operation.results;
      }

      return NextResponse.json({
        success: true,
        data: response
      });
    }

    // Get all operations for user
    const userOperations = Array.from(batchOperations.values())
      .filter(op => op.initiatedBy === (session.user.sub || session.user.id || session.user.email))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20) // Limit to 20 most recent
      .map(op => ({
        operationId: op.operationId,
        operationType: op.operationType,
        status: op.status,
        totalDocuments: op.totalDocuments,
        processedDocuments: op.processedDocuments,
        successfulDocuments: op.successfulDocuments,
        failedDocuments: op.failedDocuments,
        createdAt: op.createdAt,
        completedAt: op.completedAt
      }));

    return NextResponse.json({
      success: true,
      data: {
        operations: userOperations,
        summary: {
          total: userOperations.length,
          active: userOperations.filter(op => ['QUEUED', 'PROCESSING'].includes(op.status)).length,
          completed: userOperations.filter(op => op.status === 'COMPLETED').length,
          failed: userOperations.filter(op => op.status === 'FAILED').length
        }
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du statut d'opération en lot:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// DELETE /api/payroll/documents/batch - Cancel batch operation
export const DELETE = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const operationId = searchParams.get("operationId");

    if (!operationId) {
      return NextResponse.json(
        { error: "ID d'opération requis" },
        { status: 400 }
      );
    }

    const operation = batchOperations.get(operationId);
    if (!operation) {
      return NextResponse.json(
        { error: "Opération en lot introuvable" },
        { status: 404 }
      );
    }

    // Check permissions
    const userId = session.user.sub || session.user.id || session.user.email;
    if (operation.initiatedBy !== userId) {
      return NextResponse.json(
        { error: "Non autorisé à annuler cette opération" },
        { status: 403 }
      );
    }

    // Can only cancel queued operations
    if (operation.status !== 'QUEUED') {
      return NextResponse.json(
        { error: "Impossible d'annuler une opération en cours ou terminée" },
        { status: 400 }
      );
    }

    // Cancel operation
    operation.status = 'CANCELLED';
    operation.completedAt = new Date();

    return NextResponse.json({
      success: true,
      message: "Opération en lot annulée"
    });

  } catch (error) {
    console.error("Erreur lors de l'annulation de l'opération en lot:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
};

// Helper functions

async function buildSelectionQuery(criteria: any): Promise<any> {
  const query: any = { isDeleted: false };

  // Employee IDs
  if (criteria.employeeIds && Array.isArray(criteria.employeeIds)) {
    query.employeeId = { $in: criteria.employeeIds };
  }

  // Document types
  if (criteria.documentTypes && Array.isArray(criteria.documentTypes)) {
    query.documentType = { $in: criteria.documentTypes };
  }

  // Statuses
  if (criteria.statuses && Array.isArray(criteria.statuses)) {
    query.status = { $in: criteria.statuses };
  }

  // Period filters
  if (criteria.periodIds && Array.isArray(criteria.periodIds)) {
    // This would need to be adapted based on how periods are structured
    const periodConditions = criteria.periodIds.map((periodId: string) => {
      const [year, month] = periodId.split('-').map(Number);
      return { periodYear: year, ...(month && { periodMonth: month }) };
    });
    query.$or = periodConditions;
  }

  // Date range
  if (criteria.dateRange) {
    const dateFilter: any = {};
    if (criteria.dateRange.from) {
      dateFilter.$gte = new Date(criteria.dateRange.from);
    }
    if (criteria.dateRange.to) {
      dateFilter.$lte = new Date(criteria.dateRange.to);
    }
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }
  }

  // Branch filter
  if (criteria.branchId) {
    query.branch = criteria.branchId;
  }

  // Tags filter
  if (criteria.tags && Array.isArray(criteria.tags)) {
    query.tags = { $in: criteria.tags };
  }

  return query;
}

async function validateOperationPermissions(
  operationType: string,
  documents: any[],
  userId: string
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Check operation-specific permissions
  switch (operationType) {
    case 'APPROVE':
      // Check if user has approval rights
      const pendingApproval = documents.filter(doc =>
        doc.status === DocumentStatus.PENDING_APPROVAL
      );
      if (pendingApproval.length > 0) {
        // This would check against user roles/permissions
        // For now, assume all users can approve
      }
      break;

    case 'DELETE':
      // Check if any documents are in a non-deletable state
      const nonDeletable = documents.filter(doc =>
        [DocumentStatus.SENT, DocumentStatus.ARCHIVED].includes(doc.status)
      );
      if (nonDeletable.length > 0) {
        errors.push(`${nonDeletable.length} documents cannot be deleted due to their status`);
      }
      break;

    case 'SEND':
      // Check if documents are approved
      const notApproved = documents.filter(doc =>
        doc.status !== DocumentStatus.APPROVED
      );
      if (notApproved.length > 0) {
        errors.push(`${notApproved.length} documents are not approved for sending`);
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function processBatchOperation(
  operationId: string,
  documents: any[],
  parameters: any,
  userId: string
): Promise<any> {
  const operation = batchOperations.get(operationId);
  if (!operation) {
    throw new Error('Batch operation not found');
  }

  operation.status = 'PROCESSING';
  operation.startedAt = new Date();

  const chunks = chunkArray(documents, BATCH_CONFIG.chunkSize);
  const results: any[] = [];

  try {
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (document) => {
        try {
          const result = await processDocument(operation.operationType, document, parameters, userId);
          operation.successfulDocuments++;
          operation.processedDocuments++;

          results.push({
            documentId: document.documentId,
            status: 'SUCCESS',
            resultData: result
          });

          return result;
        } catch (error) {
          operation.failedDocuments++;
          operation.processedDocuments++;

          const errorInfo = {
            documentId: document.documentId,
            errorMessage: error.message,
            errorCode: 'DOCUMENT_PROCESSING_FAILED',
            retryable: isRetryableError(error)
          };

          operation.errors.push(errorInfo);
          results.push({
            documentId: document.documentId,
            status: 'FAILED',
            errorMessage: error.message
          });

          return null;
        }
      });

      await Promise.allSettled(chunkPromises);
    }

    operation.status = 'COMPLETED';
    operation.completedAt = new Date();
    operation.results = results;

    return {
      operationId,
      status: operation.status,
      summary: {
        total: operation.totalDocuments,
        successful: operation.successfulDocuments,
        failed: operation.failedDocuments,
        processingTime: operation.completedAt.getTime() - operation.startedAt!.getTime()
      },
      results
    };

  } catch (error) {
    operation.status = 'FAILED';
    operation.completedAt = new Date();
    throw error;
  }
}

async function processDocument(
  operationType: string,
  document: any,
  parameters: any,
  userId: string
): Promise<any> {
  switch (operationType) {
    case 'APPROVE':
      return await approveDocument(document, userId, parameters);

    case 'SEND':
      return await sendDocument(document, userId, parameters);

    case 'ARCHIVE':
      return await archiveDocument(document, userId, parameters);

    case 'DELETE':
      return await deleteDocument(document, userId, parameters);

    case 'EXPORT':
      return await exportDocument(document, parameters);

    default:
      throw new Error(`Unsupported operation type: ${operationType}`);
  }
}

async function approveDocument(document: any, userId: string, parameters: any): Promise<any> {
  const result = await documentStatusService.transitionStatus(
    document.documentId,
    DocumentStatus.APPROVED,
    {
      userId,
      reason: parameters.reason || 'Batch approval',
      comments: parameters.comments,
      metadata: { batchOperation: true }
    }
  );

  if (!result.success) {
    throw new Error(result.error?.message || 'Approval failed');
  }

  return { approved: true, auditId: result.auditId };
}

async function sendDocument(document: any, userId: string, parameters: any): Promise<any> {
  const result = await documentStatusService.transitionStatus(
    document.documentId,
    DocumentStatus.SENT,
    {
      userId,
      reason: parameters.reason || 'Batch sending',
      metadata: {
        batchOperation: true,
        recipients: parameters.recipients || []
      }
    }
  );

  if (!result.success) {
    throw new Error(result.error?.message || 'Sending failed');
  }

  return { sent: true, auditId: result.auditId };
}

async function archiveDocument(document: any, userId: string, parameters: any): Promise<any> {
  const result = await documentStatusService.transitionStatus(
    document.documentId,
    DocumentStatus.ARCHIVED,
    {
      userId,
      reason: parameters.reason || 'Batch archiving',
      metadata: { batchOperation: true }
    }
  );

  if (!result.success) {
    throw new Error(result.error?.message || 'Archiving failed');
  }

  return { archived: true, auditId: result.auditId };
}

async function deleteDocument(document: any, userId: string, parameters: any): Promise<any> {
  const doc = await PayrollDocument.findOne({ documentId: document.documentId });
  if (!doc) {
    throw new Error('Document not found');
  }

  await doc.softDelete();
  return { deleted: true };
}

async function exportDocument(document: any, parameters: any): Promise<any> {
  // This would implement document export functionality
  // For now, return basic export info
  return {
    exported: true,
    format: parameters.format || 'pdf',
    size: document.pdfData?.size || 0
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function isRetryableError(error: any): boolean {
  const retryableErrors = ['TIMEOUT', 'CONNECTION_FAILED', 'TEMPORARY_FAILURE'];
  return retryableErrors.some(errorType =>
    error.message && error.message.includes(errorType)
  );
}

function estimateBatchDuration(operationType: string, documentCount: number): number {
  // Estimate processing time in seconds
  const timePerDocument = {
    'APPROVE': 2,
    'SEND': 5,
    'ARCHIVE': 1,
    'DELETE': 1,
    'EXPORT': 3,
    'GENERATE': 10
  };

  const baseTime = timePerDocument[operationType] || 3;
  return Math.ceil((documentCount * baseTime) / BATCH_CONFIG.maxConcurrent);
}
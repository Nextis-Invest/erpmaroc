import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/database/connectToDB";
import PayrollDocument from "@/models/PayrollDocument";
import { documentStatusService } from "@/services/DocumentStatusService";
import {
  DocumentStatus,
  StatusTransitionTrigger,
  getValidNextStatuses,
  getStatusDisplayText,
  getStatusColor,
  isValidStatusTransition
} from "@/types/document-workflow";

// GET /api/payroll/documents/[id]/status - Get document status and history
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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

    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const includeHistory = searchParams.get("includeHistory") === "true";
    const historyLimit = parseInt(searchParams.get("historyLimit") || "20");

    // Initialize status service
    await documentStatusService.initialize();

    // Find document
    const document = await PayrollDocument.findOne({
      $or: [
        { _id: id },
        { documentId: id }
      ],
      isDeleted: false
    }).populate('employeeId', 'firstName lastName employeeId')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email');

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

    // Get current status from status service
    const currentStatus = await documentStatusService.getCurrentStatus(document.documentId);

    // Get valid next statuses
    const validNextStatuses = getValidNextStatuses(currentStatus || document.status);

    // Prepare status information
    const statusInfo = {
      current: {
        status: currentStatus || document.status,
        displayText: getStatusDisplayText(currentStatus || document.status),
        color: getStatusColor(currentStatus || document.status),
        timestamp: document.updatedAt
      },
      validTransitions: validNextStatuses.map(status => ({
        status,
        displayText: getStatusDisplayText(status),
        color: getStatusColor(status),
        isValid: isValidStatusTransition(currentStatus || document.status, status)
      })),
      document: {
        id: document._id,
        documentId: document.documentId,
        documentType: document.documentType,
        employeeName: document.employeeName,
        periodLabel: document.periodLabel,
        version: document.version,
        isLatestVersion: document.isLatestVersion
      }
    };

    // Include status history if requested
    if (includeHistory) {
      const statusHistory = await documentStatusService.getStatusHistory(
        document.documentId,
        historyLimit
      );

      statusInfo['history'] = statusHistory.map(audit => ({
        id: audit._id,
        fromStatus: audit.fromStatus,
        toStatus: audit.toStatus,
        fromDisplayText: getStatusDisplayText(audit.fromStatus),
        toDisplayText: getStatusDisplayText(audit.toStatus),
        trigger: audit.trigger,
        changedBy: audit.changedBy,
        changedAt: audit.changedAt,
        reason: audit.reason,
        comments: audit.comments,
        processingTime: audit.processingTime,
        businessImpact: audit.businessImpact,
        errorDetails: audit.errorDetails
      }));
    }

    return NextResponse.json({
      success: true,
      data: statusInfo,
      meta: {
        includeHistory,
        historyLimit,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du statut:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la récupération du statut",
        code: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

// PUT /api/payroll/documents/[id]/status - Transition document status
export const PUT = async (
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
    const body = await req.json();

    const {
      targetStatus,
      reason,
      comments,
      approvalInfo,
      businessImpact,
      forceTransition = false
    } = body;

    // Validate required fields
    if (!targetStatus) {
      return NextResponse.json(
        {
          error: "Statut cible requis",
          code: "MISSING_TARGET_STATUS",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate target status
    if (!Object.values(DocumentStatus).includes(targetStatus)) {
      return NextResponse.json(
        {
          error: "Statut cible invalide",
          code: "INVALID_TARGET_STATUS",
          details: {
            received: targetStatus,
            allowed: Object.values(DocumentStatus)
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Find document
    const document = await PayrollDocument.findOne({
      $or: [
        { _id: id },
        { documentId: id }
      ],
      isDeleted: false
    }).populate('employeeId', 'firstName lastName employeeId');

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

    // Initialize status service
    await documentStatusService.initialize();

    // Get current status
    const currentStatus = await documentStatusService.getCurrentStatus(document.documentId);
    if (!currentStatus) {
      return NextResponse.json(
        {
          error: "Impossible de déterminer le statut actuel",
          code: "CURRENT_STATUS_UNKNOWN",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Check if transition is valid (unless forced)
    if (!forceTransition && !isValidStatusTransition(currentStatus, targetStatus)) {
      const validStatuses = getValidNextStatuses(currentStatus);
      return NextResponse.json(
        {
          error: "Transition de statut invalide",
          code: "INVALID_STATUS_TRANSITION",
          details: {
            currentStatus,
            targetStatus,
            validNextStatuses: validStatuses.map(status => ({
              status,
              displayText: getStatusDisplayText(status)
            }))
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Prepare transition context
    const transitionContext = {
      userId,
      reason,
      comments,
      userAgent: req.headers.get('user-agent') || undefined,
      ipAddress: req.headers.get('x-forwarded-for') ||
                 req.headers.get('x-real-ip') ||
                 req.ip ||
                 'unknown',
      sessionId: session.user.sessionId || undefined,
      requestId: `status_transition_${Date.now()}`,
      metadata: {
        forceTransition,
        approvalInfo,
        documentType: document.documentType,
        employeeId: document.employeeId,
        periodYear: document.periodYear,
        periodMonth: document.periodMonth
      },
      businessImpact
    };

    // Perform status transition
    const transitionResult = await documentStatusService.transitionStatus(
      document.documentId,
      targetStatus,
      transitionContext
    );

    if (!transitionResult.success) {
      return NextResponse.json(
        {
          error: "Échec de la transition de statut",
          code: transitionResult.error?.code || "TRANSITION_FAILED",
          details: {
            currentStatus,
            targetStatus,
            errorMessage: transitionResult.error?.message,
            errorDetails: transitionResult.error?.details
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Update document in database with additional status-specific fields
    const updateData: any = {
      status: targetStatus,
      updatedAt: new Date()
    };

    // Add status-specific updates
    switch (targetStatus) {
      case DocumentStatus.APPROVED:
        updateData.approvedBy = approvalInfo?.approvedBy || userId;
        updateData.approvedAt = new Date();
        break;

      case DocumentStatus.SENT:
        updateData.sentAt = new Date();
        if (approvalInfo?.sentTo) {
          updateData.sentTo = Array.isArray(approvalInfo.sentTo)
            ? approvalInfo.sentTo
            : [approvalInfo.sentTo];
        }
        break;

      case DocumentStatus.ARCHIVED:
        updateData.archivedBy = userId;
        updateData.archivedAt = new Date();
        break;
    }

    const updatedDocument = await PayrollDocument.findOneAndUpdate(
      { documentId: document.documentId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('employeeId', 'firstName lastName employeeId')
      .populate('generatedBy', 'name email')
      .populate('approvedBy', 'name email');

    // Log successful transition
    console.log(`Status transition successful: ${document.documentId} ${currentStatus} → ${targetStatus}`);

    // Prepare response
    const responseData = {
      documentId: document.documentId,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      transitionInfo: {
        trigger: StatusTransitionTrigger.USER_ACTION,
        changedBy: userId,
        changedAt: new Date(),
        reason,
        comments,
        auditId: transitionResult.auditId,
        processingTime: transitionResult.processingTime,
        sideEffectsExecuted: transitionResult.sideEffectsExecuted
      },
      document: {
        id: updatedDocument._id,
        documentId: updatedDocument.documentId,
        status: updatedDocument.status,
        displayText: getStatusDisplayText(updatedDocument.status),
        color: getStatusColor(updatedDocument.status),
        updatedAt: updatedDocument.updatedAt,
        version: updatedDocument.version
      },
      validNextStatuses: getValidNextStatuses(targetStatus).map(status => ({
        status,
        displayText: getStatusDisplayText(status),
        color: getStatusColor(status)
      }))
    };

    // Add warnings if any
    if (transitionResult.validationWarnings && transitionResult.validationWarnings.length > 0) {
      responseData['warnings'] = transitionResult.validationWarnings;
    }

    return NextResponse.json({
      success: true,
      message: `Statut transitionné avec succès vers ${getStatusDisplayText(targetStatus)}`,
      data: responseData,
      meta: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erreur lors de la transition de statut:", error);

    // Log error details
    const errorDetails = {
      documentId: id,
      targetStatus: body?.targetStatus,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      endpoint: `/api/payroll/documents/${id}/status`,
      method: "PUT"
    };

    console.error("Status transition error details:", errorDetails);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return NextResponse.json(
        {
          error: "Erreur de validation",
          code: "VALIDATION_ERROR",
          details: validationErrors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: "Délai de transition dépassé",
          code: "TRANSITION_TIMEOUT",
          timestamp: new Date().toISOString()
        },
        { status: 408 }
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      return NextResponse.json(
        {
          error: "Autorisation insuffisante pour cette transition",
          code: "INSUFFICIENT_PERMISSIONS",
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la transition de statut",
        code: "INTERNAL_SERVER_ERROR",
        requestId: `status_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};

// POST /api/payroll/documents/[id]/status - Batch status transition (multiple documents)
export const POST = async (
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
    const body = await req.json();

    const {
      documentIds,
      targetStatus,
      reason,
      comments,
      businessImpact
    } = body;

    // Validate required fields
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        {
          error: "Liste des IDs de documents requise",
          code: "MISSING_DOCUMENT_IDS",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (!targetStatus) {
      return NextResponse.json(
        {
          error: "Statut cible requis",
          code: "MISSING_TARGET_STATUS",
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate target status
    if (!Object.values(DocumentStatus).includes(targetStatus)) {
      return NextResponse.json(
        {
          error: "Statut cible invalide",
          code: "INVALID_TARGET_STATUS",
          details: {
            received: targetStatus,
            allowed: Object.values(DocumentStatus)
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Initialize status service
    await documentStatusService.initialize();

    // Prepare transition context
    const transitionContext = {
      userId,
      reason,
      comments,
      userAgent: req.headers.get('user-agent') || undefined,
      ipAddress: req.headers.get('x-forwarded-for') ||
                 req.headers.get('x-real-ip') ||
                 req.ip ||
                 'unknown',
      sessionId: session.user.sessionId || undefined,
      requestId: `batch_status_transition_${Date.now()}`,
      metadata: {
        batchOperation: true,
        documentCount: documentIds.length
      },
      businessImpact
    };

    // Perform batch transition
    const batchResult = await documentStatusService.batchTransition(
      documentIds,
      targetStatus,
      transitionContext
    );

    // Update documents in database
    const updatedDocuments = [];
    const errors = [];

    for (const documentId of batchResult.successful) {
      try {
        const updateData: any = {
          status: targetStatus,
          updatedAt: new Date()
        };

        // Add status-specific updates
        switch (targetStatus) {
          case DocumentStatus.APPROVED:
            updateData.approvedBy = userId;
            updateData.approvedAt = new Date();
            break;

          case DocumentStatus.SENT:
            updateData.sentAt = new Date();
            break;

          case DocumentStatus.ARCHIVED:
            updateData.archivedBy = userId;
            updateData.archivedAt = new Date();
            break;
        }

        const updatedDoc = await PayrollDocument.findOneAndUpdate(
          { documentId, isDeleted: false },
          { $set: updateData },
          { new: true }
        ).select('documentId status updatedAt employeeName periodLabel');

        if (updatedDoc) {
          updatedDocuments.push({
            documentId,
            status: updatedDoc.status,
            displayText: getStatusDisplayText(updatedDoc.status),
            employeeName: updatedDoc.employeeName,
            periodLabel: updatedDoc.periodLabel,
            updatedAt: updatedDoc.updatedAt
          });
        }
      } catch (error) {
        errors.push({
          documentId,
          error: error.message
        });
      }
    }

    console.log(`Batch status transition completed: ${batchResult.successful.length}/${documentIds.length} successful`);

    return NextResponse.json({
      success: true,
      message: `Transition de statut en lot terminée: ${batchResult.successful.length}/${documentIds.length} réussies`,
      data: {
        targetStatus,
        displayText: getStatusDisplayText(targetStatus),
        summary: {
          total: batchResult.totalProcessed,
          successful: batchResult.successful.length,
          failed: batchResult.failed.length,
          processingTime: batchResult.processingTime
        },
        successfulDocuments: updatedDocuments,
        failedDocuments: batchResult.failed.map(failure => ({
          documentId: failure.documentId,
          error: failure.error.message,
          code: failure.error.code,
          retryable: failure.error.retryable
        })),
        databaseErrors: errors
      },
      meta: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Erreur lors de la transition de statut en lot:", error);

    return NextResponse.json(
      {
        error: "Erreur serveur lors de la transition de statut en lot",
        code: "BATCH_TRANSITION_ERROR",
        details: {
          error: error.message
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
};
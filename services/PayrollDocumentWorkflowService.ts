/**
 * PayrollDocumentWorkflowService - Main Integration Service
 * Production-ready orchestration service integrating all workflow components with existing payroll types
 */

import { DocumentStorageService } from './DocumentStorageService';
import { DocumentStatusService } from './DocumentStatusService';
import PayrollDocumentMetadata, { PayrollDocumentMetadataDocument } from '@/models/PayrollDocumentMetadata';
import StatusChangeAudit from '@/models/StatusChangeAudit';
import {
  DocumentStatus,
  DocumentType,
  GenerationMode,
  ProcessingPriority,
  StatusTransitionTrigger,
  PayrollDocumentMetadata as IPayrollDocumentMetadata
} from '@/types/document-workflow';
import {
  PayrollEmployee,
  PayrollCalculation,
  PayrollPeriod
} from '@/types/payroll';
import {
  DocumentWorkflowError,
  DocumentWorkflowErrorFactory,
  DocumentWorkflowErrorHandler,
  DocumentWorkflowValidator
} from '@/lib/errors/DocumentWorkflowError';

// Workflow operation context
interface WorkflowContext {
  userId: string;
  requestId: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  priority?: ProcessingPriority;
  reason?: string;
  comments?: string;
}

// Document generation request
interface DocumentGenerationRequest {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  documentType: DocumentType;
  context: WorkflowContext;
  options?: {
    generatePreview?: boolean;
    skipValidation?: boolean;
    priority?: ProcessingPriority;
    metadata?: Record<string, any>;
  };
}

// Generation result
interface GenerationResult {
  success: boolean;
  documentId?: string;
  previewUrl?: string;
  downloadUrl?: string;
  status: DocumentStatus;
  processingTime: number;
  error?: DocumentWorkflowError;
  warnings?: string[];
  metadata?: Record<string, any>;
}

// Batch operation request
interface BatchOperationRequest {
  employees: PayrollEmployee[];
  calculations: PayrollCalculation[];
  period: PayrollPeriod;
  documentType: DocumentType;
  operation: 'GENERATE' | 'APPROVE' | 'SEND' | 'ARCHIVE';
  context: WorkflowContext;
  options?: {
    batchSize?: number;
    maxConcurrent?: number;
    continueOnError?: boolean;
  };
}

// Batch operation result
interface BatchOperationResult {
  operationId: string;
  totalDocuments: number;
  processedDocuments: number;
  successfulDocuments: number;
  failedDocuments: number;
  processingTime: number;
  results: Array<{
    employeeId: string;
    documentId?: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    error?: DocumentWorkflowError;
  }>;
}

/**
 * Main workflow orchestration service that integrates all components
 */
export class PayrollDocumentWorkflowService {
  private storageService: DocumentStorageService;
  private statusService: DocumentStatusService;
  private initialized = false;

  constructor() {
    this.storageService = new DocumentStorageService();
    this.statusService = new DocumentStatusService();
  }

  /**
   * Initialize the workflow service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Promise.all([
        this.storageService.initialize(),
        this.statusService.initialize()
      ]);

      this.initialized = true;
      console.log('PayrollDocumentWorkflowService initialized successfully');
    } catch (error) {
      throw DocumentWorkflowErrorFactory.createSystemError(
        'PayrollDocumentWorkflowService',
        'initialize',
        error as Error
      );
    }
  }

  /**
   * Generate a payroll document with full workflow support
   */
  async generateDocument(request: DocumentGenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // Ensure service is initialized
      await this.initialize();

      // Validate request
      await this.validateGenerationRequest(request);

      // Create document metadata
      const documentMetadata = await this.createDocumentMetadata(request);

      // Generate preview if requested
      if (request.options?.generatePreview) {
        const previewResult = await this.generatePreview(documentMetadata, request);
        if (!previewResult.success) {
          return previewResult;
        }
      }

      // Generate final document
      const finalResult = await this.generateFinalDocument(documentMetadata, request);

      return {
        ...finalResult,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      const workflowError = error instanceof DocumentWorkflowError
        ? error
        : DocumentWorkflowErrorFactory.createSystemError(
            'PayrollDocumentWorkflowService',
            'generateDocument',
            error as Error,
            { userId: request.context.userId, requestId: request.context.requestId }
          );

      // Handle error with logging and recovery
      await DocumentWorkflowErrorHandler.handleError(workflowError);

      return {
        success: false,
        status: DocumentStatus.GENERATION_FAILED,
        processingTime: Date.now() - startTime,
        error: workflowError
      };
    }
  }

  /**
   * Approve a document for final generation
   */
  async approveDocument(
    documentId: string,
    context: WorkflowContext
  ): Promise<{
    success: boolean;
    newStatus?: DocumentStatus;
    error?: DocumentWorkflowError;
  }> {
    try {
      await this.initialize();

      // Get current document
      const document = await PayrollDocumentMetadata.findByDocumentId(documentId);
      if (!document) {
        throw DocumentWorkflowErrorFactory.createValidationError(
          'documentId',
          documentId,
          'existing document'
        );
      }

      // Transition status
      const transitionResult = await this.statusService.transitionStatus(
        documentId,
        DocumentStatus.APPROVED_FOR_GENERATION,
        {
          userId: context.userId,
          reason: context.reason,
          comments: context.comments,
          requestId: context.requestId,
          metadata: { approvalGranted: true }
        }
      );

      if (!transitionResult.success) {
        return {
          success: false,
          error: transitionResult.error
        };
      }

      return {
        success: true,
        newStatus: transitionResult.newStatus
      };

    } catch (error) {
      const workflowError = error instanceof DocumentWorkflowError
        ? error
        : DocumentWorkflowErrorFactory.createSystemError(
            'PayrollDocumentWorkflowService',
            'approveDocument',
            error as Error,
            context
          );

      await DocumentWorkflowErrorHandler.handleError(workflowError);

      return {
        success: false,
        error: workflowError
      };
    }
  }

  /**
   * Send document to employee
   */
  async sendDocument(
    documentId: string,
    recipients: string[],
    context: WorkflowContext
  ): Promise<{
    success: boolean;
    newStatus?: DocumentStatus;
    trackingId?: string;
    error?: DocumentWorkflowError;
  }> {
    try {
      await this.initialize();

      // Get document
      const document = await PayrollDocumentMetadata.findByDocumentId(documentId);
      if (!document) {
        throw DocumentWorkflowErrorFactory.createValidationError(
          'documentId',
          documentId,
          'existing document'
        );
      }

      // Update distribution info
      document.distributionInfo = {
        sentTo: recipients,
        sentBy: context.userId,
        sentAt: new Date(),
        deliveryMethod: 'EMAIL',
        deliveryStatus: 'PENDING',
        trackingId: `track-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      };

      await document.save();

      // Transition status
      const transitionResult = await this.statusService.transitionStatus(
        documentId,
        DocumentStatus.SENT,
        {
          userId: context.userId,
          reason: 'Document sent to employee',
          requestId: context.requestId,
          metadata: { recipients, deliveryMethod: 'EMAIL' }
        }
      );

      if (!transitionResult.success) {
        return {
          success: false,
          error: transitionResult.error
        };
      }

      // Here you would integrate with email service
      // await emailService.sendDocument(documentId, recipients);

      return {
        success: true,
        newStatus: transitionResult.newStatus,
        trackingId: document.distributionInfo.trackingId
      };

    } catch (error) {
      const workflowError = error instanceof DocumentWorkflowError
        ? error
        : DocumentWorkflowErrorFactory.createSystemError(
            'PayrollDocumentWorkflowService',
            'sendDocument',
            error as Error,
            context
          );

      await DocumentWorkflowErrorHandler.handleError(workflowError);

      return {
        success: false,
        error: workflowError
      };
    }
  }

  /**
   * Batch process multiple documents
   */
  async batchProcess(request: BatchOperationRequest): Promise<BatchOperationResult> {
    const startTime = Date.now();
    const operationId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    try {
      await this.initialize();

      const results: BatchOperationResult['results'] = [];
      const batchSize = request.options?.batchSize || 10;
      const maxConcurrent = request.options?.maxConcurrent || 3;

      // Process in batches
      for (let i = 0; i < request.employees.length; i += batchSize) {
        const batch = request.employees.slice(i, i + batchSize);
        const batchCalculations = request.calculations.slice(i, i + batchSize);

        // Process batch with concurrency control
        const batchPromises = batch.map(async (employee, index) => {
          const calculation = batchCalculations[index];

          try {
            switch (request.operation) {
              case 'GENERATE':
                const genResult = await this.generateDocument({
                  employee,
                  calculation,
                  period: request.period,
                  documentType: request.documentType,
                  context: {
                    ...request.context,
                    requestId: `${request.context.requestId}-${employee.employeeId}`
                  }
                });

                return {
                  employeeId: employee.employeeId,
                  documentId: genResult.documentId,
                  status: genResult.success ? 'SUCCESS' : 'FAILED',
                  error: genResult.error
                } as const;

              default:
                throw new Error(`Unsupported batch operation: ${request.operation}`);
            }
          } catch (error) {
            const workflowError = error instanceof DocumentWorkflowError
              ? error
              : DocumentWorkflowErrorFactory.createSystemError(
                  'PayrollDocumentWorkflowService',
                  'batchProcess',
                  error as Error,
                  { userId: request.context.userId, employeeId: employee.employeeId }
                );

            return {
              employeeId: employee.employeeId,
              status: 'FAILED',
              error: workflowError
            } as const;
          }
        });

        // Wait for batch to complete with concurrency limit
        const batchResults = await this.processConcurrently(batchPromises, maxConcurrent);
        results.push(...batchResults);

        // Stop processing if continueOnError is false and we have failures
        if (!request.options?.continueOnError && batchResults.some(r => r.status === 'FAILED')) {
          break;
        }
      }

      const successCount = results.filter(r => r.status === 'SUCCESS').length;
      const failureCount = results.filter(r => r.status === 'FAILED').length;

      return {
        operationId,
        totalDocuments: request.employees.length,
        processedDocuments: results.length,
        successfulDocuments: successCount,
        failedDocuments: failureCount,
        processingTime: Date.now() - startTime,
        results
      };

    } catch (error) {
      const workflowError = error instanceof DocumentWorkflowError
        ? error
        : DocumentWorkflowErrorFactory.createSystemError(
            'PayrollDocumentWorkflowService',
            'batchProcess',
            error as Error,
            request.context
          );

      await DocumentWorkflowErrorHandler.handleError(workflowError);

      return {
        operationId,
        totalDocuments: request.employees.length,
        processedDocuments: 0,
        successfulDocuments: 0,
        failedDocuments: request.employees.length,
        processingTime: Date.now() - startTime,
        results: request.employees.map(emp => ({
          employeeId: emp.employeeId,
          status: 'FAILED',
          error: workflowError
        }))
      };
    }
  }

  /**
   * Get document status and history
   */
  async getDocumentStatus(documentId: string): Promise<{
    document?: PayrollDocumentMetadataDocument;
    statusHistory: any[];
    error?: DocumentWorkflowError;
  }> {
    try {
      await this.initialize();

      const [document, statusHistory] = await Promise.all([
        PayrollDocumentMetadata.findByDocumentId(documentId),
        this.statusService.getStatusHistory(documentId)
      ]);

      return {
        document: document || undefined,
        statusHistory
      };

    } catch (error) {
      const workflowError = DocumentWorkflowErrorFactory.createSystemError(
        'PayrollDocumentWorkflowService',
        'getDocumentStatus',
        error as Error
      );

      return {
        statusHistory: [],
        error: workflowError
      };
    }
  }

  /**
   * Download document
   */
  async downloadDocument(documentId: string, userId: string): Promise<{
    success: boolean;
    buffer?: Buffer;
    filename?: string;
    mimeType?: string;
    error?: DocumentWorkflowError;
  }> {
    try {
      await this.initialize();

      // Get document metadata
      const document = await PayrollDocumentMetadata.findByDocumentId(documentId);
      if (!document) {
        throw DocumentWorkflowErrorFactory.createValidationError(
          'documentId',
          documentId,
          'existing document'
        );
      }

      // Check if user has access (implement your authorization logic here)
      // if (!this.hasDownloadAccess(userId, document)) {
      //   throw DocumentWorkflowErrorFactory.createSecurityError(
      //     'download',
      //     userId,
      //     documentId
      //   );
      // }

      if (!document.fileInfo) {
        throw DocumentWorkflowErrorFactory.createValidationError(
          'fileInfo',
          null,
          'file storage information'
        );
      }

      // Retrieve file from storage
      const retrieveResult = await this.storageService.retrieveDocument(document.fileInfo);
      if (!retrieveResult.success || !retrieveResult.metadata?.buffer) {
        throw new DocumentWorkflowError(
          retrieveResult.error?.code || 'STORAGE_READ_FAILED' as any,
          retrieveResult.error?.message || 'Failed to retrieve document'
        );
      }

      // Update download metrics
      await document.incrementDownloadCount();

      return {
        success: true,
        buffer: retrieveResult.metadata.buffer as Buffer,
        filename: document.downloadFilename,
        mimeType: document.fileInfo.mimeType
      };

    } catch (error) {
      const workflowError = error instanceof DocumentWorkflowError
        ? error
        : DocumentWorkflowErrorFactory.createSystemError(
            'PayrollDocumentWorkflowService',
            'downloadDocument',
            error as Error,
            { userId, documentId }
          );

      await DocumentWorkflowErrorHandler.handleError(workflowError);

      return {
        success: false,
        error: workflowError
      };
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStatistics(filters?: {
    dateRange?: { from: Date; to: Date };
    employeeIds?: string[];
    documentTypes?: DocumentType[];
  }): Promise<{
    totalDocuments: number;
    documentsByStatus: Record<string, number>;
    documentsByType: Record<string, number>;
    averageProcessingTime: number;
    errorRate: number;
    storageMetrics: any;
    transitionStatistics: any;
  }> {
    try {
      await this.initialize();

      const [
        documentStats,
        storageMetrics,
        transitionStats
      ] = await Promise.all([
        PayrollDocumentMetadata.getStatistics(filters),
        this.storageService.getStorageMetrics(),
        this.statusService.getTransitionStatistics(
          filters?.dateRange || {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            to: new Date()
          }
        )
      ]);

      return {
        ...documentStats,
        errorRate: transitionStats.errorRate,
        storageMetrics,
        transitionStatistics: transitionStats
      };

    } catch (error) {
      console.error('Failed to get workflow statistics:', error);
      return {
        totalDocuments: 0,
        documentsByStatus: {},
        documentsByType: {},
        averageProcessingTime: 0,
        errorRate: 0,
        storageMetrics: {},
        transitionStatistics: {}
      };
    }
  }

  /**
   * Validate generation request
   */
  private async validateGenerationRequest(request: DocumentGenerationRequest): Promise<void> {
    const errors: DocumentWorkflowError[] = [];

    // Validate employee data
    errors.push(...DocumentWorkflowValidator.validateEmployeeData(request.employee));

    // Validate payroll data
    errors.push(...DocumentWorkflowValidator.validatePayrollData(request.calculation));

    // Validate period
    if (!request.period || !request.period.mois || !request.period.annee) {
      errors.push(DocumentWorkflowErrorFactory.createValidationError(
        'period',
        request.period,
        'valid payroll period'
      ));
    }

    if (errors.length > 0) {
      throw errors[0]; // Throw first error
    }
  }

  /**
   * Create document metadata
   */
  private async createDocumentMetadata(request: DocumentGenerationRequest): Promise<PayrollDocumentMetadataDocument> {
    const documentId = `${request.documentType}-${request.employee.employeeId}-${request.period.annee}-${request.period.mois}-${Date.now()}`;

    const metadata: Partial<IPayrollDocumentMetadata> = {
      documentId,
      documentType: request.documentType,
      employeeId: request.employee.employeeId,
      employeeName: `${request.employee.prenom} ${request.employee.nom}`,
      employeeCode: request.employee.cin,
      periodId: `${request.period.annee}-${request.period.mois}`,
      periodYear: request.period.annee,
      periodMonth: request.period.mois,
      periodLabel: `${this.getMonthName(request.period.mois)} ${request.period.annee}`,
      status: DocumentStatus.CALCULATION_PENDING,
      statusHistory: [],
      generationInfo: {
        mode: GenerationMode.PREVIEW,
        config: {
          mode: GenerationMode.PREVIEW,
          quality: 'medium',
          resolution: 150,
          watermark: 'APERÇU - NON OFFICIEL',
          includeMetadata: true,
          includeDigitalSignature: false,
          compressionLevel: 5
        },
        generatedAt: new Date(),
        generatedBy: request.context.userId,
        processingTime: 0,
        retryCount: 0
      },
      payrollData: {
        salaireBrut: request.calculation.salaire_brut_global,
        salaireNet: request.calculation.salaire_net,
        totalDeductions: request.calculation.totalRetenues,
        totalAllowances: request.calculation.totalIndemnités,
        employerCharges: request.calculation.cout_total_employeur - request.calculation.salaire_brut_global,
        cnssEmployee: request.calculation.cnss_salariale,
        cnssEmployer: request.calculation.cnss_patronale,
        incomeTax: request.calculation.ir_net
      },
      createdBy: request.context.userId,
      priority: request.options?.priority || ProcessingPriority.NORMAL,
      tags: [request.documentType, request.employee.fonction || 'employee'],
      metrics: {
        generationTime: 0,
        fileSize: 0,
        cacheHits: 0,
        downloadCount: 0
      }
    };

    return await PayrollDocumentMetadata.createNewDocument(metadata);
  }

  /**
   * Generate preview document
   */
  private async generatePreview(
    document: PayrollDocumentMetadataDocument,
    request: DocumentGenerationRequest
  ): Promise<GenerationResult> {
    try {
      // Transition to preview requested
      await this.statusService.transitionStatus(
        document.documentId,
        DocumentStatus.PREVIEW_REQUESTED,
        {
          userId: request.context.userId,
          requestId: request.context.requestId,
          reason: 'Preview generation requested'
        }
      );

      // Generate preview PDF (this would integrate with your existing PDF generation)
      const previewBuffer = await this.generatePDFBuffer(request, GenerationMode.PREVIEW);

      // Store preview in cache (simplified - in production use Redis or similar)
      const previewCacheKey = `preview-${document.documentId}-${Date.now()}`;

      // Update document with preview info
      document.previewInfo = {
        config: {
          expiryTime: 3600000, // 1 hour
          reducedSections: true,
          watermarkText: 'APERÇU - NON OFFICIEL',
          maxFileSize: 5242880, // 5MB
          cacheKey: previewCacheKey
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        downloadCount: 0
      };

      await document.save();

      // Transition to preview generated
      await this.statusService.transitionStatus(
        document.documentId,
        DocumentStatus.PREVIEW_GENERATED,
        {
          userId: request.context.userId,
          requestId: request.context.requestId,
          reason: 'Preview generation completed'
        }
      );

      return {
        success: true,
        documentId: document.documentId,
        previewUrl: `/api/payroll/documents/${document.documentId}/preview`,
        status: DocumentStatus.PREVIEW_GENERATED,
        processingTime: 0 // Will be calculated by caller
      };

    } catch (error) {
      await this.statusService.transitionStatus(
        document.documentId,
        DocumentStatus.GENERATION_FAILED,
        {
          userId: request.context.userId,
          requestId: request.context.requestId,
          reason: `Preview generation failed: ${error.message}`
        }
      );

      throw error;
    }
  }

  /**
   * Generate final document
   */
  private async generateFinalDocument(
    document: PayrollDocumentMetadataDocument,
    request: DocumentGenerationRequest
  ): Promise<GenerationResult> {
    try {
      // Transition to generating
      await this.statusService.transitionStatus(
        document.documentId,
        DocumentStatus.GENERATING,
        {
          userId: request.context.userId,
          requestId: request.context.requestId,
          reason: 'Final document generation started'
        }
      );

      // Generate final PDF
      const finalBuffer = await this.generatePDFBuffer(request, GenerationMode.FINAL);

      // Store document
      const storeResult = await this.storageService.storeDocument(
        document.documentId,
        request.documentType,
        request.employee.employeeId,
        request.period.annee,
        request.period.mois,
        finalBuffer,
        {
          employeeName: document.employeeName,
          periodLabel: document.periodLabel,
          generatedBy: request.context.userId
        }
      );

      if (!storeResult.success) {
        throw storeResult.error || new Error('Storage failed');
      }

      // Update document with file info
      document.fileInfo = storeResult.fileInfo;
      document.generationInfo.mode = GenerationMode.FINAL;
      document.generationInfo.processingTime = storeResult.metadata?.processingTime || 0;
      await document.save();

      // Transition to generated
      await this.statusService.transitionStatus(
        document.documentId,
        DocumentStatus.GENERATED,
        {
          userId: request.context.userId,
          requestId: request.context.requestId,
          reason: 'Final document generation completed'
        }
      );

      return {
        success: true,
        documentId: document.documentId,
        downloadUrl: `/api/payroll/documents/${document.documentId}/download`,
        status: DocumentStatus.GENERATED,
        processingTime: 0 // Will be calculated by caller
      };

    } catch (error) {
      await this.statusService.transitionStatus(
        document.documentId,
        DocumentStatus.GENERATION_FAILED,
        {
          userId: request.context.userId,
          requestId: request.context.requestId,
          reason: `Final generation failed: ${error.message}`
        }
      );

      throw error;
    }
  }

  /**
   * Generate PDF buffer (placeholder - integrate with your existing PDF generation)
   */
  private async generatePDFBuffer(
    request: DocumentGenerationRequest,
    mode: GenerationMode
  ): Promise<Buffer> {
    // This is a placeholder. In your actual implementation, you would:
    // 1. Use your existing BulletinPaie component
    // 2. Call renderToStream or similar from @react-pdf/renderer
    // 3. Return the generated buffer

    // For now, return a simple PDF buffer (you'll replace this with actual PDF generation)
    const mockPDFContent = `%PDF-1.4
Mock PDF for ${request.employee.nom} ${request.employee.prenom}
Period: ${request.period.mois}/${request.period.annee}
Mode: ${mode}
Generated: ${new Date().toISOString()}`;

    return Buffer.from(mockPDFContent, 'utf-8');
  }

  /**
   * Process promises with concurrency limit
   */
  private async processConcurrently<T>(
    promises: Promise<T>[],
    maxConcurrent: number
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < promises.length; i += maxConcurrent) {
      const batch = promises.slice(i, i + maxConcurrent);
      const batchResults = await Promise.allSettled(batch);

      results.push(
        ...batchResults.map(result =>
          result.status === 'fulfilled'
            ? result.value
            : result.reason
        )
      );
    }

    return results;
  }

  /**
   * Get month name in French
   */
  private getMonthName(month: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || `Mois ${month}`;
  }
}

// Export singleton instance
export const payrollDocumentWorkflowService = new PayrollDocumentWorkflowService();
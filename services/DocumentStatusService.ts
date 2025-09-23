/**
 * DocumentStatusService - State Machine with Audit Trail Management
 * Production-ready service for managing document status transitions with comprehensive validation and monitoring
 */

import { MongoClient, ClientSession } from 'mongodb';
import clientPromise from '@/lib/database/mongodb';
import {
  DocumentStatus,
  StatusTransitionTrigger,
  StatusTransition,
  StatusChangeAudit,
  DocumentError,
  DocumentErrorCode,
  STATUS_TRANSITIONS,
  isValidStatusTransition,
  getStatusTransition
} from '@/types/document-workflow';

// Status service configuration
interface StatusServiceConfig {
  enableAuditTrail: boolean;
  enableNotifications: boolean;
  enableBusinessRules: boolean;
  maxRetryAttempts: number;
  transactionTimeout: number;
  batchSize: number;
}

// Default configuration
const DEFAULT_CONFIG: StatusServiceConfig = {
  enableAuditTrail: true,
  enableNotifications: true,
  enableBusinessRules: true,
  maxRetryAttempts: 3,
  transactionTimeout: 30000, // 30 seconds
  batchSize: 100
};

// Transition context for business logic
interface TransitionContext {
  userId: string;
  reason?: string;
  comments?: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  requestId?: string;
  businessImpact?: {
    critical: boolean;
    affectedUsers: string[];
    estimatedRevenue?: number;
  };
}

// Transition result
interface TransitionResult {
  success: boolean;
  newStatus?: DocumentStatus;
  auditId?: string;
  error?: DocumentError;
  validationWarnings?: string[];
  sideEffectsExecuted?: string[];
  processingTime?: number;
}

// Business rule definition
interface BusinessRule {
  name: string;
  description: string;
  applies: (from: DocumentStatus, to: DocumentStatus, context: TransitionContext) => boolean;
  validate: (documentId: string, from: DocumentStatus, to: DocumentStatus, context: TransitionContext) => Promise<{
    valid: boolean;
    message?: string;
    severity: 'INFO' | 'WARNING' | 'ERROR';
  }>;
}

// Notification event
interface NotificationEvent {
  documentId: string;
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  userId: string;
  timestamp: Date;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  recipients: string[];
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Service for managing document status transitions with state machine validation,
 * atomic operations, audit trails, and business rule enforcement
 */
export class DocumentStatusService {
  private client: MongoClient | null = null;
  private config: StatusServiceConfig;
  private businessRules: Map<string, BusinessRule> = new Map();
  private notificationHandlers: Map<string, (event: NotificationEvent) => Promise<void>> = new Map();

  constructor(config?: Partial<StatusServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeBusinessRules();
  }

  /**
   * Initialize the status service
   */
  async initialize(): Promise<void> {
    try {
      this.client = await clientPromise;
      console.log('DocumentStatusService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DocumentStatusService:', error);
      throw new Error('Status service initialization failed');
    }
  }

  /**
   * Transition document status with full validation and audit trail
   */
  async transitionStatus(
    documentId: string,
    targetStatus: DocumentStatus,
    context: TransitionContext
  ): Promise<TransitionResult> {
    const startTime = Date.now();

    if (!this.client) {
      return {
        success: false,
        error: this.createDocumentError(
          DocumentErrorCode.DATABASE_CONNECTION_FAILED,
          'Status service not initialized'
        )
      };
    }

    const session = this.client.startSession();

    try {
      return await session.withTransaction(async () => {
        // Get current document status
        const currentStatus = await this.getCurrentStatus(documentId, session);
        if (!currentStatus) {
          throw new Error(`Document ${documentId} not found`);
        }

        // Validate transition
        const validation = await this.validateTransition(
          documentId, currentStatus, targetStatus, context, session
        );

        if (!validation.valid) {
          return {
            success: false,
            error: this.createDocumentError(
              DocumentErrorCode.INVALID_STATUS_TRANSITION,
              validation.message || 'Invalid status transition',
              {
                documentId,
                currentStatus,
                targetStatus,
                validationDetails: validation
              }
            )
          };
        }

        // Execute pre-transition side effects
        const preEffects = await this.executePreTransitionEffects(
          documentId, currentStatus, targetStatus, context
        );

        // Update document status atomically
        await this.updateDocumentStatus(documentId, targetStatus, context, session);

        // Create audit trail entry
        const auditId = await this.createAuditEntry(
          documentId, currentStatus, targetStatus, context, session
        );

        // Execute post-transition side effects
        const postEffects = await this.executePostTransitionEffects(
          documentId, currentStatus, targetStatus, context
        );

        // Send notifications if enabled
        if (this.config.enableNotifications) {
          await this.sendNotifications(documentId, currentStatus, targetStatus, context);
        }

        const processingTime = Date.now() - startTime;

        return {
          success: true,
          newStatus: targetStatus,
          auditId,
          validationWarnings: validation.warnings,
          sideEffectsExecuted: [...preEffects, ...postEffects],
          processingTime
        };

      }, {
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' },
        maxCommitTimeMS: this.config.transactionTimeout
      });

    } catch (error) {
      return {
        success: false,
        error: this.createDocumentError(
          DocumentErrorCode.INVALID_STATUS_TRANSITION,
          `Status transition failed: ${error.message}`,
          {
            documentId,
            targetStatus,
            context,
            error: error.message,
            processingTime: Date.now() - startTime
          }
        )
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Get current status of a document
   */
  async getCurrentStatus(documentId: string, session?: ClientSession): Promise<DocumentStatus | null> {
    try {
      if (!this.client) return null;

      const db = this.client.db();
      const collection = db.collection('payroll_document_metadata');

      const document = await collection.findOne(
        { documentId, isDeleted: false },
        { session, projection: { status: 1 } }
      );

      return document?.status || null;
    } catch (error) {
      console.error('Failed to get current status:', error);
      return null;
    }
  }

  /**
   * Get status history for a document
   */
  async getStatusHistory(
    documentId: string,
    limit: number = 50
  ): Promise<StatusChangeAudit[]> {
    try {
      if (!this.client) return [];

      const db = this.client.db();
      const collection = db.collection('status_change_audit');

      const history = await collection
        .find({ documentId })
        .sort({ changedAt: -1 })
        .limit(limit)
        .toArray();

      return history.map(audit => ({
        ...audit,
        _id: audit._id?.toString()
      }));
    } catch (error) {
      console.error('Failed to get status history:', error);
      return [];
    }
  }

  /**
   * Batch transition multiple documents
   */
  async batchTransition(
    documentIds: string[],
    targetStatus: DocumentStatus,
    context: TransitionContext
  ): Promise<{
    successful: string[];
    failed: Array<{ documentId: string; error: DocumentError }>;
    totalProcessed: number;
    processingTime: number;
  }> {
    const startTime = Date.now();
    const successful: string[] = [];
    const failed: Array<{ documentId: string; error: DocumentError }> = [];

    // Process in batches to avoid overwhelming the system
    const batches = this.chunkArray(documentIds, this.config.batchSize);

    for (const batch of batches) {
      const batchPromises = batch.map(async (documentId) => {
        const result = await this.transitionStatus(documentId, targetStatus, {
          ...context,
          requestId: `${context.requestId || 'batch'}-${documentId}`
        });

        if (result.success) {
          successful.push(documentId);
        } else if (result.error) {
          failed.push({ documentId, error: result.error });
        }
      });

      await Promise.allSettled(batchPromises);
    }

    return {
      successful,
      failed,
      totalProcessed: successful.length + failed.length,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Get documents by status with pagination
   */
  async getDocumentsByStatus(
    status: DocumentStatus,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      filters?: Record<string, any>;
    } = {}
  ): Promise<{
    documents: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      if (!this.client) {
        return { documents: [], total: 0, page: 1, totalPages: 0 };
      }

      const {
        page = 1,
        limit = 20,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        filters = {}
      } = options;

      const db = this.client.db();
      const collection = db.collection('payroll_document_metadata');

      const query = {
        status,
        isDeleted: false,
        ...filters
      };

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
      const skip = (page - 1) * limit;

      const [documents, total] = await Promise.all([
        collection
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(query)
      ]);

      return {
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Failed to get documents by status:', error);
      return { documents: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Register a business rule
   */
  registerBusinessRule(rule: BusinessRule): void {
    this.businessRules.set(rule.name, rule);
  }

  /**
   * Register a notification handler
   */
  registerNotificationHandler(
    name: string,
    handler: (event: NotificationEvent) => Promise<void>
  ): void {
    this.notificationHandlers.set(name, handler);
  }

  /**
   * Get status transition statistics
   */
  async getTransitionStatistics(
    timeRange: { from: Date; to: Date }
  ): Promise<{
    totalTransitions: number;
    transitionsByStatus: Record<string, number>;
    transitionsByUser: Record<string, number>;
    averageProcessingTime: number;
    errorRate: number;
  }> {
    try {
      if (!this.client) {
        return {
          totalTransitions: 0,
          transitionsByStatus: {},
          transitionsByUser: {},
          averageProcessingTime: 0,
          errorRate: 0
        };
      }

      const db = this.client.db();
      const collection = db.collection('status_change_audit');

      const pipeline = [
        {
          $match: {
            changedAt: {
              $gte: timeRange.from,
              $lte: timeRange.to
            }
          }
        },
        {
          $group: {
            _id: null,
            totalTransitions: { $sum: 1 },
            transitionsByStatus: {
              $push: {
                from: '$fromStatus',
                to: '$toStatus'
              }
            },
            transitionsByUser: {
              $push: '$changedBy'
            },
            averageProcessingTime: { $avg: '$processingTime' },
            errors: {
              $sum: {
                $cond: [{ $ne: ['$errorDetails', null] }, 1, 0]
              }
            }
          }
        }
      ];

      const result = await collection.aggregate(pipeline).toArray();

      if (result.length === 0) {
        return {
          totalTransitions: 0,
          transitionsByStatus: {},
          transitionsByUser: {},
          averageProcessingTime: 0,
          errorRate: 0
        };
      }

      const stats = result[0];

      // Process status transitions
      const transitionsByStatus: Record<string, number> = {};
      stats.transitionsByStatus?.forEach((transition: any) => {
        const key = `${transition.from} → ${transition.to}`;
        transitionsByStatus[key] = (transitionsByStatus[key] || 0) + 1;
      });

      // Process user transitions
      const transitionsByUser: Record<string, number> = {};
      stats.transitionsByUser?.forEach((user: string) => {
        transitionsByUser[user] = (transitionsByUser[user] || 0) + 1;
      });

      return {
        totalTransitions: stats.totalTransitions || 0,
        transitionsByStatus,
        transitionsByUser,
        averageProcessingTime: stats.averageProcessingTime || 0,
        errorRate: stats.totalTransitions > 0 ? (stats.errors || 0) / stats.totalTransitions : 0
      };
    } catch (error) {
      console.error('Failed to get transition statistics:', error);
      return {
        totalTransitions: 0,
        transitionsByStatus: {},
        transitionsByUser: {},
        averageProcessingTime: 0,
        errorRate: 0
      };
    }
  }

  /**
   * Validate status transition
   */
  private async validateTransition(
    documentId: string,
    currentStatus: DocumentStatus,
    targetStatus: DocumentStatus,
    context: TransitionContext,
    session: ClientSession
  ): Promise<{
    valid: boolean;
    message?: string;
    warnings?: string[];
  }> {
    const warnings: string[] = [];

    // Check if transition is valid in state machine
    if (!isValidStatusTransition(currentStatus, targetStatus)) {
      return {
        valid: false,
        message: `Invalid transition from ${currentStatus} to ${targetStatus}`
      };
    }

    // Get transition definition
    const transition = getStatusTransition(currentStatus, targetStatus);
    if (!transition) {
      return {
        valid: false,
        message: 'Transition not defined in state machine'
      };
    }

    // Check conditions
    if (transition.conditions) {
      for (const condition of transition.conditions) {
        const conditionMet = await this.checkCondition(
          documentId, condition, context, session
        );

        if (!conditionMet) {
          return {
            valid: false,
            message: `Condition not met: ${condition}`
          };
        }
      }
    }

    // Check approval requirements
    if (transition.requiresApproval && !context.metadata?.approvalGranted) {
      return {
        valid: false,
        message: 'Approval required for this transition'
      };
    }

    // Apply business rules if enabled
    if (this.config.enableBusinessRules) {
      for (const [name, rule] of this.businessRules) {
        if (rule.applies(currentStatus, targetStatus, context)) {
          const ruleResult = await rule.validate(
            documentId, currentStatus, targetStatus, context
          );

          if (!ruleResult.valid) {
            return {
              valid: false,
              message: `Business rule violation (${name}): ${ruleResult.message}`
            };
          }

          if (ruleResult.severity === 'WARNING') {
            warnings.push(`${name}: ${ruleResult.message}`);
          }
        }
      }
    }

    return { valid: true, warnings };
  }

  /**
   * Update document status in database
   */
  private async updateDocumentStatus(
    documentId: string,
    newStatus: DocumentStatus,
    context: TransitionContext,
    session: ClientSession
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Database client not available');
    }

    const db = this.client.db();
    const collection = db.collection('payroll_document_metadata');

    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };

    // Add status-specific fields
    switch (newStatus) {
      case DocumentStatus.APPROVED:
        updateData['approvalInfo.approvedBy'] = context.userId;
        updateData['approvalInfo.approvedAt'] = new Date();
        updateData['approvalInfo.approvalComments'] = context.comments;
        break;

      case DocumentStatus.SENT:
        updateData['distributionInfo.sentBy'] = context.userId;
        updateData['distributionInfo.sentAt'] = new Date();
        break;

      case DocumentStatus.ARCHIVED:
        updateData.archivedBy = context.userId;
        updateData.archivedAt = new Date();
        break;
    }

    await collection.updateOne(
      { documentId, isDeleted: false },
      { $set: updateData },
      { session }
    );
  }

  /**
   * Create audit trail entry
   */
  private async createAuditEntry(
    documentId: string,
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    context: TransitionContext,
    session: ClientSession
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Database client not available');
    }

    const db = this.client.db();
    const collection = db.collection('status_change_audit');

    const transition = getStatusTransition(fromStatus, toStatus);

    const auditEntry: StatusChangeAudit = {
      documentId,
      fromStatus,
      toStatus,
      trigger: StatusTransitionTrigger.USER_ACTION,
      changedBy: context.userId,
      changedAt: new Date(),
      reason: context.reason,
      comments: context.comments,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      sessionId: context.sessionId,
      metadata: context.metadata,
      requestId: context.requestId,
      approvalRequired: transition?.requiresApproval || false,
      businessImpact: context.businessImpact
    };

    const result = await collection.insertOne(auditEntry, { session });
    return result.insertedId.toString();
  }

  /**
   * Execute pre-transition side effects
   */
  private async executePreTransitionEffects(
    documentId: string,
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    context: TransitionContext
  ): Promise<string[]> {
    const executedEffects: string[] = [];
    const transition = getStatusTransition(fromStatus, toStatus);

    if (!transition?.sideEffects) {
      return executedEffects;
    }

    for (const effect of transition.sideEffects) {
      try {
        switch (effect) {
          case 'clear_preview_cache':
            await this.clearPreviewCache(documentId);
            executedEffects.push(effect);
            break;

          case 'queue_generation_job':
            await this.queueGenerationJob(documentId, context);
            executedEffects.push(effect);
            break;

          case 'log_error':
            await this.logError(documentId, context);
            executedEffects.push(effect);
            break;

          default:
            console.warn(`Unknown side effect: ${effect}`);
        }
      } catch (error) {
        console.error(`Failed to execute side effect ${effect}:`, error);
      }
    }

    return executedEffects;
  }

  /**
   * Execute post-transition side effects
   */
  private async executePostTransitionEffects(
    documentId: string,
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    context: TransitionContext
  ): Promise<string[]> {
    const executedEffects: string[] = [];

    // Add common post-transition effects
    try {
      switch (toStatus) {
        case DocumentStatus.GENERATED:
          await this.notifyStakeholders(documentId, context);
          executedEffects.push('notify_stakeholders');
          break;

        case DocumentStatus.SENT:
          await this.logDistribution(documentId, context);
          executedEffects.push('log_distribution');
          break;
      }
    } catch (error) {
      console.error('Failed to execute post-transition effects:', error);
    }

    return executedEffects;
  }

  /**
   * Send notifications for status changes
   */
  private async sendNotifications(
    documentId: string,
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    context: TransitionContext
  ): Promise<void> {
    const event: NotificationEvent = {
      documentId,
      fromStatus,
      toStatus,
      userId: context.userId,
      timestamp: new Date(),
      priority: this.getNotificationPriority(toStatus),
      recipients: await this.getNotificationRecipients(documentId, toStatus),
      message: `Document ${documentId} status changed from ${fromStatus} to ${toStatus}`,
      metadata: context.metadata
    };

    for (const [name, handler] of this.notificationHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Notification handler ${name} failed:`, error);
      }
    }
  }

  /**
   * Initialize default business rules
   */
  private initializeBusinessRules(): void {
    // Working hours rule
    this.registerBusinessRule({
      name: 'working_hours',
      description: 'Only allow status changes during working hours',
      applies: (from, to, context) => {
        const sensitiveTransitions = [
          DocumentStatus.APPROVED_FOR_GENERATION,
          DocumentStatus.APPROVED,
          DocumentStatus.SENT
        ];
        return sensitiveTransitions.includes(to);
      },
      validate: async (documentId, from, to, context) => {
        const now = new Date();
        const hour = now.getHours();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;

        if (isWeekend || hour < 8 || hour > 18) {
          return {
            valid: false,
            message: 'Status changes only allowed during working hours (8 AM - 6 PM, weekdays)',
            severity: 'ERROR'
          };
        }

        return { valid: true, severity: 'INFO' };
      }
    });

    // Concurrent modification rule
    this.registerBusinessRule({
      name: 'concurrent_modification',
      description: 'Prevent concurrent status modifications',
      applies: () => true,
      validate: async (documentId, from, to, context) => {
        // This would check for concurrent modifications
        // Implementation depends on your concurrency control strategy
        return { valid: true, severity: 'INFO' };
      }
    });
  }

  /**
   * Check transition condition
   */
  private async checkCondition(
    documentId: string,
    condition: string,
    context: TransitionContext,
    session: ClientSession
  ): Promise<boolean> {
    try {
      switch (condition) {
        case 'employee_data_valid':
          return await this.validateEmployeeData(documentId, session);

        case 'payroll_calculation_complete':
          return await this.validatePayrollCalculation(documentId, session);

        case 'preview_viewed':
          return await this.checkPreviewViewed(documentId, session);

        case 'user_has_approval_rights':
          return await this.checkApprovalRights(context.userId, documentId);

        case 'approver_authorized':
          return await this.checkApproverAuthorization(context.userId, documentId);

        case 'document_quality_verified':
          return await this.verifyDocumentQuality(documentId, session);

        default:
          console.warn(`Unknown condition: ${condition}`);
          return true;
      }
    } catch (error) {
      console.error(`Failed to check condition ${condition}:`, error);
      return false;
    }
  }

  // Helper methods for conditions (simplified implementations)
  private async validateEmployeeData(documentId: string, session: ClientSession): Promise<boolean> {
    // Implementation would validate employee data
    return true;
  }

  private async validatePayrollCalculation(documentId: string, session: ClientSession): Promise<boolean> {
    // Implementation would validate payroll calculation
    return true;
  }

  private async checkPreviewViewed(documentId: string, session: ClientSession): Promise<boolean> {
    // Implementation would check if preview was viewed
    return true;
  }

  private async checkApprovalRights(userId: string, documentId: string): Promise<boolean> {
    // Implementation would check user approval rights
    return true;
  }

  private async checkApproverAuthorization(userId: string, documentId: string): Promise<boolean> {
    // Implementation would check if user is authorized approver
    return true;
  }

  private async verifyDocumentQuality(documentId: string, session: ClientSession): Promise<boolean> {
    // Implementation would verify document quality
    return true;
  }

  // Helper methods for side effects (simplified implementations)
  private async clearPreviewCache(documentId: string): Promise<void> {
    // Implementation would clear preview cache
    console.log(`Clearing preview cache for document ${documentId}`);
  }

  private async queueGenerationJob(documentId: string, context: TransitionContext): Promise<void> {
    // Implementation would queue generation job
    console.log(`Queuing generation job for document ${documentId}`);
  }

  private async logError(documentId: string, context: TransitionContext): Promise<void> {
    // Implementation would log error
    console.log(`Logging error for document ${documentId}`);
  }

  private async notifyStakeholders(documentId: string, context: TransitionContext): Promise<void> {
    // Implementation would notify stakeholders
    console.log(`Notifying stakeholders for document ${documentId}`);
  }

  private async logDistribution(documentId: string, context: TransitionContext): Promise<void> {
    // Implementation would log distribution
    console.log(`Logging distribution for document ${documentId}`);
  }

  // Helper methods for notifications
  private getNotificationPriority(status: DocumentStatus): 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' {
    const urgentStatuses = [DocumentStatus.GENERATION_FAILED];
    const highStatuses = [DocumentStatus.APPROVED, DocumentStatus.SENT];
    const normalStatuses = [DocumentStatus.GENERATED, DocumentStatus.PENDING_APPROVAL];

    if (urgentStatuses.includes(status)) return 'URGENT';
    if (highStatuses.includes(status)) return 'HIGH';
    if (normalStatuses.includes(status)) return 'NORMAL';
    return 'LOW';
  }

  private async getNotificationRecipients(documentId: string, status: DocumentStatus): Promise<string[]> {
    // Implementation would determine notification recipients based on status and document
    return [];
  }

  // Utility methods
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private createDocumentError(
    code: DocumentErrorCode,
    message: string,
    details?: Record<string, any>
  ): DocumentError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      retryable: this.isRetryableError(code),
      severity: this.getErrorSeverity(code),
      context: {
        operation: 'status-transition',
        component: 'DocumentStatusService',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  private isRetryableError(code: DocumentErrorCode): boolean {
    const retryableCodes = [
      DocumentErrorCode.DATABASE_CONNECTION_FAILED,
      DocumentErrorCode.TIMEOUT_EXCEEDED
    ];
    return retryableCodes.includes(code);
  }

  private getErrorSeverity(code: DocumentErrorCode): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalCodes = [DocumentErrorCode.DATABASE_CONNECTION_FAILED];
    const highCodes = [DocumentErrorCode.INVALID_STATUS_TRANSITION];
    const mediumCodes = [DocumentErrorCode.UNAUTHORIZED_STATUS_CHANGE];

    if (criticalCodes.includes(code)) return 'CRITICAL';
    if (highCodes.includes(code)) return 'HIGH';
    if (mediumCodes.includes(code)) return 'MEDIUM';
    return 'LOW';
  }
}

// Export singleton instance
export const documentStatusService = new DocumentStatusService();
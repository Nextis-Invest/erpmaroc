/**
 * DocumentWorkflowError - Comprehensive Error Handling and Validation
 * Production-ready error handling with categorization, recovery strategies, and monitoring integration
 */

import {
  DocumentError,
  DocumentErrorCode,
  DocumentStatus
} from '@/types/document-workflow';

// Error severity levels for monitoring and alerting
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error categories for classification and routing
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  SYSTEM = 'SYSTEM',
  EXTERNAL = 'EXTERNAL',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE'
}

// Recovery strategy types
export enum RecoveryStrategy {
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  SKIP = 'SKIP',
  ABORT = 'ABORT'
}

// Enhanced error context
interface ErrorContext {
  operation: string;
  component: string;
  version: string;
  environment: string;
  userId?: string;
  documentId?: string;
  requestId?: string;
  sessionId?: string;
  timestamp: Date;
  additionalData?: Record<string, any>;
}

// Recovery action definition
interface RecoveryAction {
  strategy: RecoveryStrategy;
  description: string;
  automated: boolean;
  maxAttempts?: number;
  delayMs?: number;
  escalationLevel?: ErrorSeverity;
  execute?: () => Promise<boolean>;
}

// Error monitoring metrics
interface ErrorMetrics {
  errorCode: DocumentErrorCode;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  averageResolutionTime: number;
  successfulRecoveries: number;
  failedRecoveries: number;
}

/**
 * Main DocumentWorkflowError class extending the native Error
 */
export class DocumentWorkflowError extends Error {
  public readonly code: DocumentErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly retryable: boolean;
  public readonly context: ErrorContext;
  public readonly recoveryActions: RecoveryAction[];
  public readonly originalError?: Error;
  public readonly details: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    code: DocumentErrorCode,
    message: string,
    options: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      retryable?: boolean;
      context?: Partial<ErrorContext>;
      recoveryActions?: RecoveryAction[];
      originalError?: Error;
      details?: Record<string, any>;
    } = {}
  ) {
    super(message);
    this.name = 'DocumentWorkflowError';

    this.code = code;
    this.severity = options.severity || this.determineSeverity(code);
    this.category = options.category || this.determineCategory(code);
    this.retryable = options.retryable !== undefined ? options.retryable : this.determineRetryable(code);
    this.originalError = options.originalError;
    this.details = options.details || {};
    this.timestamp = new Date();

    this.context = {
      operation: 'unknown',
      component: 'DocumentWorkflow',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: this.timestamp,
      ...options.context
    };

    this.recoveryActions = options.recoveryActions || this.generateRecoveryActions(code);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DocumentWorkflowError);
    }
  }

  /**
   * Convert to DocumentError interface for storage and transmission
   */
  toDocumentError(): DocumentError {
    return {
      code: this.code,
      message: this.message,
      details: {
        ...this.details,
        severity: this.severity,
        category: this.category,
        context: this.context,
        recoveryActions: this.recoveryActions.map(action => ({
          strategy: action.strategy,
          description: action.description,
          automated: action.automated
        })),
        stackTrace: this.stack
      },
      timestamp: this.timestamp,
      documentId: this.context.documentId,
      userId: this.context.userId,
      retryable: this.retryable,
      severity: this.severity,
      context: this.context
    };
  }

  /**
   * Get formatted error message for user display
   */
  getUserMessage(): string {
    const userMessages: Record<DocumentErrorCode, string> = {
      [DocumentErrorCode.INVALID_EMPLOYEE_DATA]: 'Les données de l\'employé sont invalides. Veuillez vérifier les informations.',
      [DocumentErrorCode.INVALID_PAYROLL_DATA]: 'Les données de paie sont invalides. Veuillez vérifier les calculs.',
      [DocumentErrorCode.MISSING_REQUIRED_FIELDS]: 'Des champs obligatoires sont manquants.',
      [DocumentErrorCode.PDF_GENERATION_FAILED]: 'La génération du PDF a échoué. Veuillez réessayer.',
      [DocumentErrorCode.TEMPLATE_NOT_FOUND]: 'Le modèle de document n\'a pas été trouvé.',
      [DocumentErrorCode.MEMORY_INSUFFICIENT]: 'Mémoire insuffisante pour traiter le document.',
      [DocumentErrorCode.TIMEOUT_EXCEEDED]: 'Le traitement a pris trop de temps. Veuillez réessayer.',
      [DocumentErrorCode.STORAGE_WRITE_FAILED]: 'Échec de l\'enregistrement du document.',
      [DocumentErrorCode.STORAGE_READ_FAILED]: 'Échec de la lecture du document.',
      [DocumentErrorCode.STORAGE_SPACE_INSUFFICIENT]: 'Espace de stockage insuffisant.',
      [DocumentErrorCode.STORAGE_PERMISSION_DENIED]: 'Permissions insuffisantes pour accéder au stockage.',
      [DocumentErrorCode.INVALID_STATUS_TRANSITION]: 'Transition de statut invalide.',
      [DocumentErrorCode.UNAUTHORIZED_STATUS_CHANGE]: 'Vous n\'êtes pas autorisé à changer ce statut.',
      [DocumentErrorCode.APPROVAL_REQUIRED]: 'Une approbation est requise pour cette action.',
      [DocumentErrorCode.DATABASE_CONNECTION_FAILED]: 'Problème de connexion à la base de données.',
      [DocumentErrorCode.CACHE_UNAVAILABLE]: 'Cache temporairement indisponible.',
      [DocumentErrorCode.EXTERNAL_SERVICE_UNAVAILABLE]: 'Service externe temporairement indisponible.',
      [DocumentErrorCode.CONFIGURATION_ERROR]: 'Erreur de configuration du système.'
    };

    return userMessages[this.code] || this.message;
  }

  /**
   * Get suggested actions for the user
   */
  getSuggestedActions(): string[] {
    const suggestions: Record<DocumentErrorCode, string[]> = {
      [DocumentErrorCode.INVALID_EMPLOYEE_DATA]: [
        'Vérifiez que tous les champs employé sont correctement remplis',
        'Contactez le service RH si les données semblent correctes'
      ],
      [DocumentErrorCode.PDF_GENERATION_FAILED]: [
        'Réessayez dans quelques minutes',
        'Vérifiez que les données de paie sont complètes',
        'Contactez l\'administrateur si le problème persiste'
      ],
      [DocumentErrorCode.STORAGE_SPACE_INSUFFICIENT]: [
        'Contactez immédiatement l\'administrateur système',
        'Archivez ou supprimez les anciens documents si possible'
      ],
      [DocumentErrorCode.TIMEOUT_EXCEEDED]: [
        'Réessayez avec moins de documents à la fois',
        'Attendez quelques minutes avant de réessayer'
      ],
      [DocumentErrorCode.UNAUTHORIZED_STATUS_CHANGE]: [
        'Contactez votre superviseur pour obtenir les autorisations',
        'Vérifiez que vous êtes connecté avec le bon compte'
      ]
    };

    return suggestions[this.code] || ['Contactez le support technique si le problème persiste'];
  }

  /**
   * Determine error severity based on error code
   */
  private determineSeverity(code: DocumentErrorCode): ErrorSeverity {
    const severityMapping: Record<DocumentErrorCode, ErrorSeverity> = {
      [DocumentErrorCode.INVALID_EMPLOYEE_DATA]: ErrorSeverity.MEDIUM,
      [DocumentErrorCode.INVALID_PAYROLL_DATA]: ErrorSeverity.MEDIUM,
      [DocumentErrorCode.MISSING_REQUIRED_FIELDS]: ErrorSeverity.MEDIUM,
      [DocumentErrorCode.PDF_GENERATION_FAILED]: ErrorSeverity.HIGH,
      [DocumentErrorCode.TEMPLATE_NOT_FOUND]: ErrorSeverity.HIGH,
      [DocumentErrorCode.MEMORY_INSUFFICIENT]: ErrorSeverity.CRITICAL,
      [DocumentErrorCode.TIMEOUT_EXCEEDED]: ErrorSeverity.MEDIUM,
      [DocumentErrorCode.STORAGE_WRITE_FAILED]: ErrorSeverity.HIGH,
      [DocumentErrorCode.STORAGE_READ_FAILED]: ErrorSeverity.HIGH,
      [DocumentErrorCode.STORAGE_SPACE_INSUFFICIENT]: ErrorSeverity.CRITICAL,
      [DocumentErrorCode.STORAGE_PERMISSION_DENIED]: ErrorSeverity.HIGH,
      [DocumentErrorCode.INVALID_STATUS_TRANSITION]: ErrorSeverity.MEDIUM,
      [DocumentErrorCode.UNAUTHORIZED_STATUS_CHANGE]: ErrorSeverity.MEDIUM,
      [DocumentErrorCode.APPROVAL_REQUIRED]: ErrorSeverity.LOW,
      [DocumentErrorCode.DATABASE_CONNECTION_FAILED]: ErrorSeverity.CRITICAL,
      [DocumentErrorCode.CACHE_UNAVAILABLE]: ErrorSeverity.LOW,
      [DocumentErrorCode.EXTERNAL_SERVICE_UNAVAILABLE]: ErrorSeverity.MEDIUM,
      [DocumentErrorCode.CONFIGURATION_ERROR]: ErrorSeverity.HIGH
    };

    return severityMapping[code] || ErrorSeverity.MEDIUM;
  }

  /**
   * Determine error category based on error code
   */
  private determineCategory(code: DocumentErrorCode): ErrorCategory {
    const categoryMapping: Record<DocumentErrorCode, ErrorCategory> = {
      [DocumentErrorCode.INVALID_EMPLOYEE_DATA]: ErrorCategory.VALIDATION,
      [DocumentErrorCode.INVALID_PAYROLL_DATA]: ErrorCategory.VALIDATION,
      [DocumentErrorCode.MISSING_REQUIRED_FIELDS]: ErrorCategory.VALIDATION,
      [DocumentErrorCode.PDF_GENERATION_FAILED]: ErrorCategory.SYSTEM,
      [DocumentErrorCode.TEMPLATE_NOT_FOUND]: ErrorCategory.SYSTEM,
      [DocumentErrorCode.MEMORY_INSUFFICIENT]: ErrorCategory.PERFORMANCE,
      [DocumentErrorCode.TIMEOUT_EXCEEDED]: ErrorCategory.PERFORMANCE,
      [DocumentErrorCode.STORAGE_WRITE_FAILED]: ErrorCategory.SYSTEM,
      [DocumentErrorCode.STORAGE_READ_FAILED]: ErrorCategory.SYSTEM,
      [DocumentErrorCode.STORAGE_SPACE_INSUFFICIENT]: ErrorCategory.SYSTEM,
      [DocumentErrorCode.STORAGE_PERMISSION_DENIED]: ErrorCategory.SECURITY,
      [DocumentErrorCode.INVALID_STATUS_TRANSITION]: ErrorCategory.BUSINESS_LOGIC,
      [DocumentErrorCode.UNAUTHORIZED_STATUS_CHANGE]: ErrorCategory.SECURITY,
      [DocumentErrorCode.APPROVAL_REQUIRED]: ErrorCategory.BUSINESS_LOGIC,
      [DocumentErrorCode.DATABASE_CONNECTION_FAILED]: ErrorCategory.SYSTEM,
      [DocumentErrorCode.CACHE_UNAVAILABLE]: ErrorCategory.SYSTEM,
      [DocumentErrorCode.EXTERNAL_SERVICE_UNAVAILABLE]: ErrorCategory.EXTERNAL,
      [DocumentErrorCode.CONFIGURATION_ERROR]: ErrorCategory.SYSTEM
    };

    return categoryMapping[code] || ErrorCategory.SYSTEM;
  }

  /**
   * Determine if error is retryable based on error code
   */
  private determineRetryable(code: DocumentErrorCode): boolean {
    const retryableErrors = [
      DocumentErrorCode.PDF_GENERATION_FAILED,
      DocumentErrorCode.TIMEOUT_EXCEEDED,
      DocumentErrorCode.STORAGE_WRITE_FAILED,
      DocumentErrorCode.STORAGE_READ_FAILED,
      DocumentErrorCode.DATABASE_CONNECTION_FAILED,
      DocumentErrorCode.CACHE_UNAVAILABLE,
      DocumentErrorCode.EXTERNAL_SERVICE_UNAVAILABLE
    ];

    return retryableErrors.includes(code);
  }

  /**
   * Generate recovery actions based on error code
   */
  private generateRecoveryActions(code: DocumentErrorCode): RecoveryAction[] {
    const actionMapping: Record<DocumentErrorCode, RecoveryAction[]> = {
      [DocumentErrorCode.PDF_GENERATION_FAILED]: [
        {
          strategy: RecoveryStrategy.RETRY,
          description: 'Retry PDF generation with exponential backoff',
          automated: true,
          maxAttempts: 3,
          delayMs: 1000
        },
        {
          strategy: RecoveryStrategy.FALLBACK,
          description: 'Generate simplified PDF version',
          automated: true
        },
        {
          strategy: RecoveryStrategy.MANUAL_INTERVENTION,
          description: 'Manual review and regeneration',
          automated: false,
          escalationLevel: ErrorSeverity.HIGH
        }
      ],
      [DocumentErrorCode.STORAGE_WRITE_FAILED]: [
        {
          strategy: RecoveryStrategy.RETRY,
          description: 'Retry storage operation',
          automated: true,
          maxAttempts: 2,
          delayMs: 2000
        },
        {
          strategy: RecoveryStrategy.FALLBACK,
          description: 'Use alternative storage provider',
          automated: true
        }
      ],
      [DocumentErrorCode.DATABASE_CONNECTION_FAILED]: [
        {
          strategy: RecoveryStrategy.RETRY,
          description: 'Retry database connection',
          automated: true,
          maxAttempts: 5,
          delayMs: 5000
        },
        {
          strategy: RecoveryStrategy.MANUAL_INTERVENTION,
          description: 'Database administrator intervention required',
          automated: false,
          escalationLevel: ErrorSeverity.CRITICAL
        }
      ],
      [DocumentErrorCode.INVALID_PAYROLL_DATA]: [
        {
          strategy: RecoveryStrategy.MANUAL_INTERVENTION,
          description: 'Data validation and correction required',
          automated: false
        }
      ]
    };

    return actionMapping[code] || [
      {
        strategy: RecoveryStrategy.MANUAL_INTERVENTION,
        description: 'Manual review required',
        automated: false
      }
    ];
  }
}

/**
 * Error factory for creating standardized errors
 */
export class DocumentWorkflowErrorFactory {
  /**
   * Create validation error
   */
  static createValidationError(
    field: string,
    value: any,
    expectedType: string,
    context?: Partial<ErrorContext>
  ): DocumentWorkflowError {
    return new DocumentWorkflowError(
      DocumentErrorCode.INVALID_PAYROLL_DATA,
      `Validation failed for field '${field}': expected ${expectedType}, got ${typeof value}`,
      {
        category: ErrorCategory.VALIDATION,
        details: { field, value, expectedType },
        context
      }
    );
  }

  /**
   * Create business logic error
   */
  static createBusinessLogicError(
    rule: string,
    reason: string,
    context?: Partial<ErrorContext>
  ): DocumentWorkflowError {
    return new DocumentWorkflowError(
      DocumentErrorCode.INVALID_STATUS_TRANSITION,
      `Business rule violation: ${rule} - ${reason}`,
      {
        category: ErrorCategory.BUSINESS_LOGIC,
        details: { rule, reason },
        context
      }
    );
  }

  /**
   * Create system error
   */
  static createSystemError(
    component: string,
    operation: string,
    originalError: Error,
    context?: Partial<ErrorContext>
  ): DocumentWorkflowError {
    return new DocumentWorkflowError(
      DocumentErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
      `System error in ${component} during ${operation}: ${originalError.message}`,
      {
        category: ErrorCategory.SYSTEM,
        originalError,
        details: { component, operation },
        context: {
          ...context,
          component,
          operation
        }
      }
    );
  }

  /**
   * Create security error
   */
  static createSecurityError(
    action: string,
    userId: string,
    resource: string,
    context?: Partial<ErrorContext>
  ): DocumentWorkflowError {
    return new DocumentWorkflowError(
      DocumentErrorCode.UNAUTHORIZED_STATUS_CHANGE,
      `Unauthorized action: ${action} on ${resource} by user ${userId}`,
      {
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.HIGH,
        details: { action, userId, resource },
        context: {
          ...context,
          userId
        }
      }
    );
  }

  /**
   * Create performance error
   */
  static createPerformanceError(
    operation: string,
    duration: number,
    threshold: number,
    context?: Partial<ErrorContext>
  ): DocumentWorkflowError {
    return new DocumentWorkflowError(
      DocumentErrorCode.TIMEOUT_EXCEEDED,
      `Performance threshold exceeded: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
      {
        category: ErrorCategory.PERFORMANCE,
        details: { operation, duration, threshold },
        context: {
          ...context,
          operation
        }
      }
    );
  }
}

/**
 * Error handler with logging and monitoring integration
 */
export class DocumentWorkflowErrorHandler {
  private static errorMetrics: Map<DocumentErrorCode, ErrorMetrics> = new Map();

  /**
   * Handle error with logging, monitoring, and recovery
   */
  static async handleError(
    error: DocumentWorkflowError | Error,
    context?: Partial<ErrorContext>
  ): Promise<{
    handled: boolean;
    recovered: boolean;
    actions: string[];
  }> {
    let workflowError: DocumentWorkflowError;

    // Convert to DocumentWorkflowError if needed
    if (error instanceof DocumentWorkflowError) {
      workflowError = error;
    } else {
      workflowError = new DocumentWorkflowError(
        DocumentErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        error.message,
        {
          originalError: error,
          context
        }
      );
    }

    // Log error
    await this.logError(workflowError);

    // Update metrics
    this.updateMetrics(workflowError);

    // Send monitoring alerts if needed
    await this.sendMonitoringAlert(workflowError);

    // Attempt recovery
    const recovery = await this.attemptRecovery(workflowError);

    return {
      handled: true,
      recovered: recovery.success,
      actions: recovery.actionsExecuted
    };
  }

  /**
   * Log error with structured format
   */
  private static async logError(error: DocumentWorkflowError): Promise<void> {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      level: this.getLogLevel(error.severity),
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      retryable: error.retryable,
      context: error.context,
      details: error.details,
      stack: error.stack
    };

    // Log to console (in production, this would go to proper logging service)
    console.error('DocumentWorkflowError:', JSON.stringify(logData, null, 2));

    // In production, integrate with logging services like Winston, Bunyan, or cloud logging
    // await loggingService.error(logData);
  }

  /**
   * Update error metrics
   */
  private static updateMetrics(error: DocumentWorkflowError): void {
    const existing = this.errorMetrics.get(error.code);
    const now = new Date();

    if (existing) {
      existing.count++;
      existing.lastOccurrence = now;
    } else {
      this.errorMetrics.set(error.code, {
        errorCode: error.code,
        count: 1,
        firstOccurrence: now,
        lastOccurrence: now,
        averageResolutionTime: 0,
        successfulRecoveries: 0,
        failedRecoveries: 0
      });
    }
  }

  /**
   * Send monitoring alerts for critical errors
   */
  private static async sendMonitoringAlert(error: DocumentWorkflowError): Promise<void> {
    if (error.severity === ErrorSeverity.CRITICAL) {
      // In production, integrate with monitoring services like PagerDuty, DataDog, etc.
      console.warn('CRITICAL ERROR ALERT:', {
        code: error.code,
        message: error.message,
        context: error.context,
        timestamp: error.timestamp
      });

      // Example integration:
      // await monitoringService.sendAlert({
      //   level: 'critical',
      //   title: `Critical Document Workflow Error: ${error.code}`,
      //   description: error.message,
      //   tags: [error.category, error.code],
      //   context: error.context
      // });
    }
  }

  /**
   * Attempt automated recovery
   */
  private static async attemptRecovery(error: DocumentWorkflowError): Promise<{
    success: boolean;
    actionsExecuted: string[];
  }> {
    const actionsExecuted: string[] = [];

    for (const action of error.recoveryActions) {
      if (action.automated && action.execute) {
        try {
          const success = await action.execute();
          actionsExecuted.push(action.description);

          if (success) {
            const metrics = this.errorMetrics.get(error.code);
            if (metrics) {
              metrics.successfulRecoveries++;
            }
            return { success: true, actionsExecuted };
          }
        } catch (recoveryError) {
          console.error('Recovery action failed:', recoveryError);
          const metrics = this.errorMetrics.get(error.code);
          if (metrics) {
            metrics.failedRecoveries++;
          }
        }
      }
    }

    return { success: false, actionsExecuted };
  }

  /**
   * Get log level based on error severity
   */
  private static getLogLevel(severity: ErrorSeverity): string {
    const levelMapping = {
      [ErrorSeverity.LOW]: 'info',
      [ErrorSeverity.MEDIUM]: 'warn',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'fatal'
    };

    return levelMapping[severity] || 'error';
  }

  /**
   * Get error metrics for monitoring dashboard
   */
  static getErrorMetrics(): ErrorMetrics[] {
    return Array.from(this.errorMetrics.values());
  }

  /**
   * Reset error metrics (useful for testing)
   */
  static resetMetrics(): void {
    this.errorMetrics.clear();
  }
}

/**
 * Validation utilities for common document workflow validations
 */
export class DocumentWorkflowValidator {
  /**
   * Validate employee data
   */
  static validateEmployeeData(data: any): DocumentWorkflowError[] {
    const errors: DocumentWorkflowError[] = [];

    if (!data.employeeId) {
      errors.push(DocumentWorkflowErrorFactory.createValidationError(
        'employeeId',
        data.employeeId,
        'string'
      ));
    }

    if (!data.employeeName || typeof data.employeeName !== 'string') {
      errors.push(DocumentWorkflowErrorFactory.createValidationError(
        'employeeName',
        data.employeeName,
        'string'
      ));
    }

    return errors;
  }

  /**
   * Validate payroll data
   */
  static validatePayrollData(data: any): DocumentWorkflowError[] {
    const errors: DocumentWorkflowError[] = [];

    if (typeof data.salaireBrut !== 'number' || data.salaireBrut < 0) {
      errors.push(DocumentWorkflowErrorFactory.createValidationError(
        'salaireBrut',
        data.salaireBrut,
        'positive number'
      ));
    }

    if (typeof data.salaireNet !== 'number' || data.salaireNet < 0) {
      errors.push(DocumentWorkflowErrorFactory.createValidationError(
        'salaireNet',
        data.salaireNet,
        'positive number'
      ));
    }

    if (data.salaireNet > data.salaireBrut) {
      errors.push(DocumentWorkflowErrorFactory.createBusinessLogicError(
        'salary_validation',
        'Net salary cannot be greater than gross salary'
      ));
    }

    return errors;
  }

  /**
   * Validate status transition
   */
  static validateStatusTransition(
    from: DocumentStatus,
    to: DocumentStatus
  ): DocumentWorkflowError[] {
    const errors: DocumentWorkflowError[] = [];

    if (from === to) {
      errors.push(DocumentWorkflowErrorFactory.createBusinessLogicError(
        'status_transition',
        'Cannot transition to the same status'
      ));
    }

    // Add more specific validation rules based on business logic

    return errors;
  }
}

// Export utility functions
export {
  ErrorSeverity,
  ErrorCategory,
  RecoveryStrategy,
  DocumentWorkflowErrorFactory,
  DocumentWorkflowErrorHandler,
  DocumentWorkflowValidator
};
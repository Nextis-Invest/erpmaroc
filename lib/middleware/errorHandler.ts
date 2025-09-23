/**
 * Comprehensive Error Handling and Logging System for PDF Payroll API
 * Production-ready error handling with structured logging, monitoring, and alerting
 */

import { NextRequest, NextResponse } from "next/server";
import { DocumentErrorCode } from "@/types/document-workflow";

// Error severity levels
export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

// Error categories for better organization
export enum ErrorCategory {
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  BUSINESS_LOGIC = "BUSINESS_LOGIC",
  DATABASE = "DATABASE",
  STORAGE = "STORAGE",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
  SYSTEM = "SYSTEM",
  NETWORK = "NETWORK",
  SECURITY = "SECURITY"
}

// Structured error interface
export interface StructuredError {
  id: string;
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  endpoint: string;
  method: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  details?: Record<string, any>;
  stack?: string;
  context?: {
    userAgent?: string;
    ipAddress?: string;
    referer?: string;
    correlationId?: string;
  };
  metrics?: {
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  retryable: boolean;
  suggestions?: string[];
}

// Error logging configuration
interface LoggingConfig {
  enableConsoleLogging: boolean;
  enableFileLogging: boolean;
  enableExternalLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxLogSize: number;
  retentionDays: number;
  sensitiveFields: string[];
}

const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  enableConsoleLogging: true,
  enableFileLogging: process.env.NODE_ENV === 'production',
  enableExternalLogging: process.env.NODE_ENV === 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  maxLogSize: 100 * 1024 * 1024, // 100MB
  retentionDays: 30,
  sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'authorization']
};

// Error metrics for monitoring
interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByEndpoint: Record<string, number>;
  recentErrors: StructuredError[];
  errorRate: number;
  lastReset: Date;
}

// In-memory error tracking (use Redis/Database in production)
class ErrorTracker {
  private metrics: ErrorMetrics;
  private errorHistory: StructuredError[] = [];
  private readonly MAX_HISTORY = 1000;

  constructor() {
    this.metrics = {
      totalErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      errorsByEndpoint: {},
      recentErrors: [],
      errorRate: 0,
      lastReset: new Date()
    };

    // Initialize counters
    Object.values(ErrorCategory).forEach(category => {
      this.metrics.errorsByCategory[category] = 0;
    });

    Object.values(ErrorSeverity).forEach(severity => {
      this.metrics.errorsBySeverity[severity] = 0;
    });
  }

  trackError(error: StructuredError): void {
    // Update metrics
    this.metrics.totalErrors++;
    this.metrics.errorsByCategory[error.category]++;
    this.metrics.errorsBySeverity[error.severity]++;

    const endpointKey = `${error.method} ${error.endpoint}`;
    this.metrics.errorsByEndpoint[endpointKey] = (this.metrics.errorsByEndpoint[endpointKey] || 0) + 1;

    // Add to recent errors (keep last 50)
    this.metrics.recentErrors.unshift(error);
    if (this.metrics.recentErrors.length > 50) {
      this.metrics.recentErrors = this.metrics.recentErrors.slice(0, 50);
    }

    // Add to history
    this.errorHistory.unshift(error);
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory = this.errorHistory.slice(0, this.MAX_HISTORY);
    }

    // Calculate error rate (errors per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentErrorCount = this.errorHistory.filter(e => e.timestamp > oneHourAgo).length;
    this.metrics.errorRate = recentErrorCount;

    // Check for critical alerts
    this.checkForAlerts(error);
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  getErrorHistory(limit: number = 100): StructuredError[] {
    return this.errorHistory.slice(0, limit);
  }

  reset(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      errorsByEndpoint: {},
      recentErrors: [],
      errorRate: 0,
      lastReset: new Date()
    };

    Object.values(ErrorCategory).forEach(category => {
      this.metrics.errorsByCategory[category] = 0;
    });

    Object.values(ErrorSeverity).forEach(severity => {
      this.metrics.errorsBySeverity[severity] = 0;
    });

    this.errorHistory = [];
  }

  private checkForAlerts(error: StructuredError): void {
    // Check for critical error patterns
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.sendAlert('CRITICAL_ERROR', error);
    }

    // Check for high error rate
    if (this.metrics.errorRate > 100) { // More than 100 errors per hour
      this.sendAlert('HIGH_ERROR_RATE', {
        errorRate: this.metrics.errorRate,
        recentErrors: this.metrics.recentErrors.slice(0, 5)
      });
    }

    // Check for specific error patterns
    const recentCategoryErrors = this.metrics.recentErrors
      .filter(e => e.category === error.category &&
               e.timestamp > new Date(Date.now() - 10 * 60 * 1000)) // Last 10 minutes
      .length;

    if (recentCategoryErrors > 10) {
      this.sendAlert('ERROR_SPIKE', {
        category: error.category,
        count: recentCategoryErrors,
        timeWindow: '10 minutes'
      });
    }
  }

  private sendAlert(type: string, data: any): void {
    // This would integrate with alerting systems (Slack, email, PagerDuty, etc.)
    console.error(`🚨 ALERT [${type}]:`, {
      type,
      data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

    // In production, implement actual alerting
    // Example: Send to monitoring service, Slack webhook, etc.
  }
}

// Global error tracker instance
const errorTracker = new ErrorTracker();

// Logger class with multiple outputs
class Logger {
  private config: LoggingConfig;

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = { ...DEFAULT_LOGGING_CONFIG, ...config };
  }

  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const logEntry = {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      pid: process.pid,
      environment: process.env.NODE_ENV
    };

    // Console logging
    if (this.config.enableConsoleLogging && this.shouldLog(level)) {
      this.logToConsole(level, logEntry);
    }

    // File logging (simplified - would use proper file logging in production)
    if (this.config.enableFileLogging && this.shouldLog(level)) {
      this.logToFile(logEntry);
    }

    // External service logging
    if (this.config.enableExternalLogging && this.shouldLog(level)) {
      this.logToExternalService(logEntry);
    }
  }

  error(message: string, error?: StructuredError | Error, data?: any): void {
    if (error instanceof Error) {
      const structuredError = this.createStructuredError(error, data);
      errorTracker.trackError(structuredError);
      this.log('error', message, { error: structuredError, ...data });
    } else if (error) {
      errorTracker.trackError(error);
      this.log('error', message, { error, ...data });
    } else {
      this.log('error', message, data);
    }
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= configLevelIndex;
  }

  private logToConsole(level: string, entry: any): void {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m'  // Red
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    console.log(`${color}[${entry.timestamp}] ${level.toUpperCase()}: ${entry.message}${reset}`);

    if (entry.data) {
      console.log(JSON.stringify(entry.data, null, 2));
    }
  }

  private logToFile(entry: any): void {
    // In production, use proper file logging library (winston, pino, etc.)
    // For now, just write to stdout in JSON format
    process.stdout.write(JSON.stringify(entry) + '\n');
  }

  private logToExternalService(entry: any): void {
    // This would send logs to external services (CloudWatch, Datadog, etc.)
    // For now, just simulate
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // await sendToMonitoringService(entry);
    }
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // Remove sensitive fields
    this.config.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Remove circular references
    try {
      JSON.stringify(sanitized);
      return sanitized;
    } catch (error) {
      return '[CIRCULAR_REFERENCE]';
    }
  }

  private createStructuredError(error: Error, context?: any): StructuredError {
    return {
      id: generateErrorId(),
      code: 'UNKNOWN_ERROR',
      message: error.message,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      timestamp: new Date(),
      endpoint: context?.endpoint || 'unknown',
      method: context?.method || 'unknown',
      userId: context?.userId,
      details: context,
      stack: error.stack,
      retryable: false
    };
  }
}

// Global logger instance
const logger = new Logger();

// Error response builder
export class APIError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly details?: Record<string, any>;
  public readonly suggestions?: string[];

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    retryable: boolean = false,
    details?: Record<string, any>,
    suggestions?: string[]
  ) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.category = category;
    this.severity = severity;
    this.retryable = retryable;
    this.details = details;
    this.suggestions = suggestions;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  toJSON(): any {
    return {
      error: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      retryable: this.retryable,
      details: this.details,
      suggestions: this.suggestions,
      timestamp: new Date().toISOString()
    };
  }
}

// Predefined error creators
export const ErrorCreators = {
  // Authentication errors
  unauthorized: (details?: any) => new APIError(
    "Non autorisé",
    "UNAUTHORIZED",
    401,
    ErrorCategory.AUTHENTICATION,
    ErrorSeverity.MEDIUM,
    false,
    details,
    ["Vérifiez vos identifiants", "Reconnectez-vous"]
  ),

  // Validation errors
  invalidInput: (field: string, details?: any) => new APIError(
    `Données invalides: ${field}`,
    "INVALID_INPUT",
    400,
    ErrorCategory.VALIDATION,
    ErrorSeverity.LOW,
    false,
    { field, ...details },
    [`Vérifiez le format du champ ${field}`, "Consultez la documentation de l'API"]
  ),

  // Rate limiting
  rateLimitExceeded: (retryAfter: number) => new APIError(
    "Limite de taux dépassée",
    "RATE_LIMIT_EXCEEDED",
    429,
    ErrorCategory.SECURITY,
    ErrorSeverity.MEDIUM,
    true,
    { retryAfter },
    [`Réessayez dans ${retryAfter} secondes`]
  ),

  // Database errors
  databaseError: (operation: string, details?: any) => new APIError(
    `Erreur de base de données lors de: ${operation}`,
    "DATABASE_ERROR",
    500,
    ErrorCategory.DATABASE,
    ErrorSeverity.HIGH,
    true,
    { operation, ...details },
    ["Réessayez dans quelques instants", "Contactez le support si le problème persiste"]
  ),

  // Storage errors
  storageError: (operation: string, details?: any) => new APIError(
    `Erreur de stockage lors de: ${operation}`,
    "STORAGE_ERROR",
    500,
    ErrorCategory.STORAGE,
    ErrorSeverity.HIGH,
    true,
    { operation, ...details },
    ["Vérifiez l'espace disque", "Réessayez plus tard"]
  ),

  // Document errors
  documentNotFound: (documentId: string) => new APIError(
    "Document introuvable",
    "DOCUMENT_NOT_FOUND",
    404,
    ErrorCategory.BUSINESS_LOGIC,
    ErrorSeverity.LOW,
    false,
    { documentId },
    ["Vérifiez l'ID du document", "Le document a peut-être été supprimé"]
  ),

  // Generation errors
  generationFailed: (reason: string, details?: any) => new APIError(
    `Échec de la génération: ${reason}`,
    "GENERATION_FAILED",
    500,
    ErrorCategory.BUSINESS_LOGIC,
    ErrorSeverity.HIGH,
    true,
    { reason, ...details },
    ["Vérifiez les données d'entrée", "Réessayez avec des paramètres différents"]
  )
};

// Error handling middleware
export function createErrorHandler() {
  return function errorHandler(
    error: Error | APIError,
    req: NextRequest,
    context?: any
  ): NextResponse {
    const startTime = context?.startTime || Date.now();
    const requestId = context?.requestId || generateErrorId();

    // Create structured error
    const structuredError: StructuredError = {
      id: generateErrorId(),
      code: error instanceof APIError ? error.code : 'INTERNAL_SERVER_ERROR',
      message: error.message,
      category: error instanceof APIError ? error.category : ErrorCategory.SYSTEM,
      severity: error instanceof APIError ? error.severity : ErrorSeverity.HIGH,
      timestamp: new Date(),
      endpoint: new URL(req.url).pathname,
      method: req.method,
      userId: context?.userId,
      sessionId: context?.sessionId,
      requestId,
      details: error instanceof APIError ? error.details : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      context: {
        userAgent: req.headers.get('user-agent') || undefined,
        ipAddress: req.headers.get('x-forwarded-for') ||
                   req.headers.get('x-real-ip') ||
                   req.ip ||
                   'unknown',
        referer: req.headers.get('referer') || undefined,
        correlationId: req.headers.get('x-correlation-id') || undefined
      },
      metrics: {
        duration: Date.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: process.cpuUsage().user
      },
      retryable: error instanceof APIError ? error.retryable : false,
      suggestions: error instanceof APIError ? error.suggestions : undefined
    };

    // Log the error
    logger.error('API Error occurred', structuredError, context);

    // Determine status code
    const statusCode = error instanceof APIError ? error.statusCode : 500;

    // Build response
    const responseBody: any = {
      error: structuredError.message,
      code: structuredError.code,
      requestId,
      timestamp: structuredError.timestamp.toISOString()
    };

    // Add additional fields for development
    if (process.env.NODE_ENV === 'development') {
      responseBody.details = structuredError.details;
      responseBody.stack = structuredError.stack;
      responseBody.suggestions = structuredError.suggestions;
      responseBody.category = structuredError.category;
      responseBody.severity = structuredError.severity;
    }

    // Add retry information for retryable errors
    if (structuredError.retryable) {
      responseBody.retryable = true;
      if (statusCode === 429) {
        responseBody.retryAfter = structuredError.details?.retryAfter || 60;
      }
    }

    // Add suggestions for client errors
    if (statusCode >= 400 && statusCode < 500 && structuredError.suggestions) {
      responseBody.suggestions = structuredError.suggestions;
    }

    return NextResponse.json(responseBody, { status: statusCode });
  };
}

// Error metrics API
export function getErrorMetrics(): ErrorMetrics {
  return errorTracker.getMetrics();
}

export function getErrorHistory(limit: number = 100): StructuredError[] {
  return errorTracker.getErrorHistory(limit);
}

export function resetErrorMetrics(): void {
  errorTracker.reset();
}

// Utility functions
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export logger and error tracker
export { logger, errorTracker };

// Global error handler for unhandled errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error, {
    type: 'uncaughtException',
    fatal: true
  });

  // Give time for logs to be written
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', reason as Error, {
    type: 'unhandledRejection',
    promise: promise.toString()
  });
});
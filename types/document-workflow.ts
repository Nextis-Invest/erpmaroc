/**
 * Enhanced Document Workflow Types for PDF Payroll System
 * Production-ready types with comprehensive status management and audit trails
 */

// Enhanced Document Status with workflow state machine
export enum DocumentStatus {
  // Initial states
  CALCULATION_PENDING = 'CALCULATION_PENDING',
  PREVIEW_REQUESTED = 'PREVIEW_REQUESTED',
  PREVIEW_GENERATED = 'PREVIEW_GENERATED',

  // Approval workflow
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED_FOR_GENERATION = 'APPROVED_FOR_GENERATION',

  // Generation states
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  GENERATION_FAILED = 'GENERATION_FAILED',

  // Final states
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  ARCHIVED = 'ARCHIVED'
}

// Status transition events
export enum StatusTransitionTrigger {
  USER_ACTION = 'USER_ACTION',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  SCHEDULED_EVENT = 'SCHEDULED_EVENT',
  ERROR_EVENT = 'ERROR_EVENT',
  TIMEOUT_EVENT = 'TIMEOUT_EVENT'
}

// Document types supported by the workflow
export enum DocumentType {
  BULLETIN_PAIE = 'BULLETIN_PAIE',
  ORDRE_VIREMENT = 'ORDRE_VIREMENT',
  CNSS_DECLARATION = 'CNSS_DECLARATION',
  SALARY_CERTIFICATE = 'SALARY_CERTIFICATE',
  PAYROLL_SUMMARY = 'PAYROLL_SUMMARY'
}

// Storage providers for hybrid storage
export enum StorageProvider {
  LOCAL_FILESYSTEM = 'LOCAL_FILESYSTEM',
  MONGODB_GRIDFS = 'MONGODB_GRIDFS',
  AWS_S3 = 'AWS_S3',
  CLOUDINARY = 'CLOUDINARY'
}

// Generation modes for preview vs final documents
export enum GenerationMode {
  PREVIEW = 'PREVIEW',
  FINAL = 'FINAL'
}

// Priority levels for document processing
export enum ProcessingPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Status transition definition
export interface StatusTransition {
  from: DocumentStatus;
  to: DocumentStatus;
  trigger: StatusTransitionTrigger;
  conditions?: string[];
  sideEffects?: string[];
  requiresApproval?: boolean;
  timeout?: number; // in milliseconds
}

// Complete status transition matrix
export const STATUS_TRANSITIONS: StatusTransition[] = [
  // Initial workflow
  {
    from: DocumentStatus.CALCULATION_PENDING,
    to: DocumentStatus.PREVIEW_REQUESTED,
    trigger: StatusTransitionTrigger.USER_ACTION,
    conditions: ['employee_data_valid', 'payroll_calculation_complete']
  },
  {
    from: DocumentStatus.PREVIEW_REQUESTED,
    to: DocumentStatus.PREVIEW_GENERATED,
    trigger: StatusTransitionTrigger.SYSTEM_EVENT,
    sideEffects: ['cache_preview_pdf', 'set_preview_expiry']
  },
  {
    from: DocumentStatus.PREVIEW_REQUESTED,
    to: DocumentStatus.GENERATION_FAILED,
    trigger: StatusTransitionTrigger.ERROR_EVENT,
    sideEffects: ['log_error', 'notify_admin']
  },

  // Approval workflow
  {
    from: DocumentStatus.PREVIEW_GENERATED,
    to: DocumentStatus.PENDING_APPROVAL,
    trigger: StatusTransitionTrigger.USER_ACTION,
    conditions: ['preview_viewed']
  },
  {
    from: DocumentStatus.PREVIEW_GENERATED,
    to: DocumentStatus.APPROVED_FOR_GENERATION,
    trigger: StatusTransitionTrigger.USER_ACTION,
    conditions: ['user_has_approval_rights']
  },
  {
    from: DocumentStatus.PENDING_APPROVAL,
    to: DocumentStatus.APPROVED_FOR_GENERATION,
    trigger: StatusTransitionTrigger.USER_ACTION,
    requiresApproval: true,
    conditions: ['approver_authorized']
  },
  {
    from: DocumentStatus.PENDING_APPROVAL,
    to: DocumentStatus.PREVIEW_REQUESTED,
    trigger: StatusTransitionTrigger.USER_ACTION,
    sideEffects: ['clear_preview_cache']
  },

  // Generation workflow
  {
    from: DocumentStatus.APPROVED_FOR_GENERATION,
    to: DocumentStatus.GENERATING,
    trigger: StatusTransitionTrigger.SYSTEM_EVENT,
    sideEffects: ['queue_generation_job', 'clear_preview_cache']
  },
  {
    from: DocumentStatus.GENERATING,
    to: DocumentStatus.GENERATED,
    trigger: StatusTransitionTrigger.SYSTEM_EVENT,
    sideEffects: ['save_final_document', 'notify_stakeholders']
  },
  {
    from: DocumentStatus.GENERATING,
    to: DocumentStatus.GENERATION_FAILED,
    trigger: StatusTransitionTrigger.ERROR_EVENT,
    timeout: 30000, // 30 seconds
    sideEffects: ['log_error', 'retry_generation', 'notify_admin']
  },

  // Final workflow
  {
    from: DocumentStatus.GENERATED,
    to: DocumentStatus.APPROVED,
    trigger: StatusTransitionTrigger.USER_ACTION,
    requiresApproval: true,
    conditions: ['document_quality_verified']
  },
  {
    from: DocumentStatus.GENERATED,
    to: DocumentStatus.ARCHIVED,
    trigger: StatusTransitionTrigger.USER_ACTION,
    conditions: ['user_has_archive_rights']
  },
  {
    from: DocumentStatus.APPROVED,
    to: DocumentStatus.SENT,
    trigger: StatusTransitionTrigger.USER_ACTION,
    sideEffects: ['send_to_employee', 'log_distribution']
  },
  {
    from: DocumentStatus.APPROVED,
    to: DocumentStatus.ARCHIVED,
    trigger: StatusTransitionTrigger.USER_ACTION
  },
  {
    from: DocumentStatus.SENT,
    to: DocumentStatus.ARCHIVED,
    trigger: StatusTransitionTrigger.SCHEDULED_EVENT,
    timeout: 2592000000 // 30 days
  },

  // Error recovery
  {
    from: DocumentStatus.GENERATION_FAILED,
    to: DocumentStatus.PREVIEW_REQUESTED,
    trigger: StatusTransitionTrigger.USER_ACTION,
    conditions: ['error_resolved']
  },
  {
    from: DocumentStatus.GENERATION_FAILED,
    to: DocumentStatus.ARCHIVED,
    trigger: StatusTransitionTrigger.USER_ACTION,
    conditions: ['permanent_failure_confirmed']
  }
];

// File storage information
export interface FileStorageInfo {
  provider: StorageProvider;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  bucketName?: string; // for cloud storage
  region?: string; // for cloud storage
  encryptionKey?: string; // for encrypted storage
}

// Generation configuration
export interface GenerationConfig {
  mode: GenerationMode;
  quality: 'low' | 'medium' | 'high' | 'print';
  resolution: number; // DPI
  watermark?: string;
  includeMetadata: boolean;
  includeDigitalSignature: boolean;
  compressionLevel: number; // 0-9
}

// Preview configuration
export interface PreviewConfig {
  expiryTime: number; // in milliseconds
  reducedSections: boolean;
  watermarkText: string;
  maxFileSize: number; // in bytes
  cacheKey: string;
}

// Document metadata for MongoDB storage
export interface PayrollDocumentMetadata {
  _id?: string;
  documentId: string;
  documentType: DocumentType;

  // Employee information
  employeeId: string;
  employeeName: string;
  employeeCode?: string;

  // Period information
  periodId: string;
  periodYear: number;
  periodMonth: number;
  periodLabel: string;

  // Status management
  status: DocumentStatus;
  statusHistory: StatusChangeAudit[];

  // File information
  fileInfo?: FileStorageInfo;

  // Generation metadata
  generationInfo: {
    mode: GenerationMode;
    config: GenerationConfig;
    generatedAt: Date;
    generatedBy: string;
    processingTime: number; // in milliseconds
    retryCount: number;
  };

  // Preview information
  previewInfo?: {
    config: PreviewConfig;
    generatedAt: Date;
    expiresAt: Date;
    viewedAt?: Date;
    downloadCount: number;
  };

  // Business context
  payrollData: {
    salaireBrut: number;
    salaireNet: number;
    totalDeductions: number;
    totalAllowances: number;
    employerCharges: number;
    cnssEmployee: number;
    cnssEmployer: number;
    incomeTax: number;
  };

  // Approval workflow
  approvalInfo?: {
    requestedBy: string;
    requestedAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    approvalComments?: string;
    rejectionReason?: string;
  };

  // Distribution tracking
  distributionInfo?: {
    sentAt?: Date;
    sentBy?: string;
    sentTo: string[];
    deliveryMethod: 'EMAIL' | 'PORTAL' | 'PRINT' | 'DOWNLOAD';
    deliveryStatus: 'PENDING' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
    trackingId?: string;
  };

  // System metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;

  // Branch and company info
  branchId?: string;
  companyId?: string;

  // Tags and categorization
  tags: string[];
  category?: string;
  priority: ProcessingPriority;

  // Error tracking
  errorInfo?: {
    lastError?: string;
    errorCount: number;
    lastErrorAt?: Date;
    recoveryAttempts: number;
  };

  // Performance metrics
  metrics?: {
    generationTime: number;
    previewTime?: number;
    fileSize: number;
    cacheHits: number;
    downloadCount: number;
  };
}

// Status change audit trail
export interface StatusChangeAudit {
  _id?: string;
  documentId: string;

  // Transition details
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  trigger: StatusTransitionTrigger;

  // User and timestamp
  changedBy: string;
  changedAt: Date;

  // Context and metadata
  reason?: string;
  comments?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;

  // Additional data
  metadata?: Record<string, any>;

  // System context
  systemVersion?: string;
  requestId?: string;

  // Approval context
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;

  // Error context
  errorDetails?: {
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    retryable: boolean;
  };

  // Performance context
  processingTime?: number;

  // Business context
  businessImpact?: {
    critical: boolean;
    affectedUsers: string[];
    estimatedRevenue?: number;
  };
}

// Batch operation for multiple documents
export interface BatchDocumentOperation {
  operationId: string;
  operationType: 'GENERATE' | 'APPROVE' | 'SEND' | 'ARCHIVE' | 'DELETE';

  // Selection criteria
  criteria: {
    employeeIds?: string[];
    periodIds?: string[];
    documentTypes?: DocumentType[];
    statuses?: DocumentStatus[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };

  // Operation parameters
  parameters: Record<string, any>;

  // Progress tracking
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalDocuments: number;
  processedDocuments: number;
  successfulDocuments: number;
  failedDocuments: number;

  // Timestamps
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;

  // User context
  initiatedBy: string;

  // Error tracking
  errors: Array<{
    documentId: string;
    errorMessage: string;
    errorCode: string;
    retryable: boolean;
  }>;

  // Results
  results?: Array<{
    documentId: string;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    resultData?: any;
    errorMessage?: string;
  }>;
}

// Error types and codes
export enum DocumentErrorCode {
  // Validation errors
  INVALID_EMPLOYEE_DATA = 'INVALID_EMPLOYEE_DATA',
  INVALID_PAYROLL_DATA = 'INVALID_PAYROLL_DATA',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',

  // Generation errors
  PDF_GENERATION_FAILED = 'PDF_GENERATION_FAILED',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  MEMORY_INSUFFICIENT = 'MEMORY_INSUFFICIENT',
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',

  // Storage errors
  STORAGE_WRITE_FAILED = 'STORAGE_WRITE_FAILED',
  STORAGE_READ_FAILED = 'STORAGE_READ_FAILED',
  STORAGE_SPACE_INSUFFICIENT = 'STORAGE_SPACE_INSUFFICIENT',
  STORAGE_PERMISSION_DENIED = 'STORAGE_PERMISSION_DENIED',

  // Status errors
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  UNAUTHORIZED_STATUS_CHANGE = 'UNAUTHORIZED_STATUS_CHANGE',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',

  // System errors
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  CACHE_UNAVAILABLE = 'CACHE_UNAVAILABLE',
  EXTERNAL_SERVICE_UNAVAILABLE = 'EXTERNAL_SERVICE_UNAVAILABLE',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

// Document error interface
export interface DocumentError {
  code: DocumentErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  documentId?: string;
  userId?: string;
  retryable: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context?: {
    operation: string;
    component: string;
    version: string;
    environment: string;
  };
}

// Service configuration interfaces
export interface DocumentWorkflowConfig {
  // Storage configuration
  storage: {
    primaryProvider: StorageProvider;
    fallbackProvider?: StorageProvider;
    fileSystemPath?: string;
    s3Config?: {
      region: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
    cloudinaryConfig?: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
    };
  };

  // Generation configuration
  generation: {
    defaultQuality: 'medium' | 'high' | 'print';
    defaultResolution: number;
    maxFileSize: number;
    timeout: number;
    retryAttempts: number;
    concurrentJobs: number;
  };

  // Preview configuration
  preview: {
    defaultExpiryTime: number;
    maxCacheSize: number;
    watermarkText: string;
    reducedQuality: boolean;
  };

  // Workflow configuration
  workflow: {
    autoApprovalThreshold?: number;
    mandatoryApprovalRoles: string[];
    notificationSettings: {
      emailEnabled: boolean;
      smsEnabled: boolean;
      webhookUrl?: string;
    };
  };

  // Performance configuration
  performance: {
    cacheTTL: number;
    batchSize: number;
    workerThreads: number;
    memoryLimit: number;
  };

  // Security configuration
  security: {
    encryptionEnabled: boolean;
    encryptionAlgorithm: string;
    digitaSignatureEnabled: boolean;
    accessLoggingEnabled: boolean;
    auditRetentionDays: number;
  };
}

// Type guards for status validation
export function isValidStatusTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  return STATUS_TRANSITIONS.some(
    transition => transition.from === from && transition.to === to
  );
}

export function getValidNextStatuses(currentStatus: DocumentStatus): DocumentStatus[] {
  return STATUS_TRANSITIONS
    .filter(transition => transition.from === currentStatus)
    .map(transition => transition.to);
}

export function getStatusTransition(from: DocumentStatus, to: DocumentStatus): StatusTransition | undefined {
  return STATUS_TRANSITIONS.find(
    transition => transition.from === from && transition.to === to
  );
}

// Status display helpers
export function getStatusDisplayText(status: DocumentStatus): string {
  const statusTexts: Record<DocumentStatus, string> = {
    [DocumentStatus.CALCULATION_PENDING]: 'Calcul en attente',
    [DocumentStatus.PREVIEW_REQUESTED]: 'Prévisualisation demandée',
    [DocumentStatus.PREVIEW_GENERATED]: 'Prévisualisation générée',
    [DocumentStatus.PENDING_APPROVAL]: 'En attente d\'approbation',
    [DocumentStatus.APPROVED_FOR_GENERATION]: 'Approuvé pour génération',
    [DocumentStatus.GENERATING]: 'Génération en cours',
    [DocumentStatus.GENERATED]: 'Généré',
    [DocumentStatus.GENERATION_FAILED]: 'Échec de génération',
    [DocumentStatus.APPROVED]: 'Approuvé',
    [DocumentStatus.SENT]: 'Envoyé',
    [DocumentStatus.ARCHIVED]: 'Archivé'
  };

  return statusTexts[status] || status;
}

export function getStatusColor(status: DocumentStatus): string {
  const statusColors: Record<DocumentStatus, string> = {
    [DocumentStatus.CALCULATION_PENDING]: 'gray',
    [DocumentStatus.PREVIEW_REQUESTED]: 'blue',
    [DocumentStatus.PREVIEW_GENERATED]: 'cyan',
    [DocumentStatus.PENDING_APPROVAL]: 'yellow',
    [DocumentStatus.APPROVED_FOR_GENERATION]: 'orange',
    [DocumentStatus.GENERATING]: 'purple',
    [DocumentStatus.GENERATED]: 'green',
    [DocumentStatus.GENERATION_FAILED]: 'red',
    [DocumentStatus.APPROVED]: 'emerald',
    [DocumentStatus.SENT]: 'indigo',
    [DocumentStatus.ARCHIVED]: 'gray'
  };

  return statusColors[status] || 'gray';
}
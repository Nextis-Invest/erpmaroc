/**
 * PayrollDocumentMetadata MongoDB Model
 * Enhanced model with comprehensive schema validation, indexing, and business logic
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  DocumentStatus,
  DocumentType,
  StorageProvider,
  GenerationMode,
  ProcessingPriority,
  PayrollDocumentMetadata as IPayrollDocumentMetadata,
  StatusChangeAudit,
  FileStorageInfo
} from '@/types/document-workflow';

// Extend the interface to include Mongoose document methods
interface PayrollDocumentMetadataDocument extends IPayrollDocumentMetadata, Document {
  // Instance methods
  transitionTo(newStatus: DocumentStatus, userId: string, reason?: string): Promise<PayrollDocumentMetadataDocument>;
  addToStatusHistory(audit: StatusChangeAudit): Promise<PayrollDocumentMetadataDocument>;
  markAsViewed(userId: string): Promise<PayrollDocumentMetadataDocument>;
  incrementDownloadCount(): Promise<PayrollDocumentMetadataDocument>;
  updateMetrics(metrics: Record<string, any>): Promise<PayrollDocumentMetadataDocument>;
  softDelete(userId: string, reason?: string): Promise<PayrollDocumentMetadataDocument>;
  clone(newDocumentId: string): Promise<PayrollDocumentMetadataDocument>;

  // Virtual properties
  isPreviewExpired: boolean;
  canBeDeleted: boolean;
  statusDisplayText: string;
  statusColor: string;
  fileSizeFormatted: string;
  downloadFilename: string;
  processingTimeFormatted: string;
}

// Static methods interface
interface PayrollDocumentMetadataModel extends Model<PayrollDocumentMetadataDocument> {
  // Static methods
  findByDocumentId(documentId: string): Promise<PayrollDocumentMetadataDocument | null>;
  findByEmployee(employeeId: string, options?: {
    limit?: number;
    status?: DocumentStatus;
    documentType?: DocumentType;
    dateRange?: { from: Date; to: Date };
  }): Promise<PayrollDocumentMetadataDocument[]>;
  findByPeriod(periodYear: number, periodMonth?: number, options?: {
    status?: DocumentStatus;
    documentType?: DocumentType;
    employeeIds?: string[];
  }): Promise<PayrollDocumentMetadataDocument[]>;
  findByStatus(status: DocumentStatus, options?: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    documents: PayrollDocumentMetadataDocument[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  findExpiredPreviews(): Promise<PayrollDocumentMetadataDocument[]>;
  getStatistics(filters?: Record<string, any>): Promise<{
    totalDocuments: number;
    documentsByStatus: Record<string, number>;
    documentsByType: Record<string, number>;
    totalFileSize: number;
    averageFileSize: number;
    averageProcessingTime: number;
  }>;
  createNewDocument(data: Partial<IPayrollDocumentMetadata>): Promise<PayrollDocumentMetadataDocument>;
  bulkUpdateStatus(filter: Record<string, any>, newStatus: DocumentStatus, userId: string): Promise<{
    modifiedCount: number;
    matchedCount: number;
  }>;
  cleanup(retentionDays?: number): Promise<{
    deletedCount: number;
    errors: string[];
  }>;
}

// File storage info sub-schema
const fileStorageInfoSchema = new Schema({
  provider: {
    type: String,
    enum: Object.values(StorageProvider),
    required: true
  },
  filePath: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    default: 'application/pdf'
  },
  checksum: {
    type: String,
    required: true,
    match: /^[a-f0-9]{64}$/i // SHA-256 checksum format
  },
  bucketName: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  encryptionKey: {
    type: String,
    select: false // Never include in queries by default
  }
}, { _id: false });

// Generation info sub-schema
const generationInfoSchema = new Schema({
  mode: {
    type: String,
    enum: Object.values(GenerationMode),
    required: true
  },
  config: {
    mode: {
      type: String,
      enum: Object.values(GenerationMode),
      required: true
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'print'],
      default: 'medium'
    },
    resolution: {
      type: Number,
      default: 150,
      min: 72,
      max: 600
    },
    watermark: String,
    includeMetadata: {
      type: Boolean,
      default: true
    },
    includeDigitalSignature: {
      type: Boolean,
      default: false
    },
    compressionLevel: {
      type: Number,
      default: 5,
      min: 0,
      max: 9
    }
  },
  generatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  generatedBy: {
    type: String,
    required: true
  },
  processingTime: {
    type: Number,
    required: true,
    min: 0
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Preview info sub-schema
const previewInfoSchema = new Schema({
  config: {
    expiryTime: {
      type: Number,
      required: true,
      default: 3600000 // 1 hour
    },
    reducedSections: {
      type: Boolean,
      default: true
    },
    watermarkText: {
      type: String,
      default: 'APERÇU - NON OFFICIEL'
    },
    maxFileSize: {
      type: Number,
      default: 5242880 // 5MB
    },
    cacheKey: {
      type: String,
      required: true
    }
  },
  generatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  viewedAt: Date,
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Payroll data sub-schema
const payrollDataSchema = new Schema({
  salaireBrut: {
    type: Number,
    required: true,
    min: 0
  },
  salaireNet: {
    type: Number,
    required: true,
    min: 0
  },
  totalDeductions: {
    type: Number,
    required: true,
    min: 0
  },
  totalAllowances: {
    type: Number,
    required: true,
    min: 0
  },
  employerCharges: {
    type: Number,
    required: true,
    min: 0
  },
  cnssEmployee: {
    type: Number,
    required: true,
    min: 0
  },
  cnssEmployer: {
    type: Number,
    required: true,
    min: 0
  },
  incomeTax: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Approval info sub-schema
const approvalInfoSchema = new Schema({
  requestedBy: {
    type: String,
    required: true
  },
  requestedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  approvedBy: String,
  approvedAt: Date,
  approvalComments: {
    type: String,
    maxlength: 1000
  },
  rejectionReason: {
    type: String,
    maxlength: 1000
  }
}, { _id: false });

// Distribution info sub-schema
const distributionInfoSchema = new Schema({
  sentAt: Date,
  sentBy: String,
  sentTo: [{
    type: String,
    validate: {
      validator: function(email: string) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Invalid email address'
    }
  }],
  deliveryMethod: {
    type: String,
    enum: ['EMAIL', 'PORTAL', 'PRINT', 'DOWNLOAD'],
    default: 'EMAIL'
  },
  deliveryStatus: {
    type: String,
    enum: ['PENDING', 'DELIVERED', 'FAILED', 'BOUNCED'],
    default: 'PENDING'
  },
  trackingId: String
}, { _id: false });

// Error info sub-schema
const errorInfoSchema = new Schema({
  lastError: {
    type: String,
    maxlength: 2000
  },
  errorCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastErrorAt: Date,
  recoveryAttempts: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Metrics sub-schema
const metricsSchema = new Schema({
  generationTime: {
    type: Number,
    required: true,
    min: 0
  },
  previewTime: Number,
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  cacheHits: {
    type: Number,
    default: 0,
    min: 0
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Main schema definition
const payrollDocumentMetadataSchema = new Schema<PayrollDocumentMetadataDocument>({
  documentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9_-]+$/
  },
  documentType: {
    type: String,
    enum: Object.values(DocumentType),
    required: true
  },

  // Employee information
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  employeeCode: {
    type: String,
    trim: true,
    maxlength: 50
  },

  // Period information
  periodId: {
    type: String,
    required: true,
    trim: true
  },
  periodYear: {
    type: Number,
    required: true,
    min: 2020,
    max: 2050
  },
  periodMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  periodLabel: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  // Status management
  status: {
    type: String,
    enum: Object.values(DocumentStatus),
    required: true,
    default: DocumentStatus.CALCULATION_PENDING
  },
  statusHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'StatusChangeAudit'
  }],

  // File information
  fileInfo: fileStorageInfoSchema,

  // Generation metadata
  generationInfo: {
    type: generationInfoSchema,
    required: true
  },

  // Preview information
  previewInfo: previewInfoSchema,

  // Business context
  payrollData: {
    type: payrollDataSchema,
    required: true
  },

  // Approval workflow
  approvalInfo: approvalInfoSchema,

  // Distribution tracking
  distributionInfo: distributionInfoSchema,

  // System metadata
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true,
    immutable: true
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: String,

  // Branch and company info
  branchId: {
    type: String,
    trim: true
  },
  companyId: {
    type: String,
    trim: true
  },

  // Tags and categorization
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  category: {
    type: String,
    trim: true,
    maxlength: 100
  },
  priority: {
    type: String,
    enum: Object.values(ProcessingPriority),
    default: ProcessingPriority.NORMAL
  },

  // Error tracking
  errorInfo: errorInfoSchema,

  // Performance metrics
  metrics: metricsSchema

}, {
  timestamps: true,
  collection: 'payroll_document_metadata',
  versionKey: false
});

// Indexes for performance optimization
payrollDocumentMetadataSchema.index({ documentId: 1 }, { unique: true });
payrollDocumentMetadataSchema.index({ employeeId: 1, periodYear: 1, periodMonth: 1 });
payrollDocumentMetadataSchema.index({ documentType: 1, status: 1 });
payrollDocumentMetadataSchema.index({ status: 1, priority: 1 });
payrollDocumentMetadataSchema.index({ createdAt: -1 });
payrollDocumentMetadataSchema.index({ updatedAt: -1 });
payrollDocumentMetadataSchema.index({ isDeleted: 1, deletedAt: 1 });
payrollDocumentMetadataSchema.index({ branchId: 1, companyId: 1 });

// Compound indexes for common queries
payrollDocumentMetadataSchema.index({
  employeeId: 1,
  documentType: 1,
  status: 1,
  periodYear: -1,
  periodMonth: -1
});
payrollDocumentMetadataSchema.index({
  status: 1,
  createdAt: -1,
  priority: 1
});
payrollDocumentMetadataSchema.index({
  'previewInfo.expiresAt': 1,
  status: 1
}); // For cleanup expired previews

// Text index for search functionality
payrollDocumentMetadataSchema.index({
  employeeName: 'text',
  employeeCode: 'text',
  periodLabel: 'text',
  tags: 'text'
});

// Pre-save middleware
payrollDocumentMetadataSchema.pre('save', function(next) {
  // Always update the updatedAt field
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }

  // Auto-generate period label if not provided
  if (!this.periodLabel && this.periodMonth && this.periodYear) {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    this.periodLabel = `${months[this.periodMonth - 1]} ${this.periodYear}`;
  }

  // Set preview expiry if preview info exists
  if (this.previewInfo && !this.previewInfo.expiresAt) {
    this.previewInfo.expiresAt = new Date(
      this.previewInfo.generatedAt.getTime() + this.previewInfo.config.expiryTime
    );
  }

  // Validate business rules
  if (this.payrollData.salaireNet > this.payrollData.salaireBrut) {
    next(new Error('Net salary cannot be greater than gross salary'));
    return;
  }

  next();
});

// Post-save middleware for audit logging
payrollDocumentMetadataSchema.post('save', function(doc) {
  console.log(`Document ${doc.documentId} saved with status ${doc.status}`);
});

// Virtual properties
payrollDocumentMetadataSchema.virtual('isPreviewExpired').get(function() {
  if (!this.previewInfo) return false;
  return new Date() > this.previewInfo.expiresAt;
});

payrollDocumentMetadataSchema.virtual('canBeDeleted').get(function() {
  const deletableStatuses = [
    DocumentStatus.GENERATED,
    DocumentStatus.APPROVED,
    DocumentStatus.SENT,
    DocumentStatus.ARCHIVED
  ];
  return deletableStatuses.includes(this.status);
});

payrollDocumentMetadataSchema.virtual('statusDisplayText').get(function() {
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
  return statusTexts[this.status] || this.status;
});

payrollDocumentMetadataSchema.virtual('statusColor').get(function() {
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
  return statusColors[this.status] || 'gray';
});

payrollDocumentMetadataSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.fileInfo) return '0 Bytes';

  const bytes = this.fileInfo.fileSize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

payrollDocumentMetadataSchema.virtual('downloadFilename').get(function() {
  const employeeName = this.employeeName.replace(/\s+/g, '_');
  const docType = this.documentType.toLowerCase();
  const extension = this.fileInfo?.mimeType === 'application/pdf' ? '.pdf' : '';

  return `${docType}_${employeeName}_${this.periodLabel.replace(/\s+/g, '_')}${extension}`;
});

payrollDocumentMetadataSchema.virtual('processingTimeFormatted').get(function() {
  if (!this.generationInfo?.processingTime) return '0ms';

  const ms = this.generationInfo.processingTime;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;

  return `${(ms / 60000).toFixed(1)}min`;
});

// Instance methods
payrollDocumentMetadataSchema.methods.transitionTo = async function(
  newStatus: DocumentStatus,
  userId: string,
  reason?: string
): Promise<PayrollDocumentMetadataDocument> {
  this.status = newStatus;

  // Add status-specific updates
  switch (newStatus) {
    case DocumentStatus.APPROVED:
      if (!this.approvalInfo) {
        this.approvalInfo = { requestedBy: userId, requestedAt: new Date() };
      }
      this.approvalInfo.approvedBy = userId;
      this.approvalInfo.approvedAt = new Date();
      break;

    case DocumentStatus.SENT:
      if (!this.distributionInfo) {
        this.distributionInfo = {
          sentTo: [],
          deliveryMethod: 'EMAIL',
          deliveryStatus: 'PENDING'
        };
      }
      this.distributionInfo.sentBy = userId;
      this.distributionInfo.sentAt = new Date();
      break;
  }

  return await this.save();
};

payrollDocumentMetadataSchema.methods.addToStatusHistory = async function(
  audit: StatusChangeAudit
): Promise<PayrollDocumentMetadataDocument> {
  if (!this.statusHistory) {
    this.statusHistory = [];
  }
  this.statusHistory.push(audit._id as any);
  return await this.save();
};

payrollDocumentMetadataSchema.methods.markAsViewed = async function(
  userId: string
): Promise<PayrollDocumentMetadataDocument> {
  if (this.previewInfo) {
    this.previewInfo.viewedAt = new Date();
  }
  return await this.save();
};

payrollDocumentMetadataSchema.methods.incrementDownloadCount = async function(): Promise<PayrollDocumentMetadataDocument> {
  if (this.previewInfo) {
    this.previewInfo.downloadCount += 1;
  }
  if (this.metrics) {
    this.metrics.downloadCount += 1;
  }
  return await this.save();
};

payrollDocumentMetadataSchema.methods.updateMetrics = async function(
  metrics: Record<string, any>
): Promise<PayrollDocumentMetadataDocument> {
  if (!this.metrics) {
    this.metrics = {
      generationTime: 0,
      fileSize: 0,
      cacheHits: 0,
      downloadCount: 0
    };
  }

  Object.assign(this.metrics, metrics);
  return await this.save();
};

payrollDocumentMetadataSchema.methods.softDelete = async function(
  userId: string,
  reason?: string
): Promise<PayrollDocumentMetadataDocument> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;

  if (reason) {
    if (!this.errorInfo) {
      this.errorInfo = { errorCount: 0, recoveryAttempts: 0 };
    }
    this.errorInfo.lastError = reason;
  }

  return await this.save();
};

payrollDocumentMetadataSchema.methods.clone = async function(
  newDocumentId: string
): Promise<PayrollDocumentMetadataDocument> {
  const clonedData = this.toObject();
  delete clonedData._id;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;
  delete clonedData.statusHistory;
  delete clonedData.fileInfo;
  delete clonedData.previewInfo;

  clonedData.documentId = newDocumentId;
  clonedData.status = DocumentStatus.CALCULATION_PENDING;
  clonedData.version = 1;

  return await PayrollDocumentMetadata.create(clonedData);
};

// Static methods
payrollDocumentMetadataSchema.statics.findByDocumentId = async function(
  documentId: string
): Promise<PayrollDocumentMetadataDocument | null> {
  return await this.findOne({ documentId, isDeleted: false });
};

payrollDocumentMetadataSchema.statics.findByEmployee = async function(
  employeeId: string,
  options: {
    limit?: number;
    status?: DocumentStatus;
    documentType?: DocumentType;
    dateRange?: { from: Date; to: Date };
  } = {}
): Promise<PayrollDocumentMetadataDocument[]> {
  const query: any = { employeeId, isDeleted: false };

  if (options.status) {
    query.status = options.status;
  }

  if (options.documentType) {
    query.documentType = options.documentType;
  }

  if (options.dateRange) {
    query.createdAt = {
      $gte: options.dateRange.from,
      $lte: options.dateRange.to
    };
  }

  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

payrollDocumentMetadataSchema.statics.findByPeriod = async function(
  periodYear: number,
  periodMonth?: number,
  options: {
    status?: DocumentStatus;
    documentType?: DocumentType;
    employeeIds?: string[];
  } = {}
): Promise<PayrollDocumentMetadataDocument[]> {
  const query: any = { periodYear, isDeleted: false };

  if (periodMonth) {
    query.periodMonth = periodMonth;
  }

  if (options.status) {
    query.status = options.status;
  }

  if (options.documentType) {
    query.documentType = options.documentType;
  }

  if (options.employeeIds && options.employeeIds.length > 0) {
    query.employeeId = { $in: options.employeeIds };
  }

  return await this.find(query).sort({ createdAt: -1 });
};

payrollDocumentMetadataSchema.statics.findByStatus = async function(
  status: DocumentStatus,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{
  documents: PayrollDocumentMetadataDocument[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const {
    page = 1,
    limit = 20,
    sortBy = 'updatedAt',
    sortOrder = 'desc'
  } = options;

  const query = { status, isDeleted: false };
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    this.find(query).sort(sort).skip(skip).limit(limit),
    this.countDocuments(query)
  ]);

  return {
    documents,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

payrollDocumentMetadataSchema.statics.findExpiredPreviews = async function(): Promise<PayrollDocumentMetadataDocument[]> {
  return await this.find({
    'previewInfo.expiresAt': { $lt: new Date() },
    status: DocumentStatus.PREVIEW_GENERATED,
    isDeleted: false
  });
};

payrollDocumentMetadataSchema.statics.getStatistics = async function(
  filters: Record<string, any> = {}
): Promise<{
  totalDocuments: number;
  documentsByStatus: Record<string, number>;
  documentsByType: Record<string, number>;
  totalFileSize: number;
  averageFileSize: number;
  averageProcessingTime: number;
}> {
  const baseQuery = { isDeleted: false, ...filters };

  const pipeline = [
    { $match: baseQuery },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        documentsByStatus: { $push: '$status' },
        documentsByType: { $push: '$documentType' },
        totalFileSize: { $sum: '$fileInfo.fileSize' },
        averageFileSize: { $avg: '$fileInfo.fileSize' },
        averageProcessingTime: { $avg: '$generationInfo.processingTime' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);

  if (result.length === 0) {
    return {
      totalDocuments: 0,
      documentsByStatus: {},
      documentsByType: {},
      totalFileSize: 0,
      averageFileSize: 0,
      averageProcessingTime: 0
    };
  }

  const stats = result[0];

  // Process status counts
  const documentsByStatus: Record<string, number> = {};
  stats.documentsByStatus?.forEach((status: string) => {
    documentsByStatus[status] = (documentsByStatus[status] || 0) + 1;
  });

  // Process type counts
  const documentsByType: Record<string, number> = {};
  stats.documentsByType?.forEach((type: string) => {
    documentsByType[type] = (documentsByType[type] || 0) + 1;
  });

  return {
    totalDocuments: stats.totalDocuments || 0,
    documentsByStatus,
    documentsByType,
    totalFileSize: stats.totalFileSize || 0,
    averageFileSize: stats.averageFileSize || 0,
    averageProcessingTime: stats.averageProcessingTime || 0
  };
};

payrollDocumentMetadataSchema.statics.createNewDocument = async function(
  data: Partial<IPayrollDocumentMetadata>
): Promise<PayrollDocumentMetadataDocument> {
  // Generate document ID if not provided
  if (!data.documentId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    data.documentId = `DOC-${timestamp}-${random}`;
  }

  // Set defaults
  const documentData = {
    status: DocumentStatus.CALCULATION_PENDING,
    version: 1,
    priority: ProcessingPriority.NORMAL,
    tags: [],
    ...data
  };

  return await this.create(documentData);
};

payrollDocumentMetadataSchema.statics.bulkUpdateStatus = async function(
  filter: Record<string, any>,
  newStatus: DocumentStatus,
  userId: string
): Promise<{
  modifiedCount: number;
  matchedCount: number;
}> {
  const result = await this.updateMany(
    { ...filter, isDeleted: false },
    {
      $set: {
        status: newStatus,
        updatedAt: new Date()
      }
    }
  );

  return {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount
  };
};

payrollDocumentMetadataSchema.statics.cleanup = async function(
  retentionDays: number = 2555 // 7 years
): Promise<{
  deletedCount: number;
  errors: string[];
}> {
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const errors: string[] = [];

  try {
    const result = await this.updateMany(
      {
        createdAt: { $lt: cutoffDate },
        status: DocumentStatus.ARCHIVED,
        isDeleted: false
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: 'system-cleanup'
        }
      }
    );

    return {
      deletedCount: result.modifiedCount,
      errors
    };
  } catch (error) {
    errors.push(`Cleanup failed: ${error.message}`);
    return { deletedCount: 0, errors };
  }
};

// Create and export the model
const PayrollDocumentMetadata = mongoose.model<PayrollDocumentMetadataDocument, PayrollDocumentMetadataModel>(
  'PayrollDocumentMetadata',
  payrollDocumentMetadataSchema
);

export default PayrollDocumentMetadata;
export type { PayrollDocumentMetadataDocument, PayrollDocumentMetadataModel };
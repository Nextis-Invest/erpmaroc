/**
 * StatusChangeAudit MongoDB Model
 * Comprehensive audit trail model for tracking all document status transitions
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  DocumentStatus,
  StatusTransitionTrigger,
  StatusChangeAudit as IStatusChangeAudit
} from '@/types/document-workflow';

// Extend the interface to include Mongoose document methods
interface StatusChangeAuditDocument extends IStatusChangeAudit, Document {
  // Instance methods
  addBusinessContext(context: {
    critical: boolean;
    affectedUsers: string[];
    estimatedRevenue?: number;
  }): Promise<StatusChangeAuditDocument>;

  addErrorDetails(error: {
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    retryable: boolean;
  }): Promise<StatusChangeAuditDocument>;

  markAsProcessed(processingTime: number): Promise<StatusChangeAuditDocument>;

  // Virtual properties
  formattedTimestamp: string;
  timeAgo: string;
  statusTransitionText: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRecent: boolean;
}

// Static methods interface
interface StatusChangeAuditModel extends Model<StatusChangeAuditDocument> {
  // Static methods
  findByDocumentId(documentId: string, options?: {
    limit?: number;
    page?: number;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    audits: StatusChangeAuditDocument[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  findByUser(userId: string, options?: {
    limit?: number;
    dateRange?: { from: Date; to: Date };
    documentTypes?: string[];
  }): Promise<StatusChangeAuditDocument[]>;

  findByStatusTransition(
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    options?: {
      limit?: number;
      dateRange?: { from: Date; to: Date };
    }
  ): Promise<StatusChangeAuditDocument[]>;

  getAuditStatistics(filters?: {
    dateRange?: { from: Date; to: Date };
    documentId?: string;
    userId?: string;
  }): Promise<{
    totalTransitions: number;
    transitionsByTrigger: Record<string, number>;
    transitionsByUser: Record<string, number>;
    transitionsByStatus: Record<string, number>;
    averageProcessingTime: number;
    errorRate: number;
    criticalTransitions: number;
  }>;

  findCriticalTransitions(options?: {
    limit?: number;
    dateRange?: { from: Date; to: Date };
  }): Promise<StatusChangeAuditDocument[]>;

  findErrorTransitions(options?: {
    limit?: number;
    dateRange?: { from: Date; to: Date };
    retryableOnly?: boolean;
  }): Promise<StatusChangeAuditDocument[]>;

  findTransitionsByTimeRange(
    timeRange: { from: Date; to: Date },
    options?: {
      groupBy?: 'hour' | 'day' | 'week' | 'month';
      limit?: number;
    }
  ): Promise<Array<{
    period: string;
    count: number;
    transitions: StatusChangeAuditDocument[];
  }>>;

  createAuditEntry(data: Partial<IStatusChangeAudit>): Promise<StatusChangeAuditDocument>;

  findDuplicateTransitions(
    documentId: string,
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    timeWindow: number // in milliseconds
  ): Promise<StatusChangeAuditDocument[]>;

  cleanup(retentionDays?: number): Promise<{
    deletedCount: number;
    errors: string[];
  }>;

  exportAuditTrail(filters: {
    documentIds?: string[];
    userIds?: string[];
    dateRange?: { from: Date; to: Date };
    format?: 'json' | 'csv';
  }): Promise<{
    data: any[];
    totalRecords: number;
    exportedAt: Date;
  }>;
}

// Error details sub-schema
const errorDetailsSchema = new Schema({
  errorType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  errorMessage: {
    type: String,
    required: true,
    maxlength: 2000
  },
  stackTrace: {
    type: String,
    maxlength: 10000
  },
  retryable: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

// Business impact sub-schema
const businessImpactSchema = new Schema({
  critical: {
    type: Boolean,
    required: true,
    default: false
  },
  affectedUsers: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  estimatedRevenue: {
    type: Number,
    min: 0
  }
}, { _id: false });

// Main audit schema
const statusChangeAuditSchema = new Schema<StatusChangeAuditDocument>({
  documentId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  // Transition details
  fromStatus: {
    type: String,
    enum: Object.values(DocumentStatus),
    required: true
  },
  toStatus: {
    type: String,
    enum: Object.values(DocumentStatus),
    required: true
  },
  trigger: {
    type: String,
    enum: Object.values(StatusTransitionTrigger),
    required: true,
    default: StatusTransitionTrigger.USER_ACTION
  },

  // User and timestamp
  changedBy: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  changedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },

  // Context and metadata
  reason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  comments: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: 500
  },
  ipAddress: {
    type: String,
    trim: true,
    validate: {
      validator: function(ip: string) {
        // Simple IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost';
      },
      message: 'Invalid IP address format'
    }
  },
  sessionId: {
    type: String,
    trim: true,
    maxlength: 100
  },

  // Additional data
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },

  // System context
  systemVersion: {
    type: String,
    trim: true,
    maxlength: 50
  },
  requestId: {
    type: String,
    trim: true,
    maxlength: 100,
    index: true
  },

  // Approval context
  approvalRequired: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: String,
    trim: true,
    maxlength: 200
  },
  approvedAt: Date,

  // Error context
  errorDetails: errorDetailsSchema,

  // Performance context
  processingTime: {
    type: Number,
    min: 0
  },

  // Business context
  businessImpact: businessImpactSchema,

  // Audit metadata
  auditVersion: {
    type: Number,
    default: 1,
    min: 1
  },

  // Data integrity
  checksumData: {
    type: String,
    // Will store a hash of critical fields for integrity verification
  },

  // Compliance and retention
  retentionDate: {
    type: Date,
    // Calculated based on legal requirements
  },
  complianceFlags: [{
    type: String,
    enum: ['GDPR', 'SOX', 'HIPAA', 'LOCAL_LAW'],
  }],

  // Indexing and search
  searchTerms: [{
    type: String,
    trim: true,
    maxlength: 50
  }],

  // Archival status
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date

}, {
  timestamps: true,
  collection: 'status_change_audit',
  versionKey: false
});

// Indexes for performance optimization
statusChangeAuditSchema.index({ documentId: 1, changedAt: -1 });
statusChangeAuditSchema.index({ changedBy: 1, changedAt: -1 });
statusChangeAuditSchema.index({ fromStatus: 1, toStatus: 1, changedAt: -1 });
statusChangeAuditSchema.index({ trigger: 1, changedAt: -1 });
statusChangeAuditSchema.index({ requestId: 1 });
statusChangeAuditSchema.index({ 'businessImpact.critical': 1, changedAt: -1 });
statusChangeAuditSchema.index({ 'errorDetails.retryable': 1, changedAt: -1 });
statusChangeAuditSchema.index({ retentionDate: 1 });
statusChangeAuditSchema.index({ isArchived: 1, changedAt: -1 });

// Compound indexes for common queries
statusChangeAuditSchema.index({
  documentId: 1,
  fromStatus: 1,
  toStatus: 1,
  changedAt: -1
});
statusChangeAuditSchema.index({
  changedBy: 1,
  trigger: 1,
  changedAt: -1
});

// Text index for search functionality
statusChangeAuditSchema.index({
  reason: 'text',
  comments: 'text',
  searchTerms: 'text'
});

// Pre-save middleware
statusChangeAuditSchema.pre('save', function(next) {
  // Generate search terms for better searchability
  this.searchTerms = [
    this.documentId,
    this.fromStatus,
    this.toStatus,
    this.changedBy,
    this.trigger
  ].filter(Boolean);

  // Calculate retention date (7 years for legal compliance)
  if (!this.retentionDate) {
    this.retentionDate = new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000);
  }

  // Generate data integrity checksum
  const criticalData = `${this.documentId}|${this.fromStatus}|${this.toStatus}|${this.changedBy}|${this.changedAt.getTime()}`;
  this.checksumData = require('crypto').createHash('sha256').update(criticalData).digest('hex');

  next();
});

// Post-save middleware for logging
statusChangeAuditSchema.post('save', function(doc) {
  console.log(`Audit entry created: ${doc.documentId} ${doc.fromStatus} → ${doc.toStatus} by ${doc.changedBy}`);
});

// Virtual properties
statusChangeAuditSchema.virtual('formattedTimestamp').get(function() {
  return this.changedAt.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

statusChangeAuditSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.changedAt.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 30) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

  return this.formattedTimestamp;
});

statusChangeAuditSchema.virtual('statusTransitionText').get(function() {
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

  const fromText = statusTexts[this.fromStatus] || this.fromStatus;
  const toText = statusTexts[this.toStatus] || this.toStatus;

  return `${fromText} → ${toText}`;
});

statusChangeAuditSchema.virtual('riskLevel').get(function() {
  if (this.businessImpact?.critical) return 'CRITICAL';
  if (this.errorDetails) return 'HIGH';
  if (this.approvalRequired) return 'MEDIUM';
  return 'LOW';
});

statusChangeAuditSchema.virtual('isRecent').get(function() {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.changedAt > hourAgo;
});

// Instance methods
statusChangeAuditSchema.methods.addBusinessContext = async function(context: {
  critical: boolean;
  affectedUsers: string[];
  estimatedRevenue?: number;
}): Promise<StatusChangeAuditDocument> {
  this.businessImpact = context;
  return await this.save();
};

statusChangeAuditSchema.methods.addErrorDetails = async function(error: {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  retryable: boolean;
}): Promise<StatusChangeAuditDocument> {
  this.errorDetails = error;
  return await this.save();
};

statusChangeAuditSchema.methods.markAsProcessed = async function(
  processingTime: number
): Promise<StatusChangeAuditDocument> {
  this.processingTime = processingTime;
  return await this.save();
};

// Static methods
statusChangeAuditSchema.statics.findByDocumentId = async function(
  documentId: string,
  options: {
    limit?: number;
    page?: number;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{
  audits: StatusChangeAuditDocument[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const {
    page = 1,
    limit = 50,
    sortOrder = 'desc'
  } = options;

  const query = { documentId };
  const sort = { changedAt: sortOrder === 'desc' ? -1 : 1 };
  const skip = (page - 1) * limit;

  const [audits, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('documentId', 'documentType employeeName'),
    this.countDocuments(query)
  ]);

  return {
    audits,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

statusChangeAuditSchema.statics.findByUser = async function(
  userId: string,
  options: {
    limit?: number;
    dateRange?: { from: Date; to: Date };
    documentTypes?: string[];
  } = {}
): Promise<StatusChangeAuditDocument[]> {
  const query: any = { changedBy: userId };

  if (options.dateRange) {
    query.changedAt = {
      $gte: options.dateRange.from,
      $lte: options.dateRange.to
    };
  }

  return await this.find(query)
    .sort({ changedAt: -1 })
    .limit(options.limit || 100);
};

statusChangeAuditSchema.statics.findByStatusTransition = async function(
  fromStatus: DocumentStatus,
  toStatus: DocumentStatus,
  options: {
    limit?: number;
    dateRange?: { from: Date; to: Date };
  } = {}
): Promise<StatusChangeAuditDocument[]> {
  const query: any = { fromStatus, toStatus };

  if (options.dateRange) {
    query.changedAt = {
      $gte: options.dateRange.from,
      $lte: options.dateRange.to
    };
  }

  return await this.find(query)
    .sort({ changedAt: -1 })
    .limit(options.limit || 100);
};

statusChangeAuditSchema.statics.getAuditStatistics = async function(
  filters: {
    dateRange?: { from: Date; to: Date };
    documentId?: string;
    userId?: string;
  } = {}
): Promise<{
  totalTransitions: number;
  transitionsByTrigger: Record<string, number>;
  transitionsByUser: Record<string, number>;
  transitionsByStatus: Record<string, number>;
  averageProcessingTime: number;
  errorRate: number;
  criticalTransitions: number;
}> {
  const matchQuery: any = {};

  if (filters.dateRange) {
    matchQuery.changedAt = {
      $gte: filters.dateRange.from,
      $lte: filters.dateRange.to
    };
  }

  if (filters.documentId) {
    matchQuery.documentId = filters.documentId;
  }

  if (filters.userId) {
    matchQuery.changedBy = filters.userId;
  }

  const pipeline = [
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalTransitions: { $sum: 1 },
        transitionsByTrigger: { $push: '$trigger' },
        transitionsByUser: { $push: '$changedBy' },
        transitionsByStatus: { $push: { from: '$fromStatus', to: '$toStatus' } },
        averageProcessingTime: { $avg: '$processingTime' },
        errorTransitions: {
          $sum: { $cond: [{ $ne: ['$errorDetails', null] }, 1, 0] }
        },
        criticalTransitions: {
          $sum: { $cond: [{ $eq: ['$businessImpact.critical', true] }, 1, 0] }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);

  if (result.length === 0) {
    return {
      totalTransitions: 0,
      transitionsByTrigger: {},
      transitionsByUser: {},
      transitionsByStatus: {},
      averageProcessingTime: 0,
      errorRate: 0,
      criticalTransitions: 0
    };
  }

  const stats = result[0];

  // Process trigger counts
  const transitionsByTrigger: Record<string, number> = {};
  stats.transitionsByTrigger?.forEach((trigger: string) => {
    transitionsByTrigger[trigger] = (transitionsByTrigger[trigger] || 0) + 1;
  });

  // Process user counts
  const transitionsByUser: Record<string, number> = {};
  stats.transitionsByUser?.forEach((user: string) => {
    transitionsByUser[user] = (transitionsByUser[user] || 0) + 1;
  });

  // Process status transition counts
  const transitionsByStatus: Record<string, number> = {};
  stats.transitionsByStatus?.forEach((transition: any) => {
    const key = `${transition.from} → ${transition.to}`;
    transitionsByStatus[key] = (transitionsByStatus[key] || 0) + 1;
  });

  return {
    totalTransitions: stats.totalTransitions || 0,
    transitionsByTrigger,
    transitionsByUser,
    transitionsByStatus,
    averageProcessingTime: stats.averageProcessingTime || 0,
    errorRate: stats.totalTransitions > 0 ? (stats.errorTransitions || 0) / stats.totalTransitions : 0,
    criticalTransitions: stats.criticalTransitions || 0
  };
};

statusChangeAuditSchema.statics.findCriticalTransitions = async function(
  options: {
    limit?: number;
    dateRange?: { from: Date; to: Date };
  } = {}
): Promise<StatusChangeAuditDocument[]> {
  const query: any = { 'businessImpact.critical': true };

  if (options.dateRange) {
    query.changedAt = {
      $gte: options.dateRange.from,
      $lte: options.dateRange.to
    };
  }

  return await this.find(query)
    .sort({ changedAt: -1 })
    .limit(options.limit || 50);
};

statusChangeAuditSchema.statics.findErrorTransitions = async function(
  options: {
    limit?: number;
    dateRange?: { from: Date; to: Date };
    retryableOnly?: boolean;
  } = {}
): Promise<StatusChangeAuditDocument[]> {
  const query: any = { errorDetails: { $ne: null } };

  if (options.retryableOnly) {
    query['errorDetails.retryable'] = true;
  }

  if (options.dateRange) {
    query.changedAt = {
      $gte: options.dateRange.from,
      $lte: options.dateRange.to
    };
  }

  return await this.find(query)
    .sort({ changedAt: -1 })
    .limit(options.limit || 100);
};

statusChangeAuditSchema.statics.findTransitionsByTimeRange = async function(
  timeRange: { from: Date; to: Date },
  options: {
    groupBy?: 'hour' | 'day' | 'week' | 'month';
    limit?: number;
  } = {}
): Promise<Array<{
  period: string;
  count: number;
  transitions: StatusChangeAuditDocument[];
}>> {
  const { groupBy = 'day', limit = 50 } = options;

  let dateFormat: any;
  switch (groupBy) {
    case 'hour':
      dateFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$changedAt' } };
      break;
    case 'day':
      dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$changedAt' } };
      break;
    case 'week':
      dateFormat = { $dateToString: { format: '%Y-W%U', date: '$changedAt' } };
      break;
    case 'month':
      dateFormat = { $dateToString: { format: '%Y-%m', date: '$changedAt' } };
      break;
  }

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
        _id: dateFormat,
        count: { $sum: 1 },
        transitions: { $push: '$$ROOT' }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: limit }
  ];

  const result = await this.aggregate(pipeline);

  return result.map(group => ({
    period: group._id,
    count: group.count,
    transitions: group.transitions
  }));
};

statusChangeAuditSchema.statics.createAuditEntry = async function(
  data: Partial<IStatusChangeAudit>
): Promise<StatusChangeAuditDocument> {
  // Set defaults and generate IDs
  const auditData = {
    trigger: StatusTransitionTrigger.USER_ACTION,
    changedAt: new Date(),
    approvalRequired: false,
    auditVersion: 1,
    ...data
  };

  // Generate request ID if not provided
  if (!auditData.requestId) {
    auditData.requestId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  return await this.create(auditData);
};

statusChangeAuditSchema.statics.findDuplicateTransitions = async function(
  documentId: string,
  fromStatus: DocumentStatus,
  toStatus: DocumentStatus,
  timeWindow: number = 5000 // 5 seconds
): Promise<StatusChangeAuditDocument[]> {
  const cutoffTime = new Date(Date.now() - timeWindow);

  return await this.find({
    documentId,
    fromStatus,
    toStatus,
    changedAt: { $gte: cutoffTime }
  }).sort({ changedAt: -1 });
};

statusChangeAuditSchema.statics.cleanup = async function(
  retentionDays: number = 2555 // 7 years
): Promise<{
  deletedCount: number;
  errors: string[];
}> {
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const errors: string[] = [];

  try {
    // Archive old entries instead of deleting them
    const result = await this.updateMany(
      {
        changedAt: { $lt: cutoffDate },
        isArchived: false
      },
      {
        $set: {
          isArchived: true,
          archivedAt: new Date()
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

statusChangeAuditSchema.statics.exportAuditTrail = async function(
  filters: {
    documentIds?: string[];
    userIds?: string[];
    dateRange?: { from: Date; to: Date };
    format?: 'json' | 'csv';
  }
): Promise<{
  data: any[];
  totalRecords: number;
  exportedAt: Date;
}> {
  const query: any = {};

  if (filters.documentIds && filters.documentIds.length > 0) {
    query.documentId = { $in: filters.documentIds };
  }

  if (filters.userIds && filters.userIds.length > 0) {
    query.changedBy = { $in: filters.userIds };
  }

  if (filters.dateRange) {
    query.changedAt = {
      $gte: filters.dateRange.from,
      $lte: filters.dateRange.to
    };
  }

  const audits = await this.find(query)
    .sort({ changedAt: -1 })
    .lean();

  const data = audits.map(audit => ({
    documentId: audit.documentId,
    fromStatus: audit.fromStatus,
    toStatus: audit.toStatus,
    changedBy: audit.changedBy,
    changedAt: audit.changedAt,
    reason: audit.reason,
    trigger: audit.trigger,
    processingTime: audit.processingTime,
    hasError: !!audit.errorDetails,
    isCritical: audit.businessImpact?.critical || false
  }));

  return {
    data,
    totalRecords: data.length,
    exportedAt: new Date()
  };
};

// Create and export the model
const StatusChangeAudit = mongoose.model<StatusChangeAuditDocument, StatusChangeAuditModel>(
  'StatusChangeAudit',
  statusChangeAuditSchema
);

export default StatusChangeAudit;
export type { StatusChangeAuditDocument, StatusChangeAuditModel };
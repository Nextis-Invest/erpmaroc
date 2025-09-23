const mongoose = require('mongoose');
const BRANCH = require("./branchData"); // Import the Branch schema

let ACTIVITYLOG;

if (mongoose.models && mongoose.models.ACTIVITYLOG) {
  ACTIVITYLOG = mongoose.models.ACTIVITYLOG;
} else {
  const activityLogSchema = new mongoose.Schema({
  // User identification
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  userEmail: { 
    type: String, 
    required: true,
    index: true 
  },
  userRole: { 
    type: String, 
    required: true,
    enum: ['admin', 'hr', 'employee', 'freelance', 'manager'],
    index: true
  },
  
  // Action details
  action: { 
    type: String, 
    required: true,
    index: true 
  },
  actionType: { 
    type: String, 
    required: true,
    enum: [
      'authentication', 'employee_management', 'attendance', 'payroll', 
      'leave_management', 'document_access', 'settings', 'reports', 
      'data_export', 'system_admin', 'other'
    ],
    index: true
  },
  module: { 
    type: String, 
    required: true,
    enum: ['hr', 'payroll', 'attendance', 'auth', 'admin', 'dashboard', 'settings'],
    index: true
  },
  
  // Target resource (what was affected)
  targetType: { 
    type: String,
    enum: ['employee', 'attendance', 'leave_request', 'payroll', 'document', 'setting', 'report', 'user', 'other']
  },
  targetId: { 
    type: String // Could be ObjectId, employeeId, or other identifier
  },
  targetDescription: { 
    type: String // Human-readable description of what was affected
  },
  
  // Technical details
  ipAddress: { 
    type: String,
    index: true 
  },
  userAgent: { type: String },
  sessionId: { type: String },
  
  // Request details
  httpMethod: { 
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  },
  endpoint: { type: String },
  requestBody: { 
    type: mongoose.Schema.Types.Mixed,
    select: false // Exclude by default for privacy
  },
  
  // Status and outcome
  status: { 
    type: String, 
    required: true,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'success',
    index: true
  },
  errorMessage: { type: String },
  
  // Additional metadata
  metadata: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Legacy compatibility
  branch: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BRANCH',
    index: true
  },
  process: { type: String }, // Keep for backward compatibility
  
  // Timestamps
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  collection: 'activitylogs'
});
// Indexes for performance
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ userEmail: 1, timestamp: -1 });
activityLogSchema.index({ actionType: 1, timestamp: -1 });
activityLogSchema.index({ module: 1, timestamp: -1 });
activityLogSchema.index({ status: 1, timestamp: -1 });
activityLogSchema.index({ branch: 1, timestamp: -1 });

// Static methods for common queries
activityLogSchema.statics.getByUser = function(userId, options = {}) {
  const query = { userId };
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 50)
    .populate('userId', 'email firstName lastName')
    .populate('branch', 'companyName cityName');
};

activityLogSchema.statics.getByModule = function(module, options = {}) {
  const query = { module };
  if (options.dateFrom) query.timestamp = { $gte: new Date(options.dateFrom) };
  if (options.dateTo) query.timestamp = { ...query.timestamp, $lte: new Date(options.dateTo) };
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .populate('userId', 'email firstName lastName')
    .populate('branch', 'companyName cityName');
};

activityLogSchema.statics.getSecurityEvents = function(options = {}) {
  const securityActions = [
    'login', 'logout', 'failed_login', 'password_change', 
    'permission_change', 'user_created', 'user_deleted', 'data_export'
  ];
  
  const query = { 
    $or: [
      { action: { $in: securityActions } },
      { actionType: 'authentication' },
      { status: 'error' }
    ]
  };
  
  if (options.dateFrom) query.timestamp = { $gte: new Date(options.dateFrom) };
  if (options.dateTo) query.timestamp = { ...query.timestamp, $lte: new Date(options.dateTo) };
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 200)
    .populate('userId', 'email firstName lastName')
    .populate('branch', 'companyName cityName');
};

// Instance methods
activityLogSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.requestBody; // Remove sensitive data
  return obj;
};

// Helper method to create activity log
activityLogSchema.statics.createLog = function(logData) {
  // Ensure required fields are present
  const requiredFields = ['userId', 'userEmail', 'userRole', 'action', 'actionType', 'module'];
  for (const field of requiredFields) {
    if (!logData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return this.create({
    ...logData,
    timestamp: new Date(),
    status: logData.status || 'success'
  });
};

  ACTIVITYLOG = mongoose.model('ACTIVITYLOG', activityLogSchema);
}

module.exports = ACTIVITYLOG;

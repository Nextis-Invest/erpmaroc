const mongoose = require("mongoose");

let LeaveType;

if (mongoose.models.LeaveType) {
  LeaveType = mongoose.model("LeaveType");
} else {
  const leaveTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: String,

    // Leave Policy
    annualQuota: { type: Number, required: true },
    carryForward: { type: Boolean, default: false },
    maxCarryForward: { type: Number, default: 0 },

    // Rules
    requiresApproval: { type: Boolean, default: true },
    minDays: { type: Number, default: 1 },
    maxDays: { type: Number },
    advanceNoticeDays: { type: Number, default: 0 },

    // Eligibility
    eligibleAfterMonths: { type: Number, default: 0 },
    applicableFor: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern', 'temporary']
    }],

    // Calculation
    paidLeave: { type: Boolean, default: true },
    includesWeekends: { type: Boolean, default: false },
    includesHolidays: { type: Boolean, default: false },

    // Branch specific
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH' },

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
  });

  // Indexes
  leaveTypeSchema.index({ code: 1 });
  leaveTypeSchema.index({ branch: 1 });
  leaveTypeSchema.index({ status: 1 });

  // Pre-save middleware
  leaveTypeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Static method to find active leave types
  leaveTypeSchema.statics.findActive = function() {
    return this.find({ status: 'active' });
  };

  // Static method to find applicable leave types for employment type
  leaveTypeSchema.statics.findApplicableFor = function(employmentType) {
    return this.find({
      status: 'active',
      applicableFor: { $in: [employmentType] }
    });
  };

  LeaveType = mongoose.model("LeaveType", leaveTypeSchema);
}

module.exports = LeaveType;
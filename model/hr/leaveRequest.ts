const mongoose = require("mongoose");

let LeaveRequest;

if (mongoose.models.LeaveRequest) {
  LeaveRequest = mongoose.model("LeaveRequest");
} else {
  const leaveRequestSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },

    // Duration
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    numberOfDays: { type: Number, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDayPeriod: { type: String, enum: ['morning', 'afternoon'] },

    // Reason & Documentation
    reason: { type: String, required: true },
    documents: [{
      name: String,
      url: String,
      uploadDate: { type: Date, default: Date.now }
    }],

    // Approval Workflow
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
      default: 'draft'
    },

    approvalLevels: [{
      level: Number,
      approver: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected']
      },
      comments: String,
      actionDate: Date
    }],

    // Coverage
    coveringEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

    // System Fields
    requestDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
  });

  // Indexes
  leaveRequestSchema.index({ requestId: 1 });
  leaveRequestSchema.index({ employee: 1 });
  leaveRequestSchema.index({ leaveType: 1 });
  leaveRequestSchema.index({ status: 1 });
  leaveRequestSchema.index({ startDate: 1, endDate: 1 });

  // Pre-save middleware
  leaveRequestSchema.pre('save', function(next) {
    this.lastModified = new Date();
    next();
  });

  // Method to calculate leave days (excluding weekends/holidays if configured)
  leaveRequestSchema.methods.calculateLeaveDays = function(leaveType) {
    let days = 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();

      // Skip weekends if not included
      if (!leaveType.includesWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      days++;
    }

    return this.isHalfDay ? days * 0.5 : days;
  };

  // Method to check if request overlaps with existing requests
  leaveRequestSchema.methods.hasOverlap = async function() {
    const overlapping = await LeaveRequest.find({
      employee: this.employee,
      _id: { $ne: this._id },
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: this.endDate },
          endDate: { $gte: this.startDate }
        }
      ]
    });

    return overlapping.length > 0;
  };

  // Static method to find pending requests for approver
  leaveRequestSchema.statics.findPendingForApprover = function(approverId) {
    return this.find({
      status: 'pending',
      'approvalLevels.approver': approverId,
      'approvalLevels.status': 'pending'
    }).populate('employee leaveType');
  };

  // Static method to generate request ID
  leaveRequestSchema.statics.generateRequestId = async function() {
    const count = await this.countDocuments();
    return `LR${String(count + 1).padStart(6, '0')}`;
  };

  LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
}

module.exports = LeaveRequest;
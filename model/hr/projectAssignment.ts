const mongoose = require("mongoose");

let ProjectAssignment;

if (mongoose.models.ProjectAssignment) {
  ProjectAssignment = mongoose.model("ProjectAssignment");
} else {
  const projectAssignmentSchema = new mongoose.Schema({
    // Core Assignment Information
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

    // Assignment Details
    role: {
      type: String,
      required: true,
      enum: [
        'Project Manager', 'Team Lead', 'Senior Developer', 'Developer', 'Junior Developer',
        'Business Analyst', 'QA Tester', 'UI/UX Designer', 'DevOps Engineer',
        'Data Analyst', 'Technical Writer', 'Consultant', 'Architect', 'Other'
      ]
    },

    // Time Allocation
    allocation: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 100
    }, // Percentage of working time allocated to this project

    // Assignment Timeline
    startDate: { type: Date, required: true },
    endDate: Date,
    estimatedHours: Number,

    // Status and Billing
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed', 'on-hold', 'cancelled'],
      default: 'active'
    },

    billable: { type: Boolean, default: true },
    hourlyRate: Number, // Override employee's default rate if needed

    // Assignment Settings
    responsibilities: [String],
    skills: [String],
    accessLevel: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'write'
    },

    // Attendance Integration
    attendanceSettings: {
      trackTime: { type: Boolean, default: true },
      requireCheckIn: { type: Boolean, default: false },
      allowRemoteWork: { type: Boolean, default: false },
      customWorkingHours: {
        enabled: { type: Boolean, default: false },
        start: String, // HH:MM format
        end: String,   // HH:MM format
        breakDuration: Number // minutes
      }
    },

    // Performance Tracking
    performanceMetrics: {
      totalHoursWorked: { type: Number, default: 0 },
      taskCompletion: { type: Number, default: 0 }, // Percentage
      qualityRating: { type: Number, min: 1, max: 5 },
      lastReviewDate: Date,
      nextReviewDate: Date
    },

    // Assignment Notes and History
    notes: String,
    assignmentHistory: [{
      action: {
        type: String,
        enum: ['created', 'updated', 'role_changed', 'allocation_changed', 'status_changed', 'extended', 'completed']
      },
      date: { type: Date, default: Date.now },
      previousValues: mongoose.Schema.Types.Mixed,
      newValues: mongoose.Schema.Types.Mixed,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
      reason: String
    }],

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
  });

  // Indexes for performance
  projectAssignmentSchema.index({ project: 1, employee: 1 });
  projectAssignmentSchema.index({ employee: 1, status: 1 });
  projectAssignmentSchema.index({ project: 1, status: 1 });
  projectAssignmentSchema.index({ startDate: 1, endDate: 1 });
  projectAssignmentSchema.index({ billable: 1 });
  projectAssignmentSchema.index({ isDeleted: 1 });

  // Compound indexes
  projectAssignmentSchema.index({ project: 1, employee: 1, status: 1 });
  projectAssignmentSchema.index({ employee: 1, startDate: 1, endDate: 1 });

  // Pre-save middleware
  projectAssignmentSchema.pre('save', function(next) {
    this.updatedAt = new Date();

    // Add to assignment history if this is an update
    if (!this.isNew && this.isModified()) {
      const changes = {};
      const previousValues = {};

      this.modifiedPaths().forEach(path => {
        if (path !== 'updatedAt' && path !== 'assignmentHistory') {
          changes[path] = this[path];
          previousValues[path] = this.get(path, null, { getters: false });
        }
      });

      if (Object.keys(changes).length > 0) {
        this.assignmentHistory.push({
          action: 'updated',
          date: new Date(),
          previousValues,
          newValues: changes,
          changedBy: this.lastModifiedBy
        });
      }
    }

    next();
  });

  // Virtual for assignment duration in days
  projectAssignmentSchema.virtual('duration').get(function() {
    if (!this.endDate) return null;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  });

  // Virtual to check if assignment is currently active
  projectAssignmentSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    const start = new Date(this.startDate);
    const end = this.endDate ? new Date(this.endDate) : null;

    return this.status === 'active' &&
           !this.isDeleted &&
           now >= start &&
           (!end || now <= end);
  });

  // Method to update hours worked
  projectAssignmentSchema.methods.addHoursWorked = function(hours) {
    this.performanceMetrics.totalHoursWorked += hours;
    return this.save();
  };

  // Method to update allocation percentage
  projectAssignmentSchema.methods.updateAllocation = function(newAllocation, changedBy, reason) {
    const oldAllocation = this.allocation;
    this.allocation = newAllocation;
    this.lastModifiedBy = changedBy;

    this.assignmentHistory.push({
      action: 'allocation_changed',
      date: new Date(),
      previousValues: { allocation: oldAllocation },
      newValues: { allocation: newAllocation },
      changedBy,
      reason
    });

    return this.save();
  };

  // Method to change assignment status
  projectAssignmentSchema.methods.changeStatus = function(newStatus, changedBy, reason) {
    const oldStatus = this.status;
    this.status = newStatus;
    this.lastModifiedBy = changedBy;

    // Set end date if completing or cancelling
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      this.endDate = new Date();
    }

    this.assignmentHistory.push({
      action: 'status_changed',
      date: new Date(),
      previousValues: { status: oldStatus },
      newValues: { status: newStatus },
      changedBy,
      reason
    });

    return this.save();
  };

  // Static method to find active assignments for employee
  projectAssignmentSchema.statics.findActiveByEmployee = function(employeeId) {
    return this.find({
      employee: employeeId,
      status: 'active',
      isDeleted: false,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    }).populate('project');
  };

  // Static method to find assignments for project
  projectAssignmentSchema.statics.findByProject = function(projectId) {
    return this.find({
      project: projectId,
      isDeleted: false
    }).populate('employee');
  };

  // Static method to check allocation conflicts
  projectAssignmentSchema.statics.checkAllocationConflict = function(employeeId, startDate, endDate, allocation, excludeAssignmentId = null) {
    const query = {
      employee: employeeId,
      status: 'active',
      isDeleted: false,
      $or: [
        {
          startDate: { $lte: endDate || new Date('2099-12-31') },
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: startDate } }
          ]
        }
      ]
    };

    if (excludeAssignmentId) {
      query._id = { $ne: excludeAssignmentId };
    }

    return this.find(query).then(assignments => {
      const totalAllocation = assignments.reduce((sum, assignment) => sum + assignment.allocation, 0);
      return totalAllocation + allocation > 100;
    });
  };

  // Static method to get assignment statistics
  projectAssignmentSchema.statics.getStatistics = function(projectId = null, employeeId = null) {
    const matchQuery = { isDeleted: false };
    if (projectId) matchQuery.project = projectId;
    if (employeeId) matchQuery.employee = employeeId;

    return this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          totalHours: { $sum: '$performanceMetrics.totalHoursWorked' },
          averageAllocation: { $avg: '$allocation' },
          billableAssignments: { $sum: { $cond: ['$billable', 1, 0] } }
        }
      }
    ]);
  };

  ProjectAssignment = mongoose.model("ProjectAssignment", projectAssignmentSchema);
}

module.exports = ProjectAssignment;
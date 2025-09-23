const mongoose = require("mongoose");

let Project;

if (mongoose.models.Project) {
  Project = mongoose.model("Project");
} else {
  const projectSchema = new mongoose.Schema({
    // Basic Information
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: String,
    color: { type: String, default: '#3b82f6' }, // For UI color coding

    // Project Structure
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    // Project Management
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],

    // Project Timeline
    startDate: { type: Date, required: true },
    endDate: Date,
    estimatedEndDate: Date,

    // Project Settings
    workingHours: {
      start: { type: String, default: '09:00' }, // HH:MM format
      end: { type: String, default: '17:00' },
      breakDuration: { type: Number, default: 60 }, // minutes
      timezone: { type: String, default: 'Africa/Casablanca' }
    },

    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }],

    // Status and Priority
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled', 'archived'],
      default: 'planning'
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },

    // Budget and Resources
    budget: {
      total: Number,
      allocated: Number,
      spent: Number,
      currency: { type: String, default: 'MAD' }
    },

    // Attendance Settings
    attendanceSettings: {
      allowRemoteWork: { type: Boolean, default: false },
      flexibleHours: { type: Boolean, default: false },
      overtimeAllowed: { type: Boolean, default: true },
      trackBreaks: { type: Boolean, default: true },
      geofencing: {
        enabled: { type: Boolean, default: false },
        radius: { type: Number, default: 500 }, // meters
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      }
    },

    // Client Information (if applicable)
    client: {
      name: String,
      contact: String,
      email: String,
      phone: String
    },

    // Project Tags and Categories
    tags: [String],
    category: String,

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
  // Note: code already has unique index from unique: true
  projectSchema.index({ branch: 1 });
  projectSchema.index({ department: 1 });
  projectSchema.index({ status: 1 });
  projectSchema.index({ priority: 1 });
  projectSchema.index({ projectManager: 1 });
  projectSchema.index({ startDate: 1, endDate: 1 });
  projectSchema.index({ isDeleted: 1 });

  // Compound indexes
  projectSchema.index({ branch: 1, status: 1 });
  projectSchema.index({ status: 1, priority: 1 });

  // Pre-save middleware
  projectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Virtual for project duration in days
  projectSchema.virtual('duration').get(function() {
    if (!this.endDate) return null;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  });

  // Virtual for project progress (if endDate exists)
  projectSchema.virtual('progress').get(function() {
    if (!this.endDate) return null;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const now = new Date();

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  });

  // Virtual for total team count
  projectSchema.virtual('teamCount').get(function() {
    return this.teams.length;
  });

  // Method to add team to project
  projectSchema.methods.addTeam = function(teamId) {
    if (!this.teams.includes(teamId)) {
      this.teams.push(teamId);
      return this.save();
    }
    return Promise.resolve(this);
  };

  // Method to remove team from project
  projectSchema.methods.removeTeam = function(teamId) {
    this.teams = this.teams.filter(team => team.toString() !== teamId.toString());
    return this.save();
  };

  // Method to check if project is active
  projectSchema.methods.isActive = function() {
    return this.status === 'active' && !this.isDeleted;
  };

  // Method to soft delete
  projectSchema.methods.softDelete = function(deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    return this.save();
  };

  // Static method to find active projects
  projectSchema.statics.findActive = function() {
    return this.find({
      status: { $in: ['planning', 'active', 'on-hold'] },
      isDeleted: false
    });
  };

  // Static method to find projects by branch
  projectSchema.statics.findByBranch = function(branchId) {
    return this.find({
      branch: branchId,
      isDeleted: false
    }).populate('teams projectManager');
  };

  // Static method to find projects by manager
  projectSchema.statics.findByManager = function(managerId) {
    return this.find({
      projectManager: managerId,
      isDeleted: false
    });
  };

  // Static method to get project statistics
  projectSchema.statics.getStatistics = function(branchId = null) {
    const matchQuery = { isDeleted: false };
    if (branchId) matchQuery.branch = branchId;

    return this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          planning: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          criticalPriority: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } }
        }
      }
    ]);
  };

  Project = mongoose.model("Project", projectSchema);
}

module.exports = Project;
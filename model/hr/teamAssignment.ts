const mongoose = require("mongoose");

let TeamAssignment;

if (mongoose.models.TeamAssignment) {
  TeamAssignment = mongoose.model("TeamAssignment");
} else {
  const teamAssignmentSchema = new mongoose.Schema({
    // Core Assignment Information
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

    // Assignment Details
    role: {
      type: String,
      required: true,
      enum: [
        'Team Lead', 'Senior Member', 'Member', 'Junior Member', 'Intern',
        'Specialist', 'Coordinator', 'Supervisor', 'Mentor', 'Other'
      ],
      default: 'Member'
    },

    // Assignment Timeline
    startDate: { type: Date, required: true },
    endDate: Date, // null/undefined means permanent assignment

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed', 'transferred'],
      default: 'active'
    },

    // Team-specific Settings
    responsibilities: [String],
    permissions: [{
      resource: String,
      access: {
        type: String,
        enum: ['read', 'write', 'admin'],
        default: 'read'
      }
    }],

    // Performance and Metrics
    performanceMetrics: {
      contributionScore: { type: Number, min: 0, max: 100, default: 0 },
      collaborationRating: { type: Number, min: 1, max: 5 },
      attendanceRate: { type: Number, min: 0, max: 100, default: 100 },
      lastEvaluationDate: Date,
      nextEvaluationDate: Date
    },

    // Attendance Integration
    attendanceSettings: {
      inheritTeamSettings: { type: Boolean, default: true },
      customWorkingHours: {
        enabled: { type: Boolean, default: false },
        start: String, // HH:MM format
        end: String,   // HH:MM format
        workingDays: [{
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }]
      },
      remoteWorkAllowed: { type: Boolean, default: false },
      flexibleSchedule: { type: Boolean, default: false }
    },

    // Assignment History and Notes
    notes: String,
    assignmentHistory: [{
      action: {
        type: String,
        enum: ['created', 'updated', 'role_changed', 'transferred', 'promoted', 'status_changed', 'completed']
      },
      date: { type: Date, default: Date.now },
      previousValues: mongoose.Schema.Types.Mixed,
      newValues: mongoose.Schema.Types.Mixed,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
      reason: String
    }],

    // Mentoring and Development
    mentoring: {
      isMentor: { type: Boolean, default: false },
      hasMentor: { type: Boolean, default: false },
      mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
    },

    // Skills and Expertise
    primarySkills: [String],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      verified: { type: Boolean, default: false }
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
  teamAssignmentSchema.index({ team: 1, employee: 1 });
  teamAssignmentSchema.index({ employee: 1, status: 1 });
  teamAssignmentSchema.index({ team: 1, status: 1 });
  teamAssignmentSchema.index({ startDate: 1, endDate: 1 });
  teamAssignmentSchema.index({ 'mentoring.isMentor': 1 });
  teamAssignmentSchema.index({ isDeleted: 1 });

  // Compound indexes
  teamAssignmentSchema.index({ team: 1, employee: 1, status: 1 });
  teamAssignmentSchema.index({ employee: 1, startDate: 1, endDate: 1 });
  teamAssignmentSchema.index({ team: 1, role: 1 });

  // Unique constraint: one active assignment per employee per team
  teamAssignmentSchema.index(
    { team: 1, employee: 1, status: 1 },
    {
      unique: true,
      partialFilterExpression: {
        status: 'active',
        isDeleted: false
      }
    }
  );

  // Pre-save middleware
  teamAssignmentSchema.pre('save', function(next) {
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
  teamAssignmentSchema.virtual('duration').get(function() {
    if (!this.endDate) return null; // Permanent assignment
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  });

  // Virtual to check if assignment is currently active
  teamAssignmentSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    const start = new Date(this.startDate);
    const end = this.endDate ? new Date(this.endDate) : null;

    return this.status === 'active' &&
           !this.isDeleted &&
           now >= start &&
           (!end || now <= end);
  });

  // Virtual to check if employee is team lead
  teamAssignmentSchema.virtual('isTeamLead').get(function() {
    return this.role === 'Team Lead' && this.status === 'active' && !this.isDeleted;
  });

  // Method to change role
  teamAssignmentSchema.methods.changeRole = function(newRole, changedBy, reason) {
    const oldRole = this.role;
    this.role = newRole;
    this.lastModifiedBy = changedBy;

    this.assignmentHistory.push({
      action: 'role_changed',
      date: new Date(),
      previousValues: { role: oldRole },
      newValues: { role: newRole },
      changedBy,
      reason
    });

    return this.save();
  };

  // Method to transfer to another team
  teamAssignmentSchema.methods.transferToTeam = function(newTeamId, newRole, changedBy, reason) {
    // This method would typically end current assignment and create new one
    // For simplicity, we'll just mark as transferred
    const oldTeam = this.team;
    const oldRole = this.role;

    this.status = 'transferred';
    this.endDate = new Date();
    this.lastModifiedBy = changedBy;

    this.assignmentHistory.push({
      action: 'transferred',
      date: new Date(),
      previousValues: { team: oldTeam, role: oldRole },
      newValues: { team: newTeamId, role: newRole },
      changedBy,
      reason
    });

    return this.save();
  };

  // Method to update performance metrics
  teamAssignmentSchema.methods.updatePerformance = function(metrics, evaluatedBy) {
    Object.assign(this.performanceMetrics, metrics);
    this.performanceMetrics.lastEvaluationDate = new Date();
    this.lastModifiedBy = evaluatedBy;

    return this.save();
  };

  // Method to add mentee
  teamAssignmentSchema.methods.addMentee = function(menteeId) {
    if (!this.mentoring.mentees.includes(menteeId)) {
      this.mentoring.mentees.push(menteeId);
      this.mentoring.isMentor = true;
      return this.save();
    }
    return Promise.resolve(this);
  };

  // Method to remove mentee
  teamAssignmentSchema.methods.removeMentee = function(menteeId) {
    this.mentoring.mentees = this.mentoring.mentees.filter(
      id => id.toString() !== menteeId.toString()
    );

    if (this.mentoring.mentees.length === 0) {
      this.mentoring.isMentor = false;
    }

    return this.save();
  };

  // Static method to find active assignments for employee
  teamAssignmentSchema.statics.findActiveByEmployee = function(employeeId) {
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
    }).populate('team');
  };

  // Static method to find assignments for team
  teamAssignmentSchema.statics.findByTeam = function(teamId) {
    return this.find({
      team: teamId,
      status: 'active',
      isDeleted: false
    }).populate('employee');
  };

  // Static method to find team leads
  teamAssignmentSchema.statics.findTeamLeads = function(teamId = null) {
    const query = {
      role: 'Team Lead',
      status: 'active',
      isDeleted: false
    };

    if (teamId) {
      query.team = teamId;
    }

    return this.find(query).populate('team employee');
  };

  // Static method to find mentors in a team
  teamAssignmentSchema.statics.findMentors = function(teamId) {
    return this.find({
      team: teamId,
      'mentoring.isMentor': true,
      status: 'active',
      isDeleted: false
    }).populate('employee mentoring.mentees');
  };

  // Static method to get team statistics
  teamAssignmentSchema.statics.getTeamStatistics = function(teamId) {
    return this.aggregate([
      {
        $match: {
          team: mongoose.Types.ObjectId(teamId),
          status: 'active',
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          totalMembers: { $sum: 1 },
          teamLeads: { $sum: { $cond: [{ $eq: ['$role', 'Team Lead'] }, 1, 0] } },
          seniorMembers: { $sum: { $cond: [{ $eq: ['$role', 'Senior Member'] }, 1, 0] } },
          regularMembers: { $sum: { $cond: [{ $eq: ['$role', 'Member'] }, 1, 0] } },
          juniorMembers: { $sum: { $cond: [{ $eq: ['$role', 'Junior Member'] }, 1, 0] } },
          mentors: { $sum: { $cond: ['$mentoring.isMentor', 1, 0] } },
          averageContribution: { $avg: '$performanceMetrics.contributionScore' },
          averageAttendance: { $avg: '$performanceMetrics.attendanceRate' }
        }
      }
    ]);
  };

  // Static method to check for assignment conflicts
  teamAssignmentSchema.statics.checkConflict = function(employeeId, teamId, startDate, endDate = null) {
    const query = {
      employee: employeeId,
      team: teamId,
      status: 'active',
      isDeleted: false,
      startDate: { $lte: endDate || new Date('2099-12-31') },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: startDate } }
      ]
    };

    return this.findOne(query);
  };

  TeamAssignment = mongoose.model("TeamAssignment", teamAssignmentSchema);
}

module.exports = TeamAssignment;
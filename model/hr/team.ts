const mongoose = require("mongoose");

let Team;

if (mongoose.models.Team) {
  Team = mongoose.model("Team");
} else {
  const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: String,
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    // Team Structure
    teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    members: [{
      employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      role: String,
      joinDate: { type: Date, default: Date.now }
    }],

    // Team Settings
    maxMembers: { type: Number, min: 1 },
    shiftPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ShiftPattern' },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active'
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
  });

  // Indexes
  // Note: code already has unique index from unique: true
  teamSchema.index({ branch: 1 });
  teamSchema.index({ department: 1 });
  teamSchema.index({ status: 1 });

  // Pre-save middleware
  teamSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Virtual for current member count
  teamSchema.virtual('memberCount').get(function() {
    return this.members.length;
  });

  // Method to add member
  teamSchema.methods.addMember = function(employeeId, role = 'Member') {
    if (this.members.length >= this.maxMembers) {
      throw new Error('Team is at maximum capacity');
    }

    const existingMember = this.members.find(m => m.employee.toString() === employeeId.toString());
    if (existingMember) {
      throw new Error('Employee is already a member of this team');
    }

    this.members.push({
      employee: employeeId,
      role: role,
      joinDate: new Date()
    });

    return this.save();
  };

  // Method to remove member
  teamSchema.methods.removeMember = function(employeeId) {
    this.members = this.members.filter(m => m.employee.toString() !== employeeId.toString());
    return this.save();
  };

  // Static method to find teams by department
  teamSchema.statics.findByDepartment = function(departmentId) {
    return this.find({ department: departmentId, status: 'active' });
  };

  Team = mongoose.model("Team", teamSchema);
}

module.exports = Team;
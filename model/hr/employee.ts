const mongoose = require("mongoose");

let Employee;

if (mongoose.models.Employee) {
  Employee = mongoose.model("Employee");
} else {
  const employeeSchema = new mongoose.Schema({
    // Basic Information
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    email: { type: String, required: true, unique: true },
    personalEmail: String,
    phone: { type: String, required: true },
    alternatePhone: String,

    // Employment Details
    position: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

    // Employment Status
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern', 'temporary', 'freelance'],
      required: true,
      default: 'full-time'
    },
    isFreelance: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'terminated', 'suspended'],
      default: 'active'
    },

    // Important Dates
    hireDate: { type: Date, required: true },
    originalHireDate: { type: Date }, // Date d'embauche originale pour préserver l'ancienneté
    confirmationDate: Date,
    lastWorkingDate: Date,
    birthDate: { type: Date, required: true },

    // Compensation
    salary: { type: Number, required: true, min: 0 },
    bonus: { type: Number, min: 0, default: 0 },
    allowances: [{
      type: { type: String },
      amount: { type: Number, min: 0 }
    }],

    // Personal Information
    gender: { type: String, enum: ['male', 'female', 'other'] },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    nationality: String,
    nationalId: String,
    passportNumber: String,
    cnssNumber: String,

    // Contract Information
    contractType: {
      type: String,
      enum: ['cdi', 'cdd', 'freelance'],
      default: 'cdi'
    },
    contractHistory: [{
      contractType: {
        type: String,
        enum: ['cdi', 'cdd', 'freelance'],
        required: true
      },
      startDate: { type: Date, required: true },
      endDate: Date,
      reason: String, // Raison du changement
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
      changeDate: { type: Date, default: Date.now }
    }],

    // Address Information
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },

    // Emergency Contact
    emergencyContact: {
      name: { type: String, required: true },
      relationship: String,
      phone: { type: String, required: true },
      address: String
    },

    // Bank Details
    bankAccount: {
      bankName: String,
      accountNumber: String,
      accountType: String,
      routingNumber: String
    },

    // Professional Information
    skills: [String],
    education: [{
      degree: String,
      institution: String,
      year: Number,
      field: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      expiryDate: Date
    }],

    // Documents
    documents: [{
      type: String,
      name: String,
      url: String,
      uploadDate: { type: Date, default: Date.now }
    }],

    // Migration fields (to support transition from Staff model)
    migratedFromStaff: { type: Boolean, default: false },
    originalStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'STAFF' },

    // Archive/Restore System (logical deletion)
    isArchived: { type: Boolean, default: false },
    archivedAt: Date,
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    archiveReason: String,

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
  });

  // Indexes for performance
  // Note: employeeId and email already have unique indexes from unique: true
  employeeSchema.index({ branch: 1 });
  employeeSchema.index({ department: 1 });
  employeeSchema.index({ team: 1 });
  employeeSchema.index({ status: 1 });
  employeeSchema.index({ isArchived: 1 });
  employeeSchema.index({ isArchived: 1, status: 1 });

  // Pre-save middleware to update timestamps
  employeeSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Virtual for full name
  employeeSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
  });

  // Virtual for display name with employee ID
  employeeSchema.virtual('displayName').get(function() {
    return `${this.firstName} ${this.lastName} (${this.employeeId})`;
  });

  // Method to calculate years of service (using original hire date for seniority)
  employeeSchema.methods.getYearsOfService = function() {
    const now = new Date();
    const ancienneteDate = new Date(this.originalHireDate || this.hireDate);
    return Math.floor((now - ancienneteDate) / (365.25 * 24 * 60 * 60 * 1000));
  };

  // Method to change contract type while preserving seniority
  employeeSchema.methods.changeContractType = function(newContractType, reason, changedBy) {
    // Sauvegarder la date d'embauche originale si pas déjà fait
    if (!this.originalHireDate) {
      this.originalHireDate = this.hireDate;
    }

    // Terminer le contrat actuel dans l'historique
    if (this.contractHistory.length > 0) {
      const currentContract = this.contractHistory[this.contractHistory.length - 1];
      if (!currentContract.endDate) {
        currentContract.endDate = new Date();
      }
    }

    // Ajouter le nouveau contrat à l'historique
    this.contractHistory.push({
      contractType: newContractType,
      startDate: new Date(),
      reason: reason || 'Changement de type de contrat',
      changedBy: changedBy
    });

    // Mettre à jour le type de contrat actuel
    this.contractType = newContractType;

    // Mettre à jour hireDate pour le nouveau contrat mais garder originalHireDate
    this.hireDate = new Date();

    return this;
  };

  // Method to check if employee is eligible for leave type
  employeeSchema.methods.isEligibleForLeave = function(leaveType) {
    const monthsEmployed = Math.floor(
      (new Date() - new Date(this.hireDate)) / (30.44 * 24 * 60 * 60 * 1000)
    );
    return monthsEmployed >= leaveType.eligibleAfterMonths &&
           leaveType.applicableFor.includes(this.employmentType);
  };

  // Method to archive employee (logical deletion)
  employeeSchema.methods.archive = function(reason, archivedBy) {
    this.isArchived = true;
    this.archivedAt = new Date();
    this.archivedBy = archivedBy;
    this.archiveReason = reason || 'Employee archived';
    this.status = 'inactive';
    this.lastWorkingDate = new Date();
    this.lastModifiedBy = archivedBy;
    return this.save();
  };

  // Method to restore employee
  employeeSchema.methods.restore = function(restoredBy) {
    this.isArchived = false;
    this.archivedAt = undefined;
    this.archivedBy = undefined;
    this.archiveReason = undefined;
    this.status = 'active';
    this.lastWorkingDate = undefined;
    this.lastModifiedBy = restoredBy;
    return this.save();
  };

  // Static method to find active (non-archived) employees by department
  employeeSchema.statics.findByDepartment = function(departmentId) {
    return this.find({ department: departmentId, status: 'active', isArchived: false });
  };

  // Static method to find active (non-archived) employees by team
  employeeSchema.statics.findByTeam = function(teamId) {
    return this.find({ team: teamId, status: 'active', isArchived: false });
  };

  // Static method to find active (non-archived) employees by manager
  employeeSchema.statics.findByManager = function(managerId) {
    return this.find({ manager: managerId, status: 'active', isArchived: false });
  };

  // Static method to find all active employees (excludes archived)
  employeeSchema.statics.findActive = function() {
    return this.find({ isArchived: false });
  };

  // Static method to find archived employees (admin only)
  employeeSchema.statics.findArchived = function() {
    return this.find({ isArchived: true });
  };

  Employee = mongoose.model("Employee", employeeSchema);
}

module.exports = Employee;
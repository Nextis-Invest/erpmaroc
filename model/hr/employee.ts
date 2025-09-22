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
      enum: ['full-time', 'part-time', 'contract', 'intern', 'temporary'],
      required: true,
      default: 'full-time'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'terminated', 'suspended'],
      default: 'active'
    },

    // Important Dates
    hireDate: { type: Date, required: true },
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

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
  });

  // Indexes for performance
  employeeSchema.index({ employeeId: 1 });
  employeeSchema.index({ email: 1 });
  employeeSchema.index({ branch: 1 });
  employeeSchema.index({ department: 1 });
  employeeSchema.index({ team: 1 });
  employeeSchema.index({ status: 1 });

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

  // Method to calculate years of service
  employeeSchema.methods.getYearsOfService = function() {
    const now = new Date();
    const hireDate = new Date(this.hireDate);
    return Math.floor((now - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
  };

  // Method to check if employee is eligible for leave type
  employeeSchema.methods.isEligibleForLeave = function(leaveType) {
    const monthsEmployed = Math.floor(
      (new Date() - new Date(this.hireDate)) / (30.44 * 24 * 60 * 60 * 1000)
    );
    return monthsEmployed >= leaveType.eligibleAfterMonths &&
           leaveType.applicableFor.includes(this.employmentType);
  };

  // Static method to find employees by department
  employeeSchema.statics.findByDepartment = function(departmentId) {
    return this.find({ department: departmentId, status: 'active' });
  };

  // Static method to find employees by team
  employeeSchema.statics.findByTeam = function(teamId) {
    return this.find({ team: teamId, status: 'active' });
  };

  // Static method to find employees by manager
  employeeSchema.statics.findByManager = function(managerId) {
    return this.find({ manager: managerId, status: 'active' });
  };

  Employee = mongoose.model("Employee", employeeSchema);
}

module.exports = Employee;
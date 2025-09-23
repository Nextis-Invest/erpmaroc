const mongoose = require("mongoose");

let PayrollStatus;

if (mongoose.models.PayrollStatus) {
  PayrollStatus = mongoose.model("PayrollStatus");
} else {
  const payrollStatusSchema = new mongoose.Schema({
    // Employee Information
    employeeId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or string
      required: true
    },
    employeeName: {
      type: String,
      required: true
    },
    employeeCode: String,

    // Period Information
    periodMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    periodYear: {
      type: Number,
      required: true
    },
    periodLabel: String, // e.g., "Janvier 2024"

    // Status Information
    status: {
      type: String,
      enum: [
        'NON_GENERE',    // Not yet generated
        'BROUILLON',     // Draft
        'GENERE',        // Generated
        'VERIFIE',       // Verified
        'APPROUVE',      // Approved
        'ENVOYE',        // Sent to employee
        'ARCHIVE'        // Archived
      ],
      default: 'NON_GENERE'
    },

    // Document References
    bulletinPaieId: {
      type: String // Reference to PayrollDocument documentId
    },

    // Generation Details
    generatedAt: Date,
    generatedBy: mongoose.Schema.Types.Mixed,

    // Verification Details
    verifiedAt: Date,
    verifiedBy: mongoose.Schema.Types.Mixed,
    verificationNotes: String,

    // Approval Details
    approvedAt: Date,
    approvedBy: mongoose.Schema.Types.Mixed,
    approvalNotes: String,

    // Sending Details
    sentAt: Date,
    sentBy: mongoose.Schema.Types.Mixed,
    sentTo: [String], // Email addresses
    sentMethod: {
      type: String,
      enum: ['EMAIL', 'PRINTED', 'PORTAL', 'OTHER']
    },

    // Financial Summary
    financialSummary: {
      salaireBase: Number,
      totalPrimes: Number,
      totalDeductions: Number,
      salaireNet: Number,
      cnssEmployee: Number,
      cnssEmployer: Number,
      ir: Number
    },

    // Flags
    hasAnomalies: { type: Boolean, default: false },
    anomalies: [String], // List of detected anomalies
    isLocked: { type: Boolean, default: false }, // Prevent modifications

    // Metadata
    branch: mongoose.Schema.Types.Mixed,
    company: String,
    tags: [String],
    notes: String,

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: Date,
    isDeleted: { type: Boolean, default: false }
  });

  // Indexes for performance
  payrollStatusSchema.index({ employeeId: 1, periodYear: 1, periodMonth: 1 }, { unique: true });
  payrollStatusSchema.index({ periodYear: 1, periodMonth: 1 });
  payrollStatusSchema.index({ status: 1 });
  payrollStatusSchema.index({ employeeId: 1 });
  payrollStatusSchema.index({ generatedAt: -1 });
  payrollStatusSchema.index({ isDeleted: 1 });

  // Pre-save middleware
  payrollStatusSchema.pre('save', function(next) {
    this.updatedAt = new Date();

    // Set periodLabel if not provided
    if (!this.periodLabel && this.periodMonth && this.periodYear) {
      const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      this.periodLabel = `${months[this.periodMonth - 1]} ${this.periodYear}`;
    }

    next();
  });

  // Static method to get status by employee and period
  payrollStatusSchema.statics.getStatus = async function(employeeId, year, month) {
    return await this.findOne({
      employeeId,
      periodYear: year,
      periodMonth: month,
      isDeleted: false
    });
  };

  // Static method to get all statuses for a period
  payrollStatusSchema.statics.getPeriodStatuses = async function(year, month) {
    return await this.find({
      periodYear: year,
      periodMonth: month,
      isDeleted: false
    }).sort({ employeeName: 1 });
  };

  // Static method to get employee history
  payrollStatusSchema.statics.getEmployeeHistory = async function(employeeId, limit = 12) {
    return await this.find({
      employeeId,
      isDeleted: false
    })
    .sort({ periodYear: -1, periodMonth: -1 })
    .limit(limit);
  };

  // Static method to update status
  payrollStatusSchema.statics.updatePayrollStatus = async function(employeeId, year, month, newStatus, updateData = {}) {
    const status = await this.findOneAndUpdate(
      {
        employeeId,
        periodYear: year,
        periodMonth: month
      },
      {
        status: newStatus,
        updatedAt: new Date(),
        ...updateData
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    return status;
  };

  // Instance method to progress to next status
  payrollStatusSchema.methods.progressStatus = async function(userId) {
    const statusProgression = {
      'NON_GENERE': 'BROUILLON',
      'BROUILLON': 'GENERE',
      'GENERE': 'VERIFIE',
      'VERIFIE': 'APPROUVE',
      'APPROUVE': 'ENVOYE',
      'ENVOYE': 'ARCHIVE'
    };

    const nextStatus = statusProgression[this.status];
    if (!nextStatus) {
      throw new Error('Cannot progress from current status');
    }

    this.status = nextStatus;

    // Update tracking fields based on new status
    switch(nextStatus) {
      case 'GENERE':
        this.generatedAt = new Date();
        this.generatedBy = userId;
        break;
      case 'VERIFIE':
        this.verifiedAt = new Date();
        this.verifiedBy = userId;
        break;
      case 'APPROUVE':
        this.approvedAt = new Date();
        this.approvedBy = userId;
        break;
      case 'ENVOYE':
        this.sentAt = new Date();
        this.sentBy = userId;
        break;
    }

    return await this.save();
  };

  // Instance method to add anomaly
  payrollStatusSchema.methods.addAnomaly = async function(anomaly) {
    if (!this.anomalies) {
      this.anomalies = [];
    }
    this.anomalies.push(anomaly);
    this.hasAnomalies = true;
    return await this.save();
  };

  // Instance method to lock/unlock
  payrollStatusSchema.methods.toggleLock = async function() {
    this.isLocked = !this.isLocked;
    return await this.save();
  };

  // Virtual for status badge color
  payrollStatusSchema.virtual('statusColor').get(function() {
    const colors = {
      'NON_GENERE': 'gray',
      'BROUILLON': 'yellow',
      'GENERE': 'blue',
      'VERIFIE': 'purple',
      'APPROUVE': 'green',
      'ENVOYE': 'indigo',
      'ARCHIVE': 'gray'
    };
    return colors[this.status] || 'gray';
  });

  // Virtual for status display text
  payrollStatusSchema.virtual('statusText').get(function() {
    const texts = {
      'NON_GENERE': 'Non généré',
      'BROUILLON': 'Brouillon',
      'GENERE': 'Généré',
      'VERIFIE': 'Vérifié',
      'APPROUVE': 'Approuvé',
      'ENVOYE': 'Envoyé',
      'ARCHIVE': 'Archivé'
    };
    return texts[this.status] || this.status;
  });

  PayrollStatus = mongoose.model("PayrollStatus", payrollStatusSchema);
}

module.exports = PayrollStatus;
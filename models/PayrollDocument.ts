const mongoose = require("mongoose");

let PayrollDocument;

if (mongoose.models.PayrollDocument) {
  PayrollDocument = mongoose.model("PayrollDocument");
} else {
  const payrollDocumentSchema = new mongoose.Schema({
    // Document Information
    documentId: { type: String, required: true, unique: true },
    documentType: {
      type: String,
      enum: ['bulletin_paie', 'cnss_declaration', 'virement_order', 'salary_certificate'],
      required: true
    },
    title: { type: String, required: true },
    description: String,

    // Employee Information
    employeeId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or string
      required: true
    },
    employeeName: { type: String, required: true },
    employeeCode: String,

    // Period Information
    periodType: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'custom'],
      default: 'monthly'
    },
    periodMonth: Number, // 1-12
    periodYear: { type: Number, required: true },
    periodStart: Date,
    periodEnd: Date,
    periodLabel: String, // e.g., "Janvier 2024", "Q1 2024"

    // PDF Storage
    pdfData: {
      buffer: { type: Buffer, required: true },
      size: { type: Number, required: true },
      mimetype: { type: String, default: 'application/pdf' },
      encoding: String
    },

    // Financial Data (for search and reporting)
    salaryData: {
      baseSalary: Number,
      totalAllowances: Number,
      totalDeductions: Number,
      netSalary: Number,
      cnssEmployee: Number,
      cnssEmployer: Number,
      incomeTax: Number
    },

    // Metadata
    generatedBy: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or string (email)
      required: true
    },
    generatedAt: { type: Date, default: Date.now },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH' },
    company: String,

    // Status and Approval
    status: {
      type: String,
      enum: ['draft', 'generated', 'approved', 'sent', 'archived'],
      default: 'generated'
    },
    approvedBy: { type: mongoose.Schema.Types.Mixed }, // Can be ObjectId or string
    approvedAt: Date,
    sentAt: Date,
    sentTo: [String], // Email addresses

    // Tags and Categories
    tags: [String],
    category: String,

    // Versions (for document updates)
    version: { type: Number, default: 1 },
    parentDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollDocument' },
    isLatestVersion: { type: Boolean, default: true },

    // Search and Indexing
    searchTerms: [String], // For better search functionality

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: Date,
    isDeleted: { type: Boolean, default: false }
  });

  // Indexes for performance
  payrollDocumentSchema.index({ documentId: 1 });
  payrollDocumentSchema.index({ employeeId: 1 });
  payrollDocumentSchema.index({ documentType: 1 });
  payrollDocumentSchema.index({ periodYear: 1, periodMonth: 1 });
  payrollDocumentSchema.index({ branch: 1 });
  payrollDocumentSchema.index({ status: 1 });
  payrollDocumentSchema.index({ generatedAt: -1 });
  payrollDocumentSchema.index({ isDeleted: 1 });

  // Compound indexes
  payrollDocumentSchema.index({ employeeId: 1, periodYear: 1, periodMonth: 1, documentType: 1 });
  payrollDocumentSchema.index({ branch: 1, documentType: 1, status: 1 });

  // Pre-save middleware
  payrollDocumentSchema.pre('save', function(next) {
    this.updatedAt = new Date();

    // Generate search terms
    this.searchTerms = [
      this.employeeName.toLowerCase(),
      this.documentType,
      this.periodLabel?.toLowerCase(),
      this.title.toLowerCase(),
      this.employeeCode
    ].filter(Boolean);

    next();
  });

  // Virtual for file size in human readable format
  payrollDocumentSchema.virtual('fileSizeFormatted').get(function() {
    const bytes = this.pdfData.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  });

  // Virtual for download filename
  payrollDocumentSchema.virtual('downloadFilename').get(function() {
    const date = this.periodLabel || `${this.periodMonth}-${this.periodYear}`;
    const employeeName = this.employeeName.replace(/\s+/g, '_');
    return `${this.documentType}_${employeeName}_${date}.pdf`;
  });

  // Static method to find documents by employee
  payrollDocumentSchema.statics.findByEmployee = function(employeeId, options = {}) {
    const query = {
      employeeId,
      isDeleted: false,
      ...options.filters
    };

    return this.find(query)
      .sort(options.sort || { generatedAt: -1 })
      .limit(options.limit || 50);
  };

  // Static method to find documents by period
  payrollDocumentSchema.statics.findByPeriod = function(year, month, documentType) {
    return this.find({
      periodYear: year,
      ...(month && { periodMonth: month }),
      ...(documentType && { documentType }),
      isDeleted: false
    }).sort({ generatedAt: -1 });
  };

  // Instance method to create new version
  payrollDocumentSchema.methods.createNewVersion = function(newData) {
    // Mark current version as not latest
    this.isLatestVersion = false;

    // Create new document with incremented version
    return new PayrollDocument({
      ...this.toObject(),
      _id: undefined,
      documentId: undefined, // Will be auto-generated
      version: this.version + 1,
      parentDocument: this._id,
      isLatestVersion: true,
      ...newData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  // Instance method to soft delete
  payrollDocumentSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  PayrollDocument = mongoose.model("PayrollDocument", payrollDocumentSchema);
}

module.exports = PayrollDocument;
const mongoose = require("mongoose");

let Site;

if (mongoose.models.Site) {
  Site = mongoose.model("Site");
} else {
  const siteSchema = new mongoose.Schema({
    // Basic Information
    siteId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['headquarters', 'branch', 'warehouse', 'factory', 'office', 'retail', 'other'],
      default: 'branch'
    },

    // Location Information
    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },

    // Contact Information
    phone: String,
    fax: String,
    email: String,
    website: String,

    // Operational Information
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    employeeCount: {
      type: Number,
      default: 0
    },
    departments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    }],

    // Business Information
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    services: [String],
    facilities: [String],

    // System Fields
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ADMIN'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ADMIN'
    }
  });

  // Indexes for performance
  siteSchema.index({ siteId: 1 });
  siteSchema.index({ region: 1 });
  siteSchema.index({ type: 1 });
  siteSchema.index({ isActive: 1 });
  siteSchema.index({ 'address.city': 1 });

  // Pre-save middleware to update timestamps
  siteSchema.pre('save', function(next) {
    this.updatedAt = new Date();

    // Generate siteId if not provided
    if (!this.siteId) {
      this.siteId = 'SITE' + Date.now().toString().slice(-6);
    }

    next();
  });

  // Virtual for full address
  siteSchema.virtual('fullAddress').get(function() {
    const parts = [];
    if (this.address?.street) parts.push(this.address.street);
    if (this.address?.city) parts.push(this.address.city);
    if (this.address?.postalCode) parts.push(this.address.postalCode);
    return parts.join(', ');
  });

  // Method to get all employees for this site
  siteSchema.methods.getEmployees = function() {
    return mongoose.model('Employee').find({ branch: this._id, isArchived: false });
  };

  // Method to update employee count
  siteSchema.methods.updateEmployeeCount = async function() {
    const count = await mongoose.model('Employee').countDocuments({
      branch: this._id,
      isArchived: false,
      status: 'active'
    });
    this.employeeCount = count;
    return this.save();
  };

  // Static method to find active sites
  siteSchema.statics.findActive = function() {
    return this.find({ isActive: true })
      .populate('region', 'name code')
      .sort({ name: 1 });
  };

  // Static method to find sites by region
  siteSchema.statics.findByRegion = function(regionId) {
    return this.find({ region: regionId, isActive: true })
      .populate('manager', 'firstName lastName employeeId')
      .sort({ name: 1 });
  };

  // Static method to find sites by type
  siteSchema.statics.findByType = function(type) {
    return this.find({ type: type, isActive: true })
      .populate('region', 'name code')
      .sort({ name: 1 });
  };

  Site = mongoose.model("Site", siteSchema);
}

module.exports = Site;
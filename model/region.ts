const mongoose = require("mongoose");

let Region;

if (mongoose.models.Region) {
  Region = mongoose.model("Region");
} else {
  const regionSchema = new mongoose.Schema({
    // Basic Information
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    nameAr: {
      type: String,
      required: false
    },

    // Geographic Information
    capital: String,
    area: Number, // in km²
    population: Number,

    // Administrative Information
    provinces: [{
      name: String,
      nameAr: String
    }],

    // Economic Information
    majorCities: [String],
    economicActivities: [String],

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
  regionSchema.index({ code: 1 });
  regionSchema.index({ name: 1 });
  regionSchema.index({ isActive: 1 });

  // Pre-save middleware to update timestamps
  regionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Virtual for sites count
  regionSchema.virtual('sitesCount', {
    ref: 'Site',
    localField: '_id',
    foreignField: 'region',
    count: true
  });

  // Method to get all sites for this region
  regionSchema.methods.getSites = function() {
    return mongoose.model('Site').find({ region: this._id, isActive: true });
  };

  // Static method to find active regions
  regionSchema.statics.findActive = function() {
    return this.find({ isActive: true }).sort({ name: 1 });
  };

  // Static method to find region by code
  regionSchema.statics.findByCode = function(code) {
    return this.findOne({ code: code.toUpperCase(), isActive: true });
  };

  Region = mongoose.model("Region", regionSchema);
}

module.exports = Region;
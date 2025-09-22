const mongoose = require("mongoose");

let Department;

if (mongoose.models.Department) {
  Department = mongoose.model("Department");
} else {
  const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: String,
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH' },

    // Department Head
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

    // Budget Information
    budget: { type: Number, min: 0 },
    costCenter: String,

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' }
  });

  // Indexes
  departmentSchema.index({ code: 1 });
  departmentSchema.index({ branch: 1 });
  departmentSchema.index({ status: 1 });

  // Pre-save middleware
  departmentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Static method to find active departments
  departmentSchema.statics.findActive = function() {
    return this.find({ status: 'active' });
  };

  Department = mongoose.model("Department", departmentSchema);
}

module.exports = Department;
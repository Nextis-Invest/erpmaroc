import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code?: string;
  description?: string;
  manager?: mongoose.Types.ObjectId;
  parentDepartment?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema: Schema<IDepartment> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du département est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Le code ne peut pas dépasser 10 caractères'],
      sparse: true // Allows multiple null values
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    parentDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret._id = ret._id.toString();
        if (ret.manager) ret.manager = ret.manager.toString();
        if (ret.parentDepartment) ret.parentDepartment = ret.parentDepartment.toString();
        return ret;
      }
    }
  }
);

// Index for faster queries
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 }, { sparse: true });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ parentDepartment: 1 });

// Ensure unique name within the same parent department
departmentSchema.index(
  { name: 1, parentDepartment: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

// Static method to find active departments
departmentSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find by name (case insensitive)
departmentSchema.statics.findByName = function(name: string) {
  return this.findOne({
    name: new RegExp(`^${name}$`, 'i'),
    isActive: true
  });
};

// Virtual for subdepartments
departmentSchema.virtual('subdepartments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'parentDepartment'
});

const Department: Model<IDepartment> = mongoose.models.Department ||
  mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;
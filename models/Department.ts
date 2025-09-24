import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  _id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentDepartment?: string;
  budget?: number;
  employeeCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  parentDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  budget: {
    type: Number,
    default: 0
  },
  employeeCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ isActive: 1 });

// Méthode pour obtenir le nom complet du département avec son code
DepartmentSchema.methods.getFullName = function() {
  return `${this.name} (${this.code})`;
};

// Méthode statique pour obtenir les départements actifs
DepartmentSchema.statics.getActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Empêcher la recréation du modèle
let Department: Model<IDepartment>;

try {
  Department = mongoose.model<IDepartment>('Department');
} catch {
  Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
}

export default Department;
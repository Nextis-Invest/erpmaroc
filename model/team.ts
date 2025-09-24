import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  code?: string;
  description?: string;
  department: mongoose.Types.ObjectId;
  manager?: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  maxMembers?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema: Schema<ITeam> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de l\'équipe est requis'],
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
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Le département est requis']
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    maxMembers: {
      type: Number,
      min: [1, 'Le nombre maximum de membres doit être au moins 1'],
      max: [100, 'Le nombre maximum de membres ne peut pas dépasser 100']
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
        if (ret.department) ret.department = ret.department.toString();
        if (ret.manager) ret.manager = ret.manager.toString();
        if (ret.leadId) ret.leadId = ret.leadId.toString();
        return ret;
      }
    }
  }
);

// Index for faster queries
teamSchema.index({ name: 1 });
teamSchema.index({ code: 1 }, { sparse: true });
teamSchema.index({ department: 1 });
teamSchema.index({ isActive: 1 });

// Ensure unique name within the same department
teamSchema.index(
  { name: 1, department: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

// Static method to find active teams
teamSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find teams by department
teamSchema.statics.findByDepartment = function(departmentId: string) {
  return this.find({
    department: departmentId,
    isActive: true
  }).sort({ name: 1 });
};

// Static method to find by name (case insensitive)
teamSchema.statics.findByName = function(name: string, departmentId?: string) {
  const query: any = {
    name: new RegExp(`^${name}$`, 'i'),
    isActive: true
  };

  if (departmentId) {
    query.department = departmentId;
  }

  return this.findOne(query);
};

// Virtual for team members count
teamSchema.virtual('membersCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'team',
  count: true
});

const Team: Model<ITeam> = mongoose.models.Team ||
  mongoose.model<ITeam>('Team', teamSchema);

export default Team;
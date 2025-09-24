import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeam extends Document {
  _id: string;
  name: string;
  code: string;
  description?: string;
  departmentId?: string;
  teamLeadId?: string;
  memberCount?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  teamLeadId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  memberCount: {
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

// Index pour améliorer les performances
TeamSchema.index({ name: 1 });
TeamSchema.index({ code: 1 });
TeamSchema.index({ departmentId: 1 });
TeamSchema.index({ isActive: 1 });

// Méthode pour obtenir le nom complet de l'équipe
TeamSchema.methods.getFullName = function() {
  return `${this.name} (${this.code})`;
};

// Méthode statique pour obtenir les équipes actives
TeamSchema.statics.getActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Méthode statique pour obtenir les équipes d'un département
TeamSchema.statics.getByDepartment = function(departmentId: string) {
  return this.find({ departmentId, isActive: true }).sort({ name: 1 });
};

// Empêcher la recréation du modèle
let Team: Model<ITeam>;

try {
  Team = mongoose.model<ITeam>('Team');
} catch {
  Team = mongoose.model<ITeam>('Team', TeamSchema);
}

export default Team;
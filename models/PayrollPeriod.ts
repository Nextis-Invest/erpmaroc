import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayrollPeriod extends Document {
  mois: number;
  annee: number;
  date_debut: Date;
  date_fin: Date;
  statut: 'BROUILLON' | 'EN_COURS' | 'CLOTURE' | 'ARCHIVE';
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  closed_at?: Date;
  closed_by?: string;
  company_id?: string;
  total_employees?: number;
  total_salaries?: number;
  total_cotisations?: number;
  total_net?: number;
  notes?: string;
}

const PayrollPeriodSchema: Schema = new Schema({
  mois: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  annee: {
    type: Number,
    required: true,
    min: 2020,
    max: 2050,
    index: true
  },
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['BROUILLON', 'EN_COURS', 'CLOTURE', 'ARCHIVE'],
    default: 'BROUILLON',
    required: true,
    index: true
  },
  created_by: {
    type: String,
    default: null
  },
  closed_at: {
    type: Date,
    default: null
  },
  closed_by: {
    type: String,
    default: null
  },
  company_id: {
    type: String,
    default: 'default',
    index: true
  },
  total_employees: {
    type: Number,
    default: 0
  },
  total_salaries: {
    type: Number,
    default: 0
  },
  total_cotisations: {
    type: Number,
    default: 0
  },
  total_net: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Index composé unique pour éviter les doublons de période par entreprise
PayrollPeriodSchema.index({ mois: 1, annee: 1, company_id: 1 }, { unique: true });

// Méthode pour vérifier si la période peut être modifiée
PayrollPeriodSchema.methods.canBeModified = function(): boolean {
  return this.statut === 'BROUILLON' || this.statut === 'EN_COURS';
};

// Méthode pour clôturer une période
PayrollPeriodSchema.methods.close = function(userId: string) {
  if (this.statut !== 'EN_COURS') {
    throw new Error('Seules les périodes EN_COURS peuvent être clôturées');
  }
  this.statut = 'CLOTURE';
  this.closed_at = new Date();
  this.closed_by = userId;
  return this.save();
};

// Méthode statique pour obtenir la période active
PayrollPeriodSchema.statics.getActivePeriod = async function(company_id = 'default'): Promise<IPayrollPeriod | null> {
  return this.findOne({
    company_id,
    statut: { $in: ['BROUILLON', 'EN_COURS'] }
  }).sort({ annee: -1, mois: -1 });
};

// Méthode statique pour créer une nouvelle période
PayrollPeriodSchema.statics.createPeriod = async function(
  mois: number,
  annee: number,
  company_id = 'default',
  created_by?: string
): Promise<IPayrollPeriod> {
  // Vérifier si une période existe déjà
  const existing = await this.findOne({ mois, annee, company_id });
  if (existing) {
    throw new Error(`Une période existe déjà pour ${mois}/${annee}`);
  }

  // Créer la nouvelle période
  const period = new this({
    mois,
    annee,
    date_debut: new Date(annee, mois - 1, 1),
    date_fin: new Date(annee, mois, 0, 23, 59, 59),
    company_id,
    created_by,
    statut: 'BROUILLON'
  });

  return period.save();
};

// Empêcher la modification du modèle si déjà compilé
let PayrollPeriod: Model<IPayrollPeriod>;

try {
  PayrollPeriod = mongoose.model<IPayrollPeriod>('PayrollPeriod');
} catch {
  PayrollPeriod = mongoose.model<IPayrollPeriod>('PayrollPeriod', PayrollPeriodSchema);
}

export default PayrollPeriod;
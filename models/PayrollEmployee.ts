import mongoose, { Schema, Document } from 'mongoose';
import type { PayrollEmployee as PayrollEmployeeType } from '@/types/payroll';

// Extend the PayrollEmployee interface to include MongoDB document properties
export interface PayrollEmployeeDocument extends PayrollEmployeeType, Document {}

const PayrollEmployeeSchema: Schema = new Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  cin: {
    type: String,
    sparse: true,
    trim: true
  },
  date_embauche: {
    type: String,
    required: true
  },
  date_naissance: {
    type: String,
    sparse: true
  },
  fonction: {
    type: String,
    sparse: true,
    trim: true
  },
  situation_familiale: {
    type: String,
    required: true,
    enum: ['CELIBATAIRE', 'MARIE', 'DIVORCE', 'VEUF'],
    default: 'CELIBATAIRE'
  },
  nombre_enfants: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  cnss_numero: {
    type: String,
    sparse: true,
    trim: true
  },
  mode_paiement: {
    type: String,
    enum: ['VIR', 'CHQ', 'ESP'],
    default: 'VIR'
  },

  // Salary & Working Time
  salaire_base: {
    type: Number,
    required: true,
    min: 0
  },
  taux_horaire: {
    type: Number,
    min: 0,
    sparse: true
  },
  heures_travaillees: {
    type: Number,
    min: 0,
    max: 220,
    sparse: true
  },
  jours_conges_payes: {
    type: Number,
    min: 0,
    max: 30,
    sparse: true
  },
  jours_feries: {
    type: Number,
    min: 0,
    max: 10,
    sparse: true
  },
  heures_supp_25: {
    type: Number,
    min: 0,
    sparse: true
  },
  heures_supp_50: {
    type: Number,
    min: 0,
    sparse: true
  },
  heures_supp_100: {
    type: Number,
    min: 0,
    sparse: true
  },

  // Allowances & Benefits
  prime_transport: {
    type: Number,
    min: 0,
    sparse: true
  },
  prime_panier: {
    type: Number,
    min: 0,
    sparse: true
  },
  indemnite_representation: {
    type: Number,
    min: 0,
    sparse: true
  },
  indemnite_deplacement: {
    type: Number,
    min: 0,
    sparse: true
  },
  autres_primes: {
    type: Number,
    min: 0,
    sparse: true
  },
  autres_indemnites: {
    type: Number,
    min: 0,
    sparse: true
  },

  // Deductions & Contributions
  cotisation_mutuelle: {
    type: Number,
    min: 0,
    sparse: true
  },
  cotisation_cimr: {
    type: Number,
    min: 0,
    sparse: true
  },
  avance_salaire: {
    type: Number,
    min: 0,
    sparse: true
  },
  autres_deductions: {
    type: Number,
    min: 0,
    sparse: true
  },

  // Legacy fields
  cimr_numero: {
    type: String,
    sparse: true,
    trim: true
  },
  adresse: {
    type: String,
    sparse: true,
    trim: true
  },
  rib: {
    type: String,
    sparse: true,
    trim: true
  },
  banque: {
    type: String,
    sparse: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'payroll_employees'
});

// Indexes for better performance
PayrollEmployeeSchema.index({ employeeId: 1 }, { unique: true });
PayrollEmployeeSchema.index({ nom: 1, prenom: 1 });
PayrollEmployeeSchema.index({ cin: 1 }, { sparse: true });
PayrollEmployeeSchema.index({ cnss_numero: 1 }, { sparse: true });
PayrollEmployeeSchema.index({ date_embauche: 1 });

// Pre-save middleware to ensure data consistency
PayrollEmployeeSchema.pre('save', function(next) {
  // Ensure CIN is uppercase if provided
  if (this.cin) {
    this.cin = this.cin.toUpperCase();
  }

  // Ensure names are properly formatted
  if (this.nom) {
    this.nom = this.nom.toUpperCase();
  }
  if (this.prenom) {
    this.prenom = this.prenom.charAt(0).toUpperCase() + this.prenom.slice(1).toLowerCase();
  }

  // Calculate hourly rate if not provided
  if (!this.taux_horaire && this.salaire_base) {
    const heuresParMois = this.heures_travaillees || 191;
    this.taux_horaire = Math.round((this.salaire_base / heuresParMois) * 100) / 100;
  }

  next();
});

// Instance methods
PayrollEmployeeSchema.methods.getFullName = function(): string {
  return `${this.prenom} ${this.nom}`;
};

PayrollEmployeeSchema.methods.calculateAge = function(): number | null {
  if (!this.date_naissance) return null;

  const today = new Date();
  const birthDate = new Date(this.date_naissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

PayrollEmployeeSchema.methods.calculateSeniority = function(): number {
  const today = new Date();
  const hireDate = new Date(this.date_embauche);

  const years = today.getFullYear() - hireDate.getFullYear();
  const months = today.getMonth() - hireDate.getMonth();

  return years * 12 + months;
};

// Static methods
PayrollEmployeeSchema.statics.findByEmployeeId = function(employeeId: string) {
  return this.findOne({ employeeId });
};

PayrollEmployeeSchema.statics.findActiveByCIN = function(cin: string) {
  return this.findOne({ cin: cin.toUpperCase() });
};

PayrollEmployeeSchema.statics.searchByName = function(searchTerm: string) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { nom: regex },
      { prenom: regex },
      { employeeId: regex }
    ]
  });
};

// Export the model
export default mongoose.models.PayrollEmployee ||
  mongoose.model<PayrollEmployeeDocument>('PayrollEmployee', PayrollEmployeeSchema);
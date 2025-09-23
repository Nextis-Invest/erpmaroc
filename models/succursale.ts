import { Schema, model, models, Document } from 'mongoose';

export interface ISuccursale extends Document {
  name: string;
  code: string; // Unique identifier code (e.g., CAS001, RAB001)
  city: string;
  region: string;
  address: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Management
  manager: {
    name: string;
    email: string;
    phone: string;
    startDate: Date;
  };

  // Contact Information
  phone: string;
  email: string;
  fax?: string;
  website?: string;

  // Business Information
  businessLicense: string;
  taxId: string;
  openingDate: Date;
  closingDate?: Date;

  // Operational Details
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  type: 'main' | 'branch' | 'depot' | 'showroom' | 'office';
  category: 'retail' | 'wholesale' | 'corporate' | 'service';

  // Staff and Performance
  employees: {
    total: number;
    fullTime: number;
    partTime: number;
    managers: number;
    sales: number;
    support: number;
  };

  // Financial Metrics
  financials: {
    revenue: {
      monthly: number;
      quarterly: number;
      yearly: number;
      lastUpdated: Date;
    };
    expenses: {
      rent: number;
      utilities: number;
      salaries: number;
      other: number;
      lastUpdated: Date;
    };
    targets: {
      monthlyRevenue: number;
      yearlyRevenue: number;
      employeeProductivity: number;
    };
  };

  // Services Offered
  services: string[]; // Array of service types offered
  departments: string[]; // Departments present in this branch

  // Facilities and Equipment
  facilities: {
    area: number; // Square meters
    parking: {
      available: boolean;
      spaces: number;
    };
    accessibility: boolean;
    security: {
      cameras: boolean;
      alarm: boolean;
      guard: boolean;
    };
    equipment: string[]; // List of major equipment
  };

  // Operating Hours
  operatingHours: {
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
    ramadan?: {
      open: string;
      close: string;
    };
  };

  // Parent/Child Relationships
  parentBranch?: Schema.Types.ObjectId; // Reference to parent branch
  childBranches: Schema.Types.ObjectId[]; // References to child branches

  // Compliance and Certifications
  certifications: {
    name: string;
    authority: string;
    issueDate: Date;
    expiryDate: Date;
    status: 'valid' | 'expired' | 'pending_renewal';
  }[];

  // Additional Information
  description?: string;
  notes?: string;
  images: string[]; // URLs to branch images

  // Audit Trail
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Metadata
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Schema.Types.ObjectId;
}

const SuccursaleSchema = new Schema<ISuccursale>({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Le nom de la succursale est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },

  code: {
    type: String,
    required: [true, 'Le code de la succursale est requis'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{3}\d{3}$/, 'Le code doit suivre le format ABC123']
  },

  city: {
    type: String,
    required: [true, 'La ville est requise'],
    trim: true
  },

  region: {
    type: String,
    required: [true, 'La région est requise'],
    trim: true
  },

  address: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true,
    maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
  },

  postalCode: {
    type: String,
    trim: true,
    match: [/^\d{5}$/, 'Le code postal doit contenir 5 chiffres']
  },

  coordinates: {
    lat: {
      type: Number,
      min: [-90, 'La latitude doit être entre -90 et 90'],
      max: [90, 'La latitude doit être entre -90 et 90']
    },
    lng: {
      type: Number,
      min: [-180, 'La longitude doit être entre -180 et 180'],
      max: [180, 'La longitude doit être entre -180 et 180']
    }
  },

  // Management
  manager: {
    name: {
      type: String,
      required: [true, 'Le nom du responsable est requis'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'L\'email du responsable est requis'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone du responsable est requis'],
      trim: true,
      match: [/^\+212[5-7]\d{8}$/, 'Format de téléphone marocain invalide']
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début du responsable est requise']
    }
  },

  // Contact Information
  phone: {
    type: String,
    required: [true, 'Le téléphone de la succursale est requis'],
    trim: true,
    match: [/^\+212[5-7]\d{8}$/, 'Format de téléphone marocain invalide']
  },

  email: {
    type: String,
    required: [true, 'L\'email de la succursale est requis'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },

  fax: {
    type: String,
    trim: true
  },

  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'URL invalide']
  },

  // Business Information
  businessLicense: {
    type: String,
    required: [true, 'La licence commerciale est requise'],
    trim: true
  },

  taxId: {
    type: String,
    required: [true, 'L\'identifiant fiscal est requis'],
    trim: true
  },

  openingDate: {
    type: Date,
    required: [true, 'La date d\'ouverture est requise']
  },

  closingDate: {
    type: Date,
    validate: {
      validator: function(this: ISuccursale, value: Date) {
        return !value || value > this.openingDate;
      },
      message: 'La date de fermeture doit être postérieure à la date d\'ouverture'
    }
  },

  // Operational Details
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'pending', 'suspended'],
      message: 'Statut invalide'
    },
    default: 'pending'
  },

  type: {
    type: String,
    enum: {
      values: ['main', 'branch', 'depot', 'showroom', 'office'],
      message: 'Type invalide'
    },
    default: 'branch'
  },

  category: {
    type: String,
    enum: {
      values: ['retail', 'wholesale', 'corporate', 'service'],
      message: 'Catégorie invalide'
    },
    default: 'retail'
  },

  // Staff and Performance
  employees: {
    total: { type: Number, default: 0, min: 0 },
    fullTime: { type: Number, default: 0, min: 0 },
    partTime: { type: Number, default: 0, min: 0 },
    managers: { type: Number, default: 0, min: 0 },
    sales: { type: Number, default: 0, min: 0 },
    support: { type: Number, default: 0, min: 0 }
  },

  // Financial Metrics
  financials: {
    revenue: {
      monthly: { type: Number, default: 0, min: 0 },
      quarterly: { type: Number, default: 0, min: 0 },
      yearly: { type: Number, default: 0, min: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    expenses: {
      rent: { type: Number, default: 0, min: 0 },
      utilities: { type: Number, default: 0, min: 0 },
      salaries: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
      lastUpdated: { type: Date, default: Date.now }
    },
    targets: {
      monthlyRevenue: { type: Number, default: 0, min: 0 },
      yearlyRevenue: { type: Number, default: 0, min: 0 },
      employeeProductivity: { type: Number, default: 0, min: 0 }
    }
  },

  // Services and Departments
  services: {
    type: [String],
    default: []
  },

  departments: {
    type: [String],
    default: []
  },

  // Facilities and Equipment
  facilities: {
    area: { type: Number, min: 0 },
    parking: {
      available: { type: Boolean, default: false },
      spaces: { type: Number, default: 0, min: 0 }
    },
    accessibility: { type: Boolean, default: false },
    security: {
      cameras: { type: Boolean, default: false },
      alarm: { type: Boolean, default: false },
      guard: { type: Boolean, default: false }
    },
    equipment: {
      type: [String],
      default: []
    }
  },

  // Operating Hours
  operatingHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '13:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '13:00' },
      closed: { type: Boolean, default: true }
    },
    ramadan: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '16:00' }
    }
  },

  // Relationships
  parentBranch: {
    type: Schema.Types.ObjectId,
    ref: 'Succursale'
  },

  childBranches: [{
    type: Schema.Types.ObjectId,
    ref: 'Succursale'
  }],

  // Certifications
  certifications: [{
    name: { type: String, required: true },
    authority: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['valid', 'expired', 'pending_renewal'],
      default: 'valid'
    }
  }],

  // Additional Information
  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },

  notes: {
    type: String,
    maxlength: [2000, 'Les notes ne peuvent pas dépasser 2000 caractères']
  },

  images: {
    type: [String],
    default: []
  },

  // Audit Trail
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Metadata
  version: {
    type: Number,
    default: 1
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date
  },

  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'succursales'
});

// Indexes for better performance
SuccursaleSchema.index({ code: 1 }, { unique: true });
SuccursaleSchema.index({ city: 1, region: 1 });
SuccursaleSchema.index({ status: 1 });
SuccursaleSchema.index({ 'manager.email': 1 });
SuccursaleSchema.index({ isDeleted: 1 });
SuccursaleSchema.index({ createdAt: -1 });
SuccursaleSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 }); // For geospatial queries

// Virtual for full address
SuccursaleSchema.virtual('fullAddress').get(function(this: ISuccursale) {
  return `${this.address}, ${this.city}, ${this.region}${this.postalCode ? ` ${this.postalCode}` : ''}`;
});

// Virtual for total expenses
SuccursaleSchema.virtual('totalMonthlyExpenses').get(function(this: ISuccursale) {
  const expenses = this.financials.expenses;
  return expenses.rent + expenses.utilities + expenses.salaries + expenses.other;
});

// Virtual for profit/loss
SuccursaleSchema.virtual('monthlyProfit').get(function(this: ISuccursale) {
  return this.financials.revenue.monthly - this.totalMonthlyExpenses;
});

// Pre-save middleware to generate code if not provided
SuccursaleSchema.pre('save', function(this: ISuccursale, next) {
  if (!this.code && this.city) {
    // Generate code from city name (first 3 letters + random 3 digits)
    const cityCode = this.city.substring(0, 3).toUpperCase();
    const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.code = `${cityCode}${randomNumber}`;
  }

  // Update version on modification
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }

  next();
});

// Pre-save middleware to validate employee totals
SuccursaleSchema.pre('save', function(this: ISuccursale, next) {
  const emp = this.employees;
  const calculatedTotal = emp.fullTime + emp.partTime;

  if (emp.total !== calculatedTotal) {
    emp.total = calculatedTotal;
  }

  next();
});

// Method to check if branch is operational
SuccursaleSchema.methods.isOperational = function(this: ISuccursale): boolean {
  return this.status === 'active' && !this.isDeleted;
};

// Method to get current day operating hours
SuccursaleSchema.methods.getTodayHours = function(this: ISuccursale) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return this.operatingHours[today];
};

// Static method to find branches by region
SuccursaleSchema.statics.findByRegion = function(region: string) {
  return this.find({ region, isDeleted: false });
};

// Static method to find active branches
SuccursaleSchema.statics.findActive = function() {
  return this.find({ status: 'active', isDeleted: false });
};

// Export the model
const Succursale = models.Succursale || model<ISuccursale>('Succursale', SuccursaleSchema);

export default Succursale;
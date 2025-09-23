import { connectToDB } from '@/lib/database/connectToDB';
import Succursale from '@/models/succursale';
import { moroccanCities, getHighPriorityCities } from '@/lib/data/moroccan-cities';

interface SeedSuccursale {
  name: string;
  city: string;
  region: string;
  address: string;
  manager: {
    name: string;
    email: string;
    phone: string;
    startDate: Date;
  };
  phone: string;
  email: string;
  businessLicense: string;
  taxId: string;
  openingDate: Date;
  status: 'active' | 'inactive' | 'pending';
  type: 'main' | 'branch' | 'depot' | 'showroom' | 'office';
  category: 'retail' | 'wholesale' | 'corporate' | 'service';
  employees: {
    total: number;
    fullTime: number;
    partTime: number;
    managers: number;
    sales: number;
    support: number;
  };
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
  services: string[];
  departments: string[];
  facilities: {
    area: number;
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
    equipment: string[];
  };
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Sample data for major Moroccan cities
const sampleSuccursales: Partial<SeedSuccursale>[] = [
  // Main Economic Centers
  {
    name: 'Succursale Casablanca Centre',
    city: 'Casablanca',
    address: 'Boulevard Mohammed V, Quartier Maarif, Casablanca',
    manager: {
      name: 'Ahmed Benali',
      email: 'ahmed.benali@company.ma',
      phone: '+212522123456',
      startDate: new Date('2020-01-15')
    },
    phone: '+212522789012',
    email: 'casablanca.centre@company.ma',
    businessLicense: 'CAS-2020-001',
    taxId: 'IF-12345678',
    openingDate: new Date('2020-02-01'),
    status: 'active' as const,
    type: 'main' as const,
    category: 'retail' as const,
    employees: {
      total: 45,
      fullTime: 35,
      partTime: 10,
      managers: 5,
      sales: 25,
      support: 15
    },
    financials: {
      revenue: {
        monthly: 850000,
        quarterly: 2550000,
        yearly: 10200000,
        lastUpdated: new Date()
      },
      expenses: {
        rent: 180000,
        utilities: 45000,
        salaries: 420000,
        other: 85000,
        lastUpdated: new Date()
      },
      targets: {
        monthlyRevenue: 900000,
        yearlyRevenue: 10800000,
        employeeProductivity: 22667
      }
    },
    services: ['Vente', 'SAV', 'Formation', 'Conseil'],
    departments: ['Commercial', 'Technique', 'Administration', 'Logistique'],
    facilities: {
      area: 1200,
      parking: { available: true, spaces: 50 },
      accessibility: true,
      security: { cameras: true, alarm: true, guard: true },
      equipment: ['Système de caisse', 'Climatisation', 'Réseau informatique', 'Système de sécurité']
    },
    description: 'Notre succursale principale au cœur économique du Maroc, offrant une gamme complète de services.'
  },

  {
    name: 'Succursale Rabat Capital',
    city: 'Rabat',
    address: 'Avenue Mohammed VI, Hay Riad, Rabat',
    manager: {
      name: 'Fatima Zahra Alami',
      email: 'fatima.alami@company.ma',
      phone: '+212537987654',
      startDate: new Date('2019-06-10')
    },
    phone: '+212537456789',
    email: 'rabat.capital@company.ma',
    businessLicense: 'RAB-2019-002',
    taxId: 'IF-23456789',
    openingDate: new Date('2019-07-01'),
    status: 'active' as const,
    type: 'branch' as const,
    category: 'corporate' as const,
    employees: {
      total: 32,
      fullTime: 28,
      partTime: 4,
      managers: 4,
      sales: 18,
      support: 10
    },
    financials: {
      revenue: {
        monthly: 620000,
        quarterly: 1860000,
        yearly: 7440000,
        lastUpdated: new Date()
      },
      expenses: {
        rent: 150000,
        utilities: 35000,
        salaries: 280000,
        other: 65000,
        lastUpdated: new Date()
      },
      targets: {
        monthlyRevenue: 650000,
        yearlyRevenue: 7800000,
        employeeProductivity: 23250
      }
    },
    services: ['Vente', 'Conseil', 'Formation professionnelle'],
    departments: ['Commercial', 'Administration', 'Formation'],
    facilities: {
      area: 900,
      parking: { available: true, spaces: 35 },
      accessibility: true,
      security: { cameras: true, alarm: true, guard: false },
      equipment: ['Système de caisse', 'Salle de formation', 'Réseau informatique']
    },
    description: 'Succursale stratégique près des institutions gouvernementales, spécialisée dans le secteur corporate.'
  },

  {
    name: 'Succursale Marrakech Imperial',
    city: 'Marrakech',
    address: 'Avenue de la Menara, Gueliz, Marrakech',
    manager: {
      name: 'Youssef Bennani',
      email: 'youssef.bennani@company.ma',
      phone: '+212524456789',
      startDate: new Date('2021-03-20')
    },
    phone: '+212524123789',
    email: 'marrakech.imperial@company.ma',
    businessLicense: 'MAR-2021-003',
    taxId: 'IF-34567890',
    openingDate: new Date('2021-04-15'),
    status: 'active' as const,
    type: 'branch' as const,
    category: 'retail' as const,
    employees: {
      total: 28,
      fullTime: 22,
      partTime: 6,
      managers: 3,
      sales: 18,
      support: 7
    },
    financials: {
      revenue: {
        monthly: 580000,
        quarterly: 1740000,
        yearly: 6960000,
        lastUpdated: new Date()
      },
      expenses: {
        rent: 120000,
        utilities: 40000,
        salaries: 245000,
        other: 55000,
        lastUpdated: new Date()
      },
      targets: {
        monthlyRevenue: 600000,
        yearlyRevenue: 7200000,
        employeeProductivity: 24857
      }
    },
    services: ['Vente', 'SAV', 'Tourisme d\'affaires'],
    departments: ['Commercial', 'Technique', 'Tourisme'],
    facilities: {
      area: 750,
      parking: { available: true, spaces: 25 },
      accessibility: true,
      security: { cameras: true, alarm: true, guard: false },
      equipment: ['Système de caisse', 'Climatisation', 'Point d\'information touristique']
    },
    description: 'Au cœur de la ville rouge, proche des attractions touristiques, adaptée au marché local et touristique.'
  },

  {
    name: 'Succursale Tanger Med',
    city: 'Tanger',
    address: 'Zone Franche Tanger Med, Port de Tanger',
    manager: {
      name: 'Rachid Tazi',
      email: 'rachid.tazi@company.ma',
      phone: '+212539321147',
      startDate: new Date('2023-10-01')
    },
    phone: '+212539654321',
    email: 'tanger.med@company.ma',
    businessLicense: 'TAN-2023-004',
    taxId: 'IF-45678901',
    openingDate: new Date('2023-11-01'),
    status: 'pending' as const,
    type: 'depot' as const,
    category: 'wholesale' as const,
    employees: {
      total: 22,
      fullTime: 18,
      partTime: 4,
      managers: 2,
      sales: 12,
      support: 8
    },
    financials: {
      revenue: {
        monthly: 420000,
        quarterly: 1260000,
        yearly: 5040000,
        lastUpdated: new Date()
      },
      expenses: {
        rent: 100000,
        utilities: 25000,
        salaries: 185000,
        other: 45000,
        lastUpdated: new Date()
      },
      targets: {
        monthlyRevenue: 450000,
        yearlyRevenue: 5400000,
        employeeProductivity: 22909
      }
    },
    services: ['Logistique', 'Import/Export', 'Stockage'],
    departments: ['Logistique', 'Douanes', 'Commercial'],
    facilities: {
      area: 2000,
      parking: { available: true, spaces: 40 },
      accessibility: true,
      security: { cameras: true, alarm: true, guard: true },
      equipment: ['Entrepôt', 'Chariots élévateurs', 'Système de gestion d\'entrepôt']
    },
    description: 'Nouvelle succursale stratégique près du port Tanger Med, spécialisée dans la logistique et l\'import/export.'
  },

  {
    name: 'Succursale Fès Médina',
    city: 'Fès',
    address: 'Avenue Hassan II, Ville Nouvelle, Fès',
    manager: {
      name: 'Aicha Fassi',
      email: 'aicha.fassi@company.ma',
      phone: '+212535789123',
      startDate: new Date('2022-02-14')
    },
    phone: '+212535456123',
    email: 'fes.medina@company.ma',
    businessLicense: 'FES-2022-005',
    taxId: 'IF-56789012',
    openingDate: new Date('2022-03-15'),
    status: 'active' as const,
    type: 'branch' as const,
    category: 'retail' as const,
    employees: {
      total: 25,
      fullTime: 20,
      partTime: 5,
      managers: 3,
      sales: 15,
      support: 7
    },
    financials: {
      revenue: {
        monthly: 480000,
        quarterly: 1440000,
        yearly: 5760000,
        lastUpdated: new Date()
      },
      expenses: {
        rent: 90000,
        utilities: 30000,
        salaries: 210000,
        other: 40000,
        lastUpdated: new Date()
      },
      targets: {
        monthlyRevenue: 500000,
        yearlyRevenue: 6000000,
        employeeProductivity: 23040
      }
    },
    services: ['Vente', 'Artisanat', 'Patrimoine'],
    departments: ['Commercial', 'Artisanat', 'Culture'],
    facilities: {
      area: 650,
      parking: { available: false, spaces: 0 },
      accessibility: false,
      security: { cameras: true, alarm: true, guard: false },
      equipment: ['Système de caisse', 'Espace exposition artisanat']
    },
    description: 'Succursale dans la capitale spirituelle, valorisant l\'artisanat et le patrimoine marocain.'
  },

  {
    name: 'Succursale Agadir Atlantique',
    city: 'Agadir',
    address: 'Boulevard du 20 Août, Centre-ville, Agadir',
    manager: {
      name: 'Mohamed Souss',
      email: 'mohamed.souss@company.ma',
      phone: '+212528987456',
      startDate: new Date('2021-11-01')
    },
    phone: '+212528123456',
    email: 'agadir.atlantique@company.ma',
    businessLicense: 'AGA-2021-006',
    taxId: 'IF-67890123',
    openingDate: new Date('2021-12-01'),
    status: 'active' as const,
    type: 'branch' as const,
    category: 'service' as const,
    employees: {
      total: 30,
      fullTime: 24,
      partTime: 6,
      managers: 3,
      sales: 20,
      support: 7
    },
    financials: {
      revenue: {
        monthly: 550000,
        quarterly: 1650000,
        yearly: 6600000,
        lastUpdated: new Date()
      },
      expenses: {
        rent: 110000,
        utilities: 35000,
        salaries: 235000,
        other: 50000,
        lastUpdated: new Date()
      },
      targets: {
        monthlyRevenue: 580000,
        yearlyRevenue: 6960000,
        employeeProductivity: 22000
      }
    },
    services: ['Tourisme', 'Hôtellerie', 'Services aux entreprises'],
    departments: ['Tourisme', 'Commercial', 'Services'],
    facilities: {
      area: 800,
      parking: { available: true, spaces: 30 },
      accessibility: true,
      security: { cameras: true, alarm: true, guard: false },
      equipment: ['Système de caisse', 'Bureau d\'information touristique']
    },
    description: 'Capitale touristique du sud, spécialisée dans les services touristiques et hôteliers.'
  }
];

async function seedSuccursales() {
  try {
    console.log('🌱 Connexion à la base de données...');
    await connectToDB();

    console.log('🗑️ Suppression des succursales existantes...');
    await Succursale.deleteMany({});

    console.log('📊 Insertion des nouvelles succursales...');

    // Create a dummy user ID for createdBy/updatedBy
    // In a real scenario, you would use actual user IDs
    const dummyUserId = '507f1f77bcf86cd799439011';

    const succursalesToInsert = sampleSuccursales.map(succursale => {
      const cityData = moroccanCities.find(c => c.name === succursale.city);

      return {
        ...succursale,
        region: cityData?.region || succursale.city, // Fallback to city if region not found
        coordinates: cityData?.coordinates,
        createdBy: dummyUserId,
        updatedBy: dummyUserId,
        operatingHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '13:00', closed: false },
          sunday: { open: '09:00', close: '13:00', closed: true },
          ramadan: { open: '10:00', close: '16:00' }
        },
        certifications: [
          {
            name: 'ISO 9001',
            authority: 'Bureau Veritas',
            issueDate: new Date('2023-01-15'),
            expiryDate: new Date('2026-01-15'),
            status: 'valid' as const
          }
        ],
        images: [],
        version: 1,
        isDeleted: false
      };
    });

    const insertedSuccursales = await Succursale.insertMany(succursalesToInsert);

    console.log(`✅ ${insertedSuccursales.length} succursales créées avec succès!`);

    // Display summary
    const summary = await Succursale.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          totalEmployees: { $sum: '$employees.total' },
          totalRevenue: { $sum: '$financials.revenue.yearly' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📈 Résumé des succursales par région:');
    summary.forEach(region => {
      console.log(`  ${region._id}: ${region.count} succursale(s), ${region.totalEmployees} employés, ${region.totalRevenue.toLocaleString()} MAD/an`);
    });

    const totalStats = await Succursale.aggregate([
      {
        $group: {
          _id: null,
          totalSuccursales: { $sum: 1 },
          totalEmployees: { $sum: '$employees.total' },
          totalRevenue: { $sum: '$financials.revenue.yearly' },
          avgRevenue: { $avg: '$financials.revenue.yearly' }
        }
      }
    ]);

    const stats = totalStats[0];
    console.log('\n🏢 Statistiques globales:');
    console.log(`  Total succursales: ${stats.totalSuccursales}`);
    console.log(`  Total employés: ${stats.totalEmployees}`);
    console.log(`  Chiffre d'affaires total: ${stats.totalRevenue.toLocaleString()} MAD/an`);
    console.log(`  CA moyen par succursale: ${stats.avgRevenue.toLocaleString()} MAD/an`);

    console.log('\n🎉 Seeding terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  seedSuccursales()
    .then(() => {
      console.log('✨ Script de seeding terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export default seedSuccursales;
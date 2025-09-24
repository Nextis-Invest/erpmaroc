require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI n\'est pas défini dans les variables d\'environnement');
  process.exit(1);
}

const defaultRoles = [
  {
    name: "Super Admin",
    description: "Accès complet à toutes les fonctionnalités",
    permissions: [
      "users.create", "users.read", "users.update", "users.delete",
      "roles.create", "roles.read", "roles.update", "roles.delete",
      "employees.create", "employees.read", "employees.update", "employees.delete",
      "payroll.create", "payroll.read", "payroll.update", "payroll.delete",
      "reports.read", "settings.update", "system.admin"
    ],
    isActive: true
  },
  {
    name: "Admin",
    description: "Administrateur avec accès aux principales fonctionnalités",
    permissions: [
      "users.read", "users.update",
      "employees.create", "employees.read", "employees.update", "employees.delete",
      "payroll.create", "payroll.read", "payroll.update",
      "reports.read"
    ],
    isActive: true
  },
  {
    name: "HR Manager",
    description: "Gestionnaire des ressources humaines",
    permissions: [
      "employees.create", "employees.read", "employees.update", "employees.delete",
      "payroll.read", "payroll.update",
      "reports.read"
    ],
    isActive: true
  },
  {
    name: "HR Assistant",
    description: "Assistant ressources humaines",
    permissions: [
      "employees.read", "employees.update",
      "payroll.read"
    ],
    isActive: true
  },
  {
    name: "Payroll Manager",
    description: "Gestionnaire de paie",
    permissions: [
      "employees.read",
      "payroll.create", "payroll.read", "payroll.update", "payroll.delete",
      "reports.read"
    ],
    isActive: true
  },
  {
    name: "Employee",
    description: "Employé avec accès limité",
    permissions: [
      "employees.read" // Only their own profile
    ],
    isActive: true
  },
  {
    name: "Viewer",
    description: "Accès en lecture seule",
    permissions: [
      "employees.read",
      "payroll.read",
      "reports.read"
    ],
    isActive: true
  }
];

async function seedRoles() {
  let client;

  try {
    console.log('🔗 Connexion à MongoDB...');
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    const rolesCollection = db.collection('roles');

    console.log('📋 Vérification des rôles existants...');

    for (const role of defaultRoles) {
      const existingRole = await rolesCollection.findOne({ name: role.name });

      if (existingRole) {
        console.log(`⏭️  Rôle '${role.name}' existe déjà`);
      } else {
        await rolesCollection.insertOne({
          ...role,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Rôle '${role.name}' créé`);
      }
    }

    console.log('🎉 Initialisation des rôles terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des rôles:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Execute if run directly
if (require.main === module) {
  seedRoles().catch(console.error);
}

module.exports = { seedRoles };
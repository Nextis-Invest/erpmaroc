#!/usr/bin/env tsx

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import mongoose from 'mongoose';

async function checkDatabase() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('\n📊 Informations sur la base de données:');
    console.log(`└── URI: ${process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@')}`);
    console.log(`└── Nom de la base: ${mongoose.connection.db.databaseName}`);

    // Lister toutes les collections
    console.log('\n📋 Collections disponibles:');
    const collections = await mongoose.connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('└── Aucune collection trouvée');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`└── ${collection.name}: ${count} documents`);
      }
    }

    // Vérifier spécifiquement la collection employees
    console.log('\n👥 Vérification de la collection employees:');
    const employeeCount = await mongoose.connection.db.collection('employees').countDocuments();
    console.log(`└── Nombre d'employés: ${employeeCount}`);

    if (employeeCount > 0) {
      console.log('\n📝 Exemple d\'employé:');
      const sampleEmployee = await mongoose.connection.db.collection('employees').findOne();
      console.log(JSON.stringify(sampleEmployee, null, 2));
    }

    // Vérifier d'autres collections importantes
    const importantCollections = ['departments', 'teams', 'branches', 'admins'];

    console.log('\n🏢 Autres collections importantes:');
    for (const collName of importantCollections) {
      try {
        const count = await mongoose.connection.db.collection(collName).countDocuments();
        console.log(`└── ${collName}: ${count} documents`);
      } catch (error) {
        console.log(`└── ${collName}: Collection n'existe pas`);
      }
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  checkDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default checkDatabase;
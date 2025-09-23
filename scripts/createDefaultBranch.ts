#!/usr/bin/env tsx

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import mongoose from 'mongoose';

async function createDefaultBranch() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('\n🏢 Création de la succursale par défaut...');

    // Vérifier si une succursale existe déjà
    const existingBranches = await mongoose.connection.db.collection('branches').find({}).toArray();

    if (existingBranches.length > 0) {
      console.log('✅ Succursale existante trouvée:');
      existingBranches.forEach(branch => {
        console.log(`└── ${branch.companyName} (${branch._id})`);
      });
      return existingBranches[0]._id;
    }

    // Créer une succursale par défaut
    const defaultBranch = {
      companyName: process.env.COMPANY_NAME || 'NEXTIS TECHNOLOGIES SARL',
      cityName: 'Casablanca',
      address: process.env.COMPANY_ADDRESS || 'Zone Industrielle, Boulevard Hassan II, Casablanca',
      phone: process.env.COMPANY_PHONE || '+212 5 22 123 456',
      email: process.env.COMPANY_EMAIL || 'contact@nextis-tech.ma',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await mongoose.connection.db.collection('branches').insertOne(defaultBranch);
    console.log('✅ Succursale par défaut créée:');
    console.log(`└── ID: ${result.insertedId}`);
    console.log(`└── Nom: ${defaultBranch.companyName}`);
    console.log(`└── Ville: ${defaultBranch.cityName}`);

    return result.insertedId;

  } catch (error) {
    console.error('❌ Erreur lors de la création de la succursale:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  createDefaultBranch()
    .then((branchId) => {
      console.log(`\n🎉 Succursale créée avec l'ID: ${branchId}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default createDefaultBranch;
#!/usr/bin/env tsx

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import Employee from '../model/hr/employee';
import mongoose from 'mongoose';

async function migratePayrollToHR() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('\n📊 Migration des données payroll vers HR...');

    // Récupérer ou créer une succursale par défaut
    let defaultBranch = await mongoose.connection.db.collection('branches').findOne({});

    if (!defaultBranch) {
      console.log('🏢 Création de la succursale par défaut...');
      const branchData = {
        companyName: process.env.COMPANY_NAME || 'NEXTIS TECHNOLOGIES SARL',
        cityName: 'Casablanca',
        address: process.env.COMPANY_ADDRESS || 'Zone Industrielle, Boulevard Hassan II, Casablanca',
        phone: process.env.COMPANY_PHONE || '+212 5 22 123 456',
        email: process.env.COMPANY_EMAIL || 'contact@nextis-tech.ma',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await mongoose.connection.db.collection('branches').insertOne(branchData);
      defaultBranch = { ...branchData, _id: result.insertedId };
      console.log(`✅ Succursale créée: ${defaultBranch.companyName} (${defaultBranch._id})`);
    } else {
      console.log(`✅ Succursale trouvée: ${defaultBranch.companyName} (${defaultBranch._id})`);
    }

    // Récupérer tous les employés de paie
    const payrollEmployees = await mongoose.connection.db.collection('payroll_employees').find({}).toArray();

    console.log(`📈 Nombre d'employés à migrer: ${payrollEmployees.length}`);

    if (payrollEmployees.length === 0) {
      console.log('❌ Aucun employé de paie à migrer');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const payrollEmp of payrollEmployees) {
      try {
        // Vérifier si l'employé existe déjà
        const existingEmployee = await Employee.findOne({
          employeeId: payrollEmp.employeeId || `EMP${String(migratedCount + 1).padStart(3, '0')}`
        });

        if (existingEmployee) {
          console.log(`⚠️ Employé ${payrollEmp.prenom} ${payrollEmp.nom} existe déjà, ignoré`);
          skippedCount++;
          continue;
        }

        // Mapper les données du format payroll vers le format HR
        const hrEmployee = new Employee({
          // Informations de base
          employeeId: payrollEmp.employeeId || `EMP${String(migratedCount + 1).padStart(3, '0')}`,
          firstName: payrollEmp.prenom || 'Prénom',
          lastName: payrollEmp.nom || 'Nom',
          email: `${(payrollEmp.prenom || 'employee').toLowerCase()}.${(payrollEmp.nom || 'employee').toLowerCase()}@nextis-tech.ma`,
          phone: '+212 6 00 00 00 00', // Valeur par défaut

          // Informations d'emploi
          position: payrollEmp.fonction || payrollEmp.poste || 'Employé',
          branch: defaultBranch._id, // Référence à la succursale
          employmentType: 'full-time',
          isFreelance: false,
          status: 'active',

          // Dates importantes
          hireDate: payrollEmp.date_embauche ? new Date(payrollEmp.date_embauche) : new Date(),
          birthDate: payrollEmp.date_naissance ? new Date(payrollEmp.date_naissance) : new Date('1990-01-01'),

          // Compensation
          salary: payrollEmp.salaire_base || 0,

          // Informations personnelles
          gender: 'male', // Valeur par défaut, à ajuster si nécessaire
          maritalStatus: payrollEmp.situation_familiale === 'MARIE' ? 'married' : 'single',
          nationality: 'Marocaine',
          nationalId: payrollEmp.cin || '',
          cnssNumber: payrollEmp.cnss_numero || payrollEmp.cnss_numero || '',

          // Type de contrat
          contractType: 'cdi',

          // Adresse
          address: {
            street: payrollEmp.adresse || '',
            city: 'Casablanca',
            country: 'Maroc'
          },

          // Contact d'urgence (valeurs par défaut)
          emergencyContact: {
            name: 'Contact d\'urgence',
            phone: '+212 6 00 00 00 00'
          },

          // Détails bancaires
          bankAccount: {
            bankName: payrollEmp.banque || '',
            accountNumber: payrollEmp.rib || ''
          },

          // Champs de migration
          migratedFromStaff: false,

          // Champs système
          createdAt: payrollEmp.createdAt ? new Date(payrollEmp.createdAt) : new Date(),
          updatedAt: new Date()
        });

        await hrEmployee.save();
        console.log(`✅ Migré: ${payrollEmp.prenom} ${payrollEmp.nom} (${hrEmployee.employeeId})`);
        migratedCount++;

      } catch (error) {
        const errorMsg = `Erreur lors de la migration de ${payrollEmp.prenom} ${payrollEmp.nom}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log('\n📊 RÉSUMÉ DE LA MIGRATION:');
    console.log(`└── Total traité: ${payrollEmployees.length}`);
    console.log(`└── Migrés avec succès: ${migratedCount}`);
    console.log(`└── Ignorés (existants): ${skippedCount}`);
    console.log(`└── Erreurs: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ ERREURS RENCONTRÉES:');
      errors.forEach(error => console.log(`└── ${error}`));
    }

    // Vérifier le résultat
    const totalHREmployees = await Employee.countDocuments();
    console.log(`\n✅ Total employés dans la collection HR: ${totalHREmployees}`);

    // Exporter le rapport de migration
    const fs = require('fs');
    const reportPath = path.join(process.cwd(), 'exports', 'migration-report.json');

    const migrationReport = {
      migrationDate: new Date().toISOString(),
      sourceCollection: 'payroll_employees',
      targetCollection: 'employees',
      totalProcessed: payrollEmployees.length,
      successfullyMigrated: migratedCount,
      skipped: skippedCount,
      errors: errors.length,
      errorDetails: errors,
      finalCount: totalHREmployees
    };

    // Créer le dossier exports s'il n'existe pas
    const exportsDir = path.dirname(reportPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(migrationReport, null, 2));
    console.log(`💾 Rapport de migration exporté vers: ${reportPath}`);

    console.log('\n🎉 Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  migratePayrollToHR()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default migratePayrollToHR;
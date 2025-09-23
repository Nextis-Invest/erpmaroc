#!/usr/bin/env tsx

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import Employee from '../model/hr/employee';

async function initializeContractHistory() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('\n📋 Initialisation de l\'historique des contrats...');

    // Récupérer tous les employés
    const employees = await Employee.find({});

    console.log(`📈 Nombre d'employés à traiter: ${employees.length}`);

    let updatedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    for (const employee of employees) {
      try {
        let needsUpdate = false;
        const updates: any = {};

        // Initialiser originalHireDate si pas défini
        if (!employee.originalHireDate) {
          updates.originalHireDate = employee.hireDate;
          needsUpdate = true;
          console.log(`📅 Date d'embauche originale ajoutée pour ${employee.firstName} ${employee.lastName}: ${employee.hireDate.toLocaleDateString('fr-FR')}`);
        }

        // Initialiser l'historique des contrats si vide
        if (!employee.contractHistory || employee.contractHistory.length === 0) {
          updates.contractHistory = [{
            contractType: employee.contractType || 'cdi',
            startDate: employee.hireDate,
            reason: 'Contrat initial',
            changeDate: employee.createdAt || employee.hireDate
          }];
          needsUpdate = true;
          console.log(`📝 Historique de contrat initialisé pour ${employee.firstName} ${employee.lastName}: ${employee.contractType || 'cdi'}`);
        }

        // Mise à jour si nécessaire
        if (needsUpdate) {
          await Employee.findByIdAndUpdate(employee._id, updates);
          updatedCount++;
          console.log(`✅ Mis à jour: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
        } else {
          console.log(`ℹ️ Aucune mise à jour nécessaire: ${employee.firstName} ${employee.lastName}`);
        }

      } catch (error) {
        const errorMsg = `Erreur lors de la mise à jour de ${employee.firstName} ${employee.lastName}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        errorsCount++;
      }
    }

    console.log('\n📊 RÉSUMÉ DE L\'INITIALISATION:');
    console.log(`└── Total employés traités: ${employees.length}`);
    console.log(`└── Employés mis à jour: ${updatedCount}`);
    console.log(`└── Erreurs: ${errorsCount}`);

    if (errors.length > 0) {
      console.log('\n❌ ERREURS RENCONTRÉES:');
      errors.forEach(error => console.log(`└── ${error}`));
    }

    // Vérification finale
    console.log('\n🔍 Vérification post-initialisation...');
    const employeesWithHistory = await Employee.countDocuments({
      contractHistory: { $exists: true, $ne: [] }
    });
    const employeesWithOriginalDate = await Employee.countDocuments({
      originalHireDate: { $exists: true }
    });

    console.log(`└── Employés avec historique de contrat: ${employeesWithHistory}`);
    console.log(`└── Employés avec date d'embauche originale: ${employeesWithOriginalDate}`);

    // Export des résultats
    const fs = require('fs');
    const reportPath = path.join(process.cwd(), 'exports', 'contract-history-init-report.json');

    const initReport = {
      initDate: new Date().toISOString(),
      totalEmployees: employees.length,
      updatedEmployees: updatedCount,
      errors: errorsCount,
      errorDetails: errors,
      finalStats: {
        employeesWithHistory: employeesWithHistory,
        employeesWithOriginalDate: employeesWithOriginalDate
      }
    };

    // Créer le dossier exports s'il n'existe pas
    const exportsDir = path.dirname(reportPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(initReport, null, 2));
    console.log(`💾 Rapport d'initialisation exporté vers: ${reportPath}`);

    console.log('\n🎉 Initialisation de l\'historique des contrats terminée avec succès!');

    // Afficher exemple d'utilisation de la nouvelle méthode
    console.log('\n📖 EXEMPLE D\'UTILISATION:');
    console.log('// Pour changer le type de contrat en préservant l\'ancienneté:');
    console.log('const employee = await Employee.findById(employeeId);');
    console.log('employee.changeContractType("freelance", "Passage en freelance", adminId);');
    console.log('await employee.save();');
    console.log('');
    console.log('// L\'ancienneté sera calculée avec originalHireDate:');
    console.log('const yearsOfService = employee.getYearsOfService(); // Utilise originalHireDate');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  initializeContractHistory()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default initializeContractHistory;
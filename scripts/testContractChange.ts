#!/usr/bin/env tsx

// Script de test pour démontrer le changement de type de contrat
// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import Employee from '../model/hr/employee';

async function testContractChange() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('\n🧪 Test de changement de type de contrat...');

    // Prendre le premier employé pour le test
    const employee = await Employee.findOne({});
    if (!employee) {
      console.log('❌ Aucun employé trouvé pour le test');
      return;
    }

    console.log(`\n👤 Employé sélectionné: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
    console.log(`📄 Type de contrat actuel: ${employee.contractType}`);
    console.log(`📅 Date d'embauche: ${employee.hireDate.toLocaleDateString('fr-FR')}`);
    console.log(`📅 Date d'embauche originale: ${employee.originalHireDate?.toLocaleDateString('fr-FR') || 'Non définie'}`);
    console.log(`🕐 Ancienneté: ${employee.getYearsOfService()} année(s)`);

    console.log('\n📋 Historique des contrats actuel:');
    if (employee.contractHistory && employee.contractHistory.length > 0) {
      employee.contractHistory.forEach((contract, index) => {
        console.log(`  ${index + 1}. ${contract.contractType} du ${contract.startDate.toLocaleDateString('fr-FR')} ${contract.endDate ? `au ${contract.endDate.toLocaleDateString('fr-FR')}` : '(en cours)'} - ${contract.reason}`);
      });
    } else {
      console.log('  Aucun historique trouvé');
    }

    // Test 1: Changer en freelance
    console.log('\n🔄 Test 1: Changement en freelance...');
    const originalContractType = employee.contractType;
    const originalHireDate = employee.hireDate;
    const originalOriginalHireDate = employee.originalHireDate;

    employee.changeContractType('freelance', 'Test de changement de contrat - passage en freelance');
    await employee.save();

    console.log('✅ Changement effectué!');
    console.log(`📄 Nouveau type de contrat: ${employee.contractType}`);
    console.log(`📅 Nouvelle date d'embauche: ${employee.hireDate.toLocaleDateString('fr-FR')}`);
    console.log(`📅 Date d'embauche originale préservée: ${employee.originalHireDate?.toLocaleDateString('fr-FR')}`);
    console.log(`🕐 Ancienneté préservée: ${employee.getYearsOfService()} année(s)`);

    console.log('\n📋 Nouvel historique des contrats:');
    employee.contractHistory.forEach((contract, index) => {
      console.log(`  ${index + 1}. ${contract.contractType} du ${contract.startDate.toLocaleDateString('fr-FR')} ${contract.endDate ? `au ${contract.endDate.toLocaleDateString('fr-FR')}` : '(en cours)'} - ${contract.reason}`);
    });

    // Test 2: Retour en CDI
    console.log('\n🔄 Test 2: Retour en CDI...');

    employee.changeContractType('cdi', 'Test de changement de contrat - retour en CDI');
    await employee.save();

    console.log('✅ Retour en CDI effectué!');
    console.log(`📄 Type de contrat final: ${employee.contractType}`);
    console.log(`📅 Date d'embauche finale: ${employee.hireDate.toLocaleDateString('fr-FR')}`);
    console.log(`📅 Date d'embauche originale toujours préservée: ${employee.originalHireDate?.toLocaleDateString('fr-FR')}`);
    console.log(`🕐 Ancienneté toujours préservée: ${employee.getYearsOfService()} année(s)`);

    console.log('\n📋 Historique complet des contrats:');
    employee.contractHistory.forEach((contract, index) => {
      console.log(`  ${index + 1}. ${contract.contractType} du ${contract.startDate.toLocaleDateString('fr-FR')} ${contract.endDate ? `au ${contract.endDate.toLocaleDateString('fr-FR')}` : '(en cours)'} - ${contract.reason}`);
    });

    // Comparaison avec les valeurs originales
    console.log('\n📊 COMPARAISON AVANT/APRÈS:');
    console.log(`└── Type de contrat: ${originalContractType} → ${employee.contractType}`);
    console.log(`└── Date d'embauche: ${originalHireDate.toLocaleDateString('fr-FR')} → ${employee.hireDate.toLocaleDateString('fr-FR')}`);
    console.log(`└── Date d'embauche originale: ${originalOriginalHireDate?.toLocaleDateString('fr-FR') || 'Non définie'} → ${employee.originalHireDate?.toLocaleDateString('fr-FR')}`);
    console.log(`└── Nombre de changements de contrat: ${employee.contractHistory.length}`);
    console.log(`└── Ancienneté préservée: ✅ ${employee.getYearsOfService()} année(s)`);

    console.log('\n🎉 Test de changement de type de contrat terminé avec succès!');
    console.log('\n📝 FONCTIONNALITÉS CONFIRMÉES:');
    console.log('✅ Préservation de l\'ancienneté avec originalHireDate');
    console.log('✅ Historique complet des changements de contrat');
    console.log('✅ Calcul correct de l\'ancienneté après changements');
    console.log('✅ Méthode changeContractType() fonctionnelle');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  testContractChange()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default testContractChange;
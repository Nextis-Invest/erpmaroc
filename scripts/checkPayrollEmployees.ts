#!/usr/bin/env tsx

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import mongoose from 'mongoose';

async function checkPayrollEmployees() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('\n📊 Extraction des données de payroll_employees...');

    // Récupérer tous les employés de paie
    const payrollEmployees = await mongoose.connection.db.collection('payroll_employees').find({}).toArray();

    console.log(`\n📈 Nombre total d'employés de paie: ${payrollEmployees.length}`);

    if (payrollEmployees.length === 0) {
      console.log('❌ Aucun employé de paie trouvé dans la base de données');
      return;
    }

    console.log('\n👥 DÉTAILS DES EMPLOYÉS DE PAIE:');
    console.log('=' .repeat(120));
    console.log('ID\t\tNom\t\t\tPoste\t\t\tSalaire\t\tCNSS\t\tStatut');
    console.log('=' .repeat(120));

    payrollEmployees.forEach((emp, index) => {
      const name = `${emp.prenom || ''} ${emp.nom || ''}`.padEnd(20);
      const position = (emp.poste || '').padEnd(20);
      const salary = `${emp.salaire_base || 0} DH`.padEnd(15);
      const cnss = (emp.numero_cnss || 'N/A').padEnd(15);
      const status = (emp.statut || 'Actif').padEnd(10);

      console.log(`${emp.employee_id || `EMP${index + 1}`}\t${name}\t${position}\t${salary}\t${cnss}\t${status}`);
    });

    // Analyse statistique
    const salaries = payrollEmployees.map(emp => emp.salaire_base).filter(Boolean);
    if (salaries.length > 0) {
      const avgSalary = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;
      const maxSalary = Math.max(...salaries);
      const minSalary = Math.min(...salaries);

      console.log('\n💰 ANALYSE SALARIALE:');
      console.log(`└── Salaire moyen: ${avgSalary.toFixed(2)} DH`);
      console.log(`└── Salaire maximum: ${maxSalary} DH`);
      console.log(`└── Salaire minimum: ${minSalary} DH`);
    }

    // Analyse par département/poste
    const positionStats = payrollEmployees.reduce((acc, emp) => {
      const position = emp.poste || 'Non spécifié';
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📝 RÉPARTITION PAR POSTE:');
    Object.entries(positionStats).forEach(([position, count]) => {
      console.log(`└── ${position}: ${count} employé(s)`);
    });

    // Exemple d'employé complet
    console.log('\n📄 EXEMPLE D\'EMPLOYÉ COMPLET:');
    console.log(JSON.stringify(payrollEmployees[0], null, 2));

    // Exporter les données
    const fs = require('fs');
    const exportPath = path.join(process.cwd(), 'exports', 'payroll-employees-data.json');

    // Créer le dossier exports s'il n'existe pas
    const exportsDir = path.dirname(exportPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const exportData = {
      extractedAt: new Date().toISOString(),
      source: 'payroll_employees collection',
      totalEmployees: payrollEmployees.length,
      statistics: {
        averageSalary: salaries.length > 0 ? salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length : 0,
        maxSalary: salaries.length > 0 ? Math.max(...salaries) : 0,
        minSalary: salaries.length > 0 ? Math.min(...salaries) : 0
      },
      positionStats,
      employees: payrollEmployees
    };

    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`\n💾 Données exportées vers: ${exportPath}`);

    console.log('\n✅ Extraction terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  checkPayrollEmployees()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default checkPayrollEmployees;
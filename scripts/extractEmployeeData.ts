#!/usr/bin/env tsx

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import Employee from '../model/hr/employee';

async function extractEmployeeData() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('📊 Extraction des données des employés...');

    // Récupérer tous les employés sans populate pour éviter les erreurs de schéma
    const employees = await Employee.find({})
      .sort({ createdAt: -1 })
      .lean();

    console.log(`\n📈 Nombre total d'employés: ${employees.length}`);

    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé dans la base de données');
      return;
    }

    // Statistiques générales
    const regularEmployees = employees.filter(emp => !emp.isFreelance);
    const freelanceEmployees = employees.filter(emp => emp.isFreelance);
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    const inactiveEmployees = employees.filter(emp => emp.status === 'inactive');

    console.log('\n📊 STATISTIQUES:');
    console.log(`└── Employés déclarés: ${regularEmployees.length}`);
    console.log(`└── Employés non-déclaré: ${freelanceEmployees.length}`);
    console.log(`└── Employés actifs: ${activeEmployees.length}`);
    console.log(`└── Employés inactifs: ${inactiveEmployees.length}`);

    // Analyse par département
    const departmentStats = employees.reduce((acc, emp) => {
      const deptName = emp.department?.name || 'Non assigné';
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n🏢 RÉPARTITION PAR DÉPARTEMENT:');
    Object.entries(departmentStats).forEach(([dept, count]) => {
      console.log(`└── ${dept}: ${count} employé(s)`);
    });

    // Analyse par type d'emploi
    const employmentTypeStats = employees.reduce((acc, emp) => {
      acc[emp.employmentType] = (acc[emp.employmentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📝 TYPES D\'EMPLOI:');
    Object.entries(employmentTypeStats).forEach(([type, count]) => {
      console.log(`└── ${type}: ${count} employé(s)`);
    });

    // Analyse salariale
    const salaries = employees.map(emp => emp.salary).filter(Boolean);
    if (salaries.length > 0) {
      const avgSalary = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;
      const maxSalary = Math.max(...salaries);
      const minSalary = Math.min(...salaries);

      console.log('\n💰 ANALYSE SALARIALE:');
      console.log(`└── Salaire moyen: ${avgSalary.toFixed(2)} DH`);
      console.log(`└── Salaire maximum: ${maxSalary} DH`);
      console.log(`└── Salaire minimum: ${minSalary} DH`);
    }

    console.log('\n👥 DÉTAILS DES EMPLOYÉS:');
    console.log('=' .repeat(120));
    console.log('ID\t\tNom\t\t\tEmail\t\t\t\tPoste\t\t\tSalaire\t\tStatut\t\tType');
    console.log('=' .repeat(120));

    employees.forEach((emp, index) => {
      const name = `${emp.firstName} ${emp.lastName}`.padEnd(20);
      const email = (emp.email || '').padEnd(25);
      const position = (emp.position || '').padEnd(20);
      const salary = `${emp.salary || 0} DH`.padEnd(15);
      const status = emp.status.padEnd(10);
      const type = emp.isFreelance ? 'Non-déclaré' : 'Déclaré';

      console.log(`${emp.employeeId}\t${name}\t${email}\t${position}\t${salary}\t${status}\t${type}`);
    });

    // Employés récents (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEmployees = employees.filter(emp =>
      new Date(emp.createdAt) > thirtyDaysAgo
    );

    if (recentEmployees.length > 0) {
      console.log(`\n🆕 EMPLOYÉS AJOUTÉS RÉCEMMENT (30 derniers jours): ${recentEmployees.length}`);
      recentEmployees.forEach(emp => {
        console.log(`└── ${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ${new Date(emp.createdAt).toLocaleDateString('fr-FR')}`);
      });
    }

    // Employés sans département
    const unassignedEmployees = employees.filter(emp => !emp.department);
    if (unassignedEmployees.length > 0) {
      console.log(`\n⚠️  EMPLOYÉS SANS DÉPARTEMENT: ${unassignedEmployees.length}`);
      unassignedEmployees.forEach(emp => {
        console.log(`└── ${emp.firstName} ${emp.lastName} (${emp.employeeId})`);
      });
    }

    // Sauvegarde dans un fichier JSON pour analyse ultérieure
    const fs = require('fs');
    const path = require('path');

    const exportData = {
      extractedAt: new Date().toISOString(),
      totalEmployees: employees.length,
      statistics: {
        regular: regularEmployees.length,
        freelance: freelanceEmployees.length,
        active: activeEmployees.length,
        inactive: inactiveEmployees.length
      },
      departmentStats,
      employmentTypeStats,
      employees: employees.map(emp => ({
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        position: emp.position,
        department: emp.department?.name,
        salary: emp.salary,
        status: emp.status,
        isFreelance: emp.isFreelance,
        employmentType: emp.employmentType,
        hireDate: emp.hireDate,
        createdAt: emp.createdAt
      }))
    };

    const exportPath = path.join(process.cwd(), 'exports', 'employee-data.json');

    // Créer le dossier exports s'il n'existe pas
    const exportsDir = path.dirname(exportPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

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
  extractEmployeeData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default extractEmployeeData;
#!/usr/bin/env tsx

// Charger les variables d'environnement
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le fichier .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { connectToDB } from '../lib/database/connectToDB';
import Employee from '../model/hr/employee';
import Department from '../model/hr/department';
import mongoose from 'mongoose';

async function extractEmployeeDataWithDepartments() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('📊 Extraction des données des employés avec départements...');

    // Récupérer tous les employés
    const employees = await Employee.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Récupérer tous les départements
    const departments = await Department.find({}).lean();
    const departmentMap = departments.reduce((acc, dept) => {
      acc[dept._id.toString()] = dept;
      return acc;
    }, {} as Record<string, any>);

    console.log(`\n📈 Nombre total d'employés: ${employees.length}`);
    console.log(`📂 Nombre de départements: ${departments.length}`);

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
      let deptName = 'Non assigné';
      if (emp.department) {
        const dept = departmentMap[emp.department.toString()];
        deptName = dept ? dept.name : 'Département inconnu';
      }
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n🏢 RÉPARTITION PAR DÉPARTEMENT:');
    Object.entries(departmentStats).forEach(([dept, count]) => {
      console.log(`└── ${dept}: ${count} employé(s)`);
    });

    // Liste des départements créés
    console.log('\n📂 DÉPARTEMENTS DISPONIBLES:');
    departments.forEach(dept => {
      console.log(`└── ${dept.name} (${dept.code}) - ${dept.description}`);
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
    console.log('=' .repeat(140));
    console.log('ID\t\tNom\t\t\tEmail\t\t\t\tPoste\t\t\tDépartement\t\tSalaire\t\tStatut');
    console.log('=' .repeat(140));

    employees.forEach((emp) => {
      const name = `${emp.firstName} ${emp.lastName}`.padEnd(20);
      const email = (emp.email || '').padEnd(25);
      const position = (emp.position || '').padEnd(20);
      let deptName = 'Non assigné';
      if (emp.department) {
        const dept = departmentMap[emp.department.toString()];
        deptName = dept ? dept.name : 'Inconnu';
      }
      const department = deptName.padEnd(15);
      const salary = `${emp.salary || 0} DH`.padEnd(15);
      const status = emp.status.padEnd(10);

      console.log(`${emp.employeeId}\t${name}\t${email}\t${position}\t${department}\t${salary}\t${status}`);
    });

    // Analyse des confirmations
    const employeesWithConfirmation = employees.filter(emp => emp.confirmationDate);
    console.log(`\n📅 CONFIRMATIONS:`);
    console.log(`└── Employés avec date de confirmation: ${employeesWithConfirmation.length}`);
    console.log(`└── Employés sans confirmation: ${employees.length - employeesWithConfirmation.length}`);

    // Employés récents (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEmployees = employees.filter(emp =>
      new Date(emp.createdAt) > thirtyDaysAgo
    );

    if (recentEmployees.length > 0) {
      console.log(`\n🆕 EMPLOYÉS AJOUTÉS RÉCEMMENT (30 derniers jours): ${recentEmployees.length}`);
      recentEmployees.forEach(emp => {
        let deptName = 'Non assigné';
        if (emp.department) {
          const dept = departmentMap[emp.department.toString()];
          deptName = dept ? dept.name : 'Inconnu';
        }
        console.log(`└── ${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ${deptName} - ${new Date(emp.createdAt).toLocaleDateString('fr-FR')}`);
      });
    }

    // Employés sans département
    const unassignedEmployees = employees.filter(emp => !emp.department);
    if (unassignedEmployees.length > 0) {
      console.log(`\n⚠️  EMPLOYÉS SANS DÉPARTEMENT: ${unassignedEmployees.length}`);
      unassignedEmployees.forEach(emp => {
        console.log(`└── ${emp.firstName} ${emp.lastName} (${emp.employeeId}) - ${emp.position}`);
      });
    }

    // Sauvegarde dans un fichier JSON pour analyse ultérieure
    const fs = require('fs');
    const path = require('path');

    const exportData = {
      extractedAt: new Date().toISOString(),
      totalEmployees: employees.length,
      totalDepartments: departments.length,
      statistics: {
        regular: regularEmployees.length,
        freelance: freelanceEmployees.length,
        active: activeEmployees.length,
        inactive: inactiveEmployees.length,
        withConfirmation: employeesWithConfirmation.length,
        withoutDepartment: unassignedEmployees.length
      },
      departmentStats,
      departments: departments.map(dept => ({
        id: dept._id,
        name: dept.name,
        code: dept.code,
        description: dept.description
      })),
      employmentTypeStats,
      employees: employees.map(emp => {
        let deptInfo = null;
        if (emp.department) {
          const dept = departmentMap[emp.department.toString()];
          deptInfo = dept ? { id: dept._id, name: dept.name, code: dept.code } : null;
        }

        return {
          employeeId: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          position: emp.position,
          department: deptInfo,
          salary: emp.salary,
          status: emp.status,
          isFreelance: emp.isFreelance,
          employmentType: emp.employmentType,
          hireDate: emp.hireDate,
          confirmationDate: emp.confirmationDate,
          createdAt: emp.createdAt
        };
      })
    };

    const exportPath = path.join(process.cwd(), 'exports', 'employee-data-with-departments.json');

    // Créer le dossier exports s'il n'existe pas
    const exportsDir = path.dirname(exportPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`\n💾 Données exportées vers: ${exportPath}`);

    console.log('\n✅ Extraction avec départements terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  extractEmployeeDataWithDepartments()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default extractEmployeeDataWithDepartments;
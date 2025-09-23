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

async function addMissingFieldsToEmployees() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await connectToDB();
    console.log('✅ Connecté à MongoDB');

    console.log('\n🏢 Création des départements par défaut...');

    // Récupérer la succursale par défaut
    const defaultBranch = await mongoose.connection.db.collection('branches').findOne({});
    if (!defaultBranch) {
      throw new Error('Aucune succursale trouvée. Exécutez d\'abord createDefaultBranch.ts');
    }

    console.log(`✅ Succursale trouvée: ${defaultBranch.companyName} (${defaultBranch._id})`);

    // Départements par défaut basés sur les fonctions des employés
    const defaultDepartments = [
      {
        name: 'Ressources Humaines',
        code: 'RH',
        description: 'Gestion du personnel et des ressources humaines',
        branch: defaultBranch._id,
        functions: ['HR Manager']
      },
      {
        name: 'Développement',
        code: 'DEV',
        description: 'Équipe de développement logiciel',
        branch: defaultBranch._id,
        functions: ['Frontend Developer', 'Backend Developer', 'IT Director']
      },
      {
        name: 'Ventes et Marketing',
        code: 'SALES',
        description: 'Ventes et marketing',
        branch: defaultBranch._id,
        functions: ['Sales Representative', 'Marketing Specialist']
      },
      {
        name: 'Finance et Comptabilité',
        code: 'FIN',
        description: 'Gestion financière et comptabilité',
        branch: defaultBranch._id,
        functions: ['Accountant']
      },
      {
        name: 'Opérations',
        code: 'OPS',
        description: 'Coordination des opérations',
        branch: defaultBranch._id,
        functions: ['Operations Coordinator']
      }
    ];

    // Créer les départements s'ils n'existent pas
    const departmentMapping: Record<string, any> = {};

    for (const deptData of defaultDepartments) {
      let department = await Department.findOne({ code: deptData.code });

      if (!department) {
        department = new Department({
          name: deptData.name,
          code: deptData.code,
          description: deptData.description,
          branch: deptData.branch,
          status: 'active'
        });
        await department.save();
        console.log(`✅ Département créé: ${deptData.name} (${deptData.code})`);
      } else {
        console.log(`ℹ️ Département existant: ${deptData.name} (${deptData.code})`);
      }

      // Mapper les fonctions aux départements
      for (const func of deptData.functions) {
        departmentMapping[func] = department._id;
      }
    }

    console.log('\n👥 Mise à jour des employés...');

    // Récupérer tous les employés
    const employees = await Employee.find({});

    let updatedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    for (const employee of employees) {
      try {
        let needsUpdate = false;
        const updates: any = {};

        // Assigner le département basé sur la fonction
        if (!employee.department && employee.position) {
          const departmentId = departmentMapping[employee.position];
          if (departmentId) {
            updates.department = departmentId;
            needsUpdate = true;
            console.log(`📁 Assignation département pour ${employee.firstName} ${employee.lastName}: ${employee.position} → ${Object.keys(departmentMapping).find(k => departmentMapping[k].toString() === departmentId.toString())}`);
          } else {
            console.log(`⚠️ Aucun département trouvé pour la fonction: ${employee.position}`);
          }
        }

        // Ajouter d'autres champs manquants si nécessaire
        if (!employee.confirmationDate && employee.hireDate) {
          // Date de confirmation par défaut : 3 mois après embauche
          const confirmationDate = new Date(employee.hireDate);
          confirmationDate.setMonth(confirmationDate.getMonth() + 3);
          updates.confirmationDate = confirmationDate;
          needsUpdate = true;
          console.log(`📅 Date de confirmation ajoutée pour ${employee.firstName} ${employee.lastName}`);
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

    console.log('\n📊 RÉSUMÉ DES MISES À JOUR:');
    console.log(`└── Total employés traités: ${employees.length}`);
    console.log(`└── Employés mis à jour: ${updatedCount}`);
    console.log(`└── Erreurs: ${errorsCount}`);

    if (errors.length > 0) {
      console.log('\n❌ ERREURS RENCONTRÉES:');
      errors.forEach(error => console.log(`└── ${error}`));
    }

    // Vérification finale
    console.log('\n🔍 Vérification post-mise à jour...');
    const employeesWithoutDept = await Employee.countDocuments({ department: { $exists: false } });
    const employeesWithDept = await Employee.countDocuments({ department: { $exists: true } });

    console.log(`└── Employés avec département: ${employeesWithDept}`);
    console.log(`└── Employés sans département: ${employeesWithoutDept}`);

    // Export des résultats
    const fs = require('fs');
    const reportPath = path.join(process.cwd(), 'exports', 'missing-fields-update-report.json');

    const updateReport = {
      updateDate: new Date().toISOString(),
      totalEmployees: employees.length,
      updatedEmployees: updatedCount,
      errors: errorsCount,
      errorDetails: errors,
      departmentsCreated: defaultDepartments.length,
      finalStats: {
        employeesWithDepartment: employeesWithDept,
        employeesWithoutDepartment: employeesWithoutDept
      }
    };

    // Créer le dossier exports s'il n'existe pas
    const exportsDir = path.dirname(reportPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(updateReport, null, 2));
    console.log(`💾 Rapport de mise à jour exporté vers: ${reportPath}`);

    console.log('\n🎉 Ajout des champs manquants terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des champs manquants:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  addMissingFieldsToEmployees()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

export default addMissingFieldsToEmployees;
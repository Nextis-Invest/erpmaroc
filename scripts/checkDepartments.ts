import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkDepartments() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connecté à MongoDB');

    // Lister toutes les collections
    console.log('\n📚 Collections disponibles:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Vérifier spécifiquement la collection departments
    const departmentCollectionExists = collections.some(col => col.name === 'departments');
    console.log(`\n🏢 Collection 'departments': ${departmentCollectionExists ? '✅ Existe' : '❌ N\'existe pas'}`);

    if (departmentCollectionExists) {
      // Si la collection existe, afficher quelques documents
      const departmentsCollection = mongoose.connection.db.collection('departments');
      const count = await departmentsCollection.countDocuments();
      console.log(`📊 Nombre de départements: ${count}`);

      if (count > 0) {
        console.log('\n📋 Exemple de départements:');
        const departments = await departmentsCollection.find({}).limit(5).toArray();
        departments.forEach(dept => {
          console.log(`  - ID: ${dept._id}`);
          console.log(`    Nom: ${dept.name || 'N/A'}`);
          console.log(`    Code: ${dept.code || 'N/A'}`);
          console.log(`    Status: ${dept.status || 'N/A'}`);
          console.log(`    ---`);
        });
      }
    }

    // Vérifier aussi la collection teams
    const teamCollectionExists = collections.some(col => col.name === 'teams');
    console.log(`🏃 Collection 'teams': ${teamCollectionExists ? '✅ Existe' : '❌ N\'existe pas'}`);

    if (teamCollectionExists) {
      const teamsCollection = mongoose.connection.db.collection('teams');
      const teamCount = await teamsCollection.countDocuments();
      console.log(`📊 Nombre d'équipes: ${teamCount}`);

      if (teamCount > 0) {
        console.log('\n📋 Exemple d\'équipes:');
        const teams = await teamsCollection.find({}).limit(3).toArray();
        teams.forEach(team => {
          console.log(`  - ID: ${team._id}`);
          console.log(`    Nom: ${team.name || 'N/A'}`);
          console.log(`    Code: ${team.code || 'N/A'}`);
          console.log(`    Département: ${team.departmentId || 'N/A'}`);
          console.log(`    ---`);
        });
      }
    }

    // Vérifier les employés et leurs départements
    console.log('\n👥 Vérification des employés:');
    const employeesCollection = mongoose.connection.db.collection('employees');
    const employeeCount = await employeesCollection.countDocuments();
    console.log(`📊 Nombre d'employés: ${employeeCount}`);

    if (employeeCount > 0) {
      // Échantillon d'employés avec leurs départements
      const employeesWithDepts = await employeesCollection.find({}).limit(3).toArray();
      console.log('\n📋 Départements des employés (échantillon):');
      employeesWithDepts.forEach(emp => {
        console.log(`  - ${emp.firstName} ${emp.lastName}:`);
        console.log(`    Département: ${emp.department || 'N/A'} (type: ${typeof emp.department})`);
        if (emp.department && typeof emp.department === 'object') {
          console.log(`    Nom du dept: ${emp.department.name || 'N/A'}`);
          console.log(`    Code du dept: ${emp.department.code || 'N/A'}`);
        }
        console.log(`    ---`);
      });
    }

    console.log('\n✅ Vérification terminée!');

  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

// Exécuter la vérification
checkDepartments().catch(console.error);
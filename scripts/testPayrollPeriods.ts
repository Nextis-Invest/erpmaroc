import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import PayrollPeriod from '../models/PayrollPeriod';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testPayrollPeriods() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connecté à MongoDB');

    // 1. Créer une nouvelle période
    console.log('\n📅 Test de création de période...');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const newPeriod = await PayrollPeriod.create({
      mois: currentMonth,
      annee: currentYear,
      date_debut: new Date(currentYear, currentMonth - 1, 1),
      date_fin: new Date(currentYear, currentMonth, 0, 23, 59, 59),
      company_id: 'default',
      created_by: 'test_script',
      statut: 'BROUILLON'
    });

    console.log('✅ Période créée:', {
      id: newPeriod._id,
      periode: `${newPeriod.mois}/${newPeriod.annee}`,
      statut: newPeriod.statut,
      date_debut: newPeriod.date_debut,
      date_fin: newPeriod.date_fin
    });

    // 2. Récupérer toutes les périodes
    console.log('\n📋 Liste des périodes existantes:');
    const periods = await PayrollPeriod.find({}).sort({ annee: -1, mois: -1 }).limit(5);

    periods.forEach(p => {
      console.log(`  - ${p.mois}/${p.annee}: ${p.statut} (ID: ${p._id})`);
    });

    // 3. Récupérer la période active
    console.log('\n🔍 Recherche de la période active...');
    const activePeriod = await PayrollPeriod.findOne({
      company_id: 'default',
      statut: { $in: ['BROUILLON', 'EN_COURS'] }
    }).sort({ annee: -1, mois: -1 });

    if (activePeriod) {
      console.log('✅ Période active trouvée:', {
        periode: `${activePeriod.mois}/${activePeriod.annee}`,
        statut: activePeriod.statut,
        id: activePeriod._id
      });
    } else {
      console.log('❌ Aucune période active trouvée');
    }

    // 4. Mettre à jour une période
    if (newPeriod) {
      console.log('\n🔄 Test de mise à jour de période...');
      newPeriod.statut = 'EN_COURS';
      newPeriod.notes = 'Période de test mise à jour';
      await newPeriod.save();
      console.log('✅ Période mise à jour avec succès');
    }

    // 5. Statistiques
    console.log('\n📊 Statistiques des périodes:');
    const stats = await PayrollPeriod.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);

    stats.forEach(s => {
      console.log(`  - ${s._id}: ${s.count} période(s)`);
    });

    console.log('\n✅ Tests terminés avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      console.error('Erreurs de validation:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

// Exécuter les tests
testPayrollPeriods().catch(console.error);
#!/usr/bin/env npx tsx

import { serviceCalculPaie } from '../services/payroll/payrollCalculationService';

console.log('=== Test du calcul IR pour 6,500 DH/mois ===\n');

// Test avec 6,500 DH mensuel
const testCase = {
  salaire_base: 6500,
  anciennete_mois: 0,
  primes_imposables: 0,
  primes_non_imposables: 0,
  situation_familiale: 'CELIBATAIRE' as const,
  nombre_enfants: 0,
  cimr_taux: 0,
  assurance_taux: 0,
  autres_deductions: 0,
  heures_supplementaires: 0,
  taux_heures_sup: 0
};

console.log('📊 Paramètres de test:');
console.log('   Salaire brut mensuel: 6,500 DH');
console.log('   Salaire brut annuel: 78,000 DH');
console.log('   Situation familiale: Célibataire');
console.log('   Enfants à charge: 0\n');

const resultat = serviceCalculPaie.calculerPaie(testCase);

console.log('📈 Calculs détaillés:');
const brutAnnuel = 6500 * 12;
console.log(`   1. Salaire brut annuel: ${brutAnnuel.toLocaleString('fr-MA')} DH`);

// Calcul des retenues sociales
const cnssAnnuel = Math.min(6500, 6000) * 0.0448 * 12; // CNSS plafonné à 6000
const amoAnnuel = 6500 * 0.0226 * 12;
const totalRetenuesSociales = cnssAnnuel + amoAnnuel;

console.log(`   2. Retenues sociales:`);
console.log(`      - CNSS (4.48% plafonné à 6000): ${(cnssAnnuel/12).toFixed(2)} DH/mois × 12 = ${cnssAnnuel.toFixed(2)} DH/an`);
console.log(`      - AMO (2.26%): ${(amoAnnuel/12).toFixed(2)} DH/mois × 12 = ${amoAnnuel.toFixed(2)} DH/an`);
console.log(`      - Total annuel: ${totalRetenuesSociales.toFixed(2)} DH`);

const rniApresRetenues = brutAnnuel - totalRetenuesSociales;
console.log(`      → RNI après retenues: ${rniApresRetenues.toFixed(2)} DH`);

// Frais professionnels (20% plafonné à 30,000 DH/an)
const fraisProfAnnuel = Math.min(brutAnnuel * 0.20, 30000);
console.log(`   3. Frais professionnels (20%, max 30,000): ${fraisProfAnnuel.toFixed(2)} DH`);

const baseImposable = rniApresRetenues - fraisProfAnnuel;
console.log(`      → Base imposable: ${baseImposable.toFixed(2)} DH`);

// Déterminer la tranche
let trancheInfo = '';
let tauxApplicable = 0;
let deductionApplicable = 0;

if (baseImposable <= 30000) {
  trancheInfo = '0 - 30,000';
  tauxApplicable = 0;
  deductionApplicable = 0;
} else if (baseImposable <= 50000) {
  trancheInfo = '30,001 - 50,000';
  tauxApplicable = 0.10;
  deductionApplicable = 3000;
} else if (baseImposable <= 60000) {
  trancheInfo = '50,001 - 60,000';
  tauxApplicable = 0.20;
  deductionApplicable = 8000;
} else if (baseImposable <= 80000) {
  trancheInfo = '60,001 - 80,000';
  tauxApplicable = 0.30;
  deductionApplicable = 14000;
}

console.log(`   4. Application du barème IR:`);
console.log(`      Base imposable ${baseImposable.toFixed(2)} DH dans la tranche ${trancheInfo}`);
console.log(`      → Taux: ${(tauxApplicable * 100)}%, Déduction: ${deductionApplicable.toFixed(2)} DH`);

const irAnnuelCalcule = Math.max(0, (baseImposable * tauxApplicable) - deductionApplicable);
const irMensuelCalcule = irAnnuelCalcule / 12;

console.log(`      IR annuel = (${baseImposable.toFixed(2)} × ${(tauxApplicable * 100)}%) - ${deductionApplicable} = ${irAnnuelCalcule.toFixed(2)} DH`);
console.log(`      IR mensuel = ${irAnnuelCalcule.toFixed(2)} ÷ 12 = ${irMensuelCalcule.toFixed(2)} DH\n`);

console.log('✅ Résultats du système:');
console.log(`   CNSS mensuelle: ${resultat.cnss_salariale} DH`);
console.log(`   AMO mensuelle: ${resultat.amo_salariale} DH`);
console.log(`   IR mensuel calculé: ${resultat.ir_brut} DH`);
console.log(`   IR annuel calculé: ${(parseFloat(resultat.ir_brut) * 12).toFixed(2)} DH`);
console.log(`   Salaire net mensuel: ${resultat.salaire_net} DH`);
console.log(`   Salaire net annuel: ${(parseFloat(resultat.salaire_net) * 12).toFixed(2)} DH\n`);

// Comparaison avec l'exemple attendu
console.log('🔍 Comparaison avec l\'exemple fourni:');
console.log('   Attendu:');
console.log('   - IR annuel: 438 DH');
console.log('   - Salaire net annuel: 6,062 DH × 12 = 72,744 DH');
console.log('   - Taux d\'imposition moyen: 6.7%');
console.log('   Calculé:');
const irAnnuelSysteme = parseFloat(resultat.ir_brut) * 12;
const salaireNetAnnuelSysteme = parseFloat(resultat.salaire_net) * 12;
const tauxImpositionMoyen = (irAnnuelSysteme / brutAnnuel) * 100;
console.log(`   - IR annuel: ${irAnnuelSysteme.toFixed(2)} DH`);
console.log(`   - Salaire net annuel: ${salaireNetAnnuelSysteme.toFixed(2)} DH`);
console.log(`   - Taux d'imposition moyen: ${tauxImpositionMoyen.toFixed(1)}%`);

// Calcul selon l'exemple (sans cotisations sociales pour comparaison)
console.log('\n📊 Calcul simplifié (méthode de l\'exemple):');
console.log('   Si on considère uniquement l\'IR sans cotisations sociales:');
const baseImposableSimple = brutAnnuel - (brutAnnuel * 0.20); // Seulement frais pro
console.log(`   - Salaire brut annuel: ${brutAnnuel.toFixed(2)} DH`);
console.log(`   - Frais professionnels (20%): ${(brutAnnuel * 0.20).toFixed(2)} DH`);
console.log(`   - Base imposable: ${baseImposableSimple.toFixed(2)} DH`);

if (baseImposableSimple > 60000 && baseImposableSimple <= 80000) {
  const irSimple = (baseImposableSimple * 0.30) - 14000;
  console.log(`   - IR (tranche 60,001-80,000): (${baseImposableSimple} × 30%) - 14,000 = ${irSimple.toFixed(2)} DH/an`);
  console.log(`   - IR mensuel: ${(irSimple/12).toFixed(2)} DH`);
}
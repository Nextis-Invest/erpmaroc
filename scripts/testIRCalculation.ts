#!/usr/bin/env npx tsx

import { serviceCalculPaie } from '../services/payroll/payrollCalculationService';

console.log('=== Test du calcul IR avec les nouveaux barèmes ===\n');

// Test avec l'exemple fourni : 15 000 DH mensuel
const testCase = {
  salaire_base: 15000,
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
console.log('   Salaire brut mensuel: 15,000 DH');
console.log('   Situation familiale: Célibataire');
console.log('   Enfants à charge: 0');
console.log('   CIMR: 0%');
console.log('   Assurance: 0%\n');

const resultat = serviceCalculPaie.calculerPaie(testCase);

console.log('📈 Calculs détaillés (base annuelle):');
const brutAnnuel = 15000 * 12;
console.log(`   1. Salaire brut annuel: ${brutAnnuel.toLocaleString('fr-MA')} DH`);

// Calcul des retenues sociales
const cnssAnnuel = Math.min(15000, 6000) * 0.0448 * 12; // CNSS plafonné à 6000
const amoAnnuel = 15000 * 0.0226 * 12;
const totalRetenuesSociales = cnssAnnuel + amoAnnuel;
const tauxRetenuesEffectif = (totalRetenuesSociales / brutAnnuel) * 100;

console.log(`   2. Retenues sociales (~${tauxRetenuesEffectif.toFixed(2)}%):`);
console.log(`      - CNSS (4.48% plafonné): ${cnssAnnuel.toFixed(2)} DH/an`);
console.log(`      - AMO (2.26%): ${amoAnnuel.toFixed(2)} DH/an`);
console.log(`      - Total: ${totalRetenuesSociales.toFixed(2)} DH/an`);

const rniApresRetenues = brutAnnuel - totalRetenuesSociales;
console.log(`      → RNI après retenues: ${rniApresRetenues.toFixed(2)} DH`);

// Frais professionnels
const fraisProfAnnuel = Math.min(brutAnnuel * 0.20, 30000);
console.log(`   3. Abattement frais pro (20%, max 30,000 DH): ${fraisProfAnnuel.toFixed(2)} DH`);

const baseImposable = rniApresRetenues - fraisProfAnnuel;
console.log(`      → Base imposable: ${baseImposable.toFixed(2)} DH`);

// Calcul IR selon la tranche
console.log(`   4. Application du barème IR:`);
console.log(`      Base imposable ${baseImposable.toFixed(2)} DH dans la tranche 80,001 - 180,000`);
console.log(`      → Taux: 34%, Déduction: 17,200 DH`);

const irAnnuelCalcule = (baseImposable * 0.34) - 17200;
const irMensuelCalcule = irAnnuelCalcule / 12;

console.log(`      IR annuel = (${baseImposable.toFixed(2)} × 34%) - 17,200 = ${irAnnuelCalcule.toFixed(2)} DH`);
console.log(`   5. IR mensuel = ${irAnnuelCalcule.toFixed(2)} ÷ 12 = ${irMensuelCalcule.toFixed(2)} DH\n`);

console.log('✅ Résultats du système:');
console.log(`   IR mensuel calculé: ${resultat.ir_brut} DH`);
console.log(`   Salaire net: ${resultat.salaire_net} DH\n`);

// Comparaison avec l'exemple attendu
const irAttendu = 2470;
const irCalculeSysteme = parseFloat(resultat.ir_brut);
const difference = Math.abs(irCalculeSysteme - irAttendu);

console.log('🔍 Vérification par rapport à l\'exemple:');
console.log(`   IR attendu (exemple): ${irAttendu.toFixed(2)} DH`);
console.log(`   IR calculé (système): ${irCalculeSysteme.toFixed(2)} DH`);
console.log(`   Différence: ${difference.toFixed(2)} DH`);

if (difference < 10) {
  console.log('   ✅ Le calcul est conforme (différence < 10 DH)');
} else {
  console.log('   ⚠️ Écart significatif détecté');
}

console.log('\n📋 Détail complet du bulletin:');
console.log('   --------------------------------');
console.log(`   Salaire de base: ${resultat.salaire_base.toFixed(2)} DH`);
console.log(`   Prime d'ancienneté: ${resultat.prime_anciennete.toFixed(2)} DH`);
console.log(`   Salaire brut imposable: ${resultat.salaire_brut_imposable.toFixed(2)} DH`);
console.log('   --------------------------------');
console.log('   Retenues:');
console.log(`   - CNSS: ${resultat.cnss_salariale} DH`);
console.log(`   - AMO: ${resultat.amo_salariale} DH`);
console.log(`   - Frais professionnels: ${resultat.frais_professionnels} DH`);
console.log(`   - IR brut: ${resultat.ir_brut} DH`);
console.log(`   - Charges familiales: ${resultat.charges_familiales} DH`);
console.log(`   - IR net: ${resultat.ir_net} DH`);
console.log('   --------------------------------');
console.log(`   SALAIRE NET: ${resultat.salaire_net} DH`);
console.log('   ================================\n');

// Test avec situation familiale différente
console.log('📊 Test 2: Marié avec 2 enfants');
const testCase2 = {
  ...testCase,
  situation_familiale: 'MARIE' as const,
  nombre_enfants: 2
};

const resultat2 = serviceCalculPaie.calculerPaie(testCase2);
console.log(`   IR brut: ${resultat2.ir_brut} DH`);
console.log(`   Charges familiales: ${resultat2.charges_familiales} DH (3 personnes × 30 DH)`);
console.log(`   IR net: ${resultat2.ir_net} DH`);
console.log(`   Salaire net: ${resultat2.salaire_net} DH`);
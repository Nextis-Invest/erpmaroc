#!/usr/bin/env npx tsx

console.log('=== Analyse du calcul IR pour différentes interprétations ===\n');

// Barèmes IR annuels
const baremes = [
  { min: 0, max: 30000, taux: 0.00, deduction: 0 },
  { min: 30001, max: 50000, taux: 0.10, deduction: 3000 },
  { min: 50001, max: 60000, taux: 0.20, deduction: 8000 },
  { min: 60001, max: 80000, taux: 0.30, deduction: 14000 },
  { min: 80001, max: 180000, taux: 0.34, deduction: 17200 },
  { min: 180001, max: Infinity, taux: 0.38, deduction: 24400 }
];

function calculerIR(baseImposableAnnuelle: number): number {
  const tranche = baremes.find(b => baseImposableAnnuelle >= b.min && baseImposableAnnuelle <= b.max);
  if (!tranche || tranche.taux === 0) return 0;
  return Math.max(0, (baseImposableAnnuelle * tranche.taux) - tranche.deduction);
}

// Test 1: Si 6,500 est le salaire NET imposable mensuel
console.log('📊 Hypothèse 1: 6,500 DH est le salaire NET imposable mensuel');
const netImposableMensuel1 = 6500;
const netImposableAnnuel1 = netImposableMensuel1 * 12;
const ir1 = calculerIR(netImposableAnnuel1);
console.log(`   Net imposable annuel: ${netImposableAnnuel1.toFixed(2)} DH`);
console.log(`   Tranche: 60,001 - 80,000 (30%, déduction 14,000)`);
console.log(`   IR annuel: (${netImposableAnnuel1} × 30%) - 14,000 = ${ir1.toFixed(2)} DH`);
console.log(`   Taux effectif: ${((ir1/netImposableAnnuel1) * 100).toFixed(1)}%\n`);

// Test 2: Si on cherche un IR de 438 DH/an, quel serait le revenu imposable?
console.log('📊 Hypothèse 2: Calcul inverse - quel revenu donne IR = 438 DH/an?');
const irCible = 438;
// Pour la tranche 30,001 - 50,000: IR = (Revenu × 10%) - 3000
// 438 = (Revenu × 0.10) - 3000
// Revenu = (438 + 3000) / 0.10 = 34,380
const revenuPourIR438 = (irCible + 3000) / 0.10;
console.log(`   Pour obtenir IR = ${irCible} DH/an dans la tranche 10%:`);
console.log(`   Revenu imposable annuel = (${irCible} + 3,000) ÷ 0.10 = ${revenuPourIR438.toFixed(2)} DH`);
console.log(`   Revenu imposable mensuel = ${(revenuPourIR438/12).toFixed(2)} DH`);
console.log(`   Vérification: IR = (${revenuPourIR438.toFixed(2)} × 10%) - 3,000 = ${calculerIR(revenuPourIR438).toFixed(2)} DH\n`);

// Test 3: Si 6,500 × 12 = 78,000 est le salaire brut, avec déductions maximales
console.log('📊 Hypothèse 3: Calcul avec déductions maximales possibles');
const brutAnnuel3 = 78000;
console.log(`   Salaire brut annuel: ${brutAnnuel3.toFixed(2)} DH`);

// Scénario avec déductions importantes
const cotisationsSociales3 = brutAnnuel3 * 0.10; // Hypothèse: 10% de cotisations
const fraisProf3 = Math.min(brutAnnuel3 * 0.20, 30000); // 20% plafonné
const autresDeductions3 = brutAnnuel3 * 0.20; // Hypothèse: 20% autres déductions

const baseImposable3 = brutAnnuel3 - cotisationsSociales3 - fraisProf3 - autresDeductions3;
const ir3 = calculerIR(baseImposable3);

console.log(`   - Cotisations sociales (10%): ${cotisationsSociales3.toFixed(2)} DH`);
console.log(`   - Frais professionnels (20%): ${fraisProf3.toFixed(2)} DH`);
console.log(`   - Autres déductions (20%): ${autresDeductions3.toFixed(2)} DH`);
console.log(`   → Base imposable: ${baseImposable3.toFixed(2)} DH`);
console.log(`   → IR annuel: ${ir3.toFixed(2)} DH`);
console.log(`   → IR mensuel: ${(ir3/12).toFixed(2)} DH\n`);

// Test 4: Calcul pour obtenir exactement 6,062 DH net mensuel avec IR = 438 DH/an
console.log('📊 Hypothèse 4: Reconstruction depuis le net final');
const netMensuelCible = 6062;
const netAnnuelCible = netMensuelCible * 12;
const irAnnuelCible = 438;
const brutAnnuelReconstruit = netAnnuelCible + irAnnuelCible;
console.log(`   Net mensuel cible: ${netMensuelCible.toFixed(2)} DH`);
console.log(`   Net annuel: ${netAnnuelCible.toFixed(2)} DH`);
console.log(`   + IR annuel: ${irAnnuelCible.toFixed(2)} DH`);
console.log(`   = Brut annuel (sans autres retenues): ${brutAnnuelReconstruit.toFixed(2)} DH`);
console.log(`   = Brut mensuel: ${(brutAnnuelReconstruit/12).toFixed(2)} DH`);

// Cette valeur (6,066 DH/mois) est proche de 6,500 mais avec des cotisations
const difference = 78000 - brutAnnuelReconstruit;
console.log(`   Différence avec 78,000 DH: ${difference.toFixed(2)} DH`);
console.log(`   Cela pourrait correspondre aux cotisations sociales exonérées d'IR`);
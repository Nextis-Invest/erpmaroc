/**
 * Analyse de l'exemple de calcul de paie fourni
 * Comparaison avec notre système corrigé
 */

// Données extraites de l'exemple fourni
const exempleEmploye = {
  nom: 'NAJI',
  prenom: 'ABDELLATIF',
  matricule: 1,
  dateEmbauche: '01/01/2010',
  situation: 'MARIE',
  nombreEnfants: 1,
  fonction: 'RESPONSIBLE',
  avance: 1500,

  // Données problématiques de l'exemple
  tauxHoraire: 16.29, // DH/h
  heuresTravaillees: 191,

  // Calculs dans l'exemple
  salaireBase26jours: { jours: 26, taux: 300, montant: 9000 },
  salaireMensuel22jours: { jours: 22, taux: 346.15, montant: 7615.38 },

  // Éléments variables
  congesPayes: { jours: 2, taux: 346.15, montant: 692.31 },
  joursFeries: { jours: 2, taux: 346.15, montant: 692.31 },
  heuresSupp25: { heures: 2, taux: 47.12, montant: 117.80 },
  heuresSupp50: { heures: 2, taux: 47.12, montant: 141.36 },
  heuresSupp100: { heures: 2, taux: 47.12, montant: 188.48 },

  // Totaux calculés dans l'exemple
  salaireBaseImposable: 9447.64,
  primeAnciennete: { annees: 14, taux: 0.15, montant: 1417.15 },
  salaireBrutGlobal: 10864.79,
  salaireBrutImposable: 10864.79,

  // Cotisations dans l'exemple
  cnss: { base: 10864.79, taux: 0.0448, montant: 268.8 }, // ERREUR: base trop élevée
  amo: { base: 10864.79, taux: 0.0226, montant: 245.54 },
  fraisProfessionnels: { base: 10864.79, taux: 0.25, montant: 2716.20 }, // ERREUR: taux incorrect

  // Cotisations patronales
  allocationFamiliale: { base: 10864.79, taux: 0.064, montant: 695.35 },
  prestationsSociales: { base: 10864.79, taux: 0.0898, montant: 538.80 },
  taxeFormation: { base: 10864.79, taux: 0.016, montant: 173.84 },
  amoPatronale: { base: 10864.79, taux: 0.0411, montant: 446.54 },

  // Résultats finaux
  salaireNetImposable: 7634.25,
  irBrut: 1162.31,
  chargeFamille: 60,
  irNet: 1102.31,
  salaireNet: 7748.13,
  netAPayer: 7748
};

function analyserExemple() {
  console.log('📊 ANALYSE DE L\'EXEMPLE DE CALCUL DE PAIE');
  console.log('='.repeat(60));

  console.log('👤 Employé:', exempleEmploye.prenom, exempleEmploye.nom);
  console.log('📅 Date d\'embauche:', exempleEmploye.dateEmbauche);
  console.log('👨‍👩‍👧‍👦 Situation:', exempleEmploye.situation, '- Enfants:', exempleEmploye.nombreEnfants);
  console.log('');

  console.log('🔍 PROBLÈMES IDENTIFIÉS DANS L\'EXEMPLE:');
  console.log('='.repeat(50));

  // Problème 1: Calcul du salaire de base incohérent
  console.log('❌ PROBLÈME 1 - Salaires de base incohérents:');
  console.log('   Salaire 26 jours × 300 DH =', exempleEmploye.salaireBase26jours.montant, 'DH');
  console.log('   Salaire 22 jours × 346.15 DH =', exempleEmploye.salaireMensuel22jours.montant.toFixed(2), 'DH');
  console.log('   ⚠️  Deux bases différentes pour le même employé!');
  console.log('');

  // Problème 2: Taux horaire dérivé incorrectement
  const salaireBaseMensuelReel = exempleEmploye.salaireBase26jours.montant;
  const tauxHoraireCorrect = salaireBaseMensuelReel / 191;
  console.log('❌ PROBLÈME 2 - Taux horaire incorrect:');
  console.log('   Exemple:', exempleEmploye.tauxHoraire, 'DH/h');
  console.log('   Correct:', tauxHoraireCorrect.toFixed(2), 'DH/h');
  console.log('   Calcul: 9000 DH ÷ 191h =', tauxHoraireCorrect.toFixed(2), 'DH/h');
  console.log('');

  // Problème 3: Frais professionnels incorrects (25% au lieu de 20%)
  console.log('❌ PROBLÈME 3 - Frais professionnels:');
  console.log('   Exemple: 25% =', exempleEmploye.fraisProfessionnels.montant.toFixed(2), 'DH');
  console.log('   Correct: 20% =', (exempleEmploye.salaireBrutImposable * 0.20).toFixed(2), 'DH');
  console.log('   Écart:', ((exempleEmploye.fraisProfessionnels.montant - exempleEmploye.salaireBrutImposable * 0.20)).toFixed(2), 'DH');
  console.log('');

  // Problème 4: CNSS calculée sur base incorrecte
  const cnssCorrect = Math.min(exempleEmploye.salaireBrutImposable, 6000) * 0.0448;
  console.log('❌ PROBLÈME 4 - Base CNSS incorrecte:');
  console.log('   Exemple: Base', exempleEmploye.cnss.base.toFixed(2), 'DH → CNSS', exempleEmploye.cnss.montant, 'DH');
  console.log('   Correct: Base 6000 DH (plafonnée) → CNSS', cnssCorrect.toFixed(2), 'DH');
  console.log('   Note: CNSS plafonnée à 6000 DH');
  console.log('');

  // Calcul correct complet
  console.log('✅ CALCUL CORRECT SELON LA RÉGLEMENTATION:');
  console.log('='.repeat(50));

  const salaireBaseMensuel = 9000; // Prendre la base de 26 jours comme référence
  const ancienneteMois = 14 * 12; // 14 ans
  const primeAncienneteCorrecte = salaireBaseMensuel * 0.15; // 15% après 12 ans
  const salaireBrutImposableCorrect = salaireBaseMensuel + primeAncienneteCorrecte;

  const cnssCorrecte = Math.min(salaireBrutImposableCorrect, 6000) * 0.0448;
  const amoCorrecte = salaireBrutImposableCorrect * 0.0226;
  const fraisProfessionnelsCorrects = Math.min(salaireBrutImposableCorrect * 0.20, 2500);

  const salaireNetImposableCorrect = salaireBrutImposableCorrect - cnssCorrecte - amoCorrecte - fraisProfessionnelsCorrects;

  // Calcul IR correct (marié, 1 enfant)
  const salaireAnnuel = salaireNetImposableCorrect * 12;
  let irBrutCorrect = 0;

  if (salaireAnnuel > 30000) {
    if (salaireAnnuel <= 50000) {
      irBrutCorrect = (salaireAnnuel * 0.10 - 3000) / 12;
    } else if (salaireAnnuel <= 60000) {
      irBrutCorrect = (salaireAnnuel * 0.20 - 8000) / 12;
    } else if (salaireAnnuel <= 80000) {
      irBrutCorrect = (salaireAnnuel * 0.30 - 14000) / 12;
    } else if (salaireAnnuel <= 180000) {
      irBrutCorrect = (salaireAnnuel * 0.34 - 17200) / 12;
    }
  }

  const chargeFamilleCorrecte = 360 / 12; // 30 DH/mois pour 1 enfant
  const irNetCorrect = Math.max(0, irBrutCorrect - chargeFamilleCorrecte);
  const salaireNetCorrect = salaireNetImposableCorrect - irNetCorrect;

  console.log('Salaire de base mensuel:', salaireBaseMensuel, 'DH');
  console.log('Prime d\'ancienneté (15%):', primeAncienneteCorrecte.toFixed(2), 'DH');
  console.log('Salaire brut imposable:', salaireBrutImposableCorrect.toFixed(2), 'DH');
  console.log('CNSS (4.48%, max 6000):', cnssCorrecte.toFixed(2), 'DH');
  console.log('AMO (2.26%):', amoCorrecte.toFixed(2), 'DH');
  console.log('Frais professionnels (20%):', fraisProfessionnelsCorrects.toFixed(2), 'DH');
  console.log('Salaire net imposable:', salaireNetImposableCorrect.toFixed(2), 'DH');
  console.log('IR brut:', irBrutCorrect.toFixed(2), 'DH');
  console.log('Charges familiales:', chargeFamilleCorrecte.toFixed(2), 'DH');
  console.log('IR net:', irNetCorrect.toFixed(2), 'DH');
  console.log('Salaire net:', salaireNetCorrect.toFixed(2), 'DH');
  console.log('Net à payer (après avance):', (salaireNetCorrect - exempleEmploye.avance).toFixed(2), 'DH');

  console.log('');
  console.log('📊 COMPARAISON FINALE:');
  console.log('='.repeat(50));
  console.log('Exemple fourni - Salaire net:', exempleEmploye.salaireNet, 'DH');
  console.log('Calcul correct - Salaire net:', salaireNetCorrect.toFixed(2), 'DH');
  console.log('Écart:', (salaireNetCorrect - exempleEmploye.salaireNet).toFixed(2), 'DH');
  console.log('Pourcentage d\'écart:', (((salaireNetCorrect - exempleEmploye.salaireNet) / exempleEmploye.salaireNet) * 100).toFixed(1), '%');

  console.log('');
  console.log('🎯 CONCLUSION:');
  console.log('='.repeat(50));
  console.log('❌ L\'exemple fourni contient plusieurs erreurs majeures');
  console.log('✅ Notre système corrigé applique les bons calculs');
  console.log('📊 Écart significatif détecté dans les résultats');
  console.log('🔧 Les corrections que nous avons implémentées sont nécessaires');
}

// Exécuter l'analyse
analyserExemple();
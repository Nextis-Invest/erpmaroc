/**
 * Analyse des erreurs du bulletin de paie EMP002 - Yasmine BENALI
 * Identification des problèmes de calcul
 */

// Données du bulletin problématique
const bulletinProblematique = {
  employeeId: 'EMP002',
  nom: 'BENALI',
  prenom: 'Yasmine',
  salaireBase: 38000, // Salaire réel selon les données
  situationFamiliale: 'CELIBATAIRE',
  nombreEnfants: 0,

  // Valeurs erronées du bulletin
  bulletin: {
    tauxHoraire: 215.91,
    totalHeuresTravaillees: 191,
    salaireBase26: 9000, // ERREUR: 26 jours × 300 = 9000 DH ???
    salaireBaseMensuel22: 7615.38, // ERREUR: 22 jours × 346.15 = 7615.38 DH
    salaireBrutGlobal: 43400,
    salaireBrutImposable: 43400,
    cnss: 268.80,
    amo: 245.54,
    salaireNetImposable: 38119.94,
    irBrut: 1162.31,
    chargeFamille: 60.00,
    avanceSalaire: 1500.00,
    salaireNet: 7748.13
  }
};

// Calculs corrects attendus
function calculerCorrectement() {
  console.log('📊 ANALYSE DES ERREURS DU BULLETIN DE PAIE\n');
  console.log('👤 Employé:', bulletinProblematique.nom, bulletinProblematique.prenom);
  console.log('💰 Salaire de base réel:', bulletinProblematique.salaireBase, 'DH\n');

  // 1. Calcul du taux horaire correct
  const heuresStandardMensuelles = 191; // 26 jours × 8h - 17h (congés/fériés)
  const tauxHoraireCorrect = bulletinProblematique.salaireBase / heuresStandardMensuelles;

  console.log('🔍 ERREURS IDENTIFIÉES:');
  console.log('==========================================');

  // Erreur 1: Taux horaire
  console.log('❌ ERREUR 1 - Taux horaire:');
  console.log('   Bulletin: 215.91 DH/h');
  console.log('   Correct: ', tauxHoraireCorrect.toFixed(2), 'DH/h');
  console.log('   Calcul: 38000 DH ÷ 191h =', tauxHoraireCorrect.toFixed(2), 'DH/h\n');

  // Erreur 2: Salaire de base mensuel incorrect
  console.log('❌ ERREUR 2 - Salaire de base mensuel:');
  console.log('   Bulletin: 7615.38 DH (22 jours × 346.15)');
  console.log('   Correct: 38000 DH (salaire mensuel complet)');
  console.log('   Le bulletin utilise un calcul par jour au lieu du salaire mensuel fixe\n');

  // Erreur 3: Salaire brut global démesuré
  console.log('❌ ERREUR 3 - Salaire brut global:');
  console.log('   Bulletin: 43400 DH');
  console.log('   Correct: ~38000 DH + primes (si applicables)');
  console.log('   Écart: +', (bulletinProblematique.bulletin.salaireBrutGlobal - bulletinProblematique.salaireBase), 'DH soit +',
    (((bulletinProblematique.bulletin.salaireBrutGlobal - bulletinProblematique.salaireBase) / bulletinProblematique.salaireBase) * 100).toFixed(1), '%\n');

  // Erreur 4: Cotisations CNSS incorrectes
  const cnssCorrect = Math.min(bulletinProblematique.salaireBase, 6000) * 0.0448;
  console.log('❌ ERREUR 4 - Cotisation CNSS:');
  console.log('   Bulletin: 268.80 DH');
  console.log('   Correct: ', cnssCorrect.toFixed(2), 'DH');
  console.log('   Calcul: min(38000, 6000) × 4.48% =', cnssCorrect.toFixed(2), 'DH\n');

  // Erreur 5: Cotisation AMO incorrecte
  const amoCorrect = bulletinProblematique.salaireBase * 0.0226;
  console.log('❌ ERREUR 5 - Cotisation AMO:');
  console.log('   Bulletin: 245.54 DH');
  console.log('   Correct: ', amoCorrect.toFixed(2), 'DH');
  console.log('   Calcul: 38000 × 2.26% =', amoCorrect.toFixed(2), 'DH\n');

  // Calcul correct complet
  console.log('✅ CALCULS CORRECTS:');
  console.log('==========================================');
  const salaireBaseMensuel = bulletinProblematique.salaireBase;
  const primeAnciennete = 0; // Pas d'ancienneté suffisante
  const salaireBrutImposable = salaireBaseMensuel + primeAnciennete;
  const cnssCorrectFinal = Math.min(salaireBrutImposable, 6000) * 0.0448;
  const amoCorrectFinal = salaireBrutImposable * 0.0226;
  const totalCotisations = cnssCorrectFinal + amoCorrectFinal;

  // Frais professionnels (20% du brut, plafonné)
  const fraisProfessionnels = Math.min(salaireBrutImposable * 0.20, 2500);

  // Salaire net imposable
  const salaireNetImposable = salaireBrutImposable - totalCotisations - fraisProfessionnels;

  // IR (célibataire 0 enfant)
  const salaireNetImposableAnnuel = salaireNetImposable * 12;
  let ir = 0;
  if (salaireNetImposableAnnuel > 30000) {
    if (salaireNetImposableAnnuel <= 50000) {
      ir = (salaireNetImposableAnnuel * 0.10 - 3000) / 12;
    } else if (salaireNetImposableAnnuel <= 60000) {
      ir = (salaireNetImposableAnnuel * 0.20 - 8000) / 12;
    } else if (salaireNetImposableAnnuel <= 80000) {
      ir = (salaireNetImposableAnnuel * 0.30 - 14000) / 12;
    } else if (salaireNetImposableAnnuel <= 180000) {
      ir = (salaireNetImposableAnnuel * 0.34 - 17200) / 12;
    } else {
      ir = (salaireNetImposableAnnuel * 0.38 - 24400) / 12;
    }
  }
  ir = Math.max(0, ir);

  const salaireNet = salaireNetImposable - ir;

  console.log('Salaire de base mensuel:', salaireBaseMensuel.toFixed(2), 'DH');
  console.log('Salaire brut imposable:', salaireBrutImposable.toFixed(2), 'DH');
  console.log('CNSS (4.48%):', cnssCorrectFinal.toFixed(2), 'DH');
  console.log('AMO (2.26%):', amoCorrectFinal.toFixed(2), 'DH');
  console.log('Frais professionnels (20%):', fraisProfessionnels.toFixed(2), 'DH');
  console.log('Salaire net imposable:', salaireNetImposable.toFixed(2), 'DH');
  console.log('IR mensuel:', ir.toFixed(2), 'DH');
  console.log('Salaire net:', salaireNet.toFixed(2), 'DH');

  console.log('\n🎯 RÉSUMÉ DES PROBLÈMES:');
  console.log('==========================================');
  console.log('1. Le bulletin utilise des calculs journaliers au lieu de mensuels');
  console.log('2. Le salaire brut est gonflé artificiellement (+14%');
  console.log('3. Les cotisations sont calculées sur une base erronée');
  console.log('4. Le salaire net final est très sous-évalué');
  console.log('5. La structure du bulletin ne correspond pas aux standards marocains');
}

// Exécuter l'analyse
calculerCorrectement();
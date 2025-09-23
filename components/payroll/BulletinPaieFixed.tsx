/**
 * Version corrigée de la fonction calculateBulletinData
 * Cette fonction utilise les calculs corrects du service de paie
 * au lieu des valeurs erronées stockées dans l'employé
 */

import type { PayrollEmployee, PayrollCalculation } from '@/types/payroll';

export const calculateBulletinDataFixed = (employee: PayrollEmployee, calculation: PayrollCalculation) => {
  // Constantes réglementaires
  const HEURES_MENSUELLES_STANDARD = 191; // 26 jours × 8h - congés/fériés
  const TAUX_CNSS_PATRONAL_ALLOCATION = 0.064; // 6.4%
  const TAUX_CNSS_PATRONAL_PRESTATIONS = 0.0898; // 8.98%
  const TAUX_AMO_PATRONAL = 0.0411; // 4.11%

  // Calculs de base corrects
  const tauxHoraireCorrect = calculation.salaire_base / HEURES_MENSUELLES_STANDARD;

  // Cotisations patronales correctes
  const allocationFamilialePatronale = calculation.salaire_base * TAUX_CNSS_PATRONAL_ALLOCATION;
  const prestationsSocialesPatronales = calculation.salaire_base * TAUX_CNSS_PATRONAL_PRESTATIONS;
  const amoPatronale = calculation.salaire_base * TAUX_AMO_PATRONAL;

  return {
    // Informations de base - CORRIGES
    tauxHoraire: tauxHoraireCorrect.toFixed(2),
    totalHeuresTravaillees: HEURES_MENSUELLES_STANDARD,

    // Salaire de base - SIMPLIFIE
    salaireBaseJours: '-', // Non applicable pour salaire mensuel
    salaireBaseTaux: '-', // Non applicable pour salaire mensuel
    salaireBaseMontant: calculation.salaire_base,

    // Salaire mensuel - CORRIGE
    salaireMensuelJours: '-', // Non applicable
    salaireMensuelTaux: '-', // Non applicable
    salaireMensuelMontant: calculation.salaire_base,

    // Congés payés - ELIMINES (ne s'appliquent pas aux salaires mensuels)
    congePayeJours: 0,
    congePayeTaux: 0,
    congePayeMontant: 0,

    // Jours fériés - ELIMINES (ne s'appliquent pas aux salaires mensuels)
    joursFeriesJours: 0,
    joursFeriesTaux: 0,
    joursFeriesMontant: 0,

    // Heures supplémentaires - ELIMINEES par défaut
    heuresSupp25: {
      heures: 0,
      taux: 0,
      montant: 0,
    },
    heuresSupp50: {
      heures: 0,
      taux: 0,
      montant: 0,
    },
    heuresSupp100: {
      heures: 0,
      taux: 0,
      montant: 0,
    },

    // Prime d'ancienneté - DU SERVICE DE CALCUL
    primeAncienneteAnnees: Math.floor(calculation.anciennete_mois / 12),
    primeAncienneteTaux: calculation.prime_anciennete / calculation.salaire_base,
    primeAncienneteMontant: calculation.prime_anciennete,

    // Primes additionnelles
    primeTransport: employee.prime_transport || 0,
    primePanier: employee.prime_panier || 0,
    indemniteRepresentation: employee.indemnite_representation || 0,
    indemniteDeplacement: employee.indemnite_deplacement || 0,
    autresPrimes: employee.autres_primes || 0,
    autresIndemnites: employee.autres_indemnites || 0,

    // Salaires bruts - DU SERVICE DE CALCUL
    salaireBrutGlobal: calculation.salaire_brut_global,
    salaireBrutImposable: calculation.salaire_brut_imposable,

    // Cotisations salariales - DU SERVICE DE CALCUL
    cotisationCNSS: {
      base: Math.min(calculation.salaire_brut_imposable, 6000),
      taux: 0.0448,
      montant: calculation.cnss_salariale,
    },
    cotisationAMO: {
      base: calculation.salaire_brut_imposable,
      taux: 0.0226,
      montant: calculation.amo_salariale,
    },

    // Cotisations patronales - CALCULEES CORRECTEMENT
    allocationFamiliale: {
      taux: TAUX_CNSS_PATRONAL_ALLOCATION,
      montant: allocationFamilialePatronale,
    },
    prestationsSociales: {
      taux: TAUX_CNSS_PATRONAL_PRESTATIONS,
      montant: prestationsSocialesPatronales,
    },
    amoPatronale: {
      taux: TAUX_AMO_PATRONAL,
      montant: amoPatronale,
    },

    // Mutuelle et CIMR - de l'employé si disponible
    cotisationMutuelle: {
      base: employee.mutuelle_base || 0,
      taux: employee.mutuelle_taux || 0,
      montant: employee.mutuelle_montant || 0,
    },
    cotisationCIMR: {
      base: employee.cimr_base || 0,
      taux: employee.cimr_taux || 0,
      montant: employee.cimr_montant || 0,
    },

    // Frais professionnels - DU SERVICE DE CALCUL
    fraisProfessionnels: {
      base: calculation.salaire_brut_imposable,
      taux: 0.20,
      montant: calculation.frais_professionnels,
    },

    // Salaire net imposable - DU SERVICE DE CALCUL
    salaireNetImposable: calculation.salaire_net_imposable,

    // IR - DU SERVICE DE CALCUL
    irBrut: calculation.ir_brut,
    chargeFamille: calculation.charges_familiales,
    irNet: calculation.ir_net,

    // Autres déductions
    avanceSalaire: employee.avance_salaire || 0,
    autresDeductions: employee.autres_deductions || 0,

    // Salaire net final - DU SERVICE DE CALCUL
    salaireNet: calculation.salaire_net,
    netAPayer: calculation.salaire_net - (employee.avance_salaire || 0),

    // Congés (soldes seulement)
    conges: {
      cpN1: {
        acquis: employee.conge_paye_jours || 0,
        pris: 0,
        solde: employee.conge_paye_jours || 0,
      },
      cpAnneeEnCours: {
        acquis: 23.5, // 2.5 jours par mois × 12 mois - congés déjà pris
        pris: 0,
        solde: 23.5,
      },
    },
  };
};

/**
 * Fonction pour diagnostiquer les écarts entre ancien et nouveau calcul
 */
export const diagnoseBulletinDifferences = (
  employee: PayrollEmployee,
  calculation: PayrollCalculation,
  oldData: any,
  newData: any
) => {
  console.log('📊 DIAGNOSTIC DES CORRECTIONS DU BULLETIN DE PAIE');
  console.log('='.repeat(50));

  console.log('👤 Employé:', employee.prenom, employee.nom);
  console.log('💰 Salaire de base:', calculation.salaire_base, 'DH');
  console.log('');

  // Comparaisons clés
  const comparisons = [
    {
      label: 'Taux horaire',
      old: oldData.tauxHoraire,
      new: newData.tauxHoraire,
      unit: 'DH/h'
    },
    {
      label: 'Salaire mensuel',
      old: oldData.salaireMensuelMontant,
      new: newData.salaireMensuelMontant,
      unit: 'DH'
    },
    {
      label: 'Salaire brut global',
      old: oldData.salaireBrutGlobal,
      new: newData.salaireBrutGlobal,
      unit: 'DH'
    },
    {
      label: 'CNSS salariale',
      old: oldData.cotisationCNSS?.montant,
      new: newData.cotisationCNSS.montant,
      unit: 'DH'
    },
    {
      label: 'AMO salariale',
      old: oldData.cotisationAMO?.montant,
      new: newData.cotisationAMO.montant,
      unit: 'DH'
    },
    {
      label: 'Salaire net',
      old: oldData.salaireNet,
      new: newData.salaireNet,
      unit: 'DH'
    }
  ];

  comparisons.forEach(comp => {
    const oldVal = Number(comp.old) || 0;
    const newVal = Number(comp.new) || 0;
    const diff = newVal - oldVal;
    const pctChange = oldVal > 0 ? (diff / oldVal * 100) : 0;

    console.log(`${comp.label}:`);
    console.log(`  Ancien: ${oldVal.toFixed(2)} ${comp.unit}`);
    console.log(`  Nouveau: ${newVal.toFixed(2)} ${comp.unit}`);
    console.log(`  Écart: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} ${comp.unit} (${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%)`);
    console.log('');
  });
};
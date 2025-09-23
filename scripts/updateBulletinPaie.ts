/**
 * Script pour appliquer les corrections au composant BulletinPaie
 * Ce script remplace la fonction calculateBulletinData défaillante par la version corrigée
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const BULLETIN_PAIE_PATH = '/Users/nextisinvest/nextis-apps/ERP Maroc/ERP/components/payroll/BulletinPaie.tsx';

const NEW_CALCULATE_FUNCTION = `const calculateBulletinData = (employee: PayrollEmployee, calculation: PayrollCalculation) => {
  // CALCULS CORRIGES - Utilise les données du service de calcul au lieu des valeurs erronées de l'employé

  // Constantes réglementaires
  const HEURES_MENSUELLES_STANDARD = 191;
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

    // Salaire de base - SIMPLIFIE pour salaire mensuel
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
    primeAncienneteTaux: calculation.prime_anciennete > 0 ? (calculation.prime_anciennete / calculation.salaire_base) : 0,
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

    // Cotisations patronales - CALCULEES CORRECTEMENT
    allocationFamiliale: {
      base: calculation.salaire_base,
      taux: TAUX_CNSS_PATRONAL_ALLOCATION,
      montant: allocationFamilialePatronale,
    },
    prestationsSociales: {
      base: calculation.salaire_base,
      taux: TAUX_CNSS_PATRONAL_PRESTATIONS,
      montant: prestationsSocialesPatronales,
    },
    taxeFormation: {
      base: calculation.salaire_base,
      taux: 0.016,
      montant: calculation.taxe_formation,
    },
    amoPatronale: {
      base: calculation.salaire_base,
      taux: TAUX_AMO_PATRONAL,
      montant: amoPatronale,
    },

    // Calculs finaux - DU SERVICE DE CALCUL
    salaireNetImposable: calculation.salaire_net_imposable,
    irBrut: calculation.ir_brut,
    chargeFamille: calculation.charges_familiales,
    irNet: calculation.ir_net,
    avanceSalaire: employee.avance_salaire || 0,
    cotisationSolidarite: 0, // Non utilisé actuellement
    salaireNet: calculation.salaire_net,
    netAPayer: calculation.salaire_net - (employee.avance_salaire || 0),
  };
};`;

function updateBulletinPaie() {
  console.log('🔧 MISE À JOUR DU COMPOSANT BULLETIN DE PAIE');
  console.log('='.repeat(50));

  try {
    // Lire le fichier actuel
    const content = readFileSync(BULLETIN_PAIE_PATH, 'utf-8');

    // Trouver le début et la fin de la fonction calculateBulletinData
    const startMarker = 'const calculateBulletinData = (employee: PayrollEmployee, calculation: PayrollCalculation) => {';
    const endMarker = '};';

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
      throw new Error('Fonction calculateBulletinData non trouvée');
    }

    // Trouver la fin de la fonction (chercher le bon "};")
    let braceCount = 0;
    let endIndex = startIndex + startMarker.length;
    let inString = false;
    let inComment = false;

    for (let i = endIndex; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      const nextChar = i < content.length - 1 ? content[i + 1] : '';

      // Gestion des chaînes de caractères
      if (!inComment && (char === '"' || char === "'" || char === '`')) {
        if (prevChar !== '\\') {
          inString = !inString;
        }
        continue;
      }

      if (inString) continue;

      // Gestion des commentaires
      if (!inComment && char === '/' && nextChar === '/') {
        inComment = true;
        continue;
      }
      if (inComment && char === '\n') {
        inComment = false;
        continue;
      }
      if (inComment) continue;

      // Compter les accolades
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === -1) {
          endIndex = i + 1;
          break;
        }
      }
    }

    if (braceCount !== -1) {
      throw new Error('Fin de fonction calculateBulletinData non trouvée');
    }

    // Remplacer la fonction
    const beforeFunction = content.substring(0, startIndex);
    const afterFunction = content.substring(endIndex);
    const newContent = beforeFunction + NEW_CALCULATE_FUNCTION + afterFunction;

    // Sauvegarder
    writeFileSync(BULLETIN_PAIE_PATH, newContent, 'utf-8');

    console.log('✅ Fonction calculateBulletinData mise à jour avec succès');
    console.log('📊 Statistiques:');
    console.log('  - Ancienne fonction:', endIndex - startIndex, 'caractères');
    console.log('  - Nouvelle fonction:', NEW_CALCULATE_FUNCTION.length, 'caractères');
    console.log('  - Position:', startIndex, 'à', endIndex);

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  }
}

// Exécuter la mise à jour
updateBulletinPaie();
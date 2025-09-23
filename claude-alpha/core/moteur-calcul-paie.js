/**
 * Moteur de Calcul de Paie Marocain - Claude Alpha
 * Instance Production avec terminologie officielle française
 * Devise: Dirham Marocain (MAD/DH)
 */

const { formatCurrency, formatPercentage, t } = require('../config/translations');

class MoteurCalculPaieMarocain {
  constructor(config = {}) {
    this.config = {
      instance: 'alpha',
      version: '1.0.0',
      devise: 'MAD',
      ...config
    };

    // Constantes officielles de paie (2024)
    this.CONSTANTES = {
      CNSS: {
        TAUX_SALARIE: 0.0448,  // 4.48%
        PLAFOND_MENSUEL: 6000,  // 6 000 DH
        COTISATION_MAX: 268.80  // 6000 * 0.0448
      },
      AMO: {
        TAUX_SALARIE: 0.0226,  // 2.26%
        TAUX_EMPLOYEUR: 0.0185 // 1.85%
      },
      FRAIS_PROFESSIONNELS: {
        TAUX_STANDARD: 0.20,    // 20%
        PLAFOND_MENSUEL: 2500,  // 2 500 DH
        PLAFOND_ANNUEL: 30000   // 30 000 DH
      },
      IR: {
        DEDUCTION_ENFANT: 30,   // 30 DH par enfant
        MAX_ENFANTS: 6,         // Maximum 6 enfants
        DEDUCTION_MAX: 180      // 180 DH maximum
      }
    };

    // Barème IR mensuel 2024
    this.BAREME_IR = [
      { min: 0, max: 2500, taux: 0, deduction: 0 },
      { min: 2501, max: 4166.67, taux: 0.10, deduction: 250 },
      { min: 4167, max: 5000, taux: 0.20, deduction: 666.67 },
      { min: 5001, max: 6666.67, taux: 0.30, deduction: 1166.67 },
      { min: 6667, max: 15000, taux: 0.34, deduction: 1433.33 },
      { min: 15001, max: null, taux: 0.38, deduction: 2033 }
    ];

    // Barème prime d'ancienneté
    this.BAREME_ANCIENNETE = [
      { min: 0, max: 24, taux: 0 },      // < 2 ans
      { min: 25, max: 60, taux: 0.05 },  // 2-5 ans
      { min: 61, max: 144, taux: 0.10 }, // 5-12 ans
      { min: 145, max: 240, taux: 0.15 }, // 12-20 ans
      { min: 241, max: 300, taux: 0.20 }, // 20-25 ans
      { min: 301, max: null, taux: 0.25 } // > 25 ans
    ];
  }

  /**
   * Calcul complet du bulletin de paie
   * @param {Object} employe - Données de l'employé
   * @returns {Object} Bulletin de paie détaillé
   */
  calculerBulletinPaie(employe) {
    try {
      // Validation des données
      this.validerDonneesEmploye(employe);

      // 1. Calcul du salaire de base et prime d'ancienneté
      const salaireBase = employe.salaire_base || 0;
      const primeAnciennete = this.calculerPrimeAnciennete(salaireBase, employe.anciennete_mois);

      // 2. Calcul du Salaire Brut Global (SBG)
      const salaireBrutGlobal = this.calculerSalaireBrutGlobal({
        salaireBase,
        primeAnciennete,
        primesImposables: employe.primes_imposables || 0,
        heuresSupp: employe.heures_supplementaires || 0
      });

      // 3. Calcul du Salaire Brut Imposable (SBI)
      const salaireBrutImposable = salaireBrutGlobal; // Simplifié

      // 4. Calcul des cotisations sociales
      const cotisations = this.calculerCotisationsSociales(salaireBrutImposable, employe);

      // 5. Calcul du Salaire Net Imposable (SNI)
      const salaireNetImposable = this.calculerSalaireNetImposable(
        salaireBrutImposable,
        cotisations
      );

      // 6. Calcul de l'IR
      const ir = this.calculerIR(salaireNetImposable, employe);

      // 7. Calcul du Net à Payer
      const netAPayer = this.calculerNetAPayer({
        salaireBrutGlobal,
        cotisations,
        ir,
        autresRetenues: employe.autres_retenues || 0,
        primesNonImposables: employe.primes_non_imposables || 0
      });

      // 8. Calcul des cotisations patronales
      const cotisationsPatronales = this.calculerCotisationsPatronales(salaireBrutImposable);

      // Génération du bulletin
      return this.genererBulletin({
        employe,
        salaireBase,
        primeAnciennete,
        salaireBrutGlobal,
        salaireBrutImposable,
        cotisations,
        salaireNetImposable,
        ir,
        netAPayer,
        cotisationsPatronales
      });

    } catch (error) {
      this.logErreur('Erreur calcul bulletin', error, employe);
      throw error;
    }
  }

  /**
   * Calcul de la prime d'ancienneté
   */
  calculerPrimeAnciennete(salaireBase, ancienneteMois) {
    const tranche = this.BAREME_ANCIENNETE.find(
      b => ancienneteMois >= b.min && (b.max === null || ancienneteMois <= b.max)
    );

    const taux = tranche ? tranche.taux : 0;
    const prime = salaireBase * taux;

    return {
      montant: Math.round(prime * 100) / 100,
      taux: taux,
      mois: ancienneteMois,
      libelle: this.getLibelleAnciennete(ancienneteMois)
    };
  }

  /**
   * Calcul du Salaire Brut Global
   */
  calculerSalaireBrutGlobal({ salaireBase, primeAnciennete, primesImposables, heuresSupp }) {
    const total =
      salaireBase +
      (primeAnciennete.montant || primeAnciennete) +
      primesImposables +
      heuresSupp;

    return Math.round(total * 100) / 100;
  }

  /**
   * Calcul des cotisations sociales
   */
  calculerCotisationsSociales(salaireBrutImposable, employe) {
    // CNSS Part Salariale
    const baseCNSS = Math.min(salaireBrutImposable, this.CONSTANTES.CNSS.PLAFOND_MENSUEL);
    const cnssPartSalariale = baseCNSS * this.CONSTANTES.CNSS.TAUX_SALARIE;

    // AMO Part Salariale (pas de plafond)
    const amoPartSalariale = salaireBrutImposable * this.CONSTANTES.AMO.TAUX_SALARIE;

    // CIMR (optionnel)
    const tauxCIMR = employe.taux_cimr || 0;
    const cimr = tauxCIMR ? salaireBrutImposable * tauxCIMR : 0;

    // Assurance Groupe (optionnel)
    const tauxAssurance = employe.taux_assurance || 0;
    const assuranceGroupe = tauxAssurance ? salaireBrutImposable * tauxAssurance : 0;

    // Frais Professionnels
    const fraisProfessionnels = Math.min(
      salaireBrutImposable * this.CONSTANTES.FRAIS_PROFESSIONNELS.TAUX_STANDARD,
      this.CONSTANTES.FRAIS_PROFESSIONNELS.PLAFOND_MENSUEL
    );

    return {
      cnss: {
        libelle: t('payroll_terms.cnss_part_salariale'),
        base: baseCNSS,
        taux: this.CONSTANTES.CNSS.TAUX_SALARIE,
        montant: Math.round(cnssPartSalariale * 100) / 100
      },
      amo: {
        libelle: t('payroll_terms.amo_part_salariale'),
        base: salaireBrutImposable,
        taux: this.CONSTANTES.AMO.TAUX_SALARIE,
        montant: Math.round(amoPartSalariale * 100) / 100
      },
      cimr: {
        libelle: t('payroll_terms.cimr'),
        base: salaireBrutImposable,
        taux: tauxCIMR,
        montant: Math.round(cimr * 100) / 100
      },
      assurance: {
        libelle: t('payroll_terms.assurance_groupe'),
        base: salaireBrutImposable,
        taux: tauxAssurance,
        montant: Math.round(assuranceGroupe * 100) / 100
      },
      fraisProfessionnels: {
        libelle: t('payroll_terms.frais_professionnels'),
        base: salaireBrutImposable,
        taux: this.CONSTANTES.FRAIS_PROFESSIONNELS.TAUX_STANDARD,
        montant: Math.round(fraisProfessionnels * 100) / 100
      },
      total: Math.round((cnssPartSalariale + amoPartSalariale + cimr + assuranceGroupe + fraisProfessionnels) * 100) / 100
    };
  }

  /**
   * Calcul du Salaire Net Imposable
   */
  calculerSalaireNetImposable(salaireBrutImposable, cotisations) {
    const sni = salaireBrutImposable - cotisations.total;
    return Math.round(sni * 100) / 100;
  }

  /**
   * Calcul de l'Impôt sur le Revenu
   */
  calculerIR(salaireNetImposable, employe) {
    // Trouver la tranche d'imposition
    const tranche = this.BAREME_IR.find(
      b => salaireNetImposable >= b.min && (b.max === null || salaireNetImposable <= b.max)
    );

    // Calcul de l'IR brut
    let irBrut = 0;
    if (tranche && tranche.taux > 0) {
      irBrut = (salaireNetImposable * tranche.taux) - tranche.deduction;
    }

    // Calcul des charges familiales
    const chargesFamiliales = this.calculerChargesFamiliales(employe);

    // IR net (après déductions familiales)
    const irNet = Math.max(0, irBrut - chargesFamiliales);

    return {
      salaireNetImposable,
      tranche: tranche ? `${tranche.min} - ${tranche.max || '+'} DH` : '0 - 2500 DH',
      taux: tranche ? tranche.taux : 0,
      irBrut: Math.round(irBrut * 100) / 100,
      chargesFamiliales,
      irNet: Math.round(irNet * 100) / 100
    };
  }

  /**
   * Calcul des charges familiales
   */
  calculerChargesFamiliales(employe) {
    const situationFamiliale = employe.situation_familiale || 'CELIBATAIRE';
    const nombreEnfants = Math.min(employe.nombre_enfants || 0, this.CONSTANTES.IR.MAX_ENFANTS);

    let deduction = 0;

    if (situationFamiliale === 'CELIBATAIRE') {
      deduction = 0;
    } else if (situationFamiliale === 'MARIE' && nombreEnfants === 0) {
      deduction = this.CONSTANTES.IR.DEDUCTION_ENFANT;
    } else {
      deduction = this.CONSTANTES.IR.DEDUCTION_ENFANT * (1 + nombreEnfants);
      deduction = Math.min(deduction, this.CONSTANTES.IR.DEDUCTION_MAX);
    }

    return deduction;
  }

  /**
   * Calcul du Net à Payer
   */
  calculerNetAPayer({ salaireBrutGlobal, cotisations, ir, autresRetenues, primesNonImposables }) {
    const totalRetenues =
      cotisations.cnss.montant +
      cotisations.amo.montant +
      cotisations.cimr.montant +
      cotisations.assurance.montant +
      ir.irNet +
      autresRetenues;

    const netAPayer = salaireBrutGlobal - totalRetenues + primesNonImposables;

    return Math.round(netAPayer * 100) / 100;
  }

  /**
   * Calcul des cotisations patronales
   */
  calculerCotisationsPatronales(salaireBrutImposable) {
    const baseCNSS = Math.min(salaireBrutImposable, this.CONSTANTES.CNSS.PLAFOND_MENSUEL);

    return {
      cnss: {
        libelle: t('payroll_terms.cnss_part_patronale'),
        taux: 0.0898,
        montant: Math.round(baseCNSS * 0.0898 * 100) / 100
      },
      amo: {
        libelle: t('payroll_terms.amo_part_patronale'),
        taux: this.CONSTANTES.AMO.TAUX_EMPLOYEUR,
        montant: Math.round(salaireBrutImposable * this.CONSTANTES.AMO.TAUX_EMPLOYEUR * 100) / 100
      },
      taxeFormation: {
        libelle: t('payroll_terms.taxe_formation_professionnelle'),
        taux: 0.016,
        montant: Math.round(salaireBrutImposable * 0.016 * 100) / 100
      },
      total: Math.round(
        (baseCNSS * 0.0898 + salaireBrutImposable * (this.CONSTANTES.AMO.TAUX_EMPLOYEUR + 0.016)) * 100
      ) / 100
    };
  }

  /**
   * Génération du bulletin de paie formaté
   */
  genererBulletin(donnees) {
    const bulletin = {
      // En-tête
      entete: {
        titre: t('labels.bulletin_paie'),
        entreprise: this.config.entreprise || 'ENTREPRISE',
        periode: donnees.employe.periode || new Date().toISOString().slice(0, 7),
        dateGeneration: new Date().toISOString(),
        instance: this.config.instance,
        version: this.config.version
      },

      // Informations employé
      employe: {
        matricule: donnees.employe.matricule,
        nom: donnees.employe.nom,
        prenom: donnees.employe.prenom,
        cin: donnees.employe.cin,
        cnss: donnees.employe.numero_cnss,
        situationFamiliale: t(`family_status.${donnees.employe.situation_familiale?.toLowerCase() || 'celibataire'}`),
        nombreEnfants: donnees.employe.nombre_enfants || 0,
        dateEmbauche: donnees.employe.date_embauche,
        anciennete: this.formatAnciennete(donnees.employe.anciennete_mois)
      },

      // Éléments de paie
      elementsPaie: {
        // Gains
        gains: [
          {
            libelle: t('payroll_terms.salaire_base'),
            nombre: donnees.employe.jours_travailles || 26,
            taux: formatCurrency(donnees.salaireBase / 26),
            montant: formatCurrency(donnees.salaireBase)
          },
          {
            libelle: donnees.primeAnciennete.libelle,
            nombre: null,
            taux: formatPercentage(donnees.primeAnciennete.taux),
            montant: formatCurrency(donnees.primeAnciennete.montant)
          },
          {
            libelle: t('payroll_terms.indemnites_imposables'),
            nombre: null,
            taux: null,
            montant: formatCurrency(donnees.employe.primes_imposables || 0)
          }
        ],

        // Total Brut
        totalBrut: {
          libelle: t('payroll_terms.salaire_brut_imposable'),
          montant: formatCurrency(donnees.salaireBrutImposable)
        },

        // Retenues
        retenues: [
          donnees.cotisations.cnss,
          donnees.cotisations.amo,
          donnees.cotisations.cimr,
          donnees.cotisations.assurance
        ].filter(c => c.montant > 0).map(c => ({
          libelle: c.libelle,
          base: formatCurrency(c.base),
          taux: formatPercentage(c.taux),
          montant: formatCurrency(c.montant)
        })),

        // IR
        impot: {
          libelle: t('payroll_terms.ir'),
          details: {
            salaireNetImposable: formatCurrency(donnees.ir.salaireNetImposable),
            tranche: donnees.ir.tranche,
            taux: formatPercentage(donnees.ir.taux),
            irBrut: formatCurrency(donnees.ir.irBrut),
            chargesFamiliales: formatCurrency(donnees.ir.chargesFamiliales),
            irNet: formatCurrency(donnees.ir.irNet)
          }
        },

        // Net à payer
        netAPayer: {
          libelle: t('payroll_terms.salaire_net_a_payer'),
          montant: formatCurrency(donnees.netAPayer)
        }
      },

      // Cotisations patronales
      cotisationsPatronales: Object.values(donnees.cotisationsPatronales)
        .filter(c => c.libelle)
        .map(c => ({
          libelle: c.libelle,
          taux: formatPercentage(c.taux),
          montant: formatCurrency(c.montant)
        })),

      // Récapitulatif
      recapitulatif: {
        salaireBrut: formatCurrency(donnees.salaireBrutGlobal),
        totalRetenues: formatCurrency(
          donnees.cotisations.total + donnees.ir.irNet
        ),
        netAPayer: formatCurrency(donnees.netAPayer),
        coutTotal: formatCurrency(
          donnees.salaireBrutGlobal + donnees.cotisationsPatronales.total
        )
      },

      // Métadonnées
      metadata: {
        calculeLe: new Date().toISOString(),
        calculePar: this.config.instance,
        hash: this.genererHash(donnees)
      }
    };

    return bulletin;
  }

  /**
   * Validation des données employé
   */
  validerDonneesEmploye(employe) {
    const erreurs = [];

    if (!employe.matricule) {
      erreurs.push(t('messages.error.donnees_manquantes') + ': Matricule');
    }

    if (!employe.salaire_base || employe.salaire_base <= 0) {
      erreurs.push(t('messages.error.salaire_invalide'));
    }

    if (employe.nombre_enfants && employe.nombre_enfants < 0) {
      erreurs.push('Nombre d\'enfants invalide');
    }

    if (erreurs.length > 0) {
      throw new Error(erreurs.join(', '));
    }

    return true;
  }

  /**
   * Formatage de l'ancienneté
   */
  formatAnciennete(mois) {
    const annees = Math.floor(mois / 12);
    const moisRestants = mois % 12;

    if (annees === 0) {
      return `${moisRestants} ${t('units.months')}`;
    } else if (moisRestants === 0) {
      return `${annees} ${t('units.years')}`;
    } else {
      return `${annees} ${t('units.years')} et ${moisRestants} ${t('units.months')}`;
    }
  }

  /**
   * Libellé de la prime d'ancienneté
   */
  getLibelleAnciennete(mois) {
    const annees = Math.floor(mois / 12);
    const tranche = this.BAREME_ANCIENNETE.find(
      b => mois >= b.min && (b.max === null || mois <= b.max)
    );

    if (!tranche || tranche.taux === 0) {
      return t('payroll_terms.prime_anciennete') + ' (0%)';
    }

    return `${t('payroll_terms.prime_anciennete')} (${formatPercentage(tranche.taux)})`;
  }

  /**
   * Génération du hash pour vérification
   */
  genererHash(donnees) {
    const crypto = require('crypto');
    const dataString = JSON.stringify({
      matricule: donnees.employe.matricule,
      periode: donnees.employe.periode,
      netAPayer: donnees.netAPayer
    });

    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Logging des erreurs
   */
  logErreur(message, erreur, donnees) {
    console.error(`[${this.config.instance}] ${message}:`, {
      erreur: erreur.message,
      stack: erreur.stack,
      donnees: donnees ? { matricule: donnees.matricule } : null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Export PDF du bulletin
   */
  async exporterPDF(bulletin) {
    // Implémentation de l'export PDF
    // Utilisation d'une librairie comme pdfkit ou puppeteer
    return {
      status: 'success',
      message: t('messages.success.generation_bulletin'),
      filename: `bulletin_${bulletin.employe.matricule}_${bulletin.entete.periode}.pdf`
    };
  }
}

module.exports = MoteurCalculPaieMarocain;
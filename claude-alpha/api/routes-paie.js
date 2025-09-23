/**
 * Routes API pour le système de paie - Claude Alpha
 * Toutes les réponses en français avec devise MAD
 */

const express = require('express');
const router = express.Router();
const MoteurCalculPaieMarocain = require('../core/moteur-calcul-paie');
const { formatCurrency, t } = require('../config/translations');

// Middleware de validation instance
const validerInstance = (req, res, next) => {
  const instance = req.headers['x-instance'];

  if (instance && instance !== 'alpha') {
    return res.status(403).json({
      statut: 'erreur',
      message: 'Cette API est réservée à l\'instance Alpha (Production)',
      code: 'INSTANCE_INCORRECTE'
    });
  }

  req.instance = 'alpha';
  next();
};

// Middleware de validation des données
const validerDonnees = (req, res, next) => {
  const { employe } = req.body;

  if (!employe) {
    return res.status(400).json({
      statut: 'erreur',
      message: t('messages.error.donnees_manquantes'),
      code: 'DONNEES_MANQUANTES'
    });
  }

  if (!employe.matricule || !employe.salaire_base) {
    return res.status(400).json({
      statut: 'erreur',
      message: 'Matricule et salaire de base sont obligatoires',
      champs_manquants: [
        !employe.matricule ? 'matricule' : null,
        !employe.salaire_base ? 'salaire_base' : null
      ].filter(Boolean)
    });
  }

  next();
};

/**
 * POST /api/v1/paie/calculer
 * Calcul du bulletin de paie pour un employé
 */
router.post('/api/v1/paie/calculer', validerInstance, validerDonnees, async (req, res) => {
  try {
    const moteur = new MoteurCalculPaieMarocain({
      instance: 'alpha',
      entreprise: req.body.entreprise || 'ENTREPRISE'
    });

    const bulletin = moteur.calculerBulletinPaie(req.body.employe);

    res.json({
      statut: 'succes',
      message: t('messages.success.calcul_reussi'),
      donnees: bulletin,
      instance: 'alpha',
      horodatage: new Date().toISOString()
    });

    // Log pour audit
    logCalcul({
      action: 'CALCUL_PAIE',
      matricule: req.body.employe.matricule,
      netAPayer: bulletin.recapitulatif.netAPayer,
      ip: req.ip,
      utilisateur: req.user?.id || 'systeme'
    });

  } catch (error) {
    console.error('Erreur calcul paie:', error);
    res.status(500).json({
      statut: 'erreur',
      message: t('messages.error.calcul_echec'),
      detail: error.message,
      code: 'ERREUR_CALCUL'
    });
  }
});

/**
 * POST /api/v1/paie/calculer-lot
 * Calcul en lot pour plusieurs employés
 */
router.post('/api/v1/paie/calculer-lot', validerInstance, async (req, res) => {
  try {
    const { employes, periode } = req.body;

    if (!employes || !Array.isArray(employes)) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Liste d\'employés requise',
        code: 'LISTE_EMPLOYES_REQUISE'
      });
    }

    const moteur = new MoteurCalculPaieMarocain({
      instance: 'alpha',
      entreprise: req.body.entreprise
    });

    const resultats = [];
    const erreurs = [];

    for (const employe of employes) {
      try {
        employe.periode = periode || employe.periode;
        const bulletin = moteur.calculerBulletinPaie(employe);
        resultats.push({
          matricule: employe.matricule,
          bulletin: bulletin,
          statut: 'succes'
        });
      } catch (error) {
        erreurs.push({
          matricule: employe.matricule,
          erreur: error.message,
          statut: 'echec'
        });
      }
    }

    res.json({
      statut: 'succes',
      message: `Calcul terminé: ${resultats.length} réussis, ${erreurs.length} échecs`,
      donnees: {
        periode: periode,
        nombre_total: employes.length,
        reussis: resultats.length,
        echecs: erreurs.length,
        resultats: resultats,
        erreurs: erreurs
      },
      instance: 'alpha',
      horodatage: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur calcul lot:', error);
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors du calcul en lot',
      detail: error.message
    });
  }
});

/**
 * GET /api/v1/paie/baremes
 * Récupération des barèmes et constantes
 */
router.get('/api/v1/paie/baremes', validerInstance, (req, res) => {
  const moteur = new MoteurCalculPaieMarocain();

  res.json({
    statut: 'succes',
    donnees: {
      devise: {
        code: 'MAD',
        symbole: 'DH',
        nom: 'Dirham Marocain'
      },
      constantes: {
        cnss: {
          libelle: t('payroll_terms.cnss'),
          taux_salarie: '4,48%',
          plafond_mensuel: formatCurrency(6000),
          cotisation_maximale: formatCurrency(268.80)
        },
        amo: {
          libelle: t('payroll_terms.amo'),
          taux_salarie: '2,26%',
          taux_employeur: '1,85%',
          plafond: 'Aucun'
        },
        frais_professionnels: {
          libelle: t('payroll_terms.frais_professionnels'),
          taux: '20%',
          plafond_mensuel: formatCurrency(2500),
          plafond_annuel: formatCurrency(30000)
        },
        charges_familiales: {
          libelle: t('payroll_terms.charges_familiales'),
          deduction_par_personne: formatCurrency(30),
          maximum_enfants: 6,
          deduction_maximale: formatCurrency(180)
        }
      },
      bareme_ir: moteur.BAREME_IR.map(tranche => ({
        tranche: tranche.max
          ? `De ${formatCurrency(tranche.min)} à ${formatCurrency(tranche.max)}`
          : `Plus de ${formatCurrency(tranche.min)}`,
        taux: `${(tranche.taux * 100).toFixed(0)}%`,
        somme_a_deduire: formatCurrency(tranche.deduction)
      })),
      bareme_anciennete: moteur.BAREME_ANCIENNETE.map(tranche => ({
        periode: this.formatPeriodeAnciennete(tranche),
        taux: `${(tranche.taux * 100).toFixed(0)}%`
      }))
    },
    instance: 'alpha',
    version: '1.0.0'
  });
});

/**
 * POST /api/v1/paie/valider
 * Validation d'un bulletin de paie
 */
router.post('/api/v1/paie/valider', validerInstance, async (req, res) => {
  try {
    const { bulletin_id, validateur } = req.body;

    if (!bulletin_id || !validateur) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'ID bulletin et validateur requis',
        code: 'PARAMETRES_MANQUANTS'
      });
    }

    // Simulation de validation en base de données
    const validation = {
      bulletin_id: bulletin_id,
      valide_par: validateur,
      date_validation: new Date().toISOString(),
      statut: 'VALIDE'
    };

    res.json({
      statut: 'succes',
      message: t('messages.success.validation_reussie'),
      donnees: validation
    });

    // Log pour audit
    logValidation({
      action: 'VALIDATION_BULLETIN',
      bulletin_id: bulletin_id,
      validateur: validateur,
      ip: req.ip
    });

  } catch (error) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la validation',
      detail: error.message
    });
  }
});

/**
 * POST /api/v1/paie/exporter-pdf
 * Export PDF d'un bulletin de paie
 */
router.post('/api/v1/paie/exporter-pdf', validerInstance, async (req, res) => {
  try {
    const { bulletin } = req.body;

    if (!bulletin) {
      return res.status(400).json({
        statut: 'erreur',
        message: 'Bulletin requis pour export PDF',
        code: 'BULLETIN_REQUIS'
      });
    }

    const moteur = new MoteurCalculPaieMarocain();
    const resultat = await moteur.exporterPDF(bulletin);

    res.json({
      statut: 'succes',
      message: t('messages.success.generation_bulletin'),
      donnees: {
        fichier: resultat.filename,
        taille: '250 KB',
        format: 'PDF',
        genere_le: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la génération du PDF',
      detail: error.message
    });
  }
});

/**
 * GET /api/v1/paie/historique/:matricule
 * Historique de paie d'un employé
 */
router.get('/api/v1/paie/historique/:matricule', validerInstance, async (req, res) => {
  try {
    const { matricule } = req.params;
    const { debut, fin } = req.query;

    // Simulation de récupération depuis la base de données
    const historique = [
      {
        periode: '2024-01',
        salaire_brut: formatCurrency(15000),
        net_a_payer: formatCurrency(12500),
        date_calcul: '2024-01-25',
        statut: 'PAYE'
      },
      {
        periode: '2024-02',
        salaire_brut: formatCurrency(15000),
        net_a_payer: formatCurrency(12500),
        date_calcul: '2024-02-25',
        statut: 'PAYE'
      }
    ];

    res.json({
      statut: 'succes',
      donnees: {
        matricule: matricule,
        nombre_bulletins: historique.length,
        periode_debut: debut || '2024-01',
        periode_fin: fin || '2024-02',
        historique: historique
      }
    });

  } catch (error) {
    res.status(500).json({
      statut: 'erreur',
      message: 'Erreur lors de la récupération de l\'historique',
      detail: error.message
    });
  }
});

/**
 * GET /api/v1/sante
 * Vérification de santé de l'API
 */
router.get('/api/v1/sante', (req, res) => {
  res.json({
    statut: 'actif',
    instance: 'alpha',
    environnement: 'production',
    version: '1.0.0',
    devise: 'MAD (Dirham Marocain)',
    langue: 'Français',
    horodatage: new Date().toISOString(),
    message: 'API de paie Claude Alpha opérationnelle'
  });
});

// Fonctions utilitaires

function formatPeriodeAnciennete(tranche) {
  if (tranche.max === null) {
    return `Plus de ${Math.floor(tranche.min / 12)} ans`;
  }

  const minAnnees = Math.floor(tranche.min / 12);
  const maxAnnees = Math.floor(tranche.max / 12);

  if (minAnnees === 0 && maxAnnees < 2) {
    return 'Moins de 2 ans';
  }

  return `${minAnnees} à ${maxAnnees} ans`;
}

function logCalcul(donnees) {
  // Implémentation du logging pour audit
  console.log('[AUDIT]', {
    ...donnees,
    timestamp: new Date().toISOString()
  });
}

function logValidation(donnees) {
  // Implémentation du logging pour validation
  console.log('[VALIDATION]', {
    ...donnees,
    timestamp: new Date().toISOString()
  });
}

module.exports = router;
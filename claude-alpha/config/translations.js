/**
 * Configuration des traductions françaises pour Claude Alpha
 * Système de paie marocain - Instance Production
 */

const translations = {
  // Devise
  currency: {
    code: 'MAD',
    symbol: 'DH',
    name: 'Dirham Marocain',
    decimal_separator: ',',
    thousand_separator: ' ',
    format: '{amount} {symbol}',
    decimal_places: 2
  },

  // Termes officiels de paie
  payroll_terms: {
    // Éléments de salaire
    salaire_base: 'Salaire de Base',
    salaire_brut: 'Salaire Brut',
    salaire_brut_imposable: 'Salaire Brut Imposable (SBI)',
    salaire_net_imposable: 'Salaire Net Imposable (SNI)',
    salaire_net: 'Salaire Net',
    salaire_net_a_payer: 'Net à Payer',

    // Primes et indemnités
    prime_anciennete: "Prime d'Ancienneté",
    indemnites_imposables: 'Indemnités Imposables',
    indemnites_non_imposables: 'Indemnités Non Imposables',
    avantages_nature: 'Avantages en Nature',
    heures_supplementaires: 'Heures Supplémentaires',

    // Cotisations sociales
    cnss: 'Caisse Nationale de Sécurité Sociale (CNSS)',
    cnss_part_salariale: 'CNSS Part Salariale',
    cnss_part_patronale: 'CNSS Part Patronale',
    amo: 'Assurance Maladie Obligatoire (AMO)',
    amo_part_salariale: 'AMO Part Salariale',
    amo_part_patronale: 'AMO Part Patronale',

    // Retraite et assurance
    cimr: 'Caisse Interprofessionnelle Marocaine de Retraites (CIMR)',
    assurance_groupe: 'Assurance Groupe',
    mutuelle: 'Mutuelle',

    // Impôts
    ir: 'Impôt sur le Revenu (IR)',
    ir_brut: 'IR Brut',
    ir_net: 'IR Net',
    charges_familiales: 'Charges Familiales',
    deductions_familiales: 'Déductions Familiales',

    // Autres déductions
    frais_professionnels: 'Frais Professionnels',
    retenue_pret: 'Retenue sur Prêt',
    avance_salaire: 'Avance sur Salaire',
    saisie_arret: 'Saisie-Arrêt',

    // Cotisations patronales
    taxe_formation_professionnelle: 'Taxe de Formation Professionnelle',
    prestations_familiales: 'Prestations Familiales',
    contribution_sociale_solidarite: 'Contribution Sociale de Solidarité'
  },

  // Tranches d'imposition
  tax_brackets: {
    title: "Barème de l'Impôt sur le Revenu",
    bracket: 'Tranche',
    rate: 'Taux',
    deduction: 'Somme à Déduire',
    ranges: {
      bracket_1: 'Jusqu\'à 2 500 DH',
      bracket_2: 'De 2 501 à 4 166,67 DH',
      bracket_3: 'De 4 167 à 5 000 DH',
      bracket_4: 'De 5 001 à 6 666,67 DH',
      bracket_5: 'De 6 667 à 15 000 DH',
      bracket_6: 'Plus de 15 000 DH'
    }
  },

  // Situation familiale
  family_status: {
    celibataire: 'Célibataire',
    marie: 'Marié(e)',
    divorce: 'Divorcé(e)',
    veuf: 'Veuf/Veuve',
    enfants_charge: 'Enfants à Charge',
    personnes_charge: 'Personnes à Charge'
  },

  // Messages et labels
  labels: {
    employee_info: 'Informations Employé',
    matricule: 'Matricule',
    nom: 'Nom',
    prenom: 'Prénom',
    cin: 'CIN',
    num_cnss: 'N° CNSS',
    date_embauche: 'Date d\'Embauche',
    anciennete: 'Ancienneté',
    departement: 'Département',
    poste: 'Poste',

    periode_paie: 'Période de Paie',
    mois: 'Mois',
    annee: 'Année',
    jours_travailles: 'Jours Travaillés',
    jours_ouvrables: 'Jours Ouvrables',

    bulletin_paie: 'Bulletin de Paie',
    fiche_paie: 'Fiche de Paie',
    livre_paie: 'Livre de Paie',
    journal_paie: 'Journal de Paie',

    gains: 'Gains',
    retenues: 'Retenues',
    cotisations: 'Cotisations',
    deductions: 'Déductions',

    total: 'Total',
    sous_total: 'Sous-Total',
    montant: 'Montant',
    taux: 'Taux',
    base: 'Base',
    plafond: 'Plafond',

    calcul: 'Calcul',
    calculer: 'Calculer',
    valider: 'Valider',
    approuver: 'Approuver',
    rejeter: 'Rejeter',
    annuler: 'Annuler',
    imprimer: 'Imprimer',
    exporter: 'Exporter',
    telecharger: 'Télécharger'
  },

  // Messages système
  messages: {
    success: {
      calcul_reussi: 'Calcul effectué avec succès',
      enregistrement_reussi: 'Enregistrement effectué avec succès',
      validation_reussie: 'Validation effectuée avec succès',
      generation_bulletin: 'Bulletin de paie généré avec succès'
    },

    error: {
      calcul_echec: 'Erreur lors du calcul',
      donnees_manquantes: 'Données obligatoires manquantes',
      format_invalide: 'Format de données invalide',
      salaire_invalide: 'Montant du salaire invalide',
      periode_invalide: 'Période de paie invalide',
      employe_introuvable: 'Employé introuvable'
    },

    warning: {
      plafond_depasse: 'Plafond CNSS dépassé',
      deduction_maximale: 'Déduction maximale atteinte',
      verification_requise: 'Vérification requise'
    },

    info: {
      calcul_en_cours: 'Calcul en cours...',
      chargement: 'Chargement...',
      traitement: 'Traitement en cours...',
      generation_pdf: 'Génération du PDF en cours...'
    }
  },

  // Formats de dates
  date_formats: {
    short: 'DD/MM/YYYY',
    long: 'DD MMMM YYYY',
    month_year: 'MMMM YYYY',
    day_names: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    month_names: [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
  },

  // Unités
  units: {
    days: 'jours',
    hours: 'heures',
    months: 'mois',
    years: 'années',
    percentage: '%',
    per_month: '/mois',
    per_year: '/an'
  },

  // Tooltips d'aide
  tooltips: {
    cnss_plafond: 'Le plafond CNSS est de 6 000 DH par mois',
    amo_pas_plafond: "L'AMO n'a pas de plafond",
    ir_progressif: "L'IR est calculé selon un barème progressif",
    charges_familiales: '30 DH par personne à charge (max 180 DH)',
    frais_pro: 'Frais professionnels: 20% plafonné à 2 500 DH/mois',
    anciennete: "Prime d'ancienneté selon le nombre d'années de service"
  }
};

// Fonction de formatage de devise
function formatCurrency(amount) {
  const formatted = new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `${formatted} ${translations.currency.symbol}`;
}

// Fonction de formatage de pourcentage
function formatPercentage(value) {
  return `${(value * 100).toFixed(2)}${translations.units.percentage}`;
}

// Fonction de formatage de date
function formatDate(date, format = 'short') {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'long':
      const monthName = translations.date_formats.month_names[d.getMonth()];
      return `${day} ${monthName} ${year}`;
    case 'month_year':
      return `${translations.date_formats.month_names[d.getMonth()]} ${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

// Fonction de traduction
function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations;

  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }

  // Remplacer les paramètres
  if (typeof value === 'string') {
    Object.keys(params).forEach(param => {
      value = value.replace(`{${param}}`, params[param]);
    });
  }

  return value;
}

module.exports = {
  translations,
  formatCurrency,
  formatPercentage,
  formatDate,
  t
};
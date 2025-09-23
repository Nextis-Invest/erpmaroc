// CNSS Declaration Types for Morocco

export interface CNSSDeclaration {
  _id?: string;
  periode: {
    mois: number; // 1-12
    annee: number; // YYYY
  };
  entreprise: CNSSEntreprise;
  employes: CNSSEmploye[];
  totaux: CNSSTotaux;
  statut: 'BROUILLON' | 'VALIDE' | 'ENVOYE' | 'ACCEPTE' | 'REJETE';
  date_creation: Date;
  date_envoi?: Date;
  fichier_genere?: string;
}

export interface CNSSEntreprise {
  numero_affiliation: string; // Numéro d'affiliation CNSS (ex: 75605942)
  raison_sociale: string;
  adresse: string;
  ville: string;
  code_postal: string;
  ice?: string; // Identifiant Commun d'Entreprise
  if?: string; // Identifiant Fiscal
  rc?: string; // Registre Commerce
  cnss?: string; // Numéro CNSS
  patente?: string;
  effectif: number;
}

export interface CNSSEmploye {
  numero_cnss: string; // 9 chiffres
  numero_cin?: string;
  nom: string;
  prenom: string;
  date_naissance?: string;
  date_embauche: string;
  date_depart?: string;
  jours_travailles: number;
  salaire_brut: number;
  salaire_plafonne: number; // Plafonné à 6000 MAD
  cotisation_salariale: number;
  cotisation_patronale: number;
  situation: 'ACTIF' | 'SORTIE' | 'CONGE';
  type_contrat?: 'CDI' | 'CDD' | 'INTERIM' | 'STAGE';
}

export interface CNSSTotaux {
  nombre_salaries: number;
  total_salaires_bruts: number;
  total_salaires_plafonnes: number;
  total_cotisations_salariales: number;
  total_cotisations_patronales: number;
  total_cotisations: number;
  total_af: number; // Allocations Familiales
  total_fp: number; // Formation Professionnelle
}

// Format de fichier CNSS pré-établi
export interface CNSSFileRecord {
  type: 'A00' | 'A01' | 'A02' | 'A03';
  content: string;
}

// Configuration des taux CNSS
export const CNSS_CONFIG = {
  PLAFOND_MENSUEL: 6000, // MAD
  TAUX: {
    CNSS_SALARIAL: 0.0448, // 4.48%
    CNSS_PATRONAL: 0.0896, // 8.96%
    AMO_SALARIAL: 0.0226, // 2.26% (sans plafond)
    AMO_PATRONAL: 0.0451, // 4.51% (sans plafond)
    ALLOCATIONS_FAMILIALES: 0.06, // 6% (patronal)
    FORMATION_PROFESSIONNELLE: 0.016, // 1.6% (patronal)
  },
  RECORD_LENGTHS: {
    A00: 260,
    A01: 260,
    A02: 260,
    A03: 260,
  },
  FIELD_POSITIONS: {
    // A01 - Entreprise
    A01: {
      TYPE: { start: 0, length: 3 },
      NUMERO_AFFILIATION: { start: 3, length: 8 },
      PERIODE: { start: 11, length: 6 }, // YYYYMM
      RAISON_SOCIALE: { start: 17, length: 80 },
      ADRESSE: { start: 97, length: 60 },
      VILLE: { start: 157, length: 20 },
      CODE_POSTAL: { start: 177, length: 5 },
    },
    // A02 - Employé
    A02: {
      TYPE: { start: 0, length: 3 },
      NUMERO_AFFILIATION: { start: 3, length: 8 },
      PERIODE: { start: 11, length: 6 },
      NUMERO_CNSS: { start: 17, length: 9 },
      NOM: { start: 26, length: 30 },
      PRENOM: { start: 56, length: 30 },
      SALAIRE: { start: 86, length: 12 },
      JOURS_TRAVAILLES: { start: 98, length: 3 },
    },
  },
};

// Helper function to format CNSS number
export function formatCNSSNumber(numero: string): string {
  return numero.replace(/\D/g, '').padStart(9, '0');
}

// Helper function to format fixed-width field
export function formatFixedWidth(value: string | number, length: number, align: 'left' | 'right' = 'left'): string {
  const str = String(value || '');
  if (align === 'left') {
    return str.padEnd(length, ' ').substring(0, length);
  } else {
    return str.padStart(length, ' ').substring(str.length - length);
  }
}

// Helper function to format amount (in centimes)
export function formatAmount(amount: number): string {
  const centimes = Math.round(amount * 100);
  return centimes.toString().padStart(12, '0');
}

// Helper function to format date for CNSS
export function formatCNSSDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}
// Types pour le système de paie marocaine
// Moroccan Payroll System Types

export interface PayrollEmployee {
  _id: string;
  employeeId: string;
  nom: string;
  prenom: string;
  cin?: string;
  date_embauche: string;
  date_naissance?: string;
  fonction?: string;
  situation_familiale: 'CELIBATAIRE' | 'MARIE' | 'DIVORCE' | 'VEUF';
  nombre_enfants: number;
  cnss_numero?: string;
  mode_paiement?: 'VIR' | 'CHQ' | 'ESP';
  contractType?: 'cdi' | 'cdd' | 'freelance';

  // Salary & Working Time
  salaire_base: number;
  taux_horaire?: number;
  heures_travaillees?: number;
  jours_conges_payes?: number;
  jours_feries?: number;
  heures_supp_25?: number;
  heures_supp_50?: number;
  heures_supp_100?: number;

  // Allowances & Benefits
  prime_transport?: number;
  prime_panier?: number;
  indemnite_representation?: number;
  indemnite_deplacement?: number;
  autres_primes?: number;
  autres_indemnites?: number;

  // Deductions & Contributions
  cotisation_mutuelle?: number;
  cotisation_cimr?: number;
  avance_salaire?: number;
  autres_deductions?: number;

  // Contact & Banking Info
  cimr_numero?: string;
  adresse?: string;
  rib?: string;
  banque?: string;
  code_banque?: string;
  swift_code?: string;
}

export interface PayrollPeriod {
  _id?: string;
  mois: number;
  annee: number;
  date_debut: string;
  date_fin: string;
  statut: 'BROUILLON' | 'EN_COURS' | 'VALIDE' | 'PAYE' | 'ARCHIVE';
}

export interface PayrollCalculation {
  _id?: string;
  employee_id: string;
  periode_id: string;
  date_calcul: string;
  instance: 'alpha' | 'beta';

  // Éléments de base
  salaire_base: number;
  anciennete_mois: number;
  prime_anciennete: number;
  primes_imposables: number;
  primes_non_imposables: number;
  heures_supplementaires?: number;
  montant_heures_sup?: number;

  // Salaires bruts
  salaire_brut_global: number;
  salaire_brut_imposable: number;

  // Cotisations salariales
  cnss_salariale: number;
  amo_salariale: number;
  cimr_salariale?: number;
  assurance_salariale?: number;
  frais_professionnels: number;

  // Éléments fiscaux
  salaire_net_imposable: number;
  ir_brut: number;
  charges_familiales: number;
  ir_net: number;

  // Autres déductions
  avances?: number;
  prets?: number;
  autres_deductions?: number;

  // Résultat final
  salaire_net: number;

  // Cotisations patronales
  cnss_patronale: number;
  amo_patronale: number;
  taxe_formation: number;
  cimr_patronale?: number;

  // Coût total employeur
  cout_total_employeur: number;

  // Métadonnées
  calcule_par?: string;
  approuve?: boolean;
  approuve_par?: string;
  date_approbation?: string;
  commentaires?: string;
}

export interface PayrollSummary {
  periode: PayrollPeriod;
  nombre_employes: number;
  total_salaires_bruts: number;
  total_salaires_nets: number;
  total_cotisations_salariales: number;
  total_cotisations_patronales: number;
  total_ir: number;
  cout_total: number;
  statut: string;
}

export interface PayrollSettings {
  // Taux CNSS
  cnss_taux_salarie: number;
  cnss_taux_patronal: number;
  cnss_plafond: number;

  // Taux AMO
  amo_taux_salarie: number;
  amo_taux_patronal: number;

  // Taxe de formation professionnelle
  taxe_formation_taux: number;

  // SMIG
  smig_mensuel: number;
  smig_horaire: number;

  // Heures de travail
  heures_mensuelles_standard: number;

  // Frais professionnels
  frais_prof_seuil: number;
  frais_prof_taux_bas: number;
  frais_prof_taux_haut: number;
  frais_prof_plafond: number;

  // Charges familiales
  charge_familiale_unite: number;
  charge_familiale_max: number;

  // Devise
  devise_code: string;
  devise_symbole: string;
}

export interface PayrollReport {
  type: 'BULLETIN_PAIE' | 'JOURNAL_PAIE' | 'ETAT_CNSS' | 'ETAT_IR' | 'RECAPITULATIF';
  periode: PayrollPeriod;
  date_generation: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
  donnees: any;
  url?: string;
}

export interface PayrollValidation {
  employee_id: string;
  periode_id: string;
  erreurs: string[];
  avertissements: string[];
  valide: boolean;
  date_validation: string;
}

export interface PayrollBulkOperation {
  operation: 'CALCULER' | 'VALIDER' | 'APPROUVER' | 'PAYER' | 'ARCHIVER';
  periode_id: string;
  employee_ids?: string[];
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'COMPLETE' | 'ERREUR';
  nombre_total: number;
  nombre_traite: number;
  nombre_erreurs: number;
  date_debut: string;
  date_fin?: string;
  erreurs?: Array<{
    employee_id: string;
    message: string;
  }>;
}

// Barèmes et tables de référence
export interface TaxBracket {
  min: number;
  max?: number;
  taux: number;
  deduction: number;
}

export interface SeniorityBracket {
  min_mois: number;
  max_mois?: number;
  taux: number;
}

export const BAREMES_IR_2024: TaxBracket[] = [
  { min: 0, max: 2500, taux: 0, deduction: 0 },
  { min: 2501, max: 4166, taux: 0.10, deduction: 250 },
  { min: 4167, max: 5000, taux: 0.20, deduction: 666.67 },
  { min: 5001, max: 6666, taux: 0.30, deduction: 1167.66 },
  { min: 6667, max: 15000, taux: 0.34, deduction: 1433.33 },
  { min: 15001, taux: 0.38, deduction: 2033 }
];

export const BAREMES_ANCIENNETE: SeniorityBracket[] = [
  { min_mois: 0, max_mois: 24, taux: 0 },
  { min_mois: 25, max_mois: 60, taux: 0.05 },
  { min_mois: 61, max_mois: 144, taux: 0.10 },
  { min_mois: 145, max_mois: 240, taux: 0.15 },
  { min_mois: 241, max_mois: 300, taux: 0.20 },
  { min_mois: 301, taux: 0.25 }
];

// Configuration par défaut
export const DEFAULT_PAYROLL_SETTINGS: PayrollSettings = {
  // CNSS
  cnss_taux_salarie: 0.0448,
  cnss_taux_patronal: 0.08,
  cnss_plafond: 6000,

  // AMO
  amo_taux_salarie: 0.0226,
  amo_taux_patronal: 0.0185,

  // Taxe de formation
  taxe_formation_taux: 0.016,

  // SMIG (2024)
  smig_mensuel: 3111,
  smig_horaire: 16.29,

  // Heures de travail
  heures_mensuelles_standard: 191,

  // Frais professionnels
  frais_prof_seuil: 6500,
  frais_prof_taux_bas: 0.35,
  frais_prof_taux_haut: 0.25,
  frais_prof_plafond: 2916.67,

  // Charges familiales
  charge_familiale_unite: 30,
  charge_familiale_max: 180,

  // Devise
  devise_code: 'MAD',
  devise_symbole: 'DH'
};

// Fonctions utilitaires
export function getMoisNom(mois: number): string {
  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return moisNoms[mois - 1] || '';
}

export function formatMontantMAD(montant: number | string): string {
  const valeur = typeof montant === 'string' ? parseFloat(montant) : montant;
  return `${valeur.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;
}

export function calculerAncienneteMois(dateEmbauche: string | Date): number {
  const debut = new Date(dateEmbauche);
  const maintenant = new Date();

  const annees = maintenant.getFullYear() - debut.getFullYear();
  const mois = maintenant.getMonth() - debut.getMonth();

  return annees * 12 + mois;
}

export function validerPeriodePaie(mois: number, annee: number): boolean {
  if (mois < 1 || mois > 12) return false;
  if (annee < 2020 || annee > new Date().getFullYear() + 1) return false;

  // Ne pas permettre les périodes futures
  const maintenant = new Date();
  const periodeDate = new Date(annee, mois - 1);

  return periodeDate <= maintenant;
}
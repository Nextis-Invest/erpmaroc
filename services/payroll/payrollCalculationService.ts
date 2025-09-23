// Service de calcul de paie marocaine - Instance Beta
// Moroccan Payroll Calculation Service - Beta Instance

export interface CalculPaieParams {
  salaire_base: number;
  anciennete_mois: number;
  primes_imposables?: number;
  primes_non_imposables?: number;
  situation_familiale: 'CELIBATAIRE' | 'MARIE' | 'DIVORCE' | 'VEUF';
  nombre_enfants?: number;
  cimr_taux?: number;
  assurance_taux?: number;
  autres_deductions?: number;
  heures_supplementaires?: number;
  taux_heures_sup?: number;
}

export interface ResultatCalculPaie {
  // Valeurs d'entrée
  salaire_base: number;
  prime_anciennete: number;
  taux_anciennete: string;

  // Calculs bruts
  salaire_brut_global: number;
  salaire_brut_imposable: number;

  // Déductions
  cnss_salariale: string;
  amo_salariale: string;
  cimr_montant: string;
  assurance_montant: string;
  frais_professionnels: string;
  frais_prof_taux: string;

  // Calculs fiscaux
  salaire_net_imposable: string;
  ir_brut: string;
  charges_familiales: number;
  ir_net: string;

  // Résultat final
  salaire_net: string;

  // Contributions patronales
  contributions_patronales: {
    cnss: string;
    amo: string;
    formation: string;
    total: string;
  };

  // Informations supplémentaires
  devise: {
    code: string;
    symbole: string;
  };
  instance: string;
  version: string;
  date_calcul: string;
}

export class ServiceCalculPaieMarocaine {
  private readonly instance: string = 'beta';
  private readonly version: string = '1.0.0-beta';
  private readonly devise = {
    code: 'MAD',
    symbole: 'DH'
  };

  // Barèmes d'ancienneté
  private readonly BAREMES_ANCIENNETE = [
    { min_mois: 301, taux: 0.25 }, // > 25 ans
    { min_mois: 241, taux: 0.20 }, // 20-25 ans
    { min_mois: 145, taux: 0.15 }, // 12-20 ans
    { min_mois: 61, taux: 0.10 },  // 5-12 ans
    { min_mois: 25, taux: 0.05 },  // 2-5 ans
    { min_mois: 0, taux: 0.00 }    // < 2 ans
  ];

  // Barèmes IR (Impôt sur le Revenu) - Barème annuel officiel 2024
  private readonly BAREMES_IR_ANNUEL = [
    { min: 0, max: 30000, taux: 0.00, deduction: 0 },
    { min: 30001, max: 50000, taux: 0.10, deduction: 3000 },
    { min: 50001, max: 60000, taux: 0.20, deduction: 8000 },
    { min: 60001, max: 80000, taux: 0.30, deduction: 14000 },
    { min: 80001, max: 180000, taux: 0.34, deduction: 17200 },
    { min: 180001, max: Infinity, taux: 0.38, deduction: 24400 }
  ];

  // Taux de cotisations
  private readonly TAUX_CNSS_SALARIE = 0.0448;
  private readonly TAUX_AMO_SALARIE = 0.0226;
  private readonly PLAFOND_CNSS = 6000;

  // Taux patronaux
  private readonly TAUX_CNSS_PATRONAL = 0.08;
  private readonly TAUX_AMO_PATRONAL = 0.0185;
  private readonly TAUX_FORMATION = 0.016;

  // Frais professionnels
  private readonly TAUX_FRAIS_PROF = 0.20; // 20% du revenu brut imposable
  private readonly PLAFOND_FRAIS_PROF_ANNUEL = 30000; // Plafond annuel de 30 000 DH

  // Charges familiales (déductions pour personnes à charge)
  private readonly DEDUCTION_CHARGE_FAMILIALE = 30; // Par personne à charge et par mois
  private readonly DEDUCTION_CHARGE_FAMILIALE_MAX = 6; // Maximum 6 personnes à charge

  constructor() {
    console.log('🚀 Service de calcul de paie marocaine initialisé (Instance Beta)');
  }

  /**
   * Calcule le taux d'ancienneté basé sur le nombre de mois
   */
  private calculerTauxAnciennete(mois: number): number {
    const bareme = this.BAREMES_ANCIENNETE.find(b => mois >= b.min_mois);
    return bareme?.taux || 0;
  }

  /**
   * Calcule la CNSS salariale
   */
  private calculerCNSSSalariale(salaireBrutImposable: number): number {
    const base = Math.min(salaireBrutImposable, this.PLAFOND_CNSS);
    return base * this.TAUX_CNSS_SALARIE;
  }

  /**
   * Calcule l'AMO salariale
   */
  private calculerAMOSalariale(salaireBrutImposable: number): number {
    return salaireBrutImposable * this.TAUX_AMO_SALARIE;
  }

  /**
   * Calcule les frais professionnels
   */
  private calculerFraisProfessionnels(salaireBrutImposable: number): { montant: number; taux: number } {
    // Calcul sur base annuelle pour l'abattement
    const salaireBrutAnnuel = salaireBrutImposable * 12;
    const fraisProfAnnuel = Math.min(salaireBrutAnnuel * this.TAUX_FRAIS_PROF, this.PLAFOND_FRAIS_PROF_ANNUEL);
    const fraisProfMensuel = fraisProfAnnuel / 12;

    return { 
      montant: fraisProfMensuel, 
      taux: this.TAUX_FRAIS_PROF 
    };
  }

  /**
   * Calcule l'IR selon le nouveau barème
   */
  private calculerIR(salaireBrutImposableAnnuel: number, deductionsSocialesAnnuelles: number, fraisProfAnnuels: number): number {
    // Calcul du revenu net imposable annuel
    const revenuNetImposable = salaireBrutImposableAnnuel - deductionsSocialesAnnuelles - fraisProfAnnuels;

    // Trouver la tranche applicable
    const tranche = this.BAREMES_IR_ANNUEL.find(b => 
      revenuNetImposable >= b.min && revenuNetImposable <= b.max
    );

    if (!tranche || tranche.taux === 0) {
      return 0;
    }

    // Calcul de l'IR annuel avec la formule: (Revenu × Taux) - Déduction
    const irAnnuel = (revenuNetImposable * tranche.taux) - tranche.deduction;
    
    // Retourner l'IR mensuel
    return Math.max(0, irAnnuel / 12);
  }

  /**
   * Calcule les déductions pour charges familiales
   */
  private calculerChargesFamiliales(
    situationFamiliale: string,
    nombreEnfants: number
  ): number {
    let nombreCharges = 0;

    // Conjoint(e) à charge
    if (situationFamiliale === 'MARIE') {
      nombreCharges = 1;
    }

    // Enfants à charge (maximum 6 au total avec le conjoint)
    const enfantsDeductibles = Math.min(nombreEnfants, this.DEDUCTION_CHARGE_FAMILIALE_MAX - nombreCharges);
    nombreCharges += enfantsDeductibles;

    // Calcul de la déduction mensuelle
    return nombreCharges * this.DEDUCTION_CHARGE_FAMILIALE;
  }

  /**
   * Calcule la paie complète
   */
  public calculerPaie(params: CalculPaieParams): ResultatCalculPaie {
    const {
      salaire_base = 0,
      anciennete_mois = 0,
      primes_imposables = 0,
      primes_non_imposables = 0,
      situation_familiale = 'CELIBATAIRE',
      nombre_enfants = 0,
      cimr_taux = 0,
      assurance_taux = 0,
      autres_deductions = 0,
      heures_supplementaires = 0,
      taux_heures_sup = 0
    } = params;

    // 1. Calcul de l'ancienneté
    const tauxAnciennete = this.calculerTauxAnciennete(anciennete_mois);
    const primeAnciennete = salaire_base * tauxAnciennete;

    // 2. Calcul du salaire brut
    const montantHeuresSup = heures_supplementaires * taux_heures_sup;
    const salaireBrutImposable = salaire_base + primeAnciennete + primes_imposables + montantHeuresSup;
    const salaireBrutGlobal = salaireBrutImposable + primes_non_imposables;

    // 3. Calcul des cotisations sociales
    const cnssSalariale = this.calculerCNSSSalariale(salaireBrutImposable);
    const amoSalariale = this.calculerAMOSalariale(salaireBrutImposable);
    
    // 4. Calcul des déductions optionnelles
    const cimrMontant = salaireBrutImposable * cimr_taux;
    const assuranceMontant = salaireBrutImposable * assurance_taux;

    // 5. Calcul des frais professionnels
    const { montant: fraisProfessionnels, taux: fraisProfTaux } = 
      this.calculerFraisProfessionnels(salaireBrutImposable);

    // 6. Calcul de l'IR
    // Pour le calcul de l'IR, on travaille sur base annuelle
    const salaireBrutImposableAnnuel = salaireBrutImposable * 12;
    const deductionsSocialesAnnuelles = (cnssSalariale + amoSalariale + cimrMontant + assuranceMontant) * 12;
    const fraisProfAnnuels = fraisProfessionnels * 12;
    
    const irBrut = this.calculerIR(
      salaireBrutImposableAnnuel, 
      deductionsSocialesAnnuelles, 
      fraisProfAnnuels
    );

    // 7. Calcul des charges familiales
    const chargesFamiliales = this.calculerChargesFamiliales(situation_familiale, nombre_enfants);
    const irNet = Math.max(0, irBrut - chargesFamiliales);

    // 8. Calcul du salaire net imposable (pour information)
    const salaireNetImposable = salaireBrutImposable - cnssSalariale - amoSalariale - 
                                cimrMontant - assuranceMontant - fraisProfessionnels;

    // 9. Calcul du salaire net final
    const salaireNet = salaireBrutGlobal - cnssSalariale - amoSalariale - 
                      cimrMontant - assuranceMontant - irNet - autres_deductions;

    // 10. Calcul des contributions patronales
    const cnssPatronale = Math.min(salaireBrutImposable, this.PLAFOND_CNSS) * this.TAUX_CNSS_PATRONAL;
    const amoPatronale = salaireBrutImposable * this.TAUX_AMO_PATRONAL;
    const formationPatronale = salaireBrutImposable * this.TAUX_FORMATION;
    const totalPatronal = cnssPatronale + amoPatronale + formationPatronale;

    return {
      // Valeurs d'entrée
      salaire_base,
      prime_anciennete: primeAnciennete,
      taux_anciennete: `${(tauxAnciennete * 100).toFixed(0)}%`,

      // Calculs bruts
      salaire_brut_global: salaireBrutGlobal,
      salaire_brut_imposable: salaireBrutImposable,

      // Déductions
      cnss_salariale: cnssSalariale.toFixed(2),
      amo_salariale: amoSalariale.toFixed(2),
      cimr_montant: cimrMontant.toFixed(2),
      assurance_montant: assuranceMontant.toFixed(2),
      frais_professionnels: fraisProfessionnels.toFixed(2),
      frais_prof_taux: `${(fraisProfTaux * 100).toFixed(0)}%`,

      // Calculs fiscaux
      salaire_net_imposable: salaireNetImposable.toFixed(2),
      ir_brut: irBrut.toFixed(2),
      charges_familiales: chargesFamiliales,
      ir_net: irNet.toFixed(2),

      // Résultat final
      salaire_net: salaireNet.toFixed(2),

      // Contributions patronales
      contributions_patronales: {
        cnss: cnssPatronale.toFixed(2),
        amo: amoPatronale.toFixed(2),
        formation: formationPatronale.toFixed(2),
        total: totalPatronal.toFixed(2)
      },

      // Informations supplémentaires
      devise: this.devise,
      instance: this.instance,
      version: this.version,
      date_calcul: new Date().toISOString()
    };
  }

  /**
   * Méthode pour vérifier le calcul avec l'exemple fourni
   */
  public verifierExemple(): void {
    const params: CalculPaieParams = {
      salaire_base: 15000,
      anciennete_mois: 0,
      primes_imposables: 0,
      primes_non_imposables: 0,
      situation_familiale: 'CELIBATAIRE',
      nombre_enfants: 0,
      cimr_taux: 0,
      assurance_taux: 0,
      autres_deductions: 0,
      heures_supplementaires: 0,
      taux_heures_sup: 0
    };

    const resultat = this.calculerPaie(params);
    
    console.log('=== Vérification avec l\'exemple fourni ===');
    console.log('Salaire brut mensuel: 15,000 DH');
    console.log('Salaire brut annuel: 180,000 DH');
    
    // Calculs annuels pour vérification
    const brutAnnuel = 15000 * 12;
    const cnssAnnuel = Math.min(15000, this.PLAFOND_CNSS) * this.TAUX_CNSS_SALARIE * 12;
    const amoAnnuel = 15000 * this.TAUX_AMO_SALARIE * 12;
    const totalCotisationsAnnuel = cnssAnnuel + amoAnnuel;
    const rniApresRetenues = brutAnnuel - totalCotisationsAnnuel;
    const fraisProfAnnuel = Math.min(brutAnnuel * 0.20, 30000);
    const baseImposable = rniApresRetenues - fraisProfAnnuel;
    
    console.log(`\nCalculs détaillés:`);
    console.log(`1. Brut annuel: ${brutAnnuel.toFixed(2)} DH`);
    console.log(`2. Retenues sociales (${((this.TAUX_CNSS_SALARIE + this.TAUX_AMO_SALARIE) * 100).toFixed(2)}%): ${totalCotisationsAnnuel.toFixed(2)} DH`);
    console.log(`   → RNI après retenues: ${rniApresRetenues.toFixed(2)} DH`);
    console.log(`3. Abattement frais pro (20%, max 30,000): ${fraisProfAnnuel.toFixed(2)} DH`);
    console.log(`   → Base imposable: ${baseImposable.toFixed(2)} DH`);
    console.log(`4. Tranche 80,001 - 180,000 → taux 34%, déduction 17,200`);
    const irCalcule = (baseImposable * 0.34) - 17200;
    console.log(`   IR = (${baseImposable.toFixed(2)} × 34%) - 17,200 = ${irCalcule.toFixed(2)} DH/an`);
    console.log(`5. IR mensuel: ${(irCalcule / 12).toFixed(2)} DH`);
    
    console.log(`\nRésultat du calcul automatique:`);
    console.log(`IR mensuel calculé: ${resultat.ir_brut} DH`);
    console.log(`Salaire net: ${resultat.salaire_net} DH`);
  }
}

// Export de l'instance singleton
export const serviceCalculPaie = new ServiceCalculPaieMarocaine();
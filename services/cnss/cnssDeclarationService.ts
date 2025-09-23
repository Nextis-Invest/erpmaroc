import type {
  CNSSDeclaration,
  CNSSEntreprise,
  CNSSEmploye,
  CNSSTotaux,
} from '@/types/cnss';
import {
  CNSS_CONFIG,
  formatCNSSNumber,
  formatFixedWidth,
  formatAmount,
  formatCNSSDate,
} from '@/types/cnss';
import type { PayrollEmployee, PayrollCalculation } from '@/types/payroll';

export class CNSSDeclarationService {
  private entreprise: CNSSEntreprise;

  constructor(entreprise: CNSSEntreprise) {
    this.entreprise = entreprise;
  }

  /**
   * Génère une déclaration CNSS à partir des calculs de paie
   */
  generateDeclaration(
    periode: { mois: number; annee: number },
    employees: PayrollEmployee[],
    calculations: PayrollCalculation[]
  ): CNSSDeclaration {
    const cnssEmployees: CNSSEmploye[] = [];

    // Filtrer les freelances et transformer les employés et calculs en format CNSS
    employees.forEach((employee) => {
      // Exclure les freelances des déclarations CNSS
      if (employee.contractType === 'freelance') {
        console.log(`Freelance exclu de la déclaration CNSS: ${employee.nom} ${employee.prenom}`);
        return;
      }

      const calculation = calculations.find(c => c.employee_id === employee._id);

      if (calculation) {
        const salairePlafonne = Math.min(calculation.salaire_brut_global, CNSS_CONFIG.PLAFOND_MENSUEL);

        cnssEmployees.push({
          numero_cnss: formatCNSSNumber(employee.cnss_numero || ''),
          numero_cin: employee.cin,
          nom: employee.nom.toUpperCase(),
          prenom: employee.prenom.toUpperCase(),
          date_naissance: employee.date_naissance,
          date_embauche: employee.date_embauche,
          jours_travailles: 26, // Standard pour un mois complet
          salaire_brut: calculation.salaire_brut_global,
          salaire_plafonne: salairePlafonne,
          cotisation_salariale: calculation.cnss_salariale,
          cotisation_patronale: calculation.cnss_patronale,
          situation: 'ACTIF',
          type_contrat: employee.contractType === 'cdd' ? 'CDD' : 'CDI',
        });
      }
    });

    // Calculer les totaux
    const totaux = this.calculateTotaux(cnssEmployees);

    return {
      periode,
      entreprise: this.entreprise,
      employes: cnssEmployees,
      totaux,
      statut: 'BROUILLON',
      date_creation: new Date(),
    };
  }

  /**
   * Calcule les totaux de la déclaration
   */
  private calculateTotaux(employes: CNSSEmploye[]): CNSSTotaux {
    const totaux: CNSSTotaux = {
      nombre_salaries: employes.length,
      total_salaires_bruts: 0,
      total_salaires_plafonnes: 0,
      total_cotisations_salariales: 0,
      total_cotisations_patronales: 0,
      total_cotisations: 0,
      total_af: 0,
      total_fp: 0,
    };

    employes.forEach((employe) => {
      totaux.total_salaires_bruts += employe.salaire_brut;
      totaux.total_salaires_plafonnes += employe.salaire_plafonne;
      totaux.total_cotisations_salariales += employe.cotisation_salariale;
      totaux.total_cotisations_patronales += employe.cotisation_patronale;
    });

    // Allocations Familiales (6% du salaire brut)
    totaux.total_af = totaux.total_salaires_bruts * CNSS_CONFIG.TAUX.ALLOCATIONS_FAMILIALES;

    // Formation Professionnelle (1.6% du salaire brut)
    totaux.total_fp = totaux.total_salaires_bruts * CNSS_CONFIG.TAUX.FORMATION_PROFESSIONNELLE;

    // Total des cotisations
    totaux.total_cotisations =
      totaux.total_cotisations_salariales +
      totaux.total_cotisations_patronales +
      totaux.total_af +
      totaux.total_fp;

    return totaux;
  }

  /**
   * Génère le fichier BDS (Bordereau de Déclaration des Salaires) au format e-BDS
   * Conforme aux spécifications Damancom v1
   */
  generateBDSFile(declaration: CNSSDeclaration): string {
    const lines: string[] = [];
    const periode = `${declaration.periode.annee}${declaration.periode.mois.toString().padStart(2, '0')}`;

    // B00 - Header record (Identificateur du bordereau)
    const b00 = this.generateB00Record(declaration, periode);
    lines.push(b00);

    // B01 - Totaux du bordereau
    const b01 = this.generateB01Record(declaration, periode);
    lines.push(b01);

    // B02 - Employé records (Un enregistrement par salarié)
    declaration.employes.forEach((employe, index) => {
      const b02 = this.generateB02Record(employe, declaration.entreprise.numero_affiliation, periode, index + 1);
      lines.push(b02);
    });

    // B03 - Taux AF (Allocations Familiales)
    const b03 = this.generateB03Record(declaration, periode);
    lines.push(b03);

    // B06 - Record de fin
    const b06 = this.generateB06Record(declaration, periode, lines.length + 1);
    lines.push(b06);

    return lines.join('\r\n');
  }

  /**
   * Génère l'enregistrement B00 (Identificateur du bordereau)
   */
  private generateB00Record(declaration: CNSSDeclaration, periode: string): string {
    let record = 'B00';
    record += '000001'; // Numéro d'ordre (toujours 1 pour B00)
    record += formatFixedWidth(declaration.entreprise.numero_affiliation, 8, 'right');
    record += formatFixedWidth(periode, 6);
    record += '1'; // Type de déclaration (1 = Mensuelle)
    
    // Date de dépôt (format AAAAMMJJ)
    const dateDepot = new Date();
    record += formatCNSSDate(dateDepot);
    
    // ICE de l'entreprise
    record += formatFixedWidth(declaration.entreprise.ice || '', 15);
    
    // Padding pour atteindre 260 caractères
    record = formatFixedWidth(record, 260);
    return record;
  }

  /**
   * Génère l'enregistrement B01 (Totaux du bordereau)
   */
  private generateB01Record(declaration: CNSSDeclaration, periode: string): string {
    let record = 'B01';
    record += '000002'; // Numéro d'ordre
    record += formatFixedWidth(declaration.entreprise.numero_affiliation, 8, 'right');
    record += formatFixedWidth(periode, 6);
    
    // Nombre de salariés
    record += formatFixedWidth(declaration.totaux.nombre_salaries.toString(), 6, 'right');
    
    // Total des salaires déclarés (en centimes)
    record += formatAmount(declaration.totaux.total_salaires_bruts);
    
    // Total des salaires plafonnés (en centimes)
    record += formatAmount(declaration.totaux.total_salaires_plafonnes);
    
    // Total cotisations salariales (en centimes)
    record += formatAmount(declaration.totaux.total_cotisations_salariales);
    
    // Total cotisations patronales (en centimes)
    record += formatAmount(declaration.totaux.total_cotisations_patronales);
    
    // Total allocations familiales (en centimes)
    record += formatAmount(declaration.totaux.total_af);
    
    // Total formation professionnelle (en centimes)
    record += formatAmount(declaration.totaux.total_fp);
    
    // Total général à payer (en centimes)
    record += formatAmount(declaration.totaux.total_cotisations);
    
    // Padding pour atteindre 260 caractères
    record = formatFixedWidth(record, 260);
    return record;
  }

  /**
   * Génère l'enregistrement B02 (Salarié)
   */
  private generateB02Record(
    employe: CNSSEmploye, 
    numeroAffiliation: string, 
    periode: string,
    numeroOrdre: number
  ): string {
    let record = 'B02';
    
    // Numéro d'ordre (6 positions)
    record += formatFixedWidth(numeroOrdre.toString(), 6, 'right');
    
    // Numéro d'affiliation (8 positions)
    record += formatFixedWidth(numeroAffiliation, 8, 'right');
    
    // Période (6 positions)
    record += formatFixedWidth(periode, 6);
    
    // Numéro CNSS du salarié (9 positions)
    record += formatFixedWidth(employe.numero_cnss, 9, 'right');
    
    // CIN (10 positions)
    record += formatFixedWidth(employe.numero_cin || '', 10);
    
    // Nom (30 positions)
    record += formatFixedWidth(employe.nom, 30);
    
    // Prénom (20 positions)
    record += formatFixedWidth(employe.prenom, 20);
    
    // Date de naissance (8 positions, format AAAAMMJJ)
    if (employe.date_naissance) {
      record += formatCNSSDate(new Date(employe.date_naissance));
    } else {
      record += formatFixedWidth('', 8);
    }
    
    // Nombre de jours travaillés (3 positions)
    record += formatFixedWidth(employe.jours_travailles.toString(), 3, 'right');
    
    // Salaire brut (12 positions, en centimes)
    record += formatAmount(employe.salaire_brut);
    
    // Salaire plafonné (12 positions, en centimes)
    record += formatAmount(employe.salaire_plafonne);
    
    // Date d'embauche (8 positions, format AAAAMMJJ)
    if (employe.date_embauche) {
      record += formatCNSSDate(new Date(employe.date_embauche));
    } else {
      record += formatFixedWidth('', 8);
    }
    
    // Date de sortie (8 positions, format AAAAMMJJ)
    if (employe.date_depart) {
      record += formatCNSSDate(new Date(employe.date_depart));
    } else {
      record += formatFixedWidth('', 8);
    }
    
    // Situation (1 position)
    // 1 = Entrée, 2 = Sortie, 3 = Déclaré, 4 = Congé sans solde
    let situationCode = '3'; // Par défaut: déclaré
    if (employe.situation === 'SORTIE') {
      situationCode = '2';
    } else if (employe.situation === 'CONGE') {
      situationCode = '4';
    }
    record += situationCode;
    
    // Type de contrat (1 position)
    // 1 = CDI, 2 = CDD, 3 = INTERIM, 4 = STAGE
    let contratCode = '1'; // Par défaut: CDI
    if (employe.type_contrat === 'CDD') {
      contratCode = '2';
    } else if (employe.type_contrat === 'INTERIM') {
      contratCode = '3';
    } else if (employe.type_contrat === 'STAGE') {
      contratCode = '4';
    }
    record += contratCode;
    
    // Padding pour atteindre 260 caractères
    record = formatFixedWidth(record, 260);
    return record;
  }

  /**
   * Génère l'enregistrement B03 (Taux AF)
   */
  private generateB03Record(declaration: CNSSDeclaration, periode: string): string {
    let record = 'B03';
    
    // Numéro d'ordre
    const numeroOrdre = declaration.employes.length + 3;
    record += formatFixedWidth(numeroOrdre.toString(), 6, 'right');
    
    // Numéro d'affiliation
    record += formatFixedWidth(declaration.entreprise.numero_affiliation, 8, 'right');
    
    // Période
    record += formatFixedWidth(periode, 6);
    
    // Taux AF (4 positions, format 9999 pour 99.99%)
    const tauxAF = Math.round(CNSS_CONFIG.TAUX.ALLOCATIONS_FAMILIALES * 10000);
    record += formatFixedWidth(tauxAF.toString(), 4, 'right');
    
    // Montant AF (12 positions, en centimes)
    record += formatAmount(declaration.totaux.total_af);
    
    // Padding pour atteindre 260 caractères
    record = formatFixedWidth(record, 260);
    return record;
  }

  /**
   * Génère l'enregistrement B06 (Fin de fichier)
   */
  private generateB06Record(declaration: CNSSDeclaration, periode: string, totalRecords: number): string {
    let record = 'B06';
    
    // Numéro d'ordre (dernier enregistrement)
    record += formatFixedWidth(totalRecords.toString(), 6, 'right');
    
    // Numéro d'affiliation
    record += formatFixedWidth(declaration.entreprise.numero_affiliation, 8, 'right');
    
    // Période
    record += formatFixedWidth(periode, 6);
    
    // Nombre total d'enregistrements
    record += formatFixedWidth(totalRecords.toString(), 8, 'right');
    
    // Padding pour atteindre 260 caractères
    record = formatFixedWidth(record, 260);
    return record;
  }

  /**
   * Génère le fichier pré-établi CNSS au format texte (ancienne version, conservée pour compatibilité)
   */
  generatePreEtabliFile(declaration: CNSSDeclaration): string {
    // Utilise maintenant le format BDS
    return this.generateBDSFile(declaration);
  }

  /**
   * Valide une déclaration CNSS selon les règles du cahier des charges
   */
  validateDeclaration(declaration: CNSSDeclaration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Vérifier les informations de l'entreprise
    if (!declaration.entreprise.numero_affiliation) {
      errors.push("Le numéro d'affiliation CNSS est requis");
    } else if (declaration.entreprise.numero_affiliation.length !== 8) {
      errors.push("Le numéro d'affiliation doit contenir 8 chiffres");
    }

    if (!declaration.entreprise.ice || declaration.entreprise.ice.length !== 15) {
      errors.push("L'ICE de l'entreprise doit contenir 15 caractères");
    }

    // Vérifier la période
    if (declaration.periode.mois < 1 || declaration.periode.mois > 12) {
      errors.push("Le mois doit être entre 1 et 12");
    }

    if (declaration.periode.annee < 2000 || declaration.periode.annee > new Date().getFullYear() + 1) {
      errors.push("L'année est invalide");
    }

    // Vérifier chaque employé
    declaration.employes.forEach((employe, index) => {
      const empNum = index + 1;
      
      // Numéro CNSS
      if (!employe.numero_cnss) {
        errors.push(`Employé ${empNum}: Numéro CNSS requis`);
      } else if (employe.numero_cnss.length !== 9) {
        errors.push(`Employé ${empNum}: Le numéro CNSS doit contenir 9 chiffres`);
      }
      
      // CIN
      if (!employe.numero_cin) {
        errors.push(`Employé ${empNum}: Le CIN est requis`);
      } else if (employe.numero_cin.length < 5 || employe.numero_cin.length > 10) {
        errors.push(`Employé ${empNum}: Le CIN doit contenir entre 5 et 10 caractères`);
      }
      
      // Nom et prénom
      if (!employe.nom || employe.nom.trim().length === 0) {
        errors.push(`Employé ${empNum}: Le nom est requis`);
      }
      if (!employe.prenom || employe.prenom.trim().length === 0) {
        errors.push(`Employé ${empNum}: Le prénom est requis`);
      }
      
      // Salaire
      if (employe.salaire_brut < 0) {
        errors.push(`Employé ${empNum}: Le salaire brut ne peut pas être négatif`);
      }
      
      if (employe.salaire_plafonne > CNSS_CONFIG.PLAFOND_MENSUEL) {
        errors.push(`Employé ${empNum}: Le salaire plafonné ne peut pas dépasser ${CNSS_CONFIG.PLAFOND_MENSUEL} MAD`);
      }
      
      // Jours travaillés
      if (employe.jours_travailles < 0 || employe.jours_travailles > 31) {
        errors.push(`Employé ${empNum}: Le nombre de jours travaillés doit être entre 0 et 31`);
      }
      
      // Dates
      if (employe.date_embauche) {
        const dateEmbauche = new Date(employe.date_embauche);
        const now = new Date();
        if (dateEmbauche > now) {
          errors.push(`Employé ${empNum}: La date d'embauche ne peut pas être dans le futur`);
        }
      }
      
      if (employe.date_depart) {
        const dateDepart = new Date(employe.date_depart);
        const dateEmbauche = new Date(employe.date_embauche);
        if (dateDepart < dateEmbauche) {
          errors.push(`Employé ${empNum}: La date de départ ne peut pas être antérieure à la date d'embauche`);
        }
      }
    });

    // Vérifier les totaux
    const calculatedTotals = this.calculateTotaux(declaration.employes);
    const tolerance = 0.01; // Tolérance pour les erreurs d'arrondi

    if (Math.abs(calculatedTotals.total_salaires_bruts - declaration.totaux.total_salaires_bruts) > tolerance) {
      errors.push("Le total des salaires bruts ne correspond pas à la somme des salaires individuels");
    }

    if (Math.abs(calculatedTotals.total_cotisations - declaration.totaux.total_cotisations) > tolerance) {
      errors.push("Le total des cotisations ne correspond pas aux calculs");
    }

    // Vérifier qu'il y a au moins un employé
    if (declaration.employes.length === 0) {
      errors.push("La déclaration doit contenir au moins un employé");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Exporte la déclaration en format CSV
   */
  exportToCSV(declaration: CNSSDeclaration): string {
    const headers = [
      'Numéro CNSS',
      'CIN',
      'Nom',
      'Prénom',
      'Date Naissance',
      'Date Embauche',
      'Jours Travaillés',
      'Salaire Brut',
      'Salaire Plafonné',
      'Cotisation Salariale',
      'Cotisation Patronale',
      'Situation',
    ];

    const rows = declaration.employes.map((employe) => [
      employe.numero_cnss,
      employe.numero_cin || '',
      employe.nom,
      employe.prenom,
      employe.date_naissance || '',
      employe.date_embauche,
      employe.jours_travailles.toString(),
      employe.salaire_brut.toFixed(2),
      employe.salaire_plafonne.toFixed(2),
      employe.cotisation_salariale.toFixed(2),
      employe.cotisation_patronale.toFixed(2),
      employe.situation,
    ]);

    // Ajouter une ligne de totaux
    rows.push([
      'TOTAUX',
      '',
      '',
      '',
      '',
      '',
      '',
      declaration.totaux.total_salaires_bruts.toFixed(2),
      declaration.totaux.total_salaires_plafonnes.toFixed(2),
      declaration.totaux.total_cotisations_salariales.toFixed(2),
      declaration.totaux.total_cotisations_patronales.toFixed(2),
      '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  }
}

// Export singleton instance for default enterprise
export const cnssDeclarationService = new CNSSDeclarationService({
  numero_affiliation: '75605942',
  raison_sociale: 'ARTUS INTERIM MAROC',
  adresse: '145 AV HASSAN II',
  ville: 'CASABLANCA',
  code_postal: '20100',
  effectif: 0, // Will be calculated
  ice: '',
  if: '',
  rc: '',
  cnss: '75605942',
  patente: '',
});
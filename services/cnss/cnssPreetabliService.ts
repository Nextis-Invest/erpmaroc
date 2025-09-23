import type { CNSSDeclaration, CNSSEmploye } from '@/types/cnss';
import { formatFixedWidth } from '@/types/cnss';

/**
 * Service pour générer les fichiers préétablis CNSS selon les spécifications AFFEBDS
 * Format: AFFEBDS_numAFF_Periode.txt
 * Structure: A00, A01, A02 (employés), A03 (récapitulatif)
 * Longueur fixe: 260 caractères par ligne
 * Note: Les freelances sont exclus du préétabli
 */
export class CNSSPreetabliService {
  /**
   * Génère le fichier préétabli complet au format CNSS
   * @param declaration La déclaration CNSS (déjà filtrée sans les freelances)
   * @returns Le contenu du fichier préétabli
   */
  generatePreetabliFile(declaration: CNSSDeclaration): string {
    const lines: string[] = [];
    const periode = `${declaration.periode.annee}${declaration.periode.mois.toString().padStart(2, '0')}`;

    // Note: La déclaration devrait déjà être filtrée sans freelances
    // car le service cnssDeclarationService les exclut en amont

    // A00 - Nature du fichier
    lines.push(this.generateA00Record());

    // A01 - Entête Globale de l'émission
    lines.push(this.generateA01Record(declaration, periode));

    // A02 - Détail Emission (un par employé, trié par numéro d'immatriculation)
    // Les freelances ont déjà été exclus dans cnssDeclarationService
    const sortedEmployes = [...declaration.employes].sort((a, b) =>
      a.numero_cnss.localeCompare(b.numero_cnss)
    );

    sortedEmployes.forEach(employe => {
      lines.push(this.generateA02Record(declaration, employe, periode));
    });

    // A03 - Récapitulatif de l'Emission
    lines.push(this.generateA03Record(declaration, periode));

    // Join with line feed (ASCII 10)
    return lines.join('\n');
  }

  /**
   * Génère l'enregistrement A00 - Nature du fichier
   */
  private generateA00Record(): string {
    let record = '';

    // Type Enregistrement (3 caractères)
    record += 'A00';

    // Identifiant de transfert - référence structurée (14 chiffres)
    const referenceStructuree = new Date().getTime().toString().padStart(14, '0');
    record += referenceStructuree;

    // Catégorie (2 caractères)
    record += 'A0';

    // Zone réservée - filler (241 caractères)
    record += ' '.repeat(241);

    // S'assurer que la longueur est exactement 260 caractères
    return record.substring(0, 260);
  }

  /**
   * Génère l'enregistrement A01 - Entête Globale
   */
  private generateA01Record(declaration: CNSSDeclaration, periode: string): string {
    let record = '';

    // Type Enregistrement (3 caractères)
    record += 'A01';

    // Numéro d'affiliation (7 chiffres)
    record += formatFixedWidth(declaration.entreprise.numero_affiliation, 7, 'right').substring(0, 7);

    // Période AAAAMM (6 caractères)
    record += formatFixedWidth(periode, 6);

    // Raison Sociale (40 caractères)
    record += formatFixedWidth(declaration.entreprise.raison_sociale || '', 40);

    // Activité (40 caractères) - on peut utiliser un champ par défaut ou vide
    const activite = 'SERVICES'; // Ou récupérer depuis l'entreprise si disponible
    record += formatFixedWidth(activite, 40);

    // Adresse (120 caractères)
    record += formatFixedWidth(declaration.entreprise.adresse || '', 120);

    // Ville (20 caractères)
    record += formatFixedWidth(declaration.entreprise.ville || '', 20);

    // Code Postal (6 caractères)
    record += formatFixedWidth(declaration.entreprise.code_postal || '', 6);

    // Code Agence CNSS (2 chiffres) - par défaut 01 pour Casablanca
    const codeAgence = '01';
    record += formatFixedWidth(codeAgence, 2, 'right');

    // Date Emission AAAAMMJJ (8 caractères)
    const dateEmission = new Date();
    const dateEmissionStr = dateEmission.getFullYear().toString() +
                            (dateEmission.getMonth() + 1).toString().padStart(2, '0') +
                            dateEmission.getDate().toString().padStart(2, '0');
    record += dateEmissionStr;

    // Date Exigibilité AAAAMMJJ (8 caractères) - généralement le 20 du mois suivant
    const dateExig = new Date(declaration.periode.annee, declaration.periode.mois, 20);
    const dateExigStr = dateExig.getFullYear().toString() +
                        (dateExig.getMonth() + 1).toString().padStart(2, '0') +
                        dateExig.getDate().toString().padStart(2, '0');
    record += dateExigStr;

    // S'assurer que la longueur est exactement 260 caractères
    return record.substring(0, 260);
  }

  /**
   * Génère l'enregistrement A02 - Détail par employé
   */
  private generateA02Record(
    declaration: CNSSDeclaration,
    employe: CNSSEmploye,
    periode: string
  ): string {
    let record = '';

    // Type Enregistrement (3 caractères)
    record += 'A02';

    // Numéro d'affiliation (7 chiffres)
    record += formatFixedWidth(declaration.entreprise.numero_affiliation, 7, 'right').substring(0, 7);

    // Période AAAAMM (6 caractères)
    record += formatFixedWidth(periode, 6);

    // Numéro d'immatriculation de l'assuré (9 chiffres)
    record += formatFixedWidth(employe.numero_cnss, 9, 'right');

    // Nom et prénom (60 caractères)
    const nomPrenom = `${employe.nom} ${employe.prenom}`.toUpperCase();
    record += formatFixedWidth(nomPrenom, 60);

    // Nombre d'enfants (2 chiffres) - pour allocations familiales
    const nombreEnfants = this.getNombreEnfants(employe);
    record += formatFixedWidth(nombreEnfants.toString(), 2, 'right');

    // AF à payer en centimes (6 chiffres)
    const afAPayer = this.calculateAF(employe, nombreEnfants);
    record += formatFixedWidth(Math.round(afAPayer * 100).toString(), 6, 'right');

    // AF à déduire en centimes (6 chiffres) - généralement 0
    const afADeduire = 0;
    record += formatFixedWidth(afADeduire.toString(), 6, 'right');

    // AF net à payer en centimes (6 chiffres)
    const afNetAPayer = afAPayer - afADeduire;
    record += formatFixedWidth(Math.round(afNetAPayer * 100).toString(), 6, 'right');

    // Zone réservée - filler (155 caractères)
    record += ' '.repeat(155);

    // S'assurer que la longueur est exactement 260 caractères
    return record.substring(0, 260);
  }

  /**
   * Génère l'enregistrement A03 - Récapitulatif
   */
  private generateA03Record(declaration: CNSSDeclaration, periode: string): string {
    let record = '';

    // Type Enregistrement (3 caractères)
    record += 'A03';

    // Numéro d'affiliation (7 chiffres)
    record += formatFixedWidth(declaration.entreprise.numero_affiliation, 7, 'right').substring(0, 7);

    // Période AAAAMM (6 caractères)
    record += formatFixedWidth(periode, 6);

    // Nombre de salariés (6 chiffres)
    record += formatFixedWidth(declaration.employes.length.toString(), 6, 'right');

    // Total des enfants (6 chiffres)
    let totalEnfants = 0;
    let totalAFAPayer = 0;
    let totalAFADeduire = 0;
    let totalNumImma = 0;

    declaration.employes.forEach(employe => {
      const nbEnfants = this.getNombreEnfants(employe);
      totalEnfants += nbEnfants;
      totalAFAPayer += this.calculateAF(employe, nbEnfants);
      // totalAFADeduire reste à 0 généralement

      // Somme des numéros d'immatriculation (pour contrôle)
      const numImma = parseInt(employe.numero_cnss.replace(/\D/g, ''), 10);
      if (!isNaN(numImma)) {
        totalNumImma += numImma;
      }
    });

    record += formatFixedWidth(totalEnfants.toString(), 6, 'right');

    // Total AF à payer en centimes (12 chiffres)
    record += formatFixedWidth(Math.round(totalAFAPayer * 100).toString(), 12, 'right');

    // Total AF à déduire en centimes (12 chiffres)
    record += formatFixedWidth(totalAFADeduire.toString(), 12, 'right');

    // Total AF net à payer en centimes (12 chiffres)
    const totalAFNetAPayer = totalAFAPayer - totalAFADeduire;
    record += formatFixedWidth(Math.round(totalAFNetAPayer * 100).toString(), 12, 'right');

    // Total des numéros d'immatriculation (15 chiffres) - pour contrôle
    // On limite à 15 chiffres max
    const totalNumImmaStr = totalNumImma.toString();
    if (totalNumImmaStr.length > 15) {
      record += totalNumImmaStr.substring(totalNumImmaStr.length - 15);
    } else {
      record += formatFixedWidth(totalNumImmaStr, 15, 'right');
    }

    // Zone réservée - filler (181 caractères)
    record += ' '.repeat(181);

    // S'assurer que la longueur est exactement 260 caractères
    return record.substring(0, 260);
  }

  /**
   * Calcule le nombre d'enfants donnant droit aux allocations familiales
   * @param employe L'employé
   * @returns Le nombre d'enfants (par défaut 0)
   */
  private getNombreEnfants(employe: CNSSEmploye): number {
    // Cette information devrait idéalement venir de l'employé
    // Pour l'instant, on retourne 0 par défaut
    // Vous pouvez étendre le type CNSSEmploye pour inclure cette information
    return 0;
  }

  /**
   * Calcule les allocations familiales pour un employé
   * @param employe L'employé
   * @param nombreEnfants Le nombre d'enfants
   * @returns Le montant des AF
   */
  private calculateAF(employe: CNSSEmploye, nombreEnfants: number): number {
    // Montants des allocations familiales au Maroc (2024)
    // 300 MAD pour les 3 premiers enfants
    // 150 MAD pour les 3 suivants (4-6)
    // Plafonné à 6 enfants

    if (nombreEnfants === 0) return 0;

    let montant = 0;

    // Les 3 premiers enfants : 300 MAD chacun
    const premiersEnfants = Math.min(nombreEnfants, 3);
    montant += premiersEnfants * 300;

    // Les enfants 4 à 6 : 150 MAD chacun
    if (nombreEnfants > 3) {
      const enfantsSuivants = Math.min(nombreEnfants - 3, 3);
      montant += enfantsSuivants * 150;
    }

    return montant;
  }

  /**
   * Génère le nom du fichier préétabli selon les conventions CNSS
   * @param numeroAffiliation Le numéro d'affiliation
   * @param periode La période (AAAAMM)
   * @returns Le nom du fichier
   */
  static generateFileName(numeroAffiliation: string, periode: string): string {
    return `AFFEBDS_${numeroAffiliation}_${periode}.txt`;
  }
}

// Export singleton instance
export const cnssPreetabliService = new CNSSPreetabliService();
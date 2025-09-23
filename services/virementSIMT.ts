// Service de génération de fichiers SIMT pour virements bancaires BMCE
// SIMT File Generation Service for BMCE Bank Transfers
// Format conforme aux spécifications officielles SIMT

import type { PayrollEmployee, PayrollPeriod } from '@/types/payroll';
import { getMoisNom } from '@/types/payroll';

export interface VirementData {
  employee: PayrollEmployee;
  montant: number;
  reference: string;
  dateVirement: string;
}

export interface CompanyBankInfo {
  nomEntreprise: string;
  compteDebiteur: string; // RIB complet 24 caractères
  codebanque: string;
  codeGuichet: string;
  numeroCompte: string;
  cleRib: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
}

/**
 * Génère l'enregistrement d'adresse (Code 20)
 */
export function generateAddressRecord(
  companyInfo: CompanyBankInfo
): string {
  const ligne = [
    '20',                                               // Code enregistrement (2)
    companyInfo.adresse?.substring(0, 50).padEnd(50, ' ') || ' '.repeat(50),  // Adresse ligne 1 (50)
    ' '.repeat(50),                                     // Adresse ligne 2 (50)
    companyInfo.ville?.substring(0, 35).padEnd(35, ' ') || ' '.repeat(35),    // Ville (35)
    companyInfo.codePostal?.padEnd(5, ' ') || ' '.repeat(5),                  // Code postal (5)
    ' '.repeat(258)                                     // Filler (258)
  ].join('');

  return ligne.substring(0, 400).padEnd(400, ' ');
}

/**
 * Génère l'enregistrement Filer1 (Code 21)
 */
export function generateFiler1Record(): string {
  return '21' + ' '.repeat(398);
}

/**
 * Génère l'enregistrement Filer2 (Code 22)
 */
export function generateFiler2Record(): string {
  return '22' + ' '.repeat(398);
}

/**
 * Génère un enregistrement d'opération (Code 30)
 */
export function generateOperationRecord(
  virement: VirementData,
  companyInfo: CompanyBankInfo,
  sequence: number
): string {
  const {
    employee,
    montant,
    reference,
    dateVirement
  } = virement;

  // Format du montant (16 caractères, en centimes, sans décimales)
  const montantCentimes = Math.round(montant * 100);
  const montantFormate = montantCentimes.toString().padStart(16, '0');

  // Date au format JJMMAA
  const date = new Date(dateVirement);
  const dateFormatee = [
    date.getDate().toString().padStart(2, '0'),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getFullYear().toString().substring(2)
  ].join('');

  // RIB du bénéficiaire (24 caractères)
  const ribBeneficiaire = (employee.rib || '011780000019210016805555').padEnd(24, '0');

  // Nom du bénéficiaire (35 caractères)
  const nomBeneficiaire = `${employee.nom} ${employee.prenom}`.substring(0, 35).padEnd(35, ' ');

  // Référence opération (11 caractères)
  const refOperation = reference.substring(0, 11).padEnd(11, ' ');

  const ligne = [
    '30',                                       // Code enregistrement (2)
    sequence.toString().padStart(5, '0'),       // Numéro d'ordre (5)
    ribBeneficiaire,                           // RIB bénéficiaire (24)
    nomBeneficiaire,                           // Nom bénéficiaire (35)
    montantFormate,                            // Montant en centimes (16)
    refOperation,                              // Référence opération (11)
    dateFormatee,                              // Date valeur JJMMAA (6)
    ' '.repeat(301)                            // Filler (301)
  ].join('');

  return ligne.substring(0, 400).padEnd(400, ' ');
}

/**
 * Génère l'enregistrement d'en-tête (Code 10)
 */
export function generateSIMTHeader(
  companyInfo: CompanyBankInfo,
  dateCreation: string,
  nombreVirements: number
): string {
  // Date au format JJMMAA
  const date = new Date(dateCreation);
  const dateFormatee = [
    date.getDate().toString().padStart(2, '0'),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getFullYear().toString().substring(2)
  ].join('');

  // RIB donneur d'ordre (24 caractères)
  const ribDonneur = companyInfo.compteDebiteur.padEnd(24, '0');

  // Nom entreprise (35 caractères)
  const nomEntreprise = companyInfo.nomEntreprise.substring(0, 35).padEnd(35, ' ');

  const ligne = [
    '10',                                       // Code enregistrement (2)
    'VS',                                       // Code application VS = Virement de Salaires (2)
    dateFormatee,                              // Date création JJMMAA (6)
    ribDonneur,                                // RIB donneur d'ordre (24)
    nomEntreprise,                             // Nom donneur d'ordre (35)
    'PAIE' + dateFormatee,                     // Référence remise (11)
    'MAD',                                      // Code devise (3)
    ' '.repeat(317)                            // Filler (317)
  ].join('');

  return ligne.substring(0, 400).padEnd(400, ' ');
}

/**
 * Génère l'enregistrement de contrôle (Code 11)
 */
export function generateSIMTControl(
  nombreVirements: number,
  montantTotal: number
): string {
  // Montant total en centimes (16 caractères)
  const montantTotalCentimes = Math.round(montantTotal * 100);
  const montantFormate = montantTotalCentimes.toString().padStart(16, '0');

  const ligne = [
    '11',                                       // Code enregistrement (2)
    nombreVirements.toString().padStart(5, '0'), // Nombre total d'opérations (5)
    montantFormate,                            // Montant total en centimes (16)
    ' '.repeat(377)                            // Filler (377)
  ].join('');

  return ligne.substring(0, 400).padEnd(400, ' ');
}

/**
 * Génère un fichier SIMT complet pour les virements de paie
 * Conforme aux spécifications officielles SIMT
 */
export function generateSIMTFile(
  virements: VirementData[],
  companyInfo: CompanyBankInfo,
  dateCreation: string = new Date().toISOString().split('T')[0]
): string {
  const lignes: string[] = [];

  // Calcul du montant total
  const montantTotal = virements.reduce((total, v) => total + v.montant, 0);

  // 1. Enregistrement d'en-tête (Code 10)
  lignes.push(generateSIMTHeader(companyInfo, dateCreation, virements.length));

  // 2. Enregistrement d'adresse (Code 20) - Optionnel
  if (companyInfo.adresse) {
    lignes.push(generateAddressRecord(companyInfo));
  }

  // 3. Enregistrements Filer1 et Filer2 (Codes 21 et 22) - Optionnels
  // Généralement non utilisés pour les virements de salaires
  // lignes.push(generateFiler1Record());
  // lignes.push(generateFiler2Record());

  // 4. Enregistrements d'opérations (Code 30)
  virements.forEach((virement, index) => {
    lignes.push(generateOperationRecord(virement, companyInfo, index + 1));
  });

  // 5. Enregistrement de contrôle (Code 11)
  lignes.push(generateSIMTControl(virements.length, montantTotal));

  return lignes.join('\r\n'); // Utilisation de CRLF pour compatibilité bancaire
}

/**
 * Valide le format RIB marocain
 */
export function validateRIB(rib: string): boolean {
  // RIB marocain : 24 caractères numériques
  const ribRegex = /^[0-9]{24}$/;
  return ribRegex.test(rib);
}

/**
 * Formate un RIB pour affichage
 */
export function formatRIB(rib: string): string {
  if (!rib || rib.length !== 24) return rib;
  // Format: 011 78000 0019210016805555
  return `${rib.substring(0, 3)} ${rib.substring(3, 8)} ${rib.substring(8)}`;
}

/**
 * Hook pour télécharger le fichier SIMT
 */
export const useSIMTDownload = () => {
  const downloadSIMT = async (
    employees: PayrollEmployee[],
    period: PayrollPeriod,
    companyInfo?: CompanyBankInfo
  ) => {
    try {
      // Configuration par défaut de l'entreprise marocaine
      const defaultCompanyInfo: CompanyBankInfo = {
        nomEntreprise: 'SOCIETE MAROCAINE SARL',
        compteDebiteur: '011780000019210016805555', // RIB complet 24 caractères
        codebanque: '011',
        codeGuichet: '78000',
        numeroCompte: '0019210016805',
        cleRib: '55',
        adresse: '123 Boulevard Hassan II',
        ville: 'Casablanca',
        codePostal: '20000'
      };

      const company = companyInfo || defaultCompanyInfo;

      // Valider les RIB
      const employeesAvecRIB = employees.filter(emp => {
        if (!emp.rib || !validateRIB(emp.rib)) {
          console.warn(`RIB invalide pour ${emp.nom} ${emp.prenom}`);
          return false;
        }
        return true;
      });

      if (employeesAvecRIB.length === 0) {
        alert('Aucun employé avec un RIB valide trouvé');
        return false;
      }

      // Préparer les données de virement
      const virements: VirementData[] = employeesAvecRIB.map(employee => ({
        employee,
        montant: employee.net_a_payer || 0,
        reference: `P${period.mois.toString().padStart(2, '0')}${period.annee}`,
        dateVirement: new Date().toISOString().split('T')[0]
      }));

      // Générer le fichier SIMT
      const contenuSIMT = generateSIMTFile(virements, company);

      // Créer et télécharger le fichier
      const blob = new Blob([contenuSIMT], { type: 'text/plain; charset=ISO-8859-1' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SIMT_VS_${period.mois.toString().padStart(2, '0')}${period.annee}.smt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Fichier SIMT généré avec ${employeesAvecRIB.length} virements`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la génération du fichier SIMT:', error);
      alert('Erreur lors de la génération du fichier SIMT');
      return false;
    }
  };

  return { downloadSIMT, validateRIB, formatRIB };
};
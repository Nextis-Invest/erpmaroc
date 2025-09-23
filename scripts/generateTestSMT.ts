import { generateSIMTFile } from '../components/payroll/OrdrVirementSIMT';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '../types/payroll';
import * as fs from 'fs';
import * as path from 'path';

// Test employee data
const testEmployee: PayrollEmployee = {
  _id: '1',
  employeeId: 'EMP001',
  nom: 'BENALI',
  prenom: 'Mohamed',
  dateNaissance: new Date('1985-05-15'),
  dateEmbauche: new Date('2020-01-15'),
  cin: 'BE123456',
  situationFamiliale: 'Marié',
  nombreEnfants: 2,
  adresse: '123 Rue Hassan II, Casablanca',
  telephone: '0612345678',
  email: 'mohamed.benali@company.ma',

  // Professional info
  departement: 'Informatique',
  poste: 'Développeur Senior',
  typeContrat: 'CDI',

  // Banking info - Using a proper Moroccan RIB format
  rib: '011780000019210016805555',

  // Salary info
  salaire_base: 12000,
  salaire_net: 10500,

  // Insurance
  cnss: 'CNSS123456',
  amo: true,
  cimr: 'CIMR789012',

  isActive: true,
  branch: 'casa-main'
};

// Calculate net salary and deductions for August
const calculation: PayrollCalculation = {
  salaireBase: 12000,
  primes: 1000,          // Performance bonus
  indemnites: 500,       // Transport allowance
  avantages: 0,
  retenueCNSS: 448.20,   // 4.48% of plafond (10000)
  retenueAMO: 226.00,    // 2.26% of plafond
  retenueCIMR: 720.00,   // 6% of base
  retenueIR: 1605.80,    // Income tax based on scale
  totalRetenues: 3000.00,
  salaireNet: 10500.00   // Base + primes + indemnites - retenues
};

// August 2024 period
const period: PayrollPeriod = {
  _id: 'period-aout-2024',
  mois: 8,  // August
  annee: 2024,
  dateDebut: new Date('2024-08-01'),
  dateFin: new Date('2024-08-31'),
  statut: 'validé',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Company information
const companyInfo = {
  name: 'NEXTIS TECHNOLOGIES SARL',
  address: 'Zone Industrielle, Casablanca',
  ice: 'ICE002589641000021',
  rc: 'RC45621',
  cnss: 'CNSS1258963',
  bank: 'BMCE BANK',
  accountNumber: '00178000001921001680555',
  agencyCode: '001780',
  rib: '011780000019210016805555'
};

// Generate the SMT file
const smtContent = generateSIMTFile({
  employees: [{ employee: testEmployee, calculation }],
  period,
  companyInfo
});

// Save to file
const outputDir = path.join(process.cwd(), 'generated');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const filename = `VS_Aout_2024.smt`;
const filepath = path.join(outputDir, filename);

fs.writeFileSync(filepath, smtContent, 'utf-8');

console.log('✅ Fichier SMT généré avec succès!');
console.log(`📄 Fichier: ${filepath}`);
console.log('\n📊 Détails du virement:');
console.log(`   Employé: ${testEmployee.prenom} ${testEmployee.nom}`);
console.log(`   Matricule: ${testEmployee.employeeId}`);
console.log(`   RIB: ${testEmployee.rib}`);
console.log(`   Salaire Net: ${calculation.salaireNet.toFixed(2)} MAD`);
console.log(`   Période: Août 2024`);
console.log('\n📁 Structure du fichier SMT:');
console.log('   - Ligne 1: Header (Type 10) - Informations générales');
console.log('   - Ligne 2: Détail (Type 30) - Virement employé');
console.log('   - Ligne 3: Footer (Type 11) - Totaux de contrôle');
console.log('\n💡 Ce fichier peut être importé directement dans le système bancaire BMCE.');

// Also display a preview of the content
console.log('\n📝 Aperçu du contenu (premières 200 caractères de chaque ligne):');
const lines = smtContent.split('\r\n');
lines.forEach((line, index) => {
  if (line.length > 0) {
    const preview = line.substring(0, 200);
    const recordType = line.substring(0, 2);
    console.log(`   Ligne ${index + 1} [Type ${recordType}]: ${preview}...`);
  }
});
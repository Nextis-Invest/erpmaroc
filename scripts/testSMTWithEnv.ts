import { generateSIMTFile } from '../components/payroll/OrdrVirementSIMT';
import { getCompanyInfoForSIMT } from '../config/company';
import type { PayrollEmployee, PayrollCalculation } from '../types/payroll';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('🏢 Test de génération SMT avec les variables d\'environnement');
console.log('═══════════════════════════════════════════════════════════');

// Get company info from environment
const companyInfo = getCompanyInfoForSIMT();

console.log('\n📋 Informations de la société (depuis .env.local):');
console.log('─────────────────────────────────────────────────');
console.log(`   Nom: ${companyInfo.name}`);
console.log(`   Adresse: ${companyInfo.address}`);
console.log(`   ICE: ${companyInfo.ice}`);
console.log(`   CNSS: ${companyInfo.cnss}`);
console.log(`   Banque: ${companyInfo.bank}`);
console.log(`   RIB: ${companyInfo.rib}`);
console.log(`   Code Agence: ${companyInfo.agencyCode}`);

// Test employee
const testEmployee: PayrollEmployee = {
  _id: '1',
  employeeId: 'EMP001',
  nom: 'TEST',
  prenom: 'Employee',
  dateNaissance: new Date('1990-01-01'),
  dateEmbauche: new Date('2023-01-01'),
  cin: 'TEST123',
  situationFamiliale: 'Marié',
  nombreEnfants: 1,
  adresse: 'Test Address',
  telephone: '0600000000',
  email: 'test@company.ma',
  departement: 'IT',
  poste: 'Developer',
  typeContrat: 'CDI',
  rib: '011780000019210016808888',
  salaire_base: 10000,
  salaire_net: 8500,
  cnss: 'CNSS999999',
  amo: true,
  cimr: 'CIMR999999',
  isActive: true,
  branch: 'casa-main'
};

const calculation: PayrollCalculation = {
  salaireBase: 10000,
  primes: 500,
  indemnites: 300,
  avantages: 0,
  retenueCNSS: 448.20,
  retenueAMO: 226.00,
  retenueCIMR: 600.00,
  retenueIR: 1025.80,
  totalRetenues: 2300.00,
  salaireNet: 8500.00
};

// August 2024 period
const period = {
  _id: 'period-test',
  mois: 8,
  annee: 2024,
  dateDebut: new Date('2024-08-01'),
  dateFin: new Date('2024-08-31'),
  statut: 'validé' as const,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Generate SIMT file
console.log('\n🔧 Génération du fichier SMT...');

const smtContent = generateSIMTFile({
  employees: [{ employee: testEmployee, calculation }],
  period,
  companyInfo // Using company info from environment
});

// Save to file
const outputDir = path.join(process.cwd(), 'generated');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const filename = `VS_Test_Env_${Date.now()}.smt`;
const filepath = path.join(outputDir, filename);

fs.writeFileSync(filepath, smtContent, 'utf-8');

console.log('\n✅ Fichier SMT généré avec succès!');
console.log(`📄 Fichier: ${filepath}`);

// Verify the content includes company info
const firstLine = smtContent.split('\r\n')[1]; // Get detail line
const companyNameInFile = firstLine.substring(116, 151).trim();
const ribInFile = firstLine.substring(187, 211);

console.log('\n🔍 Vérification du contenu:');
console.log(`   Nom société dans le fichier: ${companyNameInFile}`);
console.log(`   RIB société dans le fichier: ${ribInFile}`);

if (companyNameInFile === companyInfo.name) {
  console.log('   ✅ Le nom de la société correspond aux variables d\'environnement');
} else {
  console.log('   ❌ Le nom de la société ne correspond pas');
}

console.log('\n💡 Le fichier SMT utilise maintenant les informations de la société');
console.log('   configurées dans le fichier .env.local');
console.log('═══════════════════════════════════════════════════════════');
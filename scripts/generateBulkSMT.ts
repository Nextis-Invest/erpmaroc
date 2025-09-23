import { generateSIMTFile } from '../components/payroll/OrdrVirementSIMT';
import type { PayrollEmployee, PayrollCalculation } from '../types/payroll';
import * as fs from 'fs';
import * as path from 'path';

// Multiple test employees for August payment
const employees = [
  {
    employee: {
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
      departement: 'Informatique',
      poste: 'Développeur Senior',
      typeContrat: 'CDI',
      rib: '011780000019210016805555',
      salaire_base: 12000,
      salaire_net: 10500,
      cnss: 'CNSS123456',
      amo: true,
      cimr: 'CIMR789012',
      isActive: true,
      branch: 'casa-main'
    } as PayrollEmployee,
    calculation: {
      salaireBase: 12000,
      primes: 1000,
      indemnites: 500,
      avantages: 0,
      retenueCNSS: 448.20,
      retenueAMO: 226.00,
      retenueCIMR: 720.00,
      retenueIR: 1605.80,
      totalRetenues: 3000.00,
      salaireNet: 10500.00
    } as PayrollCalculation
  },
  {
    employee: {
      _id: '2',
      employeeId: 'EMP002',
      nom: 'ALAMI',
      prenom: 'Fatima',
      dateNaissance: new Date('1990-08-22'),
      dateEmbauche: new Date('2021-03-01'),
      cin: 'AL789456',
      situationFamiliale: 'Célibataire',
      nombreEnfants: 0,
      adresse: '45 Avenue Mohamed V, Rabat',
      telephone: '0623456789',
      email: 'fatima.alami@company.ma',
      departement: 'Comptabilité',
      poste: 'Comptable',
      typeContrat: 'CDI',
      rib: '011780000019210016806666',
      salaire_base: 8000,
      salaire_net: 7200,
      cnss: 'CNSS234567',
      amo: true,
      cimr: 'CIMR890123',
      isActive: true,
      branch: 'casa-main'
    } as PayrollEmployee,
    calculation: {
      salaireBase: 8000,
      primes: 500,
      indemnites: 300,
      avantages: 0,
      retenueCNSS: 358.56,
      retenueAMO: 180.80,
      retenueCIMR: 480.00,
      retenueIR: 580.64,
      totalRetenues: 1600.00,
      salaireNet: 7200.00
    } as PayrollCalculation
  },
  {
    employee: {
      _id: '3',
      employeeId: 'EMP003',
      nom: 'TAHIRI',
      prenom: 'Hassan',
      dateNaissance: new Date('1988-12-10'),
      dateEmbauche: new Date('2019-06-15'),
      cin: 'TH456789',
      situationFamiliale: 'Marié',
      nombreEnfants: 3,
      adresse: '78 Rue Al Massira, Marrakech',
      telephone: '0634567890',
      email: 'hassan.tahiri@company.ma',
      departement: 'Commercial',
      poste: 'Responsable Commercial',
      typeContrat: 'CDI',
      rib: '011780000019210016807777',
      salaire_base: 15000,
      salaire_net: 13200,
      cnss: 'CNSS345678',
      amo: true,
      cimr: 'CIMR901234',
      isActive: true,
      branch: 'casa-main'
    } as PayrollEmployee,
    calculation: {
      salaireBase: 15000,
      primes: 2000,
      indemnites: 600,
      avantages: 0,
      retenueCNSS: 448.20,
      retenueAMO: 226.00,
      retenueCIMR: 900.00,
      retenueIR: 2825.80,
      totalRetenues: 4400.00,
      salaireNet: 13200.00
    } as PayrollCalculation
  }
];

// August 2024 period
const period = {
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
  employees,
  period,
  companyInfo
});

// Save to file
const outputDir = path.join(process.cwd(), 'generated');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const filename = `VS_Aout_2024_Bulk.smt`;
const filepath = path.join(outputDir, filename);

fs.writeFileSync(filepath, smtContent, 'utf-8');

// Calculate totals
const totalAmount = employees.reduce((sum, emp) => sum + emp.calculation.salaireNet, 0);

console.log('✅ Fichier SMT pour virements en masse généré avec succès!');
console.log(`📄 Fichier: ${filepath}`);
console.log('\n📊 Résumé des virements - Août 2024:');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`   Nombre d'employés: ${employees.length}`);
console.log(`   Montant total: ${totalAmount.toFixed(2)} MAD`);
console.log('\n👥 Détail par employé:');
console.log('───────────────────────────────────────────────────────────────');

employees.forEach((emp, index) => {
  console.log(`   ${index + 1}. ${emp.employee.prenom} ${emp.employee.nom} (${emp.employee.employeeId})`);
  console.log(`      Poste: ${emp.employee.poste}`);
  console.log(`      RIB: ${emp.employee.rib}`);
  console.log(`      Salaire Net: ${emp.calculation.salaireNet.toFixed(2)} MAD`);
  if (index < employees.length - 1) {
    console.log('   ─────────────────────────────────────');
  }
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('\n📁 Structure du fichier SMT:');
console.log('   • Ligne 1: Header (Type 10) - Informations du lot');
console.log(`   • Lignes 2-${employees.length + 1}: Détails (Type 30) - Un par employé`);
console.log(`   • Ligne ${employees.length + 2}: Footer (Type 11) - Totaux de contrôle`);
console.log('\n💡 Instructions d\'utilisation:');
console.log('   1. Vérifier les informations de chaque employé');
console.log('   2. Importer le fichier dans le système bancaire BMCE');
console.log('   3. Valider le lot de virements avant exécution');
console.log('\n⚠️  Important: Ce fichier contient des données sensibles.');
console.log('   Assurez-vous de le transmettre de manière sécurisée.');
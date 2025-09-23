// Mock payroll data based on existing HR employees
import { Types } from 'mongoose';
import { mockEmployees } from '@/lib/hr/mockData';
import type { PayrollEmployee } from '@/types/payroll';

// Generate ObjectId-like strings for mock data
const generateObjectId = () => new Types.ObjectId().toString();

/**
 * Transform HR employee data to Payroll employee format with realistic Moroccan payroll data
 */
const transformHRToPayroll = (hrEmployee: any): PayrollEmployee => {
  // Calculate age for realistic data
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Map marital status to payroll format
  const mapMaritalStatus = (status: string): 'CELIBATAIRE' | 'MARIE' | 'DIVORCE' | 'VEUF' => {
    switch (status?.toLowerCase()) {
      case 'married': return 'MARIE';
      case 'single': return 'CELIBATAIRE';
      case 'divorced': return 'DIVORCE';
      case 'widowed': return 'VEUF';
      default: return 'CELIBATAIRE';
    }
  };

  // Calculate number of children based on age and marital status
  const calculateChildren = (): number => {
    if (hrEmployee.maritalStatus === 'married') {
      const age = calculateAge(new Date(hrEmployee.birthDate));
      if (age > 35) return Math.floor(Math.random() * 3) + 1; // 1-3 children
      if (age > 30) return Math.floor(Math.random() * 2); // 0-1 children
      if (age > 25) return Math.random() > 0.7 ? 1 : 0; // 30% chance of 1 child
    }
    return 0;
  };

  // Extract allowance amount by type
  const extractAllowance = (allowances: any[], type: string): number => {
    if (!allowances || !Array.isArray(allowances)) return 0;
    const allowance = allowances.find(a => a.type === type);
    return allowance ? allowance.amount : 0;
  };

  // Generate CNSS number (format: 123456789012)
  const generateCNSSNumber = (): string => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };

  // Real Moroccan banks with their codes
  const moroccanBanks = [
    { name: 'Attijariwafa Bank', code: '007', swift: 'BCMAMAMC' },
    { name: 'Banque Populaire du Maroc', code: '016', swift: 'BCPOMAMC' },
    { name: 'BMCE Bank', code: '011', swift: 'BMCEMAMC' },
    { name: 'Banque Marocaine du Commerce Extérieur', code: '011', swift: 'BMCEMAMC' },
    { name: 'Crédit Agricole du Maroc', code: '015', swift: 'CAGMMAMC' },
    { name: 'Crédit du Maroc', code: '175', swift: 'CDMAMAMC' },
    { name: 'BMCI - Groupe BNP Paribas', code: '013', swift: 'BMCIMAMC' },
    { name: 'Société Générale Maroc', code: '020', swift: 'SGMBMAMC' },
    { name: 'CIH Bank', code: '008', swift: 'CIHBMAMC' },
    { name: 'Bank Al-Maghrib', code: '001', swift: 'BKMAMAMC' }
  ];

  // Generate realistic Moroccan RIB (24 digits format)
  const generateMoroccanBankAccount = () => {
    const bank = moroccanBanks[Math.floor(Math.random() * moroccanBanks.length)];
    
    // Moroccan RIB format: Bank Code (3) + Branch Code (5) + Account Number (16)
    const bankCode = bank.code.padStart(3, '0');
    const branchCode = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
    const accountNumber = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0'); // 16 digits
    
    const rib = bankCode + branchCode + accountNumber;
    
    return {
      bankName: bank.name,
      rib: rib,
      swift: bank.swift,
      bankCode: bank.code
    };
  };

  // Calculate realistic hourly rate based on Moroccan labor standards
  // Standard working hours: 44 hours/week = 44 × 4.33 weeks/month ≈ 191 hours/month
  // But for hourly calculation, use actual monthly working days: 22 days × 8 hours = 176 hours
  const calculateHourlyRate = (monthlySalary: number): number => {
    const monthlyWorkingHours = 176; // 22 working days × 8 hours
    return Math.round((monthlySalary / monthlyWorkingHours) * 100) / 100;
  };

  // Generate bank account info
  const bankInfo = generateMoroccanBankAccount();

  return {
    _id: generateObjectId(),
    employeeId: hrEmployee.employeeId,
    nom: hrEmployee.lastName.toUpperCase(),
    prenom: hrEmployee.firstName,
    cin: hrEmployee.nationalId,
    date_embauche: hrEmployee.hireDate.toISOString().split('T')[0],
    date_naissance: hrEmployee.birthDate ? hrEmployee.birthDate.toISOString().split('T')[0] : undefined,
    fonction: hrEmployee.position,
    situation_familiale: mapMaritalStatus(hrEmployee.maritalStatus),
    nombre_enfants: calculateChildren(),
    cnss_numero: generateCNSSNumber(),
    mode_paiement: 'VIR', // Default to bank transfer

    // Salary & Working Time - Fixed calculations
    salaire_base: hrEmployee.salary,
    taux_horaire: calculateHourlyRate(hrEmployee.salary), // Realistic hourly rate
    heures_travaillees: 176, // 22 working days × 8 hours per day
    jours_conges_payes: 18, // Morocco legal minimum is 18 days per year (1.5 days per month)
    jours_feries: 8, // Actual count from mockHolidays data
    heures_supp_25: 0, // No overtime initially
    heures_supp_50: 0,
    heures_supp_100: 0,

    // Allowances & Benefits (from HR data)
    prime_transport: extractAllowance(hrEmployee.allowances, 'Transport'),
    prime_panier: 500, // Standard meal allowance
    indemnite_representation: hrEmployee.position.includes('Director') || hrEmployee.position.includes('Manager') ? 2000 : 0,
    indemnite_deplacement: 0,
    autres_primes: extractAllowance(hrEmployee.allowances, 'Tech') +
                   extractAllowance(hrEmployee.allowances, 'Management') +
                   extractAllowance(hrEmployee.allowances, 'Commission'),
    autres_indemnites: extractAllowance(hrEmployee.allowances, 'Medical'),

    // Deductions & Contributions
    cotisation_mutuelle: 200, // Standard health insurance contribution
    cotisation_cimr: hrEmployee.salary * 0.03, // 3% CIMR contribution
    avance_salaire: 0,
    autres_deductions: 0,

    // Contact & Banking Info - Enhanced with real Moroccan banks
    cimr_numero: generateCNSSNumber().slice(0, 10), // CIMR number format
    adresse: hrEmployee.address ?
      `${hrEmployee.address.street}, ${hrEmployee.address.city}, ${hrEmployee.address.state}` :
      undefined,
    rib: bankInfo.rib,
    banque: bankInfo.bankName,
    code_banque: bankInfo.bankCode,
    swift_code: bankInfo.swift
  };
};;;

// Transform all HR employees to payroll format
export const mockPayrollEmployees: PayrollEmployee[] = mockEmployees.map(transformHRToPayroll);

// Additional payroll employees to make a more diverse dataset
const additionalPayrollEmployees: PayrollEmployee[] = [
  {
    _id: generateObjectId(),
    employeeId: "EMP006",
    nom: "ALAMI",
    prenom: "Fatima",
    cin: "KL123456",
    date_embauche: "2023-05-01",
    date_naissance: "1987-12-15",
    fonction: "Accountant",
    situation_familiale: "MARIE",
    nombre_enfants: 2,
    cnss_numero: "789012345678",
    mode_paiement: "VIR",

    salaire_base: 32000,
    taux_horaire: 167.54,
    heures_travaillees: 191,
    jours_conges_payes: 30,
    jours_feries: 12,
    heures_supp_25: 0,
    heures_supp_50: 0,
    heures_supp_100: 0,

    prime_transport: 1800,
    prime_panier: 500,
    indemnite_representation: 0,
    indemnite_deplacement: 0,
    autres_primes: 1000,
    autres_indemnites: 800,

    cotisation_mutuelle: 200,
    cotisation_cimr: 960,
    avance_salaire: 0,
    autres_deductions: 0,

    cimr_numero: "7890123456",
    adresse: "345 Ibn Battuta Street, Salé, Rabat-Salé-Kénitra",
    rib: "123456789012345678901234",
    banque: "Banque Populaire"
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP007",
    nom: "BENKIRANE",
    prenom: "Omar",
    cin: "MN789012",
    date_embauche: "2022-11-15",
    date_naissance: "1991-08-22",
    fonction: "Operations Coordinator",
    situation_familiale: "CELIBATAIRE",
    nombre_enfants: 0,
    cnss_numero: "567890123456",
    mode_paiement: "VIR",

    salaire_base: 28000,
    taux_horaire: 146.60,
    heures_travaillees: 191,
    jours_conges_payes: 30,
    jours_feries: 12,
    heures_supp_25: 5,
    heures_supp_50: 2,
    heures_supp_100: 0,

    prime_transport: 2000,
    prime_panier: 500,
    indemnite_representation: 0,
    indemnite_deplacement: 500,
    autres_primes: 0,
    autres_indemnites: 0,

    cotisation_mutuelle: 200,
    cotisation_cimr: 840,
    avance_salaire: 2000,
    autres_deductions: 0,

    cimr_numero: "5678901234",
    adresse: "678 Hassan V Avenue, Agadir, Souss-Massa",
    rib: "987654321098765432109876",
    banque: "BMCE Bank"
  },
  {
    _id: generateObjectId(),
    employeeId: "EMP008",
    nom: "TAZI",
    prenom: "Aicha",
    cin: "OP345678",
    date_embauche: "2024-01-08",
    date_naissance: "1993-04-10",
    fonction: "Marketing Specialist",
    situation_familiale: "CELIBATAIRE",
    nombre_enfants: 0,
    cnss_numero: "345678901234",
    mode_paiement: "VIR",

    salaire_base: 36000,
    taux_horaire: 188.48,
    heures_travaillees: 191,
    jours_conges_payes: 30,
    jours_feries: 12,
    heures_supp_25: 0,
    heures_supp_50: 0,
    heures_supp_100: 0,

    prime_transport: 1500,
    prime_panier: 500,
    indemnite_representation: 1000,
    indemnite_deplacement: 0,
    autres_primes: 2000,
    autres_indemnites: 500,

    cotisation_mutuelle: 200,
    cotisation_cimr: 1080,
    avance_salaire: 0,
    autres_deductions: 0,

    cimr_numero: "3456789012",
    adresse: "890 Moulay Youssef Boulevard, Meknes, Fez-Meknes",
    rib: "456789012345678901234567",
    banque: "Attijariwafa Bank"
  }
];

// Combine all payroll employees
export const allMockPayrollEmployees: PayrollEmployee[] = [
  ...mockPayrollEmployees,
  ...additionalPayrollEmployees
];

// Export individual employees for easy access
export const payrollEmployeesByEmpId = allMockPayrollEmployees.reduce((acc, emp) => {
  acc[emp.employeeId] = emp;
  return acc;
}, {} as Record<string, PayrollEmployee>);

// Helper function to get payroll employee by HR employee ID
export const getPayrollEmployeeByHRId = (hrEmployeeId: string): PayrollEmployee | undefined => {
  const hrEmployee = mockEmployees.find(emp => emp._id === hrEmployeeId);
  if (!hrEmployee) return undefined;

  return allMockPayrollEmployees.find(pEmp => pEmp.employeeId === hrEmployee.employeeId);
};

// Analytics data for payroll
export const mockPayrollAnalytics = {
  totalEmployees: allMockPayrollEmployees.length,
  totalMonthlySalaries: allMockPayrollEmployees.reduce((sum, emp) => sum + emp.salaire_base, 0),
  averageSalary: Math.round(allMockPayrollEmployees.reduce((sum, emp) => sum + emp.salaire_base, 0) / allMockPayrollEmployees.length),
  totalMonthlyContributions: allMockPayrollEmployees.reduce((sum, emp) =>
    sum + emp.cotisation_cimr + emp.cotisation_mutuelle, 0),
  employeesBySituationFamiliale: {
    CELIBATAIRE: allMockPayrollEmployees.filter(emp => emp.situation_familiale === 'CELIBATAIRE').length,
    MARIE: allMockPayrollEmployees.filter(emp => emp.situation_familiale === 'MARIE').length,
    DIVORCE: allMockPayrollEmployees.filter(emp => emp.situation_familiale === 'DIVORCE').length,
    VEUF: allMockPayrollEmployees.filter(emp => emp.situation_familiale === 'VEUF').length
  },
  totalChildren: allMockPayrollEmployees.reduce((sum, emp) => sum + emp.nombre_enfants, 0),
  paymentMethods: {
    VIR: allMockPayrollEmployees.filter(emp => emp.mode_paiement === 'VIR').length,
    CHQ: allMockPayrollEmployees.filter(emp => emp.mode_paiement === 'CHQ').length,
    ESP: allMockPayrollEmployees.filter(emp => emp.mode_paiement === 'ESP').length
  }
};

export default allMockPayrollEmployees;
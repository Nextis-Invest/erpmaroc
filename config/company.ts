// Company Configuration - Loaded from environment variables

export const companyConfig = {
  // Company Information
  name: process.env.COMPANY_NAME || 'NEXTIS TECHNOLOGIES SARL',
  address: process.env.COMPANY_ADDRESS || 'Zone Industrielle, Boulevard Hassan II, Casablanca',
  ice: process.env.COMPANY_ICE || 'ICE002589641000021',
  rc: process.env.COMPANY_RC || 'RC45621',
  cnss: process.env.COMPANY_CNSS || 'CNSS1258963',
  patente: process.env.COMPANY_PATENTE || 'PAT789456',
  if: process.env.COMPANY_IF || 'IF123456789',
  phone: process.env.COMPANY_PHONE || '+212 5 22 123 456',
  email: process.env.COMPANY_EMAIL || 'contact@nextis-tech.ma',
  website: process.env.COMPANY_WEBSITE || 'https://www.nextis-tech.ma',

  // Banking Information
  bank: {
    name: process.env.COMPANY_BANK_NAME || 'BMCE BANK',
    agency: process.env.COMPANY_BANK_AGENCY || 'Agence Hassan II Casablanca',
    agencyCode: process.env.COMPANY_BANK_AGENCY_CODE || '001780',
    accountNumber: process.env.COMPANY_BANK_ACCOUNT_NUMBER || '00178000001921001680555',
    rib: process.env.COMPANY_BANK_RIB || '011780000019210016805555',
    iban: process.env.COMPANY_BANK_IBAN || 'MA64011780000019210016805555',
    swift: process.env.COMPANY_BANK_SWIFT || 'BMCEMAMC',
  },

  // SIMT Configuration
  simt: {
    operationType: process.env.SIMT_OPERATION_TYPE || 'VS',
    currency: process.env.SIMT_CURRENCY || 'MAD',
    paymentType: process.env.SIMT_PAYMENT_TYPE || 'S1',
    transferType: process.env.SIMT_TRANSFER_TYPE || '02',
  },

  // Tax Information
  tax: {
    taxId: process.env.COMPANY_TAX_ID || 'TIN123456789',
    vatNumber: process.env.COMPANY_VAT_NUMBER || 'VAT20000001',
  },
};

// Helper function to get formatted company info for documents
export function getCompanyInfoForDocuments() {
  return {
    name: companyConfig.name,
    address: companyConfig.address,
    ice: companyConfig.ice,
    rc: companyConfig.rc,
    cnss: companyConfig.cnss,
    patente: companyConfig.patente,
    if: companyConfig.if,
    phone: companyConfig.phone,
    email: companyConfig.email,
    website: companyConfig.website,
    bank: companyConfig.bank.name,
    accountNumber: companyConfig.bank.accountNumber,
    agencyCode: companyConfig.bank.agencyCode,
    rib: companyConfig.bank.rib,
    iban: companyConfig.bank.iban,
    swift: companyConfig.bank.swift,
  };
}

// Helper function to get company info for SIMT files
export function getCompanyInfoForSIMT() {
  return {
    name: companyConfig.name,
    address: companyConfig.address,
    ice: companyConfig.ice,
    rc: companyConfig.rc,
    cnss: companyConfig.cnss,
    bank: companyConfig.bank.name,
    accountNumber: companyConfig.bank.accountNumber,
    agencyCode: companyConfig.bank.agencyCode,
    rib: companyConfig.bank.rib,
  };
}

// Helper function to get company tax info
export function getCompanyTaxInfo() {
  return {
    ice: companyConfig.ice,
    if: companyConfig.if,
    taxId: companyConfig.tax.taxId,
    vatNumber: companyConfig.tax.vatNumber,
    cnss: companyConfig.cnss,
    rc: companyConfig.rc,
    patente: companyConfig.patente,
  };
}

// Helper function to format RIB for display
export function formatRIB(rib?: string): string {
  const ribToFormat = rib || companyConfig.bank.rib;
  if (ribToFormat.length === 24) {
    // Format: XXX XXX XXXXXXXXXXXXXX XX
    return `${ribToFormat.slice(0, 3)} ${ribToFormat.slice(3, 6)} ${ribToFormat.slice(6, 22)} ${ribToFormat.slice(22)}`;
  }
  return ribToFormat;
}

// Helper function to format IBAN for display
export function formatIBAN(iban?: string): string {
  const ibanToFormat = iban || companyConfig.bank.iban;
  // Format: MAXX XXXX XXXX XXXX XXXX XXXX XX
  return ibanToFormat.match(/.{1,4}/g)?.join(' ') || ibanToFormat;
}

export default companyConfig;
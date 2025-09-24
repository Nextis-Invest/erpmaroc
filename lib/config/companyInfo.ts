// Company Information Configuration
// Fetches company details from environment variables

export interface CompanyInfo {
  name: string;
  address: string;
  ice: string;
  rc: string;
  cnss: string;
  patente: string;
  if: string;
  phone: string;
  email: string;
  website: string;
  bank: string;
  bankAgency: string;
  bankAgencyCode: string;
  accountNumber: string;
  rib: string;
  iban: string;
  swift: string;
}

export const getCompanyInfo = (): CompanyInfo => {
  return {
    name: process.env.COMPANY_NAME || 'SOCIETE MAROCAINE SARL',
    address: process.env.COMPANY_ADDRESS || '123 Boulevard Hassan II, Casablanca',
    ice: process.env.COMPANY_ICE || 'ICE002589641000021',
    rc: process.env.COMPANY_RC || 'RC45621',
    cnss: process.env.COMPANY_CNSS || 'CNSS1258963',
    patente: process.env.COMPANY_PATENTE || 'PAT789456',
    if: process.env.COMPANY_IF || 'IF123456789',
    phone: process.env.COMPANY_PHONE || '+212 5XX XX XX XX',
    email: process.env.COMPANY_EMAIL || 'contact@entreprise.ma',
    website: process.env.COMPANY_WEBSITE || 'https://www.entreprise.ma',
    bank: process.env.COMPANY_BANK_NAME || 'BMCE BANK',
    bankAgency: process.env.COMPANY_BANK_AGENCY || 'Agence Hassan II',
    bankAgencyCode: process.env.COMPANY_BANK_AGENCY_CODE || '001780',
    accountNumber: process.env.COMPANY_BANK_ACCOUNT_NUMBER || '00178000001921001680555',
    rib: process.env.COMPANY_BANK_RIB || '011780000019210016805555',
    iban: process.env.COMPANY_BANK_IBAN || 'MA64011780000019210016805555',
    swift: process.env.COMPANY_BANK_SWIFT || 'BMCEMAMC'
  };
};

// For SIMT file generation
export const getCompanyInfoForSIMT = () => {
  const companyInfo = getCompanyInfo();
  return {
    name: companyInfo.name,
    address: companyInfo.address,
    ice: companyInfo.ice,
    accountNumber: companyInfo.accountNumber,
    rib: companyInfo.rib,
    operationType: process.env.SIMT_OPERATION_TYPE || 'VS',
    currency: process.env.SIMT_CURRENCY || 'MAD',
    paymentType: process.env.SIMT_PAYMENT_TYPE || 'S1',
    transferType: process.env.SIMT_TRANSFER_TYPE || '02'
  };
};

// For PDF generation (simplified object)
export const getCompanyInfoForPDF = () => {
  const companyInfo = getCompanyInfo();
  return {
    name: companyInfo.name,
    address: companyInfo.address,
    ice: companyInfo.ice,
    rc: companyInfo.rc,
    cnss: companyInfo.cnss,
    phone: companyInfo.phone,
    email: companyInfo.email,
    bank: companyInfo.bank,
    accountNumber: companyInfo.accountNumber,
    rib: companyInfo.rib
  };
};
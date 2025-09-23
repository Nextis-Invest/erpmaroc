'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';
import { formatMontantMAD, getMoisNom } from '@/types/payroll';

// Types for the virement request
interface DemandeVirementProps {
  employees: Array<{
    employee: PayrollEmployee;
    calculation: PayrollCalculation;
  }>;
  period: PayrollPeriod;
  companyInfo?: {
    name: string;
    address: string;
    ice: string;
    rc: string;
    cnss: string;
    rib: string;
  };
}

// PDF styles for virement request
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#000000',
  },

  // Header section
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // Company section
  companySection: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  companyRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 150,
  },
  value: {
    fontSize: 10,
    flex: 1,
  },

  // Request details section
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },

  // Table styles
  table: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    minHeight: 20,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    minHeight: 25,
  },
  tableFooter: {
    backgroundColor: '#f9f9f9',
    minHeight: 25,
  },

  // Column widths
  colNum: {
    width: 30,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colEmployee: {
    width: 150,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 4,
    justifyContent: 'center',
  },
  colRib: {
    width: 180,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 4,
    justifyContent: 'center',
  },
  colAmount: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 4,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colBank: {
    width: 80,
    padding: 4,
    justifyContent: 'center',
  },

  // Text styles
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 9,
  },
  cellNumber: {
    fontSize: 9,
    textAlign: 'right',
  },
  totalText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Signature section
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 200,
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    height: 40,
    marginBottom: 3,
  },
  signatureDate: {
    fontSize: 9,
  },

  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    borderTopStyle: 'solid',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 2,
  },
});

// PDF Document Component
const DemandeVirementPDF: React.FC<DemandeVirementProps> = ({
  employees,
  period,
  companyInfo = {
    name: 'SOCIETE MAROCAINE SARL',
    address: '123 Boulevard Hassan II, Casablanca',
    ice: 'ICE002589641000021',
    rc: 'RC45621',
    cnss: 'CNSS1258963',
    rib: '011780000019210016805555',
  }
}) => {
  const dateVirement = new Date();
  const totalMontant = employees.reduce((sum, emp) =>
    sum + (emp.employee.net_a_payer || 0), 0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ORDRE DE VIREMENT MULTIPLE</Text>
          <Text style={[styles.subtitle, { textAlign: 'center' }]}>
            PAIE DU MOIS DE {getMoisNom(period.mois).toUpperCase()} {period.annee}
          </Text>
        </View>

        {/* Company Information */}
        <View style={styles.companySection}>
          <Text style={styles.subtitle}>DONNEUR D&apos;ORDRE</Text>
          <View style={styles.companyRow}>
            <Text style={styles.label}>Raison Sociale :</Text>
            <Text style={styles.value}>{companyInfo.name}</Text>
          </View>
          <View style={styles.companyRow}>
            <Text style={styles.label}>Adresse :</Text>
            <Text style={styles.value}>{companyInfo.address}</Text>
          </View>
          <View style={styles.companyRow}>
            <Text style={styles.label}>ICE :</Text>
            <Text style={styles.value}>{companyInfo.ice}</Text>
          </View>
          <View style={styles.companyRow}>
            <Text style={styles.label}>RIB Débiteur :</Text>
            <Text style={styles.value}>{companyInfo.rib}</Text>
          </View>
        </View>

        {/* Request Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date de valeur :</Text>
            <Text style={styles.value}>{dateVirement.toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Référence :</Text>
            <Text style={styles.value}>
              PAIE-{period.mois.toString().padStart(2, '0')}-{period.annee}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Motif :</Text>
            <Text style={styles.value}>
              Virement des salaires - {getMoisNom(period.mois)} {period.annee}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Nombre de bénéficiaires :</Text>
            <Text style={styles.value}>{employees.length}</Text>
          </View>
        </View>

        {/* Beneficiaries Table */}
        <Text style={styles.subtitle}>LISTE DES BÉNÉFICIAIRES</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.colNum}>
              <Text style={styles.headerText}>N°</Text>
            </View>
            <View style={styles.colEmployee}>
              <Text style={styles.headerText}>Bénéficiaire</Text>
            </View>
            <View style={styles.colRib}>
              <Text style={styles.headerText}>RIB</Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={styles.headerText}>Montant (MAD)</Text>
            </View>
            <View style={styles.colBank}>
              <Text style={styles.headerText}>Banque</Text>
            </View>
          </View>

          {/* Table Rows */}
          {employees.map((emp, index) => (
            <View key={emp.employee.employeeId} style={styles.tableRow}>
              <View style={styles.colNum}>
                <Text style={styles.cellText}>{index + 1}</Text>
              </View>
              <View style={styles.colEmployee}>
                <Text style={styles.cellText}>
                  {emp.employee.nom} {emp.employee.prenom}
                </Text>
              </View>
              <View style={styles.colRib}>
                <Text style={styles.cellText}>
                  {emp.employee.rib || 'À renseigner'}
                </Text>
              </View>
              <View style={styles.colAmount}>
                <Text style={styles.cellNumber}>
                  {formatMontantMAD(emp.employee.net_a_payer || 0).replace('MAD', '').trim()}
                </Text>
              </View>
              <View style={styles.colBank}>
                <Text style={styles.cellText}>
                  {emp.employee.banque || 'BMCE'}
                </Text>
              </View>
            </View>
          ))}

          {/* Total Row */}
          <View style={[styles.tableRow, styles.tableFooter]}>
            <View style={[styles.colNum, { borderRightWidth: 0 }]}>
              <Text style={styles.totalText}></Text>
            </View>
            <View style={[styles.colEmployee, { borderRightWidth: 0 }]}>
              <Text style={styles.totalText}>TOTAL</Text>
            </View>
            <View style={[styles.colRib, { borderRightWidth: 0 }]}>
              <Text style={styles.totalText}></Text>
            </View>
            <View style={styles.colAmount}>
              <Text style={[styles.cellNumber, styles.totalText]}>
                {formatMontantMAD(totalMontant).replace('MAD', '').trim()}
              </Text>
            </View>
            <View style={styles.colBank}>
              <Text style={styles.totalText}>MAD</Text>
            </View>
          </View>
        </View>

        {/* Total in words */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Montant total à débiter :</Text>
            <Text style={[styles.value, { fontWeight: 'bold', fontSize: 12 }]}>
              {formatMontantMAD(totalMontant)}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.detailsSection}>
          <Text style={[styles.label, { marginBottom: 5 }]}>Instructions particulières :</Text>
          <Text style={styles.value}>- Virement à exécuter avant le 30 du mois</Text>
          <Text style={styles.value}>- Format compatible SIMT / BMCE Bank</Text>
          <Text style={styles.value}>- Conserver un exemplaire pour archives</Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Établi par :</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureDate}>Date : {dateVirement.toLocaleDateString('fr-FR')}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Approuvé par :</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureDate}>Date : _______________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Document généré le {dateVirement.toLocaleDateString('fr-FR')} à {dateVirement.toLocaleTimeString('fr-FR')}
          </Text>
          <Text style={styles.footerText}>
            Référence bancaire : {companyInfo.rib}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Hook to generate and download virement PDF
export const useDemandeVirementDownload = () => {
  const downloadDemandeVirement = async (
    employees: Array<{
      employee: PayrollEmployee;
      calculation: PayrollCalculation;
    }>,
    period: PayrollPeriod,
    companyInfo?: any
  ) => {
    try {
      const doc = <DemandeVirementPDF
        employees={employees}
        period={period}
        companyInfo={companyInfo}
      />;

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `demande-virement-${getMoisNom(period.mois)}-${period.annee}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading demande de virement:', error);
      return false;
    }
  };

  return { downloadDemandeVirement };
};

export default DemandeVirementPDF;
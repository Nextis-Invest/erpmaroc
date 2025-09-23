'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';
import { formatMontantMAD, getMoisNom } from '@/types/payroll';

// Types for the bank transfer order
interface OrdrVirementProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  companyInfo?: {
    name: string;
    address: string;
    ice: string;
    rc: string;
    cnss: string;
    bank?: string;
    accountNumber?: string;
  };
}

// PDF styles for bank transfer order
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },

  // Header
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },

  // Company section
  companySection: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    marginBottom: 2,
  },

  // Date and reference
  referenceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  referenceBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  referenceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  referenceValue: {
    fontSize: 10,
  },

  // Bank info
  bankSection: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  bankTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  bankInfo: {
    fontSize: 10,
    marginBottom: 3,
  },

  // Transfer details
  transferSection: {
    marginBottom: 20,
  },
  transferTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    paddingBottom: 5,
  },

  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000000',
    borderStyle: 'solid',
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
  },

  col1: {
    width: '20%',
  },
  col2: {
    width: '30%',
  },
  col3: {
    width: '20%',
  },
  col4: {
    width: '30%',
  },

  // Total section
  totalSection: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'flex-end',
  },
  totalBox: {
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'solid',
    padding: 10,
    minWidth: 200,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },

  // Instructions
  instructionsSection: {
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 10,
    lineHeight: 1.5,
  },

  // Signature section
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    width: '100%',
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 9,
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
});

// PDF Document Component for Bank Transfer Order
const OrdrVirementBancairePDF: React.FC<OrdrVirementProps> = ({
  employee,
  calculation,
  period,
  companyInfo = {
    name: 'SOCIETE MAROCAINE SARL',
    address: '123 Boulevard Hassan II, Casablanca',
    ice: 'ICE002589641000021',
    rc: 'RC45621',
    cnss: 'CNSS1258963',
    bank: 'ATTIJARIWAFA BANK',
    accountNumber: '007 810 0001234567890123 45',
  }
}) => {
  const netSalary = calculation.salaireNet || employee.salaire_net || 0;
  const currentDate = new Date();
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Generate reference number
  const referenceNumber = `VIR/${period.annee}/${period.mois.toString().padStart(2, '0')}/${employee.employeeId}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ORDRE DE VIREMENT</Text>
        </View>

        {/* Company Information */}
        <View style={styles.companySection}>
          <Text style={styles.companyName}>{companyInfo.name}</Text>
          <Text style={styles.companyInfo}>{companyInfo.address}</Text>
          <Text style={styles.companyInfo}>ICE: {companyInfo.ice} | RC: {companyInfo.rc}</Text>
        </View>

        {/* Reference and Date */}
        <View style={styles.referenceSection}>
          <View style={styles.referenceBox}>
            <Text style={styles.referenceLabel}>Référence:</Text>
            <Text style={styles.referenceValue}>{referenceNumber}</Text>
          </View>
          <View style={styles.referenceBox}>
            <Text style={styles.referenceLabel}>Date:</Text>
            <Text style={styles.referenceValue}>{formatDate(currentDate)}</Text>
          </View>
        </View>

        {/* Bank Information */}
        <View style={styles.bankSection}>
          <Text style={styles.bankTitle}>Informations Bancaires - Donneur d'ordre</Text>
          <Text style={styles.bankInfo}>Banque: {companyInfo.bank}</Text>
          <Text style={styles.bankInfo}>Compte N°: {companyInfo.accountNumber}</Text>
          <Text style={styles.bankInfo}>Titulaire: {companyInfo.name}</Text>
        </View>

        {/* Transfer Details */}
        <View style={styles.transferSection}>
          <Text style={styles.transferTitle}>Détails du Virement</Text>
        </View>

        {/* Transfer Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <View style={styles.col1}>
              <Text style={styles.tableHeaderText}>Matricule</Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.tableHeaderText}>Bénéficiaire</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.tableHeaderText}>RIB/IBAN</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.tableHeaderText}>Montant (MAD)</Text>
            </View>
          </View>

          {/* Employee Row */}
          <View style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={styles.tableCell}>{employee.employeeId}</Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.tableCell}>{employee.nom} {employee.prenom}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.tableCell}>{employee.rib || 'Non renseigné'}</Text>
            </View>
            <View style={styles.col4}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                {formatMontantMAD(netSalary)}
              </Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>MONTANT TOTAL:</Text>
            <Text style={styles.totalAmount}>{formatMontantMAD(netSalary)}</Text>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Objet du virement:</Text>
          <Text style={styles.instructionsText}>
            Paiement du salaire du mois de {getMoisNom(period.mois)} {period.annee}
          </Text>
          <Text style={styles.instructionsText}>
            Employé: {employee.nom} {employee.prenom} - Matricule: {employee.employeeId}
          </Text>
        </View>

        {/* Additional Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Instructions particulières:</Text>
          <Text style={styles.instructionsText}>
            - Virement à effectuer avant le 5 du mois suivant
          </Text>
          <Text style={styles.instructionsText}>
            - Merci de confirmer l'exécution du virement par email
          </Text>
          <Text style={styles.instructionsText}>
            - En cas de problème, contacter le service comptabilité
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Responsable Financier</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureText}>Signature et Cachet</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Directeur Général</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureText}>Signature et Cachet</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Ce document est généré automatiquement par le système de paie - {companyInfo.name}
        </Text>
      </Page>
    </Document>
  );
};

// Hook to generate and download Bank Transfer Order
export const useOrdrVirementDownload = () => {
  const downloadOrdrVirement = async (
    employee: PayrollEmployee,
    calculation: PayrollCalculation,
    period: PayrollPeriod,
    companyInfo?: any,
    options: {
      saveToDatabase?: boolean;
      downloadFile?: boolean;
      branchId?: string;
    } = { saveToDatabase: true, downloadFile: true }
  ) => {
    try {
      const doc = <OrdrVirementBancairePDF
        employee={employee}
        calculation={calculation}
        period={period}
        companyInfo={companyInfo}
      />;

      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();

      // Convert blob to base64 for database storage
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64String = btoa(String.fromCharCode(...uint8Array));

      let savedDocument = null;

      // Save to database if requested
      if (options.saveToDatabase) {
        try {
          const documentData = {
            documentType: 'ordre_virement',
            title: `Ordre de Virement - ${employee.nom} ${employee.prenom}`,
            description: `Ordre de virement bancaire pour ${getMoisNom(period.mois)} ${period.annee}`,
            employeeId: employee._id,
            employeeName: `${employee.nom} ${employee.prenom}`,
            employeeCode: employee.employeeId,
            periodType: 'monthly',
            periodMonth: period.mois,
            periodYear: period.annee,
            periodLabel: `${getMoisNom(period.mois)} ${period.annee}`,
            pdfBase64: base64String,
            salaryData: {
              netSalary: calculation.salaireNet || 0,
              rib: employee.rib || 'Non renseigné'
            },
            branch: options.branchId,
            company: companyInfo?.name,
            tags: ['ordre_virement', getMoisNom(period.mois), period.annee.toString()],
            category: 'payroll'
          };

          const response = await fetch('/api/payroll/documents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(documentData),
          });

          if (response.ok) {
            const result = await response.json();
            savedDocument = result.data.document;
            console.log('Ordre de virement sauvegardé:', savedDocument.documentId);
          } else {
            console.error('Erreur lors de la sauvegarde');
          }
        } catch (dbError) {
          console.error('Erreur de sauvegarde:', dbError);
        }
      }

      // Download file if requested
      if (options.downloadFile) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ordre-virement-${employee.employeeId}-${getMoisNom(period.mois)}-${period.annee}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      return {
        success: true,
        savedDocument,
        documentId: savedDocument?._id,
        filename: `ordre-virement-${employee.employeeId}-${getMoisNom(period.mois)}-${period.annee}.pdf`
      };
    } catch (error) {
      console.error('Error processing ordre de virement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Function to generate PDF blob for preview
  const generateOrdrVirementBlob = async (
    employee: PayrollEmployee,
    calculation: PayrollCalculation,
    period: PayrollPeriod,
    companyInfo?: any
  ) => {
    try {
      const doc = <OrdrVirementBancairePDF
        employee={employee}
        calculation={calculation}
        period={period}
        companyInfo={companyInfo}
      />;
      const asPdf = pdf(doc);
      return await asPdf.toBlob();
    } catch (error) {
      console.error('Error generating ordre de virement blob:', error);
      return null;
    }
  };

  return { downloadOrdrVirement, generateOrdrVirementBlob };
};

export default OrdrVirementBancairePDF;
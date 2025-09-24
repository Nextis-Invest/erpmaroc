'use client';

import React from 'react';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';
import { formatMontantMAD, getMoisNom } from '@/types/payroll';
import { getCompanyInfoForSIMT } from '@/config/company';

interface SIMTGeneratorProps {
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
    bank?: string;
    accountNumber?: string;
    agencyCode?: string;
    rib?: string;
  };
}

// SIMT File Format Generator for BMCE Bank Morocco
export const generateSIMTFile = ({
  employees,
  period,
  companyInfo = getCompanyInfoForSIMT()
}: SIMTGeneratorProps): string => {
  const lines: string[] = [];
  const currentDate = new Date();

  // Format dates
  const dateYYYYMMDD = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;
  const dateTime = dateYYYYMMDD + currentDate.toTimeString().slice(0,8).replace(/:/g, '');

  // Calculate total amount in centimes (multiply by 100)
  const totalAmount = employees.reduce((sum, emp) => {
    const netSalary = emp.calculation?.salaire_net || emp.employee?.salaire_net || 0;
    return sum + Math.round(netSalary * 100);
  }, 0);

  // Line 1: Header Record (Type 10)
  const headerLine = [
    '10',                                          // Record type
    'VS',                                          // Operation type (Virement de Salaires)
    dateYYYYMMDD.substring(2),                    // Date YYMMDD
    employees.length.toString().padStart(4, '0'),  // Number of beneficiaries
    '    ',                                        // Reserved spaces
    '000',                                         // Reserved
    dateTime,                                      // Execution date and time
    'MAD',                                         // Currency
    employees.length.toString().padStart(3, '0'),  // Number of transactions
    ''.padEnd(700, ' ')                           // Padding to 750 characters
  ].join('');

  lines.push(headerLine.padEnd(750, ' '));

  // Detail Records (Type 30) - One for each employee
  employees.forEach((emp, index) => {
    const netSalary = emp.calculation?.salaire_net || emp.employee?.salaire_net || 0;
    const amountInCentimes = Math.round(netSalary * 100);

    // Clean RIB - remove spaces and ensure 24 digits
    const employeeRIB = (emp.employee.rib || '').replace(/\s/g, '').padEnd(24, '0');

    const detailLine = [
      '30',                                          // Record type
      '02',                                          // Transfer type (02 = salary)
      '00000000000000023',                          // Reserved transaction code
      '000000000000000000000000',                   // Reserved zeros
      'MAD',                                         // Currency
      '2',                                           // Payment mode (2 = transfer)
      amountInCentimes.toString().padStart(17, '0'), // Amount in centimes
      '        ',                                    // Reserved spaces
      dateYYYYMMDD.substring(2,8),                  // Value date YYMMDD
      '                     ',                       // Reserved spaces
      '00',                                          // Reserved
      'S1',                                          // Payment type (S1 = salary)
      '                                ',            // Reserved spaces
      '1',                                           // Constant
      companyInfo.name.padEnd(35, ' ').substring(0, 35), // Company name
      `${emp.employee.nom} ${emp.employee.prenom}`.padEnd(35, ' ').substring(0, 35), // Employee name
      employeeRIB.substring(0, 2),                  // Bank code
      employeeRIB,                                  // Full RIB debit
      employeeRIB,                                  // Full RIB credit
      dateYYYYMMDD,                                 // Processing date
      ''.padEnd(120, ' '),                          // Reserved spaces
      dateTime,                                      // Creation timestamp
      index.toString().padStart(1, '0'),            // Sequence number
      ''.padEnd(250, ' ')                           // Padding
    ].join('');

    lines.push(detailLine.padEnd(750, ' '));
  });

  // Footer Record (Type 11)
  const footerLine = [
    '11',                                          // Record type
    '00000',                                       // Reserved zeros
    employees.length.toString().padStart(6, '0'),  // Total number of records
    totalAmount.toString().padStart(17, '0'),      // Total amount in centimes
    ''.padEnd(720, ' ')                           // Padding to 750 characters
  ].join('');

  lines.push(footerLine.padEnd(750, ' '));

  // Add empty line at the end (as in the sample)
  lines.push('');

  return lines.join('\r\n');
};

// Hook to generate and download SIMT file
export const useSIMTDownload = () => {
  const downloadSIMTFile = async (
    employees: Array<{ employee: PayrollEmployee; calculation: PayrollCalculation }>,
    period: PayrollPeriod,
    companyInfo?: any,
    options: {
      saveToDatabase?: boolean;
      downloadFile?: boolean;
      branchId?: string;
    } = { saveToDatabase: true, downloadFile: true }
  ) => {
    try {
      // Generate SIMT content
      const simtContent = generateSIMTFile({
        employees,
        period,
        companyInfo
      });

      // Convert to base64 for database storage
      const base64String = btoa(unescape(encodeURIComponent(simtContent)));

      let savedDocument = null;

      // Save to database if requested
      if (options.saveToDatabase) {
        try {
          const documentData = {
            documentType: 'ordre_virement_simt',
            title: `Ordre de Virement SIMT - ${getMoisNom(period.mois)} ${period.annee}`,
            description: `Fichier SIMT BMCE pour virement bancaire de ${employees.length} employé(s)`,
            periodType: 'monthly',
            periodMonth: period.mois,
            periodYear: period.annee,
            periodLabel: `${getMoisNom(period.mois)} ${period.annee}`,
            fileContent: base64String,
            fileType: 'smt',
            employeeCount: employees.length,
            totalAmount: employees.reduce((sum, emp) => {
              return sum + (emp.calculation.salaireNet || emp.employee.salaire_net || 0);
            }, 0),
            branch: options.branchId,
            company: companyInfo?.name,
            tags: ['simt', 'virement', 'bmce', getMoisNom(period.mois), period.annee.toString()],
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
            console.log('Fichier SIMT sauvegardé:', savedDocument.documentId);
          } else {
            console.error('Erreur lors de la sauvegarde');
          }
        } catch (dbError) {
          console.error('Erreur de sauvegarde:', dbError);
        }
      }

      // Download file if requested
      if (options.downloadFile) {
        const blob = new Blob([simtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Use .smt extension like BMCE format
        link.download = `VS_${getMoisNom(period.mois)}_${period.annee}.smt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      return {
        success: true,
        savedDocument,
        documentId: savedDocument?._id,
        filename: `VS_${getMoisNom(period.mois)}_${period.annee}.smt`,
        content: simtContent
      };
    } catch (error) {
      console.error('Error generating SIMT file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Function to generate SIMT for single employee (for preview/individual processing)
  const generateSingleEmployeeSIMT = (
    employee: PayrollEmployee,
    calculation: PayrollCalculation,
    period: PayrollPeriod,
    companyInfo?: any
  ) => {
    return generateSIMTFile({
      employees: [{ employee, calculation }],
      period,
      companyInfo
    });
  };

  // Function to preview SIMT content with formatting
  const previewSIMTContent = (
    employees: Array<{ employee: PayrollEmployee; calculation: PayrollCalculation }>,
    period: PayrollPeriod,
    companyInfo?: any
  ) => {
    const content = generateSIMTFile({
      employees,
      period,
      companyInfo
    });

    // Format for display - break down the structure
    const lines = content.split('\r\n');
    const formatted: string[] = [];

    lines.forEach((line, index) => {
      if (line.length === 0) {
        formatted.push('');
        return;
      }

      const recordType = line.substring(0, 2);
      switch(recordType) {
        case '10':
          formatted.push(`[HEADER - Type 10] Virement de Salaires`);
          formatted.push(`  Type: ${line.substring(2, 4)}`);
          formatted.push(`  Date: ${line.substring(4, 10)}`);
          formatted.push(`  Nombre bénéficiaires: ${line.substring(10, 14).trim() || '0'}`);
          formatted.push(`  Devise: ${line.substring(27, 30)}`);
          formatted.push('');
          break;

        case '30':
          const amount = parseInt(line.substring(48, 65)) / 100;
          const benefName = line.substring(151, 186).trim();
          formatted.push(`[DETAIL - Type 30] Bénéficiaire #${index}`);
          formatted.push(`  Nom: ${benefName}`);
          formatted.push(`  Montant: ${amount.toFixed(2)} MAD`);
          formatted.push(`  RIB: ${line.substring(187, 211)}`);
          formatted.push('');
          break;

        case '11':
          const totalAmount = parseInt(line.substring(13, 30)) / 100;
          formatted.push(`[FOOTER - Type 11] Totaux`);
          formatted.push(`  Nombre total: ${line.substring(7, 13).trim()}`);
          formatted.push(`  Montant total: ${totalAmount.toFixed(2)} MAD`);
          formatted.push('');
          break;

        default:
          if (line.trim()) {
            formatted.push(`[DATA] ${line.substring(0, 100)}...`);
          }
      }
    });

    return formatted.join('\n');
  };

  return {
    downloadSIMTFile,
    generateSingleEmployeeSIMT,
    previewSIMTContent
  };
};

export default useSIMTDownload;
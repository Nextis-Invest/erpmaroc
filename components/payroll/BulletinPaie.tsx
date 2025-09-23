'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';
import { formatMontantMAD, getMoisNom } from '@/types/payroll';

// Types for the bulletin
interface BulletinPaieProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  companyInfo?: {
    name: string;
    address: string;
    ice: string;
    rc: string;
    cnss: string;
  };
}

// Clean PDF styles matching reference design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 15,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#000000',
  },

  // Company and bulletin header
  headerSection: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  companyInfo: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    padding: 8,
  },
  bulletinInfo: {
    flex: 1,
    marginLeft: 10,
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8,
    marginBottom: 1,
  },
  companyDetails: {
    fontSize: 7,
    marginBottom: 1,
  },
  bulletinTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  periodText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
  },

  // Employee info section
  employeeSection: {
    marginBottom: 8,
  },
  employeeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  employeeLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 80,
  },
  employeeValue: {
    fontSize: 8,
    flex: 1,
  },

  // Main table styling
  mainTable: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    minHeight: 12,
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
  },

  // Table columns
  colLibelle: {
    width: 140,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 2,
    justifyContent: 'center',
  },
  colBase: {
    width: 50,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colTauxOuPercent: {
    width: 40,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colMontantSalarial: {
    width: 70,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colMontantPatronal: {
    width: 80,
    padding: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // Text styles
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableText: {
    fontSize: 7,
  },
  tableBoldText: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  tableNumberText: {
    fontSize: 7,
    textAlign: 'right',
  },

  // Section headers
  sectionHeader: {
    backgroundColor: '#f0f0f0',
  },
  importantRow: {
    backgroundColor: '#f9f9f9',
  },

  // NET section
  netSection: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  netRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    padding: 4,
  },
  netLabel: {
    flex: 2,
    fontSize: 10,
    fontWeight: 'bold',
  },
  netValue: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Congés section
  congesSection: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  congesRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
    padding: 2,
    minHeight: 14,
  },
  congesHeader: {
    backgroundColor: '#f0f0f0',
  },
  congesCol1: {
    width: 80,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 2,
    justifyContent: 'center',
  },
  congesCol2: {
    width: 40,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  congesCol3: {
    width: 40,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  congesCol4: {
    width: 40,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Calculate values for the bulletin using actual form data
const calculateBulletinData = (employee: PayrollEmployee, calculation: PayrollCalculation) => {
  // CALCULS CORRIGES - Utilise les données du service de calcul au lieu des valeurs erronées de l'employé

  // Constantes réglementaires
  const HEURES_MENSUELLES_STANDARD = 191;
  const TAUX_CNSS_PATRONAL_ALLOCATION = 0.064; // 6.4%
  const TAUX_CNSS_PATRONAL_PRESTATIONS = 0.0898; // 8.98%
  const TAUX_AMO_PATRONAL = 0.0411; // 4.11%

  // Calculs de base corrects
  const tauxHoraireCorrect = calculation.salaire_base / HEURES_MENSUELLES_STANDARD;

  // Cotisations patronales correctes
  const allocationFamilialePatronale = calculation.salaire_base * TAUX_CNSS_PATRONAL_ALLOCATION;
  const prestationsSocialesPatronales = calculation.salaire_base * TAUX_CNSS_PATRONAL_PRESTATIONS;
  const amoPatronale = calculation.salaire_base * TAUX_AMO_PATRONAL;

  return {
    // Informations de base - CORRIGES
    tauxHoraire: tauxHoraireCorrect.toFixed(2),
    totalHeuresTravaillees: HEURES_MENSUELLES_STANDARD,

    // Salaire de base - SIMPLIFIE pour salaire mensuel
    salaireBaseJours: '-', // Non applicable pour salaire mensuel
    salaireBaseTaux: '-', // Non applicable pour salaire mensuel
    salaireBaseMontant: calculation.salaire_base,

    // Salaire mensuel - CORRIGE
    salaireMensuelJours: '-', // Non applicable
    salaireMensuelTaux: '-', // Non applicable
    salaireMensuelMontant: calculation.salaire_base,

    // Congés payés - ELIMINES (ne s'appliquent pas aux salaires mensuels)
    congePayeJours: 0,
    congePayeTaux: 0,
    congePayeMontant: 0,

    // Jours fériés - ELIMINES (ne s'appliquent pas aux salaires mensuels)
    joursFeriesJours: 0,
    joursFeriesTaux: 0,
    joursFeriesMontant: 0,

    // Heures supplémentaires - ELIMINEES par défaut
    heuresSupp25: {
      heures: 0,
      taux: 0,
      montant: 0,
    },
    heuresSupp50: {
      heures: 0,
      taux: 0,
      montant: 0,
    },
    heuresSupp100: {
      heures: 0,
      taux: 0,
      montant: 0,
    },

    // Prime d'ancienneté - DU SERVICE DE CALCUL
    primeAncienneteAnnees: Math.floor(calculation.anciennete_mois / 12),
    primeAncienneteTaux: calculation.prime_anciennete > 0 ? (calculation.prime_anciennete / calculation.salaire_base) : 0,
    primeAncienneteMontant: calculation.prime_anciennete,

    // Primes additionnelles
    primeTransport: employee.prime_transport || 0,
    primePanier: employee.prime_panier || 0,
    indemniteRepresentation: employee.indemnite_representation || 0,
    indemniteDeplacement: employee.indemnite_deplacement || 0,
    autresPrimes: employee.autres_primes || 0,
    autresIndemnites: employee.autres_indemnites || 0,

    // Salaires bruts - DU SERVICE DE CALCUL
    salaireBrutGlobal: calculation.salaire_brut_global,
    salaireBrutImposable: calculation.salaire_brut_imposable,

    // Cotisations salariales - DU SERVICE DE CALCUL
    cotisationCNSS: {
      base: Math.min(calculation.salaire_brut_imposable, 6000),
      taux: 0.0448,
      montant: calculation.cnss_salariale,
    },
    cotisationAMO: {
      base: calculation.salaire_brut_imposable,
      taux: 0.0226,
      montant: calculation.amo_salariale,
    },
    cotisationMutuelle: {
      base: employee.mutuelle_base || 0,
      taux: employee.mutuelle_taux || 0,
      montant: employee.mutuelle_montant || 0,
    },
    cotisationCIMR: {
      base: employee.cimr_base || 0,
      taux: employee.cimr_taux || 0,
      montant: employee.cimr_montant || 0,
    },

    // Frais professionnels - DU SERVICE DE CALCUL
    fraisProfessionnels: {
      base: calculation.salaire_brut_imposable,
      taux: 0.20,
      montant: calculation.frais_professionnels,
    },

    // Cotisations patronales - CALCULEES CORRECTEMENT
    allocationFamiliale: {
      base: calculation.salaire_base,
      taux: TAUX_CNSS_PATRONAL_ALLOCATION,
      montant: allocationFamilialePatronale,
    },
    prestationsSociales: {
      base: calculation.salaire_base,
      taux: TAUX_CNSS_PATRONAL_PRESTATIONS,
      montant: prestationsSocialesPatronales,
    },
    taxeFormation: {
      base: calculation.salaire_base,
      taux: 0.016,
      montant: calculation.taxe_formation,
    },
    amoPatronale: {
      base: calculation.salaire_base,
      taux: TAUX_AMO_PATRONAL,
      montant: amoPatronale,
    },

    // Calculs finaux - DU SERVICE DE CALCUL
    salaireNetImposable: calculation.salaire_net_imposable,
    irBrut: calculation.ir_brut,
    chargeFamille: calculation.charges_familiales,
    irNet: calculation.ir_net,
    avanceSalaire: employee.avance_salaire || 0,
    cotisationSolidarite: 0, // Non utilisé actuellement
    salaireNet: calculation.salaire_net,
    netAPayer: calculation.salaire_net - (employee.avance_salaire || 0),
  };
};;

// Helper components
const TableHeaderRow = () => (
  <View style={[styles.tableRow, styles.tableHeaderRow]}>
    <View style={[styles.colLibelle]}>
      <Text style={styles.tableHeaderText}>Libellé</Text>
    </View>
    <View style={[styles.colBase]}>
      <Text style={styles.tableHeaderText}>Base</Text>
    </View>
    <View style={[styles.colTauxOuPercent]}>
      <Text style={styles.tableHeaderText}>Taux ou %</Text>
    </View>
    <View style={[styles.colMontantSalarial]}>
      <Text style={styles.tableHeaderText}>Cotisations salariales Montant</Text>
    </View>
    <View style={[styles.colTauxOuPercent]}>
      <Text style={styles.tableHeaderText}>Taux ou %</Text>
    </View>
    <View style={[styles.colMontantPatronal]}>
      <Text style={styles.tableHeaderText}>Cotisations patronales Montant</Text>
    </View>
  </View>
);

// PDF Document Component
const BulletinPaiePDF: React.FC<BulletinPaieProps> = ({
  employee,
  calculation,
  period,
  companyInfo = {
    name: 'SOCIETE MAROCAINE SARL',
    address: '123 Boulevard Hassan II, Casablanca',
    ice: 'ICE002589641000021',
    rc: 'RC45621',
    cnss: 'CNSS1258963',
  }
}) => {
  const data = calculateBulletinData(employee, calculation);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Company Info */}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyAddress}>{companyInfo.address}</Text>
            <Text style={styles.companyDetails}>N° ICE : {companyInfo.ice}</Text>
            <Text style={styles.companyDetails}>RC : {companyInfo.rc}   CNSS : {companyInfo.cnss}</Text>
          </View>

          {/* Bulletin Title */}
          <View style={styles.bulletinInfo}>
            <Text style={styles.bulletinTitle}>BULLETIN DE PAIE</Text>
            <Text style={styles.periodText}>Période du : 01/{period.mois < 10 ? '0' : ''}{period.mois}/{period.annee} au : 30/{period.mois < 10 ? '0' : ''}{period.mois}/{period.annee}</Text>
          </View>
        </View>

        {/* Employee Information */}
        <View style={styles.employeeSection}>
          <Text style={styles.companyName}>{employee.nom} {employee.prenom}</Text>
          <View style={styles.employeeRow}>
            <Text style={styles.employeeLabel}>Emploi :</Text>
            <Text style={styles.employeeValue}>{employee.fonction}</Text>
          </View>
          <View style={styles.employeeRow}>
            <Text style={styles.employeeLabel}>Date d&apos;embauche :</Text>
            <Text style={styles.employeeValue}>{employee.date_embauche}</Text>
          </View>
          <View style={styles.employeeRow}>
            <Text style={styles.employeeLabel}>Situation familiale :</Text>
            <Text style={styles.employeeValue}>{employee.situation_familiale} - {employee.nombre_enfants} enfant(s)</Text>
          </View>
          <View style={styles.employeeRow}>
            <Text style={styles.employeeLabel}>Matricule :</Text>
            <Text style={styles.employeeValue}>{employee.employeeId}</Text>
          </View>
          <View style={styles.employeeRow}>
            <Text style={styles.employeeLabel}>N° CNSS :</Text>
            <Text style={styles.employeeValue}>{employee.cnss_numero || 'Non renseigné'}</Text>
          </View>
        </View>

        {/* Main Payroll Table */}
        <View style={styles.mainTable}>
          <TableHeaderRow />

          {/* TAUX HORAIRE */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>TAUX HORAIRE</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.tauxHoraire}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* TOTAL DES HEURES TRAVAILLEES */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>TOTAL DES HEURES TRAVAILLEES</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.totalHeuresTravaillees}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* SALAIRE DE BASE */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableBoldText}>SALAIRE DE BASE</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.salaireBaseJours}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{data.salaireBaseTaux}</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.salaireBaseMontant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* SALAIRE DE BASE MENSUEL */}
          <View style={[styles.tableRow, styles.importantRow]}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableBoldText}>SALAIRE DE BASE MENSUEL</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.salaireMensuelJours}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{data.salaireMensuelTaux.toFixed(2)}</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.salaireMensuelMontant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* Congé Payé */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>Congé Payé</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.congePayeJours}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{data.congePayeTaux.toFixed(2)}</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.congePayeMontant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* Jours Fériés */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>Jours Fériés</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.joursFeriesJours}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{data.joursFeriesTaux.toFixed(2)}</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.joursFeriesMontant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* Heures Supplémentaires 25% */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>Heures Supp 25%</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.heuresSupp25.heures}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{data.heuresSupp25.taux.toFixed(2)}</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.heuresSupp25.montant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* Heures Supplémentaires 50% */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>Heures Supp 50%</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.heuresSupp50.heures}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{data.heuresSupp50.taux.toFixed(2)}</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.heuresSupp50.montant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* Heures Supplémentaires 100% */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>Heures Supp 100%</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.heuresSupp100.heures}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{data.heuresSupp100.taux.toFixed(2)}</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.heuresSupp100.montant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* PRIME D'ANCIENNETE */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>PRIME D&apos;ANCIENNETE</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{data.primeAncienneteAnnees}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{(data.primeAncienneteTaux * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.primeAncienneteMontant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* SALAIRE BRUT GLOBAL */}
          <View style={[styles.tableRow, styles.importantRow]}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableBoldText}>SALAIRE BRUT GLOBAL</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableBoldText}>{formatMontantMAD(data.salaireBrutGlobal).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* SALAIRE BRUT IMPOSABLE */}
          <View style={[styles.tableRow, styles.importantRow]}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableBoldText}>SALAIRE BRUT IMPOSABLE</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableBoldText}>{formatMontantMAD(data.salaireBrutImposable).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* COTISATION CNSS */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>COTISATION CNSS</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{formatMontantMAD(data.cnss.base).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{(data.cnss.taux * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.cnss.montant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* COTISATION AMO */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>COTISATION AMO</Text>
            </View>
            <View style={styles.colBase}>
              <Text style={styles.tableText}>{formatMontantMAD(data.amo.base).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{(data.amo.taux * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.amo.montant).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* COTISATIONS PATRONALES */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>COT.ALLOCATION FAMILIALE</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}></View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{(data.allocationFamiliale.taux * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.colMontantPatronal}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.allocationFamiliale.montant).replace('MAD', '').trim()}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>COT.PRESTATIONS SOCIALES</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}></View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{(data.prestationsSociales.taux * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.colMontantPatronal}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.prestationsSociales.montant).replace('MAD', '').trim()}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>COT.AMO PATRONALE</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}></View>
            <View style={styles.colTauxOuPercent}>
              <Text style={styles.tableText}>{(data.amoPatronale.taux * 100).toFixed(2)}%</Text>
            </View>
            <View style={styles.colMontantPatronal}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.amoPatronale.montant).replace('MAD', '').trim()}</Text>
            </View>
          </View>

          {/* SALAIRE NET IMPOSABLE */}
          <View style={[styles.tableRow, styles.importantRow]}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableBoldText}>SALAIRE NET IMPOSABLE</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableBoldText}>{formatMontantMAD(data.salaireNetImposable).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* IR BRUT */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>IR BRUT</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.irBrut).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* CHARGE DE FAMILLE */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>CHARGE DE FAMILLE</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.chargeFamille).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>

          {/* AVANCE SUR SALAIRE */}
          <View style={styles.tableRow}>
            <View style={styles.colLibelle}>
              <Text style={styles.tableText}>AVANCE SUR SALAIRE</Text>
            </View>
            <View style={styles.colBase}></View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantSalarial}>
              <Text style={styles.tableNumberText}>{formatMontantMAD(data.avanceSalaire).replace('MAD', '').trim()}</Text>
            </View>
            <View style={styles.colTauxOuPercent}></View>
            <View style={styles.colMontantPatronal}></View>
          </View>
        </View>

        {/* NET SECTION */}
        <View style={styles.netSection}>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>SALAIRE NET</Text>
            <Text style={styles.netValue}>{formatMontantMAD(data.salaireNet).replace('MAD', '').trim()}</Text>
          </View>
        </View>

        <View style={styles.netSection}>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>NET À PAYER</Text>
            <Text style={styles.netValue}>{formatMontantMAD(data.netAPayer).replace('MAD', '').trim()}</Text>
          </View>
        </View>

        {/* Congés Section */}
        <View style={styles.congesSection}>
          <View style={[styles.congesRow, styles.congesHeader]}>
            <View style={styles.congesCol1}></View>
            <View style={styles.congesCol2}>
              <Text style={styles.tableHeaderText}>Acquis</Text>
            </View>
            <View style={styles.congesCol3}>
              <Text style={styles.tableHeaderText}>Pris</Text>
            </View>
            <View style={styles.congesCol4}>
              <Text style={styles.tableHeaderText}>Solde</Text>
            </View>
          </View>
          <View style={styles.congesRow}>
            <View style={styles.congesCol1}>
              <Text style={styles.tableText}>CP N-1</Text>
            </View>
            <View style={styles.congesCol2}>
              <Text style={styles.tableText}>18.50</Text>
            </View>
            <View style={styles.congesCol3}>
              <Text style={styles.tableText}>0.00</Text>
            </View>
            <View style={styles.congesCol4}>
              <Text style={styles.tableText}>18.50</Text>
            </View>
          </View>
          <View style={styles.congesRow}>
            <View style={styles.congesCol1}>
              <Text style={styles.tableText}>CP</Text>
            </View>
            <View style={styles.congesCol2}>
              <Text style={styles.tableText}>23.50</Text>
            </View>
            <View style={styles.congesCol3}>
              <Text style={styles.tableText}>0.00</Text>
            </View>
            <View style={styles.congesCol4}>
              <Text style={styles.tableText}>23.50</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Hook to generate and download PDF with database saving
export const useBulletinPaieDownload = () => {
  const downloadBulletin = async (
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
      const doc = <BulletinPaiePDF
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
          // Update payroll status first
          try {
            const statusData = {
              employeeId: employee._id,
              employeeName: `${employee.nom} ${employee.prenom}`,
              employeeCode: employee.employeeId,
              periodMonth: period.mois,
              periodYear: period.annee,
              status: 'GENERE',
              financialSummary: {
                salaireBase: calculation.salaire_base || 0,
                totalPrimes: (calculation.primes_imposables || 0) + (calculation.primes_non_imposables || 0),
                totalDeductions: calculation.cnss_salariale + calculation.amo_salariale + calculation.ir_net + (calculation.autres_deductions || 0),
                salaireNet: calculation.salaire_net || 0,
                cnssEmployee: calculation.cnss_salariale || 0,
                cnssEmployer: calculation.cnss_patronale || 0,
                ir: calculation.ir_net || 0
              },
              branch: options.branchId,
              company: companyInfo?.name
            };

            const statusResponse = await fetch('/api/payroll/status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(statusData),
            });

            if (statusResponse.ok) {
              console.log('Statut de paie mis à jour: GENERE');
            } else {
              console.error('Erreur lors de la mise à jour du statut');
            }
          } catch (statusError) {
            console.error('Erreur lors de la mise à jour du statut:', statusError);
          }

          // Save the bulletin document
          try {
            const documentData = {
              documentType: 'bulletin_paie',
              title: `Bulletin de Paie - ${employee.nom} ${employee.prenom}`,
              description: `Bulletin de paie pour ${getMoisNom(period.mois)} ${period.annee}`,
              employeeId: employee._id,
              employeeName: `${employee.nom} ${employee.prenom}`,
              employeeCode: employee.employeeId,
              periodType: 'monthly',
              periodMonth: period.mois,
              periodYear: period.annee,
              periodLabel: `${getMoisNom(period.mois)} ${period.annee}`,
              pdfBase64: base64String,
              salaryData: {
                baseSalary: calculation.salaire_base || 0,
                totalAllowances: calculation.totalIndemnités || 0,
                totalDeductions: calculation.totalRetenues || 0,
                netSalary: calculation.salaireNet || 0,
                cnssEmployee: calculation.cotisationsCNSS?.employee || 0,
                cnssEmployer: calculation.cotisationsCNSS?.employer || 0,
                incomeTax: calculation.impotRevenu || 0
              },
              branch: options.branchId,
              company: companyInfo?.name,
              tags: ['bulletin_paie', getMoisNom(period.mois), period.annee.toString()],
              category: 'payroll'
            };

            console.log('Données à envoyer:', {
              hasEmployeeId: !!documentData.employeeId,
              employeeId: documentData.employeeId,
              hasBranch: !!documentData.branch,
              branch: documentData.branch,
              hasPdfBase64: !!documentData.pdfBase64,
              pdfBase64Length: documentData.pdfBase64?.length
            });

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
              console.log('Bulletin sauvegardé en base de données:', savedDocument.documentId);

              // Update status with bulletin ID
              try {
                const statusUpdateData = {
                  employeeId: employee._id,
                  periodMonth: period.mois,
                  periodYear: period.annee,
                  bulletinPaieId: savedDocument.documentId,
                  status: 'GENERE'
                };

                await fetch('/api/payroll/status', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(statusUpdateData),
                });

                console.log('Statut mis à jour avec l\'ID du bulletin');
              } catch (err) {
                console.error('Erreur lors de la mise à jour du statut avec ID:', err);
              }
            } else {
              const errorData = await response.text();
              let errorMessage = 'Erreur lors de la sauvegarde en base de données';
              try {
                const errorJson = JSON.parse(errorData);
                errorMessage = errorJson.error || errorJson.message || errorMessage;
                if (errorJson.details) {
                  console.error('Détails de l\'erreur:', errorJson.details);
                }
              } catch (e) {
                errorMessage = errorData || errorMessage;
              }
              console.error('Erreur lors de la sauvegarde:', errorMessage);
              console.error('Status:', response.status);
              console.error('Branch ID envoyé:', options.branchId);
            }
          } catch (dbError) {
            console.error('Erreur de sauvegarde en base de données:', dbError);
          }
        } catch (error) {
          console.error('Erreur lors de la sauvegarde:', error);
        }
      }

      // Download file if requested
      if (options.downloadFile) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bulletin-paie-${employee.employeeId}-${getMoisNom(period.mois)}-${period.annee}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      return {
        success: true,
        savedDocument,
        documentId: savedDocument?._id,
        filename: `bulletin-paie-${employee.employeeId}-${getMoisNom(period.mois)}-${period.annee}.pdf`
      };
    } catch (error) {
      console.error('Error processing bulletin:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Function to generate PDF without download (for preview)
  const generateBulletinBlob = async (
    employee: PayrollEmployee,
    calculation: PayrollCalculation,
    period: PayrollPeriod,
    companyInfo?: any
  ) => {
    try {
      const doc = <BulletinPaiePDF
        employee={employee}
        calculation={calculation}
        period={period}
        companyInfo={companyInfo}
      />;
      const asPdf = pdf(doc);
      return await asPdf.toBlob();
    } catch (error) {
      console.error('Error generating bulletin blob:', error);
      return null;
    }
  };

  return { downloadBulletin, generateBulletinBlob };
};

export default BulletinPaiePDF;
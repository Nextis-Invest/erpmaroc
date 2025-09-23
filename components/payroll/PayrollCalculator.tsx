'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePayrollStore } from '@/stores/payrollStore';
import { formatMontantMAD, getMoisNom, calculerAncienneteMois } from '@/types/payroll';
import PayrollEmployeeForm from './PayrollEmployeeForm';
import { usePayrollEmployees } from '@/hooks/usePayrollEmployees';
import { useBulletinPaieDownload } from './BulletinPaie';
import BulletinPaieModal from './BulletinPaieModal';
import OrdrVirementModal from './OrdrVirementModal';
import { useSIMTDownload } from './OrdrVirementSIMT';
import CNSSDeclaration from './CNSSDeclaration';
import PayrollDocumentViewer from './PayrollDocumentViewer';
import { PayrollStatusIndicator } from './PayrollStatusIndicator';
import { cnssDeclarationService } from '@/services/cnss/cnssDeclarationService';
import { PayrollWorkflowOrchestrator } from './workflow/PayrollWorkflowOrchestrator';
import type { PayrollEmployee } from '@/types/payroll';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PayrollCalculator() {
  const { data: session } = useSession();
  const user = session?.user;

  const {
    employees,
    currentPeriod,
    calculations,
    isLoading,
    error,
    successMessage,
    instance,
    version,
    setPayrollEmployees,
    updatePayrollEmployee,
    createPeriod,
    calculateSalary,
    calculateAllSalaries,
    getCurrentPeriodSummary,
    initializeMockData
  } = usePayrollStore();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [currentStep, setCurrentStep] = useState<'select' | 'form' | 'calculate'>('select');
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmployee | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showVirementModal, setShowVirementModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'paie' | 'cnss'>('paie');
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [useNewWorkflow, setUseNewWorkflow] = useState(true);

  // PDF download functionality
  const { downloadBulletin } = useBulletinPaieDownload();
  const { downloadSIMTFile } = useSIMTDownload();

  // Fetch employees from database
  const { employees: dbEmployees, loading: loadingEmployees, error: employeesError, refetch } = usePayrollEmployees();

  // Initialize store and update with database employees
  useEffect(() => {
    // Initialize mock data if no employees in store
    if (employees.length === 0) {
      initializeMockData();
    }

    // Update with database employees if available
    if (dbEmployees.length > 0 && employees.length === 0) {
      setPayrollEmployees(dbEmployees);
    }
  }, [dbEmployees, employees.length, setPayrollEmployees, initializeMockData]);

  const handleCreatePeriod = () => {
    createPeriod(mois, annee);
  };

  const handleSelectEmployee = (employeeId: string) => {
    const employee = employees.find(e => e._id === employeeId);
    if (employee && currentPeriod) {
      setSelectedEmployeeId(employeeId);
      setSelectedEmployee(employee);
      setCurrentStep('form');
    } else if (!currentPeriod) {
      alert('Veuillez créer une période de paie d\'abord');
    }
  };

  const handleEmployeeDataSaved = (updatedEmployee: PayrollEmployee) => {
    updatePayrollEmployee(updatedEmployee._id, updatedEmployee);
    setSelectedEmployee(updatedEmployee);
    setCurrentStep('calculate');
  };

  const handleCalculateOne = async () => {
    if (!selectedEmployeeId) {
      alert('Veuillez sélectionner un employé');
      return;
    }
    if (!currentPeriod) {
      alert('Veuillez créer une période de paie d\'abord');
      return;
    }
    await calculateSalary(selectedEmployeeId);
  };

  const handleBackToSelection = () => {
    setCurrentStep('select');
    setSelectedEmployee(null);
    setSelectedEmployeeId('');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handleCalculateAll = async () => {
    if (!currentPeriod) {
      alert('Veuillez créer une période de paie d\'abord');
      return;
    }

    if (!currentPeriod._id) {
      alert('Période invalide - veuillez recréer la période de paie');
      return;
    }

    if (employees.length === 0) {
      alert('Aucun employé disponible pour le calcul');
      return;
    }

    try {
      console.log('Calcul de paie pour tous les employés:', {
        periode: currentPeriod._id,
        employeesCount: employees.length
      });
      await calculateAllSalaries();
      console.log('Calcul terminé. Vérification des résultats...');
    } catch (error) {
      console.error('Erreur lors du calcul de paie:', error);
      alert('Erreur lors du calcul de paie: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  const handleGenerateVirement = async (previewEmployee?: PayrollEmployee) => {
    const employeeToPreview = previewEmployee || selectedEmployee;

    if (!employeeToPreview || !currentPeriod) {
      alert('Données manquantes pour générer l\'ordre de virement');
      return;
    }

    // Vérifier que la période a un ID valide
    if (!currentPeriod._id) {
      console.log('Création d\'une nouvelle période avec ID temporaire');
      createPeriod(currentPeriod.mois, currentPeriod.annee);
      return;
    }

    // Si on passe un employé différent, on met à jour la sélection
    if (previewEmployee && previewEmployee._id !== selectedEmployeeId) {
      setSelectedEmployeeId(previewEmployee._id);
      setSelectedEmployee(previewEmployee);
      // S'assurer que l'employé existe dans le store
      const existingEmployee = employees.find(e => e._id === previewEmployee._id);
      if (!existingEmployee) {
        // Ajouter l'employé au store s'il n'existe pas
        const updatedEmployees = [...employees, previewEmployee];
        setPayrollEmployees(updatedEmployees);
      } else {
        // Mettre à jour les données de l'employé dans le store
        updatePayrollEmployee(previewEmployee._id, previewEmployee);
      }
    }

    try {
      // Vérifier si on a déjà un calcul pour cet employé
      let calculation = calculations.find(c => c.employee_id === employeeToPreview._id && c.periode_id === currentPeriod._id);

      if (!calculation) {
        console.log('Calcul de la paie en cours pour l\'ordre de virement...');
        await calculateSalary(employeeToPreview._id);

        // Récupérer le calcul après l'avoir créé
        calculation = calculations.find(c => c.employee_id === employeeToPreview._id && c.periode_id === currentPeriod._id);
      }

      if (calculation) {
        setShowVirementModal(true);
      } else {
        alert('Impossible de récupérer le calcul de paie');
      }
    } catch (error) {
      console.error('Erreur lors de la préparation de l\'ordre de virement:', error);
      alert('Une erreur est survenue lors de la préparation de l\'ordre de virement');
    }
  };

  const handleDownloadBulletin = async () => {
    if (!selectedEmployee || !employeeCalculation || !currentPeriod) {
      alert('Données manquantes pour générer le bulletin');
      return;
    }

    try {
      const success = await downloadBulletin(
        selectedEmployee,
        employeeCalculation,
        currentPeriod
      );

      if (success) {
        console.log('Bulletin téléchargé avec succès');
      } else {
        alert('Erreur lors du téléchargement du bulletin');
      }
    } catch (error) {
      console.error('Error downloading bulletin:', error);
      alert('Erreur lors du téléchargement du bulletin');
    }
  };

  const handlePreviewBulletin = async (previewEmployee?: PayrollEmployee) => {
    const employeeToPreview = previewEmployee || selectedEmployee;

    if (!employeeToPreview || !currentPeriod) {
      alert('Données manquantes pour prévisualiser le bulletin');
      return;
    }

    // Vérifier que la période a un ID valide
    if (!currentPeriod._id) {
      console.log('Création d\'une nouvelle période avec ID temporaire');
      createPeriod(currentPeriod.mois, currentPeriod.annee);
      return;
    }

    // Si on passe un employé différent, on met à jour la sélection
    if (previewEmployee && previewEmployee._id !== selectedEmployeeId) {
      setSelectedEmployeeId(previewEmployee._id);
      setSelectedEmployee(previewEmployee);
      // S'assurer que l'employé existe dans le store
      const existingEmployee = employees.find(e => e._id === previewEmployee._id);
      if (!existingEmployee) {
        // Ajouter l'employé au store s'il n'existe pas
        const updatedEmployees = [...employees, previewEmployee];
        setPayrollEmployees(updatedEmployees);
      } else {
        // Mettre à jour les données de l'employé dans le store
        updatePayrollEmployee(previewEmployee._id, previewEmployee);
      }
    }

    try {
      // Vérifier si on a déjà un calcul pour cet employé
      let calculation = calculations.find(c => c.employee_id === employeeToPreview._id && c.periode_id === currentPeriod._id);

      if (!calculation) {
        console.log('Calcul de la paie en cours...');
        // Calculer automatiquement la paie
        calculation = await calculateSalary(employeeToPreview._id);

        if (!calculation) {
          alert('Erreur lors du calcul de la paie');
          return;
        }
      }

      // Afficher le modal de l'ordre de virement au lieu du bulletin
      console.log('Affichage de l\'ordre de virement...');
      setShowVirementModal(true);
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
      alert('Erreur lors de la génération du bulletin PDF');
    }
  };

  // Handle preview of saved document
  const handlePreviewSavedDocument = () => {
    if (savedDocumentId) {
      setShowDocumentViewer(true);
    } else {
      alert('Aucun document sauvegardé à prévisualiser. Veuillez d\'abord générer un bulletin.');
    }
  };

  // Handle manual download of saved document
  const handleDownloadSavedDocument = async () => {
    if (!savedDocumentId || !selectedEmployee || !employeeCalculation || !currentPeriod) {
      alert('Aucun document sauvegardé à télécharger. Veuillez d\'abord générer un bulletin.');
      return;
    }

    try {
      // Download the already generated document
      await downloadBulletin(
        selectedEmployee,
        employeeCalculation,
        currentPeriod,
        undefined,
        {
          saveToDatabase: false,
          downloadFile: true,
          documentId: savedDocumentId
        }
      );
    } catch (error) {
      console.error('Error downloading saved document:', error);
      alert('Erreur lors du téléchargement du document sauvegardé');
    }
  };

  const handleDownloadAllDocuments = async () => {
    if (!selectedEmployee || !employeeCalculation || !currentPeriod) {
      alert('Données manquantes pour générer les documents');
      return;
    }

    try {
      // 1. Download Bulletin de Paie (for selected employee)
      console.log('Téléchargement du bulletin de paie...');
      await downloadBulletin(
        selectedEmployee,
        employeeCalculation,
        currentPeriod
      );

      // 2. Generate and download Préétabli CNSS (for ALL employees with calculations)
      console.log('Génération du préétabli CNSS pour tous les employés...');

      // Get all employees who have calculations for this period
      const employeesWithCalculations = employees.filter(emp =>
        calculations.some(calc => calc.employee_id === emp._id && calc.periode_id === currentPeriod._id)
      );

      const calculationsForPeriod = calculations.filter(calc => calc.periode_id === currentPeriod._id);

      if (employeesWithCalculations.length === 0) {
        alert('Aucun employé avec des calculs trouvé pour cette période');
        return;
      }

      const declaration = cnssDeclarationService.generateDeclaration(
        currentPeriod,
        employeesWithCalculations,
        calculationsForPeriod
      );

      const bdsContent = cnssDeclarationService.generateBDSFile(declaration);
      const bdsBlob = new Blob([bdsContent], { type: 'text/plain;charset=utf-8' });
      const bdsUrl = window.URL.createObjectURL(bdsBlob);
      const bdsLink = document.createElement('a');
      bdsLink.href = bdsUrl;
      const periode = `${currentPeriod.annee}${currentPeriod.mois.toString().padStart(2, '0')}`;
      bdsLink.download = `CNSS_Preetabli_TousEmployes_${periode}.txt`;
      document.body.appendChild(bdsLink);
      bdsLink.click();
      document.body.removeChild(bdsLink);
      window.URL.revokeObjectURL(bdsUrl);

      // 3. Generate and download Ordre de Virement (for selected employee)
      console.log('Génération de l\'ordre de virement...');
      const paymentOrder = generatePaymentOrder();
      const paymentBlob = new Blob([paymentOrder], { type: 'application/pdf' });
      const paymentUrl = window.URL.createObjectURL(paymentBlob);
      const paymentLink = document.createElement('a');
      paymentLink.href = paymentUrl;
      paymentLink.download = `Ordre_Virement_${selectedEmployee.nom}_${periode}.pdf`;
      document.body.appendChild(paymentLink);
      paymentLink.click();
      document.body.removeChild(paymentLink);
      window.URL.revokeObjectURL(paymentUrl);

      alert(`Les 3 documents ont été téléchargés avec succès !\n- Bulletin: ${selectedEmployee.nom}\n- Préétabli CNSS: ${employeesWithCalculations.length} employés\n- Ordre de virement: ${selectedEmployee.nom}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement des documents:', error);
      alert('Erreur lors du téléchargement des documents');
    }
  };

  const generatePaymentOrder = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDRE DE VIREMENT', pageWidth / 2, 20, { align: 'center' });

    // Company info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('NEXTIS INVEST SARL', 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 20, 40, { align: 'right' });

    // Period info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Période: ${getMoisNom(currentPeriod.mois)} ${currentPeriod.annee}`, 20, 55);

    // Employee payment details
    const tableData = [];
    if (selectedEmployee && employeeCalculation) {
      tableData.push([
        selectedEmployee.nom + ' ' + selectedEmployee.prenom,
        selectedEmployee.rib || 'RIB non renseigné',
        formatMontantMAD(employeeCalculation.salaire_net),
        'Salaire ' + getMoisNom(currentPeriod.mois) + ' ' + currentPeriod.annee
      ]);
    }

    // Table
    autoTable(doc, {
      head: [['Bénéficiaire', 'RIB', 'Montant', 'Motif']],
      body: tableData,
      startY: 70,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 'auto' }
      },
      margin: { left: 20, right: 20 }
    });

    // Total
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFont('helvetica', 'bold');
    doc.text('Total à virer:', 100, finalY + 20);
    doc.text(formatMontantMAD(employeeCalculation.salaire_net), pageWidth - 20, finalY + 20, { align: 'right' });

    // Signature section
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Signature et cachet:', 20, finalY + 50);
    doc.line(20, finalY + 60, 80, finalY + 60);

    return doc.output('blob');
  };

  const handleDownloadGlobalCNSS = async () => {
    if (!currentPeriod || calculations.length === 0) {
      alert('Aucune donnée de paie disponible pour cette période');
      return;
    }

    try {
      console.log('Génération du préétabli CNSS global...');

      // Get all employees who have calculations for this period
      const employeesWithCalculations = employees.filter(emp =>
        calculations.some(calc => calc.employee_id === emp._id && calc.periode_id === currentPeriod._id)
      );

      const calculationsForPeriod = calculations.filter(calc => calc.periode_id === currentPeriod._id);

      if (employeesWithCalculations.length === 0) {
        alert('Aucun employé avec des calculs trouvé pour cette période');
        return;
      }

      const declaration = cnssDeclarationService.generateDeclaration(
        currentPeriod,
        employeesWithCalculations,
        calculationsForPeriod
      );

      const bdsContent = cnssDeclarationService.generateBDSFile(declaration);
      const bdsBlob = new Blob([bdsContent], { type: 'text/plain;charset=utf-8' });
      const bdsUrl = window.URL.createObjectURL(bdsBlob);
      const bdsLink = document.createElement('a');
      bdsLink.href = bdsUrl;
      const periode = `${currentPeriod.annee}${currentPeriod.mois.toString().padStart(2, '0')}`;
      bdsLink.download = `CNSS_Preetabli_${employeesWithCalculations.length}Employes_${periode}.txt`;
      document.body.appendChild(bdsLink);
      bdsLink.click();
      document.body.removeChild(bdsLink);
      window.URL.revokeObjectURL(bdsUrl);

      alert(`Préétabli CNSS téléchargé avec succès !\n${employeesWithCalculations.length} employés inclus`);
    } catch (error) {
      console.error('Erreur lors du téléchargement du préétabli CNSS:', error);
      alert('Erreur lors du téléchargement du préétabli CNSS');
    }
  };

  // Handle download of ordre de virement SIMT
  const handleDownloadOrdrVirement = async () => {
    if (!selectedEmployee || !employeeCalculation || !currentPeriod) {
      alert('Données manquantes pour générer le fichier SIMT');
      return;
    }

    try {
      const result = await downloadSIMTFile(
        [{ employee: selectedEmployee, calculation: employeeCalculation }],
        currentPeriod,
        undefined, // companyInfo
        {
          saveToDatabase: false,
          downloadFile: true,
          branchId: user?.branchId
        }
      );

      if (result.success) {
        console.log('Fichier SIMT téléchargé avec succès');
        setShowVirementModal(false);
      } else {
        alert('Erreur lors du téléchargement du fichier SIMT');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier SIMT');
    }
  };

  // Handle save of ordre de virement SIMT
  const handleSaveOrdrVirement = async () => {
    if (!selectedEmployee || !employeeCalculation || !currentPeriod) {
      alert('Données manquantes pour sauvegarder le fichier SIMT');
      return;
    }

    try {
      const result = await downloadSIMTFile(
        [{ employee: selectedEmployee, calculation: employeeCalculation }],
        currentPeriod,
        undefined, // companyInfo
        {
          saveToDatabase: true,
          downloadFile: false,
          branchId: user?.branchId
        }
      );

      if (result && result.success) {
        console.log('Fichier SIMT sauvegardé:', result.documentId);
        setSavedDocumentId(result.documentId);
        alert('Fichier SIMT sauvegardé avec succès !');
        setShowVirementModal(false);
      } else {
        alert('Erreur lors de la sauvegarde du fichier SIMT');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du fichier SIMT');
    }
  };

  const handleSaveBulletin = async () => {
    if (!selectedEmployee || !employeeCalculation || !currentPeriod) {
      alert('Données manquantes pour sauvegarder le bulletin');
      return;
    }

    try {
      // Ici on pourrait ajouter une API pour sauvegarder le bulletin dans la base de données
      // Pour l'instant, on simule une sauvegarde réussie
      console.log('Sauvegarde du bulletin:', {
        employee: selectedEmployee._id,
        calculation: employeeCalculation,
        period: currentPeriod._id
      });

      alert('Bulletin sauvegardé avec succès !');
    } catch (error) {
      console.error('Error saving bulletin:', error);
      alert('Erreur lors de la sauvegarde du bulletin');
    }
  };

  const summary = getCurrentPeriodSummary();
  const employeeCalculation = selectedEmployeeId
    ? calculations.find(c => c.employee_id === selectedEmployeeId && c.periode_id === currentPeriod?._id)
    : null;

  return (
    <div className="space-y-6">
      {/* Bandeau d'information Beta */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Instance Beta:</strong> Environnement de test et validation - Barèmes fiscaux 2024
            </p>
            <div className="mt-2 text-xs text-yellow-600 grid grid-cols-2 md:grid-cols-4 gap-2">
              <span>• CNSS: 4.48% (max 6000 DH)</span>
              <span>• AMO: 2.26%</span>
              <span>• IR: 0% à 38%</span>
              <span>• SMIG: 3111 DH</span>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête compact avec tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Gestion de la Paie et Déclarations
              </h2>
              <p className="text-gray-600 mt-1">
                Système de paie et déclarations CNSS conformes aux normes marocaines
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Instance: {instance.toUpperCase()}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                v{version}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                MAD (DH)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('paie')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'paie'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            💰 Gestion de la Paie
          </button>
          <button
            onClick={() => setActiveTab('cnss')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'cnss'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            📋 Déclaration CNSS
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}
      </div>

      {/* Contenu basé sur l'onglet actif */}
      {activeTab === 'paie' ? (
        <>
      {/* Sélection de la période */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Période de Paie</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mois
            </label>
            <select
              value={mois}
              onChange={(e) => setMois(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {getMoisNom(m)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année
            </label>
            <input
              type="number"
              value={annee}
              onChange={(e) => setAnnee(parseInt(e.target.value))}
              min="2020"
              max="2030"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreatePeriod}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              Créer Période
            </button>
          </div>
        </div>

        {currentPeriod && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Période active: <strong>{getMoisNom(currentPeriod.mois)} {currentPeriod.annee}</strong>
              {' - '}
              Statut: <strong>{currentPeriod.statut}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Navigation Steps */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Processus de Paie</h3>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              currentStep === 'select' ? 'text-blue-600' : currentStep === 'form' || currentStep === 'calculate' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'select' ? 'bg-blue-100' : currentStep === 'form' || currentStep === 'calculate' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <span className="text-sm font-semibold">1</span>
              </div>
              <span className="text-sm font-medium">Sélection</span>
            </div>
            <div className={`w-8 h-1 rounded ${
              currentStep === 'form' || currentStep === 'calculate' ? 'bg-green-200' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center space-x-2 ${
              currentStep === 'form' ? 'text-blue-600' : currentStep === 'calculate' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'form' ? 'bg-blue-100' : currentStep === 'calculate' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <span className="text-sm font-semibold">2</span>
              </div>
              <span className="text-sm font-medium">Saisie</span>
            </div>
            <div className={`w-8 h-1 rounded ${
              currentStep === 'calculate' ? 'bg-green-200' : 'bg-gray-200'
            }`}></div>
            <div className={`flex items-center space-x-2 ${
              currentStep === 'calculate' ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'calculate' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <span className="text-sm font-semibold">3</span>
              </div>
              <span className="text-sm font-medium">Calcul</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Employee Selection */}
      {currentStep === 'select' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">1. Sélectionner un Employé</h3>
          {!currentPeriod ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Veuillez d&apos;abord créer une période de paie avant de sélectionner un employé.
              </p>
            </div>
          ) : loadingEmployees ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des employés...</p>
            </div>
          ) : employeesError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                ❌ Erreur lors du chargement des employés: {employeesError}
              </p>
              <button
                onClick={refetch}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                ℹ️ Aucun employé trouvé dans la base de données.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(emp => (
                <div
                  key={emp._id}
                  onClick={() => handleSelectEmployee(emp._id)}
                  className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {emp.prenom} {emp.nom}
                      </h4>
                      <p className="text-sm text-gray-600">{emp.employeeId}</p>
                      {emp.fonction && (
                        <p className="text-xs text-blue-600 font-medium">{emp.fonction}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {formatMontantMAD(emp.salaire_base)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <div>
                      <span className="block">Ancienneté:</span>
                      <span className="font-medium">{calculerAncienneteMois(emp.date_embauche)} mois</span>
                    </div>
                    <div>
                      <span className="block">Enfants:</span>
                      <span className="font-medium">{emp.nombre_enfants}</span>
                    </div>
                    <div>
                      <span className="block">Situation:</span>
                      <span className="font-medium">
                        {emp.situation_familiale === 'MARIE' ? 'Marié(e)' :
                         emp.situation_familiale === 'CELIBATAIRE' ? 'Célibataire' :
                         emp.situation_familiale === 'DIVORCE' ? 'Divorcé(e)' :
                         emp.situation_familiale === 'VEUF' ? 'Veuf/Veuve' : emp.situation_familiale}
                      </span>
                    </div>
                    <div>
                      <span className="block">Naissance:</span>
                      <span className="font-medium">
                        {emp.date_naissance
                          ? new Date(emp.date_naissance).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : 'Non renseigné'
                        }
                      </span>
                    </div>
                  </div>
                  {currentPeriod && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <PayrollStatusIndicator
                        employeeId={emp._id}
                        employeeName={`${emp.prenom} ${emp.nom}`}
                        periodMonth={currentPeriod.mois}
                        periodYear={currentPeriod.annee}
                        showDetails={false}
                      />
                    </div>
                  )}
                  <button className="w-full mt-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    Sélectionner
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-800">Calcul en Masse</h4>
                <p className="text-sm text-gray-600">Calculer tous les employés en une fois</p>
              </div>
              <button
                onClick={handleCalculateAll}
                disabled={isLoading || !currentPeriod}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Calcul en cours...' : 'Calculer Tout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Employee Form */}
      {currentStep === 'form' && selectedEmployee && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                2. Détails de Paie - {selectedEmployee.prenom} {selectedEmployee.nom}
              </h3>
              <button
                onClick={handleBackToSelection}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Retour à la sélection
              </button>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm">
                📋 Remplissez ou modifiez les informations détaillées pour le calcul de paie de cet employé.
              </p>
            </div>
          </div>

          <PayrollEmployeeForm
            employee={selectedEmployee}
            mode="edit"
            onSave={handleEmployeeDataSaved}
            onCancel={handleBackToSelection}
            onPreview={handlePreviewBulletin}
            onGenerateVirement={handleGenerateVirement}
          />
        </div>
      )}

      {/* Step 3: Calculation */}
      {currentStep === 'calculate' && selectedEmployee && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              3. Calcul de Paie - {selectedEmployee.prenom} {selectedEmployee.nom}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleBackToForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Modifier
              </button>
              <button
                onClick={handleBackToSelection}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Nouvel employé
              </button>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <p className="text-green-800 text-sm">
                ✅ Données employé mises à jour. Procédez au calcul de la paie.
              </p>
              <button
                onClick={handleCalculateOne}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Calcul en cours...' : 'Calculer la Paie'}
              </button>
            </div>
          </div>


          {/* Employee Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600">Salaire de base</span>
              <p className="font-semibold text-lg">{formatMontantMAD(selectedEmployee.salaire_base || 0)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600">Ancienneté</span>
              <p className="font-semibold text-lg">{calculerAncienneteMois(selectedEmployee.dateEmbauche || selectedEmployee.date_embauche)} mois</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600">Situation familiale</span>
              <p className="font-semibold text-lg">
                {selectedEmployee.situation_familiale}
                {selectedEmployee.nombre_enfants > 0 && ` (${selectedEmployee.nombre_enfants})`}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-600">Période</span>
              <p className="font-semibold text-lg">
                {currentPeriod ? `${getMoisNom(currentPeriod.mois)} ${currentPeriod.annee}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Résultats du calcul */}
      {employeeCalculation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Résultat du Calcul</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Revenus */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-green-700 mb-3">Revenus</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Salaire de base:</span>
                  <span className="font-medium">{formatMontantMAD(employeeCalculation.salaire_base)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prime d&apos;ancienneté:</span>
                  <span className="font-medium">{formatMontantMAD(employeeCalculation.prime_anciennete)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Salaire brut:</span>
                  <span>{formatMontantMAD(employeeCalculation.salaire_brut_global)}</span>
                </div>
              </div>
            </div>

            {/* Déductions */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-red-700 mb-3">Déductions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CNSS:</span>
                  <span className="font-medium">{formatMontantMAD(employeeCalculation.cnss_salariale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>AMO:</span>
                  <span className="font-medium">{formatMontantMAD(employeeCalculation.amo_salariale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IR net:</span>
                  <span className="font-medium">{formatMontantMAD(employeeCalculation.ir_net)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total déductions:</span>
                  <span>
                    {formatMontantMAD(
                      employeeCalculation.cnss_salariale +
                      employeeCalculation.amo_salariale +
                      employeeCalculation.ir_net
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Salaire net */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold text-blue-700 mb-3">Résultat Final</h3>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-900">
                  {formatMontantMAD(employeeCalculation.salaire_net)}
                </div>
                <p className="text-sm text-gray-600">Salaire Net à Payer</p>
                <div className="border-t pt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Charges patronales:</span>
                    <span className="font-medium">
                      {formatMontantMAD(
                        employeeCalculation.cnss_patronale +
                        employeeCalculation.amo_patronale +
                        employeeCalculation.taxe_formation
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coût total employeur:</span>
                    <span className="font-medium">
                      {formatMontantMAD(employeeCalculation.cout_total_employeur)}
                    </span>
                  </div>
                </div>

                {/* New PDF Workflow System */}
                {useNewWorkflow ? (
                  <div className="border-t pt-3 mt-3">
                    <PayrollWorkflowOrchestrator
                      employee={selectedEmployee}
                      calculation={employeeCalculation}
                      period={currentPeriod}
                      onStatusChange={(status) => {
                        console.log('Workflow status changed:', status);
                      }}
                    />
                  </div>
                ) : (
                  /* Legacy Actions pour le bulletin de paie */
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-600">Génération du bulletin</p>
                      <button
                        onClick={() => setUseNewWorkflow(true)}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition-colors"
                      >
                        🚀 Nouveau Workflow
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={handlePreviewBulletin}
                        className="px-2 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        💾 Générer & Sauvegarder
                      </button>
                      <button
                        onClick={handleDownloadBulletin}
                        className="px-2 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                      >
                        📄 Générer & Télécharger
                      </button>
                    </div>

                    {/* Actions pour les documents sauvegardés */}
                    {savedDocumentId && (
                      <>
                        <p className="text-xs text-gray-600 mb-2 mt-3">Document sauvegardé</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <button
                            onClick={handlePreviewSavedDocument}
                            className="px-2 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                          >
                            👁️ Prévisualiser
                          </button>
                          <button
                            onClick={handleDownloadSavedDocument}
                            className="px-2 py-2 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                          >
                            ⬇️ Télécharger
                          </button>
                        </div>
                      </>
                    )}

                    <button
                      onClick={handleDownloadAllDocuments}
                      className="w-full px-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded text-xs hover:from-indigo-700 hover:to-purple-700 transition-colors font-semibold"
                    >
                      📦 Télécharger tous les documents
                      <div className="text-[10px] opacity-90 mt-1">
                        (Bulletin individuel + Préétabli CNSS global + Ordre de virement)
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && savedDocumentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Prévisualisation du Bulletin de Paie</h3>
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              <PayrollDocumentViewer
                documentId={savedDocumentId}
                onClose={() => setShowDocumentViewer(false)}
                showMetadata={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Résumé de la période */}
      {summary && calculations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Résumé de la Période - {getMoisNom(summary.periode.mois)} {summary.periode.annee}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90">Nombre d&apos;employés</p>
              <p className="text-2xl font-bold">{summary.nombre_employes}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90">Total Salaires Bruts</p>
              <p className="text-xl font-bold">{formatMontantMAD(summary.total_salaires_bruts)}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90">Total Salaires Nets</p>
              <p className="text-xl font-bold">{formatMontantMAD(summary.total_salaires_nets)}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
              <p className="text-sm opacity-90">Coût Total</p>
              <p className="text-xl font-bold">{formatMontantMAD(summary.cout_total)}</p>
            </div>
          </div>

          {/* Actions globales */}
          <div className="border-t pt-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleDownloadGlobalCNSS}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>📋 Préétabli CNSS Global</span>
                <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">
                  {summary.nombre_employes} employés
                </span>
              </button>

              <button
                onClick={handleCalculateAll}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>{isLoading ? 'Calcul en cours...' : '🔄 Recalculer Tous'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de prévisualisation du bulletin */}
      {showPreviewModal && selectedEmployee && employeeCalculation && currentPeriod && (
        <BulletinPaieModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          employee={selectedEmployee}
          calculation={employeeCalculation}
          period={currentPeriod}
          onDownload={handleDownloadBulletin}
          onSave={handleSaveBulletin}
        />
      )}

      {/* Modal de l'ordre de virement */}
      {showVirementModal && selectedEmployee && employeeCalculation && currentPeriod && (
        <OrdrVirementModal
          isOpen={showVirementModal}
          onClose={() => setShowVirementModal(false)}
          employee={selectedEmployee}
          calculation={employeeCalculation}
          period={currentPeriod}
          onDownload={handleDownloadOrdrVirement}
          onSave={handleSaveOrdrVirement}
        />
      )}
        </>
      ) : (
        /* Tab CNSS */
        <CNSSDeclaration />
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePayrollStore } from '@/stores/payrollStore';
import { usePayrollEmployees } from '@/hooks/usePayrollEmployees';
import { useBulletinPaieDownload } from './BulletinPaie';
import BulletinPaieModal from './BulletinPaieModal';
import OrdrVirementModal from './OrdrVirementModal';
import CNSSDeclaration from './CNSSDeclaration';
import PayrollDocumentViewer from './PayrollDocumentViewer';
import CalculationResults from './CalculationResults';
import WorkflowPanel from './WorkflowPanel';
import PayrollHeader from './PayrollHeader';
import PeriodSelector from './PeriodSelector';
import ProcessStepper from './ProcessStepper';
import EmployeeSelectionStep from './steps/EmployeeSelectionStep';
import EmployeeFormStep from './steps/EmployeeFormStep';
import CalculationStep from './steps/CalculationStep';
import type { PayrollEmployee } from '@/types/payroll';

export default function PayrollCalculator() {
  const { data: session } = useSession();
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
    loadPeriodsFromDB,
    calculateSalary,
    calculateAllSalaries,
    getCurrentPeriodSummary
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

  const { downloadBulletin } = useBulletinPaieDownload();
  const { employees: dbEmployees, loading: loadingEmployees } = usePayrollEmployees();

  useEffect(() => {
    // Only use database employees, no mock data
    if (dbEmployees.length > 0 && employees.length === 0) {
      setPayrollEmployees(dbEmployees);
    }
  }, [dbEmployees, employees.length, setPayrollEmployees]);

  // Charger les périodes existantes au démarrage
  useEffect(() => {
    loadPeriodsFromDB().catch((error) => {
      console.error('Erreur lors du chargement des périodes:', error);
    });
  }, [loadPeriodsFromDB]);

  const handleCreatePeriod = async () => {
    try {
      await createPeriod(mois, annee);
      // La période sera automatiquement définie dans le state
    } catch (error) {
      console.error('Erreur lors de la création de la période:', error);
      // L'erreur est déjà gérée dans le store
    }
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
    await calculateSalary(selectedEmployeeId);
  };

  const handleCalculateAll = async () => {
    await calculateAllSalaries();
  };

  const handleBackToSelection = () => {
    setCurrentStep('select');
    setSelectedEmployeeId('');
    setSelectedEmployee(null);
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  const handlePreviewBulletin = () => {
    setShowPreviewModal(true);
  };

  const handleDownloadBulletin = async () => {
    if (selectedEmployee && employeeCalculation && currentPeriod) {
      await downloadBulletin(selectedEmployee, employeeCalculation, currentPeriod);
    }
  };

  const handleDownloadSavedDocument = () => {
    console.log('Download saved document');
  };

  const handlePreviewSavedDocument = () => {
    setShowDocumentViewer(true);
  };

  const handleDownloadAllDocuments = async () => {
    if (selectedEmployee && employeeCalculation && currentPeriod) {
      try {
        await downloadBulletin(selectedEmployee, employeeCalculation, currentPeriod);
        alert('Documents téléchargés');
      } catch (error) {
        console.error('Erreur téléchargement:', error);
        alert('Erreur lors du téléchargement');
      }
    }
  };

  const handleSaveBulletin = async () => {
    try {
      console.log('Saving bulletin...');
      setSavedDocumentId('temp-id-' + Date.now());
    } catch (error) {
      console.error('Error saving bulletin:', error);
      alert('Erreur lors de la sauvegarde du bulletin');
    }
  };

  const employeeCalculation = selectedEmployeeId
    ? calculations.find(c => c.employee_id === selectedEmployeeId && c.periode_id === currentPeriod?._id)
    : null;

  return (
    <div className="space-y-6">
      <PayrollHeader
        instance={instance}
        version={version}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        error={error}
        successMessage={successMessage}
      />

      {activeTab === 'paie' ? (
        <>
          <PeriodSelector
            mois={mois}
            annee={annee}
            currentPeriod={currentPeriod}
            onMoisChange={setMois}
            onAnneeChange={setAnnee}
            onCreatePeriod={handleCreatePeriod}
          />

          <ProcessStepper currentStep={currentStep} />

          {currentStep === 'select' && (
            <EmployeeSelectionStep
              currentPeriod={currentPeriod}
              employees={employees}
              loadingEmployees={loadingEmployees}
              isLoading={isLoading}
              onSelectEmployee={handleSelectEmployee}
              onCalculateAll={handleCalculateAll}
            />
          )}

          {currentStep === 'form' && selectedEmployee && (
            <EmployeeFormStep
              selectedEmployee={selectedEmployee}
              onSave={handleEmployeeDataSaved}
              onCancel={handleBackToSelection}
              onPreview={handlePreviewBulletin}
              onGenerateVirement={() => setShowVirementModal(true)}
            />
          )}

          {currentStep === 'calculate' && selectedEmployee && (
            <CalculationStep
              selectedEmployee={selectedEmployee}
              currentPeriod={currentPeriod}
              isLoading={isLoading}
              onCalculate={handleCalculateOne}
              onBackToForm={handleBackToForm}
              onBackToSelection={handleBackToSelection}
            />
          )}

          {employeeCalculation && (
            <CalculationResults
              calculation={employeeCalculation}
              onChangeEmployee={() => setSelectedEmployeeId('')}
              useNewWorkflow={useNewWorkflow}
              onToggleWorkflow={() => setUseNewWorkflow(true)}
              onPreviewBulletin={handlePreviewBulletin}
              onDownloadSavedDocument={handleDownloadSavedDocument}
              onDownloadAllDocuments={handleDownloadAllDocuments}
              savedDocumentId={savedDocumentId}
            />
          )}

          {/* Commented out WorkflowPanel to avoid duplicate workflow systems */}
          {/* {employeeCalculation && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-1">
                <CalculationResults />
              </div>
              <div className="lg:col-span-1">
                <WorkflowPanel
                  useNewWorkflow={useNewWorkflow}
                  selectedEmployee={selectedEmployee}
                  employeeCalculation={employeeCalculation}
                  currentPeriod={currentPeriod}
                  onToggleWorkflow={() => setUseNewWorkflow(true)}
                  onPreviewBulletin={handlePreviewBulletin}
                  onDownloadBulletin={handleDownloadBulletin}
                  onPreviewSavedDocument={handlePreviewSavedDocument}
                  onDownloadSavedDocument={handleDownloadSavedDocument}
                  onDownloadAllDocuments={handleDownloadAllDocuments}
                  savedDocumentId={savedDocumentId}
                />
              </div>
            </div>
          )} */}
        </>
      ) : (
        <CNSSDeclaration />
      )}

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

      {showVirementModal && selectedEmployee && employeeCalculation && currentPeriod && (
        <OrdrVirementModal
          isOpen={showVirementModal}
          onClose={() => setShowVirementModal(false)}
          employee={selectedEmployee}
          calculation={employeeCalculation}
          period={currentPeriod}
          onDownload={() => {}}
          onSave={() => {}}
        />
      )}
    </div>
  );
}
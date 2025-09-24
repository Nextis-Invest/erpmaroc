'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePayrollWorkflowStore, selectCurrentSession, selectIsWorkflowActive, selectCurrentStep } from '@/stores/payrollWorkflowStore';
import { usePayrollStore } from '@/stores/payrollStore';
import { PayrollWorkflowEngine, type WorkflowState, type PayrollWorkflowStep } from './PayrollWorkflowEngine.ts';
import { PayrollWorkflowEngine as PayrollWorkflowEngineComponent } from './PayrollWorkflowEngine.tsx';
import { PDFPreviewGenerator } from './PDFPreviewGenerator';
import { WorkflowStatusIndicator } from './WorkflowStatusIndicator';
import { DocumentApproval } from './DocumentApproval';
import { WorkflowErrorBoundary } from './WorkflowErrorBoundary';
import { WorkflowProgressTracker } from './WorkflowProgressTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

// Props interface for the orchestrator
interface PayrollWorkflowOrchestratorProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  onWorkflowComplete?: (result: any) => void;
  onWorkflowCancel?: () => void;
  className?: string;
  // Configuration options
  options?: {
    enableAutoSave?: boolean;
    showAdvancedOptions?: boolean;
    enableAccessibilityMode?: boolean;
    mobileOptimized?: boolean;
  };
}

// Step configuration for UI rendering
const STEP_CONFIG = {
  draft: {
    title: 'Préparation du document',
    description: 'Validation des données et préparation',
    icon: '📝',
    color: 'blue',
    estimatedDuration: 60
  },
  preview: {
    title: 'Génération de l\'aperçu',
    description: 'Création de l\'aperçu PDF',
    icon: '👁️',
    color: 'purple',
    estimatedDuration: 45
  },
  review: {
    title: 'Révision du document',
    description: 'Vérification du contenu',
    icon: '🔍',
    color: 'orange',
    estimatedDuration: 90
  },
  corrections: {
    title: 'Corrections (optionnel)',
    description: 'Modifications si nécessaires',
    icon: '✏️',
    color: 'yellow',
    estimatedDuration: 60
  },
  approve: {
    title: 'Approbation',
    description: 'Validation finale',
    icon: '✅',
    color: 'green',
    estimatedDuration: 30
  },
  save: {
    title: 'Sauvegarde',
    description: 'Enregistrement du document',
    icon: '💾',
    color: 'indigo',
    estimatedDuration: 15
  },
  process: {
    title: 'Traitement final',
    description: 'Génération du document final',
    icon: '⚙️',
    color: 'gray',
    estimatedDuration: 30
  },
  complete: {
    title: 'Terminé',
    description: 'Workflow complété',
    icon: '🎉',
    color: 'emerald',
    estimatedDuration: 0
  }
} as const;

export const PayrollWorkflowOrchestrator: React.FC<PayrollWorkflowOrchestratorProps> = ({
  employee,
  calculation,
  period,
  onWorkflowComplete,
  onWorkflowCancel,
  className,
  options = {}
}) => {
  const { data: session } = useSession();
  const user = session?.user;

  // Zustand store hooks
  const {
    createSession,
    closeSession,
    updateStepProgress,
    trackUserAction,
    currentSession,
    isWorkflowActive,
    startPDFGeneration,
    resetPDFGeneration,
    pdfGeneration,
    preferences,
    updatePreferences
  } = usePayrollWorkflowStore();

  // Local state
  const [workflowEngine] = useState(() => new PayrollWorkflowEngine());
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflow' | 'settings' | 'history'>('workflow');
  const [showMobileView, setShowMobileView] = useState(false);

  // Computed values
  const currentStep = usePayrollWorkflowStore(selectCurrentStep);
  const stepConfig = currentStep ? STEP_CONFIG[currentStep] : null;
  const totalSteps = Object.keys(STEP_CONFIG).length;
  const currentStepIndex = currentStep ? Object.keys(STEP_CONFIG).indexOf(currentStep) + 1 : 0;

  // Initialize workflow session
  const initializeWorkflow = useCallback(async () => {
    try {
      trackUserAction('workflow_initiated', 'draft', {
        employeeId: employee._id,
        periodId: period._id
      });

      const sessionId = createSession(employee, calculation, period);

      // Configure preferences based on options
      if (options.enableAutoSave !== undefined) {
        updatePreferences({ enableAutoSave: options.enableAutoSave });
      }
      if (options.enableAccessibilityMode !== undefined) {
        updatePreferences({ enableAccessibilityMode: options.enableAccessibilityMode });
      }
      if (options.mobileOptimized !== undefined) {
        updatePreferences({ mobileOptimized: options.mobileOptimized });
      }

      // Initialize workflow engine
      await workflowEngine.initialize(employee, calculation, period);

      setIsInitialized(true);

      trackUserAction('workflow_initialized', 'draft', { sessionId });
    } catch (error) {
      console.error('Failed to initialize workflow:', error);
      trackUserAction('workflow_init_failed', 'draft', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [employee, calculation, period, createSession, trackUserAction, workflowEngine, options, updatePreferences]);

  // Handle step progression
  const handleStepComplete = useCallback(async (step: PayrollWorkflowStep, result?: any) => {
    if (!currentSession) return;

    try {
      updateStepProgress(currentSession.id, step, {
        status: 'completed',
        progress: 100,
        result
      });

      trackUserAction('step_completed', step, { result });

      // Auto-advance to next step if applicable
      const nextStep = workflowEngine.getNextStep(step);
      if (nextStep && nextStep !== step) {
        updateStepProgress(currentSession.id, nextStep, {
          status: 'active',
          progress: 0
        });
      }

      // Handle workflow completion
      if (step === 'complete') {
        handleWorkflowComplete(result);
      }

    } catch (error) {
      console.error('Error completing step:', error);
      trackUserAction('step_completion_failed', step, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [currentSession, updateStepProgress, trackUserAction, workflowEngine]);

  // Handle workflow completion
  const handleWorkflowComplete = useCallback((result: any) => {
    if (!currentSession) return;

    try {
      closeSession(currentSession.id, result);
      resetPDFGeneration();

      trackUserAction('workflow_completed', 'complete', { result });

      if (onWorkflowComplete) {
        onWorkflowComplete(result);
      }
    } catch (error) {
      console.error('Error completing workflow:', error);
    }
  }, [currentSession, closeSession, resetPDFGeneration, trackUserAction, onWorkflowComplete]);

  // Handle workflow cancellation
  const handleWorkflowCancel = useCallback(() => {
    if (!currentSession) return;

    try {
      closeSession(currentSession.id);
      resetPDFGeneration();

      trackUserAction('workflow_cancelled', currentStep || 'draft');

      if (onWorkflowCancel) {
        onWorkflowCancel();
      }
    } catch (error) {
      console.error('Error cancelling workflow:', error);
    }
  }, [currentSession, closeSession, resetPDFGeneration, trackUserAction, currentStep, onWorkflowCancel]);

  // Handle step retry
  const handleStepRetry = useCallback(async (step: PayrollWorkflowStep) => {
    if (!currentSession) return;

    try {
      updateStepProgress(currentSession.id, step, {
        status: 'active',
        progress: 0,
        error: undefined
      });

      trackUserAction('step_retried', step);

      // Reset specific step state based on step type
      if (step === 'preview') {
        resetPDFGeneration();
      }

    } catch (error) {
      console.error('Error retrying step:', error);
    }
  }, [currentSession, updateStepProgress, trackUserAction, resetPDFGeneration]);

  // Responsive design detection
  useEffect(() => {
    const handleResize = () => {
      setShowMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize workflow on mount
  useEffect(() => {
    if (!isInitialized && !isWorkflowActive) {
      initializeWorkflow();
    }
  }, [isInitialized, isWorkflowActive, initializeWorkflow]);

  // Auto-save progress
  useEffect(() => {
    if (preferences.enableAutoSave && currentSession) {
      const interval = setInterval(() => {
        trackUserAction('auto_save', currentStep || 'draft');
      }, preferences.autoSaveInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [preferences.enableAutoSave, preferences.autoSaveInterval, currentSession, trackUserAction, currentStep]);

  // Render mobile-optimized layout
  const renderMobileLayout = () => (
    <div className="space-y-4 p-4">
      {/* Mobile Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Workflow Paie</CardTitle>
              <CardDescription className="text-sm">
                {employee.prenom} {employee.nom}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {currentStepIndex}/{totalSteps}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <WorkflowProgressTracker
            currentStep={currentStep}
            stepProgress={currentSession?.state.stepProgress}
            compact={true}
            className="mb-4"
          />
        </CardContent>
      </Card>

      {/* Mobile Content */}
      <div className="space-y-4">
        {currentStep && renderStepContent(currentStep, true)}
      </div>

      {/* Mobile Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleWorkflowCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            {currentStep !== 'complete' && (
              <Button
                size="sm"
                onClick={() => handleStepComplete(currentStep)}
                className="flex-1"
              >
                Continuer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render desktop layout
  const renderDesktopLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sidebar - Progress & Info */}
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowProgressTracker
              currentStep={currentStep}
              stepProgress={currentSession?.state.stepProgress}
              vertical={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Employé:</span>
              <p>{employee.prenom} {employee.nom}</p>
            </div>
            <div>
              <span className="font-medium">Période:</span>
              <p>{period.mois}/{period.annee}</p>
            </div>
            <div>
              <span className="font-medium">Salaire net:</span>
              <p className="font-mono">{calculation.salaire_net.toLocaleString('fr-FR')} DH</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="md:col-span-2">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-4 max-h-[400px] overflow-y-auto">
            {currentStep && renderStepContent(currentStep, false)}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 max-h-[400px] overflow-y-auto">
            {renderSettingsPanel()}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 max-h-[400px] overflow-y-auto">
            {renderHistoryPanel()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Render step-specific content
  const renderStepContent = (step: PayrollWorkflowStep, isMobile: boolean) => {
    const config = STEP_CONFIG[step];
    const stepProgress = currentSession?.state.stepProgress[step];

    const commonProps = {
      employee,
      calculation,
      period,
      session: currentSession,
      onComplete: (result?: any) => handleStepComplete(step, result),
      onRetry: () => handleStepRetry(step),
      isMobile
    };

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <CardTitle className={cn(
                "text-lg",
                isMobile && "text-base"
              )}>
                {config.title}
              </CardTitle>
              <CardDescription>
                {config.description}
              </CardDescription>
            </div>
            <div className="ml-auto">
              <WorkflowStatusIndicator
                status={stepProgress?.status || 'pending'}
                progress={stepProgress?.progress}
                error={stepProgress?.error}
                size={isMobile ? 'sm' : 'default'}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'draft' && (
            <DraftStepContent {...commonProps} />
          )}
          {step === 'preview' && (
            <PDFPreviewGenerator {...commonProps} />
          )}
          {step === 'review' && (
            <ReviewStepContent {...commonProps} />
          )}
          {step === 'corrections' && (
            <CorrectionsStepContent {...commonProps} />
          )}
          {step === 'approve' && (
            <DocumentApproval {...commonProps} />
          )}
          {step === 'save' && (
            <SaveStepContent {...commonProps} />
          )}
          {step === 'process' && (
            <ProcessStepContent {...commonProps} />
          )}
          {step === 'complete' && (
            <CompleteStepContent {...commonProps} />
          )}
        </CardContent>
      </Card>
    );
  };

  // Settings panel
  const renderSettingsPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres du workflow</CardTitle>
        <CardDescription>
          Configurez le comportement du workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings content will be implemented */}
        <Alert>
          <AlertDescription>
            Les paramètres de workflow seront disponibles prochainement.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  // History panel
  const renderHistoryPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Historique des actions</CardTitle>
        <CardDescription>
          Suivi des étapes et actions du workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* History content will be implemented */}
        <Alert>
          <AlertDescription>
            L'historique des actions sera disponible prochainement.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  // Show loading state
  if (!isInitialized || !currentSession) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-gray-600">Initialisation du workflow...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <WorkflowErrorBoundary onError={(error) => {
      trackUserAction('workflow_error', currentStep || 'draft', { error: error.message });
    }}>
      <div className={cn("w-full max-h-[600px] overflow-y-auto", className)}>
        {showMobileView || options.mobileOptimized ? renderMobileLayout() : renderDesktopLayout()}
      </div>
    </WorkflowErrorBoundary>
  );
};

// Step content components (will be implemented in separate files)
const DraftStepContent: React.FC<any> = ({ onComplete }) => (
  <div className="space-y-4">
    <p className="text-gray-600">Validation des données et préparation du document...</p>
    <Button onClick={() => onComplete()}>Valider les données</Button>
  </div>
);

const ReviewStepContent: React.FC<any> = ({ onComplete }) => (
  <div className="space-y-4">
    <p className="text-gray-600">Veuillez réviser le document généré...</p>
    <Button onClick={() => onComplete()}>Valider la révision</Button>
  </div>
);

const CorrectionsStepContent: React.FC<any> = ({ onComplete }) => (
  <div className="space-y-4">
    <p className="text-gray-600">Apportez les corrections nécessaires...</p>
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => onComplete({ hasCorrections: false })}>
        Aucune correction
      </Button>
      <Button onClick={() => onComplete({ hasCorrections: true })}>
        Corrections appliquées
      </Button>
    </div>
  </div>
);

const SaveStepContent: React.FC<any> = ({ onComplete }) => (
  <div className="space-y-4">
    <p className="text-gray-600">Sauvegarde du document en cours...</p>
    <Button onClick={() => onComplete()}>Confirmer la sauvegarde</Button>
  </div>
);

const ProcessStepContent: React.FC<any> = ({ onComplete }) => (
  <div className="space-y-4">
    <p className="text-gray-600">Traitement final du document...</p>
    <Button onClick={() => onComplete()}>Finaliser le traitement</Button>
  </div>
);

const CompleteStepContent: React.FC<any> = ({ employee, calculation, period }) => (
  <div className="space-y-4">
    <div className="text-center space-y-2">
      <div className="text-4xl">🎉</div>
      <h3 className="text-lg font-semibold text-green-700">Workflow terminé avec succès!</h3>
      <p className="text-gray-600">
        Le bulletin de paie pour {employee.prenom} {employee.nom} a été généré et sauvegardé.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardContent className="pt-4 text-center">
          <p className="text-sm text-gray-600">Salaire net</p>
          <p className="text-lg font-semibold">{calculation.salaire_net.toLocaleString('fr-FR')} DH</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 text-center">
          <p className="text-sm text-gray-600">Période</p>
          <p className="text-lg font-semibold">{period.mois}/{period.annee}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 text-center">
          <p className="text-sm text-gray-600">Statut</p>
          <Badge variant="default" className="bg-green-100 text-green-800">Complété</Badge>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default PayrollWorkflowOrchestrator;
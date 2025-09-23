'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { usePayrollStore } from '@/stores/payrollStore';
import { WorkflowProgressIndicator } from './WorkflowProgressIndicator';
import { WorkflowStepContainer } from './WorkflowStepContainer';
import { WorkflowErrorBoundary } from './WorkflowErrorBoundary';
import { WorkflowAccessibilityProvider } from './WorkflowAccessibilityProvider';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

// Core workflow types
export type PayrollWorkflowStep =
  | 'draft' | 'preview' | 'review' | 'corrections'
  | 'approve' | 'save' | 'process' | 'complete';

export interface WorkflowStepStatus {
  status: 'pending' | 'active' | 'completed' | 'error' | 'skipped';
  timestamp?: Date;
  error?: string;
  canSkip?: boolean;
  canRetry?: boolean;
  progress?: number; // 0-100
}

export interface WorkflowState {
  currentStep: PayrollWorkflowStep;
  stepProgress: Record<PayrollWorkflowStep, WorkflowStepStatus>;
  documentId?: string;
  validationErrors: ValidationError[];
  userDecisions: Record<string, any>;
  metadata: {
    startedAt: Date;
    estimatedDuration?: number;
    actualDuration?: number;
    userAgent?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  canContinue?: boolean;
}

export interface PayrollWorkflowEngineProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  initialStep?: PayrollWorkflowStep;
  onComplete?: (result: WorkflowResult) => void;
  onCancel?: () => void;
  onStepChange?: (step: PayrollWorkflowStep, state: WorkflowState) => void;
  enableAccessibilityMode?: boolean;
  mobileOptimized?: boolean;
}

export interface WorkflowResult {
  success: boolean;
  documentId?: string;
  finalStatus: string;
  duration: number;
  stepsCompleted: PayrollWorkflowStep[];
  errors?: ValidationError[];
}

const STEP_CONFIGURATION = {
  draft: {
    title: 'Préparation du Document',
    description: 'Création du brouillon du bulletin de paie',
    estimatedDuration: 30,
    canSkip: false,
    validation: 'basic',
    accessibilityLabel: 'Étape 1 sur 8: Préparation du document de paie'
  },
  preview: {
    title: 'Génération du Préview',
    description: 'Création de l\'aperçu PDF du bulletin',
    estimatedDuration: 45,
    canSkip: false,
    validation: 'comprehensive',
    accessibilityLabel: 'Étape 2 sur 8: Génération de l\'aperçu PDF'
  },
  review: {
    title: 'Révision Utilisateur',
    description: 'Vérification et validation du contenu',
    estimatedDuration: 120,
    canSkip: false,
    validation: 'user_confirmation',
    accessibilityLabel: 'Étape 3 sur 8: Révision et validation du contenu'
  },
  corrections: {
    title: 'Corrections',
    description: 'Application des modifications demandées',
    estimatedDuration: 60,
    canSkip: true,
    validation: 'conditional',
    accessibilityLabel: 'Étape 4 sur 8: Application des corrections'
  },
  approve: {
    title: 'Approbation Finale',
    description: 'Validation définitive avant sauvegarde',
    estimatedDuration: 15,
    canSkip: false,
    validation: 'final_confirmation',
    accessibilityLabel: 'Étape 5 sur 8: Approbation finale'
  },
  save: {
    title: 'Sauvegarde',
    description: 'Enregistrement en base de données',
    estimatedDuration: 20,
    canSkip: false,
    validation: 'system',
    accessibilityLabel: 'Étape 6 sur 8: Sauvegarde en base de données'
  },
  process: {
    title: 'Traitement',
    description: 'Traitement en arrière-plan',
    estimatedDuration: 30,
    canSkip: false,
    validation: 'system',
    accessibilityLabel: 'Étape 7 sur 8: Traitement en arrière-plan'
  },
  complete: {
    title: 'Finalisation',
    description: 'Workflow terminé avec succès',
    estimatedDuration: 5,
    canSkip: false,
    validation: 'none',
    accessibilityLabel: 'Étape 8 sur 8: Workflow terminé'
  }
} as const;

export function PayrollWorkflowEngine({
  employee,
  calculation,
  period,
  initialStep = 'draft',
  onComplete,
  onCancel,
  onStepChange,
  enableAccessibilityMode = true,
  mobileOptimized = true
}: PayrollWorkflowEngineProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() => ({
    currentStep: initialStep,
    stepProgress: Object.keys(STEP_CONFIGURATION).reduce((acc, step) => ({
      ...acc,
      [step]: {
        status: step === initialStep ? 'active' : 'pending',
        canSkip: STEP_CONFIGURATION[step as PayrollWorkflowStep].canSkip,
        canRetry: true
      }
    }), {} as Record<PayrollWorkflowStep, WorkflowStepStatus>),
    validationErrors: [],
    userDecisions: {},
    metadata: {
      startedAt: new Date(),
      estimatedDuration: Object.values(STEP_CONFIGURATION)
        .reduce((total, config) => total + config.estimatedDuration, 0)
    }
  }));

  const [isProcessing, setIsProcessing] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Accessibility announcements
  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 3000);
  }, []);

  // Step progression logic
  const progressToNextStep = useCallback(async (
    fromStep: PayrollWorkflowStep,
    toStep: PayrollWorkflowStep,
    data?: any
  ) => {
    setIsProcessing(true);

    try {
      // Update current step as completed
      const updatedState: WorkflowState = {
        ...workflowState,
        stepProgress: {
          ...workflowState.stepProgress,
          [fromStep]: {
            ...workflowState.stepProgress[fromStep],
            status: 'completed',
            timestamp: new Date(),
            progress: 100
          },
          [toStep]: {
            ...workflowState.stepProgress[toStep],
            status: 'active',
            progress: 0
          }
        },
        currentStep: toStep,
        userDecisions: data ? { ...workflowState.userDecisions, [fromStep]: data } : workflowState.userDecisions
      };

      setWorkflowState(updatedState);

      // Accessibility announcement
      const stepConfig = STEP_CONFIGURATION[toStep];
      announce(`Progression vers ${stepConfig.title}. ${stepConfig.accessibilityLabel}`);

      // Notify parent component
      onStepChange?.(toStep, updatedState);

      // Check if workflow is complete
      if (toStep === 'complete') {
        const result: WorkflowResult = {
          success: true,
          documentId: updatedState.documentId,
          finalStatus: 'completed',
          duration: Date.now() - updatedState.metadata.startedAt.getTime(),
          stepsCompleted: Object.keys(updatedState.stepProgress).filter(
            step => updatedState.stepProgress[step as PayrollWorkflowStep].status === 'completed'
          ) as PayrollWorkflowStep[],
          errors: updatedState.validationErrors.filter(e => e.severity === 'error')
        };

        onComplete?.(result);
        announce('Workflow de paie terminé avec succès');
      }

    } catch (error) {
      // Handle step progression error
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

      setWorkflowState(prev => ({
        ...prev,
        stepProgress: {
          ...prev.stepProgress,
          [fromStep]: {
            ...prev.stepProgress[fromStep],
            status: 'error',
            error: errorMessage,
            canRetry: true
          }
        },
        validationErrors: [
          ...prev.validationErrors,
          {
            field: fromStep,
            message: errorMessage,
            severity: 'error',
            canContinue: false
          }
        ]
      }));

      announce(`Erreur lors de la progression: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [workflowState, onStepChange, onComplete, announce]);

  // Handle step validation
  const validateStep = useCallback(async (
    step: PayrollWorkflowStep,
    data?: any
  ): Promise<ValidationError[]> => {
    const stepConfig = STEP_CONFIGURATION[step];
    const errors: ValidationError[] = [];

    switch (stepConfig.validation) {
      case 'basic':
        if (!employee._id || !calculation || !period) {
          errors.push({
            field: 'required_data',
            message: 'Données employé, calcul ou période manquantes',
            severity: 'error',
            canContinue: false
          });
        }
        break;

      case 'comprehensive':
        // Validate calculation completeness
        if (!calculation.salaire_net || calculation.salaire_net <= 0) {
          errors.push({
            field: 'salaire_net',
            message: 'Salaire net invalide ou manquant',
            severity: 'error',
            canContinue: false
          });
        }
        break;

      case 'user_confirmation':
        if (!data?.userConfirmed) {
          errors.push({
            field: 'user_confirmation',
            message: 'Confirmation utilisateur requise',
            severity: 'error',
            canContinue: false
          });
        }
        break;

      case 'final_confirmation':
        if (!data?.finalApproval) {
          errors.push({
            field: 'final_approval',
            message: 'Approbation finale requise',
            severity: 'error',
            canContinue: false
          });
        }
        break;
    }

    return errors;
  }, [employee, calculation, period]);

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    if (!enableAccessibilityMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + N: Next step (if possible)
      if (event.altKey && event.key === 'n' && !isProcessing) {
        const currentStepIndex = Object.keys(STEP_CONFIGURATION).indexOf(workflowState.currentStep);
        const nextStep = Object.keys(STEP_CONFIGURATION)[currentStepIndex + 1] as PayrollWorkflowStep;

        if (nextStep && workflowState.stepProgress[workflowState.currentStep].status === 'completed') {
          progressToNextStep(workflowState.currentStep, nextStep);
        }
      }

      // Alt + C: Cancel workflow
      if (event.altKey && event.key === 'c') {
        onCancel?.();
      }

      // Escape: Focus management
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        activeElement?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [workflowState, isProcessing, progressToNextStep, onCancel, enableAccessibilityMode]);

  return (
    <WorkflowAccessibilityProvider
      enabled={enableAccessibilityMode}
      announcements={announcements}
    >
      <WorkflowErrorBoundary
        onError={(error) => {
          setWorkflowState(prev => ({
            ...prev,
            validationErrors: [
              ...prev.validationErrors,
              {
                field: 'system',
                message: error.message,
                severity: 'error',
                canContinue: false
              }
            ]
          }));
        }}
      >
        <div
          className={`payroll-workflow-container ${mobileOptimized ? 'mobile-optimized' : ''}`}
          role="main"
          aria-label="Workflow de génération de bulletin de paie"
        >
          {/* Progress Indicator */}
          <WorkflowProgressIndicator
            currentStep={workflowState.currentStep}
            stepProgress={workflowState.stepProgress}
            configuration={STEP_CONFIGURATION}
            mobileOptimized={mobileOptimized}
            enableAccessibility={enableAccessibilityMode}
          />

          {/* Current Step Container */}
          <WorkflowStepContainer
            step={workflowState.currentStep}
            configuration={STEP_CONFIGURATION[workflowState.currentStep]}
            employee={employee}
            calculation={calculation}
            period={period}
            workflowState={workflowState}
            isProcessing={isProcessing}
            onProgress={progressToNextStep}
            onValidate={validateStep}
            onCancel={onCancel}
            mobileOptimized={mobileOptimized}
            enableAccessibility={enableAccessibilityMode}
          />

          {/* Validation Errors Display */}
          {workflowState.validationErrors.length > 0 && (
            <div
              className="workflow-errors mt-4 p-4 border-l-4 border-red-500 bg-red-50"
              role="alert"
              aria-label="Erreurs de validation"
            >
              <h3 className="text-red-800 font-semibold mb-2">
                Erreurs détectées ({workflowState.validationErrors.length})
              </h3>
              <ul className="space-y-1">
                {workflowState.validationErrors.map((error, index) => (
                  <li
                    key={index}
                    className={`text-sm ${
                      error.severity === 'error' ? 'text-red-700' :
                      error.severity === 'warning' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}
                  >
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mobile-specific quick actions */}
          {mobileOptimized && (
            <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
              <div className="bg-white rounded-lg shadow-lg border p-3 flex justify-between items-center">
                <button
                  onClick={onCancel}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  aria-label="Annuler le workflow"
                >
                  Annuler
                </button>
                <div className="text-sm text-gray-600">
                  Étape {Object.keys(STEP_CONFIGURATION).indexOf(workflowState.currentStep) + 1}/8
                </div>
                <button
                  disabled={isProcessing}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  aria-label="Continuer vers l'étape suivante"
                >
                  {isProcessing ? 'En cours...' : 'Continuer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </WorkflowErrorBoundary>
    </WorkflowAccessibilityProvider>
  );
}
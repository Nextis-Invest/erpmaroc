'use client';

import React, { useMemo } from 'react';
import { WorkflowStatusIndicator } from './WorkflowStatusIndicator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PayrollWorkflowStep, WorkflowStepStatus } from './PayrollWorkflowEngine';

interface WorkflowProgressTrackerProps {
  currentStep?: PayrollWorkflowStep | null;
  stepProgress?: Record<PayrollWorkflowStep, WorkflowStepStatus>;
  vertical?: boolean;
  compact?: boolean;
  showEstimatedTime?: boolean;
  showStepDetails?: boolean;
  interactive?: boolean;
  onStepClick?: (step: PayrollWorkflowStep) => void;
  className?: string;
}

// Step configuration for display
const STEP_CONFIG = {
  draft: {
    title: 'Préparation',
    description: 'Validation des données',
    icon: '📝',
    shortTitle: 'Préparation',
    estimatedDuration: 60
  },
  preview: {
    title: 'Génération',
    description: 'Création de l\'aperçu PDF',
    icon: '👁️',
    shortTitle: 'Aperçu',
    estimatedDuration: 45
  },
  review: {
    title: 'Révision',
    description: 'Vérification du contenu',
    icon: '🔍',
    shortTitle: 'Révision',
    estimatedDuration: 90
  },
  corrections: {
    title: 'Corrections',
    description: 'Modifications si nécessaires',
    icon: '✏️',
    shortTitle: 'Corrections',
    estimatedDuration: 60
  },
  approve: {
    title: 'Approbation',
    description: 'Validation finale',
    icon: '✅',
    shortTitle: 'Validation',
    estimatedDuration: 30
  },
  save: {
    title: 'Sauvegarde',
    description: 'Enregistrement du document',
    icon: '💾',
    shortTitle: 'Sauvegarde',
    estimatedDuration: 15
  },
  process: {
    title: 'Traitement',
    description: 'Finalisation',
    icon: '⚙️',
    shortTitle: 'Traitement',
    estimatedDuration: 30
  },
  complete: {
    title: 'Terminé',
    description: 'Workflow complété',
    icon: '🎉',
    shortTitle: 'Terminé',
    estimatedDuration: 0
  }
} as const;

const STEP_ORDER: PayrollWorkflowStep[] = [
  'draft',
  'preview',
  'review',
  'corrections',
  'approve',
  'save',
  'process',
  'complete'
];

export const WorkflowProgressTracker: React.FC<WorkflowProgressTrackerProps> = ({
  currentStep,
  stepProgress = {} as Record<PayrollWorkflowStep, WorkflowStepStatus>,
  vertical = false,
  compact = false,
  showEstimatedTime = false,
  showStepDetails = true,
  interactive = false,
  onStepClick,
  className
}) => {
  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completedSteps = STEP_ORDER.filter(step => {
      const status = stepProgress[step]?.status;
      return status === 'completed' || status === 'skipped';
    }).length;

    return Math.round((completedSteps / STEP_ORDER.length) * 100);
  }, [stepProgress]);

  // Calculate estimated remaining time
  const estimatedRemainingTime = useMemo(() => {
    if (!showEstimatedTime) return 0;

    const remainingSteps = STEP_ORDER.filter(step => {
      const status = stepProgress[step]?.status;
      return status === 'pending' || status === 'active';
    });

    return remainingSteps.reduce((total, step) => {
      return total + STEP_CONFIG[step].estimatedDuration;
    }, 0);
  }, [stepProgress, showEstimatedTime]);

  // Get step status for display
  const getStepStatus = (step: PayrollWorkflowStep) => {
    const progress = stepProgress[step];
    return {
      status: progress?.status || 'pending',
      progress: progress?.progress || 0,
      error: progress?.error,
      canClick: interactive && (onStepClick !== undefined),
      isCurrent: step === currentStep
    };
  };

  // Handle step click
  const handleStepClick = (step: PayrollWorkflowStep) => {
    if (interactive && onStepClick) {
      onStepClick(step);
    }
  };

  // Render compact horizontal layout
  const renderCompactHorizontal = () => (
    <div className={cn("space-y-3", className)}>
      {/* Overall progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progression globale</span>
        <span className="text-gray-600">{overallProgress}%</span>
      </div>
      <Progress value={overallProgress} className="w-full h-2" />

      {/* Current step indicator */}
      {currentStep && (
        <div className="flex items-center gap-2">
          <span className="text-lg">{STEP_CONFIG[currentStep].icon}</span>
          <div>
            <span className="font-medium text-sm">{STEP_CONFIG[currentStep].shortTitle}</span>
            <WorkflowStatusIndicator
              status={getStepStatus(currentStep).status}
              progress={getStepStatus(currentStep).progress}
              size="sm"
              variant="minimal"
              showProgress={getStepStatus(currentStep).status === 'active'}
            />
          </div>
        </div>
      )}

      {showEstimatedTime && estimatedRemainingTime > 0 && (
        <div className="text-xs text-gray-500">
          Temps restant estimé: ~{Math.round(estimatedRemainingTime / 60)}min
        </div>
      )}
    </div>
  );

  // Render full horizontal layout
  const renderFullHorizontal = () => (
    <div className={cn("space-y-4", className)}>
      {/* Overall progress header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Progression du workflow</h3>
        <Badge variant="outline">{overallProgress}%</Badge>
      </div>

      <Progress value={overallProgress} className="w-full h-3" />

      {/* Steps grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STEP_ORDER.map((step, index) => {
          const stepStatus = getStepStatus(step);
          const config = STEP_CONFIG[step];

          return (
            <Card
              key={step}
              className={cn(
                "transition-all duration-200",
                stepStatus.isCurrent && "ring-2 ring-blue-500 ring-offset-2",
                stepStatus.canClick && "cursor-pointer hover:shadow-md",
                stepStatus.status === 'completed' && "bg-green-50 border-green-200",
                stepStatus.status === 'error' && "bg-red-50 border-red-200",
                stepStatus.status === 'active' && "bg-blue-50 border-blue-200"
              )}
              onClick={() => handleStepClick(step)}
            >
              <CardContent className="p-3">
                <div className="text-center space-y-2">
                  <div className="text-2xl">{config.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{config.shortTitle}</p>
                    {showStepDetails && (
                      <p className="text-xs text-gray-600">{config.description}</p>
                    )}
                  </div>
                  <WorkflowStatusIndicator
                    status={stepStatus.status}
                    progress={stepStatus.progress}
                    error={stepStatus.error}
                    size="sm"
                    variant="minimal"
                    showProgress={stepStatus.status === 'active'}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showEstimatedTime && estimatedRemainingTime > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Temps restant estimé: ~{Math.round(estimatedRemainingTime / 60)} minutes
        </div>
      )}
    </div>
  );

  // Render vertical layout
  const renderVertical = () => (
    <div className={cn("space-y-1", className)}>
      {STEP_ORDER.map((step, index) => {
        const stepStatus = getStepStatus(step);
        const config = STEP_CONFIG[step];
        const isLast = index === STEP_ORDER.length - 1;

        return (
          <div key={step} className="relative">
            {/* Step item */}
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                stepStatus.isCurrent && "bg-blue-50 border border-blue-200",
                stepStatus.canClick && "cursor-pointer hover:bg-gray-50",
                stepStatus.status === 'completed' && "bg-green-50",
                stepStatus.status === 'error' && "bg-red-50"
              )}
              onClick={() => handleStepClick(step)}
            >
              {/* Step icon and connector */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                    stepStatus.status === 'completed' && "bg-green-500 border-green-500 text-white",
                    stepStatus.status === 'active' && "bg-blue-500 border-blue-500 text-white",
                    stepStatus.status === 'error' && "bg-red-500 border-red-500 text-white",
                    stepStatus.status === 'pending' && "bg-gray-100 border-gray-300 text-gray-600"
                  )}
                >
                  {stepStatus.status === 'completed' ? '✓' :
                   stepStatus.status === 'error' ? '✗' :
                   stepStatus.status === 'active' ? '●' : index + 1}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 h-8 mt-1 transition-colors",
                      stepStatus.status === 'completed' ? "bg-green-300" : "bg-gray-200"
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{config.icon}</span>
                  <h4 className="font-medium text-sm">{compact ? config.shortTitle : config.title}</h4>
                  <WorkflowStatusIndicator
                    status={stepStatus.status}
                    progress={stepStatus.progress}
                    error={stepStatus.error}
                    size="sm"
                    variant="minimal"
                    showText={false}
                  />
                </div>

                {showStepDetails && !compact && (
                  <p className="text-xs text-gray-600 mb-2">{config.description}</p>
                )}

                {stepStatus.status === 'active' && stepStatus.progress > 0 && (
                  <Progress value={stepStatus.progress} className="w-full h-1 mt-2" />
                )}

                {stepStatus.status === 'error' && stepStatus.error && (
                  <p className="text-xs text-red-600 mt-1">{stepStatus.error}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Overall progress footer */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Progression globale</span>
          <span className="text-gray-600">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="w-full h-2" />

        {showEstimatedTime && estimatedRemainingTime > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            Temps restant estimé: ~{Math.round(estimatedRemainingTime / 60)}min
          </div>
        )}
      </div>
    </div>
  );

  // Render based on layout preference
  if (compact) {
    return renderCompactHorizontal();
  }

  if (vertical) {
    return renderVertical();
  }

  return renderFullHorizontal();
};

export default WorkflowProgressTracker;
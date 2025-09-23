'use client';

import React from 'react';
import { Check, Clock, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import type { PayrollWorkflowStep, WorkflowStepStatus } from './PayrollWorkflowEngine';

interface StepConfiguration {
  title: string;
  description: string;
  estimatedDuration: number;
  canSkip: boolean;
  validation: string;
  accessibilityLabel: string;
}

interface WorkflowProgressIndicatorProps {
  currentStep: PayrollWorkflowStep;
  stepProgress: Record<PayrollWorkflowStep, WorkflowStepStatus>;
  configuration: Record<PayrollWorkflowStep, StepConfiguration>;
  mobileOptimized?: boolean;
  enableAccessibility?: boolean;
  onStepClick?: (step: PayrollWorkflowStep) => void;
}

const STEP_ICONS = {
  draft: '📝',
  preview: '👁️',
  review: '🔍',
  corrections: '✏️',
  approve: '✅',
  save: '💾',
  process: '⚙️',
  complete: '🎉'
} as const;

export function WorkflowProgressIndicator({
  currentStep,
  stepProgress,
  configuration,
  mobileOptimized = true,
  enableAccessibility = true,
  onStepClick
}: WorkflowProgressIndicatorProps) {
  const steps = Object.keys(configuration) as PayrollWorkflowStep[];
  const currentStepIndex = steps.indexOf(currentStep);
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => stepProgress[step].status === 'completed').length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const getStepStatusIcon = (step: PayrollWorkflowStep, status: WorkflowStepStatus) => {
    switch (status.status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" aria-label="Terminé" />;
      case 'active':
        return status.progress !== undefined && status.progress > 0 ? (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" aria-label="En cours" />
        ) : (
          <Clock className="w-4 h-4 text-blue-600" aria-label="En cours" />
        );
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" aria-label="Erreur" />;
      case 'skipped':
        return <ChevronRight className="w-4 h-4 text-gray-400" aria-label="Ignoré" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" aria-label="En attente" />;
    }
  };

  const getStepColorClasses = (step: PayrollWorkflowStep, status: WorkflowStepStatus) => {
    const isClickable = onStepClick && (status.status === 'completed' || status.status === 'active');

    const baseClasses = `
      relative flex items-center p-3 rounded-lg transition-all duration-300
      ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}
    `;

    switch (status.status) {
      case 'completed':
        return `${baseClasses} bg-green-50 border-2 border-green-200 text-green-800`;
      case 'active':
        return `${baseClasses} bg-blue-50 border-2 border-blue-300 text-blue-800 shadow-md`;
      case 'error':
        return `${baseClasses} bg-red-50 border-2 border-red-200 text-red-800`;
      case 'skipped':
        return `${baseClasses} bg-gray-50 border-2 border-gray-200 text-gray-600`;
      default:
        return `${baseClasses} bg-gray-50 border-2 border-gray-200 text-gray-600`;
    }
  };

  // Mobile compact view
  if (mobileOptimized) {
    return (
      <div
        className="workflow-progress-mobile"
        role="progressbar"
        aria-label={`Progression du workflow: étape ${currentStepIndex + 1} sur ${totalSteps}`}
        aria-valuenow={currentStepIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        {/* Mobile Header with Overall Progress */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Workflow de Paie
            </h2>
            <span className="text-sm font-medium text-gray-600">
              {completedSteps}/{totalSteps} terminé
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
              aria-label={`${progressPercentage}% terminé`}
            />
          </div>

          {/* Current Step Info */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl" role="img" aria-label={configuration[currentStep].title}>
              {STEP_ICONS[currentStep]}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {configuration[currentStep].title}
              </h3>
              <p className="text-sm text-gray-600">
                {configuration[currentStep].description}
              </p>
            </div>
            <div className="flex items-center">
              {getStepStatusIcon(currentStep, stepProgress[currentStep])}
            </div>
          </div>

          {/* Step Progress (if active and has progress) */}
          {stepProgress[currentStep].status === 'active' &&
           stepProgress[currentStep].progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progression de l'étape</span>
                <span>{stepProgress[currentStep].progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${stepProgress[currentStep].progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Compact Steps Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Aperçu des étapes
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step, index) => {
              const status = stepProgress[step];
              const isCurrentStep = step === currentStep;

              return (
                <button
                  key={step}
                  onClick={() => onStepClick?.(step)}
                  disabled={!onStepClick || (status.status !== 'completed' && status.status !== 'active')}
                  className={`
                    relative p-2 rounded-md text-center transition-all duration-200
                    ${isCurrentStep ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    ${status.status === 'completed' ? 'bg-green-100 text-green-700' :
                      status.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      status.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  aria-label={`${configuration[step].title} - ${status.status}`}
                >
                  <div className="text-lg mb-1" role="img">
                    {STEP_ICONS[step]}
                  </div>
                  <div className="text-xs font-medium">
                    {index + 1}
                  </div>
                  {status.status === 'active' && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 rounded-b-md animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop full view
  return (
    <div
      className="workflow-progress-desktop"
      role="progressbar"
      aria-label={`Progression du workflow: étape ${currentStepIndex + 1} sur ${totalSteps}`}
      aria-valuenow={currentStepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {/* Desktop Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Workflow de Génération de Bulletin de Paie
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              Progression globale: {progressPercentage}%
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Progression des étapes" className="flex items-center space-x-1 text-sm">
          {steps.map((step, index) => {
            const status = stepProgress[step];
            const isCurrentStep = step === currentStep;
            const isCompleted = status.status === 'completed';
            const isClickable = onStepClick && (isCompleted || isCurrentStep);

            return (
              <React.Fragment key={step}>
                <button
                  onClick={() => isClickable ? onStepClick(step) : undefined}
                  disabled={!isClickable}
                  className={`
                    px-3 py-1 rounded-md transition-all duration-200
                    ${isCurrentStep ? 'bg-blue-100 text-blue-700 font-medium' :
                      isCompleted ? 'text-green-600 hover:bg-green-50' :
                      'text-gray-500'}
                    ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
                    disabled:opacity-50
                  `}
                  aria-current={isCurrentStep ? 'step' : undefined}
                  aria-label={`${configuration[step].title} - ${status.status}`}
                >
                  {configuration[step].title}
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Detailed Steps View */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-0">
          {steps.map((step, index) => {
            const status = stepProgress[step];
            const config = configuration[step];
            const isCurrentStep = step === currentStep;
            const isClickable = onStepClick && (status.status === 'completed' || status.status === 'active');

            return (
              <div
                key={step}
                className={`
                  ${getStepColorClasses(step, status)}
                  ${index < steps.length - 1 ? 'border-r border-gray-200' : ''}
                  ${isCurrentStep ? 'transform scale-105 z-10' : ''}
                `}
                onClick={() => isClickable ? onStepClick(step) : undefined}
                role={isClickable ? 'button' : 'listitem'}
                tabIndex={isClickable ? 0 : -1}
                aria-label={`${config.title}: ${status.status}`}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick(step);
                  }
                }}
              >
                {/* Step Number and Icon */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${status.status === 'completed' ? 'bg-green-600 text-white' :
                      status.status === 'active' ? 'bg-blue-600 text-white' :
                      status.status === 'error' ? 'bg-red-600 text-white' :
                      'bg-gray-300 text-gray-600'}
                  `}>
                    {status.status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : status.status === 'error' ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="text-2xl" role="img" aria-label={config.title}>
                    {STEP_ICONS[step]}
                  </div>
                  {getStepStatusIcon(step, status)}
                </div>

                {/* Step Content */}
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm">
                    {config.title}
                  </h3>
                  <p className="text-xs opacity-90">
                    {config.description}
                  </p>

                  {/* Timing Information */}
                  <div className="flex items-center justify-between text-xs opacity-75 mt-2">
                    <span>~{config.estimatedDuration}s</span>
                    {status.timestamp && (
                      <span>
                        {status.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Step Progress Bar (if active) */}
                  {status.status === 'active' && status.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-1">
                        <div
                          className="bg-current h-1 rounded-full transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                          aria-label={`Progression: ${status.progress}%`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {status.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded-md text-xs text-red-700">
                      {status.error}
                    </div>
                  )}
                </div>

                {/* Active Step Indicator */}
                {isCurrentStep && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-current animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessibility Info Panel */}
      {enableAccessibility && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Raccourcis clavier
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li><kbd className="px-1 bg-blue-200 rounded">Alt + N</kbd> Étape suivante</li>
            <li><kbd className="px-1 bg-blue-200 rounded">Alt + C</kbd> Annuler</li>
            <li><kbd className="px-1 bg-blue-200 rounded">Échap</kbd> Quitter le focus</li>
          </ul>
        </div>
      )}
    </div>
  );
}
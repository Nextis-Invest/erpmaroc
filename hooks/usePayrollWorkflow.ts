import { useCallback, useMemo } from 'react';
import { usePayrollWorkflowStore, useWorkflowActions } from '@/stores/payrollWorkflowStore';
import { PayrollWorkflowEngine, type PayrollWorkflowStep, type WorkflowState } from '@/components/payroll/workflow/PayrollWorkflowEngine';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

// Hook for managing workflow operations
export const usePayrollWorkflow = () => {
  const store = usePayrollWorkflowStore();
  const actions = useWorkflowActions();

  // Get current workflow state
  const currentSession = store.currentSession;
  const isActive = store.isWorkflowActive;
  const currentStep = currentSession?.state.currentStep;
  const stepProgress = currentSession?.state.stepProgress;

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!stepProgress) return 0;

    const totalSteps = Object.keys(stepProgress).length;
    const completedSteps = Object.values(stepProgress).filter(
      step => step.status === 'completed' || step.status === 'skipped'
    ).length;

    return Math.round((completedSteps / totalSteps) * 100);
  }, [stepProgress]);

  // Check if workflow can advance
  const canAdvance = useMemo(() => {
    if (!currentStep || !stepProgress) return false;

    const current = stepProgress[currentStep];
    return current?.status === 'completed' || current?.canSkip;
  }, [currentStep, stepProgress]);

  // Get next step
  const getNextStep = useCallback((step: PayrollWorkflowStep): PayrollWorkflowStep | null => {
    const steps: PayrollWorkflowStep[] = ['draft', 'preview', 'review', 'corrections', 'approve', 'save', 'process', 'complete'];
    const currentIndex = steps.indexOf(step);

    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null;
    }

    return steps[currentIndex + 1];
  }, []);

  // Initialize new workflow
  const initializeWorkflow = useCallback((
    employee: PayrollEmployee,
    calculation: PayrollCalculation,
    period: PayrollPeriod
  ) => {
    return actions.createSession(employee, calculation, period);
  }, [actions]);

  // Advance to next step
  const advanceStep = useCallback((result?: any) => {
    if (!currentSession || !currentStep) return;

    // Mark current step as completed
    actions.updateStepProgress(currentSession.id, currentStep, {
      status: 'completed',
      progress: 100,
      result
    });

    // Advance to next step
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      actions.updateStepProgress(currentSession.id, nextStep, {
        status: 'active',
        progress: 0
      });
    }
  }, [currentSession, currentStep, actions, getNextStep]);

  // Complete workflow
  const completeWorkflow = useCallback((result?: any) => {
    if (!currentSession) return;

    actions.closeSession(currentSession.id, result);
  }, [currentSession, actions]);

  // Error handling
  const handleError = useCallback((step: PayrollWorkflowStep, error: string) => {
    if (!currentSession) return;

    actions.updateStepProgress(currentSession.id, step, {
      status: 'error',
      error
    });
  }, [currentSession, actions]);

  return {
    // State
    currentSession,
    isActive,
    currentStep,
    stepProgress,
    overallProgress,
    canAdvance,

    // Actions
    initializeWorkflow,
    advanceStep,
    completeWorkflow,
    handleError,
    updateStepProgress: actions.updateStepProgress,
    trackUserAction: actions.trackUserAction,

    // PDF operations
    pdfGeneration: store.pdfGeneration,
    startPDFGeneration: store.startPDFGeneration,

    // Preferences
    preferences: store.preferences,
    updatePreferences: actions.updatePreferences,

    // Utility
    getNextStep
  };
};

// Hook for workflow step management
export const useWorkflowStep = (step: PayrollWorkflowStep) => {
  const store = usePayrollWorkflowStore();
  const currentSession = store.currentSession;

  const stepStatus = useMemo(() => {
    if (!currentSession?.state.stepProgress) return null;
    return currentSession.state.stepProgress[step];
  }, [currentSession, step]);

  const isActive = useMemo(() => {
    return currentSession?.state.currentStep === step;
  }, [currentSession, step]);

  const isCompleted = useMemo(() => {
    return stepStatus?.status === 'completed';
  }, [stepStatus]);

  const hasError = useMemo(() => {
    return stepStatus?.status === 'error';
  }, [stepStatus]);

  const canExecute = useMemo(() => {
    if (!currentSession?.state.stepProgress) return false;

    // Check if previous steps are completed
    const steps: PayrollWorkflowStep[] = ['draft', 'preview', 'review', 'corrections', 'approve', 'save', 'process', 'complete'];
    const currentIndex = steps.indexOf(step);

    if (currentIndex === 0) return true;

    // Check if all previous required steps are completed
    for (let i = 0; i < currentIndex; i++) {
      const prevStep = steps[i];
      const prevStatus = currentSession.state.stepProgress[prevStep];

      if (prevStep === 'corrections') continue; // corrections is optional

      if (!prevStatus || (prevStatus.status !== 'completed' && prevStatus.status !== 'skipped')) {
        return false;
      }
    }

    return true;
  }, [currentSession, step]);

  return {
    stepStatus,
    isActive,
    isCompleted,
    hasError,
    canExecute,
    progress: stepStatus?.progress || 0,
    error: stepStatus?.error
  };
};

// Hook for PDF generation status
export const usePDFGeneration = () => {
  const store = usePayrollWorkflowStore();

  const isGenerating = store.pdfGeneration.status === 'generating';
  const isCompleted = store.pdfGeneration.status === 'completed';
  const hasError = store.pdfGeneration.status === 'error';
  const progress = store.pdfGeneration.progress;
  const url = store.pdfGeneration.url;
  const error = store.pdfGeneration.error;
  const metadata = store.pdfGeneration.metadata;

  const startGeneration = useCallback(async (sessionId: string) => {
    return store.startPDFGeneration(sessionId);
  }, [store]);

  const resetGeneration = useCallback(() => {
    store.resetPDFGeneration();
  }, [store]);

  return {
    isGenerating,
    isCompleted,
    hasError,
    progress,
    url,
    error,
    metadata,
    startGeneration,
    resetGeneration
  };
};

// Hook for workflow analytics
export const useWorkflowAnalytics = () => {
  const store = usePayrollWorkflowStore();

  const analytics = store.analytics;
  const isTracking = !!analytics;

  const trackAction = useCallback((action: string, step: PayrollWorkflowStep, data?: any) => {
    store.trackUserAction(action, step, data);
  }, [store]);

  const getSessionDuration = useCallback(() => {
    if (!analytics) return 0;

    const endTime = analytics.endTime || new Date();
    return endTime.getTime() - analytics.startTime.getTime();
  }, [analytics]);

  const getStepDuration = useCallback((step: PayrollWorkflowStep) => {
    if (!analytics) return 0;
    return analytics.stepDurations[step] || 0;
  }, [analytics]);

  const getActionCount = useCallback(() => {
    if (!analytics) return 0;
    return analytics.userActions.length;
  }, [analytics]);

  const getErrorCount = useCallback(() => {
    if (!analytics) return 0;
    return analytics.errorCount;
  }, [analytics]);

  return {
    analytics,
    isTracking,
    trackAction,
    getSessionDuration,
    getStepDuration,
    getActionCount,
    getErrorCount
  };
};

// Hook for workflow preferences
export const useWorkflowPreferences = () => {
  const store = usePayrollWorkflowStore();

  const preferences = store.preferences;

  const updatePreference = useCallback((key: keyof typeof preferences, value: any) => {
    store.updatePreferences({ [key]: value });
  }, [store]);

  const resetPreferences = useCallback(() => {
    store.resetPreferences();
  }, [store]);

  const isAutoSaveEnabled = preferences.enableAutoSave;
  const isAccessibilityEnabled = preferences.enableAccessibilityMode;
  const isMobileOptimized = preferences.mobileOptimized;

  return {
    preferences,
    updatePreference,
    resetPreferences,
    isAutoSaveEnabled,
    isAccessibilityEnabled,
    isMobileOptimized
  };
};

export default usePayrollWorkflow;
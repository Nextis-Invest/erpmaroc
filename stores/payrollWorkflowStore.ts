import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools, persist } from 'zustand/middleware';
import type {
  PayrollWorkflowStep,
  WorkflowState,
  WorkflowStepStatus,
  ValidationError,
  WorkflowResult
} from '@/components/payroll/workflow/PayrollWorkflowEngine';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

// Workflow session data
interface WorkflowSession {
  id: string;
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  state: WorkflowState;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// PDF generation state
interface PDFGenerationState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  url?: string;
  error?: string;
  metadata?: {
    fileSize: number;
    pageCount: number;
    generatedAt: Date;
  };
}

// User preferences
interface WorkflowPreferences {
  enableAutoSave: boolean;
  autoSaveInterval: number; // seconds
  enableNotifications: boolean;
  preferredDocumentFormat: 'pdf' | 'html';
  enableAccessibilityMode: boolean;
  mobileOptimized: boolean;
  skipConfirmations: boolean;
  maxRetryAttempts: number;
}

// Analytics and performance tracking
interface WorkflowAnalytics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  stepDurations: Record<PayrollWorkflowStep, number>;
  errorCount: number;
  retryCount: number;
  userActions: Array<{
    action: string;
    timestamp: Date;
    step: PayrollWorkflowStep;
    data?: any;
  }>;
  performanceMetrics: {
    renderTime: number;
    apiResponseTimes: Record<string, number>;
    memoryUsage?: number;
  };
}

interface PayrollWorkflowStore {
  // Current workflow session
  currentSession: WorkflowSession | null;

  // All active and recent sessions
  sessions: WorkflowSession[];

  // PDF generation state
  pdfGeneration: PDFGenerationState;

  // User preferences
  preferences: WorkflowPreferences;

  // Analytics
  analytics: WorkflowAnalytics | null;

  // Global workflow state
  isWorkflowActive: boolean;
  globalError: string | null;

  // Actions
  createSession: (employee: PayrollEmployee, calculation: PayrollCalculation, period: PayrollPeriod) => string;
  updateSession: (sessionId: string, updates: Partial<WorkflowSession>) => void;
  setCurrentSession: (sessionId: string | null) => void;
  closeSession: (sessionId: string, result?: WorkflowResult) => void;

  // Workflow state management
  updateWorkflowState: (sessionId: string, state: Partial<WorkflowState>) => void;
  updateStepProgress: (sessionId: string, step: PayrollWorkflowStep, progress: Partial<WorkflowStepStatus>) => void;
  addValidationError: (sessionId: string, error: ValidationError) => void;
  clearValidationErrors: (sessionId: string) => void;

  // PDF generation
  startPDFGeneration: (sessionId: string) => Promise<void>;
  updatePDFProgress: (progress: number) => void;
  completePDFGeneration: (url: string, metadata: PDFGenerationState['metadata']) => void;
  failPDFGeneration: (error: string) => void;
  resetPDFGeneration: () => void;

  // User preferences
  updatePreferences: (updates: Partial<WorkflowPreferences>) => void;
  resetPreferences: () => void;

  // Analytics
  startAnalytics: (sessionId: string) => void;
  trackUserAction: (action: string, step: PayrollWorkflowStep, data?: any) => void;
  updatePerformanceMetrics: (metrics: Partial<WorkflowAnalytics['performanceMetrics']>) => void;
  endAnalytics: () => void;

  // Persistence and recovery
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;

  // Auto-save functionality
  enableAutoSave: () => void;
  disableAutoSave: () => void;

  // Cleanup
  cleanup: () => void;
}

const DEFAULT_PREFERENCES: WorkflowPreferences = {
  enableAutoSave: true,
  autoSaveInterval: 30,
  enableNotifications: true,
  preferredDocumentFormat: 'pdf',
  enableAccessibilityMode: true,
  mobileOptimized: true,
  skipConfirmations: false,
  maxRetryAttempts: 3
};

const DEFAULT_PDF_STATE: PDFGenerationState = {
  status: 'idle',
  progress: 0
};

// Auto-save interval reference
let autoSaveInterval: NodeJS.Timeout | null = null;

export const usePayrollWorkflowStore = create<PayrollWorkflowStore>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        currentSession: null,
        sessions: [],
        pdfGeneration: DEFAULT_PDF_STATE,
        preferences: DEFAULT_PREFERENCES,
        analytics: null,
        isWorkflowActive: false,
        globalError: null,

        // Session management
        createSession: (employee, calculation, period) => {
          const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date();

          const newSession: WorkflowSession = {
            id: sessionId,
            employee,
            calculation,
            period,
            state: {
              currentStep: 'draft',
              stepProgress: {
                draft: { status: 'active', canSkip: false, canRetry: true, progress: 0 },
                preview: { status: 'pending', canSkip: false, canRetry: true },
                review: { status: 'pending', canSkip: false, canRetry: true },
                corrections: { status: 'pending', canSkip: true, canRetry: true },
                approve: { status: 'pending', canSkip: false, canRetry: true },
                save: { status: 'pending', canSkip: false, canRetry: true },
                process: { status: 'pending', canSkip: false, canRetry: true },
                complete: { status: 'pending', canSkip: false, canRetry: true }
              },
              validationErrors: [],
              userDecisions: {},
              metadata: {
                startedAt: now,
                estimatedDuration: 320 // Total estimated seconds
              }
            },
            createdAt: now,
            updatedAt: now,
            isActive: true
          };

          set((state) => ({
            sessions: [...state.sessions, newSession],
            currentSession: newSession,
            isWorkflowActive: true
          }));

          // Start analytics
          get().startAnalytics(sessionId);

          // Enable auto-save if preference is set
          if (get().preferences.enableAutoSave) {
            get().enableAutoSave();
          }

          return sessionId;
        },

        updateSession: (sessionId, updates) => {
          set((state) => ({
            sessions: state.sessions.map(session =>
              session.id === sessionId
                ? { ...session, ...updates, updatedAt: new Date() }
                : session
            ),
            currentSession: state.currentSession?.id === sessionId
              ? { ...state.currentSession, ...updates, updatedAt: new Date() }
              : state.currentSession
          }));
        },

        setCurrentSession: (sessionId) => {
          const session = sessionId ? get().sessions.find(s => s.id === sessionId) : null;
          set({ currentSession: session, isWorkflowActive: !!session });
        },

        closeSession: (sessionId, result) => {
          const session = get().sessions.find(s => s.id === sessionId);
          if (session) {
            get().updateSession(sessionId, {
              isActive: false,
              state: {
                ...session.state,
                metadata: {
                  ...session.state.metadata,
                  actualDuration: Date.now() - session.state.metadata.startedAt.getTime()
                }
              }
            });

            // If this was the current session, clear it
            if (get().currentSession?.id === sessionId) {
              set({ currentSession: null, isWorkflowActive: false });
            }

            // End analytics
            get().endAnalytics();

            // Disable auto-save
            get().disableAutoSave();

            // Track completion
            if (result) {
              get().trackUserAction('workflow_completed', 'complete', result);
            }
          }
        },

        // Workflow state management
        updateWorkflowState: (sessionId, stateUpdates) => {
          get().updateSession(sessionId, {
            state: {
              ...get().sessions.find(s => s.id === sessionId)?.state!,
              ...stateUpdates
            }
          });
        },

        updateStepProgress: (sessionId, step, progress) => {
          const session = get().sessions.find(s => s.id === sessionId);
          if (session) {
            const updatedStepProgress = {
              ...session.state.stepProgress,
              [step]: {
                ...session.state.stepProgress[step],
                ...progress,
                timestamp: progress.status === 'completed' ? new Date() : session.state.stepProgress[step].timestamp
              }
            };

            get().updateWorkflowState(sessionId, {
              stepProgress: updatedStepProgress,
              currentStep: progress.status === 'completed' ? get().getNextStep(step) : session.state.currentStep
            });

            // Track step completion
            if (progress.status === 'completed') {
              get().trackUserAction('step_completed', step);
            }
          }
        },

        addValidationError: (sessionId, error) => {
          const session = get().sessions.find(s => s.id === sessionId);
          if (session) {
            get().updateWorkflowState(sessionId, {
              validationErrors: [...session.state.validationErrors, error]
            });
          }
        },

        clearValidationErrors: (sessionId) => {
          get().updateWorkflowState(sessionId, {
            validationErrors: []
          });
        },

        // PDF generation
        startPDFGeneration: async (sessionId) => {
          set({
            pdfGeneration: {
              status: 'generating',
              progress: 0
            }
          });

          get().trackUserAction('pdf_generation_started', get().currentSession?.state.currentStep || 'preview');

          try {
            // Simulate PDF generation with progress updates
            const session = get().sessions.find(s => s.id === sessionId);
            if (!session) throw new Error('Session not found');

            // Update progress incrementally
            for (let progress = 0; progress <= 100; progress += 10) {
              await new Promise(resolve => setTimeout(resolve, 200));
              get().updatePDFProgress(progress);
            }

            // Simulate API call for PDF generation
            const response = await fetch('/api/payroll/generate-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                employee: session.employee,
                calculation: session.calculation,
                period: session.period,
                sessionId
              })
            });

            if (!response.ok) {
              throw new Error(`PDF generation failed: ${response.statusText}`);
            }

            const data = await response.json();

            get().completePDFGeneration(data.url, {
              fileSize: data.fileSize,
              pageCount: data.pageCount,
              generatedAt: new Date()
            });

            get().trackUserAction('pdf_generation_completed', get().currentSession?.state.currentStep || 'preview');

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            get().failPDFGeneration(errorMessage);
            get().trackUserAction('pdf_generation_failed', get().currentSession?.state.currentStep || 'preview', { error: errorMessage });
          }
        },

        updatePDFProgress: (progress) => {
          set((state) => ({
            pdfGeneration: {
              ...state.pdfGeneration,
              progress: Math.min(100, Math.max(0, progress))
            }
          }));
        },

        completePDFGeneration: (url, metadata) => {
          set({
            pdfGeneration: {
              status: 'completed',
              progress: 100,
              url,
              metadata
            }
          });
        },

        failPDFGeneration: (error) => {
          set({
            pdfGeneration: {
              status: 'error',
              progress: 0,
              error
            }
          });
        },

        resetPDFGeneration: () => {
          set({ pdfGeneration: DEFAULT_PDF_STATE });
        },

        // User preferences
        updatePreferences: (updates) => {
          set((state) => ({
            preferences: { ...state.preferences, ...updates }
          }));

          // Apply auto-save preference
          if (updates.enableAutoSave !== undefined) {
            if (updates.enableAutoSave) {
              get().enableAutoSave();
            } else {
              get().disableAutoSave();
            }
          }
        },

        resetPreferences: () => {
          set({ preferences: DEFAULT_PREFERENCES });
        },

        // Analytics
        startAnalytics: (sessionId) => {
          const analytics: WorkflowAnalytics = {
            sessionId,
            startTime: new Date(),
            stepDurations: {
              draft: 0,
              preview: 0,
              review: 0,
              corrections: 0,
              approve: 0,
              save: 0,
              process: 0,
              complete: 0
            },
            errorCount: 0,
            retryCount: 0,
            userActions: [],
            performanceMetrics: {
              renderTime: 0,
              apiResponseTimes: {}
            }
          };

          set({ analytics });
        },

        trackUserAction: (action, step, data) => {
          const analytics = get().analytics;
          if (analytics) {
            const newAction = {
              action,
              timestamp: new Date(),
              step,
              data
            };

            set({
              analytics: {
                ...analytics,
                userActions: [...analytics.userActions, newAction]
              }
            });

            // Store in session storage for persistence
            try {
              const existingActions = JSON.parse(sessionStorage.getItem('payroll-workflow-actions') || '[]');
              existingActions.push(newAction);
              sessionStorage.setItem('payroll-workflow-actions', JSON.stringify(existingActions.slice(-50))); // Keep last 50 actions
            } catch (e) {
              console.warn('Failed to store user action:', e);
            }
          }
        },

        updatePerformanceMetrics: (metrics) => {
          const analytics = get().analytics;
          if (analytics) {
            set({
              analytics: {
                ...analytics,
                performanceMetrics: {
                  ...analytics.performanceMetrics,
                  ...metrics
                }
              }
            });
          }
        },

        endAnalytics: () => {
          const analytics = get().analytics;
          if (analytics) {
            const endTime = new Date();
            const totalDuration = endTime.getTime() - analytics.startTime.getTime();

            set({
              analytics: {
                ...analytics,
                endTime,
                totalDuration
              }
            });

            // Send analytics to server (optional)
            try {
              fetch('/api/analytics/workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analytics)
              }).catch(e => console.warn('Failed to send analytics:', e));
            } catch (e) {
              console.warn('Failed to send analytics:', e);
            }
          }
        },

        // Persistence
        saveToStorage: () => {
          const state = get();
          try {
            localStorage.setItem('payroll-workflow-state', JSON.stringify({
              sessions: state.sessions,
              currentSession: state.currentSession,
              preferences: state.preferences
            }));
          } catch (e) {
            console.warn('Failed to save to storage:', e);
          }
        },

        loadFromStorage: () => {
          try {
            const stored = localStorage.getItem('payroll-workflow-state');
            if (stored) {
              const data = JSON.parse(stored);
              set({
                sessions: data.sessions || [],
                currentSession: data.currentSession || null,
                preferences: { ...DEFAULT_PREFERENCES, ...data.preferences }
              });
            }
          } catch (e) {
            console.warn('Failed to load from storage:', e);
          }
        },

        clearStorage: () => {
          try {
            localStorage.removeItem('payroll-workflow-state');
            sessionStorage.removeItem('payroll-workflow-actions');
          } catch (e) {
            console.warn('Failed to clear storage:', e);
          }
        },

        // Auto-save
        enableAutoSave: () => {
          get().disableAutoSave(); // Clear any existing interval

          const interval = get().preferences.autoSaveInterval * 1000; // Convert to milliseconds
          autoSaveInterval = setInterval(() => {
            get().saveToStorage();
          }, interval);
        },

        disableAutoSave: () => {
          if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
          }
        },

        // Cleanup
        cleanup: () => {
          get().disableAutoSave();
          set({
            currentSession: null,
            sessions: [],
            pdfGeneration: DEFAULT_PDF_STATE,
            analytics: null,
            isWorkflowActive: false,
            globalError: null
          });
        },

        // Helper method to get next step
        getNextStep: (currentStep: PayrollWorkflowStep): PayrollWorkflowStep => {
          const stepOrder: PayrollWorkflowStep[] = [
            'draft', 'preview', 'review', 'corrections', 'approve', 'save', 'process', 'complete'
          ];
          const currentIndex = stepOrder.indexOf(currentStep);
          return stepOrder[currentIndex + 1] || currentStep;
        }
      })),
      {
        name: 'payroll-workflow-store',
        partialize: (state) => ({
          preferences: state.preferences,
          sessions: state.sessions.filter(s => s.isActive), // Only persist active sessions
        })
      }
    ),
    {
      name: 'payroll-workflow-store'
    }
  )
);

// Selectors for optimized component subscriptions
export const selectCurrentSession = (state: PayrollWorkflowStore) => state.currentSession;
export const selectIsWorkflowActive = (state: PayrollWorkflowStore) => state.isWorkflowActive;
export const selectPDFGeneration = (state: PayrollWorkflowStore) => state.pdfGeneration;
export const selectPreferences = (state: PayrollWorkflowStore) => state.preferences;
export const selectCurrentStep = (state: PayrollWorkflowStore) => state.currentSession?.state.currentStep;
export const selectStepProgress = (state: PayrollWorkflowStore) => state.currentSession?.state.stepProgress;
export const selectValidationErrors = (state: PayrollWorkflowStore) => state.currentSession?.state.validationErrors || [];

// Hook for easy access to workflow actions
export const useWorkflowActions = () => {
  const store = usePayrollWorkflowStore();
  return {
    createSession: store.createSession,
    updateStepProgress: store.updateStepProgress,
    startPDFGeneration: store.startPDFGeneration,
    closeSession: store.closeSession,
    trackUserAction: store.trackUserAction,
    updatePreferences: store.updatePreferences
  };
};

// Initialize store on client side
if (typeof window !== 'undefined') {
  // Load from storage on initialization
  usePayrollWorkflowStore.getState().loadFromStorage();

  // Auto-save on page unload
  window.addEventListener('beforeunload', () => {
    usePayrollWorkflowStore.getState().saveToStorage();
  });

  // Clear old sessions periodically (keep only last 24 hours)
  setInterval(() => {
    const state = usePayrollWorkflowStore.getState();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activeSessions = state.sessions.filter(
      session => session.isActive || session.updatedAt > oneDayAgo
    );

    if (activeSessions.length !== state.sessions.length) {
      usePayrollWorkflowStore.setState({ sessions: activeSessions });
    }
  }, 60 * 60 * 1000); // Check every hour
}
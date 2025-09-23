import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

// Workflow step definitions
export type PayrollWorkflowStep =
  | 'draft'
  | 'preview'
  | 'review'
  | 'corrections'
  | 'approve'
  | 'save'
  | 'process'
  | 'complete';

// Step status definitions
export type WorkflowStepStatus = {
  status: 'pending' | 'active' | 'completed' | 'error' | 'skipped';
  progress?: number;
  canSkip?: boolean;
  canRetry?: boolean;
  error?: string;
  result?: any;
  timestamp?: Date;
  duration?: number;
  retryCount?: number;
};

// Validation error interface
export interface ValidationError {
  step: PayrollWorkflowStep;
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
  canContinue?: boolean;
}

// User decision interface
export interface UserDecision {
  step: PayrollWorkflowStep;
  decision: string;
  value: any;
  timestamp: Date;
}

// Workflow state interface
export interface WorkflowState {
  currentStep: PayrollWorkflowStep;
  stepProgress: Record<PayrollWorkflowStep, WorkflowStepStatus>;
  validationErrors: ValidationError[];
  userDecisions: Record<string, UserDecision>;
  metadata: {
    startedAt: Date;
    estimatedDuration?: number;
    actualDuration?: number;
    completedAt?: Date;
  };
}

// Workflow result interface
export interface WorkflowResult {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  errors?: ValidationError[];
  metadata?: {
    processingTime: number;
    fileSize?: number;
    pageCount?: number;
  };
}

// Workflow configuration
interface WorkflowConfig {
  allowSkipSteps: boolean;
  maxRetryAttempts: number;
  autoSaveInterval: number;
  enableValidation: boolean;
  enableNotifications: boolean;
}

// Step definition interface
interface StepDefinition {
  id: PayrollWorkflowStep;
  name: string;
  description: string;
  required: boolean;
  estimatedDuration: number; // in seconds
  dependencies: PayrollWorkflowStep[];
  validations: ((data: any) => ValidationError[])[];
  actions: {
    onEnter?: (data: any) => Promise<void>;
    onExit?: (data: any) => Promise<void>;
    onRetry?: (data: any) => Promise<void>;
  };
}

// Default workflow configuration
const DEFAULT_CONFIG: WorkflowConfig = {
  allowSkipSteps: false,
  maxRetryAttempts: 3,
  autoSaveInterval: 30,
  enableValidation: true,
  enableNotifications: true
};

// Step definitions with validation rules
const STEP_DEFINITIONS: Record<PayrollWorkflowStep, StepDefinition> = {
  draft: {
    id: 'draft',
    name: 'Préparation du document',
    description: 'Validation des données et préparation du bulletin',
    required: true,
    estimatedDuration: 60,
    dependencies: [],
    validations: [
      (data) => {
        const errors: ValidationError[] = [];
        if (!data.employee) {
          errors.push({
            step: 'draft',
            field: 'employee',
            message: 'Données employé manquantes',
            severity: 'error',
            code: 'MISSING_EMPLOYEE'
          });
        }
        if (!data.calculation) {
          errors.push({
            step: 'draft',
            field: 'calculation',
            message: 'Calcul de paie manquant',
            severity: 'error',
            code: 'MISSING_CALCULATION'
          });
        }
        if (!data.period) {
          errors.push({
            step: 'draft',
            field: 'period',
            message: 'Période de paie manquante',
            severity: 'error',
            code: 'MISSING_PERIOD'
          });
        }
        return errors;
      }
    ],
    actions: {
      onEnter: async (data) => {
        console.log('Entering draft step with data:', data);
      }
    }
  },

  preview: {
    id: 'preview',
    name: 'Génération de l\'aperçu',
    description: 'Création de l\'aperçu PDF du bulletin',
    required: true,
    estimatedDuration: 45,
    dependencies: ['draft'],
    validations: [
      (data) => {
        const errors: ValidationError[] = [];
        if (data.calculation.salaire_net <= 0) {
          errors.push({
            step: 'preview',
            field: 'salaire_net',
            message: 'Le salaire net doit être positif',
            severity: 'error',
            code: 'INVALID_SALARY'
          });
        }
        return errors;
      }
    ],
    actions: {
      onEnter: async (data) => {
        console.log('Starting PDF preview generation for:', data.employee.nom);
      }
    }
  },

  review: {
    id: 'review',
    name: 'Révision du document',
    description: 'Vérification du contenu du bulletin généré',
    required: true,
    estimatedDuration: 90,
    dependencies: ['preview'],
    validations: [],
    actions: {}
  },

  corrections: {
    id: 'corrections',
    name: 'Corrections',
    description: 'Application des corrections nécessaires',
    required: false,
    estimatedDuration: 60,
    dependencies: ['review'],
    validations: [],
    actions: {}
  },

  approve: {
    id: 'approve',
    name: 'Approbation',
    description: 'Validation finale du document',
    required: true,
    estimatedDuration: 30,
    dependencies: ['review'],
    validations: [],
    actions: {}
  },

  save: {
    id: 'save',
    name: 'Sauvegarde',
    description: 'Enregistrement du document final',
    required: true,
    estimatedDuration: 15,
    dependencies: ['approve'],
    validations: [],
    actions: {}
  },

  process: {
    id: 'process',
    name: 'Traitement final',
    description: 'Finalisation et notification',
    required: true,
    estimatedDuration: 30,
    dependencies: ['save'],
    validations: [],
    actions: {}
  },

  complete: {
    id: 'complete',
    name: 'Terminé',
    description: 'Workflow complété avec succès',
    required: true,
    estimatedDuration: 0,
    dependencies: ['process'],
    validations: [],
    actions: {}
  }
};

// Workflow engine class
export class PayrollWorkflowEngine {
  private config: WorkflowConfig;
  private data: {
    employee?: PayrollEmployee;
    calculation?: PayrollCalculation;
    period?: PayrollPeriod;
  } = {};
  private state: WorkflowState | null = null;
  private listeners: ((state: WorkflowState) => void)[] = [];

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Initialize the workflow
  async initialize(
    employee: PayrollEmployee,
    calculation: PayrollCalculation,
    period: PayrollPeriod
  ): Promise<WorkflowState> {
    this.data = { employee, calculation, period };

    // Create initial state
    this.state = {
      currentStep: 'draft',
      stepProgress: this.createInitialStepProgress(),
      validationErrors: [],
      userDecisions: {},
      metadata: {
        startedAt: new Date(),
        estimatedDuration: this.calculateEstimatedDuration()
      }
    };

    // Validate initial data
    const validationErrors = this.validateStep('draft');
    if (validationErrors.length > 0) {
      this.state.validationErrors = validationErrors;
    }

    // Set draft step as active if no errors
    if (validationErrors.filter(e => e.severity === 'error').length === 0) {
      this.state.stepProgress.draft.status = 'active';
    }

    this.notifyListeners();
    return this.state;
  }

  // Create initial step progress
  private createInitialStepProgress(): Record<PayrollWorkflowStep, WorkflowStepStatus> {
    const progress: Record<PayrollWorkflowStep, WorkflowStepStatus> = {} as any;

    Object.keys(STEP_DEFINITIONS).forEach((stepId) => {
      const step = stepId as PayrollWorkflowStep;
      progress[step] = {
        status: 'pending',
        progress: 0,
        canSkip: !STEP_DEFINITIONS[step].required && this.config.allowSkipSteps,
        canRetry: true
      };
    });

    return progress;
  }

  // Calculate total estimated duration
  private calculateEstimatedDuration(): number {
    return Object.values(STEP_DEFINITIONS).reduce(
      (total, step) => total + step.estimatedDuration,
      0
    );
  }

  // Validate a specific step
  validateStep(step: PayrollWorkflowStep): ValidationError[] {
    if (!this.config.enableValidation) return [];

    const stepDef = STEP_DEFINITIONS[step];
    const errors: ValidationError[] = [];

    // Run all validations for this step
    stepDef.validations.forEach(validation => {
      errors.push(...validation(this.data));
    });

    return errors;
  }

  // Check if a step can be executed
  canExecuteStep(step: PayrollWorkflowStep): boolean {
    if (!this.state) return false;

    const stepDef = STEP_DEFINITIONS[step];

    // Check dependencies
    const dependenciesCompleted = stepDef.dependencies.every(dep =>
      this.state!.stepProgress[dep].status === 'completed'
    );

    // Check for blocking errors
    const hasBlockingErrors = this.state.validationErrors.some(
      error => error.step === step && error.severity === 'error' && !error.canContinue
    );

    return dependenciesCompleted && !hasBlockingErrors;
  }

  // Execute a step
  async executeStep(step: PayrollWorkflowStep, data?: any): Promise<void> {
    if (!this.state || !this.canExecuteStep(step)) {
      throw new Error(`Cannot execute step: ${step}`);
    }

    const stepDef = STEP_DEFINITIONS[step];
    const startTime = Date.now();

    try {
      // Update step status to active
      this.updateStepStatus(step, {
        status: 'active',
        progress: 0,
        timestamp: new Date()
      });

      // Run validation
      const errors = this.validateStep(step);
      if (errors.filter(e => e.severity === 'error').length > 0) {
        this.state.validationErrors.push(...errors);
        this.updateStepStatus(step, {
          status: 'error',
          error: 'Validation failed'
        });
        return;
      }

      // Execute step enter action
      if (stepDef.actions.onEnter) {
        await stepDef.actions.onEnter({ ...this.data, ...data });
      }

      // Mark step as completed
      const duration = Date.now() - startTime;
      this.updateStepStatus(step, {
        status: 'completed',
        progress: 100,
        duration,
        result: data
      });

      // Update current step to next step
      const nextStep = this.getNextStep(step);
      if (nextStep && nextStep !== step) {
        this.state.currentStep = nextStep;
        this.updateStepStatus(nextStep, {
          status: 'active',
          progress: 0
        });
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateStepStatus(step, {
        status: 'error',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      this.notifyListeners();
    }
  }

  // Update step status
  private updateStepStatus(step: PayrollWorkflowStep, status: Partial<WorkflowStepStatus>): void {
    if (!this.state) return;

    this.state.stepProgress[step] = {
      ...this.state.stepProgress[step],
      ...status
    };
  }

  // Get next step in workflow
  getNextStep(currentStep: PayrollWorkflowStep): PayrollWorkflowStep | null {
    const steps = Object.keys(STEP_DEFINITIONS) as PayrollWorkflowStep[];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null;
    }

    return steps[currentIndex + 1];
  }

  // Get previous step in workflow
  getPreviousStep(currentStep: PayrollWorkflowStep): PayrollWorkflowStep | null {
    const steps = Object.keys(STEP_DEFINITIONS) as PayrollWorkflowStep[];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex <= 0) {
      return null;
    }

    return steps[currentIndex - 1];
  }

  // Retry a failed step
  async retryStep(step: PayrollWorkflowStep): Promise<void> {
    if (!this.state) return;

    const stepProgress = this.state.stepProgress[step];
    const stepDef = STEP_DEFINITIONS[step];

    // Check retry attempts
    const retryCount = stepProgress.retryCount || 0;
    if (retryCount >= this.config.maxRetryAttempts) {
      throw new Error(`Maximum retry attempts exceeded for step: ${step}`);
    }

    // Update retry count
    this.updateStepStatus(step, {
      retryCount: retryCount + 1,
      status: 'active',
      progress: 0,
      error: undefined
    });

    // Execute retry action if available
    if (stepDef.actions.onRetry) {
      await stepDef.actions.onRetry(this.data);
    }

    // Re-execute the step
    await this.executeStep(step);
  }

  // Skip a step (if allowed)
  skipStep(step: PayrollWorkflowStep): void {
    if (!this.state) return;

    const stepProgress = this.state.stepProgress[step];
    if (!stepProgress.canSkip) {
      throw new Error(`Step cannot be skipped: ${step}`);
    }

    this.updateStepStatus(step, {
      status: 'skipped',
      progress: 100,
      timestamp: new Date()
    });

    // Move to next step
    const nextStep = this.getNextStep(step);
    if (nextStep && nextStep !== step) {
      this.state.currentStep = nextStep;
      this.updateStepStatus(nextStep, {
        status: 'active',
        progress: 0
      });
    }

    this.notifyListeners();
  }

  // Record user decision
  recordDecision(step: PayrollWorkflowStep, decision: string, value: any): void {
    if (!this.state) return;

    const userDecision: UserDecision = {
      step,
      decision,
      value,
      timestamp: new Date()
    };

    this.state.userDecisions[`${step}_${decision}`] = userDecision;
    this.notifyListeners();
  }

  // Complete workflow
  async completeWorkflow(): Promise<WorkflowResult> {
    if (!this.state) {
      throw new Error('Workflow not initialized');
    }

    const completedAt = new Date();
    const actualDuration = completedAt.getTime() - this.state.metadata.startedAt.getTime();

    this.state.metadata.completedAt = completedAt;
    this.state.metadata.actualDuration = actualDuration;

    // Mark complete step as completed
    this.updateStepStatus('complete', {
      status: 'completed',
      progress: 100,
      timestamp: completedAt
    });

    this.state.currentStep = 'complete';
    this.notifyListeners();

    // Return workflow result
    const result: WorkflowResult = {
      success: true,
      metadata: {
        processingTime: actualDuration
      }
    };

    return result;
  }

  // Get current state
  getState(): WorkflowState | null {
    return this.state;
  }

  // Subscribe to state changes
  subscribe(listener: (state: WorkflowState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    if (this.state) {
      this.listeners.forEach(listener => listener(this.state!));
    }
  }

  // Get step definition
  getStepDefinition(step: PayrollWorkflowStep): StepDefinition {
    return STEP_DEFINITIONS[step];
  }

  // Get all step definitions
  getAllSteps(): StepDefinition[] {
    return Object.values(STEP_DEFINITIONS);
  }

  // Calculate workflow progress percentage
  getOverallProgress(): number {
    if (!this.state) return 0;

    const completedSteps = Object.values(this.state.stepProgress).filter(
      progress => progress.status === 'completed' || progress.status === 'skipped'
    ).length;

    const totalSteps = Object.keys(STEP_DEFINITIONS).length;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  // Get estimated remaining time
  getEstimatedRemainingTime(): number {
    if (!this.state) return 0;

    const remainingSteps = Object.entries(this.state.stepProgress)
      .filter(([_, progress]) => progress.status === 'pending')
      .map(([stepId, _]) => STEP_DEFINITIONS[stepId as PayrollWorkflowStep]);

    return remainingSteps.reduce((total, step) => total + step.estimatedDuration, 0);
  }
}

export default PayrollWorkflowEngine;
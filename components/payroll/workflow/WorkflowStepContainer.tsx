'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronLeft, ChevronRight, Download, Save, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import type {
  PayrollWorkflowStep,
  WorkflowState,
  ValidationError
} from './PayrollWorkflowEngine';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

interface StepConfiguration {
  title: string;
  description: string;
  estimatedDuration: number;
  canSkip: boolean;
  validation: string;
  accessibilityLabel: string;
}

interface WorkflowStepContainerProps {
  step: PayrollWorkflowStep;
  configuration: StepConfiguration;
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  workflowState: WorkflowState;
  isProcessing: boolean;
  onProgress: (fromStep: PayrollWorkflowStep, toStep: PayrollWorkflowStep, data?: any) => Promise<void>;
  onValidate: (step: PayrollWorkflowStep, data?: any) => Promise<ValidationError[]>;
  onCancel?: () => void;
  mobileOptimized?: boolean;
  enableAccessibility?: boolean;
}

interface StepData {
  [key: string]: any;
}

// Step-specific components
const DraftStep: React.FC<{
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  onContinue: (data: StepData) => void;
  isProcessing: boolean;
}> = ({ employee, calculation, period, onContinue, isProcessing }) => {
  const [draftData, setDraftData] = useState({
    includeDeductions: true,
    includeBenefits: true,
    template: 'standard',
    format: 'pdf'
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations Employé</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Nom complet:</dt>
                <dd className="font-medium">{employee.prenom} {employee.nom}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">ID Employé:</dt>
                <dd className="font-medium">{employee.employeeId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Fonction:</dt>
                <dd className="font-medium">{employee.fonction}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calcul de Paie</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Salaire brut:</dt>
                <dd className="font-medium">{calculation.salaire_brut_global?.toLocaleString('fr-FR')} MAD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Déductions:</dt>
                <dd className="font-medium">
                  {(calculation.cnss_salariale + calculation.amo_salariale + calculation.ir_net).toLocaleString('fr-FR')} MAD
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="text-gray-600 font-semibold">Salaire net:</dt>
                <dd className="font-bold text-green-600">{calculation.salaire_net?.toLocaleString('fr-FR')} MAD</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Options de Génération</CardTitle>
          <CardDescription>Configurez les paramètres du bulletin de paie</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={draftData.includeDeductions}
                onChange={(e) => setDraftData(prev => ({ ...prev, includeDeductions: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Inclure le détail des déductions</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={draftData.includeBenefits}
                onChange={(e) => setDraftData(prev => ({ ...prev, includeBenefits: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Inclure les avantages</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Modèle de bulletin</label>
            <select
              value={draftData.template}
              onChange={(e) => setDraftData(prev => ({ ...prev, template: e.target.value }))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="detailed">Détaillé</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <Button
            onClick={() => onContinue(draftData)}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Préparation en cours...
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 mr-2" />
                Continuer vers l'aperçu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const PreviewStep: React.FC<{
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  workflowState: WorkflowState;
  onContinue: (data: StepData) => void;
  isProcessing: boolean;
}> = ({ employee, calculation, period, workflowState, onContinue, isProcessing }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generatePreview = useCallback(async () => {
    setGenerating(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPreviewUrl('/api/payroll/preview/' + Date.now());
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  return (
    <div className="space-y-6">
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          L'aperçu PDF est en cours de génération. Vous pourrez le réviser avant la finalisation.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aperçu du Bulletin de Paie</CardTitle>
          <CardDescription>
            {employee.prenom} {employee.nom} - {period.mois}/{period.annee}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-600">Génération de l'aperçu PDF...</p>
                <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto mt-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 min-h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-20 bg-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">PDF</span>
                  </div>
                  <p className="text-sm font-medium">Bulletin_Paie_{employee.nom}_{period.mois}_{period.annee}.pdf</p>
                  <p className="text-xs text-gray-600 mt-1">Aperçu généré avec succès</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Ouvrir l'aperçu
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger l'aperçu
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Aperçu généré avec succès</span>
                  </div>
                  <Button
                    onClick={() => onContinue({ previewUrl, confirmed: true })}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Continuer la révision
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-gray-600">Erreur lors de la génération de l'aperçu</p>
              <Button
                onClick={generatePreview}
                variant="outline"
                className="mt-2"
              >
                Réessayer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ReviewStep: React.FC<{
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  workflowState: WorkflowState;
  onContinue: (data: StepData) => void;
  onRequestCorrections: (corrections: string[]) => void;
  isProcessing: boolean;
}> = ({ employee, calculation, period, workflowState, onContinue, onRequestCorrections, isProcessing }) => {
  const [reviewData, setReviewData] = useState({
    userConfirmed: false,
    correctionsRequested: false,
    corrections: [] as string[],
    reviewComments: ''
  });

  const [newCorrection, setNewCorrection] = useState('');

  const addCorrection = () => {
    if (newCorrection.trim()) {
      setReviewData(prev => ({
        ...prev,
        corrections: [...prev.corrections, newCorrection.trim()],
        correctionsRequested: true
      }));
      setNewCorrection('');
    }
  };

  const removeCorrection = (index: number) => {
    setReviewData(prev => ({
      ...prev,
      corrections: prev.corrections.filter((_, i) => i !== index),
      correctionsRequested: prev.corrections.length > 1
    }));
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          Vérifiez attentivement toutes les informations du bulletin de paie.
          Vous pouvez demander des corrections si nécessaire.
        </AlertDescription>
      </Alert>

      {/* Review Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste de Vérification</CardTitle>
          <CardDescription>Vérifiez les éléments suivants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Informations personnelles correctes',
              'Salaire de base exact',
              'Déductions sociales conformes',
              'Calcul de l\'IR correct',
              'Salaire net cohérent',
              'Période de paie correcte'
            ].map((item, index) => (
              <label key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Corrections Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demandes de Correction</CardTitle>
          <CardDescription>Ajoutez vos commentaires si des corrections sont nécessaires</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCorrection}
              onChange={(e) => setNewCorrection(e.target.value)}
              placeholder="Décrivez la correction nécessaire..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && addCorrection()}
            />
            <Button onClick={addCorrection} variant="outline">
              Ajouter
            </Button>
          </div>

          {reviewData.corrections.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Corrections demandées:</h4>
              <ul className="space-y-1">
                {reviewData.corrections.map((correction, index) => (
                  <li key={index} className="flex items-center justify-between bg-yellow-50 p-2 rounded">
                    <span className="text-sm">{correction}</span>
                    <Button
                      onClick={() => removeCorrection(index)}
                      variant="ghost"
                      size="sm"
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Commentaires supplémentaires
            </label>
            <textarea
              value={reviewData.reviewComments}
              onChange={(e) => setReviewData(prev => ({ ...prev, reviewComments: e.target.value }))}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ajoutez vos commentaires..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {reviewData.corrections.length > 0 ? (
          <Button
            onClick={() => onRequestCorrections(reviewData.corrections)}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi des corrections...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Demander les corrections ({reviewData.corrections.length})
              </>
            )}
          </Button>
        ) : null}

        <Button
          onClick={() => onContinue({ ...reviewData, userConfirmed: true })}
          disabled={isProcessing || reviewData.corrections.length > 0}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validation en cours...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approuver et continuer
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Main container component
export function WorkflowStepContainer({
  step,
  configuration,
  employee,
  calculation,
  period,
  workflowState,
  isProcessing,
  onProgress,
  onValidate,
  onCancel,
  mobileOptimized = true,
  enableAccessibility = true
}: WorkflowStepContainerProps) {
  const [stepData, setStepData] = useState<StepData>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleContinue = useCallback(async (data: StepData = {}) => {
    // Validate current step
    const errors = await onValidate(step, data);

    if (errors.length > 0 && errors.some(e => e.severity === 'error' && !e.canContinue)) {
      setValidationErrors(errors);
      return;
    }

    // Progress to next step
    const nextStepMap: Record<PayrollWorkflowStep, PayrollWorkflowStep | null> = {
      draft: 'preview',
      preview: 'review',
      review: 'approve',
      corrections: 'review',
      approve: 'save',
      save: 'process',
      process: 'complete',
      complete: null
    };

    const nextStep = nextStepMap[step];
    if (nextStep) {
      await onProgress(step, nextStep, data);
    }
  }, [step, onValidate, onProgress]);

  const handleRequestCorrections = useCallback(async (corrections: string[]) => {
    await onProgress(step, 'corrections', { corrections });
  }, [step, onProgress]);

  const renderStepContent = () => {
    switch (step) {
      case 'draft':
        return (
          <DraftStep
            employee={employee}
            calculation={calculation}
            period={period}
            onContinue={handleContinue}
            isProcessing={isProcessing}
          />
        );

      case 'preview':
        return (
          <PreviewStep
            employee={employee}
            calculation={calculation}
            period={period}
            workflowState={workflowState}
            onContinue={handleContinue}
            isProcessing={isProcessing}
          />
        );

      case 'review':
        return (
          <ReviewStep
            employee={employee}
            calculation={calculation}
            period={period}
            workflowState={workflowState}
            onContinue={handleContinue}
            onRequestCorrections={handleRequestCorrections}
            isProcessing={isProcessing}
          />
        );

      case 'corrections':
        return (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Application des corrections</h3>
            <p className="text-gray-600">Les modifications demandées sont en cours d'application...</p>
          </div>
        );

      case 'approve':
        return (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-semibold mb-2">Prêt pour l'approbation finale</h3>
            <p className="text-gray-600 mb-6">Le bulletin de paie a été révisé et est prêt pour la validation finale.</p>
            <Button
              onClick={() => handleContinue({ finalApproval: true })}
              disabled={isProcessing}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approbation...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approuver définitivement
                </>
              )}
            </Button>
          </div>
        );

      case 'save':
        return (
          <div className="text-center py-12">
            <Save className="w-8 h-8 mx-auto mb-4 animate-pulse text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Sauvegarde en cours</h3>
            <p className="text-gray-600">Le bulletin est en cours de sauvegarde en base de données...</p>
          </div>
        );

      case 'process':
        return (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-600" />
            <h3 className="text-lg font-semibold mb-2">Traitement final</h3>
            <p className="text-gray-600">Finalisation du traitement et génération des documents...</p>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-bold mb-2 text-green-800">Workflow Terminé!</h3>
            <p className="text-gray-600 mb-6">
              Le bulletin de paie a été généré avec succès et sauvegardé.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le bulletin
              </Button>
              <Button>
                <Eye className="w-4 h-4 mr-2" />
                Voir le document
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Étape non implémentée: {step}</div>;
    }
  };

  return (
    <div
      className={`workflow-step-container ${mobileOptimized ? 'mobile-optimized' : ''}`}
      role="main"
      aria-label={configuration.accessibilityLabel}
    >
      {/* Step Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {configuration.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {configuration.description}
            </p>
          </div>

          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isProcessing}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          )}
        </div>

        {/* Step Progress */}
        {workflowState.stepProgress[step].progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${workflowState.stepProgress[step].progress}%` }}
              aria-label={`Progression: ${workflowState.stepProgress[step].progress}%`}
            />
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-2">Erreurs à corriger:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{error.field}:</span> {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
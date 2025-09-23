'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PayrollWorkflowEngine } from './PayrollWorkflowEngine';
import { usePayrollWorkflowStore, useWorkflowActions, selectCurrentSession } from '@/stores/payrollWorkflowStore';
import { usePayrollStore } from '@/stores/payrollStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Play, Pause, Square } from 'lucide-react';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';
import type { WorkflowResult } from './PayrollWorkflowEngine';

interface PayrollWorkflowIntegrationProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  onComplete?: (result: WorkflowResult) => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Integration component that bridges the PayrollCalculator with the new workflow system
 * This component demonstrates how to integrate the 8-step PDF workflow into your existing PayrollCalculator
 */
export function PayrollWorkflowIntegration({
  employee,
  calculation,
  period,
  onComplete,
  onCancel,
  className = ''
}: PayrollWorkflowIntegrationProps) {
  const currentSession = usePayrollWorkflowStore(selectCurrentSession);
  const isWorkflowActive = usePayrollWorkflowStore(state => state.isWorkflowActive);
  const pdfGeneration = usePayrollWorkflowStore(state => state.pdfGeneration);
  const preferences = usePayrollWorkflowStore(state => state.preferences);

  const { createSession, closeSession, trackUserAction } = useWorkflowActions();

  const [showWorkflow, setShowWorkflow] = useState(false);

  // Handle workflow start
  const handleStartWorkflow = useCallback(() => {
    const sessionId = createSession(employee, calculation, period);
    setShowWorkflow(true);
    trackUserAction('workflow_started', 'draft', { employeeId: employee._id });
  }, [employee, calculation, period, createSession, trackUserAction]);

  // Handle workflow completion
  const handleWorkflowComplete = useCallback((result: WorkflowResult) => {
    if (currentSession) {
      closeSession(currentSession.id, result);
    }
    setShowWorkflow(false);
    onComplete?.(result);
  }, [currentSession, closeSession, onComplete]);

  // Handle workflow cancellation
  const handleWorkflowCancel = useCallback(() => {
    if (currentSession) {
      closeSession(currentSession.id);
    }
    setShowWorkflow(false);
    onCancel?.();
  }, [currentSession, closeSession, onCancel]);

  // Auto-resume workflow if there's an active session
  useEffect(() => {
    if (currentSession && !showWorkflow) {
      setShowWorkflow(true);
    }
  }, [currentSession, showWorkflow]);

  // If workflow is active, show the workflow engine
  if (showWorkflow && currentSession) {
    return (
      <div className={`payroll-workflow-integration ${className}`}>
        <PayrollWorkflowEngine
          employee={employee}
          calculation={calculation}
          period={period}
          initialStep={currentSession.state.currentStep}
          onComplete={handleWorkflowComplete}
          onCancel={handleWorkflowCancel}
          onStepChange={(step, state) => {
            // Optional: Update parent component about step changes
            console.log('Workflow step changed:', step, state);
          }}
          enableAccessibilityMode={preferences.enableAccessibilityMode}
          mobileOptimized={preferences.mobileOptimized}
        />
      </div>
    );
  }

  // Show workflow launcher
  return (
    <div className={`payroll-workflow-launcher ${className}`}>
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Nouveau Workflow de Paie</span>
          </CardTitle>
          <CardDescription>
            Générez des bulletins de paie avec le nouveau système workflow en 8 étapes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Employee Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white rounded-lg border">
            <div>
              <span className="text-sm text-gray-600">Employé</span>
              <p className="font-medium">{employee.prenom} {employee.nom}</p>
              <p className="text-xs text-gray-500">{employee.employeeId}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Période</span>
              <p className="font-medium">{period.mois}/{period.annee}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Salaire Net</span>
              <p className="font-medium text-green-600">
                {calculation.salaire_net?.toLocaleString('fr-FR')} MAD
              </p>
            </div>
          </div>

          {/* Workflow Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Fonctionnalités du workflow:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Aperçu PDF en temps réel', enabled: true },
                { label: 'Validation par étapes', enabled: true },
                { label: 'Gestion des corrections', enabled: true },
                { label: 'Sauvegarde automatique', enabled: preferences.enableAutoSave },
                { label: 'Accessibilité WCAG 2.1', enabled: preferences.enableAccessibilityMode },
                { label: 'Interface mobile optimisée', enabled: preferences.mobileOptimized }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge
                    variant={feature.enabled ? 'default' : 'secondary'}
                    className="w-2 h-2 p-0 rounded-full"
                  />
                  <span className={feature.enabled ? 'text-gray-700' : 'text-gray-500'}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Generation Status */}
          {pdfGeneration.status !== 'idle' && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Génération PDF</span>
                <Badge
                  variant={
                    pdfGeneration.status === 'completed' ? 'default' :
                    pdfGeneration.status === 'error' ? 'destructive' :
                    'secondary'
                  }
                >
                  {pdfGeneration.status === 'generating' ? 'En cours' :
                   pdfGeneration.status === 'completed' ? 'Terminé' :
                   pdfGeneration.status === 'error' ? 'Erreur' : 'En attente'}
                </Badge>
              </div>

              {pdfGeneration.status === 'generating' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progression</span>
                    <span>{pdfGeneration.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pdfGeneration.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {pdfGeneration.status === 'error' && (
                <p className="text-sm text-red-600">{pdfGeneration.error}</p>
              )}

              {pdfGeneration.status === 'completed' && pdfGeneration.metadata && (
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Taille du fichier:</span>
                    <span>{(pdfGeneration.metadata.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre de pages:</span>
                    <span>{pdfGeneration.metadata.pageCount}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleStartWorkflow}
              disabled={isWorkflowActive}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {isWorkflowActive ? 'Workflow en cours...' : 'Démarrer le Workflow'}
            </Button>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Quick PDF generation without workflow
                  console.log('Quick PDF generation not implemented yet');
                }}
                disabled={isWorkflowActive}
              >
                PDF Rapide
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Open preferences/settings
                  console.log('Preferences not implemented yet');
                }}
              >
                Paramètres
              </Button>
            </div>
          </div>

          {/* Workflow Status (if active) */}
          {isWorkflowActive && currentSession && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-yellow-800">
                  Workflow actif - Étape: {currentSession.state.currentStep}
                </span>
              </div>
              <Button
                onClick={() => setShowWorkflow(true)}
                variant="outline"
                size="sm"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                Reprendre
              </Button>
            </div>
          )}

          {/* Tips */}
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>💡 Astuce:</strong> Le workflow vous guide à travers 8 étapes pour générer des bulletins de paie professionnels.</p>
            <p><strong>⌨️ Accessibilité:</strong> Utilisez Alt+N (suivant), Alt+C (annuler) pour naviguer rapidement.</p>
            <p><strong>💾 Sauvegarde:</strong> Vos données sont sauvegardées automatiquement toutes les {preferences.autoSaveInterval} secondes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example integration in your existing PayrollCalculator component:
 *
 * ```tsx
 * import { PayrollWorkflowIntegration } from './workflow/PayrollWorkflowIntegration';
 *
 * // In your PayrollCalculator component, replace the existing bulletin generation logic:
 *
 * const handlePreviewBulletin = async (previewEmployee?: PayrollEmployee) => {
 *   const employeeToPreview = previewEmployee || selectedEmployee;
 *
 *   if (!employeeToPreview || !currentPeriod) {
 *     alert('Données manquantes pour prévisualiser le bulletin');
 *     return;
 *   }
 *
 *   // Show the workflow instead of the old modal
 *   setShowWorkflowIntegration(true);
 * };
 *
 * // In your JSX:
 * {showWorkflowIntegration && selectedEmployee && employeeCalculation && currentPeriod && (
 *   <PayrollWorkflowIntegration
 *     employee={selectedEmployee}
 *     calculation={employeeCalculation}
 *     period={currentPeriod}
 *     onComplete={(result) => {
 *       console.log('Workflow completed:', result);
 *       setShowWorkflowIntegration(false);
 *       // Handle completion (show success message, refresh data, etc.)
 *     }}
 *     onCancel={() => {
 *       setShowWorkflowIntegration(false);
 *     }}
 *   />
 * )}
 * ```
 */

export default PayrollWorkflowIntegration;
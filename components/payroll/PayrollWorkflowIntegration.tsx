'use client';

import React, { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { PayrollWorkflowOrchestrator } from './workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

interface PayrollWorkflowIntegrationProps {
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  onWorkflowComplete?: (result: any) => void;
  onCancel?: () => void;
  className?: string;
}

interface WorkflowResult {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  metadata?: any;
}

export const PayrollWorkflowIntegration: React.FC<PayrollWorkflowIntegrationProps> = ({
  employee,
  calculation,
  period,
  onWorkflowComplete,
  onCancel,
  className
}) => {
  const { data: session } = useSession();
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Handle workflow launch
  const handleLaunchWorkflow = useCallback(() => {
    setShowWorkflow(true);
  }, []);

  // Handle workflow completion
  const handleWorkflowComplete = useCallback((result: any) => {
    console.log('Workflow completed with result:', result);

    const workflowResult: WorkflowResult = {
      success: true,
      documentId: result.documentId,
      documentUrl: result.documentUrl,
      metadata: result.metadata
    };

    setWorkflowResult(workflowResult);
    setShowWorkflow(false);
    setShowResultDialog(true);

    // Call parent callback
    if (onWorkflowComplete) {
      onWorkflowComplete(workflowResult);
    }
  }, [onWorkflowComplete]);

  // Handle workflow cancellation
  const handleWorkflowCancel = useCallback(() => {
    setShowWorkflow(false);

    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Handle result dialog close
  const handleResultDialogClose = useCallback(() => {
    setShowResultDialog(false);
    setWorkflowResult(null);
  }, []);

  // Render workflow launcher
  const renderWorkflowLauncher = () => (
    <Card className={cn("border-blue-200 bg-blue-50", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-3xl">🚀</div>
          <div>
            <CardTitle className="text-blue-800">
              Nouveau workflow PDF
            </CardTitle>
            <CardDescription className="text-blue-600">
              Générez le bulletin de paie avec le nouveau système de workflow
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-auto">
            Beta
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">📝</div>
            <h4 className="font-semibold text-sm">Préparation guidée</h4>
            <p className="text-xs text-gray-600">Validation automatique des données</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">👁️</div>
            <h4 className="font-semibold text-sm">Aperçu intelligent</h4>
            <p className="text-xs text-gray-600">Génération PDF optimisée</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">✅</div>
            <h4 className="font-semibold text-sm">Approbation intégrée</h4>
            <p className="text-xs text-gray-600">Validation et sauvegarde automatiques</p>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Nouveau !</strong> Ce workflow offre une expérience améliorée avec validation en temps réel,
            aperçu instantané et conformité WCAG 2.1 AA.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            onClick={handleLaunchWorkflow}
            className="flex-1"
          >
            🚀 Lancer le nouveau workflow
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Utiliser l'ancien système
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>
            Employé: <strong>{employee.prenom} {employee.nom}</strong> •
            Période: <strong>{period.mois}/{period.annee}</strong> •
            Salaire net: <strong>{calculation.salaire_net.toLocaleString('fr-FR')} DH</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Render result dialog
  const renderResultDialog = () => (
    <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            Workflow terminé avec succès
          </DialogTitle>
          <DialogDescription>
            Le bulletin de paie a été généré et sauvegardé avec succès.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {workflowResult && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="font-semibold text-sm">Document généré</p>
                  <p className="text-xs text-gray-600">PDF haute qualité</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">💾</div>
                  <p className="font-semibold text-sm">Sauvegardé</p>
                  <p className="text-xs text-gray-600">Base de données</p>
                </div>
              </div>

              {workflowResult.documentUrl && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Actions disponibles:</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(workflowResult.documentUrl, '_blank')}
                      className="flex-1"
                    >
                      👁️ Voir le document
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = workflowResult.documentUrl!;
                        link.download = `bulletin-${employee.nom}-${period.mois}-${period.annee}.pdf`;
                        link.click();
                      }}
                      className="flex-1"
                    >
                      📥 Télécharger
                    </Button>
                  </div>
                </div>
              )}

              {workflowResult.metadata && (
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Document ID: {workflowResult.documentId}</p>
                  {workflowResult.metadata.fileSize && (
                    <p>Taille: {Math.round(workflowResult.metadata.fileSize / 1024)} KB</p>
                  )}
                  {workflowResult.metadata.processingTime && (
                    <p>Temps de traitement: {workflowResult.metadata.processingTime}ms</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleResultDialogClose} className="flex-1">
            Terminer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {!showWorkflow ? (
        renderWorkflowLauncher()
      ) : (
        <PayrollWorkflowOrchestrator
          employee={employee}
          calculation={calculation}
          period={period}
          onWorkflowComplete={handleWorkflowComplete}
          onWorkflowCancel={handleWorkflowCancel}
          className={className}
          options={{
            enableAutoSave: true,
            showAdvancedOptions: false,
            enableAccessibilityMode: true,
            mobileOptimized: true
          }}
        />
      )}

      {renderResultDialog()}
    </>
  );
};

export default PayrollWorkflowIntegration;
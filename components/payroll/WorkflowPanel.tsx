'use client';

import React from 'react';
import { PayrollWorkflowOrchestrator } from './workflow/PayrollWorkflowOrchestrator';
import type { PayrollEmployee } from '@/types/payroll';

interface WorkflowPanelProps {
  useNewWorkflow: boolean;
  selectedEmployee: PayrollEmployee | null;
  employeeCalculation: any;
  currentPeriod: any;
  onToggleWorkflow: () => void;
  onPreviewBulletin: () => void;
  onDownloadBulletin: () => void;
  onPreviewSavedDocument: () => void;
  onDownloadSavedDocument: () => void;
  onDownloadAllDocuments: () => void;
  savedDocumentId: string | null;
}

export default function WorkflowPanel({
  useNewWorkflow,
  selectedEmployee,
  employeeCalculation,
  currentPeriod,
  onToggleWorkflow,
  onPreviewBulletin,
  onDownloadBulletin,
  onPreviewSavedDocument,
  onDownloadSavedDocument,
  onDownloadAllDocuments,
  savedDocumentId
}: WorkflowPanelProps) {
  if (useNewWorkflow && selectedEmployee && employeeCalculation && currentPeriod) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Workflow de Paie</h3>
          <PayrollWorkflowOrchestrator
            employee={selectedEmployee}
            calculation={employeeCalculation}
            period={currentPeriod}
            onStatusChange={(status) => console.log('Workflow status changed:', status)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Workflow de Paie</h3>

        {/* Legacy Workflow Actions */}
        {!useNewWorkflow && (
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-600">Génération du bulletin</p>
              <button
                onClick={onToggleWorkflow}
                className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition-colors"
              >
                🚀 Nouveau Workflow
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={onPreviewBulletin}
                className="px-2 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                💾 Générer & Sauvegarder
              </button>
              <button
                onClick={onDownloadBulletin}
                className="px-2 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
              >
                📄 Générer & Télécharger
              </button>
            </div>

            {/* Actions pour les documents sauvegardés */}
            {savedDocumentId && (
              <>
                <p className="text-xs text-gray-600 mb-2 mt-3">Document sauvegardé</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={onPreviewSavedDocument}
                    className="px-2 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                  >
                    👁️ Prévisualiser
                  </button>
                  <button
                    onClick={onDownloadSavedDocument}
                    className="px-2 py-2 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                  >
                    ⬇️ Télécharger
                  </button>
                </div>
              </>
            )}

            <button
              onClick={onDownloadAllDocuments}
              className="w-full px-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded text-xs hover:from-indigo-700 hover:to-purple-700 transition-colors font-semibold"
            >
              📦 Télécharger tous les documents
              <div className="text-[10px] opacity-90 mt-1">
                (Bulletin individuel + Préétabli CNSS global + Ordre de virement)
              </div>
            </button>
          </div>
        )}

        {/* Activate New Workflow */}
        {!useNewWorkflow && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Activez le nouveau workflow pour une expérience améliorée.
            </p>
            <button
              onClick={onToggleWorkflow}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              🚀 Activer le Nouveau Workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import { formatMontantMAD } from '@/types/payroll';

interface CalculationResultsProps {
  calculation: any;
  onChangeEmployee: () => void;
  useNewWorkflow: boolean;
  onToggleWorkflow: () => void;
  onPreviewBulletin: () => void;
  onDownloadSavedDocument: () => void;
  onDownloadAllDocuments: () => void;
  savedDocumentId: string | null;
}

export default function CalculationResults({
  calculation,
  onChangeEmployee,
  useNewWorkflow,
  onToggleWorkflow,
  onPreviewBulletin,
  onDownloadSavedDocument,
  onDownloadAllDocuments,
  savedDocumentId
}: CalculationResultsProps) {
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Résultat du Calcul</h3>
          <button
            onClick={onChangeEmployee}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border rounded hover:bg-gray-50 transition-colors"
          >
            ← Changer d'employé
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenus */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-green-700 mb-3">Revenus</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Salaire de base:</span>
                <span className="font-medium">{formatMontantMAD(calculation.salaire_base)}</span>
              </div>
              <div className="flex justify-between">
                <span>Prime d'ancienneté:</span>
                <span className="font-medium">{formatMontantMAD(calculation.prime_anciennete)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Salaire brut:</span>
                <span>{formatMontantMAD(calculation.salaire_brut_global)}</span>
              </div>
            </div>
          </div>

          {/* Déductions */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-red-700 mb-3">Déductions</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>CNSS:</span>
                <span className="font-medium">{formatMontantMAD(calculation.cnss_salariale)}</span>
              </div>
              <div className="flex justify-between">
                <span>AMO:</span>
                <span className="font-medium">{formatMontantMAD(calculation.amo_salariale)}</span>
              </div>
              <div className="flex justify-between">
                <span>IR net:</span>
                <span className="font-medium">{formatMontantMAD(calculation.ir_net)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total déductions:</span>
                <span>
                  {formatMontantMAD(
                    calculation.cnss_salariale +
                    calculation.amo_salariale +
                    calculation.ir_net
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Salaire net - Full width below the two columns */}
        <div className="mt-4 border rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold text-blue-700 mb-3">Résultat Final</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {formatMontantMAD(calculation.salaire_net)}
              </div>
              <p className="text-sm text-gray-600">Salaire Net à Payer</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-700">
                {formatMontantMAD(
                  calculation.cnss_patronale +
                  calculation.amo_patronale +
                  calculation.taxe_formation
                )}
              </div>
              <p className="text-sm text-gray-600">Charges Patronales</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-700">
                {formatMontantMAD(calculation.cout_total_employeur)}
              </div>
              <p className="text-sm text-gray-600">Coût Total Employeur</p>
            </div>
          </div>
        </div>

        {/* Legacy Actions - Only if new workflow is not enabled */}
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
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                onClick={onPreviewBulletin}
                className="px-2 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
              >
                👁️ Prévisualiser
              </button>
              <button
                onClick={onDownloadSavedDocument}
                className="px-2 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={onDownloadAllDocuments}
                className="px-2 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
              >
                ⬇️ Télécharger
              </button>
            </div>
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
      </div>
    </div>
  );
}
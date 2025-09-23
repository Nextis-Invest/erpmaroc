'use client';

import React, { useEffect, useState } from 'react';
import { useSIMTDownload } from './OrdrVirementSIMT';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

interface OrdrVirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  onDownload: () => void;
  onSave: () => void;
}

const OrdrVirementModal: React.FC<OrdrVirementModalProps> = ({
  isOpen,
  onClose,
  employee,
  calculation,
  period,
  onDownload,
  onSave
}) => {
  const [simtContent, setSIMTContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { generateSingleEmployeeSIMT, previewSIMTContent } = useSIMTDownload();

  useEffect(() => {
    if (isOpen && employee && calculation && period) {
      generateSIMTPreview();
    }
  }, [isOpen, employee, calculation, period]);

  const generateSIMTPreview = () => {
    setLoading(true);
    try {
      const content = previewSIMTContent(
        [{ employee, calculation }],
        period
      );
      setSIMTContent(content);
    } catch (error) {
      console.error('Erreur lors de la génération du fichier SIMT:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Aperçu du Fichier SIMT - Ordre de Virement
            </h2>
            <p className="text-sm text-gray-600">
              {employee.prenom} {employee.nom} - {period.mois}/{period.annee}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* SIMT Content */}
        <div className="bg-gray-100 p-4 h-[calc(90vh-140px)] overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Génération du fichier SIMT...</p>
              </div>
            </div>
          ) : simtContent ? (
            <div className="bg-white rounded-lg p-6 h-full overflow-auto">
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500">
                <p className="text-sm text-blue-800">
                  <strong>Format SIMT</strong> - Fichier de virement bancaire compatible avec les banques marocaines
                </p>
              </div>
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-all bg-gray-50 p-4 rounded">
                {simtContent}
              </pre>
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Ce fichier sera traité automatiquement par votre banque pour effectuer le virement.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600">Erreur lors de la génération du fichier SIMT</p>
                <button
                  onClick={generateSIMTPreview}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>💾</span>
              <span>Sauvegarder dans la base</span>
            </button>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <span>⬇️</span>
              <span>Télécharger SIMT</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdrVirementModal;
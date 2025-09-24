'use client';

import React, { useEffect, useState } from 'react';
import { useBulletinPaieDownload } from './BulletinPaie';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';

interface BulletinPaieModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: PayrollEmployee;
  calculation: PayrollCalculation;
  period: PayrollPeriod;
  onDownload: () => void;
  onSave: () => void;
}

const BulletinPaieModal: React.FC<BulletinPaieModalProps> = ({
  isOpen,
  onClose,
  employee,
  calculation,
  period,
  onDownload,
  onSave
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { generateBulletinBlob } = useBulletinPaieDownload();

  useEffect(() => {
    if (isOpen && employee && calculation && period) {
      generatePdfPreview();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, employee, calculation, period]);

  const generatePdfPreview = async () => {
    setLoading(true);
    try {
      const blob = await generateBulletinBlob(
        employee,
        calculation,
        period
      );

      if (blob) {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        console.error('PDF blob is null');
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
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
              Aperçu du Bulletin de Paie
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

        {/* PDF Content */}
        <div className="bg-gray-100 p-4 h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement du PDF...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0 rounded"
              title="Aperçu du bulletin de paie"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600">Erreur lors du chargement du PDF</p>
                <button
                  onClick={generatePdfPreview}
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
              <span>Télécharger PDF</span>
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

export default BulletinPaieModal;
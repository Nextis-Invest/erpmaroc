'use client';

import React from 'react';
import BulletinPaiePreview from './BulletinPaiePreview';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Prévisualisation du Bulletin de Paie
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

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-140px)]">
          <BulletinPaiePreview
            employee={employee}
            calculation={calculation}
            period={period}
          />
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>💾</span>
              <span>Sauvegarder</span>
            </button>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <span>📄</span>
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
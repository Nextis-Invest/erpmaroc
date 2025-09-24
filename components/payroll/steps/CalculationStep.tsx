'use client';

import React from 'react';
import { formatMontantMAD, calculerAncienneteMois } from '@/types/payroll';
import type { PayrollEmployee } from '@/types/payroll';

interface CalculationStepProps {
  selectedEmployee: PayrollEmployee;
  currentPeriod: any;
  isLoading: boolean;
  onCalculate: () => void;
  onBackToForm: () => void;
  onBackToSelection: () => void;
}

export default function CalculationStep({
  selectedEmployee,
  currentPeriod,
  isLoading,
  onCalculate,
  onBackToForm,
  onBackToSelection
}: CalculationStepProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          3. Calcul de Paie - {selectedEmployee.prenom} {selectedEmployee.nom}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onBackToForm}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← Modifier
          </button>
          <button
            onClick={onBackToSelection}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Nouvel employé
          </button>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <p className="text-green-800 text-sm">
            ✅ Données employé mises à jour. Procédez au calcul de la paie.
          </p>
          <button
            onClick={onCalculate}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Calcul en cours...' : 'Calculer la Paie'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-xs text-gray-600">Salaire</span>
          <p className="font-semibold">{formatMontantMAD(selectedEmployee.salaire_base || 0)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-xs text-gray-600">Ancienneté</span>
          <p className="font-semibold">{calculerAncienneteMois(selectedEmployee.date_embauche)} mois</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-xs text-gray-600">Situation</span>
          <p className="font-semibold">{selectedEmployee.situation_familiale}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-xs text-gray-600">Période</span>
          <p className="font-semibold">{currentPeriod ? `${currentPeriod.mois}/${currentPeriod.annee}` : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
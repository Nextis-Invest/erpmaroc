'use client';

import React from 'react';
import EmployeeSelector from '../EmployeeSelector';
import type { PayrollEmployee } from '@/types/payroll';

interface EmployeeSelectionStepProps {
  currentPeriod: any;
  employees: PayrollEmployee[];
  loadingEmployees: boolean;
  isLoading: boolean;
  onSelectEmployee: (employeeId: string) => void;
  onCalculateAll: () => void;
}

export default function EmployeeSelectionStep({
  currentPeriod,
  employees,
  loadingEmployees,
  isLoading,
  onSelectEmployee,
  onCalculateAll
}: EmployeeSelectionStepProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">1. Sélectionner un Employé</h3>
      {!currentPeriod ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ Veuillez d&apos;abord créer une période de paie avant de sélectionner un employé.
          </p>
        </div>
      ) : (
        <EmployeeSelector
          employees={employees}
          loading={loadingEmployees}
          onSelectEmployee={onSelectEmployee}
        />
      )}

      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-gray-800">Calcul en Masse</h4>
            <p className="text-sm text-gray-600">Calculer tous les employés en une fois</p>
          </div>
          <button
            onClick={onCalculateAll}
            disabled={isLoading || !currentPeriod}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Calcul en cours...' : 'Calculer Tout'}
          </button>
        </div>
      </div>
    </div>
  );
}
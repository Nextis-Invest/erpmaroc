'use client';

import React from 'react';
import PayrollEmployeeForm from '../PayrollEmployeeForm';
import type { PayrollEmployee } from '@/types/payroll';

interface EmployeeFormStepProps {
  selectedEmployee: PayrollEmployee;
  onSave: (employee: PayrollEmployee) => void;
  onCancel: () => void;
  onPreview: () => void;
  onGenerateVirement: () => void;
}

export default function EmployeeFormStep({
  selectedEmployee,
  onSave,
  onCancel,
  onPreview,
  onGenerateVirement
}: EmployeeFormStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            2. Détails de Paie - {selectedEmployee.prenom} {selectedEmployee.nom}
          </h3>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ← Retour à la sélection
          </button>
        </div>
      </div>

      <PayrollEmployeeForm
        employee={selectedEmployee}
        mode="edit"
        onSave={onSave}
        onCancel={onCancel}
        onPreview={onPreview}
        onGenerateVirement={onGenerateVirement}
      />
    </div>
  );
}
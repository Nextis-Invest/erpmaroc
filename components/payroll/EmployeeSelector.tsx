'use client';

import React from 'react';
import { formatMontantMAD, calculerAncienneteMois } from '@/types/payroll';
import type { PayrollEmployee } from '@/types/payroll';

interface EmployeeSelectorProps {
  employees: PayrollEmployee[];
  loading: boolean;
  onSelectEmployee: (employeeId: string) => void;
}

export default function EmployeeSelector({ employees, loading, onSelectEmployee }: EmployeeSelectorProps) {
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-blue-800 text-sm">⏳ Chargement des employés...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-blue-800 text-sm">
          ℹ️ Aucun employé trouvé dans la base de données.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map(emp => (
        <div
          key={emp._id}
          onClick={() => onSelectEmployee(emp._id)}
          className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">
                {emp.prenom} {emp.nom}
              </h4>
              <p className="text-sm text-gray-600">{emp.employeeId}</p>
              {emp.fonction && (
                <p className="text-xs text-blue-600 font-medium">{emp.fonction}</p>
              )}
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              {formatMontantMAD(emp.salaire_base)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
            <div>
              <span className="block">Ancienneté:</span>
              <span className="font-medium">{calculerAncienneteMois(emp.date_embauche)} mois</span>
            </div>
            <div>
              <span className="block">Enfants:</span>
              <span className="font-medium">{emp.nombre_enfants}</span>
            </div>
            <div>
              <span className="block">Situation:</span>
              <span className="font-medium">
                {emp.situation_familiale === 'MARIE' ? 'Marié(e)' :
                 emp.situation_familiale === 'CELIBATAIRE' ? 'Célibataire' :
                 emp.situation_familiale === 'DIVORCE' ? 'Divorcé(e)' :
                 emp.situation_familiale === 'VEUF' ? 'Veuf/Veuve' : emp.situation_familiale}
              </span>
            </div>
            <div>
              <span className="block">Naissance:</span>
              <span className="font-medium">
                {emp.date_naissance ? new Date(emp.date_naissance).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
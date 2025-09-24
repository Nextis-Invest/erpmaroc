'use client';

import React from 'react';
import { getMoisNom } from '@/types/payroll';

interface PeriodSelectorProps {
  mois: number;
  annee: number;
  currentPeriod: any;
  onMoisChange: (mois: number) => void;
  onAnneeChange: (annee: number) => void;
  onCreatePeriod: () => void;
}

export default function PeriodSelector({
  mois,
  annee,
  currentPeriod,
  onMoisChange,
  onAnneeChange,
  onCreatePeriod
}: PeriodSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Période de Paie</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mois
          </label>
          <select
            value={mois}
            onChange={(e) => onMoisChange(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {getMoisNom(m)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Année
          </label>
          <input
            type="number"
            value={annee}
            onChange={(e) => onAnneeChange(parseInt(e.target.value))}
            min="2020"
            max="2030"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onCreatePeriod}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Créer Période
          </button>
        </div>
      </div>

      {currentPeriod && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Période active: <strong>{getMoisNom(currentPeriod.mois)} {currentPeriod.annee}</strong>
            {' - '}
            Statut: <strong>{currentPeriod.statut}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { useSIMTDownload } from './OrdrVirementSIMT';
import type { PayrollEmployee, PayrollCalculation, PayrollPeriod } from '@/types/payroll';
import { formatMontantMAD, getMoisNom } from '@/types/payroll';

interface BulkSIMTGeneratorProps {
  employees: PayrollEmployee[];
  calculations: Map<string, PayrollCalculation>;
  period: PayrollPeriod;
  onClose?: () => void;
}

const BulkSIMTGenerator: React.FC<BulkSIMTGeneratorProps> = ({
  employees,
  calculations,
  period,
  onClose
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const { downloadSIMTFile, previewSIMTContent } = useSIMTDownload();

  // Select all employees
  const handleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(e => e._id)));
    }
  };

  // Toggle individual employee
  const handleToggleEmployee = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  // Generate preview
  const handlePreview = () => {
    const selectedData = employees
      .filter(emp => selectedEmployees.has(emp._id))
      .map(emp => ({
        employee: emp,
        calculation: calculations.get(emp._id) || {
          salaireBase: emp.salaire_base || 0,
          salaireNet: emp.salaire_net || 0,
          retenueCNSS: 0,
          retenueAMO: 0,
          retenueIR: 0,
          totalRetenues: 0,
          primes: 0,
          indemnites: 0,
          avantages: 0
        }
      }));

    if (selectedData.length === 0) {
      alert('Veuillez sélectionner au moins un employé');
      return;
    }

    const content = previewSIMTContent(selectedData, period);
    setPreviewContent(content);
    setShowPreview(true);
  };

  // Generate and download SIMT file
  const handleGenerateSIMT = async () => {
    setIsGenerating(true);

    const selectedData = employees
      .filter(emp => selectedEmployees.has(emp._id))
      .map(emp => ({
        employee: emp,
        calculation: calculations.get(emp._id) || {
          salaireBase: emp.salaire_base || 0,
          salaireNet: emp.salaire_net || 0,
          retenueCNSS: 0,
          retenueAMO: 0,
          retenueIR: 0,
          totalRetenues: 0,
          primes: 0,
          indemnites: 0,
          avantages: 0
        }
      }));

    if (selectedData.length === 0) {
      alert('Veuillez sélectionner au moins un employé');
      setIsGenerating(false);
      return;
    }

    try {
      const result = await downloadSIMTFile(
        selectedData,
        period,
        undefined,
        {
          saveToDatabase: true,
          downloadFile: true
        }
      );

      if (result.success) {
        alert(`Fichier SIMT généré avec succès pour ${selectedData.length} employé(s)`);
        if (onClose) onClose();
      } else {
        alert('Erreur lors de la génération du fichier SIMT');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du fichier SIMT');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    return employees
      .filter(emp => selectedEmployees.has(emp._id))
      .reduce((total, emp) => {
        const calc = calculations.get(emp._id);
        return total + (calc?.salaireNet || emp.salaire_net || 0);
      }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Générer Fichier SIMT - Virements Bancaires en Masse
      </h2>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Période:</strong> {getMoisNom(period.mois)} {period.annee}
        </p>
        <p className="text-sm text-blue-800 mt-1">
          <strong>Format:</strong> SIMT - Compatible avec les banques marocaines
        </p>
      </div>

      {/* Employee Selection Table */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Sélectionner les employés</h3>
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {selectedEmployees.size === employees.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.size === employees.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Matricule
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nom & Prénom
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  RIB
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Salaire Net
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => {
                const calculation = calculations.get(employee._id);
                const netSalary = calculation?.salaireNet || employee.salaire_net || 0;
                const isSelected = selectedEmployees.has(employee._id);

                return (
                  <tr
                    key={employee._id}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleEmployee(employee._id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{employee.employeeId}</td>
                    <td className="px-4 py-3 text-sm">
                      {employee.nom} {employee.prenom}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {employee.rib || 'Non renseigné'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      {formatMontantMAD(netSalary)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Employés sélectionnés</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedEmployees.size} / {employees.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Montant total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatMontantMAD(calculateTotal())}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type de fichier</p>
            <p className="text-2xl font-bold text-gray-900">
              .SIMT
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Aperçu du fichier SIMT</h3>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <pre className="font-mono text-xs bg-gray-50 p-4 rounded">
                {previewContent}
              </pre>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePreview}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            disabled={selectedEmployees.size === 0 || isGenerating}
          >
            <span>👁️</span>
            Aperçu
          </button>
          <button
            onClick={handleGenerateSIMT}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            disabled={selectedEmployees.size === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Génération...
              </>
            ) : (
              <>
                <span>🏦</span>
                Générer Fichier SIMT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkSIMTGenerator;
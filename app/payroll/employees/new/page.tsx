'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PayrollEmployeeForm from '@/components/payroll/PayrollEmployeeForm';
import type { PayrollEmployee } from '@/types/payroll';

export default function NewEmployeePage() {
  const router = useRouter();

  const handleSave = (employee: PayrollEmployee) => {
    console.log('Employé créé:', employee);
    // Redirection vers la liste ou la page de détail
    router.push('/payroll/employees');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/payroll" className="hover:text-gray-700">Paie</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <a href="/payroll/employees" className="hover:text-gray-700">Employés</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">Nouvel employé</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Ajouter un Nouvel Employé
                </h1>
                <p className="mt-2 text-gray-600">
                  Remplissez toutes les informations nécessaires pour le calcul de paie conforme aux normes marocaines
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  🇲🇦 Maroc
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  MAD (DH)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <PayrollEmployeeForm
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Footer Help */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Aide - Champs Obligatoires
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>N° Matricule :</strong> Identifiant unique de l&apos;employé (ex: EMP001)</li>
                  <li><strong>Nom/Prénom :</strong> État civil complet</li>
                  <li><strong>CIN :</strong> Carte d&apos;identité nationale marocaine</li>
                  <li><strong>Date d&apos;embauche :</strong> Nécessaire pour le calcul de l&apos;ancienneté</li>
                  <li><strong>Fonction :</strong> Poste occupé dans l&apos;entreprise</li>
                  <li><strong>Salaire de base :</strong> Montant de base en MAD pour le calcul</li>
                </ul>
              </div>
              <div className="mt-4 text-xs text-blue-600">
                <p><strong>Note :</strong> Les primes d&apos;ancienneté sont calculées automatiquement selon les barèmes marocains (5%, 10%, 15%, 20%, 25%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
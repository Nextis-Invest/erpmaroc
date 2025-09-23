'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the PayrollCalculator component
const PayrollCalculator = dynamic(
  () => import('@/components/payroll/PayrollCalculator'),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: false
  }
);

export default function PayrollPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête de la page */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Système de Paie Marocaine</h1>
              <p className="mt-2 text-blue-100">
                Instance Beta - Environnement de Test et Validation
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Version 1.0.0-beta</p>
              <p className="text-sm text-blue-100">Devise: MAD (DH)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations importantes */}
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Instance Beta:</strong> Cet environnement est destiné aux tests et validations.
                Les calculs sont basés sur les barèmes fiscaux marocains de 2024.
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                <li>CNSS: 4.48% (plafonné à 6000 DH)</li>
                <li>AMO: 2.26% (sans plafond)</li>
                <li>IR: Barème progressif de 0% à 38%</li>
                <li>Déductions familiales: 30 DH/personne (max 180 DH)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fonctionnalités disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-800">Calcul Individuel</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Calculez la paie d&apos;un employé spécifique avec tous les détails des cotisations et déductions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-800">Calcul en Masse</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Traitez tous les employés d&apos;une période en un seul clic pour gagner du temps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-4V5a2 2 0 00-2-2H5a2 2 0 00-2 2v8h1a3 3 0 010 6H3v2a2 2 0 002 2h14a2 2 0 002-2v-2h-1a3 3 0 010-6h1z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-800">Validation Beta</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Testez et validez les calculs avant le déploiement en production (Alpha).
            </p>
          </div>
        </div>

        {/* Composant principal de calcul */}
        <Suspense fallback={
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du calculateur de paie...</p>
          </div>
        }>
          <PayrollCalculator />
        </Suspense>

        {/* Pied de page avec informations supplémentaires */}
        <div className="mt-8 bg-gray-800 text-white rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Références Légales</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Code du travail marocain</li>
                <li>• Loi de finances 2024</li>
                <li>• Circulaires CNSS/AMO</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Support Technique</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Documentation API</li>
                <li>• Guide d&apos;utilisation</li>
                <li>• FAQ Paie Maroc</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• support@erp-maroc.ma</li>
                <li>• +212 5XX-XXX-XXX</li>
                <li>• Instance: Beta/Test</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
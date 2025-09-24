'use client';

import React from 'react';

interface PayrollHeaderProps {
  instance: string;
  version: string;
  activeTab: 'paie' | 'cnss';
  onTabChange: (tab: 'paie' | 'cnss') => void;
  error?: string;
  successMessage?: string;
}

export default function PayrollHeader({
  instance,
  version,
  activeTab,
  onTabChange,
  error,
  successMessage
}: PayrollHeaderProps) {
  return (
    <>
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              💼 Système de Paie Marocain
            </h1>
            <p className="text-blue-100 text-sm">
              Conforme aux réglementations CNSS et IR - Dirham Marocain (MAD)
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="text-blue-100">Taux en vigueur 2024:</div>
            <div className="mt-2 text-xs text-white bg-black bg-opacity-20 rounded-lg p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              <span>• CNSS: 4.48% (max 6000 DH)</span>
              <span>• AMO: 2.26%</span>
              <span>• IR: 0% à 38%</span>
              <span>• SMIG: 3111 DH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header with tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Gestion de la Paie et Déclarations
              </h2>
              <p className="text-gray-600 mt-1">
                Système de paie et déclarations CNSS conformes aux normes marocaines
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Instance: {instance.toUpperCase()}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                v{version}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                MAD (DH)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => onTabChange('paie')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'paie'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            💰 Gestion de la Paie
          </button>
          <button
            onClick={() => onTabChange('cnss')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'cnss'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            📋 Déclaration CNSS
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}
      </div>
    </>
  );
}
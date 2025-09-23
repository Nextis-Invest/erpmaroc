'use client';

import React, { useState } from 'react';
import { usePayrollStore } from '@/stores/payrollStore';
import { cnssDeclarationService } from '@/services/cnss/cnssDeclarationService';
import { cnssPreetabliService, CNSSPreetabliService } from '@/services/cnss/cnssPreetabliService';
import type { CNSSDeclaration } from '@/types/cnss';

type TabType = 'declaration' | 'bds' | 'preestablie';

export default function CNSSDeclarationComponent() {
  const { employees, calculations } = usePayrollStore();
  const [declaration, setDeclaration] = useState<CNSSDeclaration | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');
  const [preetabliContent, setPreetabliContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('declaration');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  const handleGenerateDeclaration = () => {
    setIsGenerating(true);
    try {
      const newDeclaration = cnssDeclarationService.generateDeclaration(
        { mois: selectedMonth, annee: selectedYear },
        employees,
        calculations
      );
      setDeclaration(newDeclaration);

      // Generate BDS file for standard declaration and BDS tabs
      if (activeTab === 'declaration' || activeTab === 'bds') {
        const content = cnssDeclarationService.generateBDSFile(newDeclaration);
        setFileContent(content);
      }

      // Generate préétabli file for préétablie tab
      if (activeTab === 'preestablie') {
        const preetabliData = cnssPreetabliService.generatePreetabliFile(newDeclaration);
        setPreetabliContent(preetabliData);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération de la déclaration CNSS');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFile = () => {
    if (!fileContent || !declaration) return;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const periode = `${selectedYear}${selectedMonth.toString().padStart(2, '0')}`;
    link.download = `DS_${declaration.entreprise.numero_affiliation}_${periode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!declaration) return;
    const csvContent = cnssDeclarationService.exportToCSV(declaration);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cnss_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const validateDeclaration = () => {
    if (!declaration) return;
    const validation = cnssDeclarationService.validateDeclaration(declaration);
    if (validation.valid) {
      alert('La déclaration est valide et prête à être envoyée');
    } else {
      alert(`Erreurs de validation:\n${validation.errors.join('\n')}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">📋 Déclaration CNSS</h2>
          <p className="mt-2 text-blue-100">
            Génération et gestion des déclarations mensuelles CNSS
          </p>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('declaration')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'declaration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Déclaration Standard
            </button>
            <button
              onClick={() => setActiveTab('bds')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bds'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 BDS (Bordereau Déclaratif)
            </button>
            <button
              onClick={() => setActiveTab('preestablie')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preestablie'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Préétablie
            </button>
          </nav>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'declaration' && (
          <div>
            {/* Sélection de la période */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Période de déclaration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[2023, 2024, 2025].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateDeclaration}
                    disabled={isGenerating || employees.length === 0}
                    className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                      isGenerating || employees.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isGenerating ? 'Génération...' : 'Générer la déclaration'}
                  </button>
                </div>
              </div>
            </div>

            {/* Résumé de la déclaration */}
            {declaration && (
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-4">📊 Résumé de la déclaration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Nombre d&apos;employés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {declaration.totaux.nombre_salaries}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total salaires bruts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {declaration.totaux.total_salaires_bruts.toLocaleString('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Cotisations salariales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {declaration.totaux.total_cotisations_salariales.toLocaleString('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Cotisations patronales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {declaration.totaux.total_cotisations_patronales.toLocaleString('fr-MA', {
                        style: 'currency',
                        currency: 'MAD',
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <button
                    onClick={validateDeclaration}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✅ Valider la déclaration
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📥 Télécharger le fichier BDS (.txt)
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    📊 Exporter en CSV
                  </button>
                </div>
              </div>
            )}

            {/* Message si pas d'employés */}
            {employees.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun employé trouvé
                </h3>
                <p className="text-gray-600">
                  Veuillez d&apos;abord calculer la paie des employés pour générer une déclaration CNSS.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Onglet BDS */}
        {activeTab === 'bds' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">🗂️ Bordereau de Déclaration Sociale (BDS)</h3>
            <p className="text-gray-600 mb-6">
              Le BDS est un document récapitulatif qui accompagne la déclaration CNSS mensuelle.
              Il détaille les cotisations sociales par employé pour la période sélectionnée.
            </p>

            {/* Sélection de la période pour BDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[2023, 2024, 2025].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleGenerateDeclaration}
                  disabled={isGenerating || employees.length === 0}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    isGenerating || employees.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? 'Génération...' : 'Générer le BDS'}
                </button>
              </div>
            </div>

            {/* Contenu BDS */}
            {declaration && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4">📋 En-tête du BDS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Numéro d&apos;affiliation CNSS</p>
                      <p className="font-semibold">{declaration.entreprise.numero_affiliation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Raison sociale</p>
                      <p className="font-semibold">{declaration.entreprise.raison_sociale}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Période</p>
                      <p className="font-semibold">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de génération</p>
                      <p className="font-semibold">{new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleDownloadFile}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    📥 Télécharger BDS (.txt)
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    📊 Exporter BDS (.csv)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    🖨️ Imprimer BDS
                  </button>
                </div>
              </div>
            )}

            {employees.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune donnée pour le BDS
                </h3>
                <p className="text-gray-600">
                  Veuillez d&apos;abord générer une déclaration CNSS pour créer le BDS correspondant.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Préétablie */}
        {activeTab === 'preestablie' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Déclaration Préétablie</h3>
            <p className="text-gray-600 mb-6">
              La déclaration préétablie permet de préremplir automatiquement les formulaires CNSS
              en utilisant les données de paie précédentes et les informations d&apos;employés déjà déclarés.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-yellow-800 mb-4">⚙️ Paramètres de pré-établissement</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                    Période de référence
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full p-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-800 mb-1">
                    Année de référence
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full p-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    {[2023, 2024, 2025].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateDeclaration}
                    disabled={isGenerating || employees.length === 0}
                    className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                      isGenerating || employees.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {isGenerating ? 'Génération...' : 'Générer la préétablie'}
                  </button>
                </div>
              </div>
            </div>

            {declaration && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">ℹ️ Informations de la déclaration préétablie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">Employés actifs</p>
                      <p className="text-2xl font-bold text-blue-900">{declaration.totaux.nombre_salaries}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Total des salaires</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {declaration.totaux.total_salaires_bruts.toLocaleString('fr-MA', {
                          style: 'currency',
                          currency: 'MAD',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Cotisations totales</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {declaration.totaux.total_cotisations.toLocaleString('fr-MA', {
                          style: 'currency',
                          currency: 'MAD',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    ✅ Valider et appliquer
                  </button>
                  <button
                    onClick={() => {
                      if (!preetabliContent || !declaration) return;
                      const blob = new Blob([preetabliContent], { type: 'text/plain;charset=utf-8' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      const periode = `${selectedYear}${selectedMonth.toString().padStart(2, '0')}`;
                      link.download = CNSSPreetabliService.generateFileName(
                        declaration.entreprise.numero_affiliation,
                        periode
                      );
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    }}
                    disabled={!preetabliContent}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400">
                    📥 Exporter la préétablie
                  </button>
                  <button className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2">
                    📋 Créer un modèle
                  </button>
                  <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                    🔄 Réinitialiser
                  </button>
                </div>
              </div>
            )}

            {employees.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune donnée pour la préétablie
                </h3>
                <p className="text-gray-600">
                  Veuillez d&apos;abord saisir les employés et calculer au moins une période de paie pour créer une préétablie.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
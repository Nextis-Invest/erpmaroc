'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePayrollStore } from '@/stores/payrollStore';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parseISO } from 'date-fns';
import type { PayrollEmployee } from '@/types/payroll';

interface PayrollEmployeeFormProps {
  employee?: PayrollEmployee;
  onSave?: (employee: PayrollEmployee) => void;
  onCancel?: () => void;
  onPreview?: (employee: PayrollEmployee) => void;
  onGenerateVirement?: (employee: PayrollEmployee) => void;
  mode?: 'create' | 'edit';
}

export default function PayrollEmployeeForm({
  employee,
  onSave,
  onCancel,
  onPreview,
  onGenerateVirement,
  mode = 'create'
}: PayrollEmployeeFormProps) {
  const { data: session } = useSession();
  const { addPayrollEmployee, updatePayrollEmployee } = usePayrollStore();

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  // Employee Information State
  const [formData, setFormData] = useState<Partial<PayrollEmployee>>({
    employeeId: employee?.employeeId || '',
    nom: employee?.nom || '',
    prenom: employee?.prenom || '',
    cin: employee?.cin || '',
    date_embauche: employee?.date_embauche || '',
    date_naissance: employee?.date_naissance || '',
    fonction: employee?.fonction || '',
    situation_familiale: employee?.situation_familiale || 'CELIBATAIRE',
    nombre_enfants: employee?.nombre_enfants || 0,
    cnss_numero: employee?.cnss_numero || '',
    mode_paiement: employee?.mode_paiement || 'VIR',

    // Salary & Working Time
    salaire_base: employee?.salaire_base || 0,
    taux_horaire: employee?.taux_horaire || 0,
    heures_travaillees: employee?.heures_travaillees || 191,
    jours_conges_payes: employee?.jours_conges_payes || 0,
    jours_feries: employee?.jours_feries || 0,
    heures_supp_25: employee?.heures_supp_25 || 0,
    heures_supp_50: employee?.heures_supp_50 || 0,
    heures_supp_100: employee?.heures_supp_100 || 0,

    // Allowances & Benefits
    prime_transport: employee?.prime_transport || 0,
    prime_panier: employee?.prime_panier || 0,
    indemnite_representation: employee?.indemnite_representation || 0,
    indemnite_deplacement: employee?.indemnite_deplacement || 0,
    autres_primes: employee?.autres_primes || 0,
    autres_indemnites: employee?.autres_indemnites || 0,

    // Deductions & Contributions
    cotisation_mutuelle: employee?.cotisation_mutuelle || 0,
    cotisation_cimr: employee?.cotisation_cimr || 0,
    avance_salaire: employee?.avance_salaire || 0,
    autres_deductions: employee?.autres_deductions || 0,

    // Banking Information
    rib: employee?.rib || '',
    banque: employee?.banque || '',
    code_banque: employee?.code_banque || '',
    swift_code: employee?.swift_code || '',
    cimr_numero: employee?.cimr_numero || '',
    adresse: employee?.adresse || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof PayrollEmployee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.employeeId?.trim()) {
      newErrors.employeeId = 'Le numéro d\'employé est requis';
    }
    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!formData.prenom?.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!formData.cin?.trim()) {
      newErrors.cin = 'Le CIN est requis';
    }
    if (!formData.date_embauche) {
      newErrors.date_embauche = 'La date d\'embauche est requise';
    }
    if (!formData.fonction?.trim()) {
      newErrors.fonction = 'La fonction est requise';
    }
    if (!formData.salaire_base || formData.salaire_base <= 0) {
      newErrors.salaire_base = 'Le salaire de base doit être supérieur à 0';
    }

    // Business rules validation
    if (formData.nombre_enfants && formData.nombre_enfants < 0) {
      newErrors.nombre_enfants = 'Le nombre d\'enfants ne peut pas être négatif';
    }
    if (formData.heures_travaillees && (formData.heures_travaillees < 0 || formData.heures_travaillees > 220)) {
      newErrors.heures_travaillees = 'Les heures travaillées doivent être entre 0 et 220';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const employeeData = {
        ...formData,
        _id: employee?._id || `emp_${Date.now()}`,
      } as PayrollEmployee;

      if (mode === 'create') {
        addPayrollEmployee(employeeData);
      } else if (employee?._id) {
        updatePayrollEmployee(employee._id, formData);
      }

      onSave?.(employeeData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      employeeId: '',
      nom: '',
      prenom: '',
      cin: '',
      date_embauche: '',
      date_naissance: '',
      fonction: '',
      situation_familiale: 'CELIBATAIRE',
      nombre_enfants: 0,
      cnss_numero: '',
      mode_paiement: 'VIR',
      salaire_base: 0,
      taux_horaire: 0,
      heures_travaillees: 191,
      jours_conges_payes: 0,
      jours_feries: 0,
      heures_supp_25: 0,
      heures_supp_50: 0,
      heures_supp_100: 0,
      prime_transport: 0,
      prime_panier: 0,
      indemnite_representation: 0,
      indemnite_deplacement: 0,
      autres_primes: 0,
      autres_indemnites: 0,
      cotisation_mutuelle: 0,
      cotisation_cimr: 0,
      avance_salaire: 0,
      autres_deductions: 0,
      rib: '',
      banque: '',
      code_banque: '',
      swift_code: '',
      cimr_numero: '',
      adresse: '',
    });
    setErrors({});
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {mode === 'create' ? 'Nouvel Employé' : 'Sauvegarder'}
        </h2>
        <p className="text-gray-600 mt-1">
          Informations complètes pour le calcul de paie marocain
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Informations Personnelles */}
        <div className="bg-gray-50 rounded-lg p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              📋 Informations Personnelles
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                🔒 Lecture seule
              </span>
              <span className="text-xs text-gray-500">
                (Modifiables dans le module RH)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Matricule *
              </label>
              <input
                type="text"
                value={formData.employeeId || ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="EMP001"
              />
              {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={formData.nom || ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="NAJI"
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.prenom || ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="ABDELLATIF"
              />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CIN *
              </label>
              <input
                type="text"
                value={formData.cin || ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="CD123456"
              />
              {errors.cin && <p className="text-red-500 text-xs mt-1">{errors.cin}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d&apos;embauche *
              </label>
              <input
                type="text"
                value={formData.date_embauche ? new Date(formData.date_embauche).toLocaleDateString('fr-FR') : ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Date d'embauche"
              />
              {errors.date_embauche && <p className="text-red-500 text-xs mt-1">{errors.date_embauche}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                type="text"
                value={formData.date_naissance ? new Date(formData.date_naissance).toLocaleDateString('fr-FR') : ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Date de naissance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonction *
              </label>
              <input
                type="text"
                value={formData.fonction || ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="RESPONSABLE"
              />
              {errors.fonction && <p className="text-red-500 text-xs mt-1">{errors.fonction}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Situation familiale
              </label>
              <input
                type="text"
                value={
                  formData.situation_familiale === 'MARIE' ? 'Marié(e)' :
                  formData.situation_familiale === 'CELIBATAIRE' ? 'Célibataire' :
                  formData.situation_familiale === 'DIVORCE' ? 'Divorcé(e)' :
                  formData.situation_familiale === 'VEUF' ? 'Veuf/Veuve' :
                  formData.situation_familiale || 'Célibataire'
                }
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d&apos;enfants
              </label>
              <input
                type="text"
                value={formData.nombre_enfants || 0}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              {errors.nombre_enfants && <p className="text-red-500 text-xs mt-1">{errors.nombre_enfants}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° de CNSS
              </label>
              <input
                type="text"
                value={formData.cnss_numero || ''}
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="CNSS123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode de paiement
              </label>
              <input
                type="text"
                value={
                  formData.mode_paiement === 'VIR' ? 'Virement' :
                  formData.mode_paiement === 'CHQ' ? 'Chèque' :
                  formData.mode_paiement === 'ESP' ? 'Espèces' :
                  'Virement'
                }
                readOnly
                className="w-full p-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Salaire et Temps de Travail */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💰 Salaire et Temps de Travail
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salaire de base (MAD) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.salaire_base || 0}
                onChange={(e) => handleInputChange('salaire_base', parseFloat(e.target.value) || 0)}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.salaire_base ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="15000.00"
              />
              {errors.salaire_base && <p className="text-red-500 text-xs mt-1">{errors.salaire_base}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux horaire (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.taux_horaire || 0}
                onChange={(e) => handleInputChange('taux_horaire', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="78.53"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heures travaillées
              </label>
              <input
                type="number"
                min="0"
                max="220"
                value={formData.heures_travaillees || 191}
                onChange={(e) => handleInputChange('heures_travaillees', parseInt(e.target.value) || 191)}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.heures_travaillees ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="191"
              />
              {errors.heures_travaillees && <p className="text-red-500 text-xs mt-1">{errors.heures_travaillees}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Congés payés (jours)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.jours_conges_payes || 0}
                onChange={(e) => handleInputChange('jours_conges_payes', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jours fériés
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.jours_feries || 0}
                onChange={(e) => handleInputChange('jours_feries', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heures supp. 25%
              </label>
              <input
                type="number"
                min="0"
                value={formData.heures_supp_25 || 0}
                onChange={(e) => handleInputChange('heures_supp_25', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heures supp. 50%
              </label>
              <input
                type="number"
                min="0"
                value={formData.heures_supp_50 || 0}
                onChange={(e) => handleInputChange('heures_supp_50', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heures supp. 100%
              </label>
              <input
                type="number"
                min="0"
                value={formData.heures_supp_100 || 0}
                onChange={(e) => handleInputChange('heures_supp_100', parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Primes et Indemnités */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎁 Primes et Indemnités
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prime de transport (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.prime_transport || 0}
                onChange={(e) => handleInputChange('prime_transport', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prime de panier (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.prime_panier || 0}
                onChange={(e) => handleInputChange('prime_panier', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indemnité de représentation (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.indemnite_representation || 0}
                onChange={(e) => handleInputChange('indemnite_representation', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indemnité de déplacement (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.indemnite_deplacement || 0}
                onChange={(e) => handleInputChange('indemnite_deplacement', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autres primes (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.autres_primes || 0}
                onChange={(e) => handleInputChange('autres_primes', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autres indemnités (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.autres_indemnites || 0}
                onChange={(e) => handleInputChange('autres_indemnites', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Déductions et Avances */}
        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📉 Déductions et Avances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cotisation mutuelle (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cotisation_mutuelle || 0}
                onChange={(e) => handleInputChange('cotisation_mutuelle', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cotisation CIMR (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cotisation_cimr || 0}
                onChange={(e) => handleInputChange('cotisation_cimr', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avance sur salaire (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.avance_salaire || 0}
                onChange={(e) => handleInputChange('avance_salaire', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1500.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Autres déductions (MAD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.autres_deductions || 0}
                onChange={(e) => handleInputChange('autres_deductions', parseFloat(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Informations Bancaires */}
        <div className="bg-purple-50 rounded-lg p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              🏦 Informations Bancaires
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                🔒 Lecture seule
              </span>
              <div className="group relative inline-block">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 cursor-help"
                  title="Pourquoi ces champs sont-ils protégés?"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded-lg p-3 -top-2 -translate-y-full left-1/2 -translate-x-1/2 w-64">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                  Les informations bancaires sont des données sensibles qui ne peuvent être modifiées que dans le module RH sécurisé pour des raisons de conformité et de sécurité.
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RIB (24 chiffres) *
                <span className="ml-2 text-xs text-gray-500">(Non modifiable)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.rib || ''}
                  readOnly
                  disabled
                  className="w-full p-2 pl-8 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                  placeholder="007123456789012345678901"
                  maxLength={24}
                />
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banque *
                <span className="ml-2 text-xs text-gray-500">(Non modifiable)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.banque || ''}
                  readOnly
                  disabled
                  className="w-full p-2 pl-8 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                  placeholder="Attijariwafa Bank"
                />
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Banque
                <span className="ml-2 text-xs text-gray-500">(Non modifiable)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.code_banque || ''}
                  readOnly
                  disabled
                  className="w-full p-2 pl-8 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                  placeholder="007"
                  maxLength={3}
                />
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code SWIFT
                <span className="ml-2 text-xs text-gray-500">(Non modifiable)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.swift_code || ''}
                  readOnly
                  disabled
                  className="w-full p-2 pl-8 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                  placeholder="BCMAMAMC"
                  maxLength={11}
                />
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° CIMR
                <span className="ml-2 text-xs text-gray-500">(Non modifiable)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cimr_numero || ''}
                  readOnly
                  disabled
                  className="w-full p-2 pl-8 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                  placeholder="1234567890"
                  maxLength={10}
                />
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <textarea
                value={formData.adresse || ''}
                onChange={(e) => handleInputChange('adresse', e.target.value)}
                readOnly={!isAdmin}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  !isAdmin
                    ? 'border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed'
                    : 'border-gray-300'
                }`}
                placeholder="123 Rue Mohammed V, Casablanca, Maroc"
                rows={2}
              />
            </div>
          </div>

          {/* Message d'information */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Information importante</p>
                <p className="mt-1">Les informations bancaires doivent être modifiées via le module RH pour des raisons de sécurité et de traçabilité. Contactez le département RH pour toute modification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t">
          {/* Primary Actions */}
          <div className="flex justify-end space-x-4 mb-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sauvegarde...' : (mode === 'create' ? 'Créer Employé' : 'Sauvegarder')}
            </button>
          </div>

          {/* Preview Actions - Only show in edit mode */}
          {mode === 'edit' && employee && onPreview && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-blue-800">Bulletin de Paie</h4>
                  <p className="text-sm text-blue-600">Générer et télécharger le bulletin PDF avec les données actuelles</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      const updatedEmployee = {
                        ...formData,
                        _id: employee._id,
                      } as PayrollEmployee;
                      onPreview(updatedEmployee);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <span>👁️</span>
                    <span>Prévisualiser Bulletin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedEmployee = {
                        ...formData,
                        _id: employee._id,
                      } as PayrollEmployee;
                      if (onGenerateVirement) {
                        onGenerateVirement(updatedEmployee);
                      }
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <span>🏦</span>
                    <span>Ordre de Virement</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
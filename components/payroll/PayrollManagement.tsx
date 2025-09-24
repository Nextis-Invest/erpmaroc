'use client';

import React, { useState, useEffect } from 'react';
import { usePayrollPeriods, type PayrollPeriod } from '@/hooks/usePayrollPeriods';
import PayrollPeriodsList from './PayrollPeriodsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  DollarSign,
  FileText,
  Edit3,
  Eye,
  ArrowLeft,
  Download,
  Send,
  Calculator,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PayrollManagementProps {
  onEditPayslips?: (periodId: string) => void;
}

const PayrollManagement: React.FC<PayrollManagementProps> = ({ onEditPayslips }) => {
  const {
    periods,
    selectedPeriod,
    loading,
    error,
    selectPeriod,
    createPeriod,
    getMonthName,
    getStatusLabel
  } = usePayrollPeriods();

  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  const handlePeriodSelect = (period: PayrollPeriod) => {
    selectPeriod(period);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    selectPeriod(null);
  };

  const handleEditPayslips = () => {
    if (selectedPeriod && onEditPayslips) {
      onEditPayslips(selectedPeriod._id);
    }
  };

  const getStatusColor = (statut: string): string => {
    switch (statut) {
      case 'BROUILLON':
        return 'bg-gray-100 text-gray-800';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800';
      case 'CLOTURE':
        return 'bg-green-100 text-green-800';
      case 'ARCHIVE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion de la Paie</h1>
            <p className="text-gray-600">
              Gérez les périodes de paie et éditez les bulletins des employés
            </p>
          </div>
        </div>

        <PayrollPeriodsList
          onPeriodSelect={handlePeriodSelect}
          selectedPeriodId={selectedPeriod?._id}
          title="Périodes de Paie"
        />

        {/* Statistics Summary */}
        {periods.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Périodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{periods.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">En Cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {periods.filter(p => p.statut === 'EN_COURS').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Clôturées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {periods.filter(p => p.statut === 'CLOTURE').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Employés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {periods.reduce((sum, p) => sum + (p.total_employees || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'details' && selectedPeriod) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBackToList}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la liste</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getMonthName(selectedPeriod.mois)} {selectedPeriod.annee}
              </h1>
              <p className="text-gray-600">Détails de la période de paie</p>
            </div>
          </div>

          <Badge className={getStatusColor(selectedPeriod.statut)}>
            {getStatusLabel(selectedPeriod.statut)}
          </Badge>
        </div>

        {/* Period Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Période</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {format(new Date(selectedPeriod.date_debut), 'dd MMM yyyy', { locale: fr })}
                <br />
                {format(new Date(selectedPeriod.date_fin), 'dd MMM yyyy', { locale: fr })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Employés</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedPeriod.total_employees || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Salaire Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">
                {selectedPeriod.total_salaries?.toLocaleString('fr-MA') || '0'} DH
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Net à Payer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-green-600">
                {selectedPeriod.total_net?.toLocaleString('fr-MA') || '0'} DH
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Actions Disponibles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="flex items-center space-x-2 h-12"
                onClick={handleEditPayslips}
              >
                <Edit3 className="w-4 h-4" />
                <span>Éditer les Bulletins</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 h-12"
              >
                <Eye className="w-4 h-4" />
                <span>Voir les Bulletins</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 h-12"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 h-12"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer par Email</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Period Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la Période</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Détails</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Créée le:</span>
                    <span>
                      {format(new Date(selectedPeriod.created_at || ''), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                  {selectedPeriod.created_by && (
                    <div className="flex justify-between">
                      <span>Créée par:</span>
                      <span>{selectedPeriod.created_by}</span>
                    </div>
                  )}
                  {selectedPeriod.closed_at && (
                    <div className="flex justify-between">
                      <span>Clôturée le:</span>
                      <span>
                        {format(new Date(selectedPeriod.closed_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                  )}
                  {selectedPeriod.closed_by && (
                    <div className="flex justify-between">
                      <span>Clôturée par:</span>
                      <span>{selectedPeriod.closed_by}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Totaux</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Salaires bruts:</span>
                    <span className="font-medium">
                      {selectedPeriod.total_salaries?.toLocaleString('fr-MA') || '0'} DH
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cotisations:</span>
                    <span className="font-medium">
                      {selectedPeriod.total_cotisations?.toLocaleString('fr-MA') || '0'} DH
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Net à payer:</span>
                    <span className="font-semibold text-green-600">
                      {selectedPeriod.total_net?.toLocaleString('fr-MA') || '0'} DH
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedPeriod.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedPeriod.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PayrollManagement;
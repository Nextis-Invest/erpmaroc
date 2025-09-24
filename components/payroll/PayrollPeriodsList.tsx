'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Archive,
  FileText,
  Users,
  DollarSign,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Refresh,
  Edit3,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PayrollPeriod {
  _id: string;
  mois: number;
  annee: number;
  date_debut: string;
  date_fin: string;
  statut: 'BROUILLON' | 'EN_COURS' | 'CLOTURE' | 'ARCHIVE';
  total_employees?: number;
  total_salaries?: number;
  total_cotisations?: number;
  total_net?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  closed_at?: string;
  closed_by?: string;
  notes?: string;
}

interface PayrollPeriodsListProps {
  onPeriodSelect: (period: PayrollPeriod) => void;
  onEditPeriod?: (period: PayrollPeriod) => void;
  selectedPeriodId?: string;
  showCreateButton?: boolean;
  title?: string;
}

const PayrollPeriodsList: React.FC<PayrollPeriodsListProps> = ({
  onPeriodSelect,
  onEditPeriod,
  selectedPeriodId,
  showCreateButton = true,
  title = "Périodes de Paie Sauvegardées"
}) => {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter) params.append('statut', statusFilter);
      if (yearFilter) params.append('annee', yearFilter);

      const response = await fetch(`/api/payroll/periods?${params}`);
      const data = await response.json();

      if (data.success) {
        setPeriods(data.data);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des périodes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [statusFilter, yearFilter]);

  const getMonthName = (mois: number): string => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[mois - 1] || `Mois ${mois}`;
  };

  const getStatusColor = (statut: string): string => {
    switch (statut) {
      case 'BROUILLON':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOTURE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'BROUILLON':
        return <FileText className="w-4 h-4" />;
      case 'EN_COURS':
        return <Clock className="w-4 h-4" />;
      case 'CLOTURE':
        return <CheckCircle className="w-4 h-4" />;
      case 'ARCHIVE':
        return <Archive className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (statut: string): string => {
    const labels = {
      'BROUILLON': 'Brouillon',
      'EN_COURS': 'En cours',
      'CLOTURE': 'Clôturée',
      'ARCHIVE': 'Archivée'
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const filteredPeriods = periods.filter(period => {
    const periodName = `${getMonthName(period.mois)} ${period.annee}`.toLowerCase();
    return periodName.includes(searchTerm.toLowerCase());
  });

  const availableYears = [...new Set(periods.map(p => p.annee))].sort((a, b) => b - a);

  const createNewPeriod = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
      const response = await fetch('/api/payroll/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mois: currentMonth,
          annee: currentYear,
          company_id: 'default'
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPeriods();
        if (data.data) {
          onPeriodSelect(data.data);
        }
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert('Erreur lors de la création de la période');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des périodes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchPeriods}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Refresh className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Cliquez sur une période pour éditer les bulletins de paie des employés
            </p>
          </div>
          {showCreateButton && (
            <button
              onClick={createNewPeriod}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Période</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une période..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="EN_COURS">En cours</option>
            <option value="CLOTURE">Clôturée</option>
            <option value="ARCHIVE">Archivée</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les années</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            onClick={fetchPeriods}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
            title="Actualiser"
          >
            <Refresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      {periods.length > 0 && (
        <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-blue-800 font-semibold">{periods.filter(p => p.statut === 'BROUILLON').length}</div>
              <div className="text-blue-600">Brouillon</div>
            </div>
            <div className="text-center">
              <div className="text-blue-800 font-semibold">{periods.filter(p => p.statut === 'EN_COURS').length}</div>
              <div className="text-blue-600">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-blue-800 font-semibold">{periods.filter(p => p.statut === 'CLOTURE').length}</div>
              <div className="text-blue-600">Clôturées</div>
            </div>
            <div className="text-center">
              <div className="text-blue-800 font-semibold">{periods.length}</div>
              <div className="text-blue-600">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Periods List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredPeriods.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune période trouvée</h3>
            <p className="text-gray-600 mb-4">
              {periods.length === 0
                ? "Aucune période de paie n'a été créée"
                : "Aucune période ne correspond à vos critères de recherche"}
            </p>
            {showCreateButton && periods.length === 0 && (
              <button
                onClick={createNewPeriod}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Créer votre première période</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPeriods.map((period) => (
              <div
                key={period._id}
                className={`p-6 transition-colors relative group ${
                  selectedPeriodId === period._id
                    ? 'bg-blue-50 border-r-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 cursor-pointer" onClick={() => onPeriodSelect(period)}>
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getMonthName(period.mois)} {period.annee}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">
                          {format(new Date(period.date_debut), 'dd/MM/yyyy', { locale: fr })}
                          {' - '}
                          {format(new Date(period.date_fin), 'dd/MM/yyyy', { locale: fr })}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(period.statut)}`}>
                          {getStatusIcon(period.statut)}
                          <span className="ml-1">{getStatusLabel(period.statut)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Statistics */}
                    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                      {period.total_employees !== undefined && period.total_employees > 0 && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{period.total_employees}</span>
                          <span className="text-gray-500">employés</span>
                        </div>
                      )}
                      {period.total_net !== undefined && period.total_net > 0 && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{period.total_net.toLocaleString('fr-MA')} DH</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      {onEditPeriod && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPeriod(period);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Modifier les paramètres"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onPeriodSelect(period)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Voir les bulletins de paie"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                    </div>
                  </div>
                </div>

                {/* Additional Info - Mobile */}
                <div className="md:hidden mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    {period.total_employees !== undefined && period.total_employees > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{period.total_employees}</span>
                      </div>
                    )}
                    {period.total_net !== undefined && period.total_net > 0 && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{period.total_net.toLocaleString('fr-MA')} DH</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {period.notes && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2">
                    <p>{period.notes}</p>
                  </div>
                )}

                {/* Selection indicator */}
                {selectedPeriodId === period._id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPeriodsList;
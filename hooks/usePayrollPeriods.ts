import { useState, useEffect, useCallback } from 'react';

export interface PayrollPeriod {
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
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  closed_at?: string;
  closed_by?: string;
  notes?: string;
}

interface UsePayrollPeriodsProps {
  autoFetch?: boolean;
  statusFilter?: string;
  yearFilter?: string;
}

interface UsePayrollPeriodsResult {
  periods: PayrollPeriod[];
  activePeriod: PayrollPeriod | null;
  selectedPeriod: PayrollPeriod | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectPeriod: (period: PayrollPeriod | null) => void;
  createPeriod: (mois: number, annee: number, notes?: string) => Promise<PayrollPeriod | null>;
  getMonthName: (mois: number) => string;
  getStatusLabel: (statut: string) => string;
}

export function usePayrollPeriods(props: UsePayrollPeriodsProps = {}): UsePayrollPeriodsResult {
  const { autoFetch = true, statusFilter, yearFilter } = props;
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<PayrollPeriod | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('statut', statusFilter);
      if (yearFilter) params.append('annee', yearFilter);

      const response = await fetch(`/api/payroll/periods?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du chargement des périodes');
      }

      const periodsData = result.data || [];
      setPeriods(periodsData);

      // Identifier la période active
      const active = periodsData.find(
        (p: PayrollPeriod) => p.statut === 'BROUILLON' || p.statut === 'EN_COURS'
      );
      setActivePeriod(active || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors du chargement des périodes:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, yearFilter]);

  const createPeriod = useCallback(async (
    mois: number,
    annee: number,
    notes?: string
  ): Promise<PayrollPeriod | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payroll/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mois,
          annee,
          company_id: 'default',
          notes: notes || ''
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPeriods();
        return data.data;
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la période');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la création de la période:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchPeriods]);

  const selectPeriod = useCallback((period: PayrollPeriod | null) => {
    setSelectedPeriod(period);
  }, []);

  const getMonthName = useCallback((mois: number): string => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[mois - 1] || `Mois ${mois}`;
  }, []);

  const getStatusLabel = useCallback((statut: string): string => {
    const labels = {
      'BROUILLON': 'Brouillon',
      'EN_COURS': 'En cours',
      'CLOTURE': 'Clôturée',
      'ARCHIVE': 'Archivée'
    };
    return labels[statut as keyof typeof labels] || statut;
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPeriods();
    }
  }, [autoFetch, fetchPeriods]);

  return {
    periods,
    activePeriod,
    selectedPeriod,
    loading,
    error,
    refetch: fetchPeriods,
    selectPeriod,
    createPeriod,
    getMonthName,
    getStatusLabel
  };
}
import { useState, useEffect } from 'react';

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
  created_at?: string;
  updated_at?: string;
}

interface UsePayrollPeriodsResult {
  periods: PayrollPeriod[];
  activePeriod: PayrollPeriod | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePayrollPeriods(): UsePayrollPeriodsResult {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<PayrollPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payroll/periods');
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
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  return {
    periods,
    activePeriod,
    loading,
    error,
    refetch: fetchPeriods
  };
}
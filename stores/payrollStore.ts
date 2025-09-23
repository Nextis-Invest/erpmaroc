import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  PayrollEmployee,
  PayrollPeriod,
  PayrollCalculation,
  PayrollSummary,
  PayrollSettings,
  PayrollReport,
  PayrollValidation,
  PayrollBulkOperation
} from '@/types/payroll';
import { DEFAULT_PAYROLL_SETTINGS } from '@/types/payroll';
import { serviceCalculPaie } from '@/services/payroll/payrollCalculationService';
import { allMockPayrollEmployees } from '@/lib/payroll/mockPayrollData';

interface PayrollStore {
  // État principal
  employees: PayrollEmployee[];
  currentPeriod: PayrollPeriod | null;
  calculations: PayrollCalculation[];
  summaries: PayrollSummary[];
  settings: PayrollSettings;
  reports: PayrollReport[];
  validations: PayrollValidation[];

  // État de l'interface
  selectedEmployee: PayrollEmployee | null;
  selectedCalculation: PayrollCalculation | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  currentView: 'dashboard' | 'calculs' | 'bulletins' | 'rapports' | 'parametres' | 'validation';

  // Filtres et pagination
  filters: {
    periode: string;
    departement: string;
    statut: string;
    recherche: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Instance Beta
  instance: 'beta';
  version: string;

  // Actions - Gestion des employés
  setPayrollEmployees: (employees: PayrollEmployee[]) => void;
  addPayrollEmployee: (employee: PayrollEmployee) => void;
  updatePayrollEmployee: (id: string, updates: Partial<PayrollEmployee>) => void;

  // Actions - Gestion des périodes
  setCurrentPeriod: (period: PayrollPeriod) => void;
  createPeriod: (mois: number, annee: number) => void;
  closePeriod: () => void;

  // Actions - Calculs de paie
  calculateSalary: (employeeId: string) => Promise<PayrollCalculation>;
  calculateAllSalaries: () => Promise<void>;
  validateCalculation: (calculationId: string) => void;
  approveCalculation: (calculationId: string, approverId: string) => void;
  recalculateSalary: (employeeId: string) => Promise<PayrollCalculation>;

  // Actions - Rapports
  generateReport: (type: PayrollReport['type'], format: PayrollReport['format']) => Promise<PayrollReport>;
  exportBulletinPaie: (employeeId: string, periodeId: string) => Promise<string>;

  // Actions - Paramètres
  updateSettings: (settings: Partial<PayrollSettings>) => void;
  resetSettings: () => void;

  // Actions - État UI
  setSelectedEmployee: (employee: PayrollEmployee | null) => void;
  setSelectedCalculation: (calculation: PayrollCalculation | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setCurrentView: (view: PayrollStore['currentView']) => void;
  setFilters: (filters: Partial<PayrollStore['filters']>) => void;
  resetFilters: () => void;

  // Actions - Opérations en masse
  startBulkOperation: (operation: PayrollBulkOperation['operation'], employeeIds?: string[]) => Promise<void>;
  cancelBulkOperation: () => void;

  // Getters calculés
  getEmployeesForPeriod: () => PayrollEmployee[];
  getCalculationsByEmployee: (employeeId: string) => PayrollCalculation[];
  getPendingCalculations: () => PayrollCalculation[];
  getApprovedCalculations: () => PayrollCalculation[];
  getCurrentPeriodSummary: () => PayrollSummary | null;
  getTotalCostForPeriod: () => number;

  // Initialization
  initializeMockData: () => void;
}

const initialState = {
  employees: [],
  currentPeriod: null,
  calculations: [],
  summaries: [],
  settings: DEFAULT_PAYROLL_SETTINGS,
  reports: [],
  validations: [],
  selectedEmployee: null,
  selectedCalculation: null,
  isLoading: false,
  error: null,
  successMessage: null,
  currentView: 'dashboard' as const,
  filters: {
    periode: '',
    departement: '',
    statut: '',
    recherche: ''
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  instance: 'beta' as const,
  version: '1.0.0-beta'
};

export const usePayrollStore = create<PayrollStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Gestion des employés
        setPayrollEmployees: (employees) => {
          // If no employees provided and current store is empty, use mock data
          if ((!employees || employees.length === 0) && get().employees.length === 0) {
            console.log('No employees provided, using mock payroll data');
            set({ employees: allMockPayrollEmployees });
          } else {
            set({ employees });
          }
        },

        addPayrollEmployee: (employee) =>
          set((state) => ({
            employees: [...state.employees, employee]
          })),

        updatePayrollEmployee: (id, updates) =>
          set((state) => ({
            employees: state.employees.map((emp) =>
              emp._id === id ? { ...emp, ...updates } : emp
            )
          })),

        // Gestion des périodes
        setCurrentPeriod: (period) => set({ currentPeriod: period }),

        createPeriod: (mois, annee) => {
          const period: PayrollPeriod = {
            _id: `period_${annee}_${mois.toString().padStart(2, '0')}_${Date.now()}`,
            mois,
            annee,
            date_debut: new Date(annee, mois - 1, 1).toISOString(),
            date_fin: new Date(annee, mois, 0).toISOString(),
            statut: 'BROUILLON'
          };
          set({ currentPeriod: period });
          console.log('Période créée avec ID:', period._id);
        },

        closePeriod: () =>
          set((state) => ({
            currentPeriod: state.currentPeriod
              ? { ...state.currentPeriod, statut: 'ARCHIVE' }
              : null
          })),

        // Calculs de paie
        calculateSalary: async (employeeId) => {
          const { employees, currentPeriod, settings } = get();
          const employee = employees.find(e => e._id === employeeId);

          if (!employee) {
            console.error('Employé non trouvé dans le store:', employeeId);
            console.log('Employés disponibles:', employees.map(e => ({ id: e._id, nom: e.nom })));
            throw new Error(`Employé introuvable: ${employeeId}`);
          }

          if (!currentPeriod) {
            console.error('Aucune période active');
            throw new Error('Aucune période active. Veuillez créer une période de paie.');
          }

          if (!currentPeriod._id) {
            console.error('ID de période manquant:', currentPeriod);
            // Créer un ID temporaire si nécessaire
            const tempPeriod = {
              ...currentPeriod,
              _id: `period_${currentPeriod.annee}_${currentPeriod.mois.toString().padStart(2, '0')}_${Date.now()}`
            };
            set({ currentPeriod: tempPeriod });
            console.log('Période mise à jour avec ID temporaire:', tempPeriod._id);
          }

          set({ isLoading: true, error: null });

          try {
            // Calcul de l'ancienneté
            const dateEmbauche = new Date(employee.date_embauche);
            const maintenant = new Date();
            const anciennete_mois =
              (maintenant.getFullYear() - dateEmbauche.getFullYear()) * 12 +
              (maintenant.getMonth() - dateEmbauche.getMonth());

            // Calcul des primes et autres éléments de rémunération
            const primesImposables = 
              (employee.prime_transport || 0) +
              (employee.prime_panier || 0) +
              (employee.indemnite_representation || 0) +
              (employee.indemnite_deplacement || 0) +
              (employee.autres_primes || 0);

            const primesNonImposables = employee.autres_indemnites || 0;

            // Appel au service de calcul avec tous les paramètres nécessaires
            const resultat = serviceCalculPaie.calculerPaie({
              salaire_base: employee.salaire_base,
              anciennete_mois,
              situation_familiale: employee.situation_familiale,
              nombre_enfants: employee.nombre_enfants,
              primes_imposables: primesImposables,
              primes_non_imposables: primesNonImposables,
              cimr_taux: (employee.cotisation_cimr || 0) / employee.salaire_base, // Convert montant to taux
              assurance_taux: (employee.cotisation_mutuelle || 0) / employee.salaire_base,
              autres_deductions: (employee.avance_salaire || 0) + (employee.autres_deductions || 0),
              heures_supplementaires: 
                (employee.heures_supp_25 || 0) + 
                (employee.heures_supp_50 || 0) + 
                (employee.heures_supp_100 || 0),
              taux_heures_sup: 1.25 // Taux moyen pour les heures sup
            });

            // Création de l'objet PayrollCalculation
            const calculation: PayrollCalculation = {
              employee_id: employeeId,
              periode_id: currentPeriod._id,
              date_calcul: new Date().toISOString(),
              instance: 'beta',
              salaire_base: employee.salaire_base,
              anciennete_mois,
              prime_anciennete: resultat.prime_anciennete,
              primes_imposables: primesImposables,
              primes_non_imposables: primesNonImposables,
              salaire_brut_global: resultat.salaire_brut_global,
              salaire_brut_imposable: resultat.salaire_brut_imposable,
              cnss_salariale: parseFloat(resultat.cnss_salariale),
              amo_salariale: parseFloat(resultat.amo_salariale),
              frais_professionnels: parseFloat(resultat.frais_professionnels),
              salaire_net_imposable: parseFloat(resultat.salaire_net_imposable),
              ir_brut: parseFloat(resultat.ir_brut),
              charges_familiales: resultat.charges_familiales,
              ir_net: parseFloat(resultat.ir_net),
              salaire_net: parseFloat(resultat.salaire_net),
              cnss_patronale: parseFloat(resultat.contributions_patronales.cnss),
              amo_patronale: parseFloat(resultat.contributions_patronales.amo),
              taxe_formation: parseFloat(resultat.contributions_patronales.formation),
              cout_total_employeur:
                resultat.salaire_brut_global + parseFloat(resultat.contributions_patronales.total)
            };

            set((state) => ({
              calculations: [...state.calculations, calculation],
              isLoading: false,
              successMessage: `Calcul de paie effectué pour ${employee.prenom} ${employee.nom}`
            }));

            return calculation;
          } catch (error) {
            set({
              isLoading: false,
              error: `Erreur lors du calcul: ${error}`
            });
            throw error;
          }
        },

        calculateAllSalaries: async () => {
          const { employees } = get();
          set({ isLoading: true, error: null });

          try {
            for (const employee of employees) {
              await get().calculateSalary(employee._id);
            }

            set({
              isLoading: false,
              successMessage: `Calcul effectué pour ${employees.length} employés`
            });
          } catch (error) {
            set({
              isLoading: false,
              error: `Erreur lors du calcul en masse: ${error}`
            });
            throw error;
          }
        },

        validateCalculation: (calculationId) =>
          set((state) => ({
            calculations: state.calculations.map((calc) =>
              calc._id === calculationId ? { ...calc, approuve: true } : calc
            )
          })),

        approveCalculation: (calculationId, approverId) =>
          set((state) => ({
            calculations: state.calculations.map((calc) =>
              calc._id === calculationId
                ? {
                    ...calc,
                    approuve: true,
                    approuve_par: approverId,
                    date_approbation: new Date().toISOString()
                  }
                : calc
            )
          })),

        recalculateSalary: async (employeeId) => {
          // Supprime l'ancien calcul et recalcule
          set((state) => ({
            calculations: state.calculations.filter(c => c.employee_id !== employeeId)
          }));
          return get().calculateSalary(employeeId);
        },

        // Rapports
        generateReport: async (type, format) => {
          const { currentPeriod, calculations } = get();

          if (!currentPeriod) {
            throw new Error('Aucune période sélectionnée');
          }

          const report: PayrollReport = {
            type,
            periode: currentPeriod,
            date_generation: new Date().toISOString(),
            format,
            donnees: calculations
          };

          set((state) => ({
            reports: [...state.reports, report]
          }));

          return report;
        },

        exportBulletinPaie: async (employeeId, periodeId) => {
          // Simulation de génération de bulletin
          return `/api/bulletins/${employeeId}/${periodeId}.pdf`;
        },

        // Paramètres
        updateSettings: (settings) =>
          set((state) => ({
            settings: { ...state.settings, ...settings }
          })),

        resetSettings: () => set({ settings: DEFAULT_PAYROLL_SETTINGS }),

        // État UI
        setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
        setSelectedCalculation: (calculation) => set({ selectedCalculation: calculation }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setSuccessMessage: (message) => set({ successMessage: message }),
        setCurrentView: (view) => set({ currentView: view }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters }
          })),

        resetFilters: () =>
          set({
            filters: initialState.filters
          }),

        // Opérations en masse
        startBulkOperation: async (operation, employeeIds) => {
          const { employees } = get();
          const targetEmployees = employeeIds
            ? employees.filter(e => employeeIds.includes(e._id))
            : employees;

          set({ isLoading: true });

          try {
            switch (operation) {
              case 'CALCULER':
                for (const employee of targetEmployees) {
                  await get().calculateSalary(employee._id);
                }
                break;
              // Autres opérations...
            }

            set({
              isLoading: false,
              successMessage: `Opération ${operation} terminée pour ${targetEmployees.length} employés`
            });
          } catch (error) {
            set({
              isLoading: false,
              error: `Erreur lors de l'opération en masse: ${error}`
            });
          }
        },

        cancelBulkOperation: () => set({ isLoading: false }),

        // Getters
        getEmployeesForPeriod: () => get().employees,

        getCalculationsByEmployee: (employeeId) =>
          get().calculations.filter(c => c.employee_id === employeeId),

        getPendingCalculations: () =>
          get().calculations.filter(c => !c.approuve),

        getApprovedCalculations: () =>
          get().calculations.filter(c => c.approuve),

        getCurrentPeriodSummary: () => {
          const { currentPeriod, calculations } = get();

          if (!currentPeriod) return null;

          console.log('getCurrentPeriodSummary - Debug:', {
            currentPeriodId: currentPeriod._id,
            totalCalculations: calculations.length,
            calculationsPeriodIds: calculations.map(c => c.periode_id)
          });

          const periodCalcs = calculations.filter(
            c => c.periode_id === currentPeriod._id
          );

          console.log('Filtered calculations for period:', periodCalcs.length);

          return {
            periode: currentPeriod,
            nombre_employes: periodCalcs.length,
            total_salaires_bruts: periodCalcs.reduce((sum, c) => sum + c.salaire_brut_global, 0),
            total_salaires_nets: periodCalcs.reduce((sum, c) => sum + c.salaire_net, 0),
            total_cotisations_salariales: periodCalcs.reduce(
              (sum, c) => sum + c.cnss_salariale + c.amo_salariale,
              0
            ),
            total_cotisations_patronales: periodCalcs.reduce(
              (sum, c) => sum + c.cnss_patronale + c.amo_patronale + c.taxe_formation,
              0
            ),
            total_ir: periodCalcs.reduce((sum, c) => sum + c.ir_net, 0),
            cout_total: periodCalcs.reduce((sum, c) => sum + c.cout_total_employeur, 0),
            statut: currentPeriod.statut
          };
        },

        getTotalCostForPeriod: () => {
          const { calculations } = get();
          return calculations.reduce((sum, c) => sum + c.cout_total_employeur, 0);
        },

        // Initialize with mock data if no employees
        initializeMockData: () => {
          const { employees } = get();
          if (employees.length === 0) {
            console.log('Initializing payroll store with mock data');
            set({ employees: allMockPayrollEmployees });
          }
        }
      }),
      {
        name: 'payroll-store',
        partialize: (state) => ({
          settings: state.settings,
          currentView: state.currentView,
          filters: state.filters
        })
      }
    ),
    {
      name: 'payroll-store'
    }
  )
);
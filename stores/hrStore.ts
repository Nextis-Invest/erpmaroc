import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useEffect, useState, useMemo } from 'react';
import { shallow } from 'zustand/shallow';

// Types for HR store
export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department?: {
    _id: string;
    name: string;
    code: string;
  };
  team?: {
    _id: string;
    name: string;
    code: string;
  };
  manager?: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern' | 'temporary';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated' | 'suspended';
  salary: number;
  bonus?: number;
  hireDate: string;
  birthDate: string;
  numberOfChildren?: number;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  head?: Employee;
  budget?: number;
  employeeCount?: number;
  status: 'active' | 'inactive';
}

export interface Team {
  _id: string;
  name: string;
  code: string;
  description?: string;
  department: string;
  teamLead: string;
  members: Array<{
    employee: string;
    role: string;
    joinDate: string;
  }>;
  maxMembers?: number;
  memberCount?: number;
  status: 'active' | 'inactive' | 'archived';
}

export interface LeaveRequest {
  _id: string;
  requestId: string;
  employee: Employee;
  leaveType: {
    _id: string;
    name: string;
    code: string;
  };
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestDate: string;
}

export interface Analytics {
  totalEmployees: number;
  activeEmployees: number;
  departmentCount: number;
  teamCount: number;
  pendingLeaveRequests: number;
  todayAttendance: number;
  monthlyHiringTrend: Array<{ month: string; hires: number }>;
  departmentDistribution: Array<{ department: string; count: number; percentage: number }>;
  recentActivities: Array<{
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  upcomingBirthdays: Array<{
    employee: string;
    date: string;
    daysUntil: number;
  }>;
}

interface HRStore {
  // State
  employees: Employee[];
  selectedEmployee: Employee | null;
  departments: Department[];
  teams: Team[];
  leaveRequests: LeaveRequest[];
  analytics: Analytics | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  currentView: 'dashboard' | 'employees' | 'departments' | 'teams' | 'leaves' | 'attendance' | 'reports' | 'payroll';

  // Filters and pagination
  employeeFilters: {
    search: string;
    department: string;
    team: string;
    status: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Actions
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  setSelectedEmployee: (employee: Employee | null) => void;

  setDepartments: (departments: Department[]) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;

  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;

  setLeaveRequests: (requests: LeaveRequest[]) => void;
  addLeaveRequest: (request: LeaveRequest) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;

  setAnalytics: (analytics: Analytics) => void;

  // UI Actions
  setCurrentView: (view: HRStore['currentView']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter and pagination actions
  setEmployeeFilters: (filters: Partial<HRStore['employeeFilters']>) => void;
  setPagination: (pagination: Partial<HRStore['pagination']>) => void;
  resetFilters: () => void;

  // Computed getters
  getActiveEmployees: () => Employee[];
  getEmployeesByDepartment: (departmentId: string) => Employee[];
  getEmployeesByTeam: (teamId: string) => Employee[];
  getPendingLeaveRequests: () => LeaveRequest[];
  getLeaveRequestsByEmployee: (employeeId: string) => LeaveRequest[];
}

const initialState = {
  employees: [],
  selectedEmployee: null,
  departments: [],
  teams: [],
  leaveRequests: [],
  analytics: null,
  isLoading: false,
  error: null,
  currentView: 'dashboard' as const,
  employeeFilters: {
    search: '',
    department: '',
    team: '',
    status: 'active',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const useHRStore = create<HRStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Employee actions
        setEmployees: (employees) => set({ employees }),

        addEmployee: (employee) =>
          set((state) => ({
            employees: [...state.employees, employee],
          })),

        updateEmployee: (id, updates) =>
          set((state) => ({
            employees: state.employees.map((emp) =>
              emp._id === id ? { ...emp, ...updates } : emp
            ),
          })),

        removeEmployee: (id) =>
          set((state) => ({
            employees: state.employees.filter((emp) => emp._id !== id),
          })),

        setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

        // Department actions
        setDepartments: (departments) => set({ departments }),

        addDepartment: (department) =>
          set((state) => ({
            departments: [...state.departments, department],
          })),

        updateDepartment: (id, updates) =>
          set((state) => ({
            departments: state.departments.map((dept) =>
              dept._id === id ? { ...dept, ...updates } : dept
            ),
          })),

        // Team actions
        setTeams: (teams) => set({ teams }),

        addTeam: (team) =>
          set((state) => ({
            teams: [...state.teams, team],
          })),

        updateTeam: (id, updates) =>
          set((state) => ({
            teams: state.teams.map((team) =>
              team._id === id ? { ...team, ...updates } : team
            ),
          })),

        // Leave request actions
        setLeaveRequests: (requests) => set({ leaveRequests: requests }),

        addLeaveRequest: (request) =>
          set((state) => ({
            leaveRequests: [...state.leaveRequests, request],
          })),

        updateLeaveRequest: (id, updates) =>
          set((state) => ({
            leaveRequests: state.leaveRequests.map((req) =>
              req._id === id ? { ...req, ...updates } : req
            ),
          })),

        // Analytics actions
        setAnalytics: (analytics) => set({ analytics }),

        // UI actions
        setCurrentView: (view) => set({ currentView: view }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        // Filter and pagination actions
        setEmployeeFilters: (filters) =>
          set((state) => ({
            employeeFilters: { ...state.employeeFilters, ...filters },
          })),

        setPagination: (pagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          })),

        resetFilters: () =>
          set({
            employeeFilters: initialState.employeeFilters,
            pagination: initialState.pagination,
          }),

        // Computed getters
        getActiveEmployees: () => {
          const { employees } = get();
          return employees.filter((emp) => emp.status === 'active');
        },

        getEmployeesByDepartment: (departmentId) => {
          const { employees } = get();
          return employees.filter((emp) => emp.department?._id === departmentId);
        },

        getEmployeesByTeam: (teamId) => {
          const { employees } = get();
          return employees.filter((emp) => emp.team?._id === teamId);
        },

        getPendingLeaveRequests: () => {
          const { leaveRequests } = get();
          return leaveRequests.filter((req) => req.status === 'pending');
        },

        getLeaveRequestsByEmployee: (employeeId) => {
          const { leaveRequests } = get();
          return leaveRequests.filter((req) => req.employee._id === employeeId);
        },
      }),
      {
        name: 'hr-store',
        partialize: (state) => ({
          currentView: state.currentView,
          employeeFilters: state.employeeFilters,
          pagination: state.pagination,
        }),
      }
    ),
    {
      name: 'hr-store',
    }
  )
);

// Helper hook to handle SSR/hydration
const useStore = <T,>(selector: (state: HRStore) => T, fallback: T): T => {
  const [hydrated, setHydrated] = useState(false);
  const value = useHRStore(selector);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated ? value : fallback;
};

// Selector hooks for better performance with SSR safety
export const useEmployees = () => useStore((state) => state.employees, []);
export const useSelectedEmployee = () => useStore((state) => state.selectedEmployee, null);
export const useDepartments = () => useStore((state) => state.departments, []);
export const useTeams = () => useStore((state) => state.teams, []);
export const useLeaveRequests = () => useStore((state) => state.leaveRequests, []);
export const useAnalytics = () => useStore((state) => state.analytics, null);
export const useHRLoading = () => useStore((state) => state.isLoading, false);
export const useHRError = () => useStore((state) => state.error, null);
export const useCurrentView = () => useStore((state) => state.currentView, 'dashboard' as const);
export const useEmployeeFilters = () => useStore((state) => state.employeeFilters, initialState.employeeFilters);
export const usePagination = () => useStore((state) => state.pagination, initialState.pagination);

// Action hooks with SSR safety and stable selector
export const useHRActions = () => {
  const [hydrated, setHydrated] = useState(false);

  // Use shallow comparison to prevent re-renders
  const actions = useHRStore(
    (state) => ({
      setEmployees: state.setEmployees,
      addEmployee: state.addEmployee,
      updateEmployee: state.updateEmployee,
      removeEmployee: state.removeEmployee,
      setSelectedEmployee: state.setSelectedEmployee,
      setDepartments: state.setDepartments,
      addDepartment: state.addDepartment,
      updateDepartment: state.updateDepartment,
      setTeams: state.setTeams,
      addTeam: state.addTeam,
      updateTeam: state.updateTeam,
      setLeaveRequests: state.setLeaveRequests,
      addLeaveRequest: state.addLeaveRequest,
      updateLeaveRequest: state.updateLeaveRequest,
      setAnalytics: state.setAnalytics,
      setCurrentView: state.setCurrentView,
      setLoading: state.setLoading,
      setError: state.setError,
      setEmployeeFilters: state.setEmployeeFilters,
      setPagination: state.setPagination,
      resetFilters: state.resetFilters,
    }),
    shallow
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Memoize no-op functions to prevent re-creation
  const noOpActions = useMemo(() => ({
    setEmployees: () => {},
    addEmployee: () => {},
    updateEmployee: () => {},
    removeEmployee: () => {},
    setSelectedEmployee: () => {},
    setDepartments: () => {},
    addDepartment: () => {},
    updateDepartment: () => {},
    setTeams: () => {},
    addTeam: () => {},
    updateTeam: () => {},
    setLeaveRequests: () => {},
    addLeaveRequest: () => {},
    updateLeaveRequest: () => {},
    setAnalytics: () => {},
    setCurrentView: () => {},
    setLoading: () => {},
    setError: () => {},
    setEmployeeFilters: () => {},
    setPagination: () => {},
    resetFilters: () => {},
  }), []);

  return hydrated ? actions : noOpActions;
};

// Computed selector hooks with SSR safety
export const useActiveEmployees = () => {
  const [hydrated, setHydrated] = useState(false);

  // Get the function first, then call it - this prevents infinite loops
  const getActiveEmployees = useHRStore((state) => state.getActiveEmployees);
  const activeEmployees = useMemo(() => {
    return hydrated ? getActiveEmployees() : [];
  }, [hydrated, getActiveEmployees]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return activeEmployees;
};

export const usePendingLeaveRequests = () => {
  const [hydrated, setHydrated] = useState(false);

  // Get the function first, then call it - this prevents infinite loops
  const getPendingLeaveRequests = useHRStore((state) => state.getPendingLeaveRequests);
  const pendingRequests = useMemo(() => {
    return hydrated ? getPendingLeaveRequests() : [];
  }, [hydrated, getPendingLeaveRequests]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return pendingRequests;
};
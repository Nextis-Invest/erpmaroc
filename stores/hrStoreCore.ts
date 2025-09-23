import { createStore } from 'zustand/vanilla';

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
  lead?: Employee;
  members?: Employee[];
  department?: Department;
  status: 'active' | 'inactive';
}

export interface LeaveRequest {
  _id: string;
  employee: Employee;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: Employee;
  approvalDate?: string;
  comments?: string;
}

export interface AttendanceRecord {
  _id: string;
  employee: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday' | 'weekend';
  overtime?: number;
  notes?: string;
}

export interface Analytics {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  teams: number;
  pendingLeaves: number;
  approvedLeaves: number;
  totalPayroll: number;
  averageSalary: number;
  employeesByDepartment: Record<string, number>;
  employeesByStatus: Record<string, number>;
}

export interface HRStore {
  // State
  employees: Employee[];
  selectedEmployee: Employee | null;
  departments: Department[];
  teams: Team[];
  leaveRequests: LeaveRequest[];
  attendance: AttendanceRecord[];
  analytics: Analytics | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  currentView: 'dashboard' | 'employees' | 'leaves' | 'departments' | 'attendance' | 'reports';

  // Filters & Pagination
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

  setAttendance: (attendance: AttendanceRecord[]) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;

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

const defaultInitialState = {
  employees: [],
  selectedEmployee: null,
  departments: [],
  teams: [],
  leaveRequests: [],
  attendance: [],
  analytics: null,
  isLoading: false,
  error: null,
  currentView: 'dashboard' as const,
  employeeFilters: {
    search: '',
    department: 'all',
    team: '',
    status: 'active',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const createHRStore = (initState: Partial<HRStore> = {}) => {
  return createStore<HRStore>()((set, get) => ({
    ...defaultInitialState,
    ...initState,

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

    // Attendance actions
    setAttendance: (attendance) => set({ attendance }),

    addAttendanceRecord: (record) =>
      set((state) => ({
        attendance: [...state.attendance, record],
      })),

    updateAttendanceRecord: (id, updates) =>
      set((state) => ({
        attendance: state.attendance.map((record) =>
          record._id === id ? { ...record, ...updates } : record
        ),
      })),

    // Analytics
    setAnalytics: (analytics) => set({ analytics }),

    // UI State
    setCurrentView: (view) => set({ currentView: view }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Filters
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
        employeeFilters: defaultInitialState.employeeFilters,
        pagination: defaultInitialState.pagination,
      }),

    // Computed getters
    getActiveEmployees: () => {
      return get().employees.filter((emp) => emp.status === 'active');
    },

    getEmployeesByDepartment: (departmentId) => {
      return get().employees.filter((emp) => emp.department?._id === departmentId);
    },

    getEmployeesByTeam: (teamId) => {
      return get().employees.filter((emp) => emp.team?._id === teamId);
    },

    getPendingLeaveRequests: () => {
      return get().leaveRequests.filter((req) => req.status === 'pending');
    },

    getLeaveRequestsByEmployee: (employeeId) => {
      return get().leaveRequests.filter((req) => req.employee._id === employeeId);
    },
  }));
};
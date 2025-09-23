'use client';

import { useHRStore } from './hrStoreProvider';
import { useCallback } from 'react';

// Re-export types from store provider
export type { Employee, Department, Team, LeaveRequest, AttendanceRecord, Analytics } from './hrStoreProvider';

// Selector hooks
export const useEmployees = () => useHRStore((state) => state.employees);
export const useSelectedEmployee = () => useHRStore((state) => state.selectedEmployee);
export const useDepartments = () => useHRStore((state) => state.departments);
export const useTeams = () => useHRStore((state) => state.teams);
export const useLeaveRequests = () => useHRStore((state) => state.leaveRequests);
export const useAttendance = () => useHRStore((state) => state.attendance);
export const useAnalytics = () => useHRStore((state) => state.analytics);
export const useHRLoading = () => useHRStore((state) => state.isLoading);
export const useHRError = () => useHRStore((state) => state.error);
export const useCurrentView = () => useHRStore((state) => state.currentView);
export const useEmployeeFilters = () => useHRStore((state) => state.employeeFilters);
export const usePagination = () => useHRStore((state) => state.pagination);

// Action hooks
export const useHRActions = () => {
  const setEmployees = useHRStore((state) => state.setEmployees);
  const addEmployee = useHRStore((state) => state.addEmployee);
  const updateEmployee = useHRStore((state) => state.updateEmployee);
  const removeEmployee = useHRStore((state) => state.removeEmployee);
  const setSelectedEmployee = useHRStore((state) => state.setSelectedEmployee);
  const setDepartments = useHRStore((state) => state.setDepartments);
  const addDepartment = useHRStore((state) => state.addDepartment);
  const updateDepartment = useHRStore((state) => state.updateDepartment);
  const setTeams = useHRStore((state) => state.setTeams);
  const addTeam = useHRStore((state) => state.addTeam);
  const updateTeam = useHRStore((state) => state.updateTeam);
  const setLeaveRequests = useHRStore((state) => state.setLeaveRequests);
  const addLeaveRequest = useHRStore((state) => state.addLeaveRequest);
  const updateLeaveRequest = useHRStore((state) => state.updateLeaveRequest);
  const setAttendance = useHRStore((state) => state.setAttendance);
  const addAttendanceRecord = useHRStore((state) => state.addAttendanceRecord);
  const updateAttendanceRecord = useHRStore((state) => state.updateAttendanceRecord);
  const setAnalytics = useHRStore((state) => state.setAnalytics);
  const setCurrentView = useHRStore((state) => state.setCurrentView);
  const setLoading = useHRStore((state) => state.setLoading);
  const setError = useHRStore((state) => state.setError);
  const setEmployeeFilters = useHRStore((state) => state.setEmployeeFilters);
  const setPagination = useHRStore((state) => state.setPagination);
  const resetFilters = useHRStore((state) => state.resetFilters);

  return {
    setEmployees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    setSelectedEmployee,
    setDepartments,
    addDepartment,
    updateDepartment,
    setTeams,
    addTeam,
    updateTeam,
    setLeaveRequests,
    addLeaveRequest,
    updateLeaveRequest,
    setAttendance,
    addAttendanceRecord,
    updateAttendanceRecord,
    setAnalytics,
    setCurrentView,
    setLoading,
    setError,
    setEmployeeFilters,
    setPagination,
    resetFilters,
  };
};

// Computed selector hooks
export const useActiveEmployees = () => {
  const getActiveEmployees = useHRStore((state) => state.getActiveEmployees);
  return useCallback(() => getActiveEmployees(), [getActiveEmployees]);
};

export const usePendingLeaveRequests = () => {
  const getPendingLeaveRequests = useHRStore((state) => state.getPendingLeaveRequests);
  return useCallback(() => getPendingLeaveRequests(), [getPendingLeaveRequests]);
};
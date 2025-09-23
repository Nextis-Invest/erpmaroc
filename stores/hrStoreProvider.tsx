'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';
import { type HRStore, createHRStore } from './hrStoreCore';

export type HRStoreApi = ReturnType<typeof createHRStore>;

export const HRStoreContext = createContext<HRStoreApi | undefined>(undefined);

export interface HRStoreProviderProps {
  children: ReactNode;
}

export const HRStoreProvider = ({ children }: HRStoreProviderProps) => {
  const storeRef = useRef<HRStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createHRStore();
  }

  return (
    <HRStoreContext.Provider value={storeRef.current}>
      {children}
    </HRStoreContext.Provider>
  );
};

export const useHRStore = <T,>(selector: (store: HRStore) => T): T => {
  const hrStoreContext = useContext(HRStoreContext);

  if (!hrStoreContext) {
    throw new Error(`useHRStore must be used within HRStoreProvider`);
  }

  return useStore(hrStoreContext, selector);
};

// Re-export types from core store
export type { Employee, Department, Team, LeaveRequest, AttendanceRecord, Analytics, HRStore } from './hrStoreCore';
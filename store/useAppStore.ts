import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface Branch {
  id: string;
  name: string;
  location?: string;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Branch state
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;

  // UI state
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Error states
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset store
  reset: () => void;
}

const initialState = {
  user: null,
  selectedBranch: null,
  branches: [],
  theme: 'light' as const,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // User actions
        setUser: (user) => set({ user }),

        // Branch actions
        setSelectedBranch: (branch) => set({ selectedBranch: branch }),
        setBranches: (branches) => set({ branches }),

        // UI actions
        toggleTheme: () => set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),

        // Loading actions
        setLoading: (loading) => set({ isLoading: loading }),

        // Error actions
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Reset store
        reset: () => set(initialState),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user,
          selectedBranch: state.selectedBranch,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
);
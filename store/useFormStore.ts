import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type FormMode = 'create' | 'edit' | 'view' | '';

interface FormState {
  // Form sidebar state
  isOpen: boolean;
  formMode: FormMode;

  // Data state
  branchData: any | null;
  productData: any | null;
  staffData: any | null;

  // Actions
  toggleFormSidebar: (mode?: FormMode) => void;
  setFormMode: (mode: FormMode) => void;
  setIsOpen: (isOpen: boolean) => void;
  setBranchData: (data: any) => void;
  setProductData: (data: any) => void;
  setStaffData: (data: any) => void;
  clearFormData: () => void;
}

export const useFormStore = create<FormState>()(
  devtools(
    (set) => ({
      // Initial state
      isOpen: false,
      formMode: '',
      branchData: null,
      productData: null,
      staffData: null,

      // Actions
      toggleFormSidebar: (mode) => set((state) => ({
        isOpen: !state.isOpen,
        formMode: mode || state.formMode
      })),

      setFormMode: (mode) => set({ formMode: mode }),

      setIsOpen: (isOpen) => set({ isOpen }),

      setBranchData: (data) => set({ branchData: data }),

      setProductData: (data) => set({ productData: data }),

      setStaffData: (data) => set({ staffData: data }),

      clearFormData: () => set({
        branchData: null,
        productData: null,
        staffData: null,
        formMode: '',
        isOpen: false
      }),
    }),
    {
      name: 'FormStore',
    }
  )
);
"use client";

import { createContext } from "react";
import { useFormStore } from "@/store/useFormStore";

export const DataContext = createContext({});

export const DataContextProvider = ({ children }) => {
  // Use Zustand store instead of local state
  const {
    isOpen,
    formMode,
    branchData,
    productData,
    toggleFormSidebar,
    setFormMode,
    setIsOpen,
    setBranchData,
    setProductData,
  } = useFormStore();

  // Legacy toggleSideBar function for backward compatibility
  const toggleSideBar = (mode) => {
    toggleFormSidebar(mode);
  };

  return (
    <DataContext.Provider
      value={{
        branchData,
        isOpen,
        formMode,
        productData,
        toggleSideBar,
        setProductData,
        setIsOpen,
        setBranchData,
        setFormMode,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
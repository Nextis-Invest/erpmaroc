"use client";

import { createContext, useState } from "react";

export const DataContext = createContext();

export const DataContextProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [formMode, setFormMode] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const toggleSideBar = (mode) => {
      setFormMode(mode);

    setIsOpen(!isOpen);
    console.log(isOpen);
    console.log("mc = "+formMode)
  };

  return (
    <DataContext.Provider
      value={{ data, isOpen, formMode, toggleSideBar,setIsOpen, setData, setFormMode }}
    >
      {children}
    </DataContext.Provider>
  );
};

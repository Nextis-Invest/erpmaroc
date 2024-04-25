"use client";

import { createContext, useReducer, useState } from "react";

export const DataContext = createContext();

// const reducer = () => {
//   switch (action.type) {
//     case "set_products": {
//       return {
//         product: [action.payload],
//       };
//     }
//     case "add_product": {
//       return {
//         product: [action.payload ,...state.data]
//       };
//     }
//     case "remove_product": {
//       return {
//         product: state.product.filter((item) => item.id !== action.payload.id),
//       };
//     }
//     case "edit_product": {
//       return {
//         product: state.product.map((item) =>
//           item.id === action.payload.id ? action.payload : item
//         ),
//       };
//     }
//     default:
//       throw Error("Unknown action: " + action.type);
//   }
// };

export const DataContextProvider = ({ children }) => {
  // const [state, dispatch] = useReducer(reducer, { product: null });

  const [branchData, setBranchData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [formMode, setFormMode] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const toggleSideBar = (mode) => {
    setFormMode(mode);

    setIsOpen(!isOpen);
    console.log(isOpen);
    console.log("mc = " + formMode);
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

"use client";

import { DataContext } from "@/Context/DataContext";
import { Drawer } from "flowbite-react";
import { useContext } from "react";
import BranchForm from "./react-hook-form/BranchForm";
import StaffForm from "./react-hook-form/StaffForm";
import ProductForm from "./react-hook-form/ProductForm";

const FormSideBar = () => {
  const { isOpen, formMode,setIsOpen, toggleSideBar } = useContext(DataContext);
console.log("mode = "+formMode)
  return (
    <>
      <Drawer className="min-w-[30vw] z-50" open={isOpen} onClose={()=>{setIsOpen(false)}} position="right">
        <Drawer.Header title="Drawer" />
        <Drawer.Items>
          {formMode === 'add-product' && <ProductForm mode="add"/>}
          {formMode === 'edit-product' && <ProductForm mode="edit"/>}
          {formMode === 'key' && <StaffForm/>}
          {formMode === 'add-branch' && <StaffForm/>}
          {formMode === 'edit-branch' && <BranchForm mode = "edit"/>}
          {formMode === 'create-branch' && <BranchForm mode = "create"/>}
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default FormSideBar;

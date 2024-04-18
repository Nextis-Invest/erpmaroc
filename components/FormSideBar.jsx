"use client";

import { DataContext } from "@/Context/DataContext";
import { Drawer } from "flowbite-react";
import { useContext } from "react";
import BranchForm from "./react-hook-form/BranchForm";
import StaffForm from "./react-hook-form/StaffForm";

const FormSideBar = () => {
  const { isOpen, formMode,setIsOpen, toggleSideBar } = useContext(DataContext);
console.log("mode = "+formMode)
  return (
    <>
      <Drawer className="min-w-[30vw]" open={isOpen} onClose={()=>{setIsOpen(false)}} position="right">
        <Drawer.Header title="Drawer" />
        <Drawer.Items>
          {formMode === 'key' && <StaffForm/>}
          {formMode === 'add-branch' && <StaffForm/>}
          {formMode === 'edit-branch' && <BranchForm/>}
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default FormSideBar;

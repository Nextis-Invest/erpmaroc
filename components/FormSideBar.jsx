"use client";

import { DataContext } from "@/Context/DataContext";
import { Drawer } from "flowbite-react";
import { useContext } from "react";

const FormSideBar = () => {
  const { isOpen, formMode, toggleSideBar } = useContext(DataContext);
console.log("m = "+formMode)
  return (
    <>
      <Drawer open={isOpen} onClose={toggleSideBar} position="right">
        <Drawer.Header title="Drawer" />
        <Drawer.Items>
          <p>mode: {formMode}</p>
        </Drawer.Items>
      </Drawer>
    </>
  );
};

export default FormSideBar;

"use client";

import React, { useContext } from "react";
import { DataContext } from "@/Context/DataContext";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import TanStackTable from "./TanstackTable";

const Products = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;

  const { branchData, setBranchData } = useContext(DataContext);
  
  if (!isLoading && !user) {
    return redirect("/login");
  }
  return (
    <div>
      <TanStackTable />
    </div>
  );
};

export default Products;

"use client";

import React, { useContext } from "react";
import Table from "./Table";
import { DataContext } from "@/Context/DataContext";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import TanStackTable from "./productTable";

const Products = () => {
  const { user, error, isLoading } = useUser();

  const { branchData, setBranchData } = useContext(DataContext);
  if (error) {
    return redirect("/login");
  }
  return (
    <div>
      {/* <Table data={branchData} mode="products" />{" "} */}
      <TanStackTable branchData={branchData}/>
    </div>
  );
};

export default Products;

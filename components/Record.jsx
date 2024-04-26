"use client";

import { DataContext } from "@/Context/DataContext";
import React, { useContext } from "react";
import Table from "./Table";
import RecordTable from "./RecordTable";

const Record = () => {
  const { data, setdata } = useContext(DataContext);
  return (
    <div className="w-full">
      {/* <Table data={data} mode="warehouse" /> */}
      <RecordTable />
    </div>
  );
};

export default Record;

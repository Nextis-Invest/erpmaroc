"use client";

import * as XLSX from "xlsx";
// import { promises as fs } from "fs";

import React, { useState, useContext } from "react";
import { DataContext } from "@/Context/DataContext";

export const ExcelHandler = () => {

  const {data, setData} = useContext(DataContext)

  // const [file, setFile] = useState([])
  const handler = async (e)=>{
    const file = e.target.files[0];
          const wb = XLSX.read(await file.arrayBuffer());
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws);
      setData(data)

    }
  
  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"

        onChange={handler}
      />
    </div>
  );
};

// export default ExcelHandler;

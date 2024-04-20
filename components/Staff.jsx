"use client";


import React from "react";
import Table from "./Table";

const Staff = () => {
  const staffs = [
    {
      name: "Myat",
      permissions: ["read", "write", "delete", "create"],
      privilege: "Manager",
      salary: 100000,
      bonus: 500000,
      annualLeaveDays: 20,
    },
    {
      name: "John Ray",
      permissions: ["read", "write"],
      privilege: "employee",
      salary: 300000,
      bonus: 80000,
      annualLeaveDays: 15,
    },
    {
      name: "Jane Smith",
      permissions: ["read", "write"],
      privilege: "employee",
      salary: 300000,
      bonus: 80000,
      annualLeaveDays: 15,
    },
    {
      name: "Alice Johnson",
      permissions: ["read", "write"],
      privilege: "employee",
      salary: 300000,
      bonus: 70000,
      annualLeaveDays: 18,
    },
    {
      name: "Michael Brown",
      permissions: ["read", "write", "delete"],
      privilege: "employee",
      salary: 300000,
      bonus: 60000,
      annualLeaveDays: 17,
    },
    {
      name: "Emily Davis",
      permissions: ["read", "write", "delete"],
      privilege: "employee",
      salary: 300000,
      bonus: 180000,
      annualLeaveDays: 22,
    },
    {
      name: "Davis Emrys",
      permissions: ["read", "write", "delete"],
      privilege: "employee",
      salary: 300000,
      bonus: 200000,
      annualLeaveDays: 25,
    },
  ];

const edit = ()=>{
  alert("clicled")
}

  return (
    <div>
      <Table data={staffs} mode="staffs" action={edit}/>
      
    </div>
  );
};

export default Staff;

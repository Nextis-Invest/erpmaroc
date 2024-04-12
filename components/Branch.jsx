"use client";
import React, { Suspense } from "react";
import Chart from "react-apexcharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import Loading from "./Loading";

const Branch = () => {
  const users = [
    {
      name: "Myat",
      permissions: ["read", "write", "delete", "create"],
      privilege: "owner",
      control: ["branch1", "branch2", "branch3"],
    },
    {
      name: "John Ray",
      permissions: ["read", "write"],
      privilege: "employee",
      control: ["branch2"],
    },
    {
      name: "Jane Smith",
      permissions: ["read", "write"],
      privilege: "employee",
      control: ["branch2"],
    },
    {
      name: "Alice Johnson",
      permissions: ["read", "write"],
      privilege: "employee",
      control: ["branch3"],
    },
    {
      name: "Michael Brown",
      permissions: ["read", "write", "delete"],
      privilege: "manager",
      control: ["branch1"],
    },
    {
      name: "Emily Davis",
      permissions: ["read", "write", "delete"],
      privilege: "manager",
      control: ["branch2", "branch3"],
    },    {
      name: "Davis Emrys",
      permissions: ["read", "write", "delete"],
      privilege: "manager",
      control: ["branch2", "branch3"],
    },
    {
      name: "William Wilson",
      permissions: ["read"],
      privilege: "Accountants",
      control: ["branch1", "branch2", "branch3"],
    },
  ];

  console.log(users);

  console.log(users);

  var colChartOption = {
    series: [
      {
        name: "Sales",
        data: [44, 55, 57, 56, 61, 36, 26, 45, 58, 63, 60, 66],
      },
    ],
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      title: {
        text: "Sales",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " MMK";
        },
      },
    },
  };
  return (
    <div className="w-full min-h-[80vh] h-auto flex flex-col content-center drop-shadow-md shadow-md shadow-secondary rounded-lg p-5">
      <Suspense fallback={<Loading size="3x" />}>
        <div id="firstRow" className="w-full h-1/2 flex items-start">
          <Chart
            options={colChartOption}
            series={colChartOption.series}
            type="bar"
            height={400}
            className="w-full border-b-2 border-primary"
          />
        </div>{" "}
        <div id="secRow" className="w-full">
          {users.map((user) => {
            return (
              <div
                id="user"
                className="grid grid-cols-5 gap-2 h-12 border-b-2 border-primary items-center"
                key={user.name} // Adding a unique key for each user
              >
                <div className="ml-2">{user.name}</div>
                <div>{user.privilege}</div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  {user.control.map((c) => (
                    <div key={c} className="text-gray-700">
                      {c}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  {user.permissions.map((permission) => (
                    <div
                      key={permission}
                      className={`text-gray-700 text-background text-center p-0.5 px-1 rounded-full ${
                        permission === "create"
                          ? "bg-[#34D399]"
                          : permission === "read"
                          ? "bg-[#3B82F6]"
                          : permission === "write"
                          ? "bg-[#e7a325]"
                          : permission === "delete"
                          ? "bg-[#EF4444]"
                          : "bg-[#6B7280]"
                      }`}
                    >
                      {permission}
                    </div>
                  ))}
                </div>

                <div className=" grid justify-end">
                  <button className="w-10 h-auto" onClick={()=>{alert("Clicked")}}>
                    <FontAwesomeIcon
                      icon={faEllipsis}
                      height={22}
                      width={22}
                      alt="threeDots"
                      className="mr-2"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Suspense>
    </div>
  );
};

export default Branch;

"use client";

import React, { useContext, useEffect } from "react";
import { ExcelHandler } from "../components/ExcelHandler";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { DataContext } from "@/Context/DataContext";

const Admin = () => {
  const { user, error, isLoading } = useUser();
  console.log("🚀 ~ Admin ~ user:", user)
  const { data, isOpen, toggleSideBar, setFormMode } = useContext(DataContext);

  useEffect(() => {
    if (!user) {
      return redirect("/login");
    }
  }, [user]);

  const modifyKey = () => {
    alert("Clicked");
  };

  let branches = [
    {
      name: "Branch A",
      manager: "John Doe",
      location: "Ya Pone",
    },
    {
      name: "Branch B",
      manager: "Jane Smith",
      location: "Shore side",
    },
    {
      name: "Branch C",
      manager: "Alice Johnson",
      location: "Downtown",
    },
  ];

  let keys = [
    {
      name: "Key1",
      description: "This is the first key",
      createdTime: "2024-04-12T08:00:00",
      createdPerson: "John Doe",
      key: "o1pgjr8uws2e4z",
    },
    {
      name: "Key2",
      description: "This is the second key",
      createdTime: "2024-04-12/10:30:00",
      createdPerson: "Jane Smith",
      key: "x5y9klzq1h3rdtx5y9klzq1h3rdt",
    },
    {
      name: "Key3",
      description: "This is the third key",
      createdTime: "2024-04-12T12:45:00",
      createdPerson: "Alice Johnson",
      key: "s7v0dqw9f2rplm",
    },
  ];

  return (
    <div>
      {" "}
      <div id="userBaner" className="mb-3 h-14 ">
        {user && (
          <div
            id="user"
            className="flex flex-col group focus-within: transition-all absolute top-50 right-10 hover:block content-end w-max ml-auto mr-7 gap-3 px-4 py-2 pr-7 rounded-lg bg-background shadow-md shadow-secondary"
          >
            <div class="max-w-lg mx-auto">
              <details className=" outline-none ring-0">
                <summary class="flex gap-2 items-center justify-end text-sm leading-6 text-slate-900 ring-0 font-semibold select-none">
                  <Image
                    width={40}
                    height={40}
                    className="rounded-sm"
                    src={`${user?.picture}`}
                    alt="user-profile"
                  />
                  <p className="font-bold text-lg text-active">{user?.nickname}</p>
                </summary>
                <div class="mt-3 leading-6 text-active text-md font-semibold">
                  <p>Email: {user?.email}</p>
                </div>
              </details>
            </div>
          </div>
        )}
      </div>{" "}
      <div className="w-full min-h-[80vh] flex">
        <div id="left_col" className=" w-3/4 flex flex-col justify-start">
          <div id="first_row" className="w-full h-2/3">
            <div id="keys" className="active">
              <span className="font-bold text-3xl text-active">KEYS</span>
              {keys.map((key) => {
                return (
                  <div
                    id="key"
                    className="grid grid-cols-11 grid-rows-1 gap-2 h-12 border-b-2 border-primary items-center"
                    key={key.name}
                  >
                    <div className="ml-2">{key.name}</div>
                    <div className="truncate col-span-3 px-2 py-1 shadow-inner font-semibold shadow-[#aaaa] rounded-lg">
                      {key.key}
                    </div>

                    <div className=" col-span-2">{key.description}</div>
                    <div className="col-span-2">{key.createdPerson}</div>
                    <div className="text-sm col-span-2">{key.createdTime}</div>

                    <div className=" grid justify-end">
                      <button className="w-10 h-auto" onClick={modifyKey}>
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
              <div className="w-full flex">
                {" "}
                <button
                  className="bg-active text-background ml-auto text-sm p-2.5 px-3 my-5 rounded-lg font-bold"
                  onClick={() => toggleSideBar("key")}
                >
                  Add new keys
                </button>
              </div>
            </div>
            <div id="branches" className="mt-3 pb-5">
              <span className="font-bold text-3xl text-active">Branches</span>
              {branches.map((key, index) => {
                return (
                  <div
                    id="key"
                    className="grid grid-cols-4 gap-2 h-12 border-b-2 border-primary items-center"
                    key={index}
                  >
                    <div className="ml-2">{key.name}</div>
                    <div>{key.manager}</div>
                    <div>{key.location}</div>

                    <div className=" grid justify-end">
                      <button className="w-10 h-auto" onClick={modifyKey}>
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
              <div className="w-full flex">
                {" "}
                <button
                  className="bg-active text-background ml-auto text-sm p-2.5 px-3 my-5 rounded-lg font-bold"
                  onClick={() => toggleSideBar("add-branch")}
                >
                  Add new branch
                </button>
              </div>
            </div>
          </div>
          <div
            id="sec_row"
            className="flex justify-between w-full h-60 p-5 border-t-2 border-active"
          >
            <div id="sec_row_left_col" className="w-2/5">
              <ExcelHandler />
            </div>
            <div id="sec_row_right_col" className="w-2/5">
              <label
                for="export-file"
                class="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    XLSX, XLS
                  </p>
                </div>
                <button
                  id="export-file"
                  class="hidden"
                  onClick={() => {
                    alert("Clicked");
                  }}
                >
                  export to EXCEL file
                </button>
              </label>
            </div>
          </div>
        </div>
        <div
          id="right_col"
          className="mx-7 px-3 w-1/4 max-w-[300px] min-h-[80vh] max-h-[95vh] border-l-2 border-active"
        >
          <span className="font-bold text-3xl text-active">Activities</span>{" "}
        </div>
      </div>
    </div>
  );
};

export default Admin;

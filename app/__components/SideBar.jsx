"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faUserFriends,
  faShop,
  faReceipt,
  faTags,
  faChartPie,
  faWarehouse,
  faUserShield,
  faGears,
  faSignOut,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { logOutHandler } from "../_lib/clientHandlers";

const SideBar = () => {
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);

  const logOut = async () => {
    setLoading(true);
    await logOutHandler();
    setLoading(false);
  };

  return (
    <div className=" min-w-36 w-auto min-h-[80vh] h-auto mr-5 flex flex-col drop-shadow-md shadow-md shadow-secondary rounded-lg p-5 select-none">
      {/* <Link href="/" className="w-full h-full"> */}
        {" "}
        <Image
          src="/assets/logo.png"
          width={100}
          height={100}
          alt="logo"
          className="w-full h-full"
        />
      {/* </Link> */}
      <div className="w-full flex flex-col gap-1 mt-10">
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/" || pathname === ""
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          {" "}
          <FontAwesomeIcon
            icon={faChartLine}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="/">
            Dashboard
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/dashboard"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          {" "}
          <FontAwesomeIcon
            icon={faUserFriends}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="/staffs">
            Staffs
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/dashboard"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faShop}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="/branches">
            Branches
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/dashboard"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faReceipt}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="/invoices">
            Invoices
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/dashboard"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faTags}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="/products">
            Products
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/dashboard"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faChartPie}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="/report">
            Report
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/dashboard"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faWarehouse}
            height={22}
            width={22}
            alt="faWarehouse"
          />
          <Link className="text-xl ml-2" href="/warehouse">
            Warehouse
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/admin"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faUserShield}
            height={22}
            width={22}
            alt="faUserShield"
          />
          <Link className="text-xl ml-2" href="/admin">
            Admin
          </Link>
        </div>{" "}
        <div
          className={`flex items-center pr-8 pl-2 py-2 rounded-lg hover:shadow-md ${
            pathname === "/dashboard"
              ? "shadow-md shadow-secondary text-active"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={faGears}
            height={22}
            width={22}
            alt="Settings"
          />
          <Link className="text-xl ml-2" href="/setting">
            Settings
          </Link>
        </div>{" "}
      </div>
      <div
        id="logout"
        className="mt-auto w-auto py-3 px-2 flex justify-center items-center rounded-xl text-primary hover:text-warning hover:font-bold"
      >
        <button
          disabled={loading}
          className="flex text-xl items-center"
          onClick={logOut}
        >
          {" "}
          <FontAwesomeIcon
            icon={loading ? faSpinner : faSignOut}
            height={22}
            width={22}
            alt="faSignOut"
            className="mr-2"
          />
          {loading ? "Logging Out." : "Logout"}
        </button>
      </div>
    </div>
  );
};

export default SideBar;

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faUserFriends, faShop, faReceipt, faTags, faChartPie, faWarehouse, faGears} from "@fortawesome/free-solid-svg-icons";

const SideBar = () => {
  return (
    <div className=" min-w-36 w-auto min-h-[80vh] drop-shadow-md shadow-md shadow-secondary rounded-lg p-5 select-none">
      <Image
        src="/assets/logo.svg"
        width={100}
        height={100}
        alt="logo"
        className="w-full h-full"
      />
      <div className="w-full flex flex-col gap-1 mt-10">
        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faChartLine}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="#">
            Dashboard
          </Link>
        </div>{" "}
        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faUserFriends}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="#">
            Staffs
          </Link>
        </div>{" "}
        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faShop}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="#">
            Branches
          </Link>
        </div>{" "}
        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faReceipt}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="#">
            Invoice
          </Link>
        </div>{" "}
        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faTags}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="#">
            Products
          </Link>
        </div>{" "}
        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faChartPie}
            height={22}
            width={22}
            alt="dashboard"
          />
          <Link className="text-xl ml-2" href="#">
            Report
          </Link>
        </div>{" "}
        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faWarehouse}
            height={22}
            width={22}
            alt="faWarehouse"
          />
          <Link className="text-xl ml-2" href="#">
            Warehouse
          </Link>
        </div>{" "}        <div className="flex items-center pr-8 pl-2 py-2 rounded-lg hover: hover:shadow-md active:shadow-md active:shadow-secondary active:text-active">
          <FontAwesomeIcon
            icon={faGears}
            height={22}
            width={22}
            alt="Settings"
          />
          <Link className="text-xl ml-2" href="#">
            Settings
          </Link>
        </div>{" "}
      </div>
    </div>
  );
};

export default SideBar;

"use client";
import { DataContext } from "@/Context/DataContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { useContext, useEffect } from "react";

const Setting = () => {
  const { user, error, isLoading } = useUser();
  const { data, isOpen, toggleSideBar } = useContext(DataContext);

  useEffect(() => {
    if (!user) {
      return redirect("/login");
    }
  }, [user]);

  const info = {
    companyName: "Example Company",
    address: {
      street: "123 Main Street",
      city: "Anytown",
      state: "Example State",
      postalCode: "12345",
      country: "Example Country",
    },
    contact: {
      phone: "+1234567890",
      email: "info@example.com",
      website: "https://www.example.com",
    },
    employees: [
      {
        name: "John Doe",
        position: "CEO",
        email: "john.doe@example.com",
        phone: "+1234567890",
      },
      {
        name: "Jane Smith",
        position: "CFO",
        email: "jane.smith@example.com",
        phone: "+1234567890",
      },
    ],
    departments: [
      {
        name: "Sales",
        manager: "John Doe",
        employees: ["Alice", "Bob", "Charlie"],
      },
      {
        name: "Marketing",
        manager: "Jane Smith",
        employees: ["David", "Emma", "Frank"],
      },
    ],
  };

  return (
    <div className="w-full h-full">
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
                <p className="font-bold my-2 text-lg text-active">{user?.name}</p>
              </summary>
              <div class="mt-3 leading-6 text-active text-md font-semibold">
                <p>Email: {user?.email}</p>
              </div>
            </details>
          </div>
        </div>
      )}
      <div
        id="settings"
        className="flex mt-20 justify-evenly w-full h-auto min-h-[75vh] p-5"
      >
        <div id="leftCol" className="w-1/2 p-3 border-r-2 border-active">
          <div id="editDetails" className="w-full h-[75%]">
            <span className="font-bold my-2 text-3xl text-active">Setting</span>
            <div id="info" className=" grid grid-cols-2 mt-5">
              <span className="font-bold my-2 text-xl text-active">
                Company Name:
              </span>
              <span className="font-bold my-2 text-xl text-active">
                {info.companyName}
              </span>{" "}
              <span className="font-bold my-2 text-xl text-active">Country:</span>
              <span className="font-bold my-2 text-xl text-active">
                {info.address.country}
              </span>{" "}
              <span className="font-bold my-2 text-xl text-active">State:</span>
              <span className="font-bold my-2 text-xl text-active">
                {info.address.state}
              </span>{" "}
              <span className="font-bold my-2 text-xl text-active">City:</span>
              <span className="font-bold my-2 text-xl text-active">
                {info.address.city}
              </span>{" "}
              <span className="font-bold my-2 text-xl text-active">Street:</span>
              <span className="font-bold my-2 text-xl text-active">
                {info.address.street}
              </span>{" "}
              <span className="font-bold my-2 text-xl text-active">Website:</span>
              <span className="font-bold my-2 text-xl text-active">
                {info.contact.website}
              </span>{" "}
              <span className="font-bold my-2 text-xl text-active">Email:</span>
              <span className="font-bold my-2 text-xl text-active">
                {info.contact.email}
              </span>{" "}
              <span className="font-bold my-2 text-xl text-active">Phone:</span>
              <span className="font-bold my-2 text-xl text-active">
                {info.contact.phone}
              </span>
            </div>
            <div className="w-full flex">
                {" "}
                <button
                  className="bg-active text-background ml-auto text-sm p-2.5 px-3 my-5 rounded-lg font-bold"
                  onClick={() => toggleSideBar("branch")}
                >
                  Edit info
                </button>
              </div>
          </div>
          <div id="downloadData" className="w-full h-[15%] ">
            <button className="w-full h-full border-2 text-3xl text-primary border-active border-dashed rounded-lg cursor-pointer">
              Download all data
            </button>
          </div>
        </div>
        <div
          id="rightCol"
          className="w-1/2 h-[75vh] flex flex-col justify-center items-center p-3 "
        >
          <p>AI Suggestion</p>
          <p>(Avaliable in future.)</p>
        </div>
      </div>
    </div>
  );
};

export default Setting;

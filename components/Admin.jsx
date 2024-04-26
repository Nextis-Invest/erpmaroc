"use client";

import { Button, Modal } from "flowbite-react";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import React, { useContext, useEffect } from "react";
import { ExcelHandler } from "../components/ExcelHandler";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { redirect } from "next/navigation";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { DataContext } from "@/Context/DataContext";
import { useBranchFetch } from "@/hooks/useBranchFetch";
import dateFormat from "dateformat";
import { useMutation } from "@tanstack/react-query";
import { deleteKey, removeBranch } from "@/lib/fetch/Branch";

const Admin = () => {
  const { user, error, isLoading } = useUser();
  console.log("🚀 ~ Admin ~ user:", user);
  const { data, isOpen, toggleSideBar, setFormMode } = useContext(DataContext);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [id, setId] = useState("");

  const {
    data: branchData,
    isLoading: fetchingBranch,
    error: errorInFetchBranch,
    isSuccess,
  } = useBranchFetch(user?.email);
  console.log("🚀 ~ Admin ~ branchData:", branchData);

  useEffect(() => {
    if (error || !user) {
      return redirect("/login");
    }
  }, [user, error]);

  const deleteKeyMutation = useMutation({
    mutationFn: async (d) => deleteKey(d),

    onSuccess: async () => {
      console.log("Invalidating branchData");
      // await queryClient.invalidateQueries("branchData");
      await queryClient.refetchQueries({
        queryKey: "branchData",
        type: "active",
        exact: true,
      });
      // window.location.reload();
    },
  });

  const removeBranchMutation = useMutation({
    mutationFn: async (d) => removeBranch(d),

    onSuccess: async () => {
      console.log("Invalidating branchData");
      // await queryClient.invalidateQueries("branchData");
      await queryClient.refetchQueries({
        queryKey: "branchData",
        type: "active",
        exact: true,
      });
      // window.location.reload();
    },
  });

  const deleteKeyFn = (id) => {
    const d = {
      _id: id,
      branchId: branchData.data.branch._id,
    };
    console.log("RANNNNNNNNNNNN");
    deleteKeyMutation.mutate(d);
  };

  const removeBranchFn = (id) => {
    const d = {
      _id: id,
      branchId: branchData.data.branch._id,
    };
    console.log("RANNNNNNNNNNNN");
    removeBranchMutation.mutate(d);
  };

  return (
    <div>
      {" "}
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this{" "}
              {modalMode == "key" ? "key" : "branch"}?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={() => {
                  if (modalMode == "key") {
                    deleteKeyFn(id);  ///ID of branch that pretend to delete
                  } else if (modalMode == "branch") {
                    removeBranchFn(id);
                  } else {
                    console.log("ERROR");
                  }
                  setOpenModal(false);
                }}
              >
                {"Yes, I'm sure"}
              </Button>
              <Button
                color="gray"
                onClick={() => {
                  setOpenModal(false);
                }}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <div id="userBaner" className="mb-3 h-14 ">
        {user && (
          <div
            id="user"
            className="flex flex-col group focus-within: transition-all absolute top-50 right-10 hover:block content-end w-max ml-auto mr-7 gap-3 px-4 py-2 pr-7 rounded-lg bg-background shadow-md shadow-secondary"
          >
            <div className="max-w-lg mx-auto">
              <details className=" outline-none ring-0">
                <summary className="flex gap-2 items-center justify-end text-sm leading-6 text-slate-900 ring-0 font-semibold select-none">
                  <Image
                    width={40}
                    height={40}
                    className="rounded-sm"
                    src={`${user?.picture}`}
                    alt="user-profile"
                  />
                  <p className="font-bold text-lg text-active">
                    {user?.nickname}
                  </p>
                </summary>
                <div className="mt-3 leading-6 text-active text-md font-semibold">
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
              <span className="font-bold text-3xl text-active">
                KEYS{" "}
                <span
                  title="Connect to parent branch."
                  className="inline-flex items-center justify-center w-6 h-6 me-2 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full "
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <span className="sr-only">Icon description</span>
                </span>
              </span>
              {branchData?.data?.branch?.keys?.map((key) => {
                return (
                  <div
                    id="key"
                    className="grid grid-cols-10 grid-rows-1 gap-2 h-12 border-b-2 border-primary items-center"
                    key={key.name}
                  >
                    <div className="ml-2 truncate col-span-2">{key.name}</div>
                    <div className="truncate col-span-3 px-2 py-1 shadow-inner font-semibold shadow-[#aaaa] rounded-lg">
                      {key.key}
                    </div>

                    <div className=" col-span-3">{key.description}</div>
                    <div className="text-sm ">
                      {dateFormat(key.createdTime, "paddedShortDate")}
                    </div>

                    <div className=" grid justify-end">
                      <button
                        className="w-10 h-auto"
                        onClick={() => {
                          setModalMode("branch");
                          setOpenModal(true);
                          setId(key?._id);
                        }}
                      >
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
                  onClick={() => toggleSideBar("add-key")}
                >
                  Generate new keys
                </button>
              </div>
            </div>
            <div id="branches" className="mt-3 pb-5">
              <span className="font-bold text-3xl text-active">Branches</span>
              {branchData?.data?.branch?.childBranch?.map((branch, index) => {
                return (
                  <div
                    id="key"
                    className="grid grid-cols-6 gap-2 h-12 border-b-2 border-primary items-center"
                    key={index}
                  >
                    <div className="ml-2 col-span-2">{branch.companyName}</div>
                    <div>{branch.phone}</div>
                    <div className="col-span-2">{branch.cityName}</div>

                    <div className=" grid justify-end">
                      {/* {branch.length > 0 && ( */}
                      {/* <div className="w-full flex"> */}{" "}
                      <button
                        className="w-10 h-auto"
                        onClick={() => {
                          setModalMode("branch");
                          setOpenModal(true);
                          setId(branch?._id);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faEllipsis}
                          height={22}
                          width={22}
                          alt="threeDots"
                          className="mr-2"
                        />
                      </button>
                    </div>
                    {/* )} */}
                    {/* </div> */}
                  </div>
                );
              })}
              <div className="w-full flex">
                {" "}
                <button
                  className="bg-active text-background ml-auto text-sm p-2.5 px-3 my-5 rounded-lg font-bold"
                  onClick={() => toggleSideBar("add-child-branch")}
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
                className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
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
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    XLSX, XLS
                  </p>
                </div>
                <button
                  id="export-file"
                  className="hidden"
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

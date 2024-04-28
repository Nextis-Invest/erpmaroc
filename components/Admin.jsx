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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteKey, removeBranch } from "@/lib/fetch/Branch";

const Admin = () => {
  const { user, error, isLoading } = useUser();
  console.log("🚀 ~ Admin ~ user:", user);
  const { data, isOpen, toggleSideBar, setFormMode } = useContext(DataContext);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [id, setId] = useState("");
  const queryClient = useQueryClient();

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
      await queryClient.invalidateQueries("branchData");
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
      await queryClient.invalidateQueries("branchData");
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
                    deleteKeyFn(id); ///ID of branch that pretend to delete
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
                    className="w-9 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 32 32"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M23.845 8.125c-1.395-3.701-4.392-6.045-8.92-6.045-5.762 0-9.793 4.279-10.14 9.861-2.779 0.889-4.784 3.723-4.784 6.933 0 3.93 3.089 7.249 6.744 7.249h0.889c0.552 0 1-0.448 1-1s-0.448-1-1-1h-0.889c-2.572 0-4.776-2.404-4.776-5.249 0-2.515 1.763-4.783 3.974-5.163l0.907-0.156-0.081-0.917-0.008-0.011c0-4.871 3.206-8.545 8.162-8.545 3.972 0 6.204 1.957 7.236 5.295l0.213 0.688 0.721 0.015c3.715 0.078 6.971 3.092 6.971 6.837 0 3.408-2.259 7.206-5.679 7.206h-0.285c-0.552 0-1 0.448-1 1s0.448 1 1 1v-0.003c5-0.132 7.883-4.909 7.883-9.203-0.001-4.617-3.619-8.304-8.141-8.791zM20.198 24.233c-0.279-0.292-0.731-0.292-1.010-0l-2.2 2.427v-10.067c0-0.552-0.448-1-1-1s-1 0.448-1 1v10.076l-2.128-2.373c-0.28-0.292-0.732-0.355-1.011-0.063l-0.252 0.138c-0.28 0.293-0.28 0.765 0 1.057l3.61 3.992c0.005 0.005 0.006 0.012 0.011 0.017l0.253 0.265c0.14 0.146 0.324 0.219 0.509 0.218 0.183 0.001 0.368-0.072 0.507-0.218l0.253-0.265c0.005-0.005 0.008-0.011 0.012-0.017l3.701-4.055c0.279-0.292 0.279-0.639 0-0.932z"
                    />
                  </svg>
                  {/* <svg
                    fill="#000000"
                    className="w-8 h-8"
                    viewBox="0 0 32 32"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2" d="M23.845 8.125c-1.395-3.701-4.392-6.045-8.92-6.045-5.762 0-9.793 4.279-10.14 9.861-2.779 0.889-4.784 3.723-4.784 6.933 0 3.93 3.089 7.249 6.744 7.249h0.889c0.552 0 1-0.448 1-1s-0.448-1-1-1h-0.889c-2.572 0-4.776-2.404-4.776-5.249 0-2.515 1.763-4.783 3.974-5.163l0.907-0.156-0.081-0.917-0.008-0.011c0-4.871 3.206-8.545 8.162-8.545 3.972 0 6.204 1.957 7.236 5.295l0.213 0.688 0.721 0.015c3.715 0.078 6.971 3.092 6.971 6.837 0 3.408-2.259 7.206-5.679 7.206h-0.285c-0.552 0-1 0.448-1 1s0.448 1 1 1v-0.003c5-0.132 7.883-4.909 7.883-9.203-0.001-4.617-3.619-8.304-8.141-8.791zM20.198 24.233c-0.279-0.292-0.731-0.292-1.010-0l-2.2 2.427v-10.067c0-0.552-0.448-1-1-1s-1 0.448-1 1v10.076l-2.128-2.373c-0.28-0.292-0.732-0.355-1.011-0.063l-0.252 0.138c-0.28 0.293-0.28 0.765 0 1.057l3.61 3.992c0.005 0.005 0.006 0.012 0.011 0.017l0.253 0.265c0.14 0.146 0.324 0.219 0.509 0.218 0.183 0.001 0.368-0.072 0.507-0.218l0.253-0.265c0.005-0.005 0.008-0.011 0.012-0.017l3.701-4.055c0.279-0.292 0.279-0.639 0-0.932z"></path>
                  </svg> */}
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to download</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Staff, Proudcts, Charts.
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

"use client";
import { DataContext } from "@/Context/DataContext";
import React, { useContext, useEffect, useState } from "react";

const Table = () => {
  const { data, setdata } = useContext(DataContext);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPagination, setCurrentPagination] = useState(1);
  const rowsPerPage = 20;

  const startingIndex = (currentPagination - 1) * rowsPerPage;
  const endingIndex = startingIndex + rowsPerPage;

  const totalPages = Math.ceil(data?.length / rowsPerPage);
  const paginationButtons = [];
  for (let i = currentPagination - 2; i < currentPagination + 3; i++) {
    if (i > 0 && i < totalPages) {
      paginationButtons.push(
        <button
          key={i}
          onClick={() => setCurrentPagination(i)}
          className={
            currentPagination === i
              ? "text-active text-2xl font-extrabold px-4 py-1 rounded-md mx-1 my-2"
              : "text-primary font-bold text-xl px-4 py-1 rounded-md mx-2 my-2"
          }
        >
          {i}
        </button>
      );
    }
  }
  useEffect(() => {
    setPaginatedData(data?.slice(startingIndex, endingIndex));
  }, [currentPagination]);

  if (!data) {
    return;
  }

  const tableHeader = Object.keys(data[0]).map((key) => (
    <th className="mx-2 border-b-4 border-r-2 border-secondary" key={key}>
      {key}
    </th>
  ));
  const tableRows = paginatedData.map((row, index) => (
    <tr className=" border-b-2 border-b-secondary lg:h-9" key={index}>
      <td className="border-r-2 border-secondary" key={index}>
        {(index + (currentPagination * rowsPerPage))-19}
      </td>
      {Object.values(row).map((value, index) => (
        <td
          className="text-center px-2 mx-2 border-r-2 border-secondary hover:font-extrabold"
          key={index}
        >
          {value}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="w-full min-h-[80vh] h-auto flex flex-col content-center">
      <table className="w-full lg:min-w-[1600px] md:min-w-[1000px]">
        <thead>
          <tr>
            <th className="border-r-2 border-b-4 border-secondary">No</th>
            {tableHeader}
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
      <div className="w-full h-14 text-center my-auto">
        {paginationButtons}.....
        <button
          key={totalPages}
          onClick={() => setCurrentPagination(totalPages)}
          className={
            currentPagination === totalPages
              ? "text-active text-2xl font-extrabold px-4 py-1 rounded-md mx-1 my-2"
              : "text-primary font-bold text-xl px-4 py-1 rounded-md mx-2 my-2"
          }
        >
          {totalPages}
        </button>
      </div>
    </div>
  );
};

export default Table;

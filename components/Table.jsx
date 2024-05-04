"use client";
import React, { Suspense, useEffect, useState } from "react";
import Loading from "./Loading";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Table = ({ data, mode, action }) => {
  const [paginatedData, setPaginatedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPagination, setCurrentPagination] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const rowsPerPage = 20;
  let delay = 30;

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

  const productDetail = async (e) => {
    if(mode != "products"){
      return
      
    }
    e.preventDefault();
    setTimeout(() => {
      setShowPopup(false);
    }, 30000);

    setShowPopup(true);
    setPopupPosition({ x: e.clientX, y: e.clientY - 200 });
    console.log(showPopup);
    console.log(popupPosition);

    // router.push(`/products/${i}`);
    // const res = await fetch("https://random.imagecdn.app/500/150")
  };
  useEffect(() => {
    setPaginatedData(data?.slice(startingIndex, endingIndex));
  }, [currentPagination]);

  if (!data) {
    return <div className="w-full h-full font-bold">No Selected Data</div>;
  }

  const tableHeader = Object.keys(data[0]).map((key) => (
    <th className="mx-2 border-y-4 border-x-2 border-secondary py-2" key={key}>
      {key}
    </th>
  ));
  const tableRows = paginatedData.map((row, index) => (
    <tr
      onClick={(e) => productDetail(e)}
      className="relative border-b-2 border-b-secondary lg:h-9 hover:bg-[#0000002c]"
      key={index}
    >
      <td className="text-center border-x-2 border-secondary" key={index}>
        {index + currentPagination * rowsPerPage - 19}
      </td>
      {Object.values(row).map((value, index) => (
        <td
          className="text-center px-2 mx-2 border-x-2 border-secondary"
          key={index}
        >
          {value}
        </td>
      ))}
      {mode == "staffs" && <td className="text-center px-2 mx-2 border-x-2 border-secondary cursor-pointer" onClick={action}><FontAwesomeIcon  icon={faEllipsis}/></td>}
    </tr>
  ));

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full min-h-[80vh] h-auto flex flex-col content-center">
        <table className="w-full md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1700px]">
          <thead>
            <tr>
              <th className="mx-2 border-y-4 border-x-2 border-secondary py-2">No</th>
              {tableHeader}
              {mode == "staffs" && <td className="text-center mx-2 font-bold py-2">Edit</td>}

            </tr>
          </thead>
          <tbody className="relative">{tableRows}</tbody>
        </table>
        {
          totalPages > 20 && <div className="w-full h-14 text-center my-auto">
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
        }
      </div>
      {showPopup && (
        <div
          className="popup-box h-auto w-auto"
          style={{
            position: "absolute",
            top: popupPosition.y,
            left: popupPosition.x,
          }}
        >
          {loading && (
            <div className=" px-3 py-2 rounded-md ">
              <Loading size="2x" />
            </div>
          )}
          <img
            onLoad={() => setLoading(false)}
            style={{ display: loading ? "none" : "block" }}
            src="https://random.imagecdn.app/500/350"
          />
          <p
            style={{ display: loading ? "none" : "block" }}
            className="mix-blend-difference absolute text-background border-1 border-text  right-2 bottom-1"
          >
            Close after 30s
          </p>
        </div>
      )}
    </Suspense>
  );
};

export default Table;

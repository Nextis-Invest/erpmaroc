"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import DownloadBtn from "./DownloadBtn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faMagnifyingGlassArrowRight,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

function generateRandomProduct() {
  const randomCategories = ["Electronics", "Clothing", "Home Goods"]; // Example categories
  const randomCategory =
    randomCategories[Math.floor(Math.random() * randomCategories.length)];

  return {
    name: `Product ${Math.floor(Math.random() * 10000)}`, // Random product name
    description: `This is a description for product ${Math.floor(
      Math.random() * 10000
    )}`, // Random description
    notes: `Some additional notes about product ${Math.floor(
      Math.random() * 10000
    )}`, // Random notes
    category: randomCategory,
    price: Math.random() * 100 + 50, // Random price between $50 and $150
    quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 10
    branch: Math.floor(Math.random() * 100) + 1, // Generate a random ObjectId for branch reference
  };
}

let branchDataMockUp = [];
for (let i = 0; i < 200; i++) {
  let a = generateRandomProduct();
  branchDataMockUp.push(a);
}

// console.log("🚀 ~ branchDataMockUp:", branchDataMockUp);

const TanStackTable = ({ branchData }) => {
  const columnHelper = createColumnHelper();

  const cols = Object.keys(branchDataMockUp[0]);
  // console.log("🚀 ~ TanStackTable ~ cols:", cols);

  const columns = [
    columnHelper.accessor("No", {
      id: cols,
      cell: (info) => <span>{info.row.index + 1}</span>,
      header: "No",
    }),
    // columnHelper.accessor("profile", {
    //   cell: (info) => (
    //     <img
    //       src={info?.getValue()}
    //       alt="..."
    //       className="rounded-full w-10 h-10 object-cover"
    //     />
    //   ),
    //   header: "Profile",
    // }),

    // columnHelper.accessor("lastName", {
    //   cell: (info) => <span>{info.getValue()}</span>,
    //   header: "Last Name",
    // }),
    // columnHelper.accessor("age", {
    //   cell: (info) => <span>{info.getValue()}</span>,
    //   header: "Age",
    // }),
    // columnHelper.accessor("visits", {
    //   cell: (info) => <span>{info.getValue()}</span>,
    //   header: "Visits",
    // }),
    // columnHelper.accessor("progress", {
    //   cell: (info) => <span>{info.getValue()}</span>,
    //   header: "Progress",
    // }),
  ];

  {
    cols.map((col) => {
      console.log("🚀 ~ cols.map ~ col:", col);
      const column = columnHelper.accessor(col, {
        cell: (a) => <span>{a.getValue()}</span>,
        header: col,
      });

      // const column = {
      //   accessorKey: col,
      //   header: col,
      //   size: 225,
      //   // cell: EditableCell,
      //   // enableColumnFilter: true,
      //   // filterFn: "includesString",
      // }
      columns.push(column);
    });
  }

  const [data] = useState(() => [...branchDataMockUp]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");

  const table = useReactTable({
    data,
    columns,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: "onChange",
    state: {
      globalFilter: filtering,
      sorting: sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  return (
    <div className="p-2 mx-auto bg-background">
      <div className="flex sticky z-50 top-0 bg-[#F2F2F2] justify-between pb-2">
        <div className="w-full flex  items-center justify-between gap-1">
          <div className="w-full">
            <FontAwesomeIcon icon={faSearch} className="ml-2" color="#0050C8" />
            <input
              type="text"
              value={filtering}
              onChange={(e) => setFiltering(e.target.value)}
              className="p-2 bg-transparent outline-none ring-0 border-0 border-b-2 w-1/5 focus:w-1/3 focus:ring-0 duration-300 border-active"
              placeholder="Search all columns..."
            />
          </div>{" "}
          <DownloadBtn data={data} fileName={"peoples"} />
        </div>
      </div>
      <table className=" w-full max-h-[70vh] h-[60vh] overflow-y-scroll text-left">
        <thead className="bg-active sticky top-12 z-40 text-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className="capitalize select-none px-3.5 py-2 border-r-2 border-background"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {/* {header.column.columnDef.header} */}
                  {/* {console.log("🚀 ~ TanStackTable ~ header:", header)} */}
                  {
                    {
                      asc: (
                        <FontAwesomeIcon
                          icon={faSortUp}
                          className="ml-2"
                          color="#fff"
                        />
                      ),
                      desc: (
                        <FontAwesomeIcon
                          icon={faSortDown}
                          className="ml-2"
                          color="#fff"
                        />
                      ),
                    }[header.column.getIsSorted() ?? null]
                  }
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={`
                  ${i % 2 === 0 ? "bg-gray-300" : "bg-gray-200"}
                  `}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    id="cell"
                    key={cell.id}
                    className="px-2.5 py-1.5 truncate hover:overflow-visible max-w-32"
                    data={cell.getValue()}
                    style={{ position: "relative" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="text-center h-32">
              <td colSpan={12}>No Recoard Found!</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* pagination */}
      <div className="flex items-center justify-end mt-2 gap-2">
        <button
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
          className="p-1 border border-gray-500 px-2 disabled:opacity-30"
        >
          {"<"}
        </button>
        <button
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
          className="p-1 border border-gray-300 px-2 disabled:opacity-30"
        >
          {">"}
        </button>

        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16 bg-transparent"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="p-2 bg-transparent"
        >
          {[10, 20, 30, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TanStackTable;

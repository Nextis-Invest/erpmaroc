import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
// import { USERS } from "../data";
import { useState } from "react";
import DownloadBtn from "./DownloadBtn";

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
    category: [randomCategory],
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

console.log("🚀 ~ branchDataMockUp:", branchDataMockUp);

const TanStackTable = ({ branchData }) => {
  const columnHelper = createColumnHelper();

  const cols = Object.keys(branchDataMockUp[0]);
  console.log("🚀 ~ TanStackTable ~ cols:", cols);

  const columns = [
    columnHelper.accessor("", {
      id: cols,
      cell: (info) => <span>{info.row.index + 1}</span>,
      header: "S.No",
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
      const column = columnHelper.accessor(col, {
        cell: (a) => <span>{a.getValue()}</span>,
        header: col.toUpperCase(),
      });
      columns.push(column);
    });
  }

  const [data] = useState(() => [...branchDataMockUp]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-2 mx-auto bg-background">
      <div className="flex justify-between mb-2">
        <div className="w-full flex items-center gap-1">
          🔎{" "}
          <input
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            className="p-2 bg-transparent outline-none border-b-2 w-1/5 focus:w-1/3 duration-300 border-active"
            placeholder="Search all columns..."
          />
        </div>
        <DownloadBtn data={data} fileName={"peoples"} />
      </div>
      <table className=" w-full text-left">
        <thead className="bg-active text-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="capitalize px-3.5 py-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
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
                  //   <td id="cell" key={cell.id} className="px-2.5 py-1.5 truncate max-w-32" title={cell.getValue()}>
                  //     {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  //   </td>
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

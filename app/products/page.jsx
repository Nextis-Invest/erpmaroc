import React from "react";
// import Table from "../../components/Table";
// import SearchBox from "../../components/SearchBox";
import TanStackTable from "@/components/TanstackTable";
import Products from "@/components/Products";

const page = () => {
  return (
    <div className="flex flex-col min-w-[80%] h-full">
      {/* <div className="w-full h-auto mb-5 flex justify-end"><SearchBox /></div> */}
      <Products />
      {/* <TanStackTable/> */}
    </div>
  );
};

export default page;

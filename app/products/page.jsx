import React from "react";
import Table from "../../components/Table";
import Products from "../../components/Products";
import SearchBox from "../../components/SearchBox";

const page = () => {
  return (
    <div className="flex flex-col min-w-[80%] h-full">
      {/* <div className="w-full h-auto mb-5 flex justify-end"><SearchBox /></div> */}
      <Products />
    </div>
  );
};

export default page;

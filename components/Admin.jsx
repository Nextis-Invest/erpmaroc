import React from "react";
import { ExcelHandler } from "./ExcelHandler";
import Table from "./Table";

const Admin = () => {
    let keys = [
        {
            name: "Key1",
            description: "This is the first key",
            createdTime: "2024-04-12T08:00:00",
            createdPerson: "John Doe"
        },
        {
            name: "Key2",
            description: "This is the second key",
            createdTime: "2024-04-12T10:30:00",
            createdPerson: "Jane Smith"
        },
        {
            name: "Key3",
            description: "This is the third key",
            createdTime: "2024-04-12T12:45:00",
            createdPerson: "Alice Johnson"
        }
    ];
    
    console.log(keys);
    
  return (
    <>
      <div id="left_col">
        <div id="first_row">
          <div id="keys">
            <Table data={keys}/>
          </div>
          <div id="branches"></div>
        </div>
        <div id="sec_row">
          <div id="sec_row_left_col">
            <ExcelHandler />
          </div>
          <div id="sec_row_right_col">
            <button>Export to EXCEL file</button>
          </div>
        </div>
      </div>
      <div id="right_col" className=""></div>
    </>
  );
};

export default Admin;

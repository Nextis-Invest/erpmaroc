"use client";

import React, { useState } from "react";

const SearchBox = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };
  return (
    <div className="w-2/5">
      <form>
        <div className="flex relative">
          <div className="flex flex-col">
            {" "}
            <button
              id="dropdown-button"
              className="w-36 flex-shrink-0 z-10 inline-flex hover:bg-accent items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-primary rounded-s-lg hover:bg-gray-200"
              type="button"
              onClick={toggleDropdown}
            >
              All categories
              <svg
                className="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="z-10 absolute bg-background top-12 divide-y divide-gray-100 rounded-lg shadow w-44">
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <button
                      type="button"
                      className="inline-flex hover:bg-accent w-full px-4 py-2 hover:bg-gray-100"
                      onClick={closeDropdown}
                    >
                      Mockups
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="inline-flex hover:bg-accent w-full px-4 py-2 hover:bg-gray-100"
                      onClick={closeDropdown}
                    >
                      Templates
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="inline-flex hover:bg-accent w-full px-4 py-2 hover:bg-gray-100"
                      onClick={closeDropdown}
                    >
                      Design
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="inline-flex hover:bg-accent w-full px-4 py-2 hover:bg-gray-100"
                      onClick={closeDropdown}
                    >
                      Logos
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="relative w-full">
            <input
              type="search"
              id="search-dropdown"
              className="block p-2.5 w-full z-20 focus:outline-none text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-accent border-s-0 border border-primary"
              placeholder="Search..."
              required
            />
            <button
              type="submit"
              className="absolute top-0 end-0 p-2.5 px-4 text-sm font-medium h-full text-white bg-active rounded-e-lg  hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBox;

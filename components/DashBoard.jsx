"use client";

import { DataContext } from "@/Context/DataContext";
import React, { Suspense, useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Loading from "./Loading";
import { ExcelHandler } from "./ExcelHandler";


const DashBoard = () => {
  const [months, setMonths] = useState([]);
  const [pricesByYear, setPricesByYear] = useState({});
  const [series, setSeries] = useState([]);
  const [columns, setColumns] = useState([]);
  const [lines, setLines] = useState([]);


  const { branchData, setdata } = useContext(DataContext);
  console.log("🚀 ~ DashBoard ~ branchData:", branchData)

//TODO Add real data
  
  let revenue = [];
  let totalSale = [];
  let cols;

  const chartController = () => {
    if (branchData == null) {
      return;
    }

    let temp_years = [];
    let temp_prices = {};

    // Extract months and sort
    for (let i = 0; i < branchData.length; i++) {
      if (!temp_years?.includes(branchData[i].Year)) {
        temp_years.push(branchData[i].Year);
      }
    }

    temp_years?.sort((a, b) => a - b);
    setMonths(temp_years?.map((number) => number?.toString()));

    // Extract prices for each year
    branchData.forEach((book) => {
      const { Year } = book;
      if (!temp_prices[Year]) {
        temp_prices[Year] = [];
      }
      temp_prices[Year].push(book.Price);
    });

    setPricesByYear(temp_prices);

    Object.keys(temp_prices).map((year) => {
      let total = temp_prices[year]?.reduce((acc, price) => acc + price, 0);
      revenue.push(total);
    });

    Object.keys(temp_prices).forEach((year) => {
      const totalBooksSold = temp_prices[year].length; // Count the number of books for the year
      totalSale.push(totalBooksSold);
    });

    cols = Object.keys(branchData[0]);
    console.log("🚀 ~ chartController ~ cols:", cols);

    let s = [
      {
        name: "Sale",
        data: totalSale,
      },
      {
        name: "Revenue",
        data: revenue,
      },
    ];

    setSeries(s);
    console.log(series);
  };

  useEffect(() => {
    chartController();
    setColumns(cols);
    console.log("Lines", lines);
  }, [branchData, cols, lines]);
  
  console.log("🚀 ~ DashBoard ~ columns:", columns)
  console.log("🚀 ~ DashBoard ~ pricesByYear:", pricesByYear)
  console.log("🚀 ~ DashBoard ~ months:", months)
  
  var chartOptions = {
    chart: {
      type: "area",
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.5,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },

    xaxis: {
      categories: months,
    },
  };

  var colChartOption = {
    series: [{
    name: 'Branch 1',
    data: [44, 55, 57, 56, 61, 36, 26, 45, 58, 63, 60, 66]
  }, {
    name: 'Branch 2',
    data: [76, 85, 101, 98, 87, 36, 26, 45, 105, 91, 114, 94]
  }, {
    name: 'Branch 3',
    data: [35, 41, 36, 26, 45, 48, 52, 36, 26, 45, 53, 41]
  }],
    chart: {
    type: 'bar',
    height: 350
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov', 'Dec'],
  },
  yaxis: {
    title: {
      text: 'Branch Revenue'
    } 
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return  val + " MMK"
      }
    }
  }
  };


  var pieOptions = {
    chart: {
      type: "donut",
    },

    series: [44, 55, 13, 33],
    labels: ["Revenue", "Profit", "Expenses", "Salaries"],
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          labels: {
            show: true,
            // name: {
            //   name
            // },
            // value: {
            //   profit
            // }
          },
        },
      },
    },
  };
  return (
    <Suspense fallback={<Loading size="3x" />}>
      <div className="w-full h-full ">
        <div
          id="chart"
          className="drop-shadow-md shadow-md shadow-secondary rounded-lg p-5 select-none"
        >
          <div id="firstRow" className="w-full flex items-start">
            <div id="firstCol" className="w-full">
              {" "}
              <Chart
                options={chartOptions}
                series={series}
                // series={chartOptions.series}
                type={chartOptions.chart.type}
                height={320}
                className="w-full border-b-2 border-primary"
              />
            </div>
            {/* <div id="secCol" className="w-max">
              <h3 className="mb-4 font-semibold text-gray-900">Columns</h3>
              <ul className=" w-max text-sm font-medium text-gray-900 bg-white rounded-lg">
                {console.log(columns)}
                {columns &&
                  columns.map((col) => (
                    <li key={col} className="w-full rounded-t-lg pr-5">
                      <div className="flex items-center ps-3">
                        <input
                          id="col"
                          type="checkbox"
                          value="col"
                          onChange={() => {
                            setLines(
                              lines.includes(col)
                                ? lines.filter((line) => line !== col)
                                : [...lines, col]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label
                          for="col"
                          className="w-full py-1.2 ms-2 text-sm font-medium text-gray-900"
                        >
                          {col}
                        </label>
                      </div>
                    </li>
                  ))}
              </ul>
            </div> */}
          </div>
          <div id="secondRow" className="flex items-center">
            <div id="firstCol" className="w-2/5 border-r-2 border-primary">
              <Chart
                options={pieOptions}
                series={pieOptions.series}
                type={pieOptions.chart.type}
                // width={700}
                height={500}
                className="mt-5 max-h-72"
              />
            </div>
            <div id="secCol" className="w-2/3 max-h-[300px]">
              {" "}
              <Chart
                options={colChartOption}
                series={colChartOption.series}
                type="bar"
                height={320}
              />
            </div>
          </div>
        </div>
        <ExcelHandler />
      </div>
    </Suspense>
  );
};



export default DashBoard;

"use client";

import { DataContext } from "@/Context/DataContext";
import React, { Suspense, useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Loading from "./Loading";
import { ExcelHandler } from "./ExcelHandler";

const DashBoard = () => {
  const { data, setdata } = useContext(DataContext);
  const [years, setYears] = useState([]);
  const [pricesByYear, setPricesByYear] = useState({});
  const [series, setSeries] = useState([]);

  let revenue = []
  let totalSale = []
  // const chartController = () => {
  //   if (data == null) {
  //     return;
  //   }

  //   let temp_years = [];
  //   let temp_prices = {};
  //   let temp_data = {};

  //   // Extract Years and sort

  //   for (let i = 0; i < data.length; i++) {
  //     if (!temp_years.includes(data[i].Year)) {
  //       temp_years.push(data[i].Year);
  //     }
  //   }

  //   temp_years.sort((a, b) => a - b);
  //   setYears(temp_years.map((number) => number.toString()));

  //   data.forEach(book => {
  //     const { Year } = book;
  //     if (!temp_prices[Year]) {
  //       temp_prices[Year] = [];
  //     }
  //     temp_prices[Year].push(book.Price);
  //   });
  // };

  const chartController = () => {
    if (data == null) {
      return;
    }
  
    let temp_years = [];
    let temp_prices = {};
    let temp_data = {};
  
    // Extract Years and sort
    for (let i = 0; i < data.length; i++) {
      if (!temp_years.includes(data[i].Year)) {
        temp_years.push(data[i].Year);
      }
    }
  
    temp_years.sort((a, b) => a - b);
    setYears(temp_years.map((number) => number.toString()));
  
    // Extract prices for each year
    data.forEach(book => {
      const { Year } = book;
      if (!temp_prices[Year]) {
        temp_prices[Year] = [];
      }
      temp_prices[Year].push(book.Price);
    });
  
    setPricesByYear(temp_prices);

    let total
    
    Object.keys(temp_prices).map(year => {
      total = temp_prices[year].reduce((acc, price) => acc + price, 0);
      revenue.push(total)
    });
    
    Object.keys(temp_prices).forEach((year) => {
      const totalBooksSold = temp_prices[year].length; // Count the number of books for the year
      totalSale.push(totalBooksSold);
    });

    let s = [ {
      name: "Sale",
      data:totalSale
    },{
      name: "Revenue",
      data:revenue
    }]

    setSeries(s)
    console.log(series);
  };
  
  useEffect(() => {
    chartController();
  }, [data]);

  console.log(years);
  console.log(pricesByYear);

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
      categories: years,
    },
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
          <Chart
            options={chartOptions}
            series={series}
            // series={chartOptions.series}
            type={chartOptions.chart.type}
            height={320}
            className="w-full border-b-2 border-primary"
          />
          <div id="secondRow">
            <Chart
              options={pieOptions}
              series={pieOptions.series}
              type={pieOptions.chart.type}
              // width={700}
              height={500}
              className="w-2/5 mt-5 border-r-2 border-primary"
            />
          </div>
        </div>
        <ExcelHandler/>

      </div>
    </Suspense>
  );
};

export default DashBoard;

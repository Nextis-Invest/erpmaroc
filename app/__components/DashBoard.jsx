"use client";

import React from "react";
import Chart from "react-apexcharts";

const DashBoard = () => {
  var options = {
    chart: {
      type: "area",
    },
    dataLabels: {
        enabled: false
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 0.5,
          stops: [0, 90, 100]
        }
      },
    stroke: {
      curve: "smooth",
      width: 3
    },
    series: [
      {
        name: "sales",
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
      },
      {
        name: "Revenue",
        data: [60, 70, 45, 100, 49, 60, 30, 86, 155],
      },
 
    ],

    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
    },

  };
  return (
    <div className="w-full h-full ">
      <div
        id="chart"
        className="drop-shadow-md shadow-md shadow-secondary rounded-lg p-5 select-none"
      >
        <Chart
          options={options}
          series={options.series}
          type={options.chart.type}
          width={700}
          height={320}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default DashBoard;

"use client";

import { DataContext } from "@/Context/DataContext";
import React, { Suspense, useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Loading from "./Loading";
import { ExcelHandler } from "./ExcelHandler";
import { useBranchDataFetch } from "@/hooks/useBranchDataFetch";
import { useBranchFetch } from "@/hooks/useBranchFetch";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";

const DashBoard = () => {
  const queryClient = useQueryClient();

  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [chartMonths, setChartMonths] = useState([]);
  const [totalSale, setTotalSale] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [series, setSeries] = useState([]);
  const [pieChartData, setPieChartData] = useState({salaries:0, bonus:0, revenue:0});
  const { user, error, isLoading } = useUser();

  //////////////////// REDIRECT TO LOGOUT if not USER
  useEffect(() => {
    if (!isLoading && !user) {
      return redirect("/login");
    }
  }, [user, isLoading]);

  //////////////////////

  const {
    data: branchData,
    isLoading: fetchingBranch,
    error: errorInFetchBranch,
    isSuccess,
  } = useBranchFetch(user?.email);

  const {
    data,
    isLoading: fetchingBranchData,
    error: errorInFetchBranchdData,
  } = useBranchDataFetch(branchData?.data?.branch?._id);

  console.log("🚀 ~ DashBoard ~ data:", data?.data?.dashboardData);
  // console.log("🚀 ~ DashBoard ~ branchData:", branchData);


  //// REFETCH when required data changes
  useEffect(() => {
    const refetch = async () => {
      await queryClient.refetchQueries({
        queryKey: "branchData",
        type: "active",
        exact: true,
      });
    };
    refetch();
  }, [queryClient, user]);

  useEffect(() => {
    const refetch = async () => {
      await queryClient.refetchQueries({
        queryKey: "dashboardData",
        type: "active",
        exact: true,
      });
    };
    refetch();
  }, [queryClient, branchData]);

  console.log("🚀 ~ chartController ~ series:", series);





  ///////////////////Chart Controller Start

  useEffect(() => {
    let newTotalSales = [];
    let newRevenue = [];
    let pieChartData = [];
    

    data?.data?.dashboardData.forEach((branch)=>{
      console.log("🚀 ~ data?.data?.dashboardData,map ~ branch:", data?.data?.dashboardData)

      Object.entries(dashboardData).forEach(([branchName, branchData]) => {
        console.log("Branch:", branchName);
      
        // Iterate over each month's data for the current branch
        Object.keys(branchData).forEach(monthKey => {
          const monthData = branchData[monthKey];
          console.log("Month:", monthData.month);
          console.log("Total Records:", monthData.totalRecords);
          console.log("Total Sales:", monthData.totalSales);
        });
      });

      // branch.map(
      //   ({ totalRecords, totalSales, month }) => {
      //     console.log("🚀 ~ data?.data?.dashboardData.map ~ totalRecords:", totalRecords)
      //     // const monthNumber = new Date().getMonth() + 1;
      //     // setChartMonths(months.slice(0, monthNumber)); ///This nolonger need because serirs take all task.
  
      //     newRevenue[month - 1] = totalSales; /// totalSale was sum of sale price when come from api
      //     newTotalSales[month - 1] = totalRecords;
      //     console.log("🚀 ~ useEffect ~ newRevenue:", newRevenue)
  
      //   }
      // );
    })



    setTotalSale(newTotalSales);
    setRevenue(newRevenue);
  }, [data?.data]);
  console.log("🚀 ~ useEffect ~ totalSale:", totalSale);

  useEffect(() => {
    const chartController = () => {
      if (data == null) {
        return;
      }

      let s = [
        {
          name: "Revenue",
          data: revenue,
        },
      ];
      const monthNumber = new Date().getMonth();
      console.log("🚀 ~ DashBoard ~ revenue:", revenue[monthNumber])

      setSeries(s);
      
      let r = revenue[monthNumber] - (data?.data?.staffData[0]?.totalSalary + data?.data?.staffData[0]?.totalBonus)
      console.log("🚀 ~ chartController ~ r:", r)

      setPieChartData((prevPieChartData) => ({
        ...prevPieChartData,
        salaries: data?.data?.staffData[0]?.totalSalary || 0,
        bonus: data?.data?.staffData[0]?.totalBonus || 0,
        revenue: r || 0,
      }));
    };

    chartController();
  }, [data, revenue]);


  ///////////////////Chart Controller End

  // console.log("🚀 ~ DashBoard ~ months:", months);

  var chartOptions = {
    chart: {
      type: "area",
    },
    yaxis: {
      title: {
        text: "Branch Revenue",
      },
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
      // categories: chartMonths,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " MMK";
        },
      },
    },
  };

  var colChartOption = {
    series: [
      {
        name: "Branch 1",
        data: totalSale,
      },
      // {
      //   name: "Branch 2",
      //   data: [76, 85, 101, 98, 87, 36, 26, 45, 105, 91, 114, 94],
      // },
      // {
      //   name: "Branch 3",
      //   data: [35, 41, 36, 26, 45, 48, 52, 36, 26, 45, 53, 41],
      // },
    ],
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      title: {
        text: "Branch Sales",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " MMK";
        },
      },
    },
  };

  var pieOptions = {
    chart: {
      type: "donut",
    },    
    series: [pieChartData.salaries, pieChartData.bonus, pieChartData.revenue], 
    labels: ["Salaries", "Bonus", "Revenue"],
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          labels: {
            show: true,
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
          </div>
          <div id="secondRow" className="flex items-center">
            <div
              id="firstCol"
              className="w-2/5 border-r-2 border-primary relative"
            >
              <Chart
                options={pieOptions}
                series={pieOptions.series}
                type={pieOptions.chart.type}
                // width={700}
                height={500}
                className="mt-5 max-h-72"
              />
              <span className=" absolute bottom-1 right-2">Monthly overview</span>
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
        {/* <ExcelHandler /> */}
      </div>
    </Suspense>
  );
};

export default DashBoard;

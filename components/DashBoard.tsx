"use client";

import { DataContext } from "@/Context/DataContext";
import React, { Suspense, useContext, useEffect, useState } from "react";
import Loading from "./Loading";
import { useBranchDataFetch } from "@/hooks/useBranchDataFetch";
import { useBranchFetch } from "@/hooks/useBranchFetch";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";


// Import shadcn/ui chart components
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package, Building2, Activity, Target, BarChart3 } from "lucide-react";


// KPI Card Component
const KPICard = ({ title, value, icon: Icon, trend, format = "number", className = "" }) => {
  const formatValue = (val) => {
    if (format === "currency") return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(val);
    if (format === "percentage") return `${val}%`;
    return new Intl.NumberFormat('fr-MA').format(val);
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.value}%
                </span>
                <span className="text-sm text-muted-foreground">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashBoard = () => {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user;
  console.log("🚀 ~ DashBoard ~ user:", user);

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

  const [pieBranch, setPieBranch] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [series, setSeries] = useState([]);
  const [seriesForColChart, setSeriesForColChart] = useState([]);
  const [pieChartData, setPieChartData] = useState({
    salaries: 0,
    bonus: 0,
    revenue: 0,
  });
  const [chartsReady, setChartsReady] = useState(false);

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
  console.log("🚀 ~ DashBoard ~ branchData:", branchData);

  const [selectedPieBranch, setSelectedPieBranch] = useState(
    branchData?.data?.branch?.companyName || ""
  );
  useEffect(() => {
    if (branchData && branchData.data && branchData.data.branch) {
      setSelectedPieBranch(branchData.data.branch.companyName);
    }
  }, [branchData]);

  const {
    data,
    isLoading: fetchingBranchData,
    error: errorInFetchBranchdData,
  } = useBranchDataFetch(branchData?.data?.branch?._id);

  //// REFETCH when required data changes

  useEffect(() => {
    if (user?.email) {
      const refetch = async () => {
        await queryClient.refetchQueries({
          queryKey: ["branchData"],
          type: "active",
          exact: true,
        });
      };
      refetch();
    }
  }, [user?.email, queryClient]);

  useEffect(() => {
    if (branchData?.data?.branch?._id) {
      const refetch = async () => {
        await queryClient.refetchQueries({
          queryKey: ["dashboardData"],
          type: "active",
          exact: true,
        });
      };
      refetch();
    }
  }, [branchData?.data?.branch?._id, queryClient]);

  ///////////////////Chart Controller Start

  useEffect(() => {
    // Check if data is available before processing
    if (!data?.data?.dashboardData) {
      setChartsReady(false);
      return;
    }

    let branchNames = []; //This is for label in pie chart
    let serie = [];
    let colSeries = [];
    let revenue;

    const currentMonth = new Date().getMonth();

    for (const branchName in data?.data?.dashboardData) {
      const branch = data?.data?.dashboardData[branchName];
      const dashboardData = data?.data?.dashboardData;
      const selectedBranchData =
        dashboardData && dashboardData[selectedPieBranch];
      const piebranch = selectedBranchData && selectedBranchData[currentMonth];

      console.log("🚀 ~ useEffect ~ branch:", piebranch);

      const totalSales = branch && Array.isArray(branch) ?
        branch.map((data) => data?.totalSales || 0) :
        branch && typeof branch === 'object' ?
          Object.values(branch).filter(val => val && typeof val === 'object').map((data) => data?.totalSales || 0) : [];

      const totalRecords = branch && Array.isArray(branch) ?
        branch.map((data) => data?.totalRecords || 0) :
        branch && typeof branch === 'object' ?
          Object.values(branch).filter(val => val && typeof val === 'object').map((data) => data?.totalRecords || 0) : [];

      revenue = totalSales;
      console.log("🚀 ~ useEffect ~ revenue:", revenue);

      let s = {
        name: branchName,
        data: totalSales.length > 0 ? totalSales : [0]
      };
      let colSerie = {
        name: branchName,
        data: totalRecords.length > 0 ? totalRecords : [0]
      };
      branchNames.push(branchName);
      serie.push(s);
      colSeries.push(colSerie);
    }

    const branch = data?.data?.dashboardData[selectedPieBranch]?.[currentMonth];
    revenue = branch?.totalSales;
    console.log("🚀 ~ useEffect ~ revenue:", revenue);

    setPieChartData((prevPieChartData) => ({
      ...prevPieChartData,
      revenue: revenue || 0,
    }));
    setPieBranch(branchNames);
    setSeries(serie.length > 0 ? serie : [{ name: "No Data", data: [0] }]);
    setSeriesForColChart(colSeries.length > 0 ? colSeries : [{ name: "No Data", data: [0] }]);

    // Set charts as ready only when we have valid data
    setChartsReady(serie.length > 0 || colSeries.length > 0);
  }, [
    branchData,
    data?.data?.dashboardData,
    data?.data?.staffData,
    selectedPieBranch,
  ]);

  useEffect(() => {
    const chartController = () => {
      if (data == null) {
        // return;
      }
      console.log(
        "🚀 ~ chartController ~ data?.data?.staffData:",
        data?.data?.staffData
      );

      setPieChartData((prevPieChartData) => ({
        ...prevPieChartData,
        salaries:
          data?.data?.staffData[selectedPieBranch]?.["0"]?.totalSalary || 0,
        bonus: data?.data?.staffData[selectedPieBranch]?.["0"]?.totalBonus || 0,
        // revenue: revenue || 0,
      }));
    };

    chartController();
  }, [data, pieBranch, revenue, selectedPieBranch]);
  console.log("🚀 ~ DashBoard ~ pieBranch:", pieBranch);

  ///////////////////Chart Controller End

  // Chart configurations for shadcn/ui charts
  const chartConfig = {
    sales: {
      label: "Ventes",
      color: "hsl(var(--chart-1))",
    },
    records: {
      label: "Enregistrements",
      color: "hsl(var(--chart-2))",
    },
  };

  const pieChartConfig = {
    salaires: {
      label: "Salaires",
      color: "hsl(var(--chart-1))",
    },
    bonus: {
      label: "Bonus",
      color: "hsl(var(--chart-2))",
    },
    revenus: {
      label: "Revenus",
      color: "hsl(var(--chart-3))",
    },
  };

  const barChartConfig = {
    records: {
      label: "Enregistrements",
      color: "hsl(var(--chart-1))",
    },
  };

  // Transform data for recharts format with fallback mock data
  const areaChartData = series.length > 0 ? months.map((month, index) => ({
    month: month.slice(0, 3), // Shorten month names
    sales: series[0]?.data?.[index] || 0,
    records: series.length > 1 ? series[1]?.data?.[index] || 0 : 0,
  })) : [
    { month: "Jan", sales: 12000, records: 45 },
    { month: "Feb", sales: 15000, records: 52 },
    { month: "Mar", sales: 18000, records: 67 },
    { month: "Apr", sales: 16000, records: 58 },
    { month: "May", sales: 20000, records: 73 },
    { month: "Jun", sales: 22000, records: 81 },
    { month: "Jul", sales: 19000, records: 65 },
    { month: "Aug", sales: 24000, records: 89 },
    { month: "Sep", sales: 21000, records: 76 },
    { month: "Oct", sales: 25000, records: 92 },
    { month: "Nov", sales: 23000, records: 84 },
    { month: "Dec", sales: 27000, records: 98 }
  ];

  const barChartData = seriesForColChart.length > 0 ? months.map((month, index) => ({
    month: month.slice(0, 3),
    records: seriesForColChart[0]?.data?.[index] || 0,
  })) : [
    { month: "Jan", records: 45 },
    { month: "Feb", records: 52 },
    { month: "Mar", records: 67 },
    { month: "Apr", records: 58 },
    { month: "May", records: 73 },
    { month: "Jun", records: 81 },
    { month: "Jul", records: 65 },
    { month: "Aug", records: 89 },
    { month: "Sep", records: 76 },
    { month: "Oct", records: 92 },
    { month: "Nov", records: 84 },
    { month: "Dec", records: 98 }
  ];

  const pieData = [
    { name: "salaires", value: pieChartData.salaries || 85000, fill: "var(--color-salaires)" },
    { name: "bonus", value: pieChartData.bonus || 12000, fill: "var(--color-bonus)" },
    { name: "revenus", value: pieChartData.revenue || 240000, fill: "var(--color-revenus)" },
  ];

  // Calculate mock KPIs for demo
  const totalRevenue = areaChartData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = barChartData.reduce((sum, item) => sum + item.records, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const monthlyGrowth = areaChartData.length > 1 ?
    ((areaChartData[areaChartData.length - 1].sales - areaChartData[areaChartData.length - 2].sales) / areaChartData[areaChartData.length - 2].sales * 100) : 0;

  return (
    <Suspense fallback={<Loading size="3x" />}>
      <div className="flex-1 space-y-6 p-6">
        {isLoading || fetchingBranch || fetchingBranchData ? (
          <Loading size="5x" />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
                <p className="text-muted-foreground">
                  Vue d&apos;ensemble de votre activité commerciale
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                <Activity className="mr-1 h-3 w-3" />
                Temps réel
              </Badge>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Chiffre d'Affaires"
                value={totalRevenue}
                icon={DollarSign}
                format="currency"
                trend={{ value: Math.abs(monthlyGrowth), isPositive: monthlyGrowth > 0 }}
              />
              <KPICard
                title="Commandes Totales"
                value={totalOrders}
                icon={ShoppingCart}
                trend={{ value: 8.2, isPositive: true }}
              />
              <KPICard
                title="Panier Moyen"
                value={avgOrderValue}
                icon={Target}
                format="currency"
                trend={{ value: 3.1, isPositive: true }}
              />
              <KPICard
                title="Produits Actifs"
                value={245}
                icon={Package}
                trend={{ value: 2.4, isPositive: false }}
              />
            </div>

            {/* Main Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              {/* Revenue Chart - Takes 4 columns */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Évolution du Chiffre d&apos;Affaires</CardTitle>
                  <CardDescription>
                    Suivi mensuel des revenus par succursale
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart
                      accessibilityLayer
                      data={areaChartData}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <defs>
                        <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="var(--color-sales)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-sales)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="sales"
                        type="natural"
                        fill="url(#fillSales)"
                        fillOpacity={0.4}
                        stroke="var(--color-sales)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Financial Overview Pie Chart - Takes 3 columns */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Répartition Financière</CardTitle>
                  <CardDescription>
                    Distribution des revenus et charges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={pieChartConfig} className="h-[300px]">
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                      />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Orders Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Volume des Commandes</CardTitle>
                  <CardDescription>
                    Nombre de commandes traitées par mois
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barChartConfig} className="h-[200px]">
                    <BarChart accessibilityLayer data={barChartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar dataKey="records" fill="var(--color-records)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Branch Selector & Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Succursales</CardTitle>
                  <CardDescription>
                    Sélection et performance par succursale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pieBranch && pieBranch.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Succursale active:</p>
                      <div className="flex flex-wrap gap-2">
                        {pieBranch.map((branchName, index) => (
                          <Badge
                            key={`branch-${index}-${branchName}`}
                            variant={selectedPieBranch === branchName ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedPieBranch(branchName)}
                          >
                            <Building2 className="mr-1 h-3 w-3" />
                            {branchName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Performance mensuelle</span>
                      <span className="text-sm font-medium">Excellente</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Objectif atteint</span>
                      <span className="text-sm font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Croissance</span>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-600">+12.5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
};

export default DashBoard;

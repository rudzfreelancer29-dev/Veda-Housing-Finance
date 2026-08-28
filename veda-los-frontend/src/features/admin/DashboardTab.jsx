import React, { useState } from "react";
import Chart from "react-apexcharts";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  Slash,
  AlertCircle,
  Filter,
  ChevronDown
} from "lucide-react";

export default function DashboardTab({ applications = [], managers = [], auditLogs = [], customers = [] }) {
  const [dateFilter, setDateFilter] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-31");

  // Calculate or mock metric values based on selected date filter
  const getMetrics = () => {
    switch (dateFilter) {
      case "today":
        return {
          total: 42,
          approved: 28,
          rejected: 5,
          pending: 9,
          totalTrend: "+8% today",
          approvedRate: "66.7% rate",
          rejectedRate: "11.9% rate",
          periodLabel: "Today's metrics"
        };
      case "week":
        return {
          total: 280,
          approved: 190,
          rejected: 32,
          pending: 58,
          totalTrend: "+14% this week",
          approvedRate: "67.8% rate",
          rejectedRate: "11.4% rate",
          periodLabel: "Weekly metrics"
        };
      case "year":
        return {
          total: 14200,
          approved: 9850,
          rejected: 1420,
          pending: 2930,
          totalTrend: "+18% YoY",
          approvedRate: "69.3% rate",
          rejectedRate: "10.0% rate",
          periodLabel: "Yearly metrics"
        };
      case "custom":
        return {
          total: 540,
          approved: 360,
          rejected: 45,
          pending: 135,
          totalTrend: "Custom period",
          approvedRate: "66.7% rate",
          rejectedRate: "8.3% rate",
          periodLabel: "Selected range"
        };
      case "all":
        return {
          total: 18500,
          approved: 12400,
          rejected: 1820,
          pending: 4280,
          totalTrend: "Lifetime total",
          approvedRate: "67.0% rate",
          rejectedRate: "9.8% rate",
          periodLabel: "All time metrics"
        };
      case "month":
      default:
        return {
          total: 1250,
          approved: 850,
          rejected: 120,
          pending: 35,
          totalTrend: "↑ +12% vs last mo",
          approvedRate: "68.0% rate",
          rejectedRate: "9.6% rate",
          periodLabel: "Last 30 days"
        };
    }
  };

  const metrics = getMetrics();

  // Line & Area chart options (Loan Application Trends)
  const lineChartOptions = {
    chart: {
      id: "application-trends",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif"
    },
    colors: ["#1e70e3", "#10b981", "#f26e21"],
    stroke: {
      curve: "smooth",
      width: 3
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.02,
        stops: [0, 95, 100]
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f1f5f9",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ["Mar 10", "Mar 4", "Mar 7", "Mar 12", "Mar 15", "Mar 28", "Mar 30"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "10px",
          fontWeight: 600
        }
      }
    },
    yaxis: {
      min: 0,
      max: 200,
      tickAmount: 4,
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "10px",
          fontWeight: 600
        }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontWeight: 600,
      fontSize: "11px",
      markers: { radius: 12 },
      itemMargin: { horizontal: 10 }
    },
    tooltip: {
      theme: "light",
      x: { show: true }
    }
  };

  const lineChartSeries = [
    {
      name: "Received",
      data: [40, 110, 75, 120, 200, 140, 190]
    },
    {
      name: "Approved",
      data: [30, 60, 50, 85, 130, 95, 125]
    },
    {
      name: "Rejected",
      data: [15, 25, 20, 30, 45, 30, 35]
    }
  ];

  // Donut chart options (System Activity by User Role)
  const donutChartOptions = {
    chart: {
      fontFamily: "Inter, sans-serif"
    },
    colors: ["#1e70e3", "#10b981", "#f26e21"],
    labels: ["Superadmin", "Manager", "Admin"],
    plotOptions: {
      pie: {
        donut: {
          size: "62%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Activity",
              color: "#64748b",
              fontSize: "11px",
              fontWeight: 600,
              formatter: () => "100%"
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontWeight: 600,
      fontSize: "10px",
      markers: { radius: 12 },
      itemMargin: { horizontal: 5, vertical: 5 }
    },
    stroke: { show: false }
  };

  const donutChartSeries = [65, 25, 10];

  // Critical Tasks Mock data with improved risk badge styling
  const criticalTasks = [
    { id: "01001301", type: "Received", risk: "High", riskColor: "bg-rose-50 text-rose-700 border-rose-200/60", manager: "John Smith", badgeColor: "bg-[#f26e21]/10 text-[#f26e21] border-[#f26e21]/20", action: "Quick-acquired" },
    { id: "01001102", type: "Approved", risk: "Medium", riskColor: "bg-amber-50 text-amber-700 border-amber-200/60", manager: "David Fhone", badgeColor: "bg-[#f26e21]/10 text-[#f26e21] border-[#f26e21]/20", action: "Quick-acquired" },
    { id: "01001103", type: "Received", risk: "High", riskColor: "bg-rose-50 text-rose-700 border-rose-200/60", manager: "Ademert Baim", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60", action: "Quick-acquired" }
  ];

  return (
    <div className="w-full space-y-3.5 sm:space-y-4">
      
      {/* Mobile-Optimized Filter Bar (Visible on mobile screens) */}
      <div className="block sm:hidden bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs space-y-3 w-full">
        {/* Top Header: Status & Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#f26e21] animate-pulse shrink-0"></span>
            <span className="text-xs font-extrabold text-slate-800 tracking-tight shrink-0">Timeline:</span>
            <span className="text-[10px] font-bold text-[#f26e21] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-wider truncate">
              {dateFilter === "all" ? "All Time" : dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : dateFilter === "month" ? "This Month" : dateFilter === "year" ? "This Year" : "Custom"}
            </span>
          </div>

          <div className="relative shrink-0">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-100 text-slate-800 font-bold text-xs pl-3 pr-7 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Bottom Header: Date Range Pickers Grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/70 p-2 rounded-xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Start Date</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value);
                setDateFilter("custom");
              }}
              className="bg-white border border-slate-200/80 text-[11px] font-bold text-slate-700 px-2 py-1 rounded-lg focus:outline-none w-full"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">End Date</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value);
                setDateFilter("custom");
              }}
              className="bg-white border border-slate-200/80 text-[11px] font-bold text-slate-700 px-2 py-1 rounded-lg focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Integrated Analytics Filter Control Bar (Visible on tablet & desktop) */}
      <div className="hidden sm:flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200/80 p-2.5 sm:p-3 rounded-2xl shadow-xs w-full">
        {/* Left: Section Indicator Badge */}
        <div className="flex items-center gap-2 px-1">
          <span className="w-2 h-2 rounded-full bg-[#f26e21] animate-pulse shrink-0"></span>
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">Timeline Metrics:</span>
          <span className="text-[10px] font-bold text-[#f26e21] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-wider">
            {dateFilter === "all" ? "All Time" : dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : dateFilter === "month" ? "This Month" : dateFilter === "year" ? "This Year" : "Custom Range"}
          </span>
        </div>

        {/* Right: Integrated Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Control Pill Bar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5 overflow-x-auto max-w-full whitespace-nowrap">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "year", label: "This Year" }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDateFilter(preset.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 whitespace-nowrap ${
                  dateFilter === preset.id
                    ? "bg-[#f26e21] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Date Picker Range Inputs */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs shrink-0 max-w-full overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value);
                setDateFilter("custom");
              }}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 font-bold px-0.5">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value);
                setDateFilter("custom");
              }}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* KPI Banner Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full">
        
        {/* KPI 1: Total Applications */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-3.5 sm:p-4 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Total Applications</span>
            <div className="flex items-baseline gap-2 mt-1 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {metrics.total.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5 whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {metrics.totalTrend}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Approved */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-3.5 sm:p-4 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Total Approved</span>
            <div className="flex items-baseline gap-2 mt-1 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {metrics.approved.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {metrics.approvedRate}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Rejected */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-3.5 sm:p-4 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
          <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <XCircle className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Total Rejected</span>
            <div className="flex items-baseline gap-2 mt-1 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {metrics.rejected.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5 whitespace-nowrap bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                {metrics.rejectedRate}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Approvals */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-3.5 sm:p-4 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Pending Approvals</span>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {metrics.pending.toLocaleString()}
              </span>
              <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200/60 uppercase tracking-wider shrink-0 whitespace-nowrap">
                Needs Action
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* Application trends area line chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight">Loan Application Trends (Last 30 Days)</h3>
          <div className="w-full h-60 sm:h-64">
            <Chart
              options={lineChartOptions}
              series={lineChartSeries}
              type="area"
              height="100%"
            />
          </div>
        </div>

        {/* System users donut chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight">System Activity by User Role</h3>
          <div className="w-full h-60 sm:h-64 flex items-center justify-center">
            <Chart
              options={donutChartOptions}
              series={donutChartSeries}
              type="donut"
              width="100%"
              height="100%"
            />
          </div>
        </div>

      </div>

      {/* Critical Tasks Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col w-full">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f26e21] flex items-center justify-center font-bold shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight leading-snug">Critical Tasks &amp; Pending Approvals</h3>
              <p className="text-[11px] text-slate-400 font-medium truncate sm:whitespace-normal">Tasks requiring immediate administrator attention</p>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs bg-slate-200/80 text-slate-700 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-extrabold self-start sm:self-auto shrink-0">
            {criticalTasks.length} pending tasks
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">
                <th className="py-3.5 px-4 sm:px-6">Application ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Manager Assigned</th>
                <th className="py-3.5 px-4">Action Required</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium whitespace-nowrap">
              {criticalTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#f26e21]">{task.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{task.type}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${task.riskColor}`}>
                      {task.risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                        {task.manager.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{task.manager}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${task.badgeColor}`}>
                      {task.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5 shrink-0 whitespace-nowrap">
                    <button className="p-1.5 text-[#f26e21] hover:bg-orange-50 rounded-lg inline-flex items-center transition-all" title="Edit Task">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg inline-flex items-center transition-all" title="Delete Task">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg inline-flex items-center transition-all" title="Block Task">
                      <Slash className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

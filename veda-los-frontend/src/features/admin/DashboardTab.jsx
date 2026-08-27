import React from "react";
import Chart from "react-apexcharts";
import {
  Users,
  FileText,
  FileCheck,
  UserCheck,
  TrendingUp,
  Edit2,
  Trash2,
  Slash,
  History
} from "lucide-react";

export default function DashboardTab({ applications = [], managers = [], auditLogs = [], customers = [] }) {
  
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

  // Critical Tasks Mock data for exact matches
  const criticalTasks = [
    { id: "01001301", type: "Received", risk: "Higher", riskColor: "bg-[#e6fcf5] text-[#0ca678] border-[#c3fae8]", manager: "John Smith", badgeColor: "bg-[#fff5f5] text-[#ff6b6b] border-[#ffe3e3]", action: "Quick-acquired" },
    { id: "01001102", type: "Approved", risk: "Higher", riskColor: "bg-[#fff9db] text-[#f08c00] border-[#ffe3e3]", manager: "David Fhane", badgeColor: "bg-[#fff5f5] text-[#ff6b6b] border-[#ffe3e3]", action: "Quick-acquired" },
    { id: "01001103", type: "Received", risk: "Higher", riskColor: "bg-[#fff5f5] text-[#fa5252] border-[#ffe3e3]", manager: "Ademert Baim", badgeColor: "bg-[#e6fcf5] text-[#0ca678] border-[#c3fae8]", action: "Quick-acquired" }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start w-full">
      
      {/* Left Workspace Panel - Col Span 3 */}
      <div className="xl:col-span-3 space-y-6">
        
        {/* KPI Banner Grid of Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          
          {/* KPI 1 */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-4 sm:p-5 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Total Managers</span>
              <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">24</span>
                <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5 whitespace-nowrap">
                  ↑ <span className="font-semibold text-slate-400">+2%</span>
                </span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-4 sm:p-5 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Total Applications</span>
              <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">1,250</span>
                <span className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5 whitespace-nowrap">
                  ↓ <span className="font-semibold text-slate-400">-5%</span>
                </span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-4 sm:p-5 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Pending Approvals</span>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">35</span>
                <span className="bg-rose-50 text-rose-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-wider shrink-0 whitespace-nowrap">
                  Needs Action
                </span>
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-4 sm:p-5 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">New Customers</span>
              <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">88</span>
                <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5 whitespace-nowrap">
                  ↑ <span className="font-semibold text-slate-400">+10%</span>
                </span>
              </div>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-4 sm:p-5 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 min-w-0">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-tight truncate">Overall Risk Score</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1 block">B+</span>
            </div>
          </div>

        </div>

        {/* Dynamic Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Application trends area line chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">Loan Application Trends (Last 30 Days)</h3>
            <div className="w-full h-64">
              <Chart
                options={lineChartOptions}
                series={lineChartSeries}
                type="area"
                height="100%"
              />
            </div>
          </div>

          {/* System users donut chart */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">System Activity by User Role</h3>
            <div className="w-full h-64 flex items-center justify-center">
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

        {/* Critical Tasks Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/20">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">Critical Tasks &amp; Pending Approvals</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-4 px-6 w-12 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-[#f26e21] focus:ring-[#f26e21]" />
                  </th>
                  <th className="py-4 px-4 font-bold">Application ID</th>
                  <th className="py-4 px-4 font-bold">Type</th>
                  <th className="py-4 px-4 font-bold">Risk Level</th>
                  <th className="py-4 px-4 font-bold">Manager Assigned</th>
                  <th className="py-4 px-4 font-bold">Action Required</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {criticalTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-[#f26e21] focus:ring-[#f26e21]" />
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 font-mono">{task.id}</td>
                    <td className="py-4 px-4 text-slate-500">{task.type}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${task.riskColor}`}>
                        {task.risk}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-semibold">{task.manager}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${task.badgeColor}`}>
                        {task.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 shrink-0">
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

      {/* Right Workspace Tall Panel - Col Span 1 */}
      <div className="xl:col-span-1 bg-white border border-slate-200/80 rounded-xl shadow-sm p-5 space-y-4 flex flex-col self-stretch">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Audit Log
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
          {auditLogs.map((log) => (
            <div key={log.id} className="text-[11px] border-b border-slate-50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span>{log.timestamp}</span>
                <span className="font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  {log.manager}
                </span>
              </div>
              <div className="flex items-start gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded font-extrabold uppercase tracking-wider text-[8px] ${
                  log.action === "Create" || log.action === "Register"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : log.action === "Delete"
                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {log.action}
                </span>
                <p className="text-slate-700 font-semibold leading-normal">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

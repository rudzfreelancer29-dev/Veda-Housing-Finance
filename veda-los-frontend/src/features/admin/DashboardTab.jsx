import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  CheckCheck,
  TrendingUp,
  UserPlus,
  IndianRupee,
  Users,
  AlertCircle,
  Filter,
  ChevronDown,
  RefreshCw,
  Search,
  PieChart as PieIcon,
  ShieldAlert
} from "lucide-react";
import apiService from "../../services/api-service";

export default function DashboardTab({
  applications = [],
  managers = [],
  auditLogs = [],
  customers = []
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [dateFilter, setDateFilter] = useState("month");
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-31");
  const [searchActivity, setSearchActivity] = useState("");
  const [totalRegistrationsData, setTotalRegistrationsData] = useState(null);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [paymentsSummaryData, setPaymentsSummaryData] = useState(null);
  const [paymentsSummaryLoading, setPaymentsSummaryLoading] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = await apiService.GetAdminDashboard();
      const data = response.data?.data || response.data;
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch admin dashboard:", error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsSummary = async () => {
    setPaymentsSummaryLoading(true);
    try {
      const response = await apiService.GetPaymentsSummary();
      const data = response.data?.data || response.data;
      setPaymentsSummaryData(data);
    } catch (error) {
      console.error("Failed to fetch payments summary:", error);
    } finally {
      setPaymentsSummaryLoading(false);
    }
  };

  const fetchTotalRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const response = await apiService.GetTotalRegistrations();
      const data = response.data?.data || response.data;
      setTotalRegistrationsData(data);
    } catch (error) {
      console.error("Failed to fetch total registrations:", error);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const fetchEligibilityStats = async () => {
    setEligibilityLoading(true);
    try {
      const response = await apiService.GetEligibilityStats();
      const data = response.data?.data || response.data;
      setEligibilityData(data);
    } catch (error) {
      console.error("Failed to fetch eligibility stats:", error);
    } finally {
      setEligibilityLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchTotalRegistrations();
    fetchPaymentsSummary();
    fetchEligibilityStats();
  }, []);

  // Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // 1. Application Overview Metrics from API or fallbacks
  const metrics = useMemo(() => {
    if (dashboardData) {
      return {
        total: dashboardData.totalApplications ?? 0,
        active: dashboardData.activeApplications ?? 0,
        pending: dashboardData.pendingApplications ?? 0,
        approved: dashboardData.approvedApplications ?? 0,
        rejected: dashboardData.rejectedApplications ?? 0,
        completed: dashboardData.completedApplications ?? 0
      };
    }

    if (applications.length > 0) {
      const total = applications.length;
      const active = applications.filter(a => a.status === "In Progress" || a.status === "Under Review" || a.status === "Received").length;
      const pending = applications.filter(a => a.status === "Pending" || a.status === "Pending Approval").length;
      const approved = applications.filter(a => a.status === "Approved" || a.status === "Eligible").length;
      const rejected = applications.filter(a => a.status === "Rejected").length;
      const completed = applications.filter(a => a.status === "Disbursed" || a.status === "Completed").length;
      return { total, active, pending, approved, rejected, completed };
    }

    return { total: 6, active: 4, pending: 2, approved: 2, rejected: 1, completed: 1 };
  }, [dashboardData, applications]);

  // 2. Customer Registration Trends (Last 6 Months Data)
  const registrationTrendsOptions = {
    chart: {
      id: "registration-trends",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif"
    },
    colors: ["#f26e21", "#1e70e3"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 95, 100]
      }
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 } }
    },
    yaxis: {
      labels: { style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 } }
    },
    tooltip: { theme: "light" }
  };

  const registrationTrendsSeries = [
    {
      name: "Registrations",
      data: [320, 450, 580, 720, 890, 1140]
    }
  ];

  const totalCustomerRegistrations = customers.length > 0 ? customers.length : (dashboardData?.totalApplications || 6);

  const registrationCount = useMemo(() => {
    if (totalRegistrationsData !== null && totalRegistrationsData !== undefined) {
      if (typeof totalRegistrationsData === "number" || typeof totalRegistrationsData === "string") {
        return totalRegistrationsData;
      }
      const extracted =
        totalRegistrationsData.total_registrations ??
        totalRegistrationsData.totalRegistrations ??
        totalRegistrationsData.total ??
        totalRegistrationsData.count ??
        totalRegistrationsData.registrations;

      if (extracted !== undefined && extracted !== null) {
        return extracted;
      }
      if (Array.isArray(totalRegistrationsData)) {
        return totalRegistrationsData.reduce((acc, item) => acc + (item.total || item.count || item.registrations || 1), 0);
      }
      return customers.length;
    }
    return customers.length > 0 ? customers.length : 6;
  }, [totalRegistrationsData, customers]);

  const registrationMonth = useMemo(() => {
    if (totalRegistrationsData && typeof totalRegistrationsData === "object") {
      if (totalRegistrationsData.month) return totalRegistrationsData.month;
      if (totalRegistrationsData.currentMonth) return totalRegistrationsData.currentMonth;
      if (totalRegistrationsData.month_name) return totalRegistrationsData.month_name;
    }
    const now = new Date();
    return now.toLocaleString("en-IN", { month: "long" });
  }, [totalRegistrationsData]);

  // 3. Payment Collection Summary from API / state
  const paymentSummary = useMemo(() => {
    if (paymentsSummaryData && typeof paymentsSummaryData === "object") {
      const collected =
        paymentsSummaryData.collected ?? 0;

      const pending =
        paymentsSummaryData.pending ?? 0;

      const failed =
        paymentsSummaryData.failed ?? 0;

      const refunded =
        paymentsSummaryData.refunded ?? 0;

      return {
        collected: Number(collected) || 0,
        pending: Number(pending) || 0,
        failed: Number(failed) || 0,
        refunded: Number(refunded) || 0
      };
    }

    return {
      collected: 0,
      pending: 0,
      failed: 0,
      refunded: 0
    };
  }, [paymentsSummaryData]);

  // 4. Loan Eligibility Statistics from API / fallback
  const eligibilityMetrics = useMemo(() => {
    if (eligibilityData && typeof eligibilityData === "object") {
      const eligible = Number(eligibilityData.eligible ?? 0);
      const pending = Number(eligibilityData.pendingAssessment ?? eligibilityData.pending ?? 0);
      const rejected = Number(eligibilityData.rejected ?? 0);
      const total =
        eligibilityData.totalApplications != null
          ? Number(eligibilityData.totalApplications)
          : ((eligible + pending + rejected) || 1);
      const rate = total > 0 ? Math.round((eligible / total) * 100) : 0;

      return {
        eligible,
        pending,
        rejected,
        total: total || 1,
        rate
      };
    }

    const eligible = metrics.approved || 2;
    const pending = metrics.pending || 2;
    const rejected = metrics.rejected || 1;
    const total = (eligible + pending + rejected) || 1;
    const rate = Math.round((eligible / total) * 100);

    return {
      eligible,
      pending,
      rejected,
      total,
      rate
    };
  }, [eligibilityData, metrics]);

  const eligibilityOptions = {
    chart: { fontFamily: "Inter, sans-serif" },
    colors: ["#10b981", "#f59e0b", "#f43f5e"],
    labels: ["Eligible", "Pending", "Rejected"],
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Eligibility Rate",
              color: "#64748b",
              fontSize: "11px",
              fontWeight: 600,
              formatter: () => `${eligibilityMetrics.rate}%`
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontWeight: 600,
      markers: { radius: 12 }
    },
    stroke: { show: false }
  };

  const eligibilitySeries = [
    eligibilityMetrics.eligible,
    eligibilityMetrics.pending,
    eligibilityMetrics.rejected
  ];

  // 5. Manager Performance Data
  const managerPerformanceList = useMemo(() => {
    if (managers.length > 0) {
      return managers.map((m, idx) => ({
        id: m.id || idx,
        name: m.name || "Manager",
        processed: m.applications || Math.floor(Math.random() * 40) + 10,
        completed: Math.floor((m.applications || 20) * 0.7),
        rejected: Math.floor((m.applications || 20) * 0.15),
        registrations: Math.floor(Math.random() * 30) + 5,
        conversionRate: Math.min(88, Math.max(55, Math.floor(Math.random() * 30) + 60))
      }));
    }

    return [
      { id: 1, name: "David Fhone", processed: 36, completed: 26, rejected: 4, registrations: 22, conversionRate: 72 },
      { id: 2, name: "Edwars Rath", processed: 31, completed: 22, rejected: 3, registrations: 18, conversionRate: 71 },
      { id: 3, name: "John Smith", processed: 18, completed: 12, rejected: 2, registrations: 14, conversionRate: 66 },
      { id: 4, name: "Biaton Naera", processed: 13, completed: 9, rejected: 1, registrations: 10, conversionRate: 69 },
      { id: 5, name: "Ademrt Boim", processed: 10, completed: 6, rejected: 3, registrations: 7, conversionRate: 60 }
    ];
  }, [managers]);

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const formatStatusText = (status) => {
    if (!status) return "Under Review";
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // 6. Recent Activities from API recentActivities
  const recentActivitiesList = useMemo(() => {
    if (dashboardData?.recentActivities && Array.isArray(dashboardData.recentActivities) && dashboardData.recentActivities.length > 0) {
      return dashboardData.recentActivities.map((act, index) => ({
        id: act.application_id || index + 1,
        customerName: act.full_name || "Customer",
        refId: act.reference_id || `APP-${act.application_id}`,
        status: formatStatusText(act.status),
        rawStatus: act.status,
        updatedAt: formatDate(act.updated_at)
      }));
    }

    if (auditLogs.length > 0) {
      return auditLogs.slice(0, 10).map((log, index) => ({
        id: log.id || index + 1,
        customerName: log.manager || log.details || "Customer",
        refId: `VEDA-2026-0${100 + index}`,
        status: log.action || "Updated",
        rawStatus: log.action,
        updatedAt: log.timestamp || "Just now"
      }));
    }

    return [];
  }, [dashboardData, auditLogs]);

  const filteredActivities = useMemo(() => {
    if (!searchActivity) return recentActivitiesList;
    const q = searchActivity.toLowerCase();
    return recentActivitiesList.filter(
      act =>
        act.customerName.toLowerCase().includes(q) ||
        act.refId.toLowerCase().includes(q) ||
        act.status.toLowerCase().includes(q)
    );
  }, [recentActivitiesList, searchActivity]);

  // Helper badge color for activity status
  const getStatusBadgeClass = (status) => {
    const s = (status || "").toLowerCase().replace(/_/g, " ");
    if (s.includes("approved") || s.includes("completed") || s.includes("eligible")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("rejected") || s.includes("failed")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s.includes("under review") || s.includes("in progress") || s.includes("loan processing")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  if (hasError) {
    return (
      <div className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-rose-900">Failed to load Dashboard data</h3>
        <p className="text-sm text-rose-700">Something went wrong while fetching analytics metrics.</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Date Filter & Control Bar */}
      <div className="bg-white border border-slate-200/80 p-3.5 sm:p-4 rounded-2xl shadow-xs w-full overflow-hidden">
        {/* Mobile Filter View (< sm) */}
        <div className="sm:hidden space-y-3 w-full">
          {/* Top Header: Title & Active Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f26e21] animate-pulse shrink-0"></span>
              <h2 className="text-xs font-extrabold text-slate-800 tracking-tight">Timeline Metrics</h2>
            </div>
            <span className="text-[10px] font-extrabold text-[#f26e21] bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100 uppercase tracking-wider">
              {dateFilter === "all" ? "All Time" : dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : dateFilter === "month" ? "This Month" : dateFilter === "year" ? "This Year" : "Custom"}
            </span>
          </div>

          {/* Preset Select Dropdown */}
          <div className="relative w-full">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-100 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Custom Date Inputs (Clean 2-Column Grid) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl w-full">
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setDateFilter("custom");
                }}
                className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#f26e21] focus:ring-1 focus:ring-[#f26e21]/20 min-w-0"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setDateFilter("custom");
                }}
                className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none focus:border-[#f26e21] focus:ring-1 focus:ring-[#f26e21]/20 min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Filter View (>= sm) */}
        <div className="hidden sm:flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
          {/* Indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f26e21] animate-pulse shrink-0"></span>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">Analytics Overview:</h2>
            <span className="text-[10px] font-bold text-[#f26e21] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-wider">
              {dateFilter === "all" ? "All Time" : dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : dateFilter === "month" ? "This Month" : dateFilter === "year" ? "This Year" : "Custom Range"}
            </span>
          </div>

          {/* Presets & Pickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
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
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                    dateFilter === preset.id
                      ? "bg-[#f26e21] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl text-xs shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setDateFilter("custom");
                }}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 font-bold px-0.5">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setDateFilter("custom");
                }}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Total Registration Summary Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-orange-50 text-[#f26e21] rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Total Registration</h3>
              <span className="text-[10px] font-bold text-[#f26e21] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100 uppercase tracking-wider">
                {registrationMonth}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Monthly customer registrations overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:border-l sm:border-slate-100 sm:pl-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Registrations</span>
            <span className="text-2xl font-extrabold text-slate-800 leading-tight block">
              {registrationsLoading ? "..." : Number(registrationCount || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Application Overview (6 KPI Grid) */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">Application Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 w-full">
          {/* Total */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">Total</span>
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 block leading-tight">
                {loading ? "..." : metrics.total.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-blue-600 block mt-0.5 truncate">All Submissions</span>
            </div>
          </div>

          {/* Active */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">Active</span>
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 block leading-tight">
                {loading ? "..." : metrics.active.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-indigo-600 block mt-0.5 truncate">In Processing</span>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">Pending</span>
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 block leading-tight">
                {loading ? "..." : metrics.pending.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-amber-600 block mt-0.5 truncate">Needs Review</span>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">Approved</span>
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 block leading-tight">
                {loading ? "..." : metrics.approved.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-0.5 truncate">Ready for Sanction</span>
            </div>
          </div>

          {/* Rejected */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">Rejected</span>
              <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 block leading-tight">
                {loading ? "..." : metrics.rejected.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-rose-600 block mt-0.5 truncate">Not Qualified</span>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition-all duration-200 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate">Completed</span>
              <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 block leading-tight">
                {loading ? "..." : metrics.completed.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-teal-600 block mt-0.5 truncate">Disbursed / Closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3 & SECTION 5: Customer Trends + Eligibility Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Customer Registration Trends (Last 6 Months) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Customer Registration Trends</h3>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +28% YoY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Monthly customer onboarding for the last 6 months</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
              <UserPlus className="w-4 h-4 text-[#f26e21]" />
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">Total Customers</span>
                <span className="text-xs font-extrabold text-slate-800 leading-tight">{totalCustomerRegistrations.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-60 sm:h-64">
            <Chart
              options={registrationTrendsOptions}
              series={registrationTrendsSeries}
              type="area"
              height="100%"
            />
          </div>
        </div>

        {/* SECTION 5: Loan Eligibility Statistics */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Loan Eligibility Statistics</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Application assessment & eligibility breakdown</p>
          </div>

          <div className="w-full h-52 sm:h-56 flex items-center justify-center">
            <Chart
              options={eligibilityOptions}
              series={eligibilitySeries}
              type="donut"
              width="100%"
              height="100%"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Eligible</span>
              <span className="text-xs font-extrabold text-emerald-600">
                {eligibilityLoading ? "..." : eligibilityMetrics.eligible}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending</span>
              <span className="text-xs font-extrabold text-amber-600">
                {eligibilityLoading ? "..." : eligibilityMetrics.pending}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Rejected</span>
              <span className="text-xs font-extrabold text-rose-600">
                {eligibilityLoading ? "..." : eligibilityMetrics.rejected}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Payment Collection Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">Payment Collection Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full">
          {/* Collected */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Collected</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1 block">
                {paymentsSummaryLoading ? "..." : formatCurrency(paymentSummary.collected)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 inline-block mt-1">
                Successfully Received
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Pending</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1 block">
                {paymentsSummaryLoading ? "..." : formatCurrency(paymentSummary.pending)}
              </span>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 inline-block mt-1">
                Awaiting Processing
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Failed</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1 block">
                {paymentsSummaryLoading ? "..." : formatCurrency(paymentSummary.failed)}
              </span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 inline-block mt-1">
                Transaction Declined
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-extrabold shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Refunded */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Refunded</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1 block">
                {paymentsSummaryLoading ? "..." : formatCurrency(paymentSummary.refunded)}
              </span>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 inline-block mt-1">
                Reversed to Customer
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Manager Performance */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden w-full">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Manager Performance</h3>
            <p className="text-[11px] text-slate-400 font-medium">Tracking applications, completed loans &amp; conversion rates per manager</p>
          </div>
          <span className="text-xs bg-orange-50 text-[#f26e21] border border-orange-100 px-3 py-1 rounded-full font-extrabold self-start sm:self-auto">
            {managerPerformanceList.length} Managers Listed
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">
                <th className="py-3 px-4 sm:px-6">Manager Name</th>
                <th className="py-3 px-4 text-center">Applications Processed</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-center">Rejected</th>
                <th className="py-3 px-4 text-center">Registrations Completed</th>
                <th className="py-3 px-4 sm:px-6 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium whitespace-nowrap">
              {managerPerformanceList.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0a182e] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {m.name.charAt(0)}
                      </div>
                      <span>{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">{m.processed}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/60 text-xs">
                      {m.completed}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-rose-50 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200/60 text-xs">
                      {m.rejected}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">{m.registrations}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div
                          className="bg-[#f26e21] h-2 rounded-full"
                          style={{ width: `${m.conversionRate}%` }}
                        ></div>
                      </div>
                      <span className="font-extrabold text-xs text-[#f26e21]">{m.conversionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Recent Activities (Latest 10) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden w-full">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Recent Activities</h3>
            <p className="text-[11px] text-slate-400 font-medium">Latest 10 customer &amp; loan application actions</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchActivity}
              onChange={(e) => setSearchActivity(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#f26e21]"
            />
          </div>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No recent activities matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">
                  <th className="py-3 px-4 sm:px-6">Customer Name</th>
                  <th className="py-3 px-4">Reference / Application ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Updated Date / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium whitespace-nowrap">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">
                      {act.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#f26e21]">
                      {act.refId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${getStatusBadgeClass(act.status)}`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right text-slate-500 text-xs font-semibold">
                      {act.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

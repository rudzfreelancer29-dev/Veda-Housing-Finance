import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  Users,
  IndianRupee,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";

export default function ReportsAnalyticsTab({
  customers: initialCustomers = [],
  applications: initialApplications = []
}) {
  // API Raw Data States (same as DashboardTab)
  const [customersData, setCustomersData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [totalRegistrationsData, setTotalRegistrationsData] = useState(null);
  const [paymentsSummaryData, setPaymentsSummaryData] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedManager, setSelectedManager] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Currency Formatter
  const formatINR = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Format Date to: D/M/YYYY, h:mm:ss am/pm (e.g. 8/9/2026, 10:21:40 pm)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString("en-IN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch {
      return String(dateStr);
    }
  };

  // Status mapping & badges
  const getStatusBadge = (statusStr) => {
    const s = (statusStr || "").toLowerCase().replace(/ /g, "_");
    switch (s) {
      case "new_registration":
      case "new":
        return {
          label: "new_registration",
          cls: "bg-sky-50 text-sky-700 border-sky-200"
        };
      case "under_review":
        return {
          label: "under_review",
          cls: "bg-amber-50 text-amber-700 border-amber-200"
        };
      case "eligible":
        return {
          label: "eligible",
          cls: "bg-teal-50 text-teal-700 border-teal-200"
        };
      case "completed":
        return {
          label: "completed",
          cls: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
      case "rejected":
        return {
          label: "rejected",
          cls: "bg-rose-50 text-rose-700 border-rose-200"
        };
      case "documents_pending":
      case "document_upload":
        return {
          label: "documents_pending",
          cls: "bg-purple-50 text-purple-700 border-purple-200"
        };
      case "payment_pending":
      case "payment_requested":
        return {
          label: "payment_pending",
          cls: "bg-orange-50 text-orange-700 border-orange-200"
        };
      default:
        return {
          label: s || "unknown",
          cls: "bg-slate-100 text-slate-700 border-slate-200"
        };
    }
  };

  // Fetch all reporting APIs simultaneously
  const fetchAllReportData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Customers and Dashboard Analytics concurrently
      const [custRes, dashRes, regRes, payRes, eligRes] = await Promise.allSettled([
        apiService.GetAllCustomers(),
        apiService.GetAdminDashboard(),
        apiService.GetTotalRegistrations(),
        apiService.GetPaymentsSummary(),
        apiService.GetEligibilityStats()
      ]);

      // Handle Dashboard Data
      if (dashRes.status === "fulfilled") {
        setDashboardData(dashRes.value.data?.data || dashRes.value.data);
      }

      // Handle Total Registrations Data
      if (regRes.status === "fulfilled") {
        setTotalRegistrationsData(regRes.value.data?.data || regRes.value.data);
      }

      // Handle Payments Summary Data
      let paymentsSummaryObj = null;
      if (payRes.status === "fulfilled") {
        paymentsSummaryObj = payRes.value.data?.data || payRes.value.data;
        setPaymentsSummaryData(paymentsSummaryObj);
      }

      // Handle Eligibility Data
      if (eligRes.status === "fulfilled") {
        setEligibilityData(eligRes.value.data?.data || eligRes.value.data);
      }

      // Handle Customer Records
      let rawCustomersList = [];
      if (custRes.status === "fulfilled") {
        const raw = custRes.value.data;
        rawCustomersList = Array.isArray(raw)
          ? raw
          : (raw?.data || raw?.customers || []);
      } else if (initialCustomers.length > 0) {
        rawCustomersList = initialCustomers;
      }

      // Map Customer Rows and Fetch Individual Payment History where available
      if (Array.isArray(rawCustomersList) && rawCustomersList.length > 0) {
        const mappedRows = await Promise.all(
          rawCustomersList.map(async (item, index) => {
            const rawId = item.id || item.rawId || index + 1;
            const refId =
              item.reference_id ||
              item.referenceId ||
              (typeof item.id === "string" && item.id.startsWith("VF-")
                ? item.id
                : `VF-2026-${String(rawId).padStart(5, "0")}`);

            const custName = item.full_name || item.name || item.fullName || `Customer ${index + 1}`;
            const mobile = item.mobile_number || item.mobile || item.mobileNumber || "-";
            const email = item.email || "-";
            const manager = item.registered_by_name || item.manager_name || item.manager || item.registeredByName || "Riya";
            const status = (item.application_status || item.status || "new_registration").toLowerCase().replace(/ /g, "_");
            const registeredOn = item.created_at || item.registered_on || item.createdAt || new Date().toISOString();
            const lastUpdated = item.updated_at || item.last_updated || item.updatedAt || item.created_at || registeredOn;

            // Direct amount on customer object if present
            let amount = Number(
              item.amount_collected ||
              item.paid_amount ||
              item.payment_amount ||
              item.total_paid ||
              0
            );

            // Fetch payment history for this customer to ensure precise collected amount
            try {
              const targetId = item.id || item.rawId;
              if (targetId) {
                const payHistoryRes = await apiService.GetPaymentHistory(targetId);
                const payHistoryData =
                  payHistoryRes.data?.data ||
                  payHistoryRes.data?.payments ||
                  payHistoryRes.data?.payment ||
                  payHistoryRes.data;

                const payList = Array.isArray(payHistoryData)
                  ? payHistoryData
                  : payHistoryData && typeof payHistoryData === "object" && (payHistoryData.id || payHistoryData.amount)
                  ? [payHistoryData]
                  : [];

                if (payList.length > 0) {
                  const sumPaid = payList.reduce((sum, p) => {
                    const pStatus = (p.status || p.payment_status || "").toLowerCase().trim();
                    const isPaidSuccess =
                      (pStatus === "success" ||
                        pStatus === "successful" ||
                        pStatus === "completed" ||
                        pStatus === "paid" ||
                        pStatus === "payment_completed" ||
                        p.payment_status === "SUCCESS" ||
                        p.payment_status === "PAID" ||
                        p.payment_status === "COMPLETED") &&
                      pStatus !== "pending" &&
                      pStatus !== "payment_pending" &&
                      pStatus !== "payment requested" &&
                      pStatus !== "failed" &&
                      pStatus !== "refunded";

                    const pAmt = Number(p.amount || p.payment_amount || 0);
                    return sum + (isPaidSuccess ? pAmt : 0);
                  }, 0);

                  amount = sumPaid;
                }
              }
            } catch {
              // Ignore single customer payment fetch errors
            }

            return {
              id: rawId,
              referenceId: refId,
              customerName: custName,
              mobile: mobile,
              email: email,
              manager: manager,
              status: status,
              registeredOn: registeredOn,
              lastUpdated: lastUpdated,
              amountCollected: amount
            };
          })
        );

        setCustomersData(mappedRows);
      } else {
        setCustomersData([]);
      }
    } catch (error) {
      console.error("Failed to load reporting analytics data:", error);
      toast.error("Failed to fetch reports from API.");
    } finally {
      setLoading(false);
    }
  }, [initialCustomers]);

  useEffect(() => {
    fetchAllReportData();
  }, [fetchAllReportData]);

  // Total Registrations metric calculation (matches DashboardTab)
  const totalRegistrationsCount = useMemo(() => {
    if (totalRegistrationsData !== null && totalRegistrationsData !== undefined) {
      if (typeof totalRegistrationsData === "number" || typeof totalRegistrationsData === "string") {
        return Number(totalRegistrationsData);
      }
      const extracted =
        totalRegistrationsData.total_registrations ??
        totalRegistrationsData.totalRegistrations ??
        totalRegistrationsData.total ??
        totalRegistrationsData.count ??
        totalRegistrationsData.registrations;

      if (extracted !== undefined && extracted !== null) {
        return Number(extracted);
      }
      if (Array.isArray(totalRegistrationsData)) {
        return totalRegistrationsData.reduce(
          (acc, item) => acc + (item.total || item.count || item.registrations || 1),
          0
        );
      }
    }
    return customersData.length > 0 ? customersData.length : (dashboardData?.totalApplications || 0);
  }, [totalRegistrationsData, customersData, dashboardData]);

  // Payment Summary metrics (matches DashboardTab)
  const paymentSummary = useMemo(() => {
    const tableTotalCollected = customersData.reduce((acc, c) => acc + (c.amountCollected || 0), 0);

    if (paymentsSummaryData && typeof paymentsSummaryData === "object") {
      const collected =
        paymentsSummaryData.collected ??
        paymentsSummaryData.total_collected ??
        paymentsSummaryData.totalCollected ??
        paymentsSummaryData.amount;

      const pending =
        paymentsSummaryData.pending ??
        paymentsSummaryData.total_pending ??
        paymentsSummaryData.totalPending ??
        0;

      const failed = paymentsSummaryData.failed ?? 0;
      const refunded = paymentsSummaryData.refunded ?? 0;

      const finalCollected = collected !== undefined && collected !== null ? Number(collected) : tableTotalCollected;

      return {
        collected: finalCollected,
        pending: Number(pending) || 0,
        failed: Number(failed) || 0,
        refunded: Number(refunded) || 0
      };
    }

    return {
      collected: tableTotalCollected,
      pending: 0,
      failed: 0,
      refunded: 0
    };
  }, [paymentsSummaryData, customersData]);

  // Eligibility & Application breakdown
  const statusStats = useMemo(() => {
    let eligible = 0;
    let completed = 0;
    let underReview = 0;
    let rejected = 0;
    let newReg = 0;

    customersData.forEach((c) => {
      const s = (c.status || "").toLowerCase();
      if (s === "eligible") eligible++;
      else if (s === "completed" || s === "approved" || s === "disbursed") completed++;
      else if (s === "under_review" || s === "in_progress" || s === "documents_pending") underReview++;
      else if (s === "rejected") rejected++;
      else if (s === "new_registration" || s === "new") newReg++;
    });

    if (eligibilityData && typeof eligibilityData === "object") {
      if (eligibilityData.eligible !== undefined) eligible = Number(eligibilityData.eligible);
      if (eligibilityData.rejected !== undefined) rejected = Number(eligibilityData.rejected);
    }

    if (dashboardData && typeof dashboardData === "object") {
      if (dashboardData.completedApplications !== undefined) completed = Number(dashboardData.completedApplications);
      if (dashboardData.activeApplications !== undefined) underReview = Number(dashboardData.activeApplications);
      if (dashboardData.rejectedApplications !== undefined) rejected = Number(dashboardData.rejectedApplications);
    }

    return { eligible, completed, underReview, rejected, newReg };
  }, [customersData, eligibilityData, dashboardData]);

  // Distinct managers list
  const managersList = useMemo(() => {
    const set = new Set();
    customersData.forEach((item) => {
      if (item.manager && item.manager !== "Unassigned") {
        set.add(item.manager);
      }
    });
    return Array.from(set);
  }, [customersData]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return customersData.filter((item) => {
      // 1. Search Query
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.referenceId.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.mobile.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.manager.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      // 2. Status Filter
      const matchStatus =
        selectedStatus === "all" ||
        item.status === selectedStatus.toLowerCase();

      // 3. Manager Filter
      const matchManager =
        selectedManager === "all" ||
        item.manager.toLowerCase() === selectedManager.toLowerCase();

      // 4. Date Filter
      let matchDate = true;
      if (dateFilter !== "all" && item.registeredOn) {
        const itemDate = new Date(item.registeredOn);
        const now = new Date();

        if (dateFilter === "today") {
          matchDate = itemDate.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchDate = itemDate >= sevenDaysAgo;
        } else if (dateFilter === "month") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchDate = itemDate >= thirtyDaysAgo;
        } else if (dateFilter === "quarter") {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(now.getDate() - 90);
          matchDate = itemDate >= ninetyDaysAgo;
        } else if (dateFilter === "year") {
          matchDate = itemDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            matchDate = matchDate && itemDate >= start;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            matchDate = matchDate && itemDate <= end;
          }
        }
      }

      return matchSearch && matchStatus && matchManager && matchDate;
    });
  }, [customersData, searchQuery, selectedStatus, selectedManager, dateFilter, customStartDate, customEndDate]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPageCollected = useMemo(() => {
    return paginatedData.reduce((acc, curr) => acc + (curr.amountCollected || 0), 0);
  }, [paginatedData]);

  // Export to Excel (streams .xlsx directly from backend API)
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {};

      if (dateFilter === "month") {
        params.period = "monthly";
      } else if (dateFilter === "quarter") {
        params.period = "quarterly";
      } else if (dateFilter === "year") {
        params.period = "yearly";
      } else if (dateFilter === "today") {
        const todayStr = new Date().toISOString().slice(0, 10);
        params.from = todayStr;
        params.to = todayStr;
      } else if (dateFilter === "week") {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        params.from = weekAgo.toISOString().slice(0, 10);
        params.to = now.toISOString().slice(0, 10);
      } else if (dateFilter === "custom") {
        if (customStartDate) params.from = customStartDate;
        if (customEndDate) params.to = customEndDate;
      }

      const res = await apiService.DownloadAdminReports(params);

      // Determine filename from Content-Disposition header if present
      let filename = `Veda_Reports_${dateFilter !== "all" ? dateFilter : "all"}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const disposition = res.headers?.["content-disposition"] || res.headers?.["Content-Disposition"];
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "").trim();
        }
      }

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Excel report downloaded successfully!");
    } catch (err) {
      console.error("Failed to download Excel report:", err);
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          toast.error(json.message || "Failed to download Excel report.");
          return;
        } catch {
          // ignore
        }
      }
      toast.error(err.response?.data?.message || "Failed to download Excel report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Top Executive KPI Cards (Bound to APIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registrations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Registrations
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f26e21] flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
              {loading ? "..." : Number(totalRegistrationsCount).toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
              ● Active registered customer accounts
            </span>
          </div>
        </div>

        {/* Amount Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Amount Collected
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
              {loading ? "..." : formatINR(paymentSummary.collected)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
              ₹{Number(paymentSummary.pending || 0).toLocaleString()} Pending requests
            </span>
          </div>
        </div>

        {/* Eligible / Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Eligible / Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                {loading ? "..." : statusStats.eligible + statusStats.completed}
              </span>
              <span className="text-xs font-bold text-teal-700">
                ({statusStats.eligible} Eligible, {statusStats.completed} Completed)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block mt-1">
              Passed verification stages
            </span>
          </div>
        </div>

        {/* Under Review / Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Under Review / Pending
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                {loading ? "..." : statusStats.underReview + statusStats.rejected}
              </span>
              <span className="text-xs font-bold text-rose-600">
                ({statusStats.rejected} Rejected)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block mt-1">
              Active loan evaluation queue
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Main Report Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header & Export Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#f26e21]" />
              Customer Registrations &amp; Loan Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive report of customer registrations, assigned managers, verification status, and collections.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchAllReportData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
              title="Refresh Report Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#f26e21]" : ""}`} />
              Refresh
            </button>

            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0a182e] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60"
              title="Export Report to CSV / Excel"
            >
              {exporting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#B38728]" />
                  <span>Export CSV / Excel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Timeline Presets & Filter Row (matches DashboardTab) */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Timeline Presets Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#f26e21]" />
                Timeline:
              </span>
              <div className="flex items-center bg-slate-200/60 p-1 rounded-xl gap-0.5">
                {[
                  { id: "all", label: "All Time" },
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "month", label: "This Month" },
                  { id: "quarter", label: "Quarterly" },
                  { id: "year", label: "This Year" },
                  { id: "custom", label: "Custom" }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setDateFilter(preset.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                      dateFilter === preset.id
                        ? "bg-[#f26e21] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Pickers (if custom selected) */}
            {dateFilter === "custom" && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-bold px-0.5">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                />
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => {
                      setCustomStartDate("");
                      setCustomEndDate("");
                    }}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                    title="Clear dates"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Search & Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-slate-200/50">
            {/* Search Input */}
            <div className="lg:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Reference ID, Customer Name, Mobile, Email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] transition-all"
              />
            </div>

            {/* Status Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new_registration">New Registration</option>
                <option value="under_review">Under Review</option>
                <option value="eligible">Eligible</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="documents_pending">Documents Pending</option>
                <option value="payment_pending">Payment Pending</option>
              </select>
            </div>

            {/* Manager Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedManager}
                onChange={(e) => {
                  setSelectedManager(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] cursor-pointer"
              >
                <option value="all">All Managers</option>
                {managersList.map((mgr) => (
                  <option key={mgr} value={mgr}>
                    {mgr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a182e] text-white border-b border-slate-800">
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Reference ID
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Customer Name
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Mobile
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Email
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Manager
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Status
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Registered On
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  Last Updated
                </th>
                <th className="py-3.5 px-4 text-xs font-bold tracking-wider uppercase whitespace-nowrap text-right">
                  Amount Collected (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f26e21] mb-2" />
                    <span>Loading customer report records and payment summaries...</span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No matching records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr
                      key={item.id || index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Reference ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-1 bg-slate-100 rounded-md border border-slate-200/80 text-[11px] text-slate-800">
                          {item.referenceId}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.customerName}
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {item.mobile}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {item.email}
                      </td>

                      {/* Manager */}
                      <td className="py-3.5 px-4 text-slate-800 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#f26e21]"></span>
                          {item.manager}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Registered On */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTime(item.registeredOn)}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTime(item.lastUpdated)}
                      </td>

                      {/* Amount Collected */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                        <span
                          className={
                            item.amountCollected > 0
                              ? "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200"
                              : "text-slate-500 font-mono"
                          }
                        >
                          {item.amountCollected > 0
                            ? item.amountCollected.toLocaleString("en-IN")
                            : "0"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Summary & Pagination */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-slate-800">
                {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </strong>{" "}
              of <strong className="text-slate-800">{filteredData.length}</strong> records
            </span>

            <span className="hidden sm:inline text-slate-300">|</span>

            <span className="hidden sm:inline">
              Page Total Collected:{" "}
              <strong className="text-emerald-600 font-bold">
                {formatINR(totalPageCollected)}
              </strong>
            </span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>

            <span className="px-2 font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

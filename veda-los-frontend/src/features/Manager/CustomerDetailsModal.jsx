import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Briefcase,
  FileText,
  Pencil,
  Eye,
  CreditCard,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  loading = false,
  onOpenEdit,
  onSeeDocs,
  onManageDocs,
  onPaymentSuccess
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "payments"
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [feeType, setFeeType] = useState("processing_fee");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Helper to extract clean customer ID
  const getCleanCustomerId = useCallback(() => {
    if (!customer) return "";
    return customer.rawId || customer.id || customer.reference_id || customer.referenceId || "";
  }, [customer]);

  // Fetch payment history for this customer: GET /api/payments/:customerId
  const fetchPaymentHistory = useCallback(async () => {
    const custId = getCleanCustomerId();
    if (!custId) return;

    setPaymentsLoading(true);
    try {
      const targetId = typeof custId === "string" ? custId.replace(/^CUST-/, "") : custId;
      const response = await apiService.GetPaymentHistory(targetId);
      const resData =
        response.data?.data ||
        response.data?.payments ||
        response.data?.payment ||
        response.data;

      const list = Array.isArray(resData)
        ? resData
        : resData && typeof resData === "object" && (resData.id || resData.amount || resData.gateway_order_id)
        ? [resData]
        : [];

      setPayments(list);
    } catch (error) {
      console.error("Failed to load customer payment history:", error);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, [getCleanCustomerId]);

  // Load payments whenever modal opens or customer changes
  useEffect(() => {
    if (isOpen && customer) {
      fetchPaymentHistory();
      // Pre-fill amount suggestion based on loan requirement if available (1% processing fee)
      const loan = Number(customer.loanReq) || (Number(customer.monthly_income) * 10) || 0;
      if (loan > 0 && !paymentAmount) {
        setPaymentAmount(String(Math.round(loan * 0.01)));
      }
    } else {
      setPayments([]);
      setPaymentAmount("");
      setFeeType("processing_fee");
    }
  }, [isOpen, customer]);

  if (!isOpen) return null;

  // Handler to submit payment request: POST /api/payments
  const handleSendPaymentRequest = async (e) => {
    e.preventDefault();
    const custId = getCleanCustomerId();
    if (!custId) {
      toast.error("Customer ID is missing.");
      return;
    }

    const numAmount = Number(paymentAmount);
    if (!numAmount || numAmount <= 0) {
      toast.warn("Please enter a valid payment amount (greater than 0).");
      return;
    }

    setSubmittingPayment(true);
    try {
      const targetId = typeof custId === "string" ? custId.replace(/^CUST-/, "") : custId;
      const payload = {
        customerId: String(targetId),
        amount: numAmount,
        feeType: feeType || "processing_fee"
      };

      await apiService.ManagersPaymentRequest(payload);

      // Requirement: Action shows loading indicator and displays success message
      toast.success("Payment request and email/SMS sent to customer");

      setPaymentAmount("");
      setFeeType("processing_fee");

      // Refresh customer payment history immediately
      await fetchPaymentHistory();

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error("Error creating payment request:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send payment request. Please try again.";
      toast.error(msg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch {
      return dateStr;
    }
  };

  const formatStatusBadge = (status) => {
    const s = (status || "").toLowerCase().replace(/_/g, " ");
    if (s.includes("approved")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("rejected")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s.includes("under review")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s.includes("document upload")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (s.includes("payment requested") || s.includes("payment_pending")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formatStatusText = (status) => {
    if (!status) return "New Registration";
    return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPaymentStatusBadge = (status) => {
    const s = (status || "").toLowerCase().replace(/ /g, "_");
    if (s === "successful" || s === "success" || s === "completed" || s === "paid" || s === "payment_completed") {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: "Successful"
      };
    }
    if (s === "pending" || s === "payment_pending" || s === "payment requested") {
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock className="w-3.5 h-3.5" />,
        text: "Pending"
      };
    }
    if (s === "refunded") {
      return {
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        text: "Refunded"
      };
    }
    return {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      text: status ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Failed"
    };
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {customer?.full_name || customer?.name || customer?.fullName ? (customer.full_name || customer.name || customer.fullName).charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">
                  {customer?.full_name || customer?.name || customer?.fullName || "Customer Profile"}
                </h3>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {customer?.reference_id || customer?.referenceId || customer?.id || "-"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Registered on {formatDate(customer?.created_at || customer?.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 text-xs font-bold border-b-2 -mb-px flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="w-4 h-4" /> Customer Profile
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-3 text-xs font-bold border-b-2 -mb-px flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === "payments"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payments & History
            {payments.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {payments.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <p>Loading full customer details...</p>
            </div>
          ) : activeTab === "overview" && customer ? (
            <>
              {/* Top Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Monthly Income
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {customer.monthly_income && Number(customer.monthly_income) > 0
                      ? `₹${Number(customer.monthly_income).toLocaleString("en-IN")}`
                      : customer.income && Number(customer.income) > 0
                      ? `₹${Number(customer.income).toLocaleString("en-IN")}`
                      : "₹0.00"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Loan Requirement
                  </span>
                  <span
                    className="text-sm font-bold text-slate-800 mt-0.5 block truncate"
                    title={customer.loan_requirement_details || customer.loanReq || "Not Specified"}
                  >
                    {customer.loan_requirement_details ||
                      customer.loanReq ||
                      (customer.monthly_income && Number(customer.monthly_income) > 0
                        ? `₹${(Number(customer.monthly_income) * 10).toLocaleString("en-IN")}`
                        : "Not Specified")}
                  </span>
                </div>

                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider block">
                    Current Stage
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {formatStatusText(customer.application_status || customer.stage || "New Registered")}
                  </span>
                </div>
              </div>

              {/* Personal & Contact Information */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Personal & Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-slate-800">{customer.full_name || customer.name || customer.fullName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Number</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {customer.mobile_number || customer.mobile || customer.mobileNumber || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {customer.email || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {formatDate(customer.date_of_birth || customer.dob)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Identity, KYC & Employment */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> KYC & Employment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">PAN Number</span>
                    <span className="font-mono font-bold text-slate-800">
                      {customer.pan_number || customer.pan || "Not Provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Aadhaar Number</span>
                    <span className="font-mono font-bold text-slate-800">
                      {customer.aadhaar_number || customer.aadhaar || "Not Provided"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Employment Details</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />{" "}
                      {customer.employment_details || customer.employment || "Not Provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Payment Banner */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" /> Loan Fee Payment Request
                  </h5>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Send a payment link via SMS/Email to collect fees via Razorpay.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("payments")}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Manage Payments
                </button>
              </div>
            </>
          ) : activeTab === "payments" && customer ? (
            <div className="space-y-6">
              {/* Payment Request Form for Manager */}
              <div className="bg-slate-50/90 p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-600" /> Send Payment Request
                  </h4>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1 shadow-2xs">
                    <Mail className="w-3 h-3 text-emerald-600" /> SMS & Email Notification
                  </span>
                </div>

                <form onSubmit={handleSendPaymentRequest} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Fee Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={feeType}
                        onChange={(e) => setFeeType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer shadow-2xs"
                      >
                        <option value="processing_fee">Processing Fee</option>
                        <option value="documentation_fee">Documentation Fee</option>
                        <option value="valuation_fee">Property Valuation Fee</option>
                        <option value="legal_fee">Legal Verification Fee</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                        Amount (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        placeholder="e.g. 2500"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span>Sending to:</span>
                      <span className="font-semibold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 text-xs shadow-2xs font-mono">
                        {customer.mobile_number || customer.mobile || customer.mobileNumber || "Registered Mobile"}
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {submittingPayment ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Payment Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Customer Payment History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Payment History ({payments.length})
                  </h4>
                  <button
                    onClick={fetchPaymentHistory}
                    disabled={paymentsLoading}
                    title="Refresh payment records"
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${paymentsLoading ? "animate-spin text-blue-600" : ""}`} />
                  </button>
                </div>

                {paymentsLoading ? (
                  <div className="py-10 text-center text-slate-500 font-semibold text-xs space-y-2">
                    <div className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                    <p>Loading customer payment history...</p>
                  </div>
                ) : payments.length > 0 ? (
                  <div className="space-y-2.5">
                    {payments.map((p, idx) => {
                      const badge = getPaymentStatusBadge(p.status);
                      return (
                        <div
                          key={p.id || idx}
                          className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                {(p.fee_type || p.feeType || "Processing Fee").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Ref ID: {p.gateway_order_id || p.gatewayOrderId || p.order_id || p.orderId || `#${p.id}`}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-emerald-700 block">
                                ₹{Number(p.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${badge.bg}`}
                              >
                                {badge.icon}
                                {badge.text}
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Record #{p.id}</span>
                            <span>{formatDateTime(p.created_at || p.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-medium text-slate-500">No payment records found for this customer.</p>
                    <p className="text-[11px]">Use the form above to send an email/SMS payment request to the customer.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            {onOpenEdit && customer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(customer);
                }}
                className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                Edit Details
              </button>
            )}
            {(onSeeDocs || onManageDocs) && customer && (
              <button
                onClick={() => {
                  onClose();
                  if (onSeeDocs) onSeeDocs(customer);
                  else if (onManageDocs) onManageDocs(customer);
                }}
                className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                See Documents
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

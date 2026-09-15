import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, CreditCard, Calendar, CheckCircle2, Clock, AlertCircle, Edit } from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" }
];

export default function PaymentHistoryModal({
  isOpen,
  onClose,
  customer,
  payments = [],
  loading = false,
  onPaymentUpdated
}) {
  const [paymentList, setPaymentList] = useState(payments || []);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    paymentRecord: null,
    status: "pending",
    loading: false
  });

  useEffect(() => {
    setPaymentList(payments || []);
  }, [payments]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
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

  const formatFeeType = (type) => {
    if (!type) return "Fee";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleOpenStatusModal = (payment) => {
    let currStatus = (payment.status || "pending").toLowerCase().replace(/ /g, "_");
    if (currStatus === "payment_pending") currStatus = "pending";
    if (currStatus === "payment_completed" || currStatus === "success" || currStatus === "completed" || currStatus === "paid") {
      currStatus = "successful";
    }
    if (!["pending", "successful", "failed", "refunded"].includes(currStatus)) {
      currStatus = "pending";
    }

    setStatusModal({
      isOpen: true,
      paymentRecord: payment,
      status: currStatus,
      loading: false
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModal.paymentRecord) return;
    setStatusModal((prev) => ({ ...prev, loading: true }));

    const recordId = statusModal.paymentRecord.id;

    if (!recordId) {
      toast.error("Payment Record ID not found.");
      setStatusModal((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      await apiService.UpdatePaymentStatus(recordId, { status: statusModal.status });
      toast.success("Payment status updated successfully!");

      setPaymentList((prevList) =>
        prevList.map((item) =>
          item.id === statusModal.paymentRecord.id
            ? { ...item, status: statusModal.status }
            : item
        )
      );

      if (onPaymentUpdated) {
        onPaymentUpdated();
      }

      setStatusModal({ isOpen: false, paymentRecord: null, status: "pending", loading: false });
    } catch (error) {
      console.error("Failed to update payment status:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update payment status. Please try again.";
      toast.error(msg);
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Payment History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {customer?.fullName || customer?.name || customer?.full_name} ({customer?.referenceId || customer?.reference_id || customer?.id || "-"})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Customer Summary Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Customer Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Name:</span>
                <span className="font-semibold text-slate-800">{customer?.fullName || customer?.name || customer?.full_name || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone:</span>
                <span className="font-semibold text-slate-800">{customer?.mobile || customer?.mobileNumber || customer?.mobile_number || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <span className="font-semibold text-slate-800">{customer?.email || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Customer ID:</span>
                <span className="font-mono font-bold text-blue-600">{customer?.referenceId || customer?.reference_id || customer?.id || "-"}</span>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Payment Records ({paymentList.length})
              </h4>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 font-semibold text-xs space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                <p>Loading payment history...</p>
              </div>
            ) : paymentList && paymentList.length > 0 ? (
              <div className="space-y-3">
                {paymentList.map((p, idx) => {
                  const badge = getStatusBadge(p.status);
                  return (
                    <div
                      key={p.id || idx}
                      className="border border-slate-200/80 rounded-xl p-4 bg-white shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            {formatFeeType(p.fee_type || p.feeType)}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Record ID: #{p.id}
                            {p.application_id || p.applicationId ? ` • App #${p.application_id || p.applicationId}` : ""}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-emerald-700">
                            ₹{Number(p.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Order / Ref ID</span>
                          <span className="font-mono font-semibold text-slate-700 text-[11px] break-all">
                            {p.gateway_order_id || p.gatewayOrderId || p.order_id || p.orderId || `#${p.id}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Status</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                            >
                              {badge.icon}
                              {badge.text}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(p.created_at || p.createdAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(p)}
                            className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                            title="Update Payment Record Status"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Update Status
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
                No payment history records found for this customer.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex justify-end bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>

      {/* Update Payment Record Status Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Update Payment Record Status
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Record ID: <strong className="font-mono text-slate-700">#{statusModal.paymentRecord?.id}</strong>
                {statusModal.paymentRecord?.amount && (
                  <span> • ₹{Number(statusModal.paymentRecord.amount).toLocaleString("en-IN")}</span>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Select New Status:
              </label>
              <select
                value={statusModal.status}
                onChange={(e) => setStatusModal((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
              >
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-600 bg-blue-50/60 border border-blue-100 p-2.5 rounded-xl">
              Are you sure you want to change status to{" "}
              <strong className="text-blue-600 font-bold">
                {PAYMENT_STATUS_OPTIONS.find((o) => o.value === statusModal.status)?.label || statusModal.status}
              </strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={statusModal.loading}
                onClick={() => setStatusModal({ isOpen: false, paymentRecord: null, status: "pending", loading: false })}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusModal.loading}
                onClick={handleConfirmStatusUpdate}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {statusModal.loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Confirm Update</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

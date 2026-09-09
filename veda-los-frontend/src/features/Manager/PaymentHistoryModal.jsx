import React from "react";
import { X, User, Phone, Mail, CreditCard, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function PaymentHistoryModal({
  isOpen,
  onClose,
  customer,
  payments = [],
  loading = false
}) {
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
    const s = (status || "").toLowerCase();
    if (s === "success" || s === "completed" || s === "paid") {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: "Paid / Completed"
      };
    }
    if (s === "pending" || s === "payment requested") {
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock className="w-3.5 h-3.5" />,
        text: "Pending"
      };
    }
    return {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      text: status || "Failed"
    };
  };

  const formatFeeType = (type) => {
    if (!type) return "Fee";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Payment Records
            </h4>

            {loading ? (
              <div className="py-12 text-center text-slate-500 font-semibold text-xs space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                <p>Loading payment history...</p>
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((p, idx) => {
                  const badge = getStatusBadge(p.status);
                  return (
                    <div
                      key={p.id || idx}
                      className="border border-slate-200/80 rounded-xl p-4 bg-white shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            {formatFeeType(p.fee_type || p.feeType)}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            App #{p.application_id || p.applicationId || "-"}
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
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                          >
                            {badge.icon}
                            {badge.text}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 text-[11px] block">Created At</span>
                          <span className="text-slate-600 text-xs flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(p.created_at || p.createdAt)}
                          </span>
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
    </div>
  );
}

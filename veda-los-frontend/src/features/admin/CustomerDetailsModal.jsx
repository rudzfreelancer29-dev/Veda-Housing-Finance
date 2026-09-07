import React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Briefcase,
  FileText,
  Eye,
  CreditCard
} from "lucide-react";

export default function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  loading = false,
  onInspectDocs
}) {
  if (!isOpen) return null;

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
    if (s.includes("payment requested")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const formatStatusText = (status) => {
    if (!status) return "New Registration";
    return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#f26e21] flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {customer?.full_name ? customer.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">
                  {customer?.full_name || customer?.name || "Customer Profile"}
                </h3>
                <span className="text-xs font-mono font-bold text-[#f26e21] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  {customer?.reference_id || customer?.id || "-"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Registered on {formatDate(customer?.created_at)}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-500 font-semibold text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-[#f26e21]/30 border-t-[#f26e21] rounded-full animate-spin mx-auto" />
              <p>Loading full customer details & application history...</p>
            </div>
          ) : customer ? (
            <>
              {/* Top Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Monthly Income
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {customer.monthly_income && Number(customer.monthly_income) > 0
                      ? `₹${Number(customer.monthly_income).toLocaleString()}`
                      : "₹0.00"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Loan Requirement
                  </span>
                  <span
                    className="text-sm font-bold text-slate-800 mt-0.5 block truncate"
                    title={customer.loan_requirement_details || "Not Specified"}
                  >
                    {customer.loan_requirement_details ||
                      (customer.monthly_income && Number(customer.monthly_income) > 0
                        ? `₹${(Number(customer.monthly_income) * 10).toLocaleString()}`
                        : "Not Specified")}
                  </span>
                </div>

                <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-100">
                  <span className="text-[10px] text-[#f26e21] uppercase font-bold tracking-wider block">
                    Managed By
                  </span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {customer.registered_by_name || "Unassigned"}
                  </span>
                </div>
              </div>

              {/* Personal & Contact Information */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#f26e21]" /> Personal & Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-slate-800">{customer.full_name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mobile Number</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {customer.mobile_number || "-"}
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
                      <Calendar className="w-3 h-3 text-slate-400" /> {formatDate(customer.date_of_birth)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Identity, KYC & Employment */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f26e21]" /> KYC & Employment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">PAN Number</span>
                    <span className="font-mono font-bold text-slate-800">{customer.pan_number || "Not Provided"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Aadhaar Number</span>
                    <span className="font-mono font-bold text-slate-800">{customer.aadhaar_number || "Not Provided"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Employment Details</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" /> {customer.employment_details || "Not Provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Application History */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#f26e21]" /> Loan Application History
                  </h4>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {(customer.applications || []).length} Records
                  </span>
                </div>

                {customer.applications && customer.applications.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                        <tr>
                          <th className="p-3">App ID</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Assigned Manager</th>
                          <th className="p-3">Applied Date</th>
                          <th className="p-3">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customer.applications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-[#f26e21]">#{app.id}</td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] border ${formatStatusBadge(app.status)}`}>
                                {formatStatusText(app.status)}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-700">
                              {app.assigned_manager_name || "Unassigned"}
                            </td>
                            <td className="p-3 text-slate-500">{formatDate(app.created_at)}</td>
                            <td className="p-3 text-slate-500">{formatDate(app.updated_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
                    No loan application records found for this customer.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            onClick={() => {
              if (customer && onInspectDocs) {
                onInspectDocs(customer);
              }
            }}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#f26e21]" />
            Inspect KYC Docs
          </button>

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

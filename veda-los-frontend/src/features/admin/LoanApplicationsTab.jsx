import React, { useState, useEffect } from "react";
import { Search, RefreshCw, Edit } from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";

const STATUSES = [
  { key: "new_registration", label: "New Registration" },
  { key: "under_review", label: "Under Review" },
  { key: "documents_pending", label: "Documents Pending" },
  { key: "eligible", label: "Eligible" },
  { key: "payment_pending", label: "Payment Pending" },
  { key: "payment_completed", label: "Payment Completed" },
  { key: "loan_processing", label: "Loan Processing" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "on_hold", label: "On Hold" }
];

export default function LoanApplicationsTab({ searchQuery: propSearch, setSearchQuery: setPropSearch }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  // Confirmation Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    customer: null,
    status: "eligible",
    loading: false
  });

  const search = propSearch !== undefined ? propSearch : localSearch;
  const setSearch = setPropSearch || setLocalSearch;

  const fetchAppliedCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiService.GetAllCustomers(search);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.customers || [];

      const applied = data.filter((c) => {
        const loanAmount = Number(c.loan_requirement_details) || (c.monthly_income ? Number(c.monthly_income) * 10 : 0);
        return loanAmount > 0;
      });
      setCustomers(applied);
    } catch (error) {
      console.error("Failed to fetch loan application customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAppliedCustomers, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenStatusModal = (customer) => {
    const currentStatus = (customer.application_status || "eligible").toLowerCase().replace(/ /g, "_");
    setModal({
      isOpen: true,
      customer,
      status: currentStatus,
      loading: false
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!modal.customer) return;
    setModal((prev) => ({ ...prev, loading: true }));
    const targetId = modal.customer.application_id || modal.customer.id;

    try {
      await apiService.UpdateCustomerApplicationStatus({ status: modal.status }, targetId);
      toast.success("Application status updated successfully!");
      setModal({ isOpen: false, customer: null, status: "eligible", loading: false });
      fetchAppliedCustomers();
    } catch (error) {
      console.error("Failed to update application status:", error);
      const msg = error.response?.data?.message || "Failed to update status. Please try again.";
      toast.error(msg);
      setModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm sm:text-base">Loan Applications</span>
          <span className="text-xs bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
            {customers.length} Applied
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            onClick={fetchAppliedCustomers}
            disabled={loading}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#f26e21]" : ""}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">App / Ref ID</th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4 text-right">Loan Requirement</th>
              <th className="py-4 px-4">Assigned Manager</th>
              <th className="py-4 px-4">Applied Date</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  Loading loan applications...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No applied loan customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id || c.reference_id} className="hover:bg-slate-50/50">
                  <td className="py-4.5 px-6 font-mono font-bold text-[#f26e21]">
                    {c.application_id ? `APP-${c.application_id}` : (c.reference_id || `CUST-${c.id}`)}
                  </td>
                  <td className="py-4.5 px-4">
                    <span className="font-bold text-slate-800 block">{c.full_name || c.name}</span>
                    <span className="text-xs text-slate-400">{c.mobile_number || c.email || "-"}</span>
                  </td>
                  <td className="py-4.5 px-4 text-right font-bold text-slate-800">
                    {c.loan_requirement_details
                      ? (isNaN(Number(c.loan_requirement_details)) ? c.loan_requirement_details : `₹${Number(c.loan_requirement_details).toLocaleString()}`)
                      : (c.monthly_income ? `₹${(Number(c.monthly_income) * 10).toLocaleString()}` : "-")}
                  </td>
                  <td className="py-4.5 px-4">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                      {c.registered_by_name || "Unassigned"}
                    </span>
                  </td>
                  <td className="py-4.5 px-4 text-slate-500 font-mono text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-4.5 px-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-50 text-[#f26e21] border border-orange-200/60">
                      {c.application_status || "Under Review"}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-right">
                    <button
                      onClick={() => handleOpenStatusModal(c)}
                      className="px-3 py-1.5 bg-[#f26e21] hover:bg-[#d95d16] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit className="w-3 h-3" />
                      Update Status
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Confirmation Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Application Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Customer: <strong className="text-slate-800 font-semibold">{modal.customer?.full_name || modal.customer?.name}</strong>{" "}
              ({modal.customer?.application_id ? `APP-${modal.customer.application_id}` : (modal.customer?.reference_id || `CUST-${modal.customer?.id}`)})
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select New Status:
              </label>
              <select
                value={modal.status}
                onChange={(e) => setModal((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/30 focus:border-[#f26e21] cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-600 mb-6 bg-orange-50/60 border border-orange-100 p-3 rounded-xl">
              Are you sure you want to change the status to{" "}
              <strong className="text-[#f26e21] font-bold">
                {STATUSES.find((s) => s.key === modal.status)?.label || modal.status}
              </strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={modal.loading}
                onClick={() => setModal({ isOpen: false, customer: null, status: "eligible", loading: false })}
                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modal.loading}
                onClick={handleConfirmStatusUpdate}
                className="py-2 px-4 text-xs font-semibold text-white bg-[#f26e21] hover:bg-[#d95d16] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {modal.loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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



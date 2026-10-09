import React, { useState } from "react";
import { Search, UserPlus, Upload, Send, CreditCard, RefreshCw, Pencil, Eye, Edit, Mail } from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";
import CustomCustomerMessage from "./CustomCustomerMessage";

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

export default function CustomerOnboardingTab({
  customers = [],
  loading = false,
  onRefresh,
  searchQuery = "",
  setSearchQuery,
  onSelectCustomer,
  onOpenModal,
  onOpenEditModal,
  onSetPaymentAmount,
  onCustomerClick
}) {
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    customer: null,
    status: "eligible",
    loading: false
  });

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    customer: null
  });

  const filteredCustomers = customers.filter(c => {
    const name = (c.name || c.fullName || "").toLowerCase();
    const id = (c.id || "").toString().toLowerCase();
    const mobile = (c.mobile || c.mobileNumber || "");
    const q = (searchQuery || "").toLowerCase();
    return name.includes(q) || id.includes(q) || mobile.includes(searchQuery);
  });

  const getStatusLabel = (statusKey) => {
    if (!statusKey) return "New Registration";
    const found = STATUSES.find((s) => s.key === statusKey.toLowerCase().replace(/ /g, "_"));
    return found ? found.label : statusKey;
  };

  const handleOpenStatusModal = (customer) => {
    const currentStatus = (customer.stage || customer.application_status || customer.status || "eligible").toLowerCase().replace(/ /g, "_");
    setStatusModal({
      isOpen: true,
      customer,
      status: currentStatus,
      loading: false
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusModal.customer) return;
    setStatusModal((prev) => ({ ...prev, loading: true }));
    const targetId = statusModal.customer.rawId || (typeof statusModal.customer.id === "string" ? statusModal.customer.id.replace(/^CUST-/, "") : statusModal.customer.id);

    try {
      await apiService.UpdateCustomerStatus({ status: statusModal.status }, targetId);
      toast.success("Customer status updated successfully!");
      setStatusModal({ isOpen: false, customer: null, status: "eligible", loading: false });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update customer status:", error);
      const msg = error.response?.data?.message || "Failed to update status. Please try again.";
      toast.error(msg);
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, ID, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Customers"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          )}
          <button
            onClick={() => onOpenModal("register")}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Register Customer
          </button>
        </div>
      </div>

      {/* Customers List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
            <tr>
              <th className="p-3">Customer ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Mobile & Email</th>
              <th className="p-3">Loan Requested</th>
              <th className="p-3">Current Stage</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></span>
                    <span>Loading customers...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                  {searchQuery ? "No matching customers found." : "No customers found. Click \"Register Customer\" to add one."}
                </td>
              </tr>
            ) : (
              filteredCustomers.map(cust => (
                <tr
                  key={cust.id}
                  onClick={() => onCustomerClick && onCustomerClick(cust)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="p-3 font-medium text-blue-600 font-mono text-xs group-hover:underline">{cust.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{cust.name || cust.fullName}</td>
                  <td className="p-3 text-xs">
                    <div>{cust.mobile || cust.mobileNumber}</div>
                    <div className="text-slate-400">{cust.email || "-"}</div>
                  </td>
                  <td className="p-3 font-semibold">
                    {cust.loanReq ? (typeof cust.loanReq === "number" || !isNaN(Number(cust.loanReq)) ? `₹${Number(cust.loanReq).toLocaleString()}` : cust.loanReq) : ""}
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {getStatusLabel(cust.stage)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStatusModal(cust);
                        }}
                        title="Update Status"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 flex items-center justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenEditModal) {
                          onOpenEditModal(cust);
                        } else {
                          onSelectCustomer(cust);
                          onOpenModal("editCustomer");
                        }
                      }}
                      title="Edit Customer Details"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCustomer(cust);
                        onOpenModal("docUpload");
                      }}
                      title="Manage Documents"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCustomer(cust);
                        onSetPaymentAmount(
                          cust.income || cust.loanReq
                            ? (Number(cust.loanReq) || Number(cust.income) * 10) * 0.01
                            : 1000
                        );
                        onOpenModal("payment");
                      }}
                      title="Generate Payment Request"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessageModal({
                          isOpen: true,
                          customer: cust
                        });
                      }}
                      title="Send Custom Message"
                      className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Customer Message Modal */}
      <CustomCustomerMessage
        isOpen={messageModal.isOpen}
        customer={messageModal.customer}
        onClose={() => setMessageModal({ isOpen: false, customer: null })}
      />

      {/* Status Update Confirmation Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Customer Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Customer: <strong className="text-slate-800 font-semibold">{statusModal.customer?.fullName || statusModal.customer?.name}</strong>{" "}
              ({statusModal.customer?.id || statusModal.customer?.referenceId})
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select New Status:
              </label>
              <select
                value={statusModal.status}
                onChange={(e) => setStatusModal((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-600 mb-6 bg-blue-50/60 border border-blue-100 p-3 rounded-xl">
              Are you sure you want to change the status to{" "}
              <strong className="text-blue-600 font-bold">
                {STATUSES.find((s) => s.key === statusModal.status)?.label || statusModal.status}
              </strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={statusModal.loading}
                onClick={() => setStatusModal({ isOpen: false, customer: null, status: "eligible", loading: false })}
                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusModal.loading}
                onClick={handleConfirmStatusUpdate}
                className="py-2 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {statusModal.loading ? (
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


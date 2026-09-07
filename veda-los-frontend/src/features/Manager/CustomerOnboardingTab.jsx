import React from "react";
import { Search, UserPlus, Upload, Send, CreditCard, RefreshCw, Pencil, Eye } from "lucide-react";

export default function CustomerOnboardingTab({
  customers = [],
  loading = false,
  onRefresh,
  searchQuery,
  setSearchQuery,
  onStageChange,
  onSelectCustomer,
  onOpenModal,
  onOpenEditModal,
  onSetPaymentAmount,
  onCustomerClick
}) {
  const filteredCustomers = customers.filter(c => {
    const name = (c.name || c.fullName || "").toLowerCase();
    const id = (c.id || "").toString().toLowerCase();
    const mobile = (c.mobile || c.mobileNumber || "");
    const q = searchQuery.toLowerCase();
    return name.includes(q) || id.includes(q) || mobile.includes(searchQuery);
  });

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
                    <select
                      value={cust.stage}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onStageChange(cust.id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="New Registered">New Registered</option>
                      <option value="Document Upload">Document Upload</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Payment Requested">Payment Requested</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-3 flex items-center justify-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCustomerClick && onCustomerClick(cust);
                      }}
                      title="View Customer Profile"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
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
                        onOpenModal("notify");
                      }}
                      title="Send Notification"
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

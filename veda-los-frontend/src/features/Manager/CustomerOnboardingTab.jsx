import React from "react";
import { Search, UserPlus, Upload, Send, CreditCard } from "lucide-react";

export default function CustomerOnboardingTab({
  customers,
  searchQuery,
  setSearchQuery,
  onStageChange,
  onSelectCustomer,
  onOpenModal,
  onSetPaymentAmount
}) {
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery)
  );

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
        <button
          onClick={() => onOpenModal("register")}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Register Customer
        </button>
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
            {filteredCustomers.map(cust => (
              <tr key={cust.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-medium text-slate-800">{cust.id}</td>
                <td className="p-3 font-semibold text-slate-900">{cust.name}</td>
                <td className="p-3 text-xs">
                  <div>{cust.mobile}</div>
                  <div className="text-slate-400">{cust.email}</div>
                </td>
                <td className="p-3 font-semibold">₹{cust.loanReq.toLocaleString()}</td>
                <td className="p-3">
                  <select
                    value={cust.stage}
                    onChange={(e) => onStageChange(cust.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="New Registered">New Registered</option>
                    <option value="Document Upload">Document Upload</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Payment Requested">Payment Requested</option>
                    <option value="Approved">Approved</option>
                  </select>
                </td>
                <td className="p-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => { onSelectCustomer(cust); onOpenModal("docUpload"); }}
                    title="Manage Documents"
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { onSelectCustomer(cust); onOpenModal("notify"); }}
                    title="Send Notification"
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { onSelectCustomer(cust); onSetPaymentAmount(cust.loanReq * 0.01); onOpenModal("payment"); }}
                    title="Generate Payment Request"
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

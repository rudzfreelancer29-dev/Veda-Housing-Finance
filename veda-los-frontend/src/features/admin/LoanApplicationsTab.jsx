import React, { useMemo } from "react";
import { Search } from "lucide-react";

export default function LoanApplicationsTab({
  applications,
  managers,
  onAssignManager,
  onUpdateAppStatus,
  searchQuery,
  setSearchQuery
}) {
  const filteredApps = useMemo(() => {
    return applications.filter(app => 
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applications, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm sm:text-base">Active Applications</span>
          <span className="text-xs bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
            {filteredApps.length} active
          </span>
        </div>
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">ID</th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4 text-right">Loan Amount</th>
              <th className="py-4 px-4">Assigned Manager</th>
              <th className="py-4 px-4">Registered Date</th>
              <th className="py-4 px-4 text-center">Status stage</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No applications match your query.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="py-4.5 px-6 font-mono font-bold text-slate-700">{app.id}</td>
                  <td className="py-4.5 px-4">
                    <span className="font-bold text-slate-800 block">{app.customerName}</span>
                    <span className="text-xs text-slate-400 font-mono">{app.customerId}</span>
                  </td>
                  <td className="py-4.5 px-4 text-right font-bold text-slate-800">₹{app.amount.toLocaleString()}</td>
                  <td className="py-4.5 px-4">
                    <select
                      value={app.manager}
                      onChange={(e) => onAssignManager(app.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-[#f26e21] focus:outline-none cursor-pointer"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4.5 px-4 text-slate-400 font-mono text-xs">{app.date}</td>
                  <td className="py-4.5 px-4 text-center">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateAppStatus(app.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer ${
                        app.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : app.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : app.status === "Eligible" || app.status === "Payment Completed"
                          ? "bg-orange-50 text-[#f26e21] border-orange-200/60"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <option value="New Registration">New Registration</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Documents Pending">Documents Pending</option>
                      <option value="Eligible">Eligible</option>
                      <option value="Payment Pending">Payment Pending</option>
                      <option value="Payment Completed">Payment Completed</option>
                      <option value="Loan Processing">Loan Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </td>
                  <td className="py-4.5 px-6 text-right font-semibold text-slate-500 text-xs">
                    Advance stages via Status dropdown
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

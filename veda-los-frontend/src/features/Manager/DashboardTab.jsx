import React from "react";
import { Users, Clock, CreditCard, CheckCircle, UserPlus } from "lucide-react";

export default function DashboardTab({
  customers,
  onNavigateTab,
  onSelectCustomer,
  onOpenModal
}) {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Onboarded</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{customers.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Under Review</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {customers.filter(c => c.stage === "Under Review").length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Requests</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">
              {customers.filter(c => c.stage === "Payment Requested").length}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><CreditCard className="w-6 h-6" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {customers.filter(c => c.stage === "Approved").length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Quick Actions & Overview Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent Customer Applications</h2>
            <button onClick={() => onNavigateTab("Customer Onboarding")} className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Loan Req.</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.slice(0, 4).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-medium text-slate-800">{c.name || c.fullName} <span className="text-xs text-slate-400 block">{c.id}</span></td>
                    <td className="p-3 font-semibold">
                      {c.loanReq ? (typeof c.loanReq === "number" || !isNaN(Number(c.loanReq)) ? `₹${Number(c.loanReq).toLocaleString()}` : c.loanReq) : ""}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">{c.stage}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => { onSelectCustomer(c); onOpenModal("docUpload"); }} className="text-xs font-medium text-blue-600 hover:text-blue-800">Docs</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manager Workspace Info Card */}
        <div className="bg-gradient-to-br from-[#0a182e] to-[#122b52] p-6 rounded-2xl text-white shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold">Manager Workspace</h2>
            <p className="text-xs text-slate-300 mt-1">Customer onboarding & loan lifecycle management.</p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Onboard new loan applicants</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Manage & verify documents</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Generate payment requests</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Update application stages</div>
            </div>
          </div>
          <button onClick={() => onOpenModal("register")} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer">
            <UserPlus className="w-4 h-4" /> Register New Customer
          </button>
        </div>
      </div>
    </div>
  );
}

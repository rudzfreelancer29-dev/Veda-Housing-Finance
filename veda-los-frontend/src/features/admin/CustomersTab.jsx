import React, { useMemo } from "react";
import { Search } from "lucide-react";

export default function CustomersTab({ customers, searchQuery, setSearchQuery }) {
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm sm:text-base">Customer Records</span>
          <span className="text-xs bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
            {filteredCustomers.length} onboarded
          </span>
        </div>
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            placeholder="Search customers..."
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
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Mobile / Email</th>
              <th className="py-4 px-4">PAN / Aadhaar</th>
              <th className="py-4 px-4 text-right">Income (Monthly)</th>
              <th className="py-4 px-4 text-right">Loan Requirement</th>
              <th className="py-4 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No customers match your query.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-4.5 px-6 font-semibold text-[#f26e21]">{c.id}</td>
                  <td className="py-4.5 px-4 font-bold text-slate-800">{c.name}</td>
                  <td className="py-4.5 px-4">
                    <span className="block text-slate-700">{c.mobile}</span>
                    <span className="text-xs text-slate-400">{c.email}</span>
                  </td>
                  <td className="py-4.5 px-4 font-mono text-xs">
                    <span className="block text-slate-700">{c.pan}</span>
                    <span className="text-slate-400">{c.aadhaar}</span>
                  </td>
                  <td className="py-4.5 px-4 text-right font-semibold text-slate-700">₹{c.income.toLocaleString()}</td>
                  <td className="py-4.5 px-4 text-right font-bold text-slate-800">₹{c.loanReq.toLocaleString()}</td>
                  <td className="py-4.5 px-6 text-center">
                    <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-50 text-[#f26e21] border border-orange-200/60">
                      {c.status}
                    </span>
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

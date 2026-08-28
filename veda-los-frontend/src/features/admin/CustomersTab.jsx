import React, { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Check,
  X,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  User,
  FileText,
  Download,
  Mail
} from "lucide-react";

export default function CustomersTab({
  customers,
  searchQuery,
  setSearchQuery,
  applications = []
}) {
  const [activeDocViewer, setActiveDocViewer] = useState(null); // customer object when viewing docs
  const [activeDocTab, setActiveDocTab] = useState("aadhaar"); // 'aadhaar', 'pan', 'income'

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col w-full relative">
      
      {/* Table Header Control Row */}
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

      {/* Customers Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6 w-24">ID</th>
              <th className="py-4 px-4">Name</th>
              <th className="py-4 px-4">Mobile / Email</th>
              <th className="py-4 px-4">PAN / Aadhaar</th>
              <th className="py-4 px-4">Manager</th>
              <th className="py-4 px-4 text-right">Income (Monthly)</th>
              <th className="py-4 px-4 text-right">Loan Requirement</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-400 font-semibold">
                  No customers match your query.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                // Find matching application for manager details
                const app = applications.find(a => a.customerId === c.id);
                const managerName = app ? app.manager : "Unassigned";

                return (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4.5 px-6 font-semibold text-[#f26e21] font-mono text-xs">{c.id}</td>
                    <td className="py-4.5 px-4 font-bold text-slate-800">{c.name}</td>
                    <td className="py-4.5 px-4">
                      <span className="block text-slate-700 font-medium">{c.mobile}</span>
                      <span className="text-xs text-slate-400 font-normal flex items-center gap-0.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        {c.email}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 font-mono text-xs">
                      <span className="block text-slate-700">{c.pan}</span>
                      <span className="text-slate-400">{c.aadhaar}</span>
                    </td>
                    <td className="py-4.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold ${
                        managerName === "Unassigned" 
                          ? "bg-slate-100 text-slate-500" 
                          : "bg-orange-50 text-[#f26e21] border border-orange-100"
                      }`}>
                        {managerName}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 text-right font-semibold text-slate-700">₹{c.income.toLocaleString()}</td>
                    <td className="py-4.5 px-4 text-right font-bold text-slate-800">₹{c.loanReq.toLocaleString()}</td>
                    <td className="py-4.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                        c.status?.toLowerCase() === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : c.status?.toLowerCase() === "rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setActiveDocViewer(c);
                          setActiveDocTab("aadhaar");
                        }}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg inline-flex items-center gap-1 transition-all text-xs font-bold focus:outline-none"
                        title="Inspect Customer Documents"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Docs
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>



      {/* Tabbed Document Verification Overlay Modal */}
      {activeDocViewer && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-40 p-4 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[75vh] flex flex-col overflow-hidden border border-slate-100 animate-scale-in">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h4 className="font-extrabold text-slate-800 text-base leading-tight">
                  Document Verification Hub
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applicant: {activeDocViewer.name} • {activeDocViewer.id}
                </p>
              </div>
              <button
                onClick={() => setActiveDocViewer(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doc Tabs Navigation */}
            <div className="flex border-b border-slate-100 bg-slate-50/30 px-6 pt-2 gap-2">
              <button
                onClick={() => setActiveDocTab("aadhaar")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeDocTab === "aadhaar"
                    ? "border-[#f26e21] text-[#f26e21]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Aadhaar Card
              </button>
              <button
                onClick={() => setActiveDocTab("pan")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeDocTab === "pan"
                    ? "border-[#f26e21] text-[#f26e21]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                PAN Card
              </button>
              <button
                onClick={() => setActiveDocTab("income")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeDocTab === "income"
                    ? "border-[#f26e21] text-[#f26e21]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Salary Proof
              </button>
            </div>

            {/* Doc Contents Area */}
            <div className="flex-1 p-6 bg-slate-50 overflow-y-auto flex flex-col items-center justify-center">
              {activeDocTab === "aadhaar" && (
                <div className="bg-white border-2 border-slate-200 border-dashed rounded-xl p-6 w-full max-w-lg shadow-sm relative text-xs font-semibold">
                  <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-8 h-8 rounded bg-orange-100 text-[#f26e21] flex items-center justify-center font-bold text-sm">
                        IND
                      </div>
                      <div>
                        <h5 className="font-extrabold text-[13px] text-slate-800 leading-none">Government of India</h5>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Aadhaar Card Authority</span>
                      </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 flex items-center justify-center">
                      <div className="w-20 h-24 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400 shadow-inner">
                        <User className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase block font-bold">Name</label>
                        <span className="text-slate-700">{activeDocViewer.name}</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase block font-bold">DOB</label>
                        <span className="text-slate-700">{activeDocViewer.dob || "15/05/1990"}</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase block font-bold">Aadhaar Number</label>
                        <span className="text-slate-800 font-mono tracking-wider font-bold">
                          {activeDocViewer.aadhaar || "1234 5678 9012"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t mt-4 pt-3 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Status: SIGNED & SECURED</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> VERIFIED
                    </span>
                  </div>
                </div>
              )}

              {activeDocTab === "pan" && (
                <div className="bg-gradient-to-br from-teal-800 to-cyan-950 text-white rounded-xl p-6 w-full max-w-lg shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl"></div>
                  <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-4">
                    <div>
                      <h5 className="font-extrabold text-[12px] leading-none uppercase tracking-wider text-cyan-200">Income Tax Department</h5>
                      <span className="text-[9px] text-white/50 uppercase tracking-widest font-bold">Govt. of India</span>
                    </div>
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded font-mono border border-white/10 uppercase tracking-wider">Permanent Account Card</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="col-span-1 flex items-center justify-center">
                      <div className="w-20 h-24 bg-white/5 rounded-md border border-white/10 flex items-center justify-center text-white/30 shadow-inner">
                        <User className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2.5 text-white/90">
                      <div>
                        <label className="text-[9px] text-white/40 uppercase block font-bold">Name</label>
                        <span className="text-sm font-bold tracking-tight text-white">
                          {activeDocViewer.name.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <label className="text-[9px] text-white/40 uppercase block font-bold">PAN Number</label>
                        <span className="text-base font-mono tracking-wider font-extrabold text-cyan-300">
                          {activeDocViewer.pan || "ABCDE1234F"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 mt-4 pt-3 text-[9px] text-white/40 flex items-center justify-between">
                    <span>ISSUED BY INCOME TAX AUTHORITY</span>
                    <span className="font-bold text-teal-300 flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> VERIFIED
                    </span>
                  </div>
                </div>
              )}

              {activeDocTab === "income" && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-sm text-xs">
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <div>
                        <h5 className="font-extrabold text-[13px] text-slate-800 leading-none">Salary Slip & Income Statement</h5>
                        <span className="text-[10px] text-slate-400">Monthly Payroll Audit Proof</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">PDF DOCUMENT</span>
                  </div>

                  <div className="space-y-3.5 text-slate-600 font-semibold">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Declared Income (Monthly)</span>
                      <span className="text-slate-800">
                        {formatCurrency(activeDocViewer.income || 65000)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Loan Requirement</span>
                      <span className="text-slate-800 font-bold">
                        {formatCurrency(activeDocViewer.loanReq)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-slate-400 font-medium">Supporting Statement</span>
                      <span className="text-slate-800 text-right">Bank_Statement_Q2.pdf</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-4 text-[10px] text-slate-500 leading-relaxed font-semibold">
                    Income verified successfully through bank integration gateway node. Monthly credit logs match user-declared amount.
                  </div>
                </div>
              )}
            </div>

            {/* Doc Footer Action Toolbar */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[10px] text-slate-400 font-semibold">
                Document Reference: DOC-{activeDocViewer.id}
              </span>
              <button
                onClick={() => alert("Downloading document copy (Mock)")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md focus:outline-none"
              >
                <Download className="w-3.5 h-3.5" />
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

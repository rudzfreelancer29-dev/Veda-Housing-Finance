import React, { useState } from "react";
import {
  X,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  AlertTriangle,
  User,
  Mail,
  Calendar,
  Briefcase,
  ShieldCheck,
  Check,
  ChevronRight
} from "lucide-react";

export default function ManagerCustomersModal({
  manager,
  onClose,
  applications,
  customers,
  onUpdateAppStatus
}) {
  const [activeDocViewer, setActiveDocViewer] = useState(null); // customer object when viewing docs
  const [activeDocTab, setActiveDocTab] = useState("aadhaar"); // 'aadhaar', 'pan', 'income'
  const [confirmAction, setConfirmAction] = useState(null); // { customer, type: 'Approve' | 'Reject' }

  // Filter applications assigned to this manager
  const managerApps = applications.filter(
    (app) => app.manager && app.manager.toLowerCase() === manager.name.toLowerCase()
  );

  // Map applications to customer details
  const portfolio = managerApps.map((app) => {
    const customer = customers.find((c) => c.id === app.customerId) || {};
    return {
      ...customer,
      appId: app.id,
      appAmount: app.amount,
      appStatus: app.status,
      appDate: app.date
    };
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleActionClick = (customer, type) => {
    setConfirmAction({ customer, type });
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { customer, type } = confirmAction;
    const newStatus = type === "Approve" ? "Approved" : "Rejected";
    
    // Call the parent status updater
    onUpdateAppStatus(customer.appId, newStatus);
    setConfirmAction(null);
  };

  const handleCancelAction = () => {
    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
      {/* Main Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative border border-slate-100 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f26e21] to-amber-500 text-white font-black text-sm flex items-center justify-center border border-orange-200 uppercase shadow-xs shrink-0">
                {manager.name ? (manager.name.trim().split(" ").length >= 2 ? (manager.name.trim().split(" ")[0][0] + manager.name.trim().split(" ")[1][0]).toUpperCase() : manager.name.slice(0, 2).toUpperCase()) : "M"}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                  Portfolio: {manager.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {manager.role} • {portfolio.length} customer application(s)
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {portfolio.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-700">No Customers Found</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  This manager currently doesn't have any active loan customers assigned.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto border border-slate-100 rounded-xl bg-white">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                    <th className="py-4 px-5">Customer Info</th>
                    <th className="py-4 px-4">Application ID</th>
                    <th className="py-4 px-4">Loan Requested</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                  {portfolio.map((customer) => (
                    <tr key={customer.appId} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">
                            {customer.name || customer.customerName}
                          </span>
                          <span className="text-xs text-slate-400 font-normal mt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0" />
                            {customer.email || "N/A"}
                          </span>
                          {customer.id && (
                            <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-100/50 w-max mt-1">
                              ID: {customer.id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-slate-600 bg-slate-100/80 px-2 py-1 rounded text-xs">
                          {customer.appId}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">
                        {formatCurrency(customer.appAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            customer.appStatus?.toLowerCase() === "approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : customer.appStatus?.toLowerCase() === "rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {customer.appStatus}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveDocViewer(customer);
                            setActiveDocTab("aadhaar");
                          }}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg inline-flex items-center gap-1.5 transition-all text-xs font-bold shadow-xs focus:outline-none"
                          title="View Documents"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Docs
                        </button>
                        
                        {customer.appStatus?.toLowerCase() !== "approved" &&
                          customer.appStatus?.toLowerCase() !== "rejected" && (
                            <>
                              <button
                                onClick={() => handleActionClick(customer, "Approve")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center gap-1 transition-all text-xs font-bold shadow-xs focus:outline-none hover:shadow-md"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleActionClick(customer, "Reject")}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg inline-flex items-center gap-1 transition-all text-xs font-bold shadow-xs focus:outline-none hover:shadow-md"
                              >
                                Reject
                              </button>
                            </>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Footer info banner */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-medium">
          Note: Action approvals directly update client accounts and log details in the system auditing history database.
        </div>

        {/* Confirmation Modal Overlay */}
        {confirmAction && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-scale-in text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                confirmAction.type === "Approve" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}>
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 mb-2">
                Confirm {confirmAction.type}al
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Are you sure you want to <strong className="text-slate-700 uppercase">{confirmAction.type}</strong> the loan application of <strong className="text-slate-700">{confirmAction.customer.name || confirmAction.customer.customerName}</strong>?
                <br />
                Amount requested: <strong className="text-slate-700">{formatCurrency(confirmAction.customer.appAmount)}</strong>. This operation cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelAction}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all focus:outline-none hover:shadow-md ${
                    confirmAction.type === "Approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Yes, {confirmAction.type}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal Overlay */}
        {activeDocViewer && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-40 p-4 transition-all">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[75vh] flex flex-col overflow-hidden border border-slate-100 animate-scale-in">
              {/* Doc Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base leading-tight">
                    Document Verification
                  </h4>
                  <p className="text-xs text-slate-400">
                    Applicant: {activeDocViewer.name || activeDocViewer.customerName}
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

              {/* Doc Content Preview Box */}
              <div className="flex-1 p-6 bg-slate-50 overflow-y-auto flex flex-col items-center justify-center">
                {activeDocTab === "aadhaar" && (
                  <div className="bg-white border-2 border-slate-200 border-dashed rounded-xl p-6 w-full max-w-lg shadow-sm relative">
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
                    <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="w-20 h-24 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400 shadow-inner">
                          <User className="w-8 h-8" />
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2.5">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase block font-bold">Name</label>
                          <span className="text-slate-700">{activeDocViewer.name || activeDocViewer.customerName}</span>
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
                      <span>Verification Status: SIGNED & SECURED</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {activeDocTab === "pan" && (
                  <div className="bg-gradient-to-br from-teal-800 to-cyan-950 text-white rounded-xl p-6 w-full max-w-lg shadow-lg relative overflow-hidden">
                    {/* Background decorations */}
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
                            {(activeDocViewer.name || activeDocViewer.customerName)?.toUpperCase()}
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
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {activeDocTab === "income" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-lg shadow-sm">
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

                    <div className="space-y-3.5 text-xs text-slate-600 font-semibold">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-400 font-medium">Declared Income (Monthly)</span>
                        <span className="text-slate-800">
                          {formatCurrency(activeDocViewer.income || 65000)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-400 font-medium">Assigned Loan Requirement</span>
                        <span className="text-slate-800 font-bold">
                          {formatCurrency(activeDocViewer.appAmount || activeDocViewer.loanReq)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-400 font-medium">Debt-to-Income Ratio</span>
                        <span className="text-emerald-600 font-bold">
                          {(
                            ((activeDocViewer.appAmount || activeDocViewer.loanReq) / 100) /
                            (activeDocViewer.income || 65000)
                          ).toFixed(1)}
                          % (Healthy)
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-slate-400 font-medium">Supporting Statement</span>
                        <span className="text-slate-800 text-right">Bank_Statement_Q2.pdf</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-4 text-[10px] text-slate-500 leading-relaxed">
                      Income verified successfully through bank integration gateway node. Salary slips and employer verification status checks have all returned POSITIVE.
                    </div>
                  </div>
                )}
              </div>

              {/* Doc Footer Action Toolbar */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-[10px] text-slate-400 font-medium">
                  Document Reference: DOC-{activeDocViewer.appId || "MOCK"}
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
    </div>
  );
}

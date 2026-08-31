import React from "react";
import { X, Upload, Send, CreditCard, FileCheck } from "lucide-react";

// MODAL 1: REGISTER CUSTOMER
export function RegisterCustomerModal({
  newCustForm,
  setNewCustForm,
  onSubmit,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">Register New Customer</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Full Name</label>
            <input required type="text" value={newCustForm.name} onChange={e => setNewCustForm({ ...newCustForm, name: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Mobile</label>
              <input required type="text" value={newCustForm.mobile} onChange={e => setNewCustForm({ ...newCustForm, mobile: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Email</label>
              <input type="email" value={newCustForm.email} onChange={e => setNewCustForm({ ...newCustForm, email: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">PAN Number</label>
              <input type="text" value={newCustForm.pan} onChange={e => setNewCustForm({ ...newCustForm, pan: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Loan Request (₹)</label>
              <input type="number" value={newCustForm.loanReq} onChange={e => setNewCustForm({ ...newCustForm, loanReq: e.target.value })} className="w-full mt-1 p-2 text-sm border rounded-xl" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl mt-2 cursor-pointer">
            Save & Register Customer
          </button>
        </form>
      </div>
    </div>
  );
}

// MODAL 2: MANAGE DOCUMENTS
export function ManageDocumentsModal({
  selectedCustomer,
  onClose
}) {
  if (!selectedCustomer) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800">Manage Customer Documents</h3>
            <p className="text-xs text-slate-400">{selectedCustomer.name} ({selectedCustomer.id})</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="space-y-3">
          {selectedCustomer.documents?.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-700">{doc.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${doc.status === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {doc.status}
              </span>
            </div>
          ))}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition-all">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs text-slate-600 font-medium">Click to Upload New Document</p>
            <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// MODAL 3: SEND NOTIFICATION
export function SendNotificationModal({
  selectedCustomer,
  notificationMsg,
  setNotificationMsg,
  onSubmit,
  onClose
}) {
  if (!selectedCustomer) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <h3 className="font-bold text-slate-800">Send Customer Notification</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-xs text-slate-500">To: <span className="font-bold text-slate-800">{selectedCustomer.name} ({selectedCustomer.mobile})</span></p>
          <textarea
            required
            rows={3}
            placeholder="Type SMS/Email notification message here..."
            value={notificationMsg}
            onChange={e => setNotificationMsg(e.target.value)}
            className="w-full p-2.5 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer">
            <Send className="w-4 h-4" /> Send Notification
          </button>
        </form>
      </div>
    </div>
  );
}

// MODAL 4: GENERATE PAYMENT REQUEST
export function GeneratePaymentModal({
  selectedCustomer,
  paymentType,
  setPaymentType,
  paymentAmount,
  setPaymentAmount,
  onSubmit,
  onClose
}) {
  if (!selectedCustomer) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <h3 className="font-bold text-slate-800">Generate Payment Request</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Customer</label>
            <input disabled type="text" value={`${selectedCustomer.name} (${selectedCustomer.id})`} className="w-full mt-1 p-2 text-xs border rounded-xl bg-slate-100" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Payment Type</label>
            <select value={paymentType} onChange={e => setPaymentType(e.target.value)} className="w-full mt-1 p-2 text-xs border rounded-xl">
              <option value="Processing Fee">Processing Fee</option>
              <option value="Valuation Fee">Property Valuation Fee</option>
              <option value="Legal Fee">Legal Verification Fee</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Amount (₹)</label>
            <input required type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full mt-1 p-2 text-xs border rounded-xl" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer">
            <CreditCard className="w-4 h-4" /> Issue Payment Request
          </button>
        </form>
      </div>
    </div>
  );
}

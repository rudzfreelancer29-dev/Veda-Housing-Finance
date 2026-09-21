import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Send,
  CreditCard,
  FileCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Paperclip,
  Eye,
  Download,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  Plus,
  ZoomIn
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";
import { environment } from "../../environment/environment";

// MODAL 1: REGISTER CUSTOMER
export function RegisterCustomerModal({
  newCustForm,
  setNewCustForm,
  onSubmit,
  onClose,
  loading = false
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Register New Customer</h3>
            <p className="text-xs text-slate-500">Fill in the details below to register a customer</p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Mandatory Fields */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Kavita Desai"
              value={newCustForm.fullName}
              onChange={e => setNewCustForm({ ...newCustForm, fullName: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="tel"
                placeholder="e.g. 9998887766"
                value={newCustForm.mobileNumber}
                onChange={e => setNewCustForm({ ...newCustForm, mobileNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                placeholder="e.g. kavita@example.com"
                value={newCustForm.email}
                onChange={e => setNewCustForm({ ...newCustForm, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={newCustForm.dateOfBirth}
                onChange={e => setNewCustForm({ ...newCustForm, dateOfBirth: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Employment Details</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={newCustForm.employmentDetails}
                onChange={e => setNewCustForm({ ...newCustForm, employmentDetails: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">PAN Number</label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                value={newCustForm.panNumber}
                onChange={e => setNewCustForm({ ...newCustForm, panNumber: e.target.value.toUpperCase() })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Aadhaar Number</label>
              <input
                type="text"
                placeholder="e.g. 123412341234"
                value={newCustForm.aadhaarNumber}
                onChange={e => setNewCustForm({ ...newCustForm, aadhaarNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Monthly Income (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 55000"
                value={newCustForm.monthlyIncome}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNewCustForm({ ...newCustForm, monthlyIncome: val });
                }}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Loan Requirement (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 500000"
                value={newCustForm.loanRequirementDetails}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNewCustForm({ ...newCustForm, loanRequirementDetails: val });
                }}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Registering...</span>
                </>
              ) : (
                "Save & Register Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// RE-EXPORT DOCUMENT MANAGEMENT MODAL (Extracted to separate component)
export { default as CustomerDocumentsModal, ManageDocumentsModal, SeeDocumentsModal } from "./CustomerDocumentsModal";

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
  paymentType = "processing_fee",
  setPaymentType,
  paymentAmount,
  setPaymentAmount,
  onSubmit,
  onClose,
  loading = false
}) {
  if (!selectedCustomer) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <h3 className="font-bold text-slate-800">Generate Payment Request</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Customer</label>
            <input
              disabled
              type="text"
              value={`${selectedCustomer.name || selectedCustomer.fullName} (${selectedCustomer.referenceId || selectedCustomer.id})`}
              className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Payment Type</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="processing_fee">Processing Fee</option>
              <option value="documentation_fee">Documentation Fee</option>
              <option value="valuation_fee">Property Valuation Fee</option>
              <option value="legal_fee">Legal Verification Fee</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Amount (₹)</label>
            <input
              required
              type="number"
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount (e.g. 2500)"
              className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Issuing Request...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Issue Payment Request</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// MODAL 5: EDIT CUSTOMER
export function EditCustomerModal({
  editCustForm,
  setEditCustForm,
  onSubmit,
  onClose,
  loading = false,
  customerId = ""
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Update Customer</h3>
            <p className="text-xs text-slate-500">Edit customer details {customerId ? `(${customerId})` : ""}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3.5">
          {/* Mandatory Fields */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Kavita Desai"
              value={editCustForm.fullName}
              onChange={e => setEditCustForm({ ...editCustForm, fullName: e.target.value })}
              className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="tel"
                placeholder="e.g. 9998887766"
                value={editCustForm.mobileNumber}
                onChange={e => setEditCustForm({ ...editCustForm, mobileNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                placeholder="e.g. kavita@example.com"
                value={editCustForm.email}
                onChange={e => setEditCustForm({ ...editCustForm, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={editCustForm.dateOfBirth}
                onChange={e => setEditCustForm({ ...editCustForm, dateOfBirth: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Employment Details</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={editCustForm.employmentDetails}
                onChange={e => setEditCustForm({ ...editCustForm, employmentDetails: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">PAN Number</label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                value={editCustForm.panNumber}
                onChange={e => setEditCustForm({ ...editCustForm, panNumber: e.target.value.toUpperCase() })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Aadhaar Number</label>
              <input
                type="text"
                placeholder="e.g. 123412341234"
                value={editCustForm.aadhaarNumber}
                onChange={e => setEditCustForm({ ...editCustForm, aadhaarNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Monthly Income (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 55000"
                value={editCustForm.monthlyIncome}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setEditCustForm({ ...editCustForm, monthlyIncome: val });
                }}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Loan Requirement (₹)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 500000"
                value={editCustForm.loanRequirementDetails}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "");
                  setEditCustForm({ ...editCustForm, loanRequirementDetails: val });
                }}
                className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Updating...</span>
                </>
              ) : (
                "Update Customer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

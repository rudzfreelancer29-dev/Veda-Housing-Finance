import React, { useMemo, useState } from "react";
import {
  Search,
  Eye,
  X,
  Mail,
  RefreshCw,
  Trash2
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";
import CustomerDetailsModal from "./CustomerDetailsModal";
import PaymentHistoryModal from "./PaymentHistoryModal";
import CustomerDocumentsModal from "../Manager/CustomerDocumentsModal";

export default function CustomersTab({
  customers = [],
  loading = false,
  onRefresh,
  searchQuery = "",
  setSearchQuery,
  applications = [],
  onUpdateAppStatus
}) {
  const [selectedDocCustomer, setSelectedDocCustomer] = useState(null); // customer object when viewing docs

  // Full Customer Details Modal State
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Payment History Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentHistoryCustomer, setPaymentHistoryCustomer] = useState(null);
  const [paymentHistoryList, setPaymentHistoryList] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);

  // Delete Customer State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    customerId: null,
    customerName: "",
    referenceId: "",
    loading: false
  });

  const filteredCustomers = useMemo(() => {
    if (!customers || !Array.isArray(customers)) return [];
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(c => 
      (c.name || c.fullName || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.mobile || c.mobileNumber || "").includes(searchQuery) ||
      (c.id || "").toString().toLowerCase().includes(q) ||
      (c.referenceId || "").toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleCustomerRowClick = async (cust) => {
    setIsPaymentModalOpen(true);
    setPaymentHistoryLoading(true);
    setPaymentHistoryCustomer(cust);
    setPaymentHistoryList([]);
    try {
      const targetId = cust.rawId || (typeof cust.id === "string" ? cust.id.replace(/^CUST-/, "") : cust.id);
      const response = await apiService.GetPaymentHistory(targetId);
      const resData = response.data?.data || response.data?.payments || response.data?.payment || response.data;
      const list = Array.isArray(resData)
        ? resData
        : resData && typeof resData === "object" && (resData.id || resData.amount || resData.gateway_order_id)
        ? [resData]
        : [];
      setPaymentHistoryList(list);
    } catch (error) {
      console.error("Failed to fetch customer payment history:", error);
      setPaymentHistoryList([]);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  const handleDeleteClick = (cust) => {
    setDeleteModal({
      isOpen: true,
      customerId: cust.rawId || cust.id,
      customerName: cust.name || cust.fullName || "Customer",
      referenceId: cust.referenceId || cust.id,
      loading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.customerId) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await apiService.DeleteCustomer(deleteModal.customerId);
      toast.success(`Customer ${deleteModal.customerName} deleted successfully!`);
      setDeleteModal({
        isOpen: false,
        customerId: null,
        customerName: "",
        referenceId: "",
        loading: false
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete customer. Please try again.";
      toast.error(errMsg);
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col w-full relative">
      
      {/* Table Header Control Row */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 text-sm sm:text-base">Customer Records</span>
          <span className="text-xs bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
            {customers.length} total
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">• Click on any customer row to view full details</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Customers"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#f26e21]" : ""}`} />
            </button>
          )}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name, phone, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs pl-9 pr-7 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6 w-28">ID</th>
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
            {loading ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500 font-semibold text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#f26e21]/30 border-t-[#f26e21] rounded-full animate-spin" />
                    <span>Loading customers...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-400 font-semibold text-xs">
                  {searchQuery ? `No customers found matching "${searchQuery}"` : "No customer records found."}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => {
                // Determine manager name from registered_by_name or application mapping
                const managerName = c.registeredByName || c.registered_by_name || c.manager || (applications.find(a => a.customerId === c.id)?.manager) || "Unassigned";

                return (
                  <tr
                    key={c.id}
                    onClick={() => handleCustomerRowClick(c)}
                    className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-4.5 px-6 font-semibold text-[#f26e21] font-mono text-xs group-hover:underline">{c.id}</td>
                    <td className="py-4.5 px-4 font-bold text-slate-800">{c.name || c.fullName}</td>
                    <td className="py-4.5 px-4">
                      <span className="block text-slate-700 font-medium">{c.mobile || c.mobileNumber || "-"}</span>
                      <span className="text-xs text-slate-400 font-normal flex items-center gap-0.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        {c.email || "-"}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 font-mono text-xs">
                      <span className="block text-slate-700">{c.pan || "-"}</span>
                      <span className="text-slate-400">{c.aadhaar || "-"}</span>
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
                    <td className="py-4.5 px-4 text-right font-semibold text-slate-700">
                      {c.income && Number(c.income) > 0 ? `₹${Number(c.income).toLocaleString()}` : "-"}
                    </td>
                    <td className="py-4.5 px-4 text-right font-bold text-slate-800">
                      {c.loanReq ? (typeof c.loanReq === "number" || !isNaN(Number(c.loanReq)) ? `₹${Number(c.loanReq).toLocaleString()}` : c.loanReq) : "-"}
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                        (c.status || "").toLowerCase() === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : (c.status || "").toLowerCase() === "rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {c.status || "Under Review"}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocCustomer(c);
                          }}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg inline-flex items-center gap-1 transition-all text-xs font-bold focus:outline-none cursor-pointer"
                          title="Inspect Customer Documents"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Docs
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(c);
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg inline-flex items-center transition-all text-xs focus:outline-none cursor-pointer"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Documents Modal (Admin View Only) */}
      {selectedDocCustomer && (
        <CustomerDocumentsModal
          selectedCustomer={selectedDocCustomer}
          isOpen={Boolean(selectedDocCustomer)}
          onClose={() => setSelectedDocCustomer(null)}
          onUploadSuccess={onRefresh}
          readOnly={true}
        />
      )}

      {/* Customer Full Details & History Modal */}
      <CustomerDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCustomerDetail(null);
        }}
        customer={selectedCustomerDetail}
        loading={detailLoading}
        onInspectDocs={(cust) => {
          setSelectedDocCustomer(cust);
          setIsDetailModalOpen(false);
        }}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentHistoryCustomer(null);
          setPaymentHistoryList([]);
        }}
        customer={paymentHistoryCustomer}
        payments={paymentHistoryList}
        loading={paymentHistoryLoading}
      />

      {/* Delete Customer Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Confirm Delete Customer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Delete Customer Record</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to delete customer{" "}
              <strong className="text-slate-800 font-bold">{deleteModal.customerName}</strong>
              {deleteModal.referenceId ? ` (${deleteModal.referenceId})` : ""}? This will permanently remove their records and application history. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    customerId: null,
                    customerName: "",
                    referenceId: "",
                    loading: false
                  })
                }
                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModal.loading}
                onClick={handleConfirmDelete}
                className="py-2 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteModal.loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Customer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

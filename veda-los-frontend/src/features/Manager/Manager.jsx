import React, { useState, useEffect } from "react";
import { LayoutDashboard, Users, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { load } from "@cashfreepayments/cashfree-js";
import apiService from "../../services/api-service";

// Import Generic Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Import Modular Tab Components
import DashboardTab from "./DashboardTab";
import CustomerOnboardingTab from "./CustomerOnboardingTab";
import LoanApplicationsTab from "./LoanApplicationsTab";

// Import Modular Modals
import {
  RegisterCustomerModal,
  EditCustomerModal,
  SendNotificationModal,
  GeneratePaymentModal
} from "./ManagerModals";
import CustomerDocumentsModal from "./CustomerDocumentsModal";
import CustomerDetailsModal from "./CustomerDetailsModal";
import PaymentHistoryModal from "./PaymentHistoryModal";

const INITIAL_CUSTOMER_FORM = {
  fullName: "",
  mobileNumber: "",
  email: "",
  dateOfBirth: "",
  panNumber: "",
  aadhaarNumber: "",
  employmentDetails: "",
  monthlyIncome: "",
  loanRequirementDetails: ""
};

// Initial Mock Data
const INITIAL_CUSTOMERS = [
  {
    id: "CUST-101",
    name: "Rahul Sharma",
    mobile: "9876543210",
    email: "rahul.s@gmail.com",
    pan: "ABCDE1234F",
    aadhaar: "1234 5678 9012",
    stage: "Under Review",
    documents: [
      { name: "PAN Card", status: "Verified" },
      { name: "Aadhaar Card", status: "Verified" },
      { name: "Income Proof", status: "Pending" }
    ],
    loanReq: 2500000
  },
  {
    id: "CUST-102",
    name: "Priya Patel",
    mobile: "9812345678",
    email: "priya.p@gmail.com",
    pan: "FGHIJ5678K",
    aadhaar: "9876 5432 1098",
    stage: "Document Upload",
    documents: [
      { name: "PAN Card", status: "Verified" },
      { name: "Aadhaar Card", status: "Pending" }
    ],
    loanReq: 4000000
  },
  {
    id: "CUST-103",
    name: "Amit Kumar",
    mobile: "9988776655",
    email: "amit.k@gmail.com",
    pan: "LMNOP9012Q",
    aadhaar: "4567 8901 2345",
    stage: "Payment Requested",
    documents: [
      { name: "PAN Card", status: "Verified" },
      { name: "Aadhaar Card", status: "Verified" },
      { name: "Income Proof", status: "Verified" }
    ],
    loanReq: 1500000
  }
];

const INITIAL_APPLICATIONS = [
  { id: "APP-501", customerId: "CUST-101", customerName: "Rahul Sharma", amount: 2500000, stage: "Under Review", date: "2026-08-28" },
  { id: "APP-502", customerId: "CUST-102", customerName: "Priya Patel", amount: 4000000, stage: "Document Upload", date: "2026-08-29" },
  { id: "APP-503", customerId: "CUST-103", customerName: "Amit Kumar", amount: 1500000, stage: "Payment Requested", date: "2026-08-30" }
];

export default function Manager({ onLogout }) {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [customers, setCustomers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'register' | 'docUpload' | 'notify' | 'payment'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [newCustForm, setNewCustForm] = useState(INITIAL_CUSTOMER_FORM);
  const [editCustForm, setEditCustForm] = useState(INITIAL_CUSTOMER_FORM);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("processing_fee");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Customer Full Details Modal State
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Payment History Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentHistoryCustomer, setPaymentHistoryCustomer] = useState(null);
  const [paymentHistoryList, setPaymentHistoryList] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);

  // Notifications list
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Customer uploaded new documents", read: false },
    { id: 2, text: "Payment request pending", read: false }
  ]);

  // Sidebar navigation configuration
  const sidebarNavigationItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Customer Onboarding", icon: Users },
    { name: "Loan Applications", icon: FileText }
  ];

  // Fetch Manager's Customers from API
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await apiService.getManagersCustomer();
      const rawData = response.data;
      const dataArray = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.customers || []);

      if (Array.isArray(dataArray)) {
        const mapped = dataArray.map((item, index) => {
          let stage = "New Registered";
          const statusLower = (item.application_status || "").toLowerCase().replace(/_/g, " ");
          if (statusLower === "under review") stage = "Under Review";
          else if (statusLower === "document upload") stage = "Document Upload";
          else if (statusLower === "payment requested") stage = "Payment Requested";
          else if (statusLower === "approved") stage = "Approved";
          else if (statusLower === "rejected") stage = "Rejected";
          else if (statusLower === "new registered" || statusLower === "new") stage = "New Registered";
          else if (item.application_status) stage = item.application_status.charAt(0).toUpperCase() + item.application_status.slice(1);

          const loanAmount = item.loan_requirement_details || (item.monthly_income && Number(item.monthly_income) > 0 ? Number(item.monthly_income) * 10 : "");

          return {
            id: item.reference_id || (item.id ? `CUST-${item.id}` : `CUST-${index + 1}`),
            rawId: item.id,
            referenceId: item.reference_id,
            name: item.full_name || item.name || `Customer ${index + 1}`,
            fullName: item.full_name || item.name || `Customer ${index + 1}`,
            mobile: item.mobile_number || item.mobile || "-",
            mobileNumber: item.mobile_number || item.mobile || "-",
            email: item.email || "",
            pan: item.pan_number || "",
            aadhaar: item.aadhaar_number || "",
            dob: item.date_of_birth || "",
            employment: item.employment_details || "",
            income: item.monthly_income ? Number(item.monthly_income) : "",
            stage: stage,
            applicationId: item.application_id,
            loanReq: loanAmount,
            loanRequirementDetails: item.loan_requirement_details || "",
            documents: [
              { name: "PAN Card", status: item.pan_number ? "Verified" : "Pending" },
              { name: "Aadhaar Card", status: item.aadhaar_number ? "Verified" : "Pending" }
            ],
            createdAt: item.created_at
          };
        });

        setCustomers(mapped);

        const mappedApps = mapped.map((c, idx) => ({
          id: c.applicationId ? `APP-${c.applicationId}` : `APP-${500 + idx + 1}`,
          customerId: c.id,
          customerName: c.name,
          amount: c.loanReq,
          stage: c.stage,
          date: c.createdAt ? c.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]
        }));
        setApplications(mappedApps);
      }
    } catch (error) {
      console.error("Failed to fetch manager customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handler functions
  const handleRegisterCustomer = async (e) => {
    e.preventDefault();
    if (!newCustForm.fullName?.trim()) {
      toast.warn("Full Name is mandatory");
      return;
    }
    if (!newCustForm.mobileNumber?.trim()) {
      toast.warn("Mobile Number is mandatory");
      return;
    }
    if (newCustForm.loanRequirementDetails?.trim()) {
      const numVal = Number(newCustForm.loanRequirementDetails.trim());
      if (isNaN(numVal) || numVal < 0) {
        toast.warn("Loan Requirement must be a valid numeric amount");
        return;
      }
    }

    setRegisterLoading(true);
    try {
      const payload = {
        fullName: newCustForm.fullName.trim(),
        mobileNumber: newCustForm.mobileNumber.trim(),
        email: newCustForm.email ? newCustForm.email.trim() : "",
        dateOfBirth: newCustForm.dateOfBirth || "",
        panNumber: newCustForm.panNumber ? newCustForm.panNumber.trim().toUpperCase() : "",
        aadhaarNumber: newCustForm.aadhaarNumber ? newCustForm.aadhaarNumber.trim() : "",
        employmentDetails: newCustForm.employmentDetails ? newCustForm.employmentDetails.trim() : "",
        monthlyIncome: newCustForm.monthlyIncome ? Number(newCustForm.monthlyIncome) : 0,
        loanRequirementDetails: newCustForm.loanRequirementDetails ? newCustForm.loanRequirementDetails.trim() : ""
      };

      const response = await apiService.registerCustomer(payload);
      toast.success("Customer registered successfully!");

      const resData = response?.data?.customer || response?.data?.data || response?.data;
      const rawId = resData?.id || resData?.customerId;
      const refId = resData?.reference_id || resData?.referenceId || (rawId ? `CUST-${rawId}` : `CUST-${100 + customers.length + 1}`);

      // If monthlyIncome and loanRequirementDetails aren't filled, leave loanReq empty
      let loanReqValue = "";
      if (resData?.loanReq || resData?.loanRequested || resData?.loanAmount) {
        loanReqValue = resData.loanReq || resData.loanRequested || resData.loanAmount;
      } else if (newCustForm.monthlyIncome) {
        loanReqValue = Number(newCustForm.monthlyIncome) * 10;
      } else if (newCustForm.loanRequirementDetails?.trim()) {
        loanReqValue = newCustForm.loanRequirementDetails.trim();
      }

      const newCust = {
        id: refId,
        rawId: rawId,
        referenceId: resData?.reference_id || resData?.referenceId || refId,
        name: payload.fullName,
        fullName: payload.fullName,
        mobile: payload.mobileNumber,
        mobileNumber: payload.mobileNumber,
        email: payload.email,
        pan: payload.panNumber,
        aadhaar: payload.aadhaarNumber,
        dob: payload.dateOfBirth,
        employment: payload.employmentDetails,
        income: newCustForm.monthlyIncome ? Number(newCustForm.monthlyIncome) : "",
        stage: resData?.stage || resData?.status || "New Registered",
        documents: [{ name: "PAN Card", status: "Pending" }, { name: "Aadhaar Card", status: "Pending" }],
        loanReq: loanReqValue,
        loanRequirementDetails: payload.loanRequirementDetails
      };

      setCustomers(prev => [newCust, ...prev]);
      setApplications(prev => [
        {
          id: `APP-${500 + prev.length + 1}`,
          customerId: refId,
          customerName: newCust.name,
          amount: newCust.loanReq,
          stage: "New Registered",
          date: new Date().toISOString().split("T")[0]
        },
        ...prev
      ]);

      setNewCustForm(INITIAL_CUSTOMER_FORM);
      setSelectedCustomer(newCust);
      setActiveModal("docUpload");
      await fetchCustomers();
    } catch (error) {
      console.error("Error registering customer:", error);
      const errMsg = error?.response?.data?.message || error?.response?.data?.error || "Failed to register customer";
      toast.error(errMsg);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleOpenEditModal = (cust) => {
    setSelectedCustomer(cust);
    setEditingCustomerId(cust.rawId || cust.id);

    let formattedDob = cust.dob || cust.dateOfBirth || cust.date_of_birth || "";
    if (formattedDob && typeof formattedDob === "string" && formattedDob.includes("T")) {
      formattedDob = formattedDob.split("T")[0];
    }

    setEditCustForm({
      fullName: cust.fullName || cust.name || "",
      mobileNumber: cust.mobileNumber || cust.mobile || "",
      email: cust.email || "",
      dateOfBirth: formattedDob,
      panNumber: cust.pan || cust.panNumber || cust.pan_number || "",
      aadhaarNumber: cust.aadhaar || cust.aadhaarNumber || cust.aadhaar_number || "",
      employmentDetails: cust.employment || cust.employmentDetails || cust.employment_details || "",
      monthlyIncome: cust.income || cust.monthlyIncome || cust.monthly_income || "",
      loanRequirementDetails: cust.loanRequirementDetails || cust.loan_requirement_details || ""
    });
    setActiveModal("editCustomer");
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editCustForm.fullName?.trim()) {
      toast.warn("Full Name is mandatory");
      return;
    }
    if (!editCustForm.mobileNumber?.trim()) {
      toast.warn("Mobile Number is mandatory");
      return;
    }
    if (editCustForm.loanRequirementDetails?.trim()) {
      const numVal = Number(editCustForm.loanRequirementDetails.trim());
      if (isNaN(numVal) || numVal < 0) {
        toast.warn("Loan Requirement must be a valid numeric amount");
        return;
      }
    }

    setUpdateLoading(true);
    try {
      const payload = {
        fullName: editCustForm.fullName.trim(),
        mobileNumber: editCustForm.mobileNumber.trim(),
        email: editCustForm.email ? editCustForm.email.trim() : "",
        dateOfBirth: editCustForm.dateOfBirth || "",
        panNumber: editCustForm.panNumber ? editCustForm.panNumber.trim().toUpperCase() : "",
        aadhaarNumber: editCustForm.aadhaarNumber ? editCustForm.aadhaarNumber.trim() : "",
        employmentDetails: editCustForm.employmentDetails ? editCustForm.employmentDetails.trim() : "",
        monthlyIncome: editCustForm.monthlyIncome ? Number(editCustForm.monthlyIncome) : 0,
        loanRequirementDetails: editCustForm.loanRequirementDetails ? editCustForm.loanRequirementDetails.trim() : ""
      };

      const targetId = editingCustomerId || selectedCustomer?.rawId || selectedCustomer?.id;
      await apiService.updateCustomer(payload, targetId);
      toast.success("Customer updated successfully!");
      setActiveModal(null);
      await fetchCustomers();
    } catch (error) {
      console.error("Error updating customer:", error);
      const errMsg = error?.response?.data?.message || error?.response?.data?.error || "Failed to update customer";
      toast.error(errMsg);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleViewCustomerDetails = async (cust) => {
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

  const handleStageChange = (custId, newStage) => {
    setCustomers(customers.map(c => c.id === custId ? { ...c, stage: newStage } : c));
    setApplications(applications.map(a => a.customerId === custId ? { ...a, stage: newStage } : a));
  };

  const handleSendNotification = (e) => {
    e.preventDefault();
    alert(`Notification sent to ${selectedCustomer?.name}: "${notificationMsg}"`);
    setNotificationMsg("");
    setActiveModal(null);
  };

  const handleGeneratePayment = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.warn("Please enter a valid amount");
      return;
    }

    setPaymentLoading(true);
    try {
      const custId = selectedCustomer.rawId || (typeof selectedCustomer.id === "number" ? selectedCustomer.id : Number(String(selectedCustomer.id).replace(/^CUST-|^VF-2026-0*/, ""))) || selectedCustomer.id;

      const payload = {
        customerId: typeof custId === "string" && !isNaN(Number(custId)) ? Number(custId) : custId,
        amount: Number(paymentAmount),
        feeType: paymentType || "processing_fee"
      };

      const response = await apiService.ManagersPaymentRequest(payload);
      const resData = response.data;

      // Extract and validate Cashfree payment_session_id from backend response
      const rawSessionId =
        resData?.gateway?.payment_session_id ||
        resData?.gateway?.paymentSessionId ||
        resData?.payment_session_id ||
        resData?.paymentSessionId ||
        resData?.data?.payment_session_id ||
        resData?.data?.paymentSessionId ||
        resData?.data?.gateway?.payment_session_id ||
        resData?.data?.gateway?.paymentSessionId;

      // Cashfree PG payment_session_id strictly starts with "session_"
      const isValidCashfreeSession =
        typeof rawSessionId === "string" &&
        rawSessionId.trim().startsWith("session_");

      if (isValidCashfreeSession) {
        try {
          // Initialize Cashfree JS SDK in sandbox mode
          const cashfree = await load({ mode: "sandbox" });
          await cashfree.checkout({
            paymentSessionId: rawSessionId.trim(),
            redirectTarget: "_modal"
          });
        } catch (checkoutErr) {
          console.error("Cashfree checkout error:", checkoutErr);
        }
      }

      toast.success(`Payment request of ₹${Number(paymentAmount).toLocaleString()} created successfully!`);

      handleStageChange(selectedCustomer.id, "Payment Requested");
      fetchCustomers();
      setPaymentAmount("");
      setPaymentType("processing_fee");
      setActiveModal(null);
    } catch (error) {
      console.error("Failed to process payment:", error);
      const msg = error.response?.data?.message || error.message || "Failed to process payment. Please try again.";
      toast.error(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7fc] text-slate-700 overflow-hidden font-sans w-full">
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden" />
      )}

      {/* Sidebar Component */}
      <Sidebar
        items={sidebarNavigationItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar Header */}
        <Navbar
          activeTab={activeTab}
          notifications={notifications}
          onMarkNotificationsRead={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
          user={{ name: "David Fhone", role: "Loan Operations Manager", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" }}
          onLogout={onLogout || (() => { sessionStorage.clear(); localStorage.clear(); window.location.href = "/login"; })}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Viewport Dynamic Tab Component */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === "Dashboard" && (
            <DashboardTab
              customers={customers}
              onNavigateTab={setActiveTab}
              onSelectCustomer={setSelectedCustomer}
              onOpenModal={setActiveModal}
            />
          )}

          {activeTab === "Customer Onboarding" && (
            <CustomerOnboardingTab
              customers={customers}
              loading={loadingCustomers}
              onRefresh={fetchCustomers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onStageChange={handleStageChange}
              onSelectCustomer={setSelectedCustomer}
              onOpenModal={setActiveModal}
              onOpenEditModal={handleOpenEditModal}
              onSetPaymentAmount={setPaymentAmount}
              onCustomerClick={handleViewCustomerDetails}
            />
          )}

          {activeTab === "Loan Applications" && (
            <LoanApplicationsTab
              applications={applications}
              customers={customers}
              onSelectCustomer={setSelectedCustomer}
              onSetPaymentAmount={setPaymentAmount}
              onOpenModal={setActiveModal}
            />
          )}
        </div>
      </main>

      {/* Modals Layer */}
      {activeModal === "register" && (
        <RegisterCustomerModal
          newCustForm={newCustForm}
          setNewCustForm={setNewCustForm}
          onSubmit={handleRegisterCustomer}
          onClose={() => {
            setActiveModal(null);
            setNewCustForm(INITIAL_CUSTOMER_FORM);
          }}
          loading={registerLoading}
        />
      )}

      {activeModal === "editCustomer" && (
        <EditCustomerModal
          editCustForm={editCustForm}
          setEditCustForm={setEditCustForm}
          onSubmit={handleUpdateCustomer}
          onClose={() => {
            setActiveModal(null);
            setEditCustForm(INITIAL_CUSTOMER_FORM);
          }}
          loading={updateLoading}
          customerId={selectedCustomer?.id || selectedCustomer?.referenceId || editingCustomerId}
        />
      )}

      {activeModal === "docUpload" && (
        <CustomerDocumentsModal
          selectedCustomer={selectedCustomer}
          onClose={() => setActiveModal(null)}
          onUploadSuccess={fetchCustomers}
        />
      )}

      {activeModal === "notify" && (
        <SendNotificationModal
          selectedCustomer={selectedCustomer}
          notificationMsg={notificationMsg}
          setNotificationMsg={setNotificationMsg}
          onSubmit={handleSendNotification}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "payment" && (
        <GeneratePaymentModal
          selectedCustomer={selectedCustomer}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          onSubmit={handleGeneratePayment}
          onClose={() => setActiveModal(null)}
          loading={paymentLoading}
        />
      )}

      {/* Customer Full Details Modal */}
      <CustomerDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailCustomer(null);
        }}
        customer={detailCustomer}
        loading={detailLoading}
        onOpenEdit={(cust) => {
          setIsDetailModalOpen(false);
          handleOpenEditModal(cust);
        }}
        onSeeDocs={(cust) => {
          setIsDetailModalOpen(false);
          setSelectedCustomer(cust);
          setActiveModal("docUpload");
        }}
        onManageDocs={(cust) => {
          setIsDetailModalOpen(false);
          setSelectedCustomer(cust);
          setActiveModal("docUpload");
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
        onPaymentUpdated={fetchCustomers}
      />
    </div>
  );
}

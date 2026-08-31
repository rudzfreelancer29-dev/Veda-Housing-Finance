import React, { useState } from "react";
import { LayoutDashboard, Users, FileText } from "lucide-react";

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
  ManageDocumentsModal,
  SendNotificationModal,
  GeneratePaymentModal
} from "./ManagerModals";

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
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'register' | 'docUpload' | 'notify' | 'payment'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [newCustForm, setNewCustForm] = useState({ name: "", mobile: "", email: "", pan: "", aadhaar: "", loanReq: "" });
  const [notificationMsg, setNotificationMsg] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("Processing Fee");

  // Notifications list
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Customer Rahul Sharma uploaded new documents", read: false },
    { id: 2, text: "Payment request pending for App #APP-503", read: false }
  ]);

  // Sidebar navigation configuration
  const sidebarNavigationItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Customer Onboarding", icon: Users },
    { name: "Loan Applications", icon: FileText }
  ];

  // Handler functions
  const handleRegisterCustomer = (e) => {
    e.preventDefault();
    if (!newCustForm.name || !newCustForm.mobile) return;
    const newId = `CUST-${100 + customers.length + 1}`;
    const newCust = {
      id: newId,
      name: newCustForm.name,
      mobile: newCustForm.mobile,
      email: newCustForm.email,
      pan: newCustForm.pan,
      aadhaar: newCustForm.aadhaar,
      stage: "New Registered",
      documents: [{ name: "PAN Card", status: "Pending" }, { name: "Aadhaar Card", status: "Pending" }],
      loanReq: Number(newCustForm.loanReq) || 1000000
    };
    setCustomers([newCust, ...customers]);
    setApplications([
      { id: `APP-${500 + applications.length + 1}`, customerId: newId, customerName: newCustForm.name, amount: newCust.loanReq, stage: "New Registered", date: new Date().toISOString().split("T")[0] },
      ...applications
    ]);
    setNewCustForm({ name: "", mobile: "", email: "", pan: "", aadhaar: "", loanReq: "" });
    setActiveModal(null);
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

  const handleGeneratePayment = (e) => {
    e.preventDefault();
    if (selectedCustomer) {
      handleStageChange(selectedCustomer.id, "Payment Requested");
      alert(`Payment request of ₹${paymentAmount} (${paymentType}) generated for ${selectedCustomer.name}`);
    }
    setPaymentAmount("");
    setActiveModal(null);
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
          actionLabel={activeTab === "Customer Onboarding" ? "+ Register Customer" : ""}
          onActionClick={() => setActiveModal("register")}
          notifications={notifications}
          onMarkNotificationsRead={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
          user={{ name: "David Fhone", role: "Loan Operations Manager", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" }}
          onLogout={onLogout || (() => window.location.href = "/login")}
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
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onStageChange={handleStageChange}
              onSelectCustomer={setSelectedCustomer}
              onOpenModal={setActiveModal}
              onSetPaymentAmount={setPaymentAmount}
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
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "docUpload" && (
        <ManageDocumentsModal
          selectedCustomer={selectedCustomer}
          onClose={() => setActiveModal(null)}
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
        />
      )}
    </div>
  );
}

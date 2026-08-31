import React, { useState } from "react";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    FileText,
    BarChart3,
    History
} from "lucide-react";

// Import Generic Shared Components
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Import Modular Tab Components
import DashboardTab from "./DashboardTab";
import ManagerManagementTab from "./ManagerManagementTab";
import CustomersTab from "./CustomersTab";
import LoanApplicationsTab from "./LoanApplicationsTab";
import ReportsAnalyticsTab from "./ReportsAnalyticsTab";
import AuditLogsTab from "./AuditLogsTab";

// Import Modular Modal Components
import ManagerModal from "./ManagerModal";
import ManagerCustomersModal from "./ManagerCustomersModal";

// Initial Mock Data
const INITIAL_MANAGERS = [
    { id: 1, name: "John Smith", email: "ashnafit@gmail.com", role: "Law", status: "active", applications: 18, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" },
    { id: 2, name: "David Fhone", email: "derlineki@gmail.com", role: "Manager", status: "active", applications: 36, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" },
    { id: 3, name: "Ademrt Boim", email: "jmoroar@gmail.com", role: "Manager", status: "inactive", applications: 10, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" },
    { id: 4, name: "Saim Smith", email: "ainnaer@gmail.com", role: "Manager", status: "inactive", applications: 10, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" },
    { id: 5, name: "Biaton Naera", email: "suarne@gmail.com", role: "Law", status: "active", applications: 13, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" },
    { id: 6, name: "Edwars Rath", email: "sarason@gmail.com", role: "Manager", status: "active", applications: 31, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100" },
    { id: 7, name: "John Smith", email: "joneon@gmail.com", role: "Manager", status: "inactive", applications: 9, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" },
    { id: 8, name: "John Smith", email: "parson@gmail.com", role: "Law", status: "inactive", applications: 8, avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=100" }
];

const INITIAL_AUDIT_LOGS = [
    { id: 1, timestamp: "Nov 17, 2021 12:32:43 PM", manager: "Admin", action: "Action", details: "Active Application Manager" },
    { id: 2, timestamp: "Mar 17, 2021 12:32:45 PM", manager: "Admin", action: "Deactivate", details: "Performed to low Manager" },
    { id: 3, timestamp: "Mar 17, 2021 12:32:55 PM", manager: "Admin", action: "Action", details: "Loan manager details" },
    { id: 4, timestamp: "Mar 17, 2021 12:32:58 PM", manager: "Eaw", action: "Deactivate", details: "Performing details" },
    { id: 5, timestamp: "Mar 17, 2021 12:33:53 PM", manager: "Edren", action: "Action", details: "Application details" },
    { id: 6, timestamp: "Mar 17, 2021 12:33:53 PM", manager: "Enren", action: "Action", details: "Performing details" },
    { id: 7, timestamp: "Mar 17, 2021 12:35:52 PM", manager: "Euren", action: "Action", details: "Performed to our Manager" }
];

const INITIAL_CUSTOMERS = [
    { id: "CUST-9021", name: "Rahul Sharma", mobile: "9876543210", email: "rahul@gmail.com", dob: "1990-05-15", pan: "ABCDE1234F", aadhaar: "1234 5678 9012", income: 65000, loanReq: 1500000, status: "Under Review" },
    { id: "CUST-4432", name: "Priya Patel", mobile: "9812345678", email: "priya.p@gmail.com", dob: "1994-08-22", pan: "FGHIJ5678K", aadhaar: "9876 5432 1098", income: 85000, loanReq: 2500000, status: "Eligible" },
    { id: "CUST-1092", name: "Amit Kumar", mobile: "9988776655", email: "amit.k@gmail.com", dob: "1988-12-01", pan: "LMNOP9012Q", aadhaar: "4567 8901 2345", income: 45000, loanReq: 800000, status: "New Registration" },
    { id: "CUST-7782", name: "Sneha Reddy", mobile: "9123450987", email: "sneha.r@gmail.com", dob: "1992-03-10", pan: "RSTUV3456W", aadhaar: "5678 9012 3456", income: 120000, loanReq: 5000000, status: "Payment Completed" },
    { id: "CUST-5511", name: "Vikram Malhotra", mobile: "9555111222", email: "vikram.m@gmail.com", dob: "1987-11-20", pan: "JKLMN4567P", aadhaar: "6543 2109 8765", income: 95000, loanReq: 3000000, status: "Under Review" },
    { id: "CUST-8833", name: "Ananya Rao", mobile: "9888333444", email: "ananya.r@gmail.com", dob: "1995-02-14", pan: "OPQRS8901T", aadhaar: "8765 4321 0987", income: 75000, loanReq: 1800000, status: "Under Review" },
    { id: "CUST-2233", name: "Rajesh Gupta", mobile: "9222333444", email: "rajesh.g@gmail.com", dob: "1982-06-25", pan: "UVWXY2345Z", aadhaar: "3456 7890 1234", income: 110000, loanReq: 4000000, status: "Approved" },
    { id: "CUST-6677", name: "Meera Nair", mobile: "9666777888", email: "meera.n@gmail.com", dob: "1991-09-05", pan: "ABCDE9876G", aadhaar: "9012 3456 7890", income: 55000, loanReq: 1200000, status: "Rejected" }
];

const INITIAL_APPLICATIONS = [
    { id: "APP-301", customerId: "CUST-9021", customerName: "Rahul Sharma", amount: 1500000, manager: "David Fhone", status: "Under Review", date: "2026-08-20" },
    { id: "APP-302", customerId: "CUST-4432", customerName: "Priya Patel", amount: 2500000, manager: "John Smith", status: "Eligible", date: "2026-08-22" },
    { id: "APP-303", customerId: "CUST-1092", customerName: "Amit Kumar", amount: 800000, manager: "Biaton Naera", status: "New Registration", date: "2026-08-25" },
    { id: "APP-304", customerId: "CUST-7782", customerName: "Sneha Reddy", amount: 5000000, manager: "Edwars Rath", status: "Payment Completed", date: "2026-08-26" },
    { id: "APP-305", customerId: "CUST-5511", customerName: "Vikram Malhotra", amount: 3000000, manager: "Ademrt Boim", status: "Under Review", date: "2026-08-26" },
    { id: "APP-306", customerId: "CUST-8833", customerName: "Ananya Rao", amount: 1800000, manager: "Saim Smith", status: "Under Review", date: "2026-08-27" },
    { id: "APP-307", customerId: "CUST-2233", customerName: "Rajesh Gupta", amount: 4000000, manager: "David Fhone", status: "Approved", date: "2026-08-27" },
    { id: "APP-308", customerId: "CUST-6677", customerName: "Meera Nair", amount: 1200000, manager: "John Smith", status: "Rejected", date: "2026-08-28" }
];

export default function Admin() {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [managers, setManagers] = useState(INITIAL_MANAGERS);
    const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
    const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
    const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

    // Search & Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeManagerFilter, setActiveManagerFilter] = useState("all");
    const [selectedManagers, setSelectedManagers] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedManagerForPortfolio, setSelectedManagerForPortfolio] = useState(null);

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
    const [editingManager, setEditingManager] = useState(null);

    // Forms state
    const [managerForm, setManagerForm] = useState({ name: "", email: "", role: "Manager", status: "active", applications: 0 });

    // Notifications state
    const [notifications, setNotifications] = useState([
        { id: 1, text: "New manager account pending approval", read: false },
        { id: 2, text: "Loan status change: App #301 under review", read: true }
    ]);

    // Settings Configuration State
    const [processingFee, setProcessingFee] = useState("1000");
    const [customFees, setCustomFees] = useState([
        { id: 1, name: "Document Verification Fee", amount: "500" },
        { id: 2, name: "Legal Assessment Fee", amount: "1200" }
    ]);
    const [newFeeName, setNewFeeName] = useState("");
    const [newFeeAmount, setNewFeeAmount] = useState("");

    // Helper log generator
    const addAuditLog = (manager, action, details) => {
        const newLog = {
            id: auditLogs.length + 1,
            timestamp: new Date().toLocaleString(),
            manager,
            action,
            details
        };
        setAuditLogs([newLog, ...auditLogs]);
    };

    // Manager Actions
    const handleSaveManager = (e) => {
        e.preventDefault();
        if (!managerForm.name || !managerForm.email) {
            alert("Name and Email are required");
            return;
        }

        if (modalMode === "add") {
            const newManager = {
                id: managers.length + 1,
                ...managerForm,
                avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=100`
            };
            setManagers([newManager, ...managers]);
            addAuditLog("Admin", "Create", `Created manager account: ${newManager.name}`);
        } else {
            setManagers(managers.map(m => m.id === editingManager.id ? { ...m, ...managerForm } : m));
            addAuditLog("Admin", "Update", `Updated manager account: ${managerForm.name}`);
        }
        setIsModalOpen(false);
    };

    const handleEditManagerClick = (manager) => {
        setModalMode("edit");
        setEditingManager(manager);
        setManagerForm({
            name: manager.name,
            email: manager.email,
            role: manager.role,
            status: manager.status,
            applications: manager.applications
        });
        setIsModalOpen(true);
    };

    const handleDeleteManager = (id, name) => {
        if (window.confirm(`Are you sure you want to delete manager "${name}"?`)) {
            setManagers(managers.filter(m => m.id !== id));
            setSelectedManagers(selectedManagers.filter(item => item !== id));
            addAuditLog("Admin", "Delete", `Deleted manager account: ${name}`);
        }
    };

    const handleToggleManagerStatus = (id, currentStatus, name) => {
        const nextStatus = currentStatus === "active" ? "inactive" : "active";
        setManagers(managers.map(m => m.id === id ? { ...m, status: nextStatus } : m));
        addAuditLog("Admin", nextStatus === "active" ? "Action" : "Deactivate", `${nextStatus === "active" ? "Activated" : "Deactivated"} manager: ${name}`);
    };



    // Applications Staging status & assignment
    const handleAssignAppManager = (appId, managerName) => {
        setApplications(applications.map(app => app.id === appId ? { ...app, manager: managerName } : app));
        addAuditLog("Admin", "Assign Manager", `Assigned ${managerName} to App ${appId}`);
    };

    const handleUpdateAppStatus = (appId, newStatus) => {
        setApplications(applications.map(app => {
            if (app.id === appId) {
                setCustomers(customers.map(c => c.id === app.customerId ? { ...c, status: newStatus } : c));
                return { ...app, status: newStatus };
            }
            return app;
        }));
        addAuditLog("Admin", "Status Change", `Updated App ${appId} status to: ${newStatus}`);
    };

    // Settings configs
    const handleUpdateProcessingFee = () => {
        alert(`Processing Fee updated to ₹${processingFee}`);
        addAuditLog("Admin", "Settings", `Updated Default Processing Fee to: ₹${processingFee}`);
    };

    const handleAddFee = (e) => {
        e.preventDefault();
        if (!newFeeName || !newFeeAmount) return;
        setCustomFees([...customFees, { id: customFees.length + 1, name: newFeeName, amount: newFeeAmount }]);
        setNewFeeName("");
        setNewFeeAmount("");
        addAuditLog("Admin", "Settings", `Configured new custom fee: ${newFeeName}`);
    };

    const handleRemoveFee = (id, name) => {
        setCustomFees(customFees.filter(f => f.id !== id));
        addAuditLog("Admin", "Settings", `Removed custom fee: ${name}`);
    };

    // Sidebar dynamic tabs list configuration
    const sidebarNavigationItems = [
        { name: "Dashboard", icon: LayoutDashboard },
        { name: "Manager Management", icon: Users },
        { name: "Customers", icon: UserCheck },
        { name: "Loan Applications", icon: FileText },
        { name: "Reports & Analytics", icon: BarChart3 },
        { name: "Audit Logs", icon: History }
    ];

    // Contextual action button & search input configurations for Header
    let headerActionLabel = "";
    let headerOnActionClick = null;
    if (activeTab === "Manager Management") {
        headerActionLabel = "Add Manager";
        headerOnActionClick = () => {
            setModalMode("add");
            setManagerForm({ name: "", email: "", role: "Manager", status: "active", applications: 0 });
            setIsModalOpen(true);
        };
    }

    return (
        <div className="flex h-screen bg-[#f4f7fc] text-slate-700 overflow-hidden font-sans w-full">

            {/* Backdrop overlay for mobile */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
                />
            )}

            {/* Sidebar layouts */}
            <Sidebar
                items={sidebarNavigationItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onTabChange={() => {
                    setCurrentPage(1);
                    setSearchQuery("");
                }}
            />

            {/* Main content viewport */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header/Navbar Toolbar */}
                <Navbar
                    activeTab={activeTab}
                    actionLabel={headerActionLabel}
                    onActionClick={headerOnActionClick}
                    notifications={notifications}
                    onMarkNotificationsRead={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    onLogout={() => alert("Logging out (Mock)")}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Dynamic subcomponents route switch */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-2 md:p-2">
                    {/* Workspace Page Header Title */}
                    <div className="mb-6 sm:hidden">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{activeTab}</h1>
                        <p className="text-xs text-slate-400 mt-1">Veda Housing Finance • Administrator Control</p>
                    </div>

                    {activeTab === "Dashboard" && (
                        <DashboardTab
                            applications={applications}
                            managers={managers}
                            auditLogs={auditLogs}
                            customers={customers}
                        />
                    )}

                    {activeTab === "Manager Management" && (
                        <ManagerManagementTab
                            managers={managers}
                            onEdit={handleEditManagerClick}
                            onDelete={handleDeleteManager}
                            onToggleStatus={handleToggleManagerStatus}
                            auditLogs={auditLogs}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            activeManagerFilter={activeManagerFilter}
                            setActiveManagerFilter={setActiveManagerFilter}
                            selectedManagers={selectedManagers}
                            setSelectedManagers={setSelectedManagers}
                            onManagerClick={(manager) => {
                                console.log("onManagerClick triggered in admin.jsx for:", manager);
                                setSelectedManagerForPortfolio(manager);
                            }}
                        />
                    )}

                    {activeTab === "Customers" && (
                        <CustomersTab
                            customers={customers}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            applications={applications}
                            onUpdateAppStatus={handleUpdateAppStatus}
                        />
                    )}

                    {activeTab === "Loan Applications" && (
                        <LoanApplicationsTab
                            applications={applications}
                            managers={managers}
                            onAssignManager={handleAssignAppManager}
                            onUpdateAppStatus={handleUpdateAppStatus}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    )}

                    {activeTab === "Reports & Analytics" && (
                        <ReportsAnalyticsTab customers={customers} applications={applications} />
                    )}

                    {activeTab === "Audit Logs" && (
                        <AuditLogsTab auditLogs={auditLogs} searchQuery={searchQuery} />
                    )}


                </div>
            </main>

            {/* Modal overlays */}
            <ManagerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveManager}
                modalMode={modalMode}
                managerForm={managerForm}
                setManagerForm={setManagerForm}
            />

            {/* Manager's Customers Portfolio Modal */}
            {selectedManagerForPortfolio && (
                <ManagerCustomersModal
                    manager={selectedManagerForPortfolio}
                    onClose={() => setSelectedManagerForPortfolio(null)}
                    applications={applications}
                    customers={customers}
                    onUpdateAppStatus={handleUpdateAppStatus}
                />
            )}
        </div>
    );
}

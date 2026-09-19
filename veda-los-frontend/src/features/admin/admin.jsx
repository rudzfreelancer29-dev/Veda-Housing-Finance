import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    FileText,
    BarChart3,
    History,
    Lock,
    Unlock,
    Trash2
} from "lucide-react";
import { toast } from "react-toastify";

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
import NotificationModal from "./NotificationModal";
import apiService from "../../services/api-service";

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

export default function Admin({ onLogout }) {
    const [activeTab, setActiveTab] = useState("Dashboard");
    const [managers, setManagers] = useState(INITIAL_MANAGERS);
    const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

    // Fetch Managers from API
    const fetchManagers = async () => {
        try {
            const response = await apiService.getManagers();
            const rawData = response.data;
            const dataArray = Array.isArray(rawData)
                ? rawData
                : (rawData?.data || rawData?.managers || []);

            if (Array.isArray(dataArray) && dataArray.length > 0) {
                const mapped = dataArray.map((m, index) => {
                    const status = m.status
                        ? m.status.toLowerCase()
                        : (m.is_active === true || m.is_active === "true" || m.is_active === 1 ? "active" : "inactive");

                    return {
                        id: m.id || index + 1,
                        name: m.name || m.username || `Manager ${m.id || index + 1}`,
                        email: m.email || "",
                        role: m.role || "Manager",
                        status: status,
                        is_active: m.is_active,
                        created_at: m.created_at,
                        applications: m.applications ?? 0,
                        avatar: m.avatar || ""
                    };
                });
                setManagers(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch managers from API:", error);
        }
    };

    // Fetch All Customers from API (Super Admin)
    const fetchCustomers = async (search = "") => {
        setLoadingCustomers(true);
        try {
            const response = await apiService.GetAllCustomers(search ? search.trim() : "");
            const rawData = response.data;
            const dataArray = Array.isArray(rawData)
                ? rawData
                : (rawData?.data || rawData?.customers || []);

            if (Array.isArray(dataArray)) {
                const mapped = dataArray.map((item, index) => {
                    let status = "Under Review";
                    if (item.application_status) {
                        const s = item.application_status.toLowerCase().replace(/_/g, " ");
                        status = s.replace(/\b\w/g, l => l.toUpperCase());
                    } else if (item.status) {
                        status = item.status;
                    }

                    const incomeVal = item.monthly_income && !isNaN(Number(item.monthly_income))
                        ? Number(item.monthly_income)
                        : (item.income || 0);

                    const loanReqVal = item.loan_requirement_details || (incomeVal > 0 ? incomeVal * 10 : "");

                    return {
                        id: item.reference_id || (item.id ? `CUST-${item.id}` : `CUST-${index + 1}`),
                        rawId: item.id,
                        referenceId: item.reference_id,
                        name: item.full_name || item.name || `Customer ${index + 1}`,
                        fullName: item.full_name || item.name || "",
                        mobile: item.mobile_number || item.mobile || "-",
                        mobileNumber: item.mobile_number || item.mobile || "-",
                        email: item.email || "-",
                        dob: item.date_of_birth ? (typeof item.date_of_birth === "string" && item.date_of_birth.includes("T") ? item.date_of_birth.split("T")[0] : item.date_of_birth) : "-",
                        pan: item.pan_number || item.pan || "-",
                        aadhaar: item.aadhaar_number || item.aadhaar || "-",
                        employment: item.employment_details || item.employment || "-",
                        income: incomeVal,
                        loanReq: loanReqVal,
                        loanRequirementDetails: item.loan_requirement_details || "",
                        status: status,
                        manager: item.registered_by_name || item.manager || "Unassigned",
                        registeredByName: item.registered_by_name || "",
                        createdBy: item.created_by,
                        createdAt: item.created_at,
                        applicationId: item.application_id,
                        documents: [
                            { name: "Aadhaar Card", type: "aadhaar", status: item.aadhaar_number ? "Verified" : "Pending", verified: !!item.aadhaar_number },
                            { name: "PAN Card", type: "pan", status: item.pan_number ? "Verified" : "Pending", verified: !!item.pan_number },
                            { name: "Income Proof / Salary Slip", type: "income", status: incomeVal > 0 ? "Verified" : "Pending", verified: incomeVal > 0 }
                        ]
                    };
                });
                setCustomers(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch customers from API:", error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    // Fetch Notifications from API (Filter out read notifications)
    const fetchNotifications = async () => {
        try {
            const response = await apiService.GetNotifications();
            const rawData = response.data;
            const dataArray = Array.isArray(rawData)
                ? rawData
                : (rawData?.data || rawData?.notifications || []);

            if (Array.isArray(dataArray)) {
                // Filter out already read notifications (is_read: true or read: true)
                const unreadList = dataArray.filter(item => {
                    const isRead = item.is_read === true || item.is_read === 1 || item.is_read === "true" || item.read === true || item.read === 1 || item.read === "true";
                    return !isRead;
                });

                const mapped = unreadList.map((item, index) => ({
                    id: item.id || index + 1,
                    text: item.text || item.message || item.title || item.details || "New Notification",
                    read: false,
                    is_read: false,
                    createdAt: item.created_at || item.createdAt || item.timestamp || null,
                    raw: item
                }));
                setNotifications(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch notifications from API:", error);
        }
    };

    // Mark single notification as read & remove from frontend list
    const handleReadNotification = async (id) => {
        try {
            await apiService.ReadNotificationsById(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success("Notification marked as read");
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Optimistically remove from list on frontend
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }
    };

    // Mark all notifications as read & clear list
    const handleMarkAllNotificationsRead = async () => {
        try {
            setNotifications([]);
            await apiService.ReadAllNotifications();
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            fetchNotifications();
            toast.error(error.response?.data?.message || "Failed to mark all notifications as read");
        }
    };

    useEffect(() => {
        fetchManagers();
        fetchCustomers();
        fetchNotifications();
    }, []);

    // Debounce search query to query the GetAllCustomers API
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(customerSearchQuery);
        }, 350);
        return () => clearTimeout(timer);
    }, [customerSearchQuery]);

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
    const [modalLoading, setModalLoading] = useState(false);

    // Status Update Confirmation Modal State
    const [statusModal, setStatusModal] = useState({
        isOpen: false,
        managerId: null,
        managerName: "",
        currentStatus: "",
        nextStatus: "",
        loading: false
    });

    // Forms state
    const [managerForm, setManagerForm] = useState({ name: "", email: "", password: "", status: "active", applications: 0 });

    // Notifications state
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

    const handleOpenNotificationModal = (notification) => {
        setSelectedNotification(notification);
        setIsNotificationModalOpen(true);
    };

    const handleCloseNotificationModal = () => {
        setIsNotificationModalOpen(false);
        setSelectedNotification(null);
    };

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
    const handleSaveManager = async (e) => {
        e.preventDefault();
        if (!managerForm.name || !managerForm.email) {
            toast.warn("Name and Email are required");
            return;
        }

        if (modalMode === "add") {
            if (!managerForm.password) {
                toast.warn("Password is required for new manager account");
                return;
            }
            if (managerForm.password.length < 8) {
                toast.warn("Password must be at least 8 characters long");
                return;
            }
            setModalLoading(true);
            try {
                const payload = {
                    name: managerForm.name.trim(),
                    email: managerForm.email.trim(),
                    password: managerForm.password
                };
                await apiService.createManagers(payload);
                toast.success(`Manager account created for ${payload.name}!`);
                addAuditLog("Admin", "Create", `Created manager account: ${payload.name}`);
                await fetchManagers();
                setIsModalOpen(false);
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Failed to create manager account. Please try again.";
                toast.error(errorMsg);
            } finally {
                setModalLoading(false);
            }
        } else {
            setModalLoading(true);
            try {
                const payload = {
                    name: managerForm.name.trim(),
                    email: managerForm.email.trim()
                };
                await apiService.updateManager(payload, editingManager.id);
                toast.success(`Manager account updated for ${payload.name}!`);
                addAuditLog("Admin", "Update", `Updated manager account: ${payload.name}`);
                await fetchManagers();
                setIsModalOpen(false);
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Failed to update manager account. Please try again.";
                toast.error(errorMsg);
            } finally {
                setModalLoading(false);
            }
        }
    };

    const handleEditManagerClick = (manager) => {
        setModalMode("edit");
        setEditingManager(manager);
        setManagerForm({
            name: manager.name,
            email: manager.email,
            password: "",
            role: manager.role,
            status: manager.status,
            applications: manager.applications
        });
        setIsModalOpen(true);
    };

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        managerId: null,
        managerName: "",
        loading: false
    });

    const handleDeleteManager = (id, name) => {
        setDeleteModal({
            isOpen: true,
            managerId: id,
            managerName: name,
            loading: false
        });
    };

    const handleConfirmDeleteManager = async () => {
        if (!deleteModal.managerId) return;
        setDeleteModal((prev) => ({ ...prev, loading: true }));
        try {
            await apiService.deleteManager(deleteModal.managerId);
            toast.success(`Manager ${deleteModal.managerName} deleted successfully`);
            setSelectedManagers((prev) => prev.filter((item) => item !== deleteModal.managerId));
            addAuditLog("Admin", "Delete", `Deleted manager account: ${deleteModal.managerName}`);
            await fetchManagers();
            setDeleteModal({ isOpen: false, managerId: null, managerName: "", loading: false });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to delete manager";
            toast.error(errorMsg);
            setDeleteModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleToggleManagerStatus = (id, currentStatus, name) => {
        const nextStatus = currentStatus === "active" ? "inactive" : "active";
        setStatusModal({
            isOpen: true,
            managerId: id,
            managerName: name,
            currentStatus: currentStatus,
            nextStatus: nextStatus,
            loading: false
        });
    };

    const handleConfirmStatusChange = async () => {
        if (!statusModal.managerId) return;
        setStatusModal((prev) => ({ ...prev, loading: true }));
        try {
            const payload = {
                is_active: statusModal.nextStatus === "active",
                status: statusModal.nextStatus
            };
            await apiService.updateManagerStatus(payload, statusModal.managerId);
            toast.success(`Manager ${statusModal.managerName} status updated to ${statusModal.nextStatus}!`);
            addAuditLog("Admin", statusModal.nextStatus === "active" ? "Action" : "Deactivate", `${statusModal.nextStatus === "active" ? "Activated" : "Deactivated"} manager: ${statusModal.managerName}`);
            await fetchManagers();
            setStatusModal({ isOpen: false, managerId: null, managerName: "", currentStatus: "", nextStatus: "", loading: false });
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to update manager status. Please try again.";
            toast.error(errorMsg);
            setStatusModal((prev) => ({ ...prev, loading: false }));
        }
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
            setManagerForm({ name: "", email: "", password: "", status: "active", applications: 0 });
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
                    onNotificationClick={handleOpenNotificationModal}
                    onReadNotification={handleReadNotification}
                    onMarkNotificationsRead={handleMarkAllNotificationsRead}
                    onLogout={onLogout || (() => { sessionStorage.clear(); localStorage.clear(); window.location.href = "/login"; })}
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
                            loading={loadingCustomers}
                            onRefresh={() => fetchCustomers(customerSearchQuery)}
                            searchQuery={customerSearchQuery}
                            setSearchQuery={setCustomerSearchQuery}
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
                loading={modalLoading}
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

            {/* Status Update Confirmation Modal */}
            {statusModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusModal.nextStatus === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                                {statusModal.nextStatus === "active" ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Confirm Status Update
                                </h3>
                                <p className="text-xs text-slate-500">Manager Account Status</p>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                            Are you sure you want to change status for <strong className="text-slate-800 font-bold">{statusModal.managerName}</strong> to{" "}
                            <span className={`font-bold uppercase ${statusModal.nextStatus === "active" ? "text-emerald-600" : "text-amber-600"}`}>
                                {statusModal.nextStatus}
                            </span>?
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setStatusModal({ isOpen: false, managerId: null, managerName: "", currentStatus: "", nextStatus: "", loading: false })}
                                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={statusModal.loading}
                                onClick={handleConfirmStatusChange}
                                className={`py-2 px-4 text-xs font-semibold text-white rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer ${statusModal.nextStatus === "active" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`}
                            >
                                {statusModal.loading ? (
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span>Confirm Update</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Confirm Delete Manager
                                </h3>
                                <p className="text-xs text-slate-500">Delete Manager Account</p>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                            Are you sure you want to delete manager <strong className="text-slate-800 font-bold">{deleteModal.managerName}</strong>? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, managerId: null, managerName: "", loading: false })}
                                className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteModal.loading}
                                onClick={handleConfirmDeleteManager}
                                className="py-2 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                            >
                                {deleteModal.loading ? (
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span>Delete Manager</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Notification Details Modal */}
            <NotificationModal
                isOpen={isNotificationModalOpen}
                notification={selectedNotification}
                onClose={handleCloseNotificationModal}
                onMarkAsRead={handleReadNotification}
            />
        </div>
    );
}

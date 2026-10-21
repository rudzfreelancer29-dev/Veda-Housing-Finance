export const environment = {
    CRMService_API: (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || 'https://dhanicapfinance.onrender.com/api/',
    
    //Auth
    Login: 'auth/login',
    AuthMe: 'auth/me',
    ForgotPassword: 'auth/forgot-password',
    ResetPassword: 'auth/reset-password',
    ChangePassword: 'auth/change-password',

    //Admin - Manager
    GetManagers: 'managers/',
    CreateManagers: 'managers/',
    UpdateManager: 'managers/',
    UpdateManagerStatus: 'managers/',
    DeleteManager: 'managers/',
    GetAllCustomers: 'customers/',
    GetCustomerById: 'customers/',
    DeleteCustomer: 'customers/',
    

    //Manager - customer
    RegisterCustomer: 'customers',
    GetManagersCustomer: 'my/customers',
    UpdateCustomer: 'customers/',
    GetManagersCustomerById: 'customers/',

    SendCustomMessage: 'customers/',

    //Document management
    UploadCustomerDocument: 'documents/upload/',
    GetCustomerDocuments: 'documents/',
    DeleteDocuments: 'documents/',

    //Status Management (Admin only)
    UpdateCustomerApplicationStatus: 'applications/',

    //Status Management (Manager)
    UpdateCustomerStatus: 'my/applications/',


    //Payment Management
    ManagersPaymentRequest: 'payments',
    GetPaymentHistory: 'payments/',
    VerifyPayment: 'payments/verify',
    UpdatePaymentStatus: 'payments/',//yet to bind


    //Dashboard Reports
    GetAdminDashboard: 'reports/dashboard',

    GetTotalRegistrations: 'reports/registrations',
    PaymentsSummary: 'reports/payments-summary',
    GetEligibilityStats: 'reports/eligibility-stats',
    GetAuditLogs: 'audit-logs',
    GetNotifications: 'notifications',
    ReadNotificationsById: 'notifications/',
    ReadAllNotifications: 'notifications/read-all',
    

    //Download EXCEL reports
    DownloadAdminReports: 'reports/export'

 



    
}
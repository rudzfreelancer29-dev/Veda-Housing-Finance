export const environment = {
    CRMService_API: 'https://dhanicapfinance.onrender.com/api/auth/login',
    
    //Auth
    Login: 'auth/login',
    AuthMe: 'auth/me',
    ForgotPassword: 'auth/forgot-password',
    ResetPassword: 'auth/reset-password',

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

    //Document management
    UploadCustomerDocument: 'documents/upload/',
    GetCustomerDocuments: 'documents/',
    DeleteDocuments: 'documents/',

    //Status Management (Admin only)
    UpdateCustomerApplicationStatus: 'applications/',

    //Status Management (Manager)
    UpdateCustomerStatus: 'my/applications/',


    //Patment Managemant
    ManagersPaymentRequest: 'payments',
    GetPaymentHistory: 'payments/',
    
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
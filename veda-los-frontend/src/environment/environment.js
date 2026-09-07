export const environment = {
    CRMService_API: 'http://localhost:5000/api/',
    
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



    
}
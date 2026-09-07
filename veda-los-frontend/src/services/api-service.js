import axios from "axios";
import { environment } from "../environment/environment";

// Add interceptor to automatically attach Authorization header if token exists in localStorage
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

class ApiService {
    //Auth apis
    login(data) {
        return axios.post(environment.CRMService_API + environment.Login, data);
    }

    authMe() {
        return axios.get(environment.CRMService_API + environment.AuthMe);
    }

    forgotPassword(data) {
        return axios.post(environment.CRMService_API + environment.ForgotPassword, data);
    }

    resetPassword(data) {
        return axios.post(environment.CRMService_API + environment.ResetPassword, data);
    }

    //Admin-managers
    getManagers(){
        return axios.get(environment.CRMService_API + environment.GetManagers);
    }

    createManagers(data){
        return axios.post(environment.CRMService_API + environment.CreateManagers, data);
    }

    updateManager(data, id) {
        return axios.put(environment.CRMService_API + environment.UpdateManager + id, data);
    }

    updateManagerStatus(data, id) {
        return axios.put(environment.CRMService_API + environment.UpdateManagerStatus + id + "/status", data);
    }

    deleteManager(id){
        return axios.delete(environment.CRMService_API + environment.DeleteManager + id);
    }

    GetAllCustomers(search){
        const config = search ? { params: { search } } : {};
        return axios.get(environment.CRMService_API + environment.GetAllCustomers, config);
    }

    GetCustomerById(id){
        return axios.get(`${environment.CRMService_API}${environment.GetCustomerById}${id}`);
    }

    DeleteCustomer(id){
        return axios.delete(`${environment.CRMService_API}${environment.DeleteCustomer}${id}`);
    }

   

    //Managers-Customers
    registerCustomer(data){
        return axios.post(environment.CRMService_API + environment.RegisterCustomer, data);
    }

    getManagersCustomer(){
        return axios.get(environment.CRMService_API + environment.GetManagersCustomer);
    }
    updateCustomer(data,id) {
        return axios.put(environment.CRMService_API + environment.UpdateCustomer + id, data);
    }
    GetManagersCustomerById(id){
        return axios.get(`${environment.CRMService_API}${environment.GetManagersCustomerById}${id}`);
    }

    //document management
    UploadCustomerDocument(data) {
        return axios.post(environment.CRMService_API + environment.UploadCustomerDocument, data);
    }
    GetCustomerDocuments(customerId){
        return axios.get(`${environment.CRMService_API}${environment.GetCustomerDocuments}${customerId}`);
    }
    DeleteCustomerDocument(documentId){
        return axios.delete(`${environment.CRMService_API}${environment.DeleteDocuments}${documentId}`);
    }
}

export default new ApiService();


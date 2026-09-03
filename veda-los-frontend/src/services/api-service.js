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
    login(data) {
        return axios.post(environment.CRMService_API + environment.Adminlogin, data);
    }
}

export default new ApiService();

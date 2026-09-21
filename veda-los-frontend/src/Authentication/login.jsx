import React, { useState } from "react";
import PropTypes from "prop-types";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, X, Send, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import loginImg from "../assets/login_page_img.webp";
import logo from "../assets/Dhanicap_Logo.png";
import apiService from "../services/api-service"; // Prefer pre-instantiated singleton

const ROLES = ["Admin", "Manager"];

export default function Login({ onLogin, onNavigateRegister, onForgotPassword }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "Admin",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState({});

    // Forgot Password Modal State
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotEmailError, setForgotEmailError] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (errorMessage) setErrorMessage(""); // Clear error when user types
    };

    const validateForm = () => {
        const newErrors = {};
        const emailTrimmed = formData.email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailTrimmed) {
            newErrors.email = "Email address is required.";
        } else if (!emailRegex.test(emailTrimmed)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            toast.warn(firstError);
            return false;
        }
        return true;
    };

    const handleRoleClick = (role) => {
        // if (role === "Customer") {
        //     toast.info("Customer portal is under development. Please log in as Admin or Manager.");
        //     return;
        // }
        handleChange("role", role);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            // Pass full payload including role and rememberMe
            const response = await apiService.login({
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role,
                rememberMe: formData.rememberMe,
            });

            // Verify account role against selected portal role if returned by backend API
            const rawRole = response.data?.role || response.data?.user?.role || response.data?.data?.role;

            if (rawRole) {
                const isResponseAdmin = rawRole.toLowerCase().includes("admin");
                const isResponseManager = rawRole.toLowerCase().includes("manager");
                const isSelectedAdmin = formData.role.toLowerCase() === "admin";
                const isSelectedManager = formData.role.toLowerCase() === "manager";

                if ((isSelectedAdmin && !isResponseAdmin) || (isSelectedManager && !isResponseManager)) {
                    const errorMsg = "Invalid Credentials";
                    setErrorMessage(errorMsg);
                    toast.error(errorMsg);
                    return;
                }
            }

            // Store auth token and user details in sessionStorage (tab-isolated) and localStorage if rememberMe is enabled
            if (response.data?.token) {
                const expiry = (Date.now() + 8 * 60 * 60 * 1000).toString();
                sessionStorage.setItem("token", response.data.token);
                sessionStorage.setItem("token_expiry", expiry);
                if (formData.rememberMe) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("token_expiry", expiry);
                }
            }
            if (response.data?.user) {
                const userStr = JSON.stringify(response.data.user);
                sessionStorage.setItem("user", userStr);
                if (formData.rememberMe) {
                    localStorage.setItem("user", userStr);
                }
            }

            toast.success(`${formData.role} login successful! Redirecting...`, {
                autoClose: 2000,
            });

            setTimeout(() => {
                toast.dismiss();
                if (onLogin) {
                    onLogin({
                        ...(response?.data || {}),
                        role: formData.role,
                    });
                }
            }, 1000);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                `Invalid email or password for ${formData.role} portal. Please try again.`;
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        const emailTrimmed = forgotEmail.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailTrimmed) {
            setForgotEmailError("Email address is required.");
            return;
        }
        if (!emailRegex.test(emailTrimmed)) {
            setForgotEmailError("Please enter a valid email address.");
            return;
        }

        setForgotLoading(true);
        setForgotEmailError("");

        try {
            await apiService.forgotPassword({ email: emailTrimmed });
            toast.success("If that email is registered, a password reset link has been sent");
            setShowForgotPasswordModal(false);
            setForgotEmail("");
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                "Failed to send reset link. Please check your email and try again.";
            setForgotEmailError(msg);
            toast.error(msg);
        } finally {
            setForgotLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-slate-100/80 text-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
                {/* Left Form Section */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                    <div>
                        {/* Brand Logo Header */}
                        <div className="flex items-center gap-3.5 mb-8">
                            <img
                                src={logo}
                                alt="Dhanicap Finance Logo"
                                className="w-24 h-24 object-contain shrink-0"
                            />
                            <div>
                                <span className="font-black text-xl tracking-widest text-[#B38728] block leading-tight">
                                    DHANICAP
                                </span>
                                <span className="block text-[11px] text-[#64748b] font-bold tracking-[0.25em] uppercase">
                                    Finance
                                </span>
                            </div>
                        </div>

                        {/* Form Title & Subtitle */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Sign in to access your Loan Origination Dashboard.
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {/* Role Selection Tabs */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                    Select Portal / Role
                                </label>
                                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60">
                                    {["Admin", "Manager"].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => handleRoleClick(role)}
                                            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${formData.role === role
                                                ? "bg-[#f26e21] text-white shadow-sm"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        placeholder="e.g. name@vedafinance.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className={`w-full bg-slate-50 border ${errors.email
                                            ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
                                            } rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForgotEmail(formData.email || "");
                                            setForgotEmailError("");
                                            setShowForgotPasswordModal(true);
                                        }}
                                        className="text-xs text-[#f26e21] hover:underline font-semibold cursor-pointer"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        className={`w-full bg-slate-50 border ${errors.password
                                            ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
                                            } rounded-xl py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-600 select-none">
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => handleChange("rememberMe", e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-[#f26e21] focus:ring-[#f26e21]"
                                    />
                                    Remember me on this device
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#f26e21] hover:bg-[#e05f13] text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-[#f26e21]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 mt-4 cursor-pointer"
                            >
                                {loading ? (
                                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <span>Sign In to Account</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-500">
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={onNavigateRegister}
                                    className="text-[#f26e21] font-semibold hover:underline cursor-pointer"
                                >
                                    Register
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section with Dark Navy Accent Banner matching Sidebar aesthetic */}
                <div className="lg:col-span-5 bg-[#0a182e] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800 text-slate-300">
                    <div className="relative z-10">

                        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                            Smart Loan Origination & Digital Finance Management
                        </h2>
                    </div>

                    {/* Image Container */}
                    <div className="relative my-6 flex items-center justify-center">
                        <img
                            src={loginImg}
                            alt="Veda Housing Finance Illustration"
                            className="w-full max-h-72 object-contain"
                        />
                    </div>

                    <p className="relative z-10 text-xs text-slate-400 text-center font-medium">
                        Empowering home ownership with seamless digital loan processing.
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
                    onClick={() => setShowForgotPasswordModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#f26e21]/10 flex items-center justify-center text-[#f26e21]">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Forgot Password</h3>
                                <p className="text-xs text-slate-500">Reset your account password</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                            Please enter your registered email address below. We'll send you instructions to reset your password.
                        </p>

                        {/* Form */}
                        <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        placeholder="e.g. name@vedafinance.com"
                                        value={forgotEmail}
                                        onChange={(e) => {
                                            setForgotEmail(e.target.value);
                                            if (forgotEmailError) setForgotEmailError("");
                                        }}
                                        className={`w-full bg-slate-50 border ${forgotEmailError
                                            ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                                            : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
                                            } rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                                        autoFocus
                                    />
                                </div>
                                {forgotEmailError && (
                                    <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        {forgotEmailError}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPasswordModal(false)}
                                    className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="bg-[#f26e21] hover:bg-[#e05f13] text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-[#f26e21]/20 flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                                >
                                    {forgotLoading ? (
                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <span>Send</span>
                                            <Send className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

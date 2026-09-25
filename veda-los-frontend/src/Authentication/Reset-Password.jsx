import React, { useState } from "react";
import PropTypes from "prop-types";
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../assets/Dhanicap_Logo.png";
import apiService from "../services/api-service";

export default function ResetPassword({ onNavigateLogin, token: propToken }) {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState({});

    // Extract token from URL query string if not passed directly as a prop
    const getToken = () => {
        if (propToken) return propToken;
        const params = new URLSearchParams(window.location.search);
        return params.get("token") || "";
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (errorMessage) setErrorMessage("");
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = "New password is required.";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long.";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            toast.warn(firstError);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrorMessage("");

        const resetToken = getToken();

        try {
            await apiService.resetPassword({
                token: resetToken,
                newPassword: formData.password,
            });

            toast.success("Password reset successfully! Redirecting to login...", {
                autoClose: 2000,
            });

            setTimeout(() => {
                toast.dismiss();
                if (onNavigateLogin) {
                    onNavigateLogin();
                } else {
                    window.location.pathname = "/login";
                }
            }, 1500);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Failed to reset password. The link may have expired or is invalid.";
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100/80 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl p-6 sm:p-8">
                {/* App Main Logo Header (Centered) */}
                <div className="flex flex-col items-center justify-center text-center mb-6">
                    <img
                        src={logo}
                        alt="Dhanicap Finance Logo"
                        className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-sm mb-3"
                    />
                    <span className="font-extrabold text-lg tracking-wide text-[#0a182e] leading-tight">
                        DHANICAP
                    </span>
                    <span className="text-[11px] text-[#f26e21] font-extrabold tracking-widest uppercase">
                        Finance
                    </span>
                </div>

                {/* Title & Description */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                        Create a new strong password for your Dhanicap Finance account.
                    </p>
                </div>

                {/* Reset Password Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Enter Password (with show/hide icon) */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Enter Password
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className={`w-full bg-slate-50 border ${
                                    errors.password
                                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                                        : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
                                } rounded-xl py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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

                    {/* Confirm Password (NO show/hide icon) */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                className={`w-full bg-slate-50 border ${
                                    errors.confirmPassword
                                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                                        : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
                                } rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f26e21] hover:bg-[#e05f13] text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-[#f26e21]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 mt-6 cursor-pointer"
                    >
                        {loading ? (
                            <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <span>Reset Password</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={onNavigateLogin}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}

ResetPassword.propTypes = {
    onNavigateLogin: PropTypes.func,
    token: PropTypes.string,
};

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import loginImg from "../assets/login_page_img.webp";
import logo from "../assets/veda_housing_finance.jpeg";

export default function Login({ onLogin }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "Admin",
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (onLogin) {
                onLogin(formData);
            }
        }, 500);
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
                                alt="Veda Finance Logo"
                                className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-sm shrink-0"
                            />
                            <div>
                                <span className="font-extrabold text-lg tracking-wide text-[#0a182e] block leading-tight">
                                    VEDA FINANCE
                                </span>
                                <span className="block text-[11px] text-[#f26e21] font-extrabold tracking-widest uppercase">
                                    Housing Finance
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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role Selection Tabs */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                    Select Portal / Role
                                </label>
                                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60">
                                    {["Admin", "Manager", "Customer"].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role })}
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
                                        required
                                        placeholder="e.g. name@vedafinance.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                        Password
                                    </label>
                                    <a
                                        href="#forgot"
                                        onClick={(e) => e.preventDefault()}
                                        className="text-xs text-[#f26e21] hover:underline font-semibold"
                                    >
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-600 select-none">
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
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
        </div>
    );
}

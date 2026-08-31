import React, { useState } from "react";
import { User, Mail, MapPin, Building, Hash, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import loginImg from "../assets/login_page_img.webp";
import logo from "../assets/veda_housing_finance.jpeg";

export default function Register({ onRegister, onNavigateLogin }) {
    const [formData, setFormData] = useState({
        role: "Admin",
        firstName: "",
        lastName: "",
        email: "",
        village: "",
        state: "",
        pincode: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (onRegister) {
                onRegister(formData);
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-100/80 text-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
                {/* Left Form Section */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        {/* Brand Logo Header */}
                        <div className="flex items-center gap-3.5 mb-5">
                            <img
                                src={logo}
                                alt="Veda Finance Logo"
                                className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-sm shrink-0"
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
                        <div className="mb-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Create an Account
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Register as <span className="font-semibold text-[#f26e21]">{formData.role}</span> for Veda Housing Finance.
                            </p>
                        </div>

                        {/* Role Selection Tabs */}
                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                                Select Registration Role
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

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* First Name & Last Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="firstName"
                                            required
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="lastName"
                                            required
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="john.doe@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Village, State, Pincode */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        {formData.role === "Manager" ? "Branch / Village" : "Village"}
                                    </label>
                                    <div className="relative">
                                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="village"
                                            required
                                            placeholder={formData.role === "Manager" ? "Branch / Village" : "Village / Town"}
                                            value={formData.village}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        State
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="state"
                                            required
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Pincode
                                    </label>
                                    <div className="relative">
                                        <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="pincode"
                                            required
                                            placeholder="6-digit PIN"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Password & Confirm Password */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-9 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#f26e21] focus:ring-2 focus:ring-[#f26e21]/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
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
                                        <span>Register as {formData.role}</span>
                                        <UserPlus className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-500">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={onNavigateLogin}
                                    className="text-[#f26e21] font-semibold hover:underline cursor-pointer"
                                >
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Banner Section */}
                <div className="lg:col-span-5 bg-[#0a182e] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-800 text-slate-300">
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                            Smart Loan Origination & Digital Finance Management
                        </h2>
                    </div>

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

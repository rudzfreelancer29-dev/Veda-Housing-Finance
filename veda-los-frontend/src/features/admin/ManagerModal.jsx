import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function ManagerModal({
  isOpen,
  onClose,
  onSubmit,
  modalMode,
  managerForm,
  setManagerForm,
  loading = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = (managerForm.name || "").trim();
    const emailTrimmed = (managerForm.email || "").trim();
    const password = managerForm.password || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameTrimmed) {
      newErrors.name = "Full name is required.";
    } else if (nameTrimmed.length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    }

    if (!emailTrimmed) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(emailTrimmed)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (modalMode === "add") {
      if (!password) {
        newErrors.password = "Password is required.";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long.";
      }
    } else if (password && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(e);
    }
  };

  const handleFieldChange = (field, value) => {
    setManagerForm({ ...managerForm, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-md">
            {modalMode === "add" ? "Register Manager Account" : "Edit Manager Details"}
          </h3>
          <button 
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} noValidate className="p-6 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={managerForm.name || ""}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className={`w-full bg-slate-50 border ${
                errors.name
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
              } rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@vedafinance.com"
              value={managerForm.email || ""}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className={`w-full bg-slate-50 border ${
                errors.email
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
              } rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Password {modalMode === "edit" && <span className="text-slate-400 font-normal lowercase">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={managerForm.password || ""}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                className={`w-full bg-slate-50 border ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
                } rounded-lg text-sm px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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

          {/* Status field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status</label>
            <select
              value={managerForm.status || "active"}
              onChange={(e) => handleFieldChange("status", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-sm font-semibold">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#f26e21] hover:bg-[#e05f13] text-white rounded-lg shadow-sm disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{modalMode === "add" ? "Create Account" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

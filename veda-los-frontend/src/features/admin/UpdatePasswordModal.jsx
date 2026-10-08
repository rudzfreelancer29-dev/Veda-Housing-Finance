import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "react-toastify";

export default function UpdatePasswordModal({
  isOpen,
  onClose,
  onSuccess
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    const newErrors = { ...errors };

    if (!val) {
      newErrors.password = "Password is required.";
    } else if (val.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    } else {
      delete newErrors.password;
    }

    if (confirmPassword) {
      if (val !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    const newErrors = { ...errors };

    if (!val) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (val !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    } else {
      delete newErrors.confirmPassword;
    }

    setErrors(newErrors);
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setErrors({});
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulated update without API call for now
    setTimeout(() => {
      setLoading(false);
      toast.success("Password updated successfully!");
      if (onSuccess) onSuccess();
      handleClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#f26e21] flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Update Password
              </h3>
              <p className="text-[11px] text-slate-400">Update your account login password</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Password Field with Show/Hide button */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter at least 8 characters"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => {
                  if (!password) {
                    setErrors((prev) => ({ ...prev, password: "Password is required." }));
                  } else if (password.length < 8) {
                    setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters long." }));
                  }
                }}
                className={`w-full bg-slate-50 border ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
                } rounded-lg text-sm px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
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

          {/* Confirm Password Field WITHOUT Show/Hide button */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              onBlur={() => {
                if (!confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "Confirm password is required." }));
                } else if (password !== confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match." }));
                }
              }}
              className={`w-full bg-slate-50 border ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:border-[#f26e21] focus:ring-[#f26e21]/20"
              } rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-sm font-semibold">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#f26e21] hover:bg-[#e05f13] text-white rounded-lg shadow-sm disabled:opacity-70 flex items-center gap-2 cursor-pointer transition-colors"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

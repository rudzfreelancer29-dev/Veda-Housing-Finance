import React from "react";
import { Bell, X, CheckCircle2, Clock, Info, User, Tag, Hash, FileText, Check } from "lucide-react";

export default function NotificationModal({
  isOpen,
  notification,
  onClose,
  onMarkAsRead,
  loading = false
}) {
  if (!isOpen || !notification) return null;

  const raw = notification.raw || {};
  const message = notification.text || notification.message || notification.title || notification.details || raw.message || raw.text || raw.details || "Notification details";
  const dateStr = notification.createdAt || notification.created_at || raw.created_at || raw.createdAt || raw.timestamp;

  const formatFullDate = (d) => {
    if (!d) return "Recently";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return "Recently";
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Recently";
    }
  };

  const formatTimeAgo = (d) => {
    if (!d) return "";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  // Determine category or type from raw data or message
  const getCategory = () => {
    if (raw.type) return raw.type;
    if (raw.category) return raw.category;
    if (raw.action) return raw.action;
    const msg = message.toLowerCase();
    if (msg.includes("register") || msg.includes("customer")) return "Customer Registration";
    if (msg.includes("manager")) return "Manager Activity";
    if (msg.includes("loan") || msg.includes("application")) return "Loan Application";
    if (msg.includes("payment")) return "Payment Update";
    return "System Alert";
  };

  const handleMarkAsReadClick = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#f26e21] shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Notification Details
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Dhanicap LOS • Real-time Notification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Main Message Banner */}
          <div className="p-4 bg-gradient-to-r from-orange-50/70 to-amber-50/40 border border-orange-200/80 rounded-xl">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#f26e21] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Key-Value Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Category */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Category
                </span>
                <span className="block text-xs font-bold text-slate-700 truncate">
                  {getCategory()}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Unread
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3 col-span-1 sm:col-span-2">
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Received Time
                  </span>
                  <span className="block text-xs font-semibold text-slate-700">
                    {formatFullDate(dateStr)}
                  </span>
                </div>
                {formatTimeAgo(dateStr) && (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                    {formatTimeAgo(dateStr)}
                  </span>
                )}
              </div>
            </div>

            {/* Notification ID */}
            {notification.id && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Notification ID
                  </span>
                  <span className="block text-xs font-mono font-semibold text-slate-700 truncate">
                    #{notification.id}
                  </span>
                </div>
              </div>
            )}

            {/* Additional entity info if present in raw */}
            {(raw.customer_name || raw.user_name || raw.manager_name) && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Related User
                  </span>
                  <span className="block text-xs font-bold text-slate-700 truncate">
                    {raw.customer_name || raw.user_name || raw.manager_name}
                  </span>
                </div>
              </div>
            )}

            {/* Additional application or reference ID if present in raw */}
            {(raw.application_id || raw.reference_id || raw.entity_id) && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Reference
                  </span>
                  <span className="block text-xs font-mono font-semibold text-slate-700 truncate">
                    {raw.reference_id || raw.application_id || `#${raw.entity_id}`}
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
          {onMarkAsRead && (
            <button
              type="button"
              disabled={loading}
              onClick={handleMarkAsReadClick}
              className="py-2 px-4 text-xs font-bold text-white bg-[#f26e21] hover:bg-[#e05f13] active:bg-[#c6510d] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark as Read & Dismiss</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

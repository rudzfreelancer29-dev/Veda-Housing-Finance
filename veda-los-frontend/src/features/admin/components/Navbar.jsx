import React, { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Menu, Plus, Check } from "lucide-react";
import logo from "../../../assets/veda_housing_finance.jpeg";
import { toast } from "react-toastify";

export default function Navbar({
  activeTab,
  actionLabel = "",
  onActionClick,
  notifications = [],
  onMarkNotificationsRead,
  onReadNotification,
  onNotificationClick,
  user = {
    name: "Super Admin",
    role: "Administrator",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  onSetup,
  onToggleSidebar
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const formatTime = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Recently";
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getInitials = (name, fallback = "SA") => {
    if (!name) return fallback;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  function AdminName() {
    try {
      // 1. Read name from the JSON 'user' object stored during login
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj?.name) return userObj.name;
      }

      // 2. Fallback: Decode user name directly from JWT token payload
      const token = localStorage.getItem("token");
      if (token) {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
          if (decoded?.name || decoded?.user?.name) {
            return decoded?.name || decoded?.user?.name;
          }
        }
      }
    } catch (err) {
      console.error("Error reading admin name from localStorage:", err);
    }
    return user?.name || "Administrator";
  }

  function onLogout(){
    try {
      localStorage.clear();
      toast.success("Logout successful");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed");
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []
);

  return (
    <header className="bg-white border-b border-slate-200 w-full shrink-0 z-10 shadow-xs">
      {/* Mobile Top Header (Visible on screens < md) */}
      <div className="flex md:hidden items-center justify-between p-3 sm:p-4 border-b border-slate-100">
        {/* Left Side: Burger Menu Button & Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 border border-slate-200/80 transition-all shrink-0 cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Logo on Page */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={logo}
              alt="Veda Finance Logo"
              className="w-12 h-12 object-contain rounded-xl bg-white p-0.5 border border-slate-200 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <span className="font-extrabold text-xs tracking-wide text-[#0a182e] block leading-tight truncate">
                VEDA FINANCE
              </span>
              <span className="block text-[9px] text-[#f26e21] font-extrabold tracking-widest uppercase truncate">
                Housing Finance
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Controls: Notifications & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications Button */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center relative transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-800 text-xs">Notifications</span>
                  {onMarkNotificationsRead && notifications.length > 0 && (
                    <button
                      onClick={() => {
                        onMarkNotificationsRead();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-[#f26e21] hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-400">No new notifications</p>
                  ) : (
                    notifications.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => {
                          setShowNotifications(false);
                          if (onNotificationClick) {
                            onNotificationClick(item);
                          } else if (onReadNotification) {
                            onReadNotification(item.id);
                          }
                        }}
                        className="px-4 py-2.5 text-xs hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer flex items-start justify-between gap-2 group transition-colors"
                        title="Click to view details"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 group-hover:text-[#f26e21] transition-colors leading-snug">
                            {item.text || item.message || item.title || item.details || "Notification"}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {item.time || formatTime(item.createdAt || item.created_at || item.timestamp)}
                          </span>
                        </div>
                        {onReadNotification && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReadNotification(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-emerald-600 transition-all shrink-0 cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1 hover:bg-slate-50 p-1 rounded-lg transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0a182e] to-slate-700 text-white font-black text-xs flex items-center justify-center border border-slate-300 shadow-xs select-none">
                {getInitials(AdminName(), "SA")}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-700">
                  {AdminName()}
                </div>
                {onSetup && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSetup();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    System Setup
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-rose-600 font-semibold cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Top Header (Visible on screens >= md) */}
      <div className="hidden md:flex h-16 items-center justify-between px-6 sm:px-8">
        {/* Page Title */}
        <div className="select-none">
          <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
            {activeTab}
          </h1>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-4 sm:gap-6 ml-auto">
          {/* Action Button */}
          {actionLabel && onActionClick && (
            <button
              onClick={onActionClick}
              className="bg-[#f26e21] hover:bg-[#e05f13] active:bg-[#c6510d] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
              title={actionLabel}
            >
              <Plus className="w-4 h-4 shrink-0 font-extrabold" />
              <span>{actionLabel}</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center relative transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-800 text-xs">Notifications</span>
                  {onMarkNotificationsRead && notifications.length > 0 && (
                    <button
                      onClick={() => {
                        onMarkNotificationsRead();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-[#f26e21] hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-400">No new notifications</p>
                  ) : (
                    notifications.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => {
                          setShowNotifications(false);
                          if (onNotificationClick) {
                            onNotificationClick(item);
                          } else if (onReadNotification) {
                            onReadNotification(item.id);
                          }
                        }}
                        className="px-4 py-2.5 text-xs hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer flex items-start justify-between gap-2 group transition-colors"
                        title="Click to view details"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 group-hover:text-[#f26e21] transition-colors leading-snug">
                            {item.text || item.message || item.title || item.details || "Notification"}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {item.time || formatTime(item.createdAt || item.created_at || item.timestamp)}
                          </span>
                        </div>
                        {onReadNotification && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReadNotification(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-emerald-600 transition-all shrink-0 cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0a182e] to-slate-700 text-white font-black text-xs flex items-center justify-center border border-slate-300 shadow-xs select-none shrink-0">
                {getInitials(AdminName(), "SA")}
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-3">{AdminName()}</span>
                <span className="text-[10px] text-slate-500">{user.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-sm">
                <div className="px-4 py-2 border-b border-slate-100 font-medium text-slate-500 text-xs">Veda Finance</div>
                {onSetup && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSetup();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    System Setup
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600 font-semibold cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

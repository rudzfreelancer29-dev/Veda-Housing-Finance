import React, { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Menu, Plus } from "lucide-react";
import logo from "../../../assets/Dhanicap_Logo.png";
import { toast } from "react-toastify";

export default function Navbar({
  activeTab,
  actionLabel = "",
  onActionClick,
  notifications = [],
  onMarkNotificationsRead,
  user = {
    name: "Manager",
    role: "Loan Operations Manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"
  },
  onSetup,
  onOpenUpdatePassword,
  onToggleSidebar
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  function getUserName() {
    try {
      // 1. Check sessionStorage / localStorage "user"
      const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
      if (user?.name) return user.name;

      // 2. Fallback to JWT payload
      const token = (sessionStorage.getItem("token") || localStorage.getItem("token"))?.split(".")[1];
      if (token) {
        const payload = JSON.parse(atob(token.replace(/-/g, "+").replace(/_/g, "/")));
        return payload?.name || payload?.user?.name || "Manager";
      }
    } catch (err) {
      console.error("Error reading user name:", err);
    }

    return "Manager";
  }

  const getInitials = (name, fallback = "M") => {
    if (!name) return fallback;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  function onLogout(){
    try {
      sessionStorage.clear();
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
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 w-full shrink-0 z-10 shadow-xs">
      {/* Mobile Top Header (Visible on screens < md) */}
      <div className="flex md:hidden items-center justify-between p-3 sm:p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-700 border border-slate-200/80 transition-all shrink-0 cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={logo}
              alt="Dhanicap Logo"
              className="w-14 h-14 object-contain rounded-xl shrink-0"
            />
            <div className="min-w-0">
              <span className="font-black text-xs tracking-widest text-[#B38728] block leading-tight truncate">
                DHANICAP
              </span>
              <span className="block text-[9px] text-[#64748b] font-bold tracking-[0.22em] uppercase truncate">
                Finance
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center relative transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-800 text-xs">Notifications</span>
                  {onMarkNotificationsRead && (
                    <button
                      onClick={() => {
                        onMarkNotificationsRead();
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-[#f26e21] hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-400">No new notifications</p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`px-4 py-2.5 text-xs hover:bg-slate-50 border-b border-slate-50 last:border-0 ${
                          !item.read ? "bg-orange-50/30" : ""
                        }`}
                      >
                        <p className={`${!item.read ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                          {item.text}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Recently</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1 hover:bg-slate-50 p-1 rounded-lg transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f26e21] to-amber-500 text-white font-black text-xs flex items-center justify-center border border-orange-200 shadow-xs select-none">
                {getInitials(getUserName(), "M")}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-slate-700">
                  {getUserName()}
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
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenUpdatePassword) onOpenUpdatePassword();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  Update Password
                </button>
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
          {/* <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center relative transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-800 text-xs">Notifications</span>
                  {onMarkNotificationsRead && (
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
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`px-4 py-2.5 text-xs hover:bg-slate-50 border-b border-slate-50 last:border-0 ${
                          !item.read ? "bg-orange-50/30" : ""
                        }`}
                      >
                        <p className={`${!item.read ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                          {item.text}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Recently</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div> */}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f26e21] to-amber-500 text-white font-black text-xs flex items-center justify-center border border-orange-200 shadow-xs select-none shrink-0">
                {getInitials(getUserName(), "M")}
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-3">{getUserName()}</span>
                <span className="text-[10px] text-slate-500">{user.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-sm">
                <div className="px-4 py-2 border-b border-slate-100 font-medium text-slate-500 text-xs">Dhanicap Finance</div>
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
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onOpenUpdatePassword) onOpenUpdatePassword();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  Update Password
                </button>
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

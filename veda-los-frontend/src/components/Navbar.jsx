import React, { useState } from "react";
import { Bell, ChevronDown, Menu, Plus } from "lucide-react";

export default function Navbar({
  activeTab,
  actionLabel = "",
  onActionClick,
  notifications = [],
  onMarkNotificationsRead,
  user = {
    name: "Super Admin",
    role: "Administrator",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  onLogout,
  onSetup,
  onToggleSidebar
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0 z-10 w-full">
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all shrink-0"
        title="Toggle Menu"
      >
        <Menu className="w-5.5 h-5.5" />
      </button>

      {/* Toolbar Controls */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Dynamic Action Button */}
        {actionLabel && onActionClick && (
          <button
            onClick={onActionClick}
            className="bg-[#f26e21] hover:bg-[#e05f13] active:bg-[#c6510d] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            title={actionLabel}
          >
            <Plus className="w-4 h-4 shrink-0 font-extrabold" />
            <span className="hidden sm:inline">{actionLabel}</span>
          </button>
        )}

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center relative transition-all"
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

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-200"
            />
            <div className="text-left hidden md:block">
              <span className="block text-xs font-semibold text-slate-800 leading-3">{user.name}</span>
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
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700"
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
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600 font-semibold"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

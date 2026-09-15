import React, { useState } from "react";
import logo from "../../../assets/Dhanicap_Logo.png";
import { X, Menu } from "lucide-react";

export default function Sidebar({
  items = [],
  activeTab,
  setActiveTab,
  onTabChange,
  bottomItem,
  isOpen,
  onClose,
  isCollapsed: controlledIsCollapsed,
  setIsCollapsed: controlledSetIsCollapsed
}) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalIsCollapsed;

  const toggleCollapse = () => {
    if (controlledSetIsCollapsed) {
      controlledSetIsCollapsed(!isCollapsed);
    } else {
      setInternalIsCollapsed(!isCollapsed);
    }
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (onTabChange) {
      onTabChange(tabName);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-[#0a182e] text-slate-300 flex flex-col justify-between shrink-0 select-none z-50 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-64 md:w-24" : "w-64 md:w-64"
      } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div>
        {/* Brand logo container */}
        <div className="flex items-center justify-between gap-2.5 px-3 pt-6 pb-4 border-b border-slate-800/80 bg-[#071120]/40 overflow-hidden">
          {/* Desktop Logo & Toggle Header */}
          <div
            className={`hidden md:flex items-center transition-all duration-300 ease-in-out ${
              isCollapsed ? "justify-center w-full" : "justify-between w-full"
            }`}
          >
            <div
              onClick={isCollapsed ? toggleCollapse : undefined}
              className={`flex items-center gap-2.5 min-w-0 transition-all duration-300 ${
                isCollapsed ? "justify-center w-full cursor-pointer group" : ""
              }`}
              title={isCollapsed ? "Click logo to expand sidebar" : undefined}
            >
              <img
                src={logo}
                alt="Dhanicap Logo"
                className={`w-[85px] h-[85px] object-contain rounded-xl shrink-0 transition-all duration-300 ${
                  isCollapsed ? "group-hover:scale-105" : ""
                }`}
              />
              <div
                className={`min-w-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[160px] opacity-100"
                }`}
              >
                <span className="font-extrabold text-base tracking-wide text-white block leading-tight truncate">DHANICAP</span>
                <span className="block text-[11px] text-[#f26e21] font-extrabold tracking-widest uppercase mt-0.5 truncate"> Finance</span>
              </div>
            </div>

            <button
              onClick={toggleCollapse}
              className={`p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all duration-300 shrink-0 cursor-pointer ${
                isCollapsed ? "max-w-0 opacity-0 pointer-events-none p-0 overflow-hidden" : "max-w-10 opacity-100"
              }`}
              title="Collapse Sidebar"
            >
              <Menu className="w-5 h-5 shrink-0" />
            </button>
          </div>

          {/* Mobile drawer header (Logo hidden, Close button displayed) */}
          <div className="flex md:hidden items-center justify-between w-full">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Navigation Menu</span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic navigation links */}
        <nav className="mt-6 px-3 space-y-1.5">
          {items.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.name)}
                title={isCollapsed ? tab.name : undefined}
                className={`w-full flex items-center h-12 rounded-lg text-sm transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
                  isCollapsed ? "justify-center px-0" : "px-4 gap-3"
                } ${
                  isActive
                    ? "bg-[#f26e21] text-white font-semibold shadow-md shadow-[#f26e21]/15"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                }`}
              >
                {Icon && <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />}
                <span
                  className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap truncate ${
                    isCollapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
                  }`}
                >
                  {tab.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom element */}
      {bottomItem && (
        <div className="p-3 border-t border-slate-800/60">
          <button
            onClick={() => handleTabClick(bottomItem.name)}
            title={isCollapsed ? bottomItem.name : undefined}
            className={`w-full flex items-center h-12 rounded-lg text-sm transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
              isCollapsed ? "justify-center px-0" : "px-4 gap-3"
            } ${
              activeTab === bottomItem.name
                ? "bg-[#f26e21] text-white font-semibold shadow-md shadow-[#f26e21]/15"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            {bottomItem.icon && <bottomItem.icon className="w-5 h-5 shrink-0" />}
            <span
              className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap truncate ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
              }`}
            >
              {bottomItem.name}
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}

import React from "react";
import logo from "../assets/veda_housing_finance.jpeg";
import { X } from "lucide-react";

export default function Sidebar({
  items = [],
  activeTab,
  setActiveTab,
  onTabChange,
  bottomItem,
  isOpen,
  onClose
}) {
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
    <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0a182e] text-slate-300 flex flex-col justify-between shrink-0 select-none z-50 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
      <div>
        {/* Brand logo container */}
        <div className="flex items-center justify-between gap-2.5 px-3 pt-6 pb-4 border-b border-slate-800/80 bg-[#071120]/40">
          {/* Logo shown on desktop only */}
          <div className="hidden md:flex items-center gap-2.5 min-w-0">
            <img
              src={logo}
              alt="Veda Finance Logo"
              className="w-[70px] h-[70px] object-contain rounded-xl bg-white p-1 border border-slate-700/50 shadow-inner shrink-0"
            />
            <div className="min-w-0">
              <span className="font-extrabold text-base tracking-wide text-white block leading-tight truncate">VEDA FINANCE</span>
              <span className="block text-[11px] text-[#f26e21] font-extrabold tracking-widest uppercase mt-0.5 truncate">Housing Finance</span>
            </div>
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
        <nav className="mt-6 px-3 space-y-1">
          {items.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => handleTabClick(tab.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-150 cursor-pointer ${isActive
                  ? "bg-[#f26e21] text-white font-semibold shadow-md shadow-[#f26e21]/15"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />}
                {tab.name}
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-150 cursor-pointer ${activeTab === bottomItem.name
              ? "bg-[#f26e21] text-white font-semibold shadow-md shadow-[#f26e21]/15"
              : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
          >
            {bottomItem.icon && <bottomItem.icon className="w-4 h-4" />}
            {bottomItem.name}
          </button>
        </div>
      )}
    </aside>
  );
}

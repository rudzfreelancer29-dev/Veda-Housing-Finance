import React, { useMemo } from "react";
import { History, Shield, Calendar, User, Terminal } from "lucide-react";

export default function AuditLogsTab({ auditLogs, searchQuery }) {
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => 
      log.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [auditLogs, searchQuery]);

  const getBadgeStyle = (action) => {
    const lower = action.toLowerCase();
    if (lower.includes("create") || lower.includes("register")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (lower.includes("delete") || lower.includes("deactivate") || lower.includes("reject")) {
      return "bg-rose-50 text-rose-700 border-rose-200/60";
    }
    if (lower.includes("status") || lower.includes("assign") || lower.includes("update")) {
      return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
    }
    return "bg-slate-100 text-slate-600 border-slate-200/60";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col w-full relative">
      
      {/* Title Header with descriptive info */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 text-[#f26e21] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base leading-tight">System Activity Logs</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Historical trace of SuperAdmin and Manager actions</p>
          </div>
        </div>
        
        <span className="text-xs bg-slate-200/80 text-slate-700 px-3 py-1 rounded-full font-extrabold self-start sm:self-center shrink-0">
          {filteredLogs.length} entries recorded
        </span>
      </div>

      {/* DESKTOP TABLE VIEW (Visible on tablet & desktop) */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6 w-52"><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp</span></th>
              <th className="py-4 px-4 w-44"><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Operator</span></th>
              <th className="py-4 px-4 w-44"><span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-slate-400" /> Action Event</span></th>
              <th className="py-4 px-6"><span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-slate-400" /> Description Details</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-16 text-center text-slate-400 font-semibold">
                  No activity logs match your search parameters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-5 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-5 px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                        {log.manager.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[130px]">{log.manager}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getBadgeStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-slate-600 font-semibold leading-relaxed">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST CARD VIEW (Visible on mobile screens) */}
      <div className="block md:hidden divide-y divide-slate-100 w-full">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-semibold text-sm">
            No activity logs match your search.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-5 space-y-3 hover:bg-slate-50/20 transition-colors">
              {/* Header Info */}
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-mono text-slate-400">{log.timestamp}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${getBadgeStyle(log.action)}`}>
                  {log.action}
                </span>
              </div>
              
              {/* Operator details */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-[9px] shrink-0">
                  {log.manager.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-slate-800 text-xs">{log.manager}</span>
              </div>

              {/* Log Details Description */}
              <p className="text-xs text-slate-600 font-semibold leading-relaxed pl-8">
                {log.details}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

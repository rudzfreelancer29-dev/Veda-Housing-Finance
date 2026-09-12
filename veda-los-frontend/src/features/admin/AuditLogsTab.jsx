import React, { useState, useEffect, useMemo } from "react";
import { History, Shield, Calendar, User, Terminal, RefreshCw, Layers } from "lucide-react";
import apiService from "../../services/api-service";

export default function AuditLogsTab({ auditLogs = [], searchQuery = "" }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiService.GetAuditLogs();
      const data = response.data?.data || response.data?.logs || response.data;
      const list = Array.isArray(data) ? data : [];
      setLogs(list);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const getBadgeStyle = (action) => {
    const lower = (action || "").toLowerCase();
    if (lower.includes("create") || lower.includes("register") || lower.includes("login") || lower.includes("approve") || lower.includes("success")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    }
    if (lower.includes("delete") || lower.includes("deactivate") || lower.includes("reject") || lower.includes("fail") || lower.includes("logout")) {
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    }
    if (lower.includes("status") || lower.includes("assign") || lower.includes("update") || lower.includes("edit")) {
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    }
    return "bg-amber-50 text-amber-700 border-amber-200/80";
  };

  const formatRole = (role) => {
    if (!role) return "";
    return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredLogs = useMemo(() => {
    const sourceList = logs.length > 0 ? logs : (auditLogs || []);
    if (!searchQuery) return sourceList;
    const q = searchQuery.toLowerCase();

    return sourceList.filter((log) => {
      const name = (log.user_name || log.manager || "").toLowerCase();
      const role = (log.user_role || "").toLowerCase();
      const action = (log.action || "").toLowerCase();
      const entity = (log.entity || "").toLowerCase();
      const details = (log.details || "").toLowerCase();
      const time = (log.created_at || log.timestamp || "").toLowerCase();

      return (
        name.includes(q) ||
        role.includes(q) ||
        action.includes(q) ||
        entity.includes(q) ||
        details.includes(q) ||
        time.includes(q)
      );
    });
  }, [logs, auditLogs, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col w-full relative">
      
      {/* Title Header */}
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
        
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 hover:bg-slate-200/70 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#f26e21]" : ""}`} />
          </button>
          <span className="text-xs bg-slate-200/80 text-slate-700 px-3 py-1 rounded-full font-extrabold">
            {filteredLogs.length} entries recorded
          </span>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW (Visible on tablet & desktop) */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6 w-52"><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp</span></th>
              <th className="py-4 px-4 w-52"><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> User / Role</span></th>
              <th className="py-4 px-4 w-36"><span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-slate-400" /> Action</span></th>
              <th className="py-4 px-4 w-40"><span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-slate-400" /> Target Entity</span></th>
              <th className="py-4 px-6"><span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-slate-400" /> Description Details</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-400 font-semibold space-y-2">
                  <div className="w-6 h-6 border-2 border-[#f26e21]/30 border-t-[#f26e21] rounded-full animate-spin mx-auto" />
                  <p className="text-xs mt-2">Loading system audit logs...</p>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-400 font-semibold">
                  No activity logs match your search parameters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const operatorName = log.user_name || log.manager || "System User";
                const operatorRole = log.user_role;
                const timestampText = formatTimestamp(log.created_at || log.timestamp);
                const entityText = log.entity ? `${log.entity}${log.entity_id ? ` #${log.entity_id}` : ""}` : "-";

                return (
                  <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {timestampText}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 font-extrabold flex items-center justify-center shrink-0 text-[10px]">
                          {operatorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-slate-800 truncate max-w-[140px]">
                            {operatorName}
                          </span>
                          {operatorRole && (
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {formatRole(operatorRole)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {log.entity ? (
                        <span className="inline-flex items-center font-mono text-[11px] bg-slate-100/80 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {entityText}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium text-xs leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST CARD VIEW (Visible on mobile screens) */}
      <div className="block md:hidden divide-y divide-slate-100 w-full">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-semibold space-y-2">
            <div className="w-6 h-6 border-2 border-[#f26e21]/30 border-t-[#f26e21] rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-semibold text-sm">
            No activity logs match your search.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const operatorName = log.user_name || log.manager || "System User";
            const operatorRole = log.user_role;
            const timestampText = formatTimestamp(log.created_at || log.timestamp);
            const entityText = log.entity ? `${log.entity}${log.entity_id ? ` #${log.entity_id}` : ""}` : null;

            return (
              <div key={log.id} className="p-4 space-y-2.5 hover:bg-slate-50/20 transition-colors">
                {/* Header Info */}
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono text-slate-400">{timestampText}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${getBadgeStyle(log.action)}`}>
                    {log.action}
                  </span>
                </div>
                
                {/* Operator and Entity details */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px] shrink-0">
                      {operatorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">{operatorName}</span>
                      {operatorRole && (
                        <span className="text-[10px] text-slate-400 block">{formatRole(operatorRole)}</span>
                      )}
                    </div>
                  </div>

                  {entityText && (
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {entityText}
                    </span>
                  )}
                </div>

                {/* Log Details Description */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed pl-8">
                  {log.details}
                </p>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

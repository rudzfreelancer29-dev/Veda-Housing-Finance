import React, { useMemo } from "react";

export default function AuditLogsTab({ auditLogs, searchQuery }) {
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => 
      log.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [auditLogs, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center">
        <span className="font-bold text-slate-800">System Activity Records</span>
        <span className="text-xs text-slate-400">Historical trace of SuperAdmin and Manager actions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Timestamp</th>
              <th className="py-4 px-4">Operator</th>
              <th className="py-4 px-4">Action Event</th>
              <th className="py-4 px-6">Description Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-slate-400">
                  No audit logs match your query.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-4.5 px-6 font-mono text-xs text-slate-500">{log.timestamp}</td>
                  <td className="py-4.5 px-4 font-bold text-slate-800">{log.manager}</td>
                  <td className="py-4.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                      log.action === "Create" || log.action === "Register"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : log.action === "Delete"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-slate-600 font-medium">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

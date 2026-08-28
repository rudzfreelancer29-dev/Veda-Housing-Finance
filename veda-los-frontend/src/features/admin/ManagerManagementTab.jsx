import React, { useMemo } from "react";
import {
  Users,
  UserCheck,
  FileText,
  Filter,
  Edit2,
  Lock,
  Unlock,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  History,
  Search
} from "lucide-react";

export default function ManagerManagementTab({
  managers,
  onEdit,
  onDelete,
  onToggleStatus,
  auditLogs,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  activeManagerFilter,
  setActiveManagerFilter,
  selectedManagers,
  setSelectedManagers,
  onManagerClick
}) {
  const itemsPerPage = 7;

  // Filter Managers
  const filteredManagers = useMemo(() => {
    return managers.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeManagerFilter === "all") return matchesSearch;
      return matchesSearch && m.status === activeManagerFilter;
    });
  }, [managers, searchQuery, activeManagerFilter]);

  // Paginated Managers
  const paginatedManagers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredManagers.slice(start, start + itemsPerPage);
  }, [filteredManagers, currentPage]);

  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);

  const totalManagersCount = managers.length;
  const activeManagersCount = managers.filter(m => m.status === "active").length;
  const totalCustomersCount = 4;
  const pendingApprovalsCount = 0;

  // Select all / individual
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedManagers(paginatedManagers.map(m => m.id));
    } else {
      setSelectedManagers([]);
    }
  };

  const handleSelectManager = (id) => {
    if (selectedManagers.includes(id)) {
      setSelectedManagers(selectedManagers.filter(item => item !== id));
    } else {
      setSelectedManagers([...selectedManagers, id]);
    }
  };

  return (
    <div className="space-y-6 w-full">

      {/* Stat KPIs row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Stat 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider block uppercase truncate">Total Managers</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 block">{totalManagersCount}</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 text-[#f26e21] rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider block uppercase truncate">Active Managers</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 block">{activeManagersCount}</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider block uppercase truncate">Total Customers</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 block">{totalCustomersCount}</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center relative shrink-0">
            <span className="w-2.5 h-2.5 bg-cyan-500 border-2 border-white rounded-full animate-pulse absolute top-1 right-1"></span>
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold tracking-wider block uppercase truncate">Pending Approvals</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 block">{pendingApprovalsCount}</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

      </div>

      {/* Table / Audit Log Sidebar Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Table Panel */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">

          {/* Table Control Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center justify-between w-full md:w-auto gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm sm:text-base">Manager Directory</span>
                <span className="text-xs bg-slate-200/80 text-slate-600 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                  {filteredManagers.length} total
                </span>
              </div>
            </div>

            {/* Search and filter controls grouped */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Inline Search Bar */}
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Search managers..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Status filter selection */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={activeManagerFilter}
                  onChange={(e) => {
                    setActiveManagerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-transparent border-0 font-bold text-slate-600 focus:ring-0 focus:outline-none cursor-pointer py-0.5 pr-8 pl-1"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Table Wrapper for Horizontal Scrolling */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-4 px-6 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedManagers.length > 0 && selectedManagers.length === paginatedManagers.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#f26e21] focus:ring-[#f26e21]"
                    />
                  </th>
                  <th className="py-4 px-4">Manager Name</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Applications</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium">
                {paginatedManagers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No managers match your query.
                    </td>
                  </tr>
                ) : (
                  paginatedManagers.map((manager) => (
                    <tr key={manager.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedManagers.includes(manager.id)}
                          onChange={() => handleSelectManager(manager.id)}
                          className="rounded border-slate-300 text-[#f26e21] focus:ring-[#f26e21]"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={manager.avatar}
                            alt={manager.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-100"
                          />
                          <button
                            onClick={() => {
                              console.log("Manager name clicked in ManagerManagementTab:", manager);
                              onManagerClick?.(manager);
                            }}
                            className="font-bold text-slate-800 block truncate max-w-[140px] text-left hover:text-[#f26e21] hover:underline cursor-pointer transition-all focus:outline-none"
                            title={`View ${manager.name}'s assigned customers`}
                          >
                            {manager.name}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-normal truncate max-w-[150px]">{manager.email}</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase tracking-wider">
                          {manager.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${manager.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                        >
                          {manager.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-center text-slate-700">{manager.applications}</td>
                      <td className="py-4 px-6 text-right space-x-1 shrink-0 whitespace-nowrap">
                        <button
                          onClick={() => onEdit(manager)}
                          className="p-1.5 text-[#f26e21] hover:bg-orange-50 rounded-lg inline-flex items-center transition-all"
                          title="Edit details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(manager.id, manager.status, manager.name)}
                          className={`p-1.5 rounded-lg inline-flex items-center transition-all ${manager.status === "active"
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          title={manager.status === "active" ? "Deactivate Manager" : "Activate Manager"}
                        >
                          {manager.status === "active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDelete(manager.id, manager.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg inline-flex items-center transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs sm:text-sm text-slate-500 bg-slate-50/50 text-center sm:text-left">
              <span>
                Showing <strong className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="font-bold text-slate-700">
                  {Math.min(currentPage * itemsPerPage, filteredManagers.length)}
                </strong>{" "}
                of <strong className="font-bold text-slate-700">{filteredManagers.length}</strong> managers
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-3.5 py-1.5 border border-slate-200 bg-[#f26e21] text-white rounded-md font-bold text-xs">
                  {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

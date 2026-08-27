import React from "react";

export default function ManagerModal({
  isOpen,
  onClose,
  onSubmit,
  modalMode,
  managerForm,
  setManagerForm
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-md">
            {modalMode === "add" ? "Register Manager Account" : "Edit Manager Details"}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={managerForm.name}
              onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@gmail.com"
              value={managerForm.email}
              onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">System Role</label>
              <select
                value={managerForm.role}
                onChange={(e) => setManagerForm({ ...managerForm, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] cursor-pointer"
              >
                <option value="Manager">Manager</option>
                <option value="Law">Law</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Initial Status</label>
              <select
                value={managerForm.status}
                onChange={(e) => setManagerForm({ ...managerForm, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f26e21]/20 focus:border-[#f26e21] cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-sm font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#f26e21] hover:bg-[#e05f13] text-white rounded-lg shadow-sm"
            >
              {modalMode === "add" ? "Create Account" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

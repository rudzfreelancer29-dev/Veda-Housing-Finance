import React from "react";
import { AlertCircle } from "lucide-react";

export default function SettingsTab({
  processingFee,
  setProcessingFee,
  customFees,
  newFeeName,
  setNewFeeName,
  newFeeAmount,
  setNewFeeAmount,
  onAddFee,
  onRemoveFee,
  onUpdateProcessingFee
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      {/* Fee Configurations */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">System Processing Fees</h3>
          <p className="text-xs text-slate-400">Configure client payment gate requirements for onboarding</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 block">Default Processing Fee (₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={processingFee}
                onChange={(e) => setProcessingFee(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-sm px-3.5 py-2.5 rounded-lg focus:ring-1 focus:ring-[#f26e21] focus:outline-none"
              />
              <button 
                onClick={onUpdateProcessingFee}
                className="bg-[#f26e21] hover:bg-[#e05f13] text-white text-xs font-bold px-4 py-2.5 rounded-lg"
              >
                Update Fee
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <span className="text-sm font-bold text-slate-700 block">Custom Fee Types</span>
            
            <div className="space-y-2.5">
              {customFees.map((fee) => (
                <div key={fee.id} className="flex justify-between items-center bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-lg text-sm">
                  <div>
                    <span className="font-bold text-slate-800">{fee.name}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">₹{fee.amount}</span>
                  </div>
                  <button
                    onClick={() => onRemoveFee(fee.id, fee.name)}
                    className="text-rose-600 hover:underline text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Fee trigger */}
            <form onSubmit={onAddFee} className="grid grid-cols-2 gap-2 pt-2">
              <input
                type="text"
                placeholder="Fee Name..."
                value={newFeeName}
                onChange={(e) => setNewFeeName(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f26e21]"
                required
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount..."
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#f26e21] w-full"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#f26e21] hover:bg-[#e05f13] text-white text-xs font-bold px-3 py-2.5 rounded-lg shrink-0"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Restrictions & System Rules */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-6 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Manager Role Constraints</h3>
          <p className="text-xs text-slate-400">Strict system-wide permissions defined in PDF requirements</p>
        </div>

        <div className="space-y-3">
          {[
            "Managers cannot delete customer records permanently.",
            "Managers cannot edit default system loan processing fees.",
            "Managers cannot create or delete other manager profiles.",
            "Managers cannot view administrative reports.",
            "All manager event logs are piped automatically to the SuperAdmin Audit view."
          ].map((rule, idx) => (
            <div key={idx} className="flex gap-3 items-start text-sm bg-slate-50/50 p-3 rounded-lg border border-slate-100">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-slate-600 font-semibold leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

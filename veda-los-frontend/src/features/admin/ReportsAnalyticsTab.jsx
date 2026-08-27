import React from "react";

export default function ReportsAnalyticsTab({ customers, applications }) {
  const chartItems = [
    { month: "Jan", val: 30, pct: "30%" },
    { month: "Feb", val: 45, pct: "45%" },
    { month: "Mar", val: 20, pct: "20%" },
    { month: "Apr", val: 65, pct: "65%" },
    { month: "May", val: 80, pct: "80%" },
    { month: "Jun", val: 55, pct: "55%" },
    { month: "Jul", val: 95, pct: "95%" },
    { month: "Aug", val: 120, pct: "100%" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold tracking-wider block uppercase">Total Customer Registrations</span>
          <span className="text-4xl font-extrabold text-slate-800">{customers.length}</span>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#f26e21] w-3/4"></div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Growth rate: +15% month-over-month</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold tracking-wider block uppercase">Payment Collections Summary</span>
          <span className="text-4xl font-extrabold text-slate-800">₹50,00,000</span>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500 w-[60%]"></div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Target achieved: 60% of quarterly limit</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-semibold tracking-wider block uppercase">Loan Eligibility Statistics</span>
          <span className="text-4xl font-extrabold text-slate-800">
            {applications.length ? Math.round((applications.filter(a => a.status === "Eligible" || a.status === "Payment Completed" || a.status === "Completed").length / applications.length) * 100) : 0}% Pass
          </span>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-amber-500 w-1/2"></div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Based on passed check conditions</span>
        </div>
      </div>

      {/* Graphic Panels mock */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Monthly Registration Trends</h3>
          <p className="text-xs text-slate-400">Overview of customers registered over recent months</p>
        </div>
        
        {/* Custom Tailwind Chart representation */}
        <div className="flex items-end justify-between h-48 border-b border-slate-100 pb-2.5 px-4">
          {chartItems.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 w-1/10">
              <span className="text-[10px] font-bold text-slate-400">{item.val}</span>
              <div className="w-8 bg-[#f26e21]/90 hover:bg-[#f26e21] rounded-t transition-all cursor-pointer shadow-md shadow-[#f26e21]/10" style={{ height: `calc(${item.pct} * 1.2)` }}></div>
              <span className="text-xs font-semibold text-slate-500 mt-1">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

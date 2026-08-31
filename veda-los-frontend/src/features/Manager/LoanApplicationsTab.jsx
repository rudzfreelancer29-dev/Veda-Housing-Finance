import React from "react";

export default function LoanApplicationsTab({
  applications,
  customers,
  onSelectCustomer,
  onSetPaymentAmount,
  onOpenModal
}) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-100 space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Application Processing</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
            <tr>
              <th className="p-3">App ID</th>
              <th className="p-3">Customer Name</th>
              <th className="p-3">Loan Amount</th>
              <th className="p-3">Date</th>
              <th className="p-3">Stage</th>
              <th className="p-3 text-right">Generate Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map(app => (
              <tr key={app.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-medium text-slate-800">{app.id}</td>
                <td className="p-3 font-semibold text-slate-900">{app.customerName}</td>
                <td className="p-3 font-semibold">₹{app.amount.toLocaleString()}</td>
                <td className="p-3 text-xs text-slate-500">{app.date}</td>
                <td className="p-3">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">{app.stage}</span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      const cust = customers.find(c => c.id === app.customerId);
                      onSelectCustomer(cust || { id: app.customerId, name: app.customerName });
                      onSetPaymentAmount(app.amount * 0.01);
                      onOpenModal("payment");
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Payment Request
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

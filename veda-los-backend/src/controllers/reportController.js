const ExcelJS = require("exceljs");
const reportModel = require("../models/reportModel");

async function dashboard(req, res) {
  res.json(await reportModel.dashboardStats());
}

async function registrations(req, res) {
  res.json(await reportModel.registrationTrends());
}

async function paymentsSummary(req, res) {
  res.json(await reportModel.paymentsSummary());
}

async function eligibilityStats(req, res) {
  res.json(await reportModel.eligibilityStats());
}

async function managerPerformance(req, res) {
  res.json(await reportModel.managerPerformance());
}

// Turns "monthly" / "quarterly" / "yearly" into an actual { from, to } date
// range, always ending "now". Calendar-based (e.g. "monthly" = 1st of the
// current month to today), not a rolling 30-day window — matches how most
// people mean "this month's report".
function getDateRangeForPeriod(period) {
  const now = new Date();
  let from;

  if (period === "quarterly") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    from = new Date(now.getFullYear(), quarterStartMonth, 1);
  } else if (period === "yearly") {
    from = new Date(now.getFullYear(), 0, 1);
  } else {
    // default: monthly
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { from, to: now };
}

// NEW — GET /api/reports/export?period=monthly|quarterly|yearly
// or GET /api/reports/export?from=2026-01-01&to=2026-03-31 for a custom range.
// Streams an .xlsx file directly — there is no JSON response for this route.
async function exportReport(req, res) {
  const { period, from, to } = req.query;

  let range;
  if (from && to) {
    range = { from: new Date(from), to: new Date(to) };
  } else {
    range = getDateRangeForPeriod(period || "monthly");
  }

  if (isNaN(range.from.getTime()) || isNaN(range.to.getTime())) {
    return res.status(400).json({ message: "Invalid date range. Use ?period=monthly|quarterly|yearly or ?from=YYYY-MM-DD&to=YYYY-MM-DD" });
  }

  const rows = await reportModel.exportData(range);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Veda Finance LOS & CRM";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Report");
  sheet.columns = [
    { header: "Reference ID", key: "reference_id", width: 18 },
    { header: "Customer Name", key: "full_name", width: 24 },
    { header: "Mobile", key: "mobile_number", width: 16 },
    { header: "Email", key: "email", width: 26 },
    { header: "Manager", key: "manager_name", width: 20 },
    { header: "Status", key: "status", width: 18 },
    { header: "Registered On", key: "registered_at", width: 20 },
    { header: "Last Updated", key: "last_updated", width: 20 },
    { header: "Amount Collected (₹)", key: "amount_collected", width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F1C2E" } };
  sheet.getRow(1).eachCell((cell) => { cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; });

  rows.forEach((row) => {
    sheet.addRow({
      ...row,
      registered_at: row.registered_at ? new Date(row.registered_at).toLocaleString("en-IN") : "",
      last_updated: row.last_updated ? new Date(row.last_updated).toLocaleString("en-IN") : "",
    });
  });

  const rangeLabel = period || `${from}_to_${to}`;
  const filename = `veda-finance-report-${rangeLabel}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = {
  dashboard, registrations, paymentsSummary, eligibilityStats, managerPerformance, exportReport,
};
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const managerRoutes = require("./routes/managers");
const customerRoutes = require("./routes/customers");
const myCustomerRoutes = require("./routes/myCustomers");
const myApplicationRoutes = require("./routes/myApplications");
const documentRoutes = require("./routes/documents");
const applicationRoutes = require("./routes/applications");
const paymentRoutes = require("./routes/payments");
const reportRoutes = require("./routes/reports");
const auditLogRoutes = require("./routes/auditLogs");
const notificationRoutes = require("./routes/notifications"); 

const app = express();
console.log("Backend started");
console.log("CORS Origin:", "https://dhanicapfinance.com");
// Only allow requests from the frontend's local URL (set in .env)
app.use(cors({ origin: "https://dhanicapfinance.com" }));

// The `verify` callback stashes the raw request body on req.rawBody before
// it's parsed into req.body. Cashfree's webhook signature is computed over
// the exact raw bytes it sent — re-stringifying the parsed JSON later can
// produce different bytes (key order, spacing) and silently break
// verification, so the raw body is captured here once, globally.
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); },
}));

// Serves uploaded documents (e.g. /uploads/171234-aadhaar.pdf) as static files.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Basic health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Veda LOS & CRM API" });
});

// Confirms the PostgreSQL connection actually works
app.get("/api/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/my", myCustomerRoutes);
app.use("/api/my", myApplicationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5170;
app.listen(PORT, () => console.log(`Veda LOS & CRM API running on http://localhost:${PORT}`));
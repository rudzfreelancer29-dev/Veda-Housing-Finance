const pool = require("../db");

const PENDING = ["new_registration", "under_review", "documents_pending", "on_hold"];
const APPROVED = ["eligible", "payment_pending", "payment_completed", "loan_processing"];

async function dashboardStats() {
  const { rows: totalRows } = await pool.query(`SELECT COUNT(*)::int AS count FROM applications`);
  const { rows: statusRows } = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM applications GROUP BY status`
  );

  const countFor = (statuses) =>
    statusRows.filter((r) => statuses.includes(r.status)).reduce((sum, r) => sum + r.count, 0);
  const countOne = (status) => statusRows.find((r) => r.status === status)?.count || 0;

  const { rows: recentActivities } = await pool.query(
    `SELECT a.id AS application_id, a.status, a.updated_at, c.full_name, c.reference_id
     FROM applications a JOIN customers c ON c.id = a.customer_id
     ORDER BY a.updated_at DESC LIMIT 10`
  );

  return {
    totalApplications: totalRows[0].count,
    activeApplications: totalRows[0].count - countOne("completed") - countOne("rejected"),
    pendingApplications: countFor(PENDING),
    approvedApplications: countFor(APPROVED),
    rejectedApplications: countOne("rejected"),
    completedApplications: countOne("completed"),
    recentActivities,
  };
}

async function registrationTrends() {
  const { rows: totalRows } = await pool.query(`SELECT COUNT(*)::int AS count FROM customers`);
  const { rows: monthly } = await pool.query(`
    SELECT TO_CHAR(created_at, 'Mon YYYY') AS month, COUNT(*)::int AS count
    FROM customers
    GROUP BY 1, DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) DESC
    LIMIT 6
  `);
  return { totalRegistrations: totalRows[0].count, monthlyTrends: monthly.reverse() };
}

async function paymentsSummary() {
  const { rows } = await pool.query(`
    SELECT status, COALESCE(SUM(amount), 0)::float AS total, COUNT(*)::int AS count
    FROM payments GROUP BY status
  `);
  const find = (status) => rows.find((r) => r.status === status) || { total: 0, count: 0 };
  return {
    collected: find("successful").total,
    pending: find("pending").total,
    failed: find("failed").total,
    refunded: find("refunded").total,
  };
}

async function eligibilityStats() {
  const { rows: totalRows } = await pool.query(`SELECT COUNT(*)::int AS count FROM applications`);
  const { rows: statusRows } = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM applications GROUP BY status`
  );
  const countFor = (statuses) =>
    statusRows.filter((r) => statuses.includes(r.status)).reduce((sum, r) => sum + r.count, 0);

  return {
    totalApplications: totalRows[0].count,
    eligible: countFor(APPROVED.concat(["completed"])),
    rejected: countFor(["rejected"]),
    pendingAssessment: countFor(PENDING),
  };
}

async function managerPerformance() {
  const { rows } = await pool.query(`
    SELECT
      u.id AS manager_id,
      u.name AS manager_name,
      COALESCE(app_stats.applications_processed, 0)::int AS applications_processed,
      COALESCE(app_stats.completed_count, 0)::int AS completed_count,
      COALESCE(app_stats.rejected_count, 0)::int AS rejected_count,
      COALESCE(cust_stats.registrations_completed, 0)::int AS registrations_completed
    FROM users u
    LEFT JOIN (
      SELECT assigned_to,
             COUNT(*) AS applications_processed,
             COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
             COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_count
      FROM applications
      GROUP BY assigned_to
    ) app_stats ON app_stats.assigned_to = u.id
    LEFT JOIN (
      SELECT created_by, COUNT(*) AS registrations_completed
      FROM customers
      GROUP BY created_by
    ) cust_stats ON cust_stats.created_by = u.id
    WHERE u.role = 'manager'
    ORDER BY applications_processed DESC NULLS LAST
  `);

  return rows.map((r) => ({
    ...r,
    conversion_rate: r.applications_processed > 0
      ? Number(((r.completed_count / r.applications_processed) * 100).toFixed(1))
      : 0,
  }));
}

// NEW — powers the downloadable Excel report (owner's request: monthly /
// quarterly / yearly filter). One row per application, joined with its
// customer, assigned manager, and total amount actually collected against
// it. `from`/`to` are JS Date objects — the period math lives in the
// controller, this just runs the query for whatever range it's given.
async function exportData({ from, to }) {
  const { rows } = await pool.query(
    `SELECT
       c.reference_id,
       c.full_name,
       c.mobile_number,
       c.email,
       u.name AS manager_name,
       a.status,
       a.created_at AS registered_at,
       a.updated_at AS last_updated,
       COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'successful'), 0)::float AS amount_collected
     FROM applications a
     JOIN customers c ON c.id = a.customer_id
     LEFT JOIN users u ON u.id = a.assigned_to
     LEFT JOIN payments p ON p.application_id = a.id
     WHERE a.created_at >= $1 AND a.created_at <= $2
     GROUP BY c.reference_id, c.full_name, c.mobile_number, c.email, u.name,
              a.status, a.created_at, a.updated_at
     ORDER BY a.created_at DESC`,
    [from, to]
  );
  return rows;
}

module.exports = {
  dashboardStats, registrationTrends, paymentsSummary, eligibilityStats,
  managerPerformance, exportData,
};
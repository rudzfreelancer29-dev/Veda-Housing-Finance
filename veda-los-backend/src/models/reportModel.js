const pool = require("../db");

// Status buckets used across reports. Documented here once so the mapping
// logic doesn't get silently duplicated/out-of-sync across queries.
// - Pending: not yet reviewed or waiting on the customer
// - Approved: past initial review, moving toward disbursal (no credit
//   bureau step in this build, so "eligible" is decided manually by a Manager)
// - Rejected / Completed: terminal states
const PENDING = ["new_registration", "under_review", "documents_pending", "on_hold"];
const APPROVED = ["eligible", "payment_pending", "payment_completed", "loan_processing"];

// PDF Section 4 (Dashboard Features): Total / Active / Pending / Approved /
// Rejected / Completed Applications + Recent Activities.
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

// PDF Section 8 (Administrative Reports): Total Customer Registrations +
// Monthly Registration Trends.
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

// PDF Section 8: Payment Collection Summary. Will show zeros until the
// Manager-side "collect payment" API (a later phase) is actually creating rows.
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

// PDF Section 8: Loan Eligibility Statistics. No credit bureau in this
// build, so "eligible" reflects the Manager's manual status update, not a
// credit score.
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

// PDF Section 8: Manager Performance Reports — Applications Processed,
// Registrations Completed, Status Conversion Analysis.
//
// Applications and customers are pre-aggregated in separate subqueries
// before joining to users — joining both raw tables directly to `users`
// at once would fan out (e.g. 4 applications x 4 customers = 16 rows for
// one manager), silently inflating every count.
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

module.exports = { dashboardStats, registrationTrends, paymentsSummary, eligibilityStats, managerPerformance };
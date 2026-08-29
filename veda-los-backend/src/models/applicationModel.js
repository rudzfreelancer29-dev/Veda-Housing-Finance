const pool = require("../db");

const VALID_STATUSES = [
  "new_registration", "under_review", "documents_pending", "eligible",
  "payment_pending", "payment_completed", "loan_processing", "completed",
  "rejected", "on_hold",
];

async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM applications WHERE id = $1`, [id]);
  return rows[0];
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0];
}

module.exports = { VALID_STATUSES, findById, updateStatus };
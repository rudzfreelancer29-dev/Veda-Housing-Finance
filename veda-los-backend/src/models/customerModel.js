const pool = require("../db");

// PDF Section 2.1: Super Admin can "View and manage all customer
// applications" — so this always returns every customer, across all
// managers (no manager-scoping filter here, unlike a Manager's own view).
async function findAll({ search } = {}) {
  const params = [];
  let where = "";
  if (search) {
    params.push(`%${search}%`);
    where = `WHERE c.full_name ILIKE $1 OR c.mobile_number ILIKE $1 OR c.email ILIKE $1 OR c.reference_id ILIKE $1`;
  }

  const { rows } = await pool.query(
    `SELECT c.*, u.name AS registered_by_name,
            a.id AS application_id, a.status AS application_status
     FROM customers c
     LEFT JOIN users u ON u.id = c.created_by
     LEFT JOIN applications a ON a.customer_id = c.id
     ${where}
     ORDER BY c.created_at DESC`,
    params
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT c.*, u.name AS registered_by_name
     FROM customers c
     LEFT JOIN users u ON u.id = c.created_by
     WHERE c.id = $1`,
    [id]
  );
  if (!rows[0]) return null;

  const { rows: applications } = await pool.query(
    `SELECT a.*, m.name AS assigned_manager_name
     FROM applications a
     LEFT JOIN users m ON m.id = a.assigned_to
     WHERE a.customer_id = $1
     ORDER BY a.created_at DESC`,
    [id]
  );

  return { ...rows[0], applications };
}

async function deletePermanently(id) {
  const { rowCount } = await pool.query(`DELETE FROM customers WHERE id = $1`, [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, deletePermanently };
const pool = require("../db");

// All queries here are scoped to role = 'manager' â€” this file can never
// accidentally read/edit/delete a Super Admin account, even if a bug
// upstream passes in the wrong id.

async function findAll() {
  const { rows } = await pool.query(
    `SELECT id, name, email, mobile_number, role, is_active, created_at
     FROM users WHERE role = 'manager' ORDER BY created_at DESC`
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, mobile_number, role, is_active, created_at
     FROM users WHERE id = $1 AND role = 'manager'`,
    [id]
  );
  return rows[0];
}

async function create({ name, email, mobile_number, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, mobile_number, password_hash, role)
     VALUES ($1,$2,$3,$4,'manager')
     RETURNING id, name, email, mobile_number, role, is_active, created_at`,
    [name, email, mobile_number, passwordHash]
  );
  return rows[0];
}

async function update(id, { name, email }) {
  const { rows } = await pool.query(
    `UPDATE users SET name = $1, email = $2
     WHERE id = $3 AND role = 'manager'
     RETURNING id, name, email, mobile_number, role, is_active, created_at`,
    [name, email, id]
  );
  return rows[0];
}

async function setActiveStatus(id, isActive) {
  const { rows } = await pool.query(
    `UPDATE users SET is_active = $1
     WHERE id = $2 AND role = 'manager'
     RETURNING id, name, email, mobile_number, role, is_active, created_at`,
    [isActive, id]
  );
  return rows[0];
}

async function deletePermanently(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM users WHERE id = $1 AND role = 'manager'`,
    [id]
  );
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, setActiveStatus, deletePermanently };
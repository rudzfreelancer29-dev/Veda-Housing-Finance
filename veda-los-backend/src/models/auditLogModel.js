const pool = require("../db");

async function record({ userId, action, entity, entityId, details }) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES ($1,$2,$3,$4,$5)`,
    [userId, action, entity || null, entityId || null, details || null]
  );
}

async function findAll({ userId, action, from, to } = {}) {
  const clauses = [];
  const params = [];

  if (userId) { params.push(userId); clauses.push(`a.user_id = $${params.length}`); }
  if (action) { params.push(action); clauses.push(`a.action = $${params.length}`); }
  if (from) { params.push(from); clauses.push(`a.created_at >= $${params.length}`); }
  if (to) { params.push(to); clauses.push(`a.created_at <= $${params.length}`); }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT a.*, u.name AS user_name, u.role AS user_role
     FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
     ${where}
     ORDER BY a.created_at DESC LIMIT 200`,
    params
  );
  return rows;
}

module.exports = { record, findAll };
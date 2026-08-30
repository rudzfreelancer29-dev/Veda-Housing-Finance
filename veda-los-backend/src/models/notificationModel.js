const pool = require("../db");

async function findAll() {
  const { rows } = await pool.query(
    `SELECT n.*, u.name AS actor_name FROM admin_notifications n
     LEFT JOIN users u ON u.id = n.actor_user_id
     ORDER BY n.created_at DESC LIMIT 30`
  );
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM admin_notifications WHERE is_read = FALSE`
  );
  return { notifications: rows, unreadCount: countRows[0].count };
}

async function markRead(id) {
  const { rowCount } = await pool.query(
    `UPDATE admin_notifications SET is_read = TRUE WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

async function markAllRead() {
  await pool.query(`UPDATE admin_notifications SET is_read = TRUE WHERE is_read = FALSE`);
}

async function create({ actorUserId, message, entity, entityId }) {
  await pool.query(
    `INSERT INTO admin_notifications (actor_user_id, message, entity, entity_id) VALUES ($1,$2,$3,$4)`,
    [actorUserId, message, entity || null, entityId || null]
  );
}

module.exports = { findAll, markRead, markAllRead, create };
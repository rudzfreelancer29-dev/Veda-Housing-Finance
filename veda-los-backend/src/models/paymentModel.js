const pool = require("../db");

async function findLatestApplicationForCustomer(customerId) {
  const { rows } = await pool.query(
    `SELECT * FROM applications WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [customerId]
  );
  return rows[0];
}

async function create({ applicationId, amount, feeType, gatewayOrderId }) {
  const { rows } = await pool.query(
    `INSERT INTO payments (application_id, amount, fee_type, status, gateway_order_id)
     VALUES ($1,$2,$3,'pending',$4) RETURNING *`,
    [applicationId, amount, feeType || "processing_fee", gatewayOrderId || null]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM payments WHERE id = $1`, [id]);
  return rows[0];
}

async function findByGatewayOrderId(orderId) {
  const { rows } = await pool.query(`SELECT * FROM payments WHERE gateway_order_id = $1`, [orderId]);
  return rows[0];
}

async function findByCustomerId(customerId) {
  const { rows } = await pool.query(
    `SELECT p.* FROM payments p
     JOIN applications a ON a.id = p.application_id
     WHERE a.customer_id = $1
     ORDER BY p.created_at DESC`,
    [customerId]
  );
  return rows;
}

async function updateStatus(id, status, gatewayPaymentId) {
  const { rows } = await pool.query(
    `UPDATE payments SET status = $1, gateway_payment_id = COALESCE($2, gateway_payment_id), updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, gatewayPaymentId || null, id]
  );
  return rows[0];
}

module.exports = {
  findLatestApplicationForCustomer, create, findById,
  findByGatewayOrderId, findByCustomerId, updateStatus,
};
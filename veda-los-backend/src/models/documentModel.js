const pool = require("../db");

async function create({ customerId, docType, fileName, filePath, uploadedBy }) {
  const { rows } = await pool.query(
    `INSERT INTO documents (customer_id, doc_type, file_name, file_path, uploaded_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [customerId, docType, fileName, filePath, uploadedBy]
  );
  return rows[0];
}

async function findByCustomerId(customerId) {
  const { rows } = await pool.query(
    `SELECT d.*, u.name AS uploaded_by_name FROM documents d
     LEFT JOIN users u ON u.id = d.uploaded_by
     WHERE d.customer_id = $1 ORDER BY d.uploaded_at DESC`,
    [customerId]
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM documents WHERE id = $1`, [id]);
  return rows[0];
}

async function deletePermanently(id) {
  const { rowCount } = await pool.query(`DELETE FROM documents WHERE id = $1`, [id]);
  return rowCount > 0;
}

module.exports = { create, findByCustomerId, findById, deletePermanently };
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
  // ON DELETE CASCADE on applications/payments means this also removes
  // that customer's application + payment history — matches PDF Section
  // 2.1's "permanently delete customer records" (Admin-only capability;
  // Managers are explicitly restricted from this per Section 2.2).
  const { rowCount } = await pool.query(`DELETE FROM customers WHERE id = $1`, [id]);
  return rowCount > 0;
}

// PDF Section 3: Customer Registration Module. Creates the customer row,
// generates its unique reference ID from the row's own serial id (avoids
// race conditions vs. counting existing rows), and opens the first
// application record in 'new_registration' status.
async function create({
  fullName, mobileNumber, email, dateOfBirth, panNumber, aadhaarNumber,
  employmentDetails, monthlyIncome, loanRequirementDetails, createdBy,
}) {
  const { rows } = await pool.query(
    `INSERT INTO customers (
       reference_id, full_name, mobile_number, email, date_of_birth,
       pan_number, aadhaar_number, employment_details, monthly_income,
       loan_requirement_details, created_by
     ) VALUES ('TEMP', $1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, created_at`,
    [fullName, mobileNumber, email, dateOfBirth || null, panNumber, aadhaarNumber,
     employmentDetails, monthlyIncome, loanRequirementDetails, createdBy]
  );
  const { id, created_at } = rows[0];
  const referenceId = `VF-${new Date(created_at).getFullYear()}-${String(id).padStart(5, "0")}`;
  await pool.query(`UPDATE customers SET reference_id = $1 WHERE id = $2`, [referenceId, id]);

  await pool.query(
    `INSERT INTO applications (customer_id, status, assigned_to) VALUES ($1, 'new_registration', $2)`,
    [id, createdBy]
  );

  return findById(id);
}

const UPDATABLE_FIELDS = [
  "full_name", "mobile_number", "email", "date_of_birth", "pan_number",
  "aadhaar_number", "employment_details", "monthly_income", "loan_requirement_details",
];

async function update(id, fields) {
  const sets = [];
  const params = [];
  for (const key of UPDATABLE_FIELDS) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${key} = $${params.length}`);
    }
  }
  if (sets.length === 0) return findById(id);

  params.push(id);
  await pool.query(`UPDATE customers SET ${sets.join(", ")} WHERE id = $${params.length}`, params);
  return findById(id);
}

// Manager's own scoped view (PDF Section 2.2 — separate from Super Admin's
// "view all" in findAll() above).
async function findAllByManager(managerId, { search } = {}) {
  const params = [managerId];
  let extra = "";
  if (search) {
    params.push(`%${search}%`);
    extra = ` AND (c.full_name ILIKE $${params.length} OR c.mobile_number ILIKE $${params.length} OR c.reference_id ILIKE $${params.length})`;
  }

  const { rows } = await pool.query(
    `SELECT c.*, a.id AS application_id, a.status AS application_status
     FROM customers c
     LEFT JOIN applications a ON a.customer_id = c.id
     WHERE c.created_by = $1 ${extra}
     ORDER BY c.created_at DESC`,
    params
  );
  return rows;
}

async function findByIdForManager(id, managerId) {
  const customer = await findById(id);
  if (!customer || customer.created_by !== managerId) return null;
  return customer;
}

module.exports = {
  findAll, findById, deletePermanently, create, update, findAllByManager, findByIdForManager,
};
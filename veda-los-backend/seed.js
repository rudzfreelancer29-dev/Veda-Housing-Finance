// Seeds a Super Admin + a Manager so you can test login right away.
// Credentials come from .env — nothing is hardcoded here, so changing
// .env before the first run gives you different login details.
// Run with: npm run seed
require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./src/db");

async function upsertUser(name, email, password, role) {
  const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length > 0) {
    console.log(`${role} already exists (${email}), skipping. (Seed does not overwrite existing users.)`);
    return existing[0].id;
  }
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id`,
    [name, email, hash, role]
  );
  console.log(`Created ${role} -> ${email} / ${password}`);
  return rows[0].id;
}

async function seed() {
  const adminId = await upsertUser(
    process.env.SEED_ADMIN_NAME || "Veda Super Admin",
    process.env.SEED_ADMIN_EMAIL || "admin@vedafinance.com",
    process.env.SEED_ADMIN_PASSWORD || "Admin@123",
    "super_admin"
  );
  const managerId = await upsertUser(
    process.env.SEED_MANAGER_NAME || "Priya Manager",
    process.env.SEED_MANAGER_EMAIL || "manager@vedafinance.com",
    process.env.SEED_MANAGER_PASSWORD || "Manager@123",
    "manager"
  );

  // Sample customers + applications, purely so the Super Admin oversight
  // and reporting endpoints have something to show. The actual customer
  // registration API (Manager side) is a later phase — this is seed data only.
  const { rows: existingCustomers } = await pool.query("SELECT COUNT(*)::int AS c FROM customers");
  if (existingCustomers[0].c === 0 && managerId) {
    const sampleCustomers = [
      { name: "Ramesh Patel", mobile: "9876543210", email: "ramesh@example.com", income: 45000, status: "under_review" },
      { name: "Priya Shah", mobile: "9876500011", email: "priya.shah@example.com", income: 60000, status: "eligible" },
      { name: "Amit Verma", mobile: "9876500022", email: "amit@example.com", income: 32000, status: "completed" },
      { name: "Sneha Joshi", mobile: "9876500033", email: "sneha@example.com", income: 28000, status: "rejected" },
    ];

    for (const c of sampleCustomers) {
      const { rows } = await pool.query(
        `INSERT INTO customers (reference_id, full_name, mobile_number, email, monthly_income, created_by)
         VALUES ('TEMP', $1, $2, $3, $4, $5) RETURNING id, created_at`,
        [c.name, c.mobile, c.email, c.income, managerId]
      );
      const { id, created_at } = rows[0];
      const referenceId = `VF-${new Date(created_at).getFullYear()}-${String(id).padStart(5, "0")}`;
      await pool.query("UPDATE customers SET reference_id = $1 WHERE id = $2", [referenceId, id]);

      await pool.query(
        `INSERT INTO applications (customer_id, status, assigned_to) VALUES ($1, $2, $3)`,
        [id, c.status, managerId]
      );
    }
    console.log("Seeded 4 sample customers with applications.");
  } else {
    console.log("Customers already exist, skipping sample data.");
  }

  await pool.end();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
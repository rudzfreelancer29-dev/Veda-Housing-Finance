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
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)`,
    [name, email, hash, role]
  );
  console.log(`Created ${role} -> ${email} / ${password}`);
}

async function seed() {
  await upsertUser(
    process.env.SEED_ADMIN_NAME || "Veda Super Admin",
    process.env.SEED_ADMIN_EMAIL || "admin@vedafinance.com",
    process.env.SEED_ADMIN_PASSWORD || "Admin@123",
    "super_admin"
  );
  await upsertUser(
    process.env.SEED_MANAGER_NAME || "Veda Manager",
    process.env.SEED_MANAGER_EMAIL || "manager@vedafinance.com",
    process.env.SEED_MANAGER_PASSWORD || "Manager@123",
    "manager"
  );
  await pool.end();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
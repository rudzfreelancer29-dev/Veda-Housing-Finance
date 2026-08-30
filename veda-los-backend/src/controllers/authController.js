const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { sendEmail } = require("../utils/mailer");
const auditLogModel = require("../models/auditLogModel");

const RESET_TOKEN_EXPIRY_MINUTES = parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || "30", 10);

// Reset tokens are hashed before being stored — so even if the database
// leaks, the raw token (the one emailed to the user) can never be
// reconstructed from what's in the database. Same principle as passwords.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function sendResetEmail(to, rawToken) {
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;
  await sendEmail({
    to,
    subject: "Reset your Veda Finance password",
    html: `
      <p>We received a request to reset your Veda Finance LOS &amp; CRM password.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });
  return resetLink;
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1 AND is_active = TRUE", [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );

  // PDF Section 9: "User Login Activity" audit log entry.
  await auditLogModel.record({
    userId: user.id,
    action: "login",
    entity: "users",
    entityId: user.id,
    details: `${user.role} logged in`,
  });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

async function me(req, res) {
  res.json({ user: req.user });
}

// Step 1 of password reset: user submits their email. We generate a
// one-time random token, store only its HASH, and "email" the raw token
// (mocked for now — see sendResetEmail above).
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const { rows } = await pool.query("SELECT id FROM users WHERE email = $1 AND is_active = TRUE", [email]);

  // Respond the same way whether or not the email exists — this avoids
  // leaking which emails are registered in the system to an attacker.
  if (rows[0]) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_token_hash = $1, reset_token_expires = $2 WHERE id = $3",
      [tokenHash, expires, rows[0].id]
    );

    await sendResetEmail(email, rawToken);
  }

  res.json({ message: "If that email is registered, a password reset link has been sent." });
}

// Step 2 of password reset: user submits the raw token (from the emailed
// link) + a new password. We hash the incoming token and compare it
// against the stored hash — never comparing raw tokens.
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Token and newPassword are required" });
  if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  const tokenHash = hashToken(token);
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE reset_token_hash = $1 AND reset_token_expires > NOW()",
    [tokenHash]
  );
  const user = rows[0];
  if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired" });

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    "UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = $2",
    [newHash, user.id]
  );

  res.json({ message: "Password has been reset successfully. You can now log in." });
}

module.exports = { login, me, forgotPassword, resetPassword };
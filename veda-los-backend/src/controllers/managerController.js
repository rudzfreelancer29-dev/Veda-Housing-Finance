const bcrypt = require("bcryptjs");
const managerModel = require("../models/managerModel");

// PDF Section 2.1: Super Admin can "Create, edit, activate, deactivate,
// and delete Manager accounts." All 5 functions below map to that list.

async function listManagers(req, res) {
  const managers = await managerModel.findAll();
  res.json(managers);
}

async function createManager(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const manager = await managerModel.create({ name, email, passwordHash });
    res.status(201).json(manager);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "A user with this email already exists" });
    throw err;
  }
}

async function updateManager(req, res) {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "name and email are required" });

  try {
    const manager = await managerModel.update(req.params.id, { name, email });
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    res.json(manager);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "A user with this email already exists" });
    throw err;
  }
}

async function setManagerStatus(req, res) {
  const { is_active } = req.body;
  if (typeof is_active !== "boolean") {
    return res.status(400).json({ message: "is_active must be true or false" });
  }

  const manager = await managerModel.setActiveStatus(req.params.id, is_active);
  if (!manager) return res.status(404).json({ message: "Manager not found" });
  res.json(manager);
}

async function deleteManager(req, res) {
  const deleted = await managerModel.deletePermanently(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Manager not found" });
  res.json({ message: "Manager account permanently deleted" });
}

module.exports = { listManagers, createManager, updateManager, setManagerStatus, deleteManager };
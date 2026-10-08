const bcrypt = require("bcryptjs");
const managerModel = require("../models/managerModel");
const auditLogModel = require("../models/auditLogModel");
const { sendEmail } = require("../utils/mailer");
const { sendSms } = require("../utils/sms");
const { managerRegistrationEmail } = require("../utils/emailTemplates");

// PDF Section 2.1: Super Admin can "Create, edit, activate, deactivate,
// and delete Manager accounts." All 5 functions below map to that list.

async function listManagers(req, res) {
  const managers = await managerModel.findAll();
  res.json(managers);
}

async function createManager(req, res) {
  const { name, email, mobile_number, password } = req.body;
  if (!name || !email || !mobile_number || !password) {
    return res.status(400).json({ message: "name, email, mobile_number and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const manager = await managerModel.create({ name, email, mobile_number, passwordHash });
    await auditLogModel.record({
      userId: req.user.id,
      action: "create_manager",
      entity: "users",
      entityId: manager.id,
      details: `Created manager account: ${manager.email}`,
    });

    // Registration-success notifications (email + SMS). A failure here must
    // NOT undo or fail the manager creation, so each is isolated.
    try {
      await sendEmail({
        to: manager.email,
        subject: "Welcome to Dhanicap Finance — your manager registration is successful",
        html: managerRegistrationEmail({ managerName: manager.name, email: manager.email }),
      });
    } catch (e) {
      console.error("Manager registration email failed:", e.message);
    }

    try {
      await sendSms({
        to: mobile_number,
        message: `Dear ${manager.name}, your Dhanicap Finance manager registration is successful. You can now log in using your registered email.`,
      });
    } catch (e) {
      console.error("Manager registration SMS failed:", e.message);
    }

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
    await auditLogModel.record({
      userId: req.user.id,
      action: "update_manager",
      entity: "users",
      entityId: manager.id,
      details: `Updated manager profile: ${manager.email}`,
    });
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
  await auditLogModel.record({
    userId: req.user.id,
    action: is_active ? "activate_manager" : "deactivate_manager",
    entity: "users",
    entityId: manager.id,
    details: `${is_active ? "Activated" : "Deactivated"} manager: ${manager.email}`,
  });
  res.json(manager);
}

async function deleteManager(req, res) {
  // Fetch details first â€” once deleted, the row is gone, and the audit
  // log needs to say *who* was deleted, not just "manager id=5".
  const manager = await managerModel.findById(req.params.id);
  if (!manager) return res.status(404).json({ message: "Manager not found" });

  await managerModel.deletePermanently(req.params.id);
  await auditLogModel.record({
    userId: req.user.id,
    action: "delete_manager",
    entity: "users",
    entityId: manager.id,
    details: `Permanently deleted manager account: ${manager.email}`,
  });
  res.json({ message: "Manager account permanently deleted" });
}

module.exports = { listManagers, createManager, updateManager, setManagerStatus, deleteManager };
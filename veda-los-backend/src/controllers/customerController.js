const customerModel = require("../models/customerModel");
const auditLogModel = require("../models/auditLogModel");
const notificationModel = require("../models/notificationModel");
const { sendEmail } = require("../utils/mailer");
const { sendSms } = require("../utils/sms");

// ---- Super Admin oversight (unchanged behaviour) ----

async function listCustomers(req, res) {
  const { search } = req.query;
  const customers = await customerModel.findAll({ search });
  res.json(customers);
}

async function getCustomer(req, res) {
  const customer = await customerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
}

async function deleteCustomer(req, res) {
  const deleted = await customerModel.deletePermanently(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Customer not found" });
  res.json({ message: "Customer record permanently deleted" });
}

// ---- PDF Section 3: Customer Registration Module (Manager) ----

async function createCustomer(req, res) {
  const {
    fullName, mobileNumber, email, dateOfBirth, panNumber, aadhaarNumber,
    employmentDetails, monthlyIncome, loanRequirementDetails,
  } = req.body;

  if (!fullName || !mobileNumber) {
    return res.status(400).json({ message: "fullName and mobileNumber are required" });
  }

  const customer = await customerModel.create({
    fullName, mobileNumber, email, dateOfBirth, panNumber, aadhaarNumber,
    employmentDetails, monthlyIncome, loanRequirementDetails, createdBy: req.user.id,
  });

  await auditLogModel.record({
    userId: req.user.id,
    action: "register_customer",
    entity: "customers",
    entityId: customer.id,
    details: `Registered customer: ${customer.full_name} (${customer.reference_id})`,
  });

  // PDF Section 3 "Automated Notifications" — confirmation + reference number.
  if (customer.email) {
    await sendEmail({
      to: customer.email,
      subject: "Registration Successful - Veda Finance",
      html: `<p>Dear ${customer.full_name},</p>
             <p>Your registration with Veda Finance is successful.</p>
             <p>Your application reference number is <strong>${customer.reference_id}</strong>.</p>`,
    });
  }
  await sendSms({
    to: customer.mobile_number,
    message: `Dear ${customer.full_name}, your Veda Finance registration is successful. Ref: ${customer.reference_id}`,
  });

  // PDF Section 2.1: Super Admin dashboard notification bell — the real
  // trigger this was originally built for.
  await notificationModel.create({
    actorUserId: req.user.id,
    message: `${req.user.name} registered a new customer: ${customer.full_name} (${customer.reference_id})`,
    entity: "customers",
    entityId: customer.id,
  });

  res.status(201).json(customer);
}

async function updateCustomer(req, res) {
  const existing = await customerModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Customer not found" });

  // Managers may only edit customers they themselves registered; Super
  // Admin can edit any (matches the oversight pattern used elsewhere).
  if (req.user.role === "manager" && existing.created_by !== req.user.id) {
    return res.status(403).json({ message: "You can only edit customers you registered" });
  }

  const updated = await customerModel.update(req.params.id, {
    full_name: req.body.fullName,
    mobile_number: req.body.mobileNumber,
    email: req.body.email,
    date_of_birth: req.body.dateOfBirth,
    pan_number: req.body.panNumber,
    aadhaar_number: req.body.aadhaarNumber,
    employment_details: req.body.employmentDetails,
    monthly_income: req.body.monthlyIncome,
    loan_requirement_details: req.body.loanRequirementDetails,
  });

  await auditLogModel.record({
    userId: req.user.id,
    action: "update_customer",
    entity: "customers",
    entityId: updated.id,
    details: `Updated customer profile: ${updated.full_name}`,
  });

  res.json(updated);
}

// ---- PDF Section 2.2: Manager's own scoped view ----

async function listMyCustomers(req, res) {
  const { search } = req.query;
  const customers = await customerModel.findAllByManager(req.user.id, { search });
  res.json(customers);
}

async function getMyCustomer(req, res) {
  const customer = await customerModel.findByIdForManager(req.params.id, req.user.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
}

module.exports = {
  listCustomers, getCustomer, deleteCustomer,
  createCustomer, updateCustomer,
  listMyCustomers, getMyCustomer,
};
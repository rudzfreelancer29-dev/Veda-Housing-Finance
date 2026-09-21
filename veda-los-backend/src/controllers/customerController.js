const customerModel = require("../models/customerModel");
const auditLogModel = require("../models/auditLogModel");
const notificationModel = require("../models/notificationModel");
const { sendEmail } = require("../utils/mailer");
const { sendSms } = require("../utils/sms");
const { registrationEmail, customMessageEmail } = require("../utils/emailTemplates");

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

  if (customer.email) {
    await sendEmail({
      to: customer.email,
      subject: `Welcome to Dhanicap Finance — your reference is ${customer.reference_id}`,
      html: registrationEmail({
        customerName: customer.full_name,
        referenceId: customer.reference_id,
      }),
    });
  }

  await sendSms({
    to: customer.mobile_number,
    message: `Dear ${customer.full_name}, your Veda Finance registration is successful. Ref: ${customer.reference_id}`,
  });

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

// ---- NEW: PDF Section 2.2 "Send notifications to customers" â€” a free-text
// message the Manager writes themselves, as opposed to the fixed automated
// templates (registration, status change, payment) sent elsewhere.
//
// Sends to BOTH email and phone, but not the same way:
// - EMAIL carries the Manager's actual free-text subject + message in full.
// - SMS carries a fixed, generic "you have a new message â€” check your
//   email" alert, NOT the free-text content itself. This is not a
//   half-measure â€” it's a hard technical/regulatory constraint: Indian
//   telecom rules (DLT) require every business SMS to exactly match a
//   template pre-registered with the telecom operator. A Manager typing
//   arbitrary text and sending it as SMS would get silently blocked in
//   production the moment real MSG91 keys are added â€” it only "works"
//   locally because mock mode just logs to console instead of actually
//   calling MSG91. The generic alert text below should itself be
//   DLT-registered as one of the approved templates (see the Third-Party
//   Setup Guide document, MSG91 section) so this SMS actually delivers
//   once real keys are in place.
async function sendCustomMessage(req, res) {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: "subject and message are required" });
  }

  const customer = await customerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  if (customer.created_by !== req.user.id) {
    return res.status(403).json({ message: "You can only message customers you registered" });
  }

  if (!customer.email) {
    return res.status(400).json({ message: "This customer has no email address on file" });
  }

  await sendEmail({
    to: customer.email,
    subject,
    html: customMessageEmail({
      customerName: customer.full_name,
      message,
    }),
  });

  await sendSms({
    to: customer.mobile_number,
    message: `Dear ${customer.full_name}, you have a new message from Dhanicap Finance regarding ${customer.reference_id}. Please check your email for details.`,
  });

  await auditLogModel.record({
    userId: req.user.id,
    action: "send_custom_message",
    entity: "customers",
    entityId: customer.id,
    details: `Sent custom message "${subject}" to ${customer.full_name} (email + SMS alert)`,
  });

  res.json({ message: "Message sent successfully to both email and phone" });
}

module.exports = {
  listCustomers, getCustomer, deleteCustomer,
  createCustomer, updateCustomer,
  listMyCustomers, getMyCustomer,
  sendCustomMessage,
};
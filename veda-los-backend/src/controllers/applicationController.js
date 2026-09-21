const applicationModel = require("../models/applicationModel");
const customerModel = require("../models/customerModel");
const auditLogModel = require("../models/auditLogModel");
const { sendEmail } = require("../utils/mailer");
const { sendSms } = require("../utils/sms");
const { eligibilityEmail, statusUpdateEmail } = require("../utils/emailTemplates");

// PDF Section 7: "Eligibility Notification" and "Application Status
// Updates" â€” sent to the customer whenever their application status
// changes, regardless of whether a Super Admin or a Manager made the change.
async function notifyCustomerOfStatusChange(customerId, status) {
  const customer = await customerModel.findById(customerId);
  if (!customer) return;

  const isEligible = status === "eligible";
  const subject = isEligible
    ? `Congratulations ${customer.full_name} — your application is eligible`
    : `Application update for ${customer.reference_id}`;

  const message = isEligible
    ? `Congratulations ${customer.full_name}! Your loan application (Ref: ${customer.reference_id}) is eligible for processing.`
    : `Dear ${customer.full_name}, your application (Ref: ${customer.reference_id}) status has been updated to: ${status.replace(/_/g, " ")}.`;

  if (customer.email) {
    await sendEmail({
      to: customer.email,
      subject,
      html: isEligible
        ? eligibilityEmail({
            customerName: customer.full_name,
            referenceId: customer.reference_id,
          })
        : statusUpdateEmail({
            customerName: customer.full_name,
            referenceId: customer.reference_id,
            status,
          }),
    });
  }

  await sendSms({ to: customer.mobile_number, message });
}

// Super Admin override â€” can change the status of ANY application (PDF
// Section 2.1: "view and manage all customer applications").
async function updateApplicationStatus(req, res) {
  const { status } = req.body;
  if (!applicationModel.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${applicationModel.VALID_STATUSES.join(", ")}`,
    });
  }

  const application = await applicationModel.updateStatus(req.params.id, status);
  if (!application) return res.status(404).json({ message: "Application not found" });

  await auditLogModel.record({
    userId: req.user.id,
    action: "update_application_status",
    entity: "applications",
    entityId: application.id,
    details: `Status changed to '${status}' (Super Admin override)`,
  });

  await notifyCustomerOfStatusChange(application.customer_id, status);

  res.json(application);
}

// Manager's own scoped version â€” PDF Section 2.2: "Update customer
// application stages", restricted to applications assigned to them.
async function updateMyApplicationStatus(req, res) {
  const { status } = req.body;
  if (!applicationModel.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${applicationModel.VALID_STATUSES.join(", ")}`,
    });
  }

  const application = await applicationModel.findById(req.params.id);
  if (!application) return res.status(404).json({ message: "Application not found" });

  if (application.assigned_to !== req.user.id) {
    return res.status(403).json({ message: "You can only update applications assigned to you" });
  }

  const updated = await applicationModel.updateStatus(req.params.id, status);

  await auditLogModel.record({
    userId: req.user.id,
    action: "update_application_status",
    entity: "applications",
    entityId: updated.id,
    details: `Status changed to '${status}'`,
  });

  await notifyCustomerOfStatusChange(updated.customer_id, status);

  res.json(updated);
}

module.exports = { updateApplicationStatus, updateMyApplicationStatus };
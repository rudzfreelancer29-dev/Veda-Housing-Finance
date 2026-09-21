const pool = require("../db");
const paymentModel = require("../models/paymentModel");
const customerModel = require("../models/customerModel");
const auditLogModel = require("../models/auditLogModel");
const { sendEmail } = require("../utils/mailer");
const { sendSms } = require("../utils/sms");
const cashfree = require("../utils/cashfree");
const { paymentRequestEmail, paymentReceiptEmail } = require("../utils/emailTemplates");

async function assertAccessToCustomer(customerId, user) {
  const customer = await customerModel.findById(customerId);
  if (!customer) return { error: 404, message: "Customer not found" };
  if (user.role === "manager" && customer.created_by !== user.id) {
    return { error: 403, message: "You can only manage payments for customers you registered" };
  }
  return { customer };
}

async function createPaymentRequest(req, res) {
  const { customerId, amount, feeType } = req.body;
  if (!customerId || !amount) return res.status(400).json({ message: "customerId and amount are required" });

  const access = await assertAccessToCustomer(customerId, req.user);
  if (access.error) return res.status(access.error).json({ message: access.message });
  const customer = access.customer;

  const application = await paymentModel.findLatestApplicationForCustomer(customerId);
  if (!application) return res.status(400).json({ message: "Customer has no application to attach this payment to" });

  const orderId = `VF-PAY-${Date.now()}`;
  let gatewayInfo;
  try {
    gatewayInfo = await cashfree.createOrder({
      orderId, amount, customerId,
      customerPhone: customer.mobile_number,
      customerEmail: customer.email,
    });
  } catch (err) {
    return res.status(502).json({ message: "Payment gateway error", error: err.message });
  }

  const payment = await paymentModel.create({
    applicationId: application.id, amount, feeType, gatewayOrderId: orderId,
  });

  await auditLogModel.record({
    userId: req.user.id,
    action: "create_payment_request",
    entity: "payments",
    entityId: payment.id,
    details: `Payment request of â‚¹${amount} (${feeType || "processing_fee"}) for ${customer.full_name}`,
  });

  const paymentUrl = process.env.PAYMENT_PAGE_URL
    ? `${process.env.PAYMENT_PAGE_URL}?order_id=${encodeURIComponent(orderId)}`
    : null;

  if (customer.email) {
    await sendEmail({
      to: customer.email,
      subject: `Payment request for application ${customer.reference_id}`,
      html: paymentRequestEmail({
        customerName: customer.full_name,
        referenceId: customer.reference_id,
        amount,
        paymentUrl,
      }),
    });
  }

  await sendSms({
    to: customer.mobile_number,
    message: `Dear ${customer.full_name}, please complete a payment of Rs.${amount} for your Veda Finance application ${customer.reference_id}.`,
  });

  res.status(201).json({ payment, gateway: gatewayInfo });
}

async function listPayments(req, res) {
  const access = await assertAccessToCustomer(req.params.customerId, req.user);
  if (access.error) return res.status(access.error).json({ message: access.message });

  const payments = await paymentModel.findByCustomerId(req.params.customerId);
  res.json(payments);
}

async function updatePaymentStatus(req, res) {
  const { status } = req.body;
  if (!["pending", "successful", "failed", "refunded"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const payment = await paymentModel.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  const updated = await paymentModel.updateStatus(req.params.id, status);

  await auditLogModel.record({
    userId: req.user.id,
    action: "update_payment_status",
    entity: "payments",
    entityId: updated.id,
    details: `Payment status manually set to '${status}'`,
  });

  if (status === "successful") await sendPaymentConfirmation(updated);

  res.json(updated);
}

async function sendPaymentConfirmation(payment) {
  const { rows } = await pool.query(
    `SELECT c.* FROM customers c JOIN applications a ON a.customer_id = c.id WHERE a.id = $1`,
    [payment.application_id]
  );
  const customer = rows[0];
  if (!customer) return;

  if (customer.email) {
    await sendEmail({
      to: customer.email,
      subject: `Payment received — receipt PAY-${payment.id}`,
      html: paymentReceiptEmail({
        customerName: customer.full_name,
        referenceId: customer.reference_id,
        paymentId: payment.id,
        amount: payment.amount,
        paymentDate: payment.updated_at || payment.created_at,
      }),
    });
  }

  await sendSms({
    to: customer.mobile_number,
    message: `Dear ${customer.full_name}, payment of Rs.${payment.amount} received for ${customer.reference_id}. Thank you!`,
  });
}

async function handleWebhook(req, res) {
  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];

  const isValid = cashfree.verifyWebhookSignature({ rawBody: req.rawBody, timestamp, signature });
  if (!isValid) return res.status(400).json({ message: "Invalid webhook signature" });

  const { data } = req.body;
  const orderId = data?.order?.order_id;
  const paymentStatus = data?.payment?.payment_status;
  const gatewayPaymentId = data?.payment?.cf_payment_id;

  const payment = await paymentModel.findByGatewayOrderId(orderId);
  if (!payment) return res.status(404).json({ message: "Payment not found for this order" });

  const newStatus = paymentStatus === "SUCCESS" ? "successful" : "failed";
  const updated = await paymentModel.updateStatus(payment.id, newStatus, gatewayPaymentId);

  await auditLogModel.record({
    userId: null,
    action: "payment_webhook",
    entity: "payments",
    entityId: updated.id,
    details: `Cashfree webhook: order ${orderId} -> ${newStatus}`,
  });

  if (newStatus === "successful") await sendPaymentConfirmation(updated);

  res.status(200).json({ received: true });
}

module.exports = { createPaymentRequest, listPayments, updatePaymentStatus, handleWebhook };
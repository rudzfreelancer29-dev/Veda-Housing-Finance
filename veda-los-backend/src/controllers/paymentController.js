const pool = require("../db");
const paymentModel = require("../models/paymentModel");
const customerModel = require("../models/customerModel");
const auditLogModel = require("../models/auditLogModel");
const { sendEmail } = require("../utils/mailer");
const { sendSms } = require("../utils/sms");
const razorpay = require("../utils/razorpay");
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

  // Our own reference (sent to Razorpay as `receipt`). Razorpay itself generates
  // the real order id (order_XXXX), which is what we store as gateway_order_id.
  const receipt = `VF-PAY-${Date.now()}`;
  let gatewayInfo;
  try {
    gatewayInfo = await razorpay.createOrder({
      receipt, amount, customerId,
      customerPhone: customer.mobile_number,
      customerEmail: customer.email,
    });
  } catch (err) {
    return res.status(502).json({ message: "Payment gateway error", error: err.message });
  }
  const orderId = gatewayInfo.order_id;

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

// PUBLIC endpoint (no login): the customer pays from the link in their
// email/SMS and has no Manager/Admin token. Razorpay Checkout hands the browser
// { razorpay_order_id, razorpay_payment_id, razorpay_signature }. The signature
// is HMAC-SHA256(order_id|payment_id) with our secret key, which only Razorpay
// can produce — so it is the proof, and the status is flipped to 'successful'
// only after it is verified here on the server.
async function verifyPayment(req, res) {
  // Without real Razorpay keys the signature check cannot prove anything
  // (mock mode accepts any value), so never expose this publicly in that state.
  if (razorpay.isMockMode()) {
    return res.status(503).json({ message: "Online payment verification is not available right now" });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: gatewayPaymentId,
    razorpay_signature: signature,
  } = req.body || {};

  // Public input: only accept plain, reasonably short strings (also keeps bad
  // payloads from ever reaching the database layer).
  const isCleanString = (v) => typeof v === "string" && v.length > 0 && v.length <= 200;
  if (!isCleanString(orderId) || !isCleanString(gatewayPaymentId) || !isCleanString(signature)) {
    return res.status(400).json({
      message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
    });
  }

  try {
    const payment = await paymentModel.findByGatewayOrderId(orderId);

    // Use the order id stored on OUR side (payment.gateway_order_id). Unknown
    // order and wrong signature get the same answer so the endpoint reveals nothing.
    const isValid =
      !!payment &&
      razorpay.verifyPaymentSignature({
        orderId: payment.gateway_order_id,
        paymentId: gatewayPaymentId,
        signature,
      });
    if (!isValid) return res.status(400).json({ message: "Invalid payment verification request" });

    // Already confirmed (e.g. the webhook got there first) — don't send duplicate emails/SMS.
    if (payment.status === "successful") return res.json({ success: true, status: "successful" });

    const updated = await paymentModel.updateStatus(payment.id, "successful", gatewayPaymentId);

    await auditLogModel.record({
      userId: null,
      action: "verify_payment",
      entity: "payments",
      entityId: updated.id,
      details: `Razorpay payment ${gatewayPaymentId} verified for order ${orderId} -> successful`,
    });

    await sendPaymentConfirmation(updated);

    // Deliberately minimal: this response goes to an unauthenticated browser.
    res.json({ success: true, status: updated.status });
  } catch (err) {
    console.error("verifyPayment failed:", err.message);
    res.status(500).json({ message: "Could not verify payment right now" });
  }
}

async function handleWebhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];

  const isValid = razorpay.verifyWebhookSignature({ rawBody: req.rawBody, signature });
  if (!isValid) return res.status(400).json({ message: "Invalid webhook signature" });

  const event = req.body?.event;
  const paymentEntity = req.body?.payload?.payment?.entity;
  const orderEntity = req.body?.payload?.order?.entity;

  let newStatus;
  if (event === "payment.captured" || event === "order.paid") newStatus = "successful";
  else if (event === "payment.failed") newStatus = "failed";
  else return res.status(200).json({ received: true, ignored: event || "unknown_event" });

  const orderId = paymentEntity?.order_id || orderEntity?.id;
  const gatewayPaymentId = paymentEntity?.id;

  const payment = await paymentModel.findByGatewayOrderId(orderId);
  if (!payment) return res.status(404).json({ message: "Payment not found for this order" });

  // Razorpay can deliver the same event more than once, out of order, and a
  // customer can fail an attempt and then succeed on the same order. Never
  // downgrade a successful payment, and don't re-run side effects for it.
  if (payment.status === "successful") return res.status(200).json({ received: true });

  const updated = await paymentModel.updateStatus(payment.id, newStatus, gatewayPaymentId);

  await auditLogModel.record({
    userId: null,
    action: "payment_webhook",
    entity: "payments",
    entityId: updated.id,
    details: `Razorpay webhook (${event}): order ${orderId} -> ${newStatus}`,
  });

  if (newStatus === "successful") await sendPaymentConfirmation(updated);

  res.status(200).json({ received: true });
}

module.exports = { createPaymentRequest, listPayments, updatePaymentStatus, verifyPayment, handleWebhook };
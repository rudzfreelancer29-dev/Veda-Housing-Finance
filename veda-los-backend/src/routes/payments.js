const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/webhook", paymentController.handleWebhook);

// Public on purpose: the customer pays from the emailed/SMS link and has no login.
// It is protected by Razorpay's HMAC signature check inside the controller instead.
// Must stay ABOVE router.use(authenticate) below.
router.post("/verify", paymentController.verifyPayment);

router.use(authenticate);
router.post("/", authorize("manager"), paymentController.createPaymentRequest);
router.get("/:customerId", authorize("manager", "super_admin"), paymentController.listPayments);
router.put("/:id/status", authorize("manager", "super_admin"), paymentController.updatePaymentStatus);

module.exports = router;
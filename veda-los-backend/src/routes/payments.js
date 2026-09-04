const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/webhook", paymentController.handleWebhook);

router.use(authenticate);
router.post("/", authorize("manager"), paymentController.createPaymentRequest);
router.get("/:customerId", authorize("manager", "super_admin"), paymentController.listPayments);
router.put("/:id/status", authorize("manager", "super_admin"), paymentController.updatePaymentStatus);

module.exports = router;
const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.use(authenticate, authorize("super_admin"));

router.get("/dashboard", reportController.dashboard);
router.get("/registrations", reportController.registrations);
router.get("/payments-summary", reportController.paymentsSummary);
router.get("/eligibility-stats", reportController.eligibilityStats);
router.get("/manager-performance", reportController.managerPerformance);
router.get("/export", reportController.exportReport);

module.exports = router;
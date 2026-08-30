const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const auditLogController = require("../controllers/auditLogController");

const router = express.Router();
router.use(authenticate, authorize("super_admin"));

router.get("/", auditLogController.listAuditLogs);

module.exports = router;
const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const applicationController = require("../controllers/applicationController");

const router = express.Router();

router.use(authenticate, authorize("super_admin"));

router.put("/:id/status", applicationController.updateApplicationStatus);

module.exports = router;
const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const applicationController = require("../controllers/applicationController");

const router = express.Router();
router.use(authenticate, authorize("manager"));

router.put("/applications/:id/status", applicationController.updateMyApplicationStatus);

module.exports = router;
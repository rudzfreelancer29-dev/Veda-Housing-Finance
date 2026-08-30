const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

const router = express.Router();
router.use(authenticate, authorize("super_admin"));

router.get("/", notificationController.listNotifications);
router.put("/read-all", notificationController.markAllRead);
router.put("/:id/read", notificationController.markRead);

module.exports = router;
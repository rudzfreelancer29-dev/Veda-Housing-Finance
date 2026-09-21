const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const customerController = require("../controllers/customerController");

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("manager"), customerController.createCustomer);
router.put("/:id", authorize("manager", "super_admin"), customerController.updateCustomer);

// NEW — PDF Section 2.2: Manager sends a free-text message (email only —
// see comment in the controller for why SMS isn't offered here).
router.post("/:id/message", authorize("manager"), customerController.sendCustomMessage);

router.get("/", authorize("super_admin"), customerController.listCustomers);
router.get("/:id", authorize("super_admin"), customerController.getCustomer);
router.delete("/:id", authorize("super_admin"), customerController.deleteCustomer);

module.exports = router;
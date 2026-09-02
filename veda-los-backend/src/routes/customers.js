const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const customerController = require("../controllers/customerController");

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("manager"), customerController.createCustomer);
router.put("/:id", authorize("manager", "super_admin"), customerController.updateCustomer);
router.get("/", authorize("super_admin"), customerController.listCustomers);
router.get("/:id", authorize("super_admin"), customerController.getCustomer);
router.delete("/:id", authorize("super_admin"), customerController.deleteCustomer);

module.exports = router;
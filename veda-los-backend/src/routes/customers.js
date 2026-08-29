const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const customerController = require("../controllers/customerController");

const router = express.Router();

router.use(authenticate, authorize("super_admin"));

router.get("/", customerController.listCustomers);
router.get("/:id", customerController.getCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
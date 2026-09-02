const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const customerController = require("../controllers/customerController");

const router = express.Router();
router.use(authenticate, authorize("manager"));

router.get("/customers", customerController.listMyCustomers);
router.get("/customers/:id", customerController.getMyCustomer);

module.exports = router;
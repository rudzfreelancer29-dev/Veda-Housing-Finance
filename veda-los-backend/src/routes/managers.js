const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const managerController = require("../controllers/managerController");

const router = express.Router();

// PDF Section 2.2 (Restrictions): "Managers shall not be permitted to
// create, modify, or delete manager accounts." So every route below is
// locked to super_admin only — no exceptions.
router.use(authenticate, authorize("super_admin"));

router.get("/", managerController.listManagers);
router.post("/", managerController.createManager);
router.put("/:id", managerController.updateManager);
router.put("/:id/status", managerController.setManagerStatus);
router.delete("/:id", managerController.deleteManager);

module.exports = router;
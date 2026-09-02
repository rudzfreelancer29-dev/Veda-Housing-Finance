const express = require("express");
const multer = require("multer");
const path = require("path");
const { authenticate, authorize } = require("../middleware/auth");
const documentController = require("../controllers/documentController");

const router = express.Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/upload", authorize("manager"), upload.single("file"), documentController.uploadDocument);
router.get("/:customerId", authorize("manager", "super_admin"), documentController.listDocuments);
router.delete("/:id", authorize("manager", "super_admin"), documentController.deleteDocument);

module.exports = router;
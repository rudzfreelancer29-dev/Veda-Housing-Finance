const applicationModel = require("../models/applicationModel");

async function updateApplicationStatus(req, res) {
  const { status } = req.body;
  if (!applicationModel.VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${applicationModel.VALID_STATUSES.join(", ")}`,
    });
  }

  const application = await applicationModel.updateStatus(req.params.id, status);
  if (!application) return res.status(404).json({ message: "Application not found" });
  res.json(application);
}

module.exports = { updateApplicationStatus };
const auditLogModel = require("../models/auditLogModel");

async function listAuditLogs(req, res) {
  const { userId, action, from, to } = req.query;
  const logs = await auditLogModel.findAll({ userId, action, from, to });
  res.json(logs);
}

module.exports = { listAuditLogs };
const notificationModel = require("../models/notificationModel");

async function listNotifications(req, res) {
  const data = await notificationModel.findAll();
  res.json(data);
}

async function markRead(req, res) {
  const ok = await notificationModel.markRead(req.params.id);
  if (!ok) return res.status(404).json({ message: "Notification not found" });
  res.json({ message: "Marked as read" });
}

async function markAllRead(req, res) {
  await notificationModel.markAllRead();
  res.json({ message: "All notifications marked as read" });
}

module.exports = { listNotifications, markRead, markAllRead };
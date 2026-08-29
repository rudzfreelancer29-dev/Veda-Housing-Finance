const reportModel = require("../models/reportModel");

async function dashboard(req, res) {
  res.json(await reportModel.dashboardStats());
}

async function registrations(req, res) {
  res.json(await reportModel.registrationTrends());
}

async function paymentsSummary(req, res) {
  res.json(await reportModel.paymentsSummary());
}

async function eligibilityStats(req, res) {
  res.json(await reportModel.eligibilityStats());
}

async function managerPerformance(req, res) {
  res.json(await reportModel.managerPerformance());
}

module.exports = { dashboard, registrations, paymentsSummary, eligibilityStats, managerPerformance };
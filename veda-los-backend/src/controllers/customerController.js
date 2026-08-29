const customerModel = require("../models/customerModel");

async function listCustomers(req, res) {
  const { search } = req.query;
  const customers = await customerModel.findAll({ search });
  res.json(customers);
}

async function getCustomer(req, res) {
  const customer = await customerModel.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
}

async function deleteCustomer(req, res) {
  const deleted = await customerModel.deletePermanently(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Customer not found" });
  res.json({ message: "Customer record permanently deleted" });
}

module.exports = { listCustomers, getCustomer, deleteCustomer };
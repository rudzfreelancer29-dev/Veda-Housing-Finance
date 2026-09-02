const documentModel = require("../models/documentModel");
const customerModel = require("../models/customerModel");
const auditLogModel = require("../models/auditLogModel");

async function assertAccessToCustomer(customerId, user) {
  const customer = await customerModel.findById(customerId);
  if (!customer) return { error: 404, message: "Customer not found" };
  if (user.role === "manager" && customer.created_by !== user.id) {
    return { error: 403, message: "You can only manage documents for customers you registered" };
  }
  return { customer };
}

async function uploadDocument(req, res) {
  const { customerId, docType } = req.body;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  if (!customerId || !docType) return res.status(400).json({ message: "customerId and docType are required" });

  const access = await assertAccessToCustomer(customerId, req.user);
  if (access.error) return res.status(access.error).json({ message: access.message });

  const document = await documentModel.create({
    customerId,
    docType,
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
    uploadedBy: req.user.id,
  });

  await auditLogModel.record({
    userId: req.user.id,
    action: "upload_document",
    entity: "documents",
    entityId: document.id,
    details: `Uploaded ${docType} for customer id ${customerId}`,
  });

  res.status(201).json(document);
}

async function listDocuments(req, res) {
  const access = await assertAccessToCustomer(req.params.customerId, req.user);
  if (access.error) return res.status(access.error).json({ message: access.message });

  const documents = await documentModel.findByCustomerId(req.params.customerId);
  res.json(documents);
}

async function deleteDocument(req, res) {
  const document = await documentModel.findById(req.params.id);
  if (!document) return res.status(404).json({ message: "Document not found" });

  const access = await assertAccessToCustomer(document.customer_id, req.user);
  if (access.error) return res.status(access.error).json({ message: access.message });

  await documentModel.deletePermanently(req.params.id);

  await auditLogModel.record({
    userId: req.user.id,
    action: "delete_document",
    entity: "documents",
    entityId: document.id,
    details: `Deleted document: ${document.file_name}`,
  });

  res.json({ message: "Document deleted" });
}

module.exports = { uploadDocument, listDocuments, deleteDocument };
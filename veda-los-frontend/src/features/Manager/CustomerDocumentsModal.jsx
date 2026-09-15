import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Trash2,
  Eye,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  ZoomIn,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";
import { environment } from "../../environment/environment";

export default function CustomerDocumentsModal({
  selectedCustomer,
  isOpen = true,
  onClose,
  onUploadSuccess,
  initialTab = "view",
  readOnly = false
}) {
  const [activeTab, setActiveTab] = useState(readOnly ? "view" : initialTab); // 'view' | 'upload'
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [previewDoc, setPreviewDoc] = useState(null);

  // Deletion State
  const [deletingDocId, setDeletingDocId] = useState(null);

  // Upload Form State
  const [docType, setDocType] = useState("id_proof"); // 'id_proof' (PAN), 'aadhaar_proof' (Aadhaar), 'income_proof'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const targetCustomerId =
    selectedCustomer?.rawId ||
    (typeof selectedCustomer?.id === "string"
      ? selectedCustomer.id.replace(/^CUST-/, "")
      : selectedCustomer?.id) ||
    selectedCustomer?.customerId;

  const fetchCustomerDocuments = async () => {
    if (!targetCustomerId) return;
    setDocsLoading(true);
    try {
      const response = await apiService.GetCustomerDocuments(targetCustomerId);
      const rawData = response.data;
      const docsArray = Array.isArray(rawData)
        ? rawData
        : rawData?.data || rawData?.documents || [];
      setDocuments(Array.isArray(docsArray) ? docsArray : []);
    } catch (error) {
      console.error("Failed to fetch customer documents:", error);
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomer && isOpen) {
      fetchCustomerDocuments();
    }
  }, [targetCustomerId, isOpen]);

  if (!isOpen || !selectedCustomer) return null;

  const getDocUrl = (doc) => {
    if (!doc) return "";
    const rawUrl =
      doc.file_url ||
      doc.fileUrl ||
      doc.url ||
      doc.file_path ||
      doc.filePath ||
      doc.path ||
      doc.document_url ||
      "";
    if (!rawUrl) return "";
    if (
      rawUrl.startsWith("http://") ||
      rawUrl.startsWith("https://") ||
      rawUrl.startsWith("data:") ||
      rawUrl.startsWith("blob:")
    ) {
      return rawUrl;
    }
    const baseApi = environment.CRMService_API.replace(/\/api\/?$/, "");
    const cleanPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
    return `${baseApi}${cleanPath}`;
  };

  const isImageFile = (doc) => {
    const url = getDocUrl(doc);
    const name = doc.file_name || doc.fileName || doc.name || doc.original_name || url;
    return (
      /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(name) ||
      (doc.mime_type && doc.mime_type.startsWith("image/")) ||
      url.startsWith("data:image")
    );
  };

  const getDocTypeBadge = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("pan") || t === "id_proof") {
      return { label: "PAN Card", badge: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    if (t.includes("aadhaar") || t.includes("aadhar") || t === "aadhaar_proof") {
      return { label: "Aadhaar Card", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    }
    if (t.includes("income") || t === "income_proof") {
      return { label: "Income Proof", badge: "bg-indigo-100 text-indigo-700 border-indigo-200" };
    }
    return { label: type || "Document", badge: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filterType === "all") return true;
    const t = (doc.doc_type || doc.docType || doc.type || "").toLowerCase();
    return t === filterType || t.includes(filterType);
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warn("File size exceeds 10MB limit. Please choose a smaller file.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warn("File size exceeds 10MB limit. Please choose a smaller file.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warn("Please select a file to upload.");
      return;
    }

    if (!targetCustomerId) {
      toast.error("Customer ID is missing.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("customerId", targetCustomerId);
      formData.append("docType", docType);

      await apiService.UploadCustomerDocument(formData);
      toast.success(
        `${
          docType === "id_proof"
            ? "PAN Card"
            : docType === "aadhaar_proof"
            ? "Aadhaar Card"
            : "Document"
        } uploaded successfully!`
      );
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchCustomerDocuments();
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
      setActiveTab("view");
    } catch (error) {
      console.error("Error uploading customer document:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to upload document. Please try again.";
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId, docName) => {
    if (!docId) return;
    if (!window.confirm(`Are you sure you want to delete ${docName || "this document"}?`)) {
      return;
    }

    setDeletingDocId(docId);
    try {
      if (apiService.DeleteCustomerDocument) {
        await apiService.DeleteCustomerDocument(docId);
        toast.success("Document deleted successfully!");
        await fetchCustomerDocuments();
        if (onUploadSuccess) {
          await onUploadSuccess();
        }
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete document. Please try again.";
      toast.error(errMsg);
    } finally {
      setDeletingDocId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Customer Documents</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedCustomer.name || selectedCustomer.fullName} (
                {selectedCustomer.referenceId || selectedCustomer.reference_id || selectedCustomer.id})
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={uploading}
              className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Bar (See Documents vs Upload Document) */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-2 bg-slate-50/40">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("view")}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "view"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Uploaded Documents
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono">
                  {documents.length}
                </span>
              </button>

              {!readOnly && (
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "upload"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload New Document
                </button>
              )}
            </div>

            {activeTab === "view" && (
              <button
                onClick={fetchCustomerDocuments}
                disabled={docsLoading}
                title="Refresh Documents"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${docsLoading ? "animate-spin text-blue-600" : ""}`}
                />
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* VIEW DOCUMENTS GALLERY TAB */}
            {activeTab === "view" && (
              <div className="space-y-4">
                {/* Filter Badges */}
                {documents.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">
                      Filter:
                    </span>
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                        filterType === "all"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      All ({documents.length})
                    </button>
                    <button
                      onClick={() => setFilterType("id_proof")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                        filterType === "id_proof"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      PAN Card
                    </button>
                    <button
                      onClick={() => setFilterType("aadhaar_proof")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                        filterType === "aadhaar_proof"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Aadhaar Card
                    </button>
                    <button
                      onClick={() => setFilterType("income_proof")}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                        filterType === "income_proof"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Income Proof
                    </button>
                  </div>
                )}

                {/* Documents List */}
                {docsLoading ? (
                  <div className="py-16 text-center text-slate-500 font-semibold text-xs space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p>Fetching customer documents from server...</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {documents.length === 0
                          ? "No Documents Uploaded Yet"
                          : "No Documents Found in this Filter"}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {documents.length === 0
                          ? "No documents have been uploaded for this customer yet."
                          : "Try selecting 'All' to see all uploaded customer documents."}
                      </p>
                    </div>
                    {documents.length === 0 && !readOnly && (
                      <button
                        onClick={() => setActiveTab("upload")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Document Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredDocuments.map((doc, idx) => {
                      const url = getDocUrl(doc);
                      const isImg = isImageFile(doc);
                      const badgeInfo = getDocTypeBadge(doc.doc_type || doc.docType || doc.type);
                      const filename =
                        doc.file_name ||
                        doc.fileName ||
                        doc.name ||
                        doc.original_name ||
                        `Document-${doc.id || idx + 1}`;
                      const isDeleting = deletingDocId === doc.id;

                      return (
                        <div
                          key={doc.id || idx}
                          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                        >
                          {/* Image or File Preview Box */}
                          <div className="relative bg-slate-100 aspect-video flex items-center justify-center overflow-hidden border-b border-slate-100">
                            {isImg && url ? (
                              <>
                                <img
                                  src={url}
                                  alt={filename}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div
                                  onClick={() => setPreviewDoc(doc)}
                                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer gap-2"
                                >
                                  <span className="px-3 py-1.5 bg-white/95 backdrop-blur-xs text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                    <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                                    Expand Image
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-4 text-slate-400">
                                <FileText className="w-10 h-10 text-slate-400 mb-1" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  PDF Document
                                </span>
                              </div>
                            )}

                            {/* Badge */}
                            <span
                              className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md font-bold text-[10px] border shadow-xs backdrop-blur-xs ${badgeInfo.badge}`}
                            >
                              {badgeInfo.label}
                            </span>

                            {/* Delete Button */}
                            {!readOnly && doc.id && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc.id, filename);
                                }}
                                disabled={isDeleting}
                                title="Delete Document"
                                className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                {isDeleting ? (
                                  <span className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin block" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Details & Actions */}
                          <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                            <div>
                              <p
                                className="font-bold text-xs text-slate-800 truncate"
                                title={filename}
                              >
                                {filename}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Uploaded on {formatDate(doc.created_at || doc.createdAt)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" /> Open File
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400">File attached</span>
                              )}

                              {isImg && url && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3 text-blue-600" /> View
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* UPLOAD DOCUMENT TAB */}
            {activeTab === "upload" && (
              <form onSubmit={handleUpload} className="space-y-4">
                {/* Document Type Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Select Document Type to Upload <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDocType("id_proof")}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        docType === "id_proof"
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      PAN Card
                      <span className="block text-[10px] font-normal text-slate-400">id_proof</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocType("aadhaar_proof")}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        docType === "aadhaar_proof"
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Aadhaar Card
                      <span className="block text-[10px] font-normal text-slate-400">
                        aadhaar_proof
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocType("income_proof")}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        docType === "income_proof"
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Income Proof
                      <span className="block text-[10px] font-normal text-slate-400">
                        income_proof
                      </span>
                    </button>
                  </div>
                </div>

                {/* File Drag and Drop / Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Upload Document File <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    id="customer-doc-file-input"
                  />

                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        isDragging
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
                      }`}
                    >
                      <Upload className="w-7 h-7 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-700 font-semibold">
                        Click to browse or drag & drop document
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        PDF, JPG, PNG or WEBP (Max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab("view")}
                    className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    View Uploaded Docs
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Uploading Document...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Document</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
            <span className="text-[11px] text-slate-400">
              {documents.length} document{documents.length !== 1 ? "s" : ""} on record
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* High-Resolution Image Preview Lightbox Modal */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-60 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-800/40"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] border ${
                    getDocTypeBadge(previewDoc.doc_type || previewDoc.docType || previewDoc.type)
                      .badge
                  }`}
                >
                  {
                    getDocTypeBadge(previewDoc.doc_type || previewDoc.docType || previewDoc.type)
                      .label
                  }
                </span>
                <h4 className="font-bold text-slate-800 text-sm truncate max-w-xs sm:max-w-md">
                  {previewDoc.file_name ||
                    previewDoc.fileName ||
                    previewDoc.name ||
                    "Customer Document"}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {getDocUrl(previewDoc) && (
                  <a
                    href={getDocUrl(previewDoc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-950/5 flex items-center justify-center min-h-[350px]">
              <img
                src={getDocUrl(previewDoc)}
                alt="Document Preview"
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md"
              />
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/80 text-xs">
              <span className="text-slate-400 text-[11px]">
                Uploaded on {formatDate(previewDoc.created_at || previewDoc.createdAt)}
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export alias for compatibility
export { CustomerDocumentsModal as ManageDocumentsModal, CustomerDocumentsModal as SeeDocumentsModal };

import React, { useState, useEffect } from "react";
import { X, Send, Mail, User, Phone, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import apiService from "../../services/api-service";

const TEMPLATES = [
  {
    label: "Under Review",
    subject: "Loan Application Update – Dhanicap Finance",
    message: `Dear Customer,

Your loan application is currently under review with Dhanicap Finance. We will notify you once the review is complete.

Thank you for choosing Dhanicap Finance.

Best Regards,
Team Dhanicap Finance`
  },
  {
    label: "Documents Required",
    subject: "Action Required: Pending Documents – Dhanicap Finance",
    message: `Dear Customer,

Please upload the pending documents required to proceed with your loan verification at Dhanicap Finance.

Thank you for choosing Dhanicap Finance.

Best Regards,
Team Dhanicap Finance`
  },
  {
    label: "Payment Pending",
    subject: "Payment Request Notification – Dhanicap Finance",
    message: `Dear Customer,

Your loan processing fee is pending. Please complete the payment to proceed further with your loan application at Dhanicap Finance.

Thank you for choosing Dhanicap Finance.

Best Regards,
Team Dhanicap Finance`
  },
  {
    label: "Approved",
    subject: "Congratulations! Loan Application Approved – Dhanicap Finance",
    message: `Dear Customer,

We are pleased to inform you that your loan application has been approved by Dhanicap Finance. Our representative will contact you soon.

Thank you for choosing Dhanicap Finance.

Best Regards,
Team Dhanicap Finance`
  },
  {
    label: "CIBIL",
    category: "cibil",
    loanType: "General",
    subject: "Update on Your CIBIL Check – Dhanicap Finance",
    message: `Dear Customer,

This is to inform you that your CIBIL credit report has been checked by Dhanicap Finance as part of your loan application process.

Thank you for choosing Dhanicap Finance.

Best Regards,
Team Dhanicap Finance`
  },
  {
    label: "CIBIL - Personal Loan",
    category: "cibil",
    loanType: "Personal Loan",
    subject: "Attention! CIBIL Enquiry Alert – Personal Loan",
    message: `Dear Customer,

Greetings from Dhanicap Finance!

We wish to inform you that a recent Personal Loan enquiry was made on your CIBIL Score and Report.

The details of the enquiry are mentioned below:

Bank Name:
Enquiry Control Number (ECN): [ECN Number]
Enquiry Purpose: PERSONAL LOAN
Date of Enquiry: [Date and Time]

In case of any queries or clarification regarding the above information, please contact the respective bank/financial institution or connect with Dhanicap Finance. Please quote your ECN number while communicating with them to help you receive assistance.

A credit enquiry occurs when a bank or financial institution checks your CIBIL report, usually in connection with a loan or credit application. Please review your personal information and verify that the enquiry is familiar to you.

Note: Dispute resolution is offered FREE of charge by CIBIL. Consumers are not required to pay any fee for rectifying discrepancies or updating their credit information.

Best regards,
Dhanicap Finance`
  },
  {
    label: "CIBIL - Home Loan",
    category: "cibil",
    loanType: "Home Loan",
    subject: "Attention! CIBIL Enquiry Alert – Home Loan",
    message: `Dear Customer,

Greetings from Dhanicap Finance!

We wish to inform you that a recent Home Loan enquiry was made on your CIBIL Score and Report.

The details of the enquiry are mentioned below:

Bank Name:
Enquiry Control Number (ECN): [ECN Number]
Enquiry Purpose: HOME LOAN
Date of Enquiry: [Date and Time]

In case of any queries or clarification regarding the above information, please contact the respective bank/financial institution or connect with Dhanicap Finance. Please quote your ECN number while communicating with them to help you receive assistance.

A credit enquiry occurs when a bank or financial institution checks your CIBIL report, usually in connection with a loan or credit application. Please review your personal information and verify that the enquiry is familiar to you.

Note: Dispute resolution is offered FREE of charge by CIBIL. Consumers are not required to pay any fee for rectifying discrepancies or updating their credit information.

Best regards,
Dhanicap Finance`
  },
  {
    label: "CIBIL - Mortgage Loan",
    category: "cibil",
    loanType: "Mortgage Loan",
    subject: "Attention! CIBIL Enquiry Alert – Mortgage Loan",
    message: `Dear Customer,

Greetings from Dhanicap Finance!

We wish to inform you that a recent Mortgage Loan enquiry was made on your CIBIL Score and Report.

The details of the enquiry are mentioned below:

Bank Name:
Enquiry Control Number (ECN): [ECN Number]
Enquiry Purpose: MORTGAGE LOAN
Date of Enquiry: [Date and Time]

In case of any queries or clarification regarding the above information, please contact the respective bank/financial institution or connect with Dhanicap Finance. Please quote your ECN number while communicating with them to help you receive assistance.

A credit enquiry occurs when a bank or financial institution checks your CIBIL report, usually in connection with a loan or credit application. Please review your personal information and verify that the enquiry is familiar to you.

Note: Dispute resolution is offered FREE of charge by CIBIL. Consumers are not required to pay any fee for rectifying discrepancies or updating their credit information.

Best regards,
Dhanicap Finance`
  }
];

export default function CustomCustomerMessage({
  isOpen,
  onClose,
  customer,
  onSuccess
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].label);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [message, setMessage] = useState(TEMPLATES[0].message);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      setSelectedTemplate(TEMPLATES[0].label);
      setSubject(TEMPLATES[0].subject);
      const customerName = customer.fullName || customer.name || "Customer";
      setMessage(
        TEMPLATES[0].message.replace("Dear Customer", `Dear ${customerName}`)
      );
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const targetId =
    customer.rawId ||
    (typeof customer.id === "string" ? customer.id.replace(/^CUST-/, "") : customer.id) ||
    customer._id ||
    customer.customerId;

  const handleApplyTemplate = (tmpl) => {
    setSelectedTemplate(tmpl.label);
    const customerName = customer.fullName || customer.name || "Customer";
    setSubject(tmpl.subject);
    setMessage(tmpl.message.replace("Dear Customer", `Dear ${customerName}`));
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    if (!targetId) {
      toast.error("Customer ID not found.");
      return;
    }

    setLoading(true);
    const payload = {
      subject: subject.trim(),
      message: message.trim()
    };

    try {
      await apiService.SendCustomMessage(payload, targetId);
      toast.success("Custom message sent to customer successfully!");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Failed to send custom message:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send custom message. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Send Custom Message</h3>
              <p className="text-xs text-slate-500">Send an email/message notification directly to the customer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Info Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {(customer.fullName || customer.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                {customer.fullName || customer.name}
              </div>
              <div className="text-slate-500 text-[11px] font-mono">
                ID: {customer.id || customer.referenceId || `CUST-${targetId}`}
              </div>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            {customer.email ? (
              <div className="text-slate-700 font-medium">{customer.email}</div>
            ) : (
              <div className="text-slate-400 italic">No email provided</div>
            )}
            {customer.mobile || customer.mobileNumber ? (
              <div className="text-slate-500 text-[11px]">{customer.mobile || customer.mobileNumber}</div>
            ) : null}
          </div>
        </div>

        {/* Quick Template Chips */}
        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Quick Templates:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.label;
              return (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs font-semibold"
                      : "bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 border-slate-200"
                  }`}
                >
                  {tmpl.label}
                </button>
              );
            })}
          </div>

          {/* CIBIL Loan Type Quick Selector */}
          {(selectedTemplate === "CIBIL" || selectedTemplate?.startsWith("CIBIL")) && (
            <div className="mt-2.5 p-2.5 bg-purple-50/70 border border-purple-100 rounded-xl flex flex-wrap items-center gap-1.5 animate-in fade-in duration-150">
              <span className="text-[11px] font-semibold text-purple-700 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" /> CIBIL Loan Types:
              </span>
              {TEMPLATES.filter((t) => t.category === "cibil").map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.label;
                return (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-xs font-semibold"
                        : "bg-white text-purple-700 hover:bg-purple-100 border border-purple-200"
                    }`}
                  >
                    {tmpl.loanType || tmpl.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Form */}
        <form onSubmit={handleSendMessage} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Loan Application Update"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{message.length} chars</span>
            </div>
            <textarea
              required
              rows={5}
              placeholder="Write your custom message or notification email here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-y"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="py-2 px-4 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

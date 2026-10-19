import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  CreditCard,
  Lock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Info
} from "lucide-react";
import apiService from "../../services/api-service";
import dhanicapLogo from "../../assets/Dhanicap_Logo.png";

/**
 * Dynamically loads the Razorpay checkout.js SDK
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CustomerCheckoutPage() {
  const [orderId, setOrderId] = useState("");
  const [manualOrderId, setManualOrderId] = useState("");
  const [pageStatus, setPageStatus] = useState("loading"); // "loading" | "ready" | "verifying" | "success" | "error" | "missing_order"
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const hasAutoOpenedRef = useRef(false);

  // Extract order_id from URL query parameters (e.g. /pay?order_id=order_XXXXX)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const idFromUrl = searchParams.get("order_id") || searchParams.get("orderId");

    if (idFromUrl && idFromUrl.trim()) {
      const cleanId = idFromUrl.trim();
      setOrderId(cleanId);
      setPageStatus("ready");
    } else {
      setPageStatus("missing_order");
    }
  }, []);

  // Handler to open the Razorpay Checkout Modal
  const handleOpenRazorpay = async (targetOrderId) => {
    const activeOrderId = targetOrderId || orderId;

    if (!activeOrderId) {
      setPageStatus("missing_order");
      return;
    }

    setIsOpeningCheckout(true);
    setErrorMessage("");

    try {
      const isSdkLoaded = await loadRazorpayScript();
      if (!isSdkLoaded) {
        setErrorMessage("Failed to load Razorpay SDK. Please check your internet connection and try again.");
        setPageStatus("error");
        setIsOpeningCheckout(false);
        return;
      }

      // Read key_id from environment variable
      const razorpayKey =
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_RAZORPAY_KEY_ID) ||
        (typeof process !== "undefined" && process.env?.REACT_APP_RAZORPAY_KEY_ID) ||
        "rzp_test_YourKeyId";

      const options = {
        key: razorpayKey,
        order_id: activeOrderId,
        name: "Dhanicap Finance",
        description: "Loan Processing Fee",
        image: dhanicapLogo,
        theme: {
          color: "#2563eb" // Blue theme matching Dhanicap
        },
        modal: {
          ondismiss: function () {
            setIsOpeningCheckout(false);
            console.log("Customer closed the checkout modal.");
          }
        },
        handler: async function (response) {
          // Response payload: razorpay_order_id, razorpay_payment_id, razorpay_signature
          console.log("Razorpay payment success response:", response);
          setPageStatus("verifying");

          try {
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            // Requirement: POST /api/payments/verify
            const verifyRes = await apiService.verifyPayment(verificationPayload);
            const resData = verifyRes?.data || {};

            // Extract or build reference to transaction receipt PAY-<id>
            let receiptId =
              resData.receiptId ||
              resData.receipt ||
              resData.data?.receiptId ||
              resData.data?.receipt;

            if (!receiptId) {
              const rawId =
                resData.paymentId ||
                resData.id ||
                resData.data?.id ||
                resData.data?.paymentId;

              if (rawId) {
                receiptId = `PAY-${rawId}`;
              } else if (response.razorpay_payment_id) {
                receiptId = `PAY-${response.razorpay_payment_id.replace(/^pay_/, "").toUpperCase()}`;
              } else {
                receiptId = `PAY-${Date.now().toString().slice(-6)}`;
              }
            } else if (!receiptId.startsWith("PAY-")) {
              receiptId = `PAY-${receiptId}`;
            }

            setPaymentResult({
              receiptId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: resData.amount || resData.data?.amount,
              feeType: resData.feeType || resData.data?.feeType || "Processing Fee",
              timestamp: new Date().toISOString()
            });

            setPageStatus("success");
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            const msg =
              verifyError?.response?.data?.message ||
              verifyError?.response?.data?.error ||
              "Payment verification could not be validated with the server. If money was debited from your account, our webhooks will process and confirm your payment automatically.";
            setErrorMessage(msg);
            setPageStatus("error");
          } finally {
            setIsOpeningCheckout(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", function (resp) {
        console.error("Razorpay Payment Failed:", resp.error);
        setErrorMessage(
          resp.error?.description ||
          "Payment was declined by your bank or failed. Please try again with a different payment method."
        );
        setPageStatus("error");
        setIsOpeningCheckout(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error("Failed to initiate Razorpay checkout:", err);
      setErrorMessage(err.message || "Failed to initialize payment gateway.");
      setPageStatus("error");
      setIsOpeningCheckout(false);
    }
  };

  // Automatically attempt to trigger checkout once if order_id is present on load
  useEffect(() => {
    if (pageStatus === "ready" && orderId && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      handleOpenRazorpay(orderId);
    }
  }, [pageStatus, orderId]);

  const handleManualOrderSubmit = (e) => {
    e.preventDefault();
    if (!manualOrderId.trim()) return;
    const cleanId = manualOrderId.trim();
    setOrderId(cleanId);
    setPageStatus("ready");
    handleOpenRazorpay(cleanId);
  };

  const copyReceiptToClipboard = () => {
    if (!paymentResult?.receiptId) return;
    navigator.clipboard.writeText(paymentResult.receiptId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex flex-col justify-between font-sans antialiased text-slate-800">
      
      {/* Top Header / Branding */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={dhanicapLogo}
              alt="Dhanicap Finance"
              className="h-9 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="border-l border-slate-200 pl-3">
              <h1 className="font-extrabold text-slate-900 text-base leading-none tracking-tight">
                Dhanicap Finance
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Official Payment Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">

        {/* 1. VERIFYING STATE */}
        {pageStatus === "verifying" && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">Verifying Payment...</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please wait while we confirm your transaction with Dhanicap Finance servers. Do not close or refresh this page.
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {pageStatus === "success" && paymentResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Top Success Badge */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Payment Successful!
              </h2>
              <p className="text-xs text-slate-500">
                Your loan processing fee has been received and verified successfully.
              </p>
            </div>

            {/* Prominent Receipt Reference Card: PAY-<id> */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-blue-50/50 p-5 rounded-2xl border border-emerald-200 text-center space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Transaction Receipt Number
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-emerald-800 tracking-wide">
                  {paymentResult.receiptId}
                </span>
                <button
                  onClick={copyReceiptToClipboard}
                  title="Copy Receipt Number"
                  className="p-1.5 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <span className="text-[10px] text-emerald-700 font-bold block animate-in fade-in">
                  Receipt ID copied to clipboard!
                </span>
              )}
            </div>

            {/* Payment Details Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/60 divide-y divide-slate-100 text-xs">
              <div className="p-3.5 flex justify-between items-center">
                <span className="text-slate-400">Payment Status</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> Paid & Verified
                </span>
              </div>
              <div className="p-3.5 flex justify-between items-center">
                <span className="text-slate-400">Razorpay Payment ID</span>
                <span className="font-mono font-bold text-slate-800 break-all text-right">
                  {paymentResult.razorpayPaymentId}
                </span>
              </div>
              <div className="p-3.5 flex justify-between items-center">
                <span className="text-slate-400">Order Reference</span>
                <span className="font-mono font-semibold text-slate-700 break-all text-right">
                  {paymentResult.razorpayOrderId}
                </span>
              </div>
              <div className="p-3.5 flex justify-between items-center">
                <span className="text-slate-400">Payment Purpose</span>
                <span className="font-semibold text-slate-800">
                  {paymentResult.feeType}
                </span>
              </div>
              <div className="p-3.5 flex justify-between items-center">
                <span className="text-slate-400">Date & Time</span>
                <span className="font-medium text-slate-700">
                  {new Date(paymentResult.timestamp).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })}
                </span>
              </div>
            </div>

            {/* Notification Callout */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                A confirmation SMS and receipt notice have been sent to your registered phone number. Your loan manager has been notified to proceed with your application.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                Back to Dhanicap
              </button>
            </div>
          </div>
        )}

        {/* 3. READY STATE: Checkout Card */}
        {pageStatus === "ready" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Complete Loan Fee Payment
              </h2>
              <p className="text-xs text-slate-500">
                You are paying the loan processing fee for Dhanicap Finance.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono font-bold text-blue-600">{orderId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Gateway Provider:</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Razorpay
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Supported Payment Modes:</span>
                <span className="text-slate-700 font-bold">UPI, Cards, NetBanking</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenRazorpay(orderId)}
              disabled={isOpeningCheckout}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isOpeningCheckout ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Opening Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <span>Pay with Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400">
              By proceeding, you agree to Dhanicap Finance payment terms and Razorpay end-user terms.
            </p>
          </div>
        )}

        {/* 4. ERROR STATE */}
        {pageStatus === "error" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">Payment Issue</h2>
              <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-xl p-3">
                {errorMessage || "An unexpected error occurred while processing your payment."}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleOpenRazorpay(orderId)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => setPageStatus("ready")}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 5. MISSING ORDER ID STATE */}
        {pageStatus === "missing_order" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Order ID Required
              </h2>
              <p className="text-xs text-slate-500">
                No active order parameter was detected in the URL. Please verify your payment link from your SMS or Email.
              </p>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Enter Razorpay Order ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. order_OK123ABCxyz"
                  value={manualOrderId}
                  onChange={(e) => setManualOrderId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 text-center">
              Example link format: <code className="font-mono text-blue-600">/pay?order_id=order_XXXXXX</code>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Footer */}
      <footer className="w-full bg-white/60 border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Dhanicap Finance. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Support: support@dhanicapfinance.com</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

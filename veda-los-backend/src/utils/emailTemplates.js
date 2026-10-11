// Dhanicap Finance — branded email templates.
// Table-based layout with inline styles throughout — this is required for
// HTML emails, since Gmail/Outlook/Apple Mail strip <style> blocks and
// don't reliably support flexbox/grid. Every color is inline for the same
// reason (external CSS files are never loaded by email clients).

const GOLD = "#C9A961";
const GOLD_DARK = "#9A7B3F";
const INK = "#0A0A0A";
const SILVER = "#B8B8B8";
const PAPER = "#F4F4F2";

// The logo already contains the "DHANICAP FINANCE" wordmark and the
// "GROWTH • TRUST • WEALTH" tagline baked into the artwork, so the header
// below is just this one image on the black banner — no separate text
// needed.
//
// IMPORTANT (fixes Gmail "[Message clipped] View entire message"):
// Gmail clips any message whose full HTML exceeds ~102KB. The original
// base64 logo was a ~95KB data URI by itself, which pushed every email
// over that limit and made Gmail show a blank/truncated preview until the
// recipient clicked "View entire message". The logo below has been
// cropped tightly, resized to 300px (sharp on retina at the 220px
// display width used in the header) and re-encoded as an optimized JPEG,
// bringing the data URI down to ~14KB — comfortably under the clipping
// threshold even with the rest of the email's markup.
// Swap this constant for a hosted https:// URL once the client has the
// logo on their own domain/CDN — that remains more reliable across email
// clients (older Outlook desktop in particular) than any base64 data URI,
// and keeps the email small regardless of future template changes.
const fs = require("fs");
const path = require("path");
const LOGO_SRC = fs.readFileSync(path.join(__dirname, "logo-datauri.txt"), "utf8");

// The shared letterhead wrapper — header (logo), content slot, footer.
// Every email below is built from this one function so the brand
// presentation never drifts between templates.
function emailLayout({ preheader = "", bodyHtml, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Dhanicap Finance</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};font-family:Georgia,'Times New Roman',serif;">
  <span style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:${PAPER};">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <tr>
            <td style="background-color:${INK};padding:36px 40px;text-align:center;">
              <img src="${LOGO_SRC}" width="220" alt="Dhanicap Finance" style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;border:0;" />
            </td>
          </tr>

          <tr>
            <td style="padding:40px;color:#222222;font-size:15px;line-height:1.65;">
              ${bodyHtml}
              ${ctaUrl ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
                <tr><td style="border-radius:4px;background-color:${GOLD};">
                  <a href="${ctaUrl}" style="display:inline-block;padding:14px 36px;font-family:Georgia,serif;font-size:14px;font-weight:bold;letter-spacing:1px;color:${INK};text-decoration:none;">${ctaText}</a>
                </td></tr>
              </table>` : ""}
            </td>
          </tr>

          <tr>
            <td style="background-color:${PAPER};padding:24px 40px;text-align:center;border-top:1px solid #ececec;">
              <div style="font-size:11px;color:#999999;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
                Dhanicap Finance Pvt. Ltd.<br />
                This is an automated message — please do not reply directly to this email.<br />
                &copy; ${new Date().getFullYear()} Dhanicap Finance. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 1. Registration confirmation — sent from customerController.createCustomer
function registrationEmail({ fullName, referenceId }) {
  return emailLayout({
    preheader: `Welcome to Dhanicap Finance — your reference is ${referenceId}`,
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:${INK};margin:0 0 16px;font-size:22px;">Welcome, ${fullName}</h2>
      <p style="margin:0 0 20px;">Thank you for choosing <strong>Dhanicap Finance</strong>. Your registration has been completed successfully.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F3;border-left:3px solid ${GOLD};margin:0 0 20px;">
        <tr><td style="padding:16px 20px;">
          <div style="font-size:11px;letter-spacing:1px;color:#999999;font-family:Arial,Helvetica,sans-serif;">YOUR REFERENCE NUMBER</div>
          <div style="font-size:22px;font-weight:bold;color:${INK};margin-top:4px;">${referenceId}</div>
        </td></tr>
      </table>
      <p style="margin:0 0 8px;">Please keep this reference number for all future correspondence regarding your application. Our team will reach out shortly with the next steps.</p>
      <p style="margin:28px 0 0;">Warm regards,<br /><strong>Team Dhanicap Finance</strong></p>
    `,
  });
}

// 2. Eligibility approved — sent from applicationController when status = 'eligible'
function eligibilityEmail({ fullName, referenceId }) {
  return emailLayout({
    preheader: `Congratulations ${fullName} — your application is eligible`,
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:${INK};margin:0 0 16px;font-size:22px;">Congratulations, ${fullName}!</h2>
      <p style="margin:0 0 20px;">We're pleased to inform you that your loan application (Ref: <strong>${referenceId}</strong>) has been reviewed and marked <strong style="color:${GOLD_DARK};">Eligible</strong> for further processing.</p>
      <p style="margin:0 0 8px;">Our relationship manager will be in touch shortly to guide you through the next steps.</p>
      <p style="margin:28px 0 0;">Warm regards,<br /><strong>Team Dhanicap Finance</strong></p>
    `,
  });
}

// 3. General application status update — every other status change
function statusUpdateEmail({ fullName, referenceId, status }) {
  const statusLabel = status.replace(/_/g, " ");
  return emailLayout({
    preheader: `Application update for ${referenceId}`,
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:${INK};margin:0 0 16px;font-size:22px;">Application update</h2>
      <p style="margin:0 0 16px;">Dear ${fullName},</p>
      <p style="margin:0 0 16px;">Your application (Ref: <strong>${referenceId}</strong>) status has been updated to:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <tr><td style="background-color:${INK};padding:10px 22px;border-radius:4px;">
          <span style="color:${GOLD};font-weight:bold;letter-spacing:1px;text-transform:capitalize;font-family:Arial,Helvetica,sans-serif;font-size:13px;">${statusLabel}</span>
        </td></tr>
      </table>
      <p style="margin:0;">Please reach out to your relationship manager for any queries.</p>
      <p style="margin:28px 0 0;">Warm regards,<br /><strong>Team Dhanicap Finance</strong></p>
    `,
  });
}

// 4. Payment request — sent from paymentController.createPaymentRequest
function paymentRequestEmail({ fullName, referenceId, amount, payUrl }) {
  return emailLayout({
    preheader: `Payment request for application ${referenceId}`,
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:${INK};margin:0 0 16px;font-size:22px;">Payment request</h2>
      <p style="margin:0 0 16px;">Dear ${fullName},</p>
      <p style="margin:0 0 20px;">To proceed with your loan application (Ref: <strong>${referenceId}</strong>), please complete the payment below.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F3;border-left:3px solid ${GOLD};margin:0;">
        <tr><td style="padding:16px 20px;">
          <div style="font-size:11px;letter-spacing:1px;color:#999999;font-family:Arial,Helvetica,sans-serif;">AMOUNT DUE</div>
          <div style="font-size:26px;font-weight:bold;color:${INK};margin-top:4px;">&#8377;${amount}</div>
        </td></tr>
      </table>
    `,
    ctaText: "Complete payment",
    ctaUrl: payUrl || "#",
  });
}

// 5. Payment receipt — sent from paymentController.sendPaymentConfirmation
function paymentReceiptEmail({ fullName, referenceId, amount, receiptNo, date }) {
  return emailLayout({
    preheader: `Payment received — receipt ${receiptNo}`,
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:${INK};margin:0 0 16px;font-size:22px;">Payment received</h2>
      <p style="margin:0 0 16px;">Dear ${fullName},</p>
      <p style="margin:0 0 20px;">We confirm receipt of your payment towards application <strong>${referenceId}</strong>.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#777777;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Receipt no.</td>
            <td style="padding:10px 0;border-bottom:1px solid #eeeeee;text-align:right;font-weight:bold;">${receiptNo}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eeeeee;color:#777777;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Date</td>
            <td style="padding:10px 0;border-bottom:1px solid #eeeeee;text-align:right;">${date}</td></tr>
        <tr><td style="padding:10px 0;color:#777777;font-family:Arial,Helvetica,sans-serif;font-size:13px;">Amount paid</td>
            <td style="padding:10px 0;text-align:right;font-weight:bold;font-size:19px;color:${INK};">&#8377;${amount}</td></tr>
      </table>
      <p style="margin:0 0 8px;">Thank you for your payment. This receipt is auto-generated and valid without a signature.</p>
      <p style="margin:28px 0 0;">Warm regards,<br /><strong>Team Dhanicap Finance</strong></p>
    `,
  });
}

// 6. Password reset — sent from authController.forgotPassword (internal Super Admin/Manager use)
function passwordResetEmail({ resetLink, expiryMinutes }) {
  return emailLayout({
    preheader: "Reset your Dhanicap Finance account password",
    bodyHtml: `
      <h2 style="font-family:Georgia,serif;color:${INK};margin:0 0 16px;font-size:22px;">Reset your password</h2>
      <p style="margin:0 0 16px;">We received a request to reset your Dhanicap Finance LOS &amp; CRM account password.</p>
      <p style="margin:0;">This link expires in ${expiryMinutes} minutes. If you didn't request this, you can safely ignore this email.</p>
    `,
    ctaText: "Reset password",
    ctaUrl: resetLink,
  });
}

module.exports = {
  registrationEmail,
  eligibilityEmail,
  statusUpdateEmail,
  paymentRequestEmail,
  paymentReceiptEmail,
  passwordResetEmail,
};
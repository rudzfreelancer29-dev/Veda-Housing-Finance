const fs = require("fs");
const path = require("path");

const BRAND_NAME = process.env.EMAIL_BRAND_NAME || "Dhanicap Finance";
const COMPANY_NAME = process.env.EMAIL_COMPANY_NAME || "Dhanicap Finance Pvt. Ltd.";
const LOGO_PATH = path.join(__dirname, "..", "assets", "logo-email.png");

let logoDataUri = null;

function getLogoDataUri() {
  if (logoDataUri) return logoDataUri;

  if (fs.existsSync(LOGO_PATH)) {
    const logoBase64 = fs.readFileSync(LOGO_PATH).toString("base64");
    logoDataUri = `data:image/png;base64,${logoBase64}`;
    return logoDataUri;
  }

  return null;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeUrl(value = "") {
  return escapeHtml(value);
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatStatus(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function emailLayout({ preheader, title, content }) {
  const logo = getLogoDataUri();
  const currentYear = new Date().getFullYear();

  const logoMarkup = logo
    ? `<img src="${logo}" width="220" alt="${escapeHtml(BRAND_NAME)}" style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;border:0;" />`
    : `<div style="color:#FFFFFF;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;text-align:center;">${escapeHtml(BRAND_NAME)}</div>`;

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F4F4F2;font-family:Georgia,'Times New Roman',serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:#F4F4F2;font-size:1px;line-height:1px;opacity:0;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F4F2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
            <tr>
              <td style="background-color:#0A0A0A;padding:36px 40px;">
                ${logoMarkup}
              </td>
            </tr>

            <tr>
              <td style="padding:40px;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="background-color:#0A0A0A;padding:24px 40px;text-align:center;">
                <p style="margin:0 0 8px;color:#F4F4F2;font-family:Georgia,'Times New Roman',serif;font-size:13px;">
                  ${escapeHtml(COMPANY_NAME)}
                </p>
                <p style="margin:0;color:#999999;font-family:Arial,sans-serif;font-size:11px;line-height:17px;">
                  This is an automated message — please do not reply directly to this email.
                </p>
                <p style="margin:8px 0 0;color:#999999;font-family:Arial,sans-serif;font-size:11px;line-height:17px;">
                  © ${currentYear} ${escapeHtml(BRAND_NAME)}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function registrationEmail({ customerName, referenceId }) {
  return emailLayout({
    preheader: `Welcome to ${BRAND_NAME} — your reference is ${referenceId}`,
    title: `Welcome to ${BRAND_NAME}`,
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Welcome, ${escapeHtml(customerName)}
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Thank you for choosing ${escapeHtml(BRAND_NAME)}. Your registration has been completed successfully.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td style="background-color:#FAF8F3;border-left:4px solid #C9A961;padding:16px 20px;">
            <p style="margin:0 0 7px;color:#777777;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;">
              YOUR REFERENCE NUMBER
            </p>
            <p style="margin:0;color:#0A0A0A;font-size:22px;letter-spacing:0.5px;">
              ${escapeHtml(referenceId)}
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Please keep this reference number for all future correspondence regarding your application.
      </p>
      <p style="margin:0;color:#222222;font-size:15px;line-height:24px;">
        Our team will reach out shortly with the next steps.
      </p>
      <p style="margin:28px 0 0;color:#222222;font-size:15px;line-height:24px;">
        Warm regards,<br />Team ${escapeHtml(BRAND_NAME)}
      </p>
    `,
  });
}

function managerRegistrationEmail({ managerName, email }) {
  return emailLayout({
    preheader: `Welcome to ${BRAND_NAME} — your manager registration is successful`,
    title: `Welcome to ${BRAND_NAME}`,
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Welcome, ${escapeHtml(managerName)}
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Your manager registration with ${escapeHtml(BRAND_NAME)} has been completed successfully.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
        <tr>
          <td style="background-color:#FAF8F3;border-left:4px solid #C9A961;padding:16px 20px;">
            <p style="margin:0 0 7px;color:#777777;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;">
              YOUR LOGIN EMAIL
            </p>
            <p style="margin:0;color:#0A0A0A;font-size:20px;letter-spacing:0.5px;">
              ${escapeHtml(email)}
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Please use the password shared with you by the administrator to sign in. For your security, we recommend changing it after your first login.
      </p>
      <p style="margin:28px 0 0;color:#222222;font-size:15px;line-height:24px;">
        Warm regards,<br />Team ${escapeHtml(BRAND_NAME)}
      </p>
    `,
  });
}

function eligibilityEmail({ customerName, referenceId }) {
  return emailLayout({
    preheader: `${customerName} — your application is eligible`,
    title: "Application Eligible",
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Congratulations, ${escapeHtml(customerName)}!
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        We're pleased to inform you that your loan application
        (Ref: <strong>${escapeHtml(referenceId)}</strong>) has been reviewed and marked
        <strong style="color:#9A7B3F;">Eligible</strong> for further processing.
      </p>
      <p style="margin:0;color:#222222;font-size:15px;line-height:24px;">
        Our relationship manager will be in touch shortly to guide you through the next steps.
      </p>
      <p style="margin:28px 0 0;color:#222222;font-size:15px;line-height:24px;">
        Warm regards,<br />Team ${escapeHtml(BRAND_NAME)}
      </p>
    `,
  });
}

function statusUpdateEmail({ customerName, referenceId, status }) {
  return emailLayout({
    preheader: `Application update for ${referenceId}`,
    title: "Application Update",
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Application update
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Dear ${escapeHtml(customerName)},
      </p>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Your application (Ref: <strong>${escapeHtml(referenceId)}</strong>) status has been updated to:
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background-color:#0A0A0A;border-radius:4px;padding:10px 22px;">
            <span style="color:#C9A961;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.8px;text-transform:uppercase;">
              ${escapeHtml(formatStatus(status))}
            </span>
          </td>
        </tr>
      </table>
      <p style="margin:0;color:#222222;font-size:15px;line-height:24px;">
        Please reach out to your relationship manager for any queries.
      </p>
      <p style="margin:28px 0 0;color:#222222;font-size:15px;line-height:24px;">
        Warm regards,<br />Team ${escapeHtml(BRAND_NAME)}
      </p>
    `,
  });
}

function paymentRequestEmail({ customerName, referenceId, amount, paymentUrl }) {
  const buttonMarkup = paymentUrl
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
        <tr>
          <td style="background-color:#C9A961;border-radius:4px;">
            <a href="${escapeUrl(paymentUrl)}" style="display:inline-block;padding:14px 36px;color:#0A0A0A;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;">
              Complete payment
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  return emailLayout({
    preheader: `Payment request for application ${referenceId}`,
    title: "Payment Request",
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Payment request
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Dear ${escapeHtml(customerName)},
      </p>
      <p style="margin:0 0 24px;color:#222222;font-size:15px;line-height:24px;">
        To proceed with your loan application (Ref: <strong>${escapeHtml(referenceId)}</strong>), please complete the payment below.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="background-color:#FAF8F3;border-top:1px solid #E8E1D2;border-bottom:1px solid #E8E1D2;padding:16px 20px;">
            <p style="margin:0 0 8px;color:#777777;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;">
              AMOUNT DUE
            </p>
            <p style="margin:0;color:#0A0A0A;font-size:26px;">
              ${escapeHtml(formatAmount(amount))}
            </p>
          </td>
        </tr>
      </table>
      ${buttonMarkup}
    `,
  });
}

function paymentReceiptEmail({ customerName, referenceId, paymentId, amount, paymentDate }) {
  return emailLayout({
    preheader: `Payment received — receipt PAY-${paymentId}`,
    title: "Payment Received",
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Payment received
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Dear ${escapeHtml(customerName)},
      </p>
      <p style="margin:0 0 20px;color:#222222;font-size:15px;line-height:24px;">
        We confirm receipt of your payment towards application <strong>${escapeHtml(referenceId)}</strong>.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E1D2;">
        <tr>
          <td style="border-bottom:1px solid #E8E1D2;padding:10px 0;color:#777777;font-family:Arial,sans-serif;font-size:13px;">Receipt no.</td>
          <td align="right" style="border-bottom:1px solid #E8E1D2;padding:10px 0;color:#0A0A0A;font-size:15px;">PAY-${escapeHtml(paymentId)}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #E8E1D2;padding:10px 0;color:#777777;font-family:Arial,sans-serif;font-size:13px;">Date</td>
          <td align="right" style="border-bottom:1px solid #E8E1D2;padding:10px 0;color:#0A0A0A;font-size:15px;">${escapeHtml(formatDate(paymentDate))}</td>
        </tr>
        <tr>
          <td style="border-bottom:1px solid #E8E1D2;padding:10px 0;color:#777777;font-family:Arial,sans-serif;font-size:13px;">Amount paid</td>
          <td align="right" style="border-bottom:1px solid #E8E1D2;padding:10px 0;color:#0A0A0A;font-size:19px;">${escapeHtml(formatAmount(amount))}</td>
        </tr>
      </table>
      <p style="margin:24px 0 0;color:#222222;font-size:15px;line-height:24px;">
        Thank you for your payment. This receipt is auto-generated and valid without a signature.
      </p>
      <p style="margin:28px 0 0;color:#222222;font-size:15px;line-height:24px;">
        Warm regards,<br />Team ${escapeHtml(BRAND_NAME)}
      </p>
    `,
  });
}

function passwordResetEmail({ resetLink, expiryMinutes }) {
  return emailLayout({
    preheader: `Reset your ${BRAND_NAME} account password`,
    title: "Reset Your Password",
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Reset your password
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        We received a request to reset your ${escapeHtml(BRAND_NAME)} LOS &amp; CRM account password.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
        <tr>
          <td style="background-color:#C9A961;border-radius:4px;">
            <a href="${escapeUrl(resetLink)}" style="display:inline-block;padding:14px 36px;color:#0A0A0A;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-decoration:none;">
              Reset password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        This link expires in ${escapeHtml(expiryMinutes)} minutes.
      </p>
      <p style="margin:0;color:#222222;font-size:15px;line-height:24px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `,
  });
}

function customMessageEmail({ customerName, message }) {
  const formattedMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return emailLayout({
    preheader: `New message from ${BRAND_NAME}`,
    title: "New Message",
    content: `
      <h1 style="margin:0 0 20px;color:#0A0A0A;font-size:22px;font-weight:normal;line-height:30px;">
        Application message
      </h1>
      <p style="margin:0 0 18px;color:#222222;font-size:15px;line-height:24px;">
        Dear ${escapeHtml(customerName)},
      </p>
      <p style="margin:0;color:#222222;font-size:15px;line-height:24px;">
        ${formattedMessage}
      </p>
      <p style="margin:28px 0 0;color:#222222;font-size:15px;line-height:24px;">
        Warm regards,<br />Team ${escapeHtml(BRAND_NAME)}
      </p>
    `,
  });
}

module.exports = {
  registrationEmail,
  managerRegistrationEmail,
  eligibilityEmail,
  statusUpdateEmail,
  paymentRequestEmail,
  paymentReceiptEmail,
  passwordResetEmail,
  customMessageEmail,
};
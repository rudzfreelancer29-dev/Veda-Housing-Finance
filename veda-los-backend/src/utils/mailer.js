const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Uses Resend's free shared sending address (onboarding@resend.dev) by
// default — no domain purchase/verification needed to get started.
//
// IMPORTANT Resend limitation: until you verify your own domain on Resend,
// "onboarding@resend.dev" can only deliver to the email address that owns
// your Resend account (the one you signed up with) — this is Resend's
// anti-spam restriction for unverified senders, not a bug here. It's fine
// for testing the Super Admin's own forgot-password flow. To email real
// customers later, verify a domain in the Resend dashboard and set
// RESEND_FROM_EMAIL to an address on that domain.
async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}\n${html}`);
    return { mocked: true };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    return result;
  } catch (err) {
    console.error("Resend email failed:", err.message);
    throw err;
  }
}

module.exports = { sendEmail };
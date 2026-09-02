function normalizeMobile(mobile) {
  const digits = mobile.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

async function sendSms({ to, message, templateId }) {
  if (!process.env.MSG91_AUTH_KEY) {
    console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
    return { mocked: true };
  }

  try {
    const response = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId || process.env.MSG91_TEMPLATE_ID_REGISTRATION,
        short_url: "0",
        mobiles: normalizeMobile(to),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "MSG91 request failed");
    return data;
  } catch (err) {
    console.error("MSG91 SMS failed:", err.message);
    throw err;
  }
}

module.exports = { sendSms };
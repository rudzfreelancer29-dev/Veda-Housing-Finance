const crypto = require("crypto");

const BASE_URL = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

async function createOrder({ orderId, amount, customerId, customerPhone, customerEmail }) {
  if (!process.env.CASHFREE_APP_ID) {
    console.log(`[MOCK CASHFREE] Created order ${orderId} for ₹${amount}`);
    return { mocked: true, payment_session_id: `mock_session_${orderId}`, order_id: orderId };
  }

  const response = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: String(customerId),
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Cashfree order creation failed");
  return data;
}

function verifyWebhookSignature({ rawBody, timestamp, signature }) {
  if (!process.env.CASHFREE_SECRET_KEY) return true;
  if (!rawBody || !timestamp || !signature) return false;

  const expected = crypto
    .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
    .update(timestamp + rawBody)
    .digest("base64");
  return expected === signature;
}

module.exports = { createOrder, verifyWebhookSignature };
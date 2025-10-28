import fetch from "node-fetch";

export default async function handler(req, res) {
  // ✅ Handle CORS
  const allowedOrigins = [
    "https://sureboda.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ✅ Only POST is allowed
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { phone_number, amount } = req.body;
    if (!phone_number || !amount)
      return res.status(400).json({ error: "Missing phone_number or amount" });

    // Step 1: Get access token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch(
      `${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    // Step 2: Generate password
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    // Step 3: STK Push
    const stkBody = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone_number,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone_number,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: "SureBoda Payment",
      TransactionDesc: "Payment for SureBoda service"
    };

    const stkRes = await fetch(
      `${process.env.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(stkBody)
      }
    );

    const data = await stkRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("STK Push Error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}

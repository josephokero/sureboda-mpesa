// M-Pesa Daraja STK Push integration (Node.js/Express)
// NEVER expose your credentials in frontend code!
const express = require('express');
const axios = require('axios');
const router = express.Router();

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE || '8499486';
const tillNumber = process.env.MPESA_TILL_NUMBER || '6955822';
const passkey = process.env.MPESA_PASSKEY;
const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback';
const mpesaBaseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

// Get OAuth token
async function getToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await axios.get(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

// Initiate STK Push
router.post('/stkpush', async (req, res) => {
  try {
    let { amount, phone, userId } = req.body;
    // Convert phone numbers starting with 07 or 01 to 2547/2541 format
    if (/^0(7|1)\d{8}$/.test(phone)) {
      phone = '254' + phone.substring(1);
    }
    console.log('[M-Pesa] STK Push request:', { amount, phone, userId });
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(businessShortCode + passkey + timestamp).toString('base64');
    // Pass userId in callback URL as query param
    const cbUrl = callbackUrl.includes('?') ? `${callbackUrl}&userId=${userId}` : `${callbackUrl}?userId=${userId}`;
    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline', // Use for till number
      Amount: amount,
      PartyA: phone,
      PartyB: tillNumber, // Use till number for PartyB
      PhoneNumber: phone,
      CallBackURL: cbUrl,
      AccountReference: 'ASTUTEPROMUSIC',
      TransactionDesc: 'Daily Payment'
    };
    console.log('[M-Pesa] Payload:', payload);
    const stkRes = await axios.post(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[M-Pesa] STK Push response:', stkRes.data);
    res.json(stkRes.data);
  } catch (err) {
    console.error('[M-Pesa] STK Push error:', err.response?.data || err);
    res.status(500).json({ error: 'Failed to initiate M-Pesa payment' });
  }
});

// TODO: Add callback endpoint to handle payment confirmation

module.exports = router;

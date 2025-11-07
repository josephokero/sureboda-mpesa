// M-Pesa Daraja STK Push integration (Node.js/Express)
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Environment variables for credentials
const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const businessShortCode = process.env.MPESA_SHORTCODE || '8499486';
const tillNumber = process.env.MPESA_TILL_NUMBER || '6955822';
const passkey = process.env.MPESA_PASSKEY;
const mpesaBaseUrl = process.env.MPESA_BASE_URL || 'https://api.safaricom.co.ke';

// Get OAuth token
async function getToken() {
	const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
	const res = await axios.get(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
		headers: { Authorization: `Basic ${auth}` }
	});
	return res.data.access_token;
}

// Health check/status route
router.get('/', (req, res) => {
	res.send('MPesa backend is running');
});

// Initiate STK Push
router.post('/stk-push', async (req, res) => {
	const { phone_number, amount, narrative } = req.body;
	if (!phone_number || !amount) {
		return res.status(400).json({ error: 'Phone number and amount are required.' });
	}
	try {
		const token = await getToken();
		const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
		const password = Buffer.from(businessShortCode + passkey + timestamp).toString('base64');
		const payload = {
			BusinessShortCode: businessShortCode,
			Password: password,
			Timestamp: timestamp,
			TransactionType: 'CustomerBuyGoodsOnline',
			Amount: amount,
			PartyA: phone_number,
			PartyB: tillNumber,
			PhoneNumber: phone_number,
			CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback',
			AccountReference: narrative || 'Payment',
			TransactionDesc: narrative || 'Payment'
		};
		const stkRes = await axios.post(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
			headers: { Authorization: `Bearer ${token}` }
		});
		res.json(stkRes.data);
	} catch (err) {
		console.error('[M-Pesa] STK Push error:', err.response?.data || err);
		res.status(500).json({ error: 'Failed to initiate M-Pesa payment' });
	}
});

module.exports = router;

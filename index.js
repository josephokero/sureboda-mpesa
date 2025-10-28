require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');

const mpesaRoutes = require('./mpesa');
const mpesaCallbackRoutes = require('./mpesaCallback');

const app = express();




app.use(express.json());
const allowedOrigins = [
  'https://sureboda.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Health check
app.get('/', (req, res) => {
  res.send('MPesa backend is running');
});

// MPesa STK Push endpoint
app.post('/api/mpesa/stk-push', async (req, res) => {
  const { phone_number, amount, narrative } = req.body;
  if (!phone_number || !amount) {
    return res.status(400).json({ error: 'Phone number and amount are required.' });
  }
  try {
    // Step 1: Get access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const tokenRes = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    const access_token = tokenRes.data.access_token;

    // Step 2: Prepare STK Push payload
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString('base64');

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE, // 8499486
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline',
      Amount: amount,
      PartyA: phone_number,
      PartyB: process.env.MPESA_TILL_NUMBER, // 6955822
      PhoneNumber: phone_number,
      CallBackURL: process.env.MPESA_CALLBACK_URL, // https://sureboda-mpesa.vercel.app/api/mpesa/callback
      AccountReference: narrative || 'ASTUTEPROMUSIC',
      TransactionDesc: narrative || 'Daily Payment'
    };
    // Debug log for payload
    console.log('STK Push Payload:', payload);

    // Step 3: Send STK Push request
    try {
      const stkRes = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      res.status(200).json({
        success: true,
        message: stkRes.data.CustomerMessage || 'STK Push request sent. Check your phone to complete payment.',
        data: stkRes.data
      });
    } catch (stkErr) {
      // Improved error reporting
      let errorMsg = stkErr.message;
      if (stkErr.response && stkErr.response.data) {
        if (typeof stkErr.response.data === 'string') {
          errorMsg = stkErr.response.data;
        } else if (typeof stkErr.response.data === 'object') {
          errorMsg = stkErr.response.data.errorMessage || JSON.stringify(stkErr.response.data);
        }
      }
      res.status(500).json({
        success: false,
        error: errorMsg,
        message: 'Failed to initiate MPesa payment. Please try again or contact support.'
      });
    }
  } catch (err) {
    let errorMsg = err.message;
    if (err.response && err.response.data) {
      if (typeof err.response.data === 'string') {
        errorMsg = err.response.data;
      } else if (typeof err.response.data === 'object') {
        errorMsg = err.response.data.errorMessage || JSON.stringify(err.response.data);
      }
    }
    res.status(500).json({
      success: false,
      error: errorMsg,
      message: 'MPesa API error. Please try again or contact support.'
    });
  }
});

// MPesa callback endpoint
let paymentStatusStore = global.paymentStatusStore || {};
global.paymentStatusStore = paymentStatusStore;

app.post('/api/mpesa/callback', (req, res) => {
  const callback = req.body.Body?.stkCallback;
  let status = 'pending';
  let checkoutId = null;
  if (callback) {
    checkoutId = callback.CheckoutRequestID;
    if (callback.ResultCode === 0) {
      status = 'paid';
    } else {
      status = 'failed';
    }
    if (checkoutId) {
      paymentStatusStore[checkoutId] = status;
    }
  }
  res.status(200).json({ success: true, status, checkoutId, message: callback?.ResultDesc || 'Callback received.' });
});

// Payment status endpoint
app.get('/api/mpesa/payment-status', (req, res) => {
  const { checkoutId } = req.query;
  const status = paymentStatusStore[checkoutId] || 'pending';
  res.status(200).json({ success: true, status });
});

// Payment confirmations endpoint
app.get('/api/mpesa/payment-confirmations', (req, res) => {
  res.status(200).json({ success: true, payments: paymentStatusStore });
});

module.exports = app;
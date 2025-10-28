// --- Firebase Admin Setup ---
const admin = require('firebase-admin');
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized with env vars');
  } catch (e) {
    console.error('Firebase Admin init error:', e);
  }
}
const firestore = admin.firestore ? admin.firestore() : null;
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');




const app = express();




app.use(express.json());
const allowedOrigins = [
  'https://sureboda.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

// Health check
app.get('/', (req, res) => {
  res.send('MPesa backend is running');
});

// MPesa STK Push endpoint
app.post('/api/mpesa/stk-push', async (req, res) => {
  let { phone_number, amount, narrative, userId } = req.body;
  console.log('--- Payment Initiated ---');
  console.log('Received payment request:', { phone_number, amount, narrative, userId });
  if (!phone_number || !amount) {
    console.error('Missing phone number or amount');
    return res.status(400).json({ error: 'Phone number and amount are required.' });
  }
  // Normalize phone number to 2547xxxxxxxx or 2541xxxxxxxx
  phone_number = phone_number.trim();
  if (phone_number.startsWith('07') && phone_number.length === 10) {
    phone_number = '254' + phone_number.slice(1);
  } else if (phone_number.startsWith('01') && phone_number.length === 10) {
    phone_number = '254' + phone_number.slice(1);
  }
  // Optionally, validate format
  if (!/^254(7|1)\d{8}$/.test(phone_number)) {
    console.error('Invalid phone number format:', phone_number);
    return res.status(400).json({ error: 'Invalid phone number format. Use 07xxxxxxxx or 01xxxxxxxx.' });
  }
  try {
    console.log('Requesting MPesa access token...');
    // Step 1: Get access token
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const tokenRes = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    const access_token = tokenRes.data.access_token;
    console.log('Received MPesa access token');

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
      AccountReference: userId, // Pass userId for callback
      TransactionDesc: narrative || 'Daily Payment'
    };
  // Debug log for payload
  console.log('STK Push Payload:', payload);

    // Step 3: Send STK Push request
    try {
      console.log('Sending STK Push request to Safaricom...');
      const stkRes = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('STK Push response:', stkRes.data);
      // Save mapping of CheckoutRequestID to userId for later lookup in callback
      if (firestore && stkRes.data.CheckoutRequestID && userId) {
        await firestore.collection('mpesa-checkouts').doc(stkRes.data.CheckoutRequestID).set({ userId, phone: phone_number, amount, timestamp: new Date().toISOString() }, { merge: true });
        console.log('Saved CheckoutRequestID to userId mapping:', stkRes.data.CheckoutRequestID, userId);
      }
      res.status(200).json({
        success: true,
        message: stkRes.data.CustomerMessage || 'STK Push request sent. Check your phone to complete payment.',
        data: stkRes.data
      });
    } catch (stkErr) {
      // Improved error reporting
      console.error('STK Push error:', stkErr);
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
    console.error('MPesa STK Push endpoint error:', err);
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



app.post('/api/mpesa/callback', (req, res) => {
  console.log('==============================');
  console.log('MPESA CALLBACK EVENT RECEIVED');
  console.log('Raw Body:', JSON.stringify(req.body, null, 2));
  const callback = req.body.Body?.stkCallback;
  let status = 'pending';
  let checkoutId = null;
  let userId = 'unknownUser';
  if (callback) {
    console.log('Raw callback:', JSON.stringify(callback, null, 2));
    checkoutId = callback.CheckoutRequestID;
    userId = callback.AccountReference || 'unknownUser';
    // If userId is unknown, look up from mpesa-checkouts mapping
    const setTransaction = (finalUserId) => {
      if (firestore && checkoutId) {
        const transactionData = {
          checkoutId,
          userId: finalUserId,
          resultCode: callback.ResultCode,
          resultDesc: callback.ResultDesc,
          amount: callback.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value || null,
          mpesaReceiptNumber: callback.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value || null,
          phoneNumber: callback.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value || null,
          status,
          timestamp: new Date().toISOString(),
          raw: callback
        };
        firestore.collection('payroll').doc(finalUserId).collection('transactions').doc(checkoutId).set(transactionData, { merge: true })
          .then(() => console.log('Transaction status saved to Firestore with checkoutId as docId'))
          .catch(e => console.error('Error saving transaction to Firestore:', e));
      } else {
        console.error('Firestore or checkoutId missing. Not saving transaction.');
      }
    };
    if (userId === 'unknownUser' && firestore && checkoutId) {
      firestore.collection('mpesa-checkouts').doc(checkoutId).get()
        .then(doc => {
          if (doc.exists && doc.data().userId) {
            userId = doc.data().userId;
            setTransaction(userId);
          } else {
            setTransaction('unknownUser');
          }
        })
        .catch(e => {
          console.error('Error looking up userId from mpesa-checkouts:', e);
          setTransaction('unknownUser');
        });
    } else {
      setTransaction(userId);
    }
    if (callback.ResultCode === 0) {
      status = 'paid';
      console.log('PAYMENT SUCCESSFUL for CheckoutRequestID:', checkoutId);
    } else {
      status = 'failed';
      console.log('PAYMENT FAILED/DECLINED for CheckoutRequestID:', checkoutId);
    }
  } else {
    console.log('No valid callback found in body.');
  }
  res.status(200).json({ success: true, status, checkoutId, userId, message: callback?.ResultDesc || 'Callback received.' });
});

// Payment status endpoint
app.get('/api/mpesa/payment-status', (req, res) => {
  const { checkoutId, userId } = req.query;
  if (!firestore || !checkoutId || !userId) {
    return res.status(400).json({ success: false, error: 'Missing userId or checkoutId' });
  }
  firestore.collection('payroll').doc(userId).collection('transactions').doc(checkoutId).get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        res.status(200).json({ success: true, status: data.status, transaction: data });
      } else {
        // If not found, return pending instead of 500 error
        res.status(200).json({ success: true, status: 'pending' });
      }
    })
    .catch(e => {
      // Log error and return pending instead of 500
      console.error('Error fetching payment status:', e);
      res.status(200).json({ success: true, status: 'pending', error: e.message });
    });
});



module.exports = app;
// Simple Node.js/Express proxy for IntaSend API
// 1. Run: npm install express node-fetch cors
// 2. Start: node intasend-proxy.js

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();
const PORT = 5001; // You can change this port if needed

const allowedOrigins = ['http://localhost:5173', 'https://kentunez.com'];
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

// Proxy endpoint for IntaSend checkout
app.post('/api/intasend/stk-push', async (req, res) => {
  try {
  const response = await fetch('https://payment.intasend.com/api/v1/collections/mpesa/stk-push/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
  'Authorization': 'Bearer ISSecretKey_live_6b579e3d-ea01-4561-b0b3-7cb8fe11baa3',
      },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { raw: text };
    }
    if (!response.ok) {
      console.error('IntaSend API error:', response.status, data);
    }
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`IntaSend proxy running on http://localhost:${PORT}`);
});

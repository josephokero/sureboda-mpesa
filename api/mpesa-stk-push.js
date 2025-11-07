/**
 * Vercel Serverless Function: M-Pesa STK Push
 * 
 * Endpoint: https://sureboda-mpesa.vercel.app/api/mpesa-stk-push
 * 
 * This function proxies M-Pesa API requests to avoid CORS issues on web.
 * Updated: 2025-11-07
 */

import axios from 'axios';

// M-Pesa Configuration (use Vercel Environment Variables in production)
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'ZQp50qtvMb0GmTAghhQgnRpPsywr8dJbPbHCPNYhmtE9KO80',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'yJqm1QE8uOGJaJjSU6ePRgwRlWlITmbF7amWxX6wNEQyUpPALL3SbgFkohTSmHjt',
  shortCode: process.env.MPESA_SHORTCODE || '8499486',
  tillNumber: process.env.MPESA_TILL || '6955822',
  passKey: process.env.MPESA_PASSKEY || '82d0342a54624998fb5e2d6f907ad30a0b19fc86cc41aef0c63c95fcb45d2103',
  isProduction: process.env.MPESA_ENV === 'production' || true,
  sandboxUrl: 'https://sandbox.safaricom.co.ke',
  productionUrl: 'https://api.safaricom.co.ke',
};

const BASE_URL = MPESA_CONFIG.isProduction ? MPESA_CONFIG.productionUrl : MPESA_CONFIG.sandboxUrl;

// Generate OAuth Access Token
async function getAccessToken() {
  try {
    const auth = Buffer.from(
      `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
    ).toString('base64');

    const response = await axios.get(
      `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

// Generate Timestamp
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Generate Password
function generatePassword(timestamp) {
  const str = `${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passKey}${timestamp}`;
  return Buffer.from(str).toString('base64');
}

export default async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

    // Validate input
    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required',
      });
    }

    // Format phone number
    let formattedPhone = phoneNumber.toString();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = `254${formattedPhone}`;
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(timestamp);

    // Callback URL
    const callbackUrl = `${process.env.VERCEL_URL || 'https://sureboda-mpesa.vercel.app'}/api/mpesa-callback`;

    // Initiate STK Push
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_CONFIG.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: Math.floor(amount),
        PartyA: formattedPhone,
        PartyB: MPESA_CONFIG.tillNumber,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference || 'SUREBODA',
        TransactionDesc: transactionDesc || 'Wallet Top Up',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('STK Push successful:', response.data);

    return res.status(200).json({
      success: true,
      message: 'STK Push sent successfully',
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    });
  } catch (error) {
    console.error('Error initiating STK push:', error.response?.data || error.message);
    
    if (error.response?.data) {
      return res.status(500).json({
        success: false,
        message: error.response.data.errorMessage || 'M-Pesa request failed',
        errorCode: error.response.data.errorCode,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
    });
  }
};

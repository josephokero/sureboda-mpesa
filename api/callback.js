const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if it hasn't been already
if (!admin.apps.length) {
  try {
    // Check for Vercel environment and use environment variables
    if (process.env.VERCEL) {
      const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Fallback for local development
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    console.log('Firebase Admin initialized');
  } catch (e) {
    console.error('Firebase Admin init error:', e);
  }
}

const firestore = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('==============================');
  console.log('MPESA CALLBACK EVENT RECEIVED');
  console.log('Raw Body:', JSON.stringify(req.body, null, 2));

  const callback = req.body.Body?.stkCallback;
  let status = 'pending';
  let checkoutId = null;

  if (callback) {
    checkoutId = callback.CheckoutRequestID;
    console.log('Callback CheckoutRequestID:', checkoutId);
    console.log('Callback ResultCode:', callback.ResultCode);
    console.log('Callback ResultDesc:', callback.ResultDesc);

    // Extract userId from AccountReference
    const userId = callback.AccountReference || 'unknownUser';

    if (callback.ResultCode === 0) {
      status = 'paid';
      console.log('PAYMENT SUCCESSFUL for CheckoutRequestID:', checkoutId);
    } else {
      status = 'failed';
      console.log('PAYMENT FAILED/DECLINED for CheckoutRequestID:', checkoutId);
    }

    if (firestore && userId !== 'unknownUser' && checkoutId) {
      const transactionData = {
        checkoutId,
        userId,
        resultCode: callback.ResultCode,
        resultDesc: callback.ResultDesc,
        amount: callback.CallbackMetadata?.Item?.find(i => i.Name === 'Amount')?.Value || null,
        mpesaReceiptNumber: callback.CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value || null,
        phoneNumber: callback.CallbackMetadata?.Item?.find(i => i.Name === 'PhoneNumber')?.Value || null,
        status,
        timestamp: new Date().toISOString(),
        raw: callback
      };

      try {
        await firestore.collection('payroll').doc(userId).collection('transactions').doc(checkoutId).set(transactionData);
        console.log('Transaction status saved to Firestore');
      } catch (e) {
        console.error('Error saving transaction to Firestore:', e);
        // Still send a 200 to Safaricom, but log the error
      }
    }
  } else {
    console.log('No valid callback found in body.');
  }

  res.status(200).json({ success: true, status, checkoutId, message: callback?.ResultDesc || 'Callback received.' });
}
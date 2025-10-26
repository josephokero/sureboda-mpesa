// M-Pesa callback handler and Firestore integration
const express = require('express');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const router = express.Router();

// Initialize Firebase Admin if not already initialized
try {
  initializeApp({ credential: applicationDefault() });
} catch (e) {}
const db = getFirestore();

// Callback endpoint for M-Pesa
router.post('/callback', async (req, res) => {
  try {
    console.log('[M-Pesa] Callback received:', JSON.stringify(req.body, null, 2));
    const body = req.body;
    // Safaricom sends the result in body.Body.stkCallback
    const callback = body.Body?.stkCallback;
    if (!callback) return res.status(400).send('No callback data');
    if (callback.ResultCode !== 0) {
      console.log('[M-Pesa] Payment not successful:', callback.ResultDesc);
      return res.status(200).send('Payment not successful');
    }

    // Extract details
    const metadata = callback.CallbackMetadata?.Item || [];
    const phone = metadata.find(i => i.Name === 'PhoneNumber')?.Value;
    const amount = metadata.find(i => i.Name === 'Amount')?.Value;
    const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const transTime = metadata.find(i => i.Name === 'TransactionDate')?.Value;

    // Get userId from callback URL query param
    const userId = req.query.userId;
    if (!userId) {
      console.error('[M-Pesa] No userId in callback URL');
      return res.status(400).send('No userId');
    }
    // Save transaction in Firestore under correct user
    const payrollRef = db.collection('payroll').doc(userId);
    const payrollSnap = await payrollRef.get();
    if (!payrollSnap.exists) {
      console.error('[M-Pesa] Payroll doc not found for user:', userId);
      return res.status(404).send('Payroll doc not found');
    }
    const payrollData = payrollSnap.data();
    const dailyTargetFee = payrollData.dailyTargetFee || 820;
    let balance = payrollData.balance || 0;

    // Check if it's a new day (reset balance to dailyTargetFee if so)
    const now = new Date();
    let lastReset = payrollData.lastBalanceReset ? new Date(payrollData.lastBalanceReset) : null;
    if (!lastReset ||
      now.getFullYear() !== lastReset.getFullYear() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getDate() !== lastReset.getDate()) {
      // New day, reset balance
      balance = dailyTargetFee;
      await payrollRef.update({ balance, lastBalanceReset: now.toISOString() });
    }

    // Subtract payment amount from balance
    const newBalance = Math.max(0, balance - Number(amount));
    await payrollRef.update({ balance: newBalance });

    await payrollRef.collection('transactions').add({
      amount,
      date: now,
      description: 'M-Pesa Payment',
      type: 'credit',
      mpesaReceipt,
      transTime,
      phone
    });
    console.log('[M-Pesa] Payment recorded in Firestore for user:', userId, 'New balance:', newBalance);
    res.status(200).send('Payment recorded');
  } catch (err) {
    console.error('[M-Pesa] Callback error:', err);
    res.status(500).send('Error processing callback');
  }
});

module.exports = router;

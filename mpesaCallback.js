
// Proven kentune logic: in-memory payment status store, no Firebase
let paymentStatusStore = global.paymentStatusStore || {};
global.paymentStatusStore = paymentStatusStore;

const express = require('express');
const router = express.Router();

// Callback endpoint for M-Pesa
router.post('/callback', (req, res) => {
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

module.exports = router;
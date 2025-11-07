/**
 * Vercel Serverless Function: M-Pesa Callback
 * 
 * Endpoint: https://your-project.vercel.app/api/mpesa-callback
 * 
 * Receives payment confirmation from Safaricom
 */

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    const callbackData = req.body;
    const stkCallback = callbackData.Body?.stkCallback;

    if (!stkCallback) {
      console.error('Invalid callback data');
      return res.status(400).json({ message: 'Invalid callback data' });
    }

    const merchantRequestId = stkCallback.MerchantRequestID;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const amount = callbackMetadata.find((item) => item.Name === 'Amount')?.Value || 0;
      const mpesaReceiptNumber = callbackMetadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value || '';
      const phoneNumber = callbackMetadata.find((item) => item.Name === 'PhoneNumber')?.Value || '';

      console.log('Payment successful:', {
        mpesaReceiptNumber,
        amount,
        phoneNumber,
        checkoutRequestId,
      });

      // TODO: Update Firebase Firestore here
      // - Find transaction by checkoutRequestId
      // - Update user wallet balance
      // - Create transaction record
      
      // For now, just log success
    } else {
      // Payment failed
      console.log('Payment failed:', resultDesc);
    }

    // Send response to Safaricom
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Error processing callback:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

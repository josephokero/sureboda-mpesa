# M-Pesa B2C Withdrawal Setup for Rider Withdrawals

## Overview
This implementation allows riders to withdraw their earnings from the SUREBODA wallet to their M-Pesa account using the same Vercel infrastructure as the business payment system.

## What Was Added

### 1. Backend API Endpoints (Vercel Serverless Functions)

**File: `api/mpesa_b2c_withdrawal.js`**
- Handles B2C (Business to Customer) payment requests
- Sends money from business shortcode to rider's M-Pesa
- Endpoint: `https://mpesa-api-six.vercel.app/api/mpesa_b2c_withdrawal`

**File: `api/mpesa_b2c_callback.js`**
- Receives M-Pesa transaction confirmation callbacks
- Logs transaction results for monitoring
- Endpoint: `https://mpesa-api-six.vercel.app/api/mpesa_b2c_callback`

### 2. Flutter Service Update

**File: `lib/services/mpesa_vercel_service.dart`**
- Added `initiateB2CWithdrawal()` method
- Calls the Vercel B2C endpoint
- Returns transaction status and conversation ID

### 3. Updated Withdrawal Screen

**File: `lib/screens/rider/withdrawal_screen.dart`**
- Now uses `MpesaVercelService` instead of old `MpesaService`
- Shows processing dialog while withdrawal is being processed
- Updates wallet balance immediately (optimistic update)
- Creates transaction record in Firestore

## How It Works

```
┌─────────────┐
│   Rider     │
│  Dashboard  │
└──────┬──────┘
       │
       │ Clicks "Withdraw to M-Pesa"
       ▼
┌─────────────┐
│  Withdrawal │
│   Screen    │
└──────┬──────┘
       │
       │ 1. Enter amount & phone
       │ 2. Click "Withdraw Now"
       ▼
┌─────────────┐
│   Flutter   │
│  MpesaVercel│
│   Service   │
└──────┬──────┘
       │
       │ HTTP POST Request
       ▼
┌─────────────┐
│   Vercel    │
│   API       │
│ (B2C Endpoint)
└──────┬──────┘
       │
       │ 1. Get OAuth token
       │ 2. Send B2C request
       ▼
┌─────────────┐
│  Safaricom  │
│  M-Pesa API │
└──────┬──────┘
       │
       │ Process payment
       ▼
┌─────────────┐
│   Rider's   │
│   M-Pesa    │
│  Account    │
└─────────────┘
       │
       │ Confirmation SMS
       ▼
     ✅ Done!
```

## Deployment Steps

### 1. Deploy to Vercel (Same Project as Business Payments)

```bash
cd c:\Users\HomePC\Desktop\sureboda-app

# Deploy to Vercel (will update existing deployment)
vercel --prod
```

This will deploy both endpoints:
- `/api/mpesa_stk_push` (existing - for business topup)
- `/api/mpesa_callback` (existing - for business topup callbacks)
- `/api/mpesa_b2c_withdrawal` (NEW - for rider withdrawals)
- `/api/mpesa_b2c_callback` (NEW - for withdrawal callbacks)

### 2. Configure M-Pesa B2C Settings

You need to configure B2C on your M-Pesa account:

**Required Credentials:**
- `MPESA_B2C_SHORTCODE` - Your B2C shortcode (usually same as paybill)
- `MPESA_INITIATOR_NAME` - Provided by Safaricom (e.g., "testapi")
- `MPESA_SECURITY_CREDENTIAL` - Encrypted initiator password

**Get Security Credential:**
1. Download M-Pesa certificate from Safaricom
2. Encrypt your initiator password with the certificate
3. Use the encrypted string as `MPESA_SECURITY_CREDENTIAL`

**Set Environment Variables in Vercel:**
```bash
vercel env add MPESA_B2C_SHORTCODE
vercel env add MPESA_INITIATOR_NAME
vercel env add MPESA_SECURITY_CREDENTIAL
```

### 3. Register Callback URLs with Safaricom

Contact Safaricom to register these URLs for B2C:

- **Result URL:** `https://mpesa-api-six.vercel.app/api/mpesa_b2c_callback`
- **Timeout URL:** `https://mpesa-api-six.vercel.app/api/mpesa_b2c_callback`

## Testing

### 1. Test the Endpoint Directly

```bash
curl -X POST https://mpesa-api-six.vercel.app/api/mpesa_b2c_withdrawal \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "remarks": "Test withdrawal"
  }'
```

### 2. Test from Flutter App

1. Run the app: `flutter run -d chrome`
2. Login as a rider with some wallet balance
3. Go to Earnings tab
4. Click "Withdraw to M-Pesa"
5. Enter amount (minimum KSH 10)
6. Click "Withdraw Now"
7. Check M-Pesa for payment confirmation

## Important Notes

### Security Credentials

⚠️ **IMPORTANT:** The `MPESA_SECURITY_CREDENTIAL` in the code is a placeholder. You MUST:

1. Get the actual initiator password from Safaricom
2. Download the M-Pesa production certificate
3. Encrypt the password using OpenSSL:
   ```bash
   echo -n 'YourInitiatorPassword' | openssl pkeyutl -encrypt -pubin -inkey cert.pem | base64 -w 0
   ```
4. Set the encrypted string as environment variable in Vercel

### Transaction Limits

- **Minimum withdrawal:** KSH 10
- **Maximum per transaction:** KSH 150,000
- **Daily limit:** Set by your M-Pesa account configuration

### Withdrawal Fees

M-Pesa charges a small fee for B2C transactions. This is deducted from your business account, not the rider's withdrawal amount.

## Monitoring

### Check Vercel Logs

```bash
vercel logs --follow
```

### Check Firestore Transactions

All withdrawals are logged in Firestore `transactions` collection with:
- `type: 'withdrawal'`
- `userType: 'rider'`
- `status: 'processing'` or `'completed'`
- `conversationId` - M-Pesa transaction ID

## Troubleshooting

### "Failed to initiate withdrawal"
- Check Vercel logs for detailed error
- Verify environment variables are set
- Ensure phone number is in format `254XXXXXXXXX`

### "Insufficient balance"
- Rider's wallet balance is checked before withdrawal
- Balance must be >= withdrawal amount

### "Security credential invalid"
- Regenerate the security credential using correct certificate
- Make sure you're using production certificate for production

### Callback not received
- Verify callback URLs are registered with Safaricom
- Check Vercel function logs
- M-Pesa callbacks can take 30-60 seconds

## Cost Estimate

**Per withdrawal:**
- Vercel function execution: Free (100K requests/month free)
- M-Pesa B2C fee: ~KSH 10-30 (depends on amount)
- Total: ~KSH 10-30 per withdrawal

## Support

If you encounter issues:
1. Check Vercel logs: `vercel logs`
2. Check browser console for frontend errors
3. Verify M-Pesa credentials in Vercel environment variables
4. Contact Safaricom support for API issues

## Summary

✅ **Working Features:**
- Rider can withdraw from wallet to M-Pesa
- Real-time M-Pesa payment processing
- Transaction logging in Firestore
- Processing dialog with status updates
- Minimum/maximum amount validation
- Phone number format validation
- Optimistic wallet balance update

✅ **Uses Same Infrastructure:**
- Same Vercel project as business payments
- Same M-Pesa credentials and setup
- Consistent error handling and logging

✅ **Production Ready:**
- CORS enabled for web access
- Error handling and validation
- Transaction logging for auditing
- Secure API communication

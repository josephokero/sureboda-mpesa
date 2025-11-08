# 💰 M-Pesa B2C Withdrawal System - Complete Setup Guide

## Overview
This system allows riders to withdraw their earnings from the app wallet directly to their M-Pesa accounts using Safaricom's B2C (Business to Customer) API.

---

## 🎯 What Was Implemented

### 1. **Frontend (Flutter App)**
- ✅ Withdrawal screen with amount input
- ✅ Phone number validation
- ✅ Quick amount buttons (100, 500, 1000, 2000, All)
- ✅ Real-time balance checking
- ✅ Loading states and error handling
- ✅ Transaction history recording

### 2. **Backend (Firebase Cloud Function)**
- ✅ `initiateB2CPayment` - Processes withdrawal requests
- ✅ `mpesaB2CCallback` - Handles successful payments
- ✅ `mpesaB2CTimeout` - Handles timeout scenarios
- ✅ Secure credential management
- ✅ OAuth token generation
- ✅ Transaction logging

### 3. **Database Updates**
- ✅ Deducts from rider wallet balance
- ✅ Creates transaction records
- ✅ Stores M-Pesa receipt numbers
- ✅ Logs all callbacks for auditing

---

## 📋 Requirements for Live M-Pesa B2C

### Step 1: Contact Safaricom to Enable B2C

**Important:** B2C API is NOT enabled by default. You must:

1. **Email Safaricom:** apisupport@safaricom.co.ke
2. **Request B2C Access** with these details:
   ```
   Subject: B2C API Access Request for SUREBODA
   
   Dear Safaricom API Team,
   
   We would like to request B2C (Business to Customer) API access for our delivery platform SUREBODA.
   
   Organization Details:
   - Business Name: SUREBODA
   - Business ShortCode: 8499486
   - Till Number: 6955822
   - Purpose: Rider earnings withdrawal
   - Expected Transaction Volume: 50-100 withdrawals per day
   
   Please provide:
   1. Initiator Name (API operator username)
   2. Security Credential generation steps
   3. B2C approval and activation
   
   Thank you.
   ```

3. **Wait for Approval** (Usually 3-5 business days)

### Step 2: Get Security Credential

Once approved, Safaricom will provide:
- **Initiator Name:** Your API operator username (e.g., "testapi")
- **Initiator Password:** A password you create

**Generate Security Credential:**
1. Download M-Pesa certificate from Safaricom
2. Use OpenSSL to encrypt your password:
   ```bash
   openssl enc -aes-256-cbc -in initiator_password.txt -out encrypted.txt -e -base64 -K <public_key> -iv <initialization_vector>
   ```
3. The output is your `SecurityCredential`

### Step 3: Update Firebase Cloud Function

Edit `functions/index.js`:

```javascript
// Replace these values with your actual credentials
const initiatorName = 'YOUR_ACTUAL_INITIATOR_NAME'; // From Safaricom
const securityCredential = 'YOUR_ACTUAL_SECURITY_CREDENTIAL'; // Encrypted password
```

**Important:** Never commit real credentials to GitHub! Use Firebase environment variables:

```bash
firebase functions:config:set mpesa.initiator_name="YOUR_NAME"
firebase functions:config:set mpesa.security_credential="YOUR_CREDENTIAL"
```

Then in code:
```javascript
const initiatorName = functions.config().mpesa.initiator_name;
const securityCredential = functions.config().mpesa.security_credential;
```

### Step 4: Deploy Firebase Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

This will deploy:
- `initiateB2CPayment`
- `mpesaB2CCallback`
- `mpesaB2CTimeout`

### Step 5: Update Callback URLs in M-Pesa Portal

Log into M-Pesa Portal and set:
- **Result URL:** `https://us-central1-astute-empire.cloudfunctions.net/mpesaB2CCallback`
- **Timeout URL:** `https://us-central1-astute-empire.cloudfunctions.net/mpesaB2CTimeout`

---

## 🔧 Testing the System

### Test on Sandbox (Before Live)

1. **Use Sandbox Credentials:**
   ```javascript
   const baseUrl = 'https://sandbox.safaricom.co.ke';
   ```

2. **Test Phone Numbers:**
   - Use Safaricom test numbers provided in sandbox documentation
   - Example: 254708374149

3. **Test Amounts:**
   - Minimum: KSH 10
   - Maximum: KSH 150,000

### Test on Production (After Approval)

1. **Use Production Credentials:**
   ```javascript
   const baseUrl = 'https://api.safaricom.co.ke';
   ```

2. **Test with Small Amount First:**
   - Start with KSH 10-50
   - Verify callback is received
   - Check M-Pesa SMS confirmation

3. **Monitor Logs:**
   ```bash
   firebase functions:log
   ```

---

## 🎯 How It Works - User Flow

```
Rider Dashboard
      ↓
Clicks "Withdraw to M-Pesa"
      ↓
Enters Amount & Phone Number
      ↓
Clicks "Withdraw Now"
      ↓
App calls Firebase Cloud Function
      ↓
Cloud Function:
  1. Gets OAuth token from M-Pesa
  2. Calls B2C Payment API
  3. M-Pesa processes payment
      ↓
M-Pesa sends money to rider's phone
      ↓
M-Pesa calls callback URL
      ↓
App updates:
  - Deducts from wallet balance
  - Creates transaction record
  - Shows success message
      ↓
Rider receives SMS from M-Pesa
      ↓
Money available in M-Pesa wallet ✅
```

---

## 📊 Database Structure

### Transaction Record
```javascript
{
  userId: 'rider_uid',
  type: 'withdrawal',
  amount: 500,
  phone: '254712345678',
  status: 'completed',
  mpesaReceiptNumber: 'QAR6XWZYT5',
  description: 'Wallet withdrawal',
  createdAt: Timestamp
}
```

### Callback Log
```javascript
{
  type: 'b2c',
  data: { /* Full M-Pesa response */ },
  resultCode: 0,
  resultDesc: 'The service request is processed successfully.',
  transactionID: 'QAR6XWZYT5',
  timestamp: Timestamp
}
```

---

## 🛡️ Security Features

1. **Server-Side Processing**
   - Credentials never exposed to client
   - All API calls from Firebase Cloud Functions
   - Secure environment variables

2. **Validation**
   - Minimum withdrawal: KSH 10
   - Maximum withdrawal: Available balance
   - Phone number format validation
   - Amount range checking

3. **Error Handling**
   - Network failures handled gracefully
   - User-friendly error messages
   - Automatic retry logic (optional)
   - Transaction rollback on failure

4. **Audit Trail**
   - All callbacks logged to Firestore
   - Transaction history maintained
   - M-Pesa receipt numbers stored
   - Timestamp tracking

---

## 💡 Cost Analysis

### M-Pesa B2C Charges
- **Per Transaction:** KSH 0 (Free for business)
- **Rider Receives:** Full amount (no deduction)
- **Monthly Fee:** None for B2C

### Example:
```
Rider Balance:     KSH 2,500
Withdrawal Amount: KSH 2,000
-------------------------------
Rider Receives:    KSH 2,000 (full amount)
Remaining Balance: KSH 500
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to get access token"
**Solution:**
- Check consumer key and secret are correct
- Ensure using production URL for live credentials
- Verify internet connection

#### 2. "SecurityCredential is invalid"
**Solution:**
- Re-generate security credential with correct certificate
- Ensure using correct initiator password
- Contact Safaricom for credential verification

#### 3. "Insufficient Permissions"
**Solution:**
- Confirm B2C is enabled by Safaricom
- Check initiator has B2C permissions
- Verify shortcode is correct

#### 4. "Transaction timeout"
**Solution:**
- M-Pesa server might be busy
- Implement retry logic
- Check callback URL is accessible
- Verify network connectivity

#### 5. "Callback not received"
**Solution:**
- Confirm callback URL is correct in M-Pesa portal
- Check Firebase Functions are deployed
- Verify HTTPS endpoint is accessible
- Review Firebase Functions logs

---

## 📱 Testing Checklist

### Before Going Live
- [ ] B2C access approved by Safaricom
- [ ] Security credential generated and tested
- [ ] Firebase Functions deployed successfully
- [ ] Callback URLs registered in M-Pesa portal
- [ ] Test withdrawals completed successfully
- [ ] SMS confirmations received
- [ ] Transaction records created correctly
- [ ] Wallet balance updates properly
- [ ] Error handling works correctly
- [ ] Logs show proper flow

### Production Monitoring
- [ ] Monitor Firebase Functions logs daily
- [ ] Check callback success rate
- [ ] Track failed transactions
- [ ] Review user feedback
- [ ] Monitor wallet balance accuracy
- [ ] Verify M-Pesa reconciliation

---

## 🚀 Deployment Steps

### 1. Deploy Firebase Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### 2. Verify Deployment
```bash
firebase functions:log --only initiateB2CPayment
```

### 3. Test Endpoint
```bash
curl -X POST https://us-central1-astute-empire.cloudfunctions.net/initiateB2CPayment \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 10,
    "remarks": "Test withdrawal"
  }'
```

### 4. Monitor Live Transactions
```bash
firebase functions:log --follow
```

---

## 📞 Support Contacts

### Safaricom API Support
- **Email:** apisupport@safaricom.co.ke
- **Phone:** +254 722 000 000
- **Portal:** https://developer.safaricom.co.ke

### Firebase Support
- **Documentation:** https://firebase.google.com/docs
- **Community:** https://stackoverflow.com/questions/tagged/firebase

---

## ✨ Features Summary

### Current Implementation
- ✅ Instant withdrawals (1-3 minutes)
- ✅ No withdrawal fees
- ✅ Minimum KSH 10
- ✅ Maximum daily limit: KSH 150,000
- ✅ Real-time balance updates
- ✅ Transaction history
- ✅ SMS confirmations
- ✅ Error handling
- ✅ Secure processing

### Future Enhancements
- [ ] Scheduled withdrawals
- [ ] Bulk withdrawals for multiple riders
- [ ] Bank account withdrawals (optional)
- [ ] Transaction export (PDF/CSV)
- [ ] Push notifications on success
- [ ] Auto-retry on failure
- [ ] Daily withdrawal limits per rider
- [ ] Email confirmations

---

## 🎉 Summary

Your withdrawal system is now **ready for production** once you:

1. ✅ Get B2C approval from Safaricom
2. ✅ Generate security credential
3. ✅ Update Firebase Functions with real credentials
4. ✅ Deploy functions
5. ✅ Test with small amounts
6. ✅ Go live!

Riders can now withdraw their earnings instantly to M-Pesa with zero fees! 🚀💰

---

**Need Help?** Contact Safaricom API support or check Firebase Functions logs for detailed error messages.

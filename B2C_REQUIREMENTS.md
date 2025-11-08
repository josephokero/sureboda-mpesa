# Why B2C Withdrawals Are Not Working

## The Problem

You're getting **"Invalid Access Token"** error because:

**M-Pesa B2C (Business to Customer) requires DIFFERENT API credentials than C2B (Customer to Business).**

## Current Situation

### ✅ What's Working: STK Push (Business Top-Up)
- **Type:** C2B (Customer to Business) - Customer pays YOU
- **Credentials:** Standard consumer key/secret
- **Process:** Customer enters M-Pesa PIN to send money to business
- **Status:** ✅ WORKING

### ❌ What's NOT Working: B2C Withdrawals (Rider Payouts)
- **Type:** B2C (Business to Customer) - YOU pay customer
- **Credentials:** Requires **separate B2C API access** from Safaricom
- **Process:** Business sends money to rider's M-Pesa
- **Status:** ❌ NOT WORKING - Invalid credentials

## Why They're Different

| Feature | C2B (STK Push) | B2C (Withdrawals) |
|---------|---------------|-------------------|
| Direction | Customer → Business | Business → Customer |
| Authentication | Consumer Key/Secret | Consumer Key/Secret + Security Credential |
| Initiator | Customer initiates | Business initiates |
| Approval | Requires separate application | Requires separate application |
| Sandbox Access | ✅ Available | ⚠️ Limited/Restricted |

## The Real Issue: B2C Security Credential

The **Security Credential** is an **encrypted password** that:
1. Must be obtained from Safaricom after B2C approval
2. Is encrypted using Safaricom's public certificate
3. Cannot be generated without proper B2C access

**Current credential:** `Safaricom999!*!` - This is a placeholder/test that doesn't work

## Solutions

### Option 1: Apply for B2C Access (PRODUCTION ONLY) ⭐ Recommended for Live App

**Steps:**
1. Login to Safaricom Daraja portal: https://developer.safaricom.co.ke
2. Go to your app and apply for B2C API access
3. Wait for approval (2-5 business days)
4. Download the production certificate
5. Get your initiator credentials
6. Encrypt your initiator password using the certificate
7. Add to Vercel environment variables

**Cost:** No setup fee, but M-Pesa charges per transaction (~KSH 10-30)

**Timeline:** 2-5 business days for approval

### Option 2: Use Manual Withdrawal Process (IMMEDIATE) ⚠️ Temporary Solution

Since B2C requires approval, implement a manual withdrawal system:

**How it works:**
1. Rider requests withdrawal in app
2. Request is saved to Firestore with status: "pending"
3. Admin/business owner reviews requests in admin panel
4. Admin manually sends money via M-Pesa app or Paybill
5. Admin marks withdrawal as "completed" in system
6. Rider receives confirmation

**Pros:**
- ✅ Works immediately
- ✅ No API approval needed
- ✅ Full control over payouts

**Cons:**
- ⚠️ Not automated
- ⚠️ Requires manual processing
- ⚠️ Slower for riders

### Option 3: Use PayPal/Stripe Payouts (ALTERNATIVE)

Instead of M-Pesa B2C, use:
- **PayPal Payouts API** - Requires PayPal business account
- **Stripe Connect** - Requires Stripe account
- **Flutterwave Payouts** - African payment gateway

**Pros:**
- ✅ No waiting for approval
- ✅ International support
- ✅ API-ready

**Cons:**
- ⚠️ Higher fees
- ⚠️ May require bank accounts
- ⚠️ More complex setup

## Recommended Immediate Action

**Implement Option 2 (Manual Withdrawals) NOW, then upgrade to Option 1 (Automated B2C) later.**

This gives you:
1. ✅ Working withdrawal system TODAY
2. ✅ Time to get B2C approval
3. ✅ Smooth transition when B2C is ready

## What Happens Next

I'll implement the manual withdrawal system for you:

1. Keep the withdrawal request form
2. Save requests to Firestore with status tracking
3. Create admin panel to view pending withdrawals
4. Add manual approval workflow
5. Send notifications when withdrawal is processed

Once you get B2C approval from Safaricom, we can switch to automated withdrawals with minimal code changes.

## Testing B2C in Sandbox

**Important:** Even M-Pesa sandbox has limited B2C testing. You may need to:
1. Contact Safaricom support for sandbox B2C credentials
2. Use their test phone numbers
3. Get proper security credentials even for sandbox

## Summary

**Why it's not working:** B2C withdrawals need separate API approval and credentials from Safaricom

**What to do now:** Implement manual withdrawal system while waiting for B2C approval

**Timeline:**
- Manual system: Can implement in 30 minutes ✅
- B2C approval: 2-5 business days ⏳
- Full automation: After B2C approval + 1 hour to configure ⏳

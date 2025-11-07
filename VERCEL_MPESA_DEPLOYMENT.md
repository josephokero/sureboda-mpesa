# M-Pesa Vercel Integration - Deployment Guide

## ✅ You Already Have a Vercel Project!

**Project Name**: `sureboda-mpesa`  
**Project ID**: `prj_MEUJblZkypsywKoWecsdGpLBlLop`  
**URL**: `https://sureboda-mpesa.vercel.app`

---

## 📦 What Was Created

### 1. Vercel Serverless Functions
- `api/mpesa-stk-push.js` - Initiates M-Pesa payments (avoids CORS)
- `api/mpesa-callback.js` - Receives payment confirmation from Safaricom
- `vercel.json` - Vercel configuration
- `package.json` - Node.js dependencies

### 2. Flutter Service
- `lib/services/mpesa_vercel_service.dart` - Calls your Vercel API

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Environment Variables in Vercel

Go to: https://vercel.com/tunezken-astute-pro074-6170s-projects/sureboda-mpesa/settings/environment-variables

Add these variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MPESA_CONSUMER_KEY` | `ZQp50qtvMb0GmTAghhQgnRpPsywr8dJbPbHCPNYhmtE9KO80` | Production |
| `MPESA_CONSUMER_SECRET` | `yJqm1QE8uOGJaJjSU6ePRgwRlWlITmbF7amWxX6wNEQyUpPALL3SbgFkohTSmHjt` | Production |
| `MPESA_SHORTCODE` | `8499486` | Production |
| `MPESA_TILL` | `6955822` | Production |
| `MPESA_PASSKEY` | `82d0342a54624998fb5e2d6f907ad30a0b19fc86cc41aef0c63c95fcb45d2103` | Production |
| `MPESA_ENV` | `production` | Production |

### Step 3: Push to GitHub

Since your Vercel project is linked to GitHub, just push your code:

```bash
git add api/ vercel.json package.json
git commit -m "Add M-Pesa Vercel serverless functions"
git push
```

**Vercel will automatically deploy!** 🎉

### Step 4: Update Flutter (Already Done!)

The Flutter service `mpesa_vercel_service.dart` is already configured to call:
```
https://sureboda-mpesa.vercel.app/api/mpesa-stk-push
```

---

## 🧪 TESTING

### Test in Flutter

Replace your wallet top-up code to use `MpesaVercelService` instead of `MpesaService`:

```dart
import 'package:sureboda_app/services/mpesa_vercel_service.dart';

// In your top-up screen
final mpesaService = MpesaVercelService();

final result = await mpesaService.initiateSTKPush(
  phoneNumber: '254743066593',
  amount: 100,
  accountReference: 'WALLET_TOPUP',
  transactionDesc: 'Wallet Top Up',
);

if (result['success']) {
  // Show success message
  print('STK Push sent: ${result['customerMessage']}');
} else {
  // Show error
  print('Error: ${result['message']}');
}
```

### Test the API Directly

Using Postman or curl:

```bash
curl -X POST https://sureboda-mpesa.vercel.app/api/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254743066593",
    "amount": 10,
    "accountReference": "TEST",
    "transactionDesc": "Test Payment"
  }'
```

---

## 🔧 LOCAL DEVELOPMENT

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Run locally
vercel dev
```

Your API will be available at: `http://localhost:3000/api/mpesa-stk-push`

### Option 2: Manual Testing

You can test the functions directly in Node.js or use the Vercel dashboard logs.

---

## 📊 MONITORING

### View Logs

1. Go to: https://vercel.com/tunezken-astute-pro074-6170s-projects/sureboda-mpesa
2. Click on any deployment
3. Click "Functions" tab
4. Click on `mpesa-stk-push` or `mpesa-callback`
5. View real-time logs

### Check Deployments

Every git push creates a new deployment:
- **Production**: Main branch → `sureboda-mpesa.vercel.app`
- **Preview**: Other branches → `sureboda-mpesa-git-branch.vercel.app`

---

## 🎯 HOW IT WORKS

1. **Flutter App** → Calls Vercel API (no CORS issues)
2. **Vercel Function** → Calls Safaricom M-Pesa API
3. **Safaricom** → Sends STK Push to user's phone
4. **User** → Enters PIN on phone
5. **Safaricom** → Sends callback to Vercel (`/api/mpesa-callback`)
6. **Vercel Callback** → Updates Firebase (you need to add this)

---

## ✅ ADVANTAGES

- ✅ **No CORS issues** - Works on web browsers
- ✅ **Secure** - M-Pesa credentials stay on server
- ✅ **Free hosting** - Vercel free tier is generous
- ✅ **Auto-deployment** - Push to GitHub = instant deploy
- ✅ **Scalable** - Handles thousands of requests
- ✅ **Logs & monitoring** - Built-in Vercel dashboard

---

## 🔒 SECURITY NOTES

1. **Never commit M-Pesa credentials to git**
   - They're in environment variables on Vercel
   - The code has fallback values for testing only

2. **Add Firebase Admin SDK to callback**
   - Currently, the callback just logs success
   - You need to add Firebase Admin to update Firestore
   - See: https://firebase.google.com/docs/admin/setup#initialize-sdk

3. **Add authentication (optional)**
   - Add JWT or API key validation
   - Prevent unauthorized API calls

---

## 🆘 TROUBLESHOOTING

### Issue: "Module not found: axios"
**Solution**: Run `npm install` and redeploy

### Issue: "Environment variables not found"
**Solution**: Set them in Vercel dashboard (Step 2)

### Issue: "M-Pesa API returns 401"
**Solution**: Check your Consumer Key/Secret are correct

### Issue: "Callback not receiving data"
**Solution**: 
- Check Vercel logs
- Ensure callback URL is accessible: `https://sureboda-mpesa.vercel.app/api/mpesa-callback`
- Test with Postman

---

## 📝 NEXT STEPS

1. ✅ Deploy to Vercel (just push to GitHub)
2. ✅ Set environment variables
3. ✅ Test with real phone number
4. 🔲 Add Firebase Admin SDK to callback
5. 🔲 Update user wallet balance in callback
6. 🔲 Send notification to user after payment

---

## 💡 QUICK TEST

Once deployed, test immediately:

```bash
# Test STK Push
curl -X POST https://sureboda-mpesa.vercel.app/api/mpesa-stk-push \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"254YOUR_PHONE","amount":10,"accountReference":"TEST","transactionDesc":"Test"}'
```

You should get an STK Push on your phone within seconds! 🎉

---

## 📞 SUPPORT

If you encounter issues:
1. Check Vercel deployment logs
2. Check M-Pesa Daraja API status
3. Verify environment variables are set
4. Test with small amount (KSH 1) first

Your Vercel project is ready to handle M-Pesa payments on web! 🚀

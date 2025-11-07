# M-Pesa Integration Setup Guide

## 🚨 CURRENT ISSUE: CORS Error on Web

**Error**: `Failed to fetch, uri=https://api.safaricom.co.ke/oauth/v1/generate`

**Cause**: Web browsers block direct API calls to external services (CORS policy).

---

## ✅ SOLUTION OPTIONS

### **Option 1: Test on Mobile (EASIEST)**

M-Pesa works perfectly on Android/iOS. The CORS issue only affects web browsers.

**Steps:**
1. Connect an Android device or emulator
2. Run: `flutter run`
3. M-Pesa will work without any changes

---

### **Option 2: Firebase Cloud Functions (RECOMMENDED FOR WEB)**

Use Firebase as a proxy to call M-Pesa API from web.

#### **Step 1: Install Firebase CLI**
```bash
npm install -g firebase-tools
```

#### **Step 2: Initialize Functions**
```bash
cd C:\Users\HomePC\Desktop\sureboda-app
firebase login
firebase init functions
```

**Select:**
- Use existing project: `astute-empire`
- Language: JavaScript
- ESLint: Yes (optional)
- Install dependencies: Yes

#### **Step 3: Deploy Functions**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

This will deploy 3 functions:
1. `initiateStkPush` - Starts M-Pesa payment
2. `mpesaCallback` - Receives payment confirmation from Safaricom
3. `queryStkPushStatus` - Checks payment status

#### **Step 4: Update Flutter Code**

Add dependency to `pubspec.yaml`:
```yaml
dependencies:
  cloud_functions: ^4.5.0
```

Create new file `lib/services/mpesa_cloud_function_service.dart`:
```dart
import 'package:cloud_functions/cloud_functions.dart';

class MpesaCloudFunctionService {
  final FirebaseFunctions functions = FirebaseFunctions.instance;

  Future<Map<String, dynamic>> initiateSTKPush({
    required String phoneNumber,
    required double amount,
    required String accountReference,
    required String transactionDesc,
  }) async {
    try {
      final callable = functions.httpsCallable('initiateStkPush');
      final result = await callable.call({
        'phoneNumber': phoneNumber,
        'amount': amount,
        'accountReference': accountReference,
        'transactionDesc': transactionDesc,
      });

      return {
        'success': true,
        'message': result.data['message'],
        'checkoutRequestId': result.data['checkoutRequestId'],
        'customerMessage': result.data['customerMessage'],
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  Future<Map<String, dynamic>> queryPaymentStatus(String checkoutRequestId) async {
    try {
      final callable = functions.httpsCallable('queryStkPushStatus');
      final result = await callable.call({
        'checkoutRequestId': checkoutRequestId,
      });

      return {
        'success': true,
        'data': result.data,
      };
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}
```

#### **Step 5: Update Wallet Top-Up Screen**

Replace `MpesaService()` with `MpesaCloudFunctionService()` in your top-up screen.

---

### **Option 3: Custom Backend Server**

If you don't want to use Firebase Functions, you can create your own backend with:
- Node.js + Express
- Python + Flask
- PHP
- Any backend language

Host it on:
- Heroku
- Render
- Vercel
- AWS
- DigitalOcean

---

## 🔧 TEMPORARY WORKAROUND (FOR TESTING)

For now, I've updated `mpesa_service.dart` to detect web platform and show a user-friendly message.

**What users will see on web:**
> "M-Pesa cannot be used on web browsers due to CORS restrictions.
> 
> ✅ Please test on Android or iOS device.
> ✅ Or deploy Firebase Cloud Functions for web support."

**The app will work perfectly on mobile devices.**

---

## 📋 RECOMMENDED APPROACH

1. **For Development/Testing**: Use Android/iOS device
2. **For Production**: Deploy Firebase Cloud Functions
3. **For Web Support**: Must use backend proxy (Option 2 or 3)

---

## 🚀 QUICK START (Mobile Only)

```bash
# Connect Android device or start emulator
flutter devices

# Run on mobile
flutter run

# M-Pesa will work perfectly!
```

---

## 💡 WHY THIS HAPPENS

- **CORS (Cross-Origin Resource Sharing)** is a browser security feature
- Browsers block requests to external APIs to prevent malicious scripts
- Safaricom's M-Pesa API doesn't allow direct browser calls
- Mobile apps don't have this restriction
- Solution: Use a backend server (Firebase Functions) as a proxy

---

## 📞 SUPPORT

If you need help setting up Firebase Functions, let me know and I'll guide you through each step!

For now, **test on mobile** and M-Pesa will work perfectly! 🎉

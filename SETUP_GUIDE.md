# SUREBODA - Complete Setup Guide

This guide will walk you through setting up the SUREBODA delivery platform from scratch.

## Phase 1: Basic Setup ✅ (COMPLETED)

- [x] Flutter project created
- [x] Dependencies added
- [x] Project structure organized
- [x] Data models created
- [x] Core services implemented
- [x] Authentication screens designed
- [x] Theme and branding applied

## Phase 2: Firebase Configuration (NEXT STEPS)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it "SUREBODA"
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Configure FlutterFire

Open terminal and run:

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase
flutterfire configure
```

This will:
- Detect your Flutter platforms
- Create Firebase apps for Android, iOS, Windows, etc.
- Generate `lib/firebase_options.dart`
- Download config files automatically

### Step 3: Enable Firebase Services

In Firebase Console, enable these services:

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Click Save

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select your region (europe-west for Kenya proximity)
5. Click Enable

#### Firebase Storage
1. Go to **Storage**
2. Click **Get Started**
3. Use default security rules
4. Click Done

#### Cloud Messaging (Notifications)
1. Go to **Cloud Messaging**
2. Register your app
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

### Step 4: Update Main.dart

Uncomment Firebase initialization:

```dart
import 'firebase_options.dart';

await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

## Phase 3: Google Maps Setup

### Step 1: Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API
4. Go to **Credentials** > **Create Credentials** > **API Key**
5. Copy your API key

### Step 2: Configure Android

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        <!-- Add this inside <application> tag -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
    </application>
    
    <!-- Add these permissions -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
</manifest>
```

### Step 3: Configure iOS

Edit `ios/Runner/AppDelegate.swift`:

```swift
import UIKit
import Flutter
import GoogleMaps

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY_HERE")
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

Add to `ios/Runner/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to your location to show delivery addresses</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs access to your location for delivery tracking</string>
```

## Phase 4: M-Pesa Daraja API Setup

### Step 1: Register on Daraja

1. Go to [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an account
3. Log in to your account
4. Create an app (choose "Lipa Na M-Pesa Online")

### Step 2: Get Credentials

From your Daraja app, get:
- **Consumer Key**
- **Consumer Secret**
- **Business Short Code** (Test: 174379)
- **Passkey** (provided by Safaricom)

### Step 3: Update M-Pesa Service

Edit `lib/services/mpesa_service.dart`:

```dart
final String consumerKey = 'YOUR_CONSUMER_KEY';
final String consumerSecret = 'YOUR_CONSUMER_SECRET';
final String shortCode = '174379'; // Test shortcode
final String passKey = 'YOUR_PASSKEY';
final String callbackUrl = 'YOUR_CALLBACK_URL'; // Use ngrok for testing

bool isProduction = false; // Set to true when going live
```

### Step 4: Set Up Callback URL

For development, use [ngrok](https://ngrok.com/):

```bash
# Install ngrok
# Create a simple callback server or use Firebase Functions
ngrok http 3000
```

Use the ngrok URL as your callback URL.

**For Production**: Host your callback handler on:
- Firebase Cloud Functions
- Heroku
- AWS Lambda
- Your own server

## Phase 5: Testing

### Test on Emulator

```bash
# Start Android emulator
flutter run

# Or iOS simulator (Mac only)
flutter run -d ios
```

### Test on Physical Device

```bash
# Enable USB debugging on Android device
# Connect via USB
flutter devices
flutter run -d YOUR_DEVICE_ID
```

### Test M-Pesa (Sandbox)

Use these test credentials:
- **Phone Number**: 254708374149 (test number)
- **PIN**: Any 4-digit number

## Phase 6: Building Production Apps

### Android Release

```bash
# Generate keystore
keytool -genkey -v -keystore ~/sureboda-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias sureboda

# Create android/key.properties:
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=sureboda
storeFile=C:/Users/YourName/sureboda-keystore.jks
```

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

Build:
```bash
# APK (for direct install)
flutter build apk --release

# App Bundle (for Play Store)
flutter build appbundle --release
```

### Windows Desktop

```bash
flutter build windows --release
# Output: build/windows/x64/runner/Release/
```

### iOS Release (requires Mac + Xcode)

```bash
flutter build ios --release
# Then open in Xcode to archive
open ios/Runner.xcworkspace
```

## Phase 7: Deployment

### Google Play Store

1. Create Play Console account ($25 one-time)
2. Create app listing
3. Upload AAB file
4. Fill in store listing details
5. Submit for review

### Direct APK Distribution

Share the APK from `build/app/outputs/flutter-apk/app-release.apk`

Users need to:
1. Enable "Unknown Sources" in Android settings
2. Download APK
3. Install

### Windows Distribution

Options:
1. **Direct distribution**: Share the Release folder
2. **MSIX package**: Create Windows Store package
3. **Installer**: Use Inno Setup or NSIS

## Troubleshooting

### Issue: Firebase not initialized
**Solution**: Run `flutterfire configure` and uncomment Firebase.initializeApp()

### Issue: Google Maps shows blank
**Solution**: 
- Verify API key
- Enable billing in Google Cloud Console
- Enable required APIs

### Issue: M-Pesa STK Push fails
**Solution**:
- Check credentials
- Verify phone number format (254XXXXXXXXX)
- Ensure callback URL is accessible
- Check Daraja portal for errors

### Issue: Build fails on Windows
**Solution**: 
- Enable Developer Mode: `start ms-settings:developers`
- Run PowerShell as Administrator

## Important Notes

### Security
- Never commit API keys or credentials to Git
- Use environment variables or secure storage
- Implement proper backend API for M-Pesa
- Add Firebase Security Rules for production

### Firebase Security Rules

For Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /deliveries/{deliveryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.businessId == request.auth.uid || 
         resource.data.riderId == request.auth.uid);
    }
  }
}
```

### Production Checklist

- [ ] Change Firebase to production mode
- [ ] Set up proper M-Pesa production credentials
- [ ] Add app icons and splash screens
- [ ] Test on multiple devices
- [ ] Set up error logging (Sentry, Crashlytics)
- [ ] Add analytics
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Test payment flows thoroughly
- [ ] Set up customer support system

## Next Development Steps

1. **Implement Business Dashboard** - Full delivery request flow
2. **Implement Rider Dashboard** - Accept and complete deliveries
3. **Add Maps Integration** - Real-time location tracking
4. **Complete Payment Flow** - Full M-Pesa integration
5. **Add Notifications** - Real-time push notifications
6. **Implement Chat** - In-app messaging
7. **Add Admin Panel** - Manage users and deliveries
8. **Testing** - Unit tests, integration tests
9. **Performance** - Optimize for production
10. **Launch** - Deploy to stores!

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Safaricom Daraja API](https://developer.safaricom.co.ke/APIs)
- [Google Maps Platform](https://developers.google.com/maps)

## Support

For questions or issues, refer to the main README or create an issue in the repository.

---

Good luck with SUREBODA! 🚀

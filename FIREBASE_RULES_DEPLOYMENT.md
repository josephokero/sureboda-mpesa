# Firebase Security Rules Deployment Guide

## 📋 Overview

This guide explains how to deploy the Firestore and Storage security rules to your Firebase project.

## 🔐 Security Rules Included

### 1. Firestore Rules (`firestore.rules`)
Protects:
- ✅ User profiles and authentication
- ✅ Delivery requests and tracking
- ✅ Real-time chat messages
- ✅ Notifications
- ✅ Transactions and payments
- ✅ Withdrawals
- ✅ Reviews and ratings

### 2. Storage Rules (`storage.rules`)
Protects:
- ✅ Profile pictures
- ✅ Delivery photos
- ✅ Business documents
- ✅ Rider documents
- ✅ Chat media
- ✅ App assets

## 🚀 Deployment Methods

### Method 1: Firebase Console (Easiest)

#### Deploy Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **astute-empire**
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules`
5. Paste into the editor
6. Click **Publish**

#### Deploy Storage Rules:
1. In Firebase Console, navigate to **Storage** → **Rules** tab
2. Copy the contents of `storage.rules`
3. Paste into the editor
4. Click **Publish**

### Method 2: Firebase CLI (Recommended for Production)

#### Prerequisites:
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init
```

#### Deploy Rules:
```bash
# Deploy both Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules

# Or deploy separately
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

#### Verify Deployment:
```bash
# Check which project you're deploying to
firebase use

# Should show: astute-empire
```

### Method 3: CI/CD Automation (Advanced)

Add to your GitHub Actions or CI/CD pipeline:

```yaml
# .github/workflows/deploy-rules.yml
name: Deploy Firebase Rules

on:
  push:
    branches: [main]
    paths:
      - 'firestore.rules'
      - 'storage.rules'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only firestore:rules,storage:rules
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## 🧪 Testing Rules

### Test Firestore Rules:
```bash
# Install emulator
firebase emulators:start --only firestore

# Run tests (create tests first)
firebase emulators:exec --only firestore "npm test"
```

### Manual Testing Checklist:

#### As Business User:
- [ ] Can create delivery ✅
- [ ] Can view own deliveries ✅
- [ ] Can rate rider after delivery ✅
- [ ] Can send chat messages ✅
- [ ] Cannot edit other users' data ❌
- [ ] Cannot accept deliveries ❌

#### As Rider User:
- [ ] Can see pending deliveries ✅
- [ ] Can accept delivery ✅
- [ ] Can update delivery status ✅
- [ ] Can update location ✅
- [ ] Can complete delivery ✅
- [ ] Can rate business ✅
- [ ] Can send chat messages ✅
- [ ] Cannot edit other riders' deliveries ❌
- [ ] Cannot manually change balance ❌

#### As Unauthenticated:
- [ ] Cannot read any data ❌
- [ ] Cannot write any data ❌

## 🔒 Key Security Features

### 1. **Role-Based Access Control (RBAC)**
```javascript
function isBusiness() {
  return request.auth.uid != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'business';
}

function isRider() {
  return request.auth.uid != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'rider';
}
```

### 2. **Data Validation**
- Delivery fees must be > 0
- Users cannot change their own role
- Only system can update balance
- Only participants can access chat

### 3. **Privacy Protection**
- Users can only read their own documents
- Chat messages visible only to participants
- Notifications only visible to recipient
- Transactions only visible to owner

### 4. **File Upload Protection**
- Images limited to 5MB
- Documents limited to 10MB
- Only specific file types allowed
- Users can only upload to their own folders

## 📊 Rule Testing Examples

### Test 1: Business Create Delivery
```javascript
// Should ALLOW
{
  "auth": {"uid": "business123"},
  "request": {
    "resource": {
      "data": {
        "businessId": "business123",
        "status": "pending",
        "deliveryFee": 100,
        "isPaid": true
      }
    }
  }
}
```

### Test 2: Rider Accept Delivery
```javascript
// Should ALLOW
{
  "auth": {"uid": "rider456"},
  "request": {
    "resource": {
      "data": {
        "riderId": "rider456",
        "status": "accepted"
      }
    }
  },
  "resource": {
    "data": {
      "status": "pending"
    }
  }
}
```

### Test 3: Unauthorized Access
```javascript
// Should DENY
{
  "auth": null,
  "request": {
    "path": "/databases/(default)/documents/deliveries/delivery123"
  }
}
```

## 🚨 Important Security Notes

### 1. **Balance Protection**
Rider balance can ONLY be updated:
- By the system (delivery completion)
- By admin
- NOT by rider themselves

### 2. **Chat Security**
- Only delivery participants can read/write
- Messages are scoped to delivery
- Cannot access other deliveries' chats

### 3. **Location Privacy**
- Real-time location only visible during active delivery
- Historical location not stored permanently
- Business can see rider location only for their delivery

### 4. **Rating Integrity**
- Can only rate after delivery completion
- One rating per delivery per user
- Cannot change role to bypass rating limits

## 📝 Rule Maintenance

### When to Update Rules:

1. **New Feature Added**
   - Add corresponding rules
   - Test thoroughly
   - Deploy to staging first

2. **Security Issue Found**
   - Patch immediately
   - Test all affected features
   - Deploy urgently

3. **Data Structure Changed**
   - Update validation rules
   - Update helper functions
   - Test existing features

### Version Control:
```bash
# Always commit rule changes
git add firestore.rules storage.rules
git commit -m "Update security rules: [description]"
git push
```

## 🛠️ Troubleshooting

### Issue: "Permission Denied"
**Solution:**
1. Check user is authenticated
2. Verify user role in Firestore
3. Test rule in Firebase Console simulator
4. Check if rule was deployed

### Issue: "Rules took too long"
**Solution:**
1. Simplify complex `get()` calls
2. Cache user role in custom claims
3. Optimize helper functions

### Issue: "Missing required fields"
**Solution:**
1. Ensure all required fields are sent
2. Check data validation rules
3. Verify field types match schema

## 📚 Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Guide](https://firebase.google.com/docs/storage/security/start)
- [Rules Playground](https://firebase.google.com/docs/rules/simulator)

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Rules tested in emulator
- [ ] All user roles tested manually
- [ ] Unauthorized access blocked
- [ ] File upload limits working
- [ ] Chat privacy verified
- [ ] Balance protection working
- [ ] Rating system secure
- [ ] Location privacy ensured
- [ ] Backup of old rules saved
- [ ] Team notified of changes
- [ ] Documentation updated

## 🎯 Next Steps

After deployment:
1. ✅ Monitor Firebase Console for errors
2. ✅ Test all features in production
3. ✅ Set up alerts for rule violations
4. ✅ Review rules monthly
5. ✅ Keep rules synced with app features

---

**Project:** SUREBODA Delivery App  
**Firebase Project:** astute-empire  
**Last Updated:** November 7, 2025  
**Status:** ✅ Production Ready

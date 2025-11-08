# Abort Delivery - Testing Guide

## Quick Test Checklist

### Prerequisites
- [ ] Firebase emulator running OR
- [ ] Connected to Firebase production
- [ ] Business account with wallet balance
- [ ] Rider account logged in

### Test Scenario 1: Abort Before Pickup (Accepted Status)

1. **Setup:**
   - Business creates a delivery
   - Rider accepts the delivery
   - Rider is on Active Delivery screen

2. **Expected State:**
   - Status bar shows "Accepted - Go to Pickup" (Blue)
   - "START TRIP" button visible (Green)
   - "ABORT DELIVERY" button visible (Red, outlined)

3. **Test Steps:**
   ```
   ✓ Click "ABORT DELIVERY"
   ✓ Verify reason selection dialog appears
   ✓ Select "Vehicle breakdown"
   ✓ Verify confirmation dialog appears
   ✓ Check warning: "You will not receive payment"
   ✓ Click "Yes, Abort"
   ✓ Verify success toast appears
   ✓ Verify navigation back to home screen
   ```

4. **Verify in Database:**
   ```javascript
   // In Firestore deliveries collection
   {
     status: 'cancelled',
     cancelReason: 'Vehicle breakdown',
     paymentStatus: 'cancelled',
     cancelledAt: Timestamp
   }
   ```

5. **Verify Business Side:**
   - [ ] Notification received
   - [ ] Message: "Rider cancelled your delivery. Reason: Vehicle breakdown. Your payment has been refunded."
   - [ ] `pendingBalance` reduced
   - [ ] `walletBalance` unchanged

6. **Verify Rider Side:**
   - [ ] No payment added to wallet
   - [ ] Delivery removed from active list
   - [ ] Shows in history as "Cancelled"

### Test Scenario 2: Abort After Pickup (Picked Up Status)

1. **Setup:**
   - Business creates a delivery
   - Rider accepts the delivery
   - Rider clicks "START TRIP"
   - Status changes to "pickedUp"

2. **Expected State:**
   - Status bar shows "In Transit - Delivering" (Orange)
   - "COMPLETE DELIVERY" button visible (Yellow)
   - "ABORT DELIVERY" button visible (Red, outlined)

3. **Test Steps:**
   ```
   ✓ Click "ABORT DELIVERY"
   ✓ Select "Emergency" reason
   ✓ Confirm abort
   ✓ Verify location tracking stops
   ✓ Verify navigation back
   ```

4. **Verify Payment Flow:**
   - Business: `pendingBalance` released ✓
   - Business: `walletBalance` unchanged ✓
   - Rider: No payment added ✓

### Test Scenario 3: Custom Reason ("Other")

1. **Test Steps:**
   ```
   ✓ Click "ABORT DELIVERY"
   ✓ Select "Other"
   ✓ Text input dialog appears
   ✓ Enter: "Customer not available"
   ✓ Click "Submit"
   ✓ Verify confirmation shows custom reason
   ✓ Complete abort
   ```

2. **Verify:**
   - [ ] Custom reason saved in `cancelReason`
   - [ ] Notification includes custom reason

### Test Scenario 4: Cancel Abort (User Changes Mind)

1. **Test Steps:**
   ```
   ✓ Click "ABORT DELIVERY"
   ✓ Select any reason
   ✓ Click "No, Go Back" in confirmation
   ✓ Verify still on Active Delivery screen
   ✓ Verify delivery status unchanged
   ```

### Test Scenario 5: Multiple Abort Reasons

Test each reason option:

| Reason             | Icon | Expected Behavior |
|--------------------|------|-------------------|
| Vehicle breakdown  | 🔧   | Direct confirm    |
| Emergency          | 🚨   | Direct confirm    |
| Wrong package      | 📦   | Direct confirm    |
| Safety concerns    | ⚠️   | Direct confirm    |
| Other              | ➕   | Text input first  |

### Edge Cases to Test

#### 1. Network Interruption
```
✓ Start abort process
✓ Disable network
✓ Click confirm
✓ Verify error message appears
✓ Enable network
✓ Retry
✓ Verify success
```

#### 2. Rapid Button Clicks
```
✓ Click "ABORT DELIVERY" multiple times rapidly
✓ Verify only one dialog appears
✓ Verify no duplicate API calls
```

#### 3. App Background/Foreground
```
✓ Start abort process
✓ Put app in background
✓ Return to app
✓ Verify dialog state preserved
```

#### 4. Delivery Completed by Business
```
✓ Rider clicks "ABORT DELIVERY"
✓ Business marks as completed simultaneously
✓ Verify proper error handling
```

## Database Verification Queries

### Check Delivery Status:
```javascript
// Firebase Console > Firestore
deliveries/{deliveryId}
Expected:
{
  status: "cancelled",
  cancelReason: "Vehicle breakdown",
  paymentStatus: "cancelled",
  cancelledAt: Timestamp
}
```

### Check Business Balance:
```javascript
// Firebase Console > Firestore
users/{businessId}
Before: { walletBalance: 100, pendingBalance: 50 }
After:  { walletBalance: 100, pendingBalance: 40 } // If fee was 10
```

### Check Transaction:
```javascript
// Firebase Console > Firestore
transactions (where deliveryId == {id})
Expected:
{
  status: "refunded",
  type: "cancelled_payment",
  amount: 10
}
```

### Check Notification:
```javascript
// Firebase Console > Firestore
notifications (where userId == {businessId})
Expected:
{
  type: "delivery_cancelled",
  riderName: "John Doe",
  cancelReason: "Vehicle breakdown",
  message: "John Doe cancelled your delivery. Reason: Vehicle breakdown. Your payment has been refunded.",
  isRead: false
}
```

## Cloud Function Logs

### Check Function Execution:
```bash
firebase functions:log --only onDeliveryStatusChange
```

### Expected Log Output:
```
2025-11-08 10:30:00 Function execution started
2025-11-08 10:30:01 Payment cancelled for delivery abc123, pending balance released to business, rider not paid
2025-11-08 10:30:02 Function execution took 2000 ms, finished with status: 'ok'
```

## Performance Metrics

| Action                    | Expected Time |
|---------------------------|---------------|
| Button click to dialog    | < 100ms       |
| Reason selection          | Instant       |
| Abort API call            | < 2s          |
| Cloud Function execution  | < 3s          |
| Notification delivery     | < 5s          |
| Total flow                | < 10s         |

## Common Issues & Solutions

### Issue 1: Button Not Appearing
**Cause:** Wrong delivery status  
**Solution:** Verify `delivery.status` is 'accepted' or 'pickedUp'

### Issue 2: No Notification Received
**Cause:** Notification creation failed  
**Solution:** Check Cloud Function logs, verify Firestore rules

### Issue 3: Money Not Refunded
**Cause:** Cloud Function not triggered  
**Solution:** Redeploy function, check Firebase console

### Issue 4: "Permission Denied" Error
**Cause:** Firestore security rules  
**Solution:** Update rules to allow status update to 'cancelled'

## Success Criteria

✅ **UI:**
- Button appears correctly
- Colors are red
- Dialogs are clear
- Icons display properly

✅ **Functionality:**
- Abort completes without errors
- All reasons work
- Custom text input works
- Cancel works

✅ **Business Logic:**
- Rider doesn't get paid
- Business gets refund
- Notification sent
- Status updated

✅ **Performance:**
- No lag or freezing
- Smooth animations
- Fast API responses

## Deployment Verification

### After deploying to production:

1. **Test with real accounts**
2. **Monitor Cloud Function logs**
3. **Check error rates**
4. **Verify notification delivery**
5. **Confirm payment flow**

### Rollback Plan:
If issues occur:
```bash
# Rollback Cloud Function
firebase functions:rollback onDeliveryStatusChange

# Remove button from UI (hotfix)
# Comment out abort button code temporarily
```

## User Feedback Collection

After release, monitor:
- [ ] How often abort is used
- [ ] Most common reasons
- [ ] User complaints about payment
- [ ] Business satisfaction with refunds

## Documentation for Users

### Rider Guide:
```
How to Cancel a Delivery:

1. Open your active delivery
2. Click the red "ABORT DELIVERY" button
3. Select why you're canceling
4. Confirm your decision

Note: You will not receive payment for cancelled deliveries.
```

### Business Guide:
```
What happens when a delivery is cancelled:

1. You receive an immediate notification
2. Your money is automatically refunded
3. The reason for cancellation is included
4. You can create a new delivery request
```

---

**Testing Completed:** [ ]  
**Approved By:** ___________  
**Date:** ___________

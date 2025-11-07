# Payment Status Implementation Guide

## Overview
This document explains the pending payment system where money is not deducted until delivery completion.

## Payment Flow

### 1. Delivery Creation (Pending Payment - RED)
**Status:** `pending`  
**Payment Status:** `pending`  
**Action:**
- Amount added to `users.pendingAmount` (not deducted from balance yet)
- Balance shows: `KSH 100.00` with `(KSH 10.00)` in **RED** beside it
- Transaction created with type: `pending_payment`

### 2. Rider Accepts & Picks Up (In Transit - ORANGE)
**Status:** `pickedUp`  
**Payment Status:** `in_transit`  
**Action:**
- Pending amount turns **LIGHT ORANGE**
- Still not deducted from main balance
- Money is "locked" but visible

### 3. Delivery Completed (Completed - Deducted)
**Status:** `delivered`  
**Payment Status:** `completed`  
**Action:**
- Deduct from business walletBalance: `walletBalance - deliveryFee`
- Remove from pendingAmount: `pendingAmount - deliveryFee`
- Add to rider walletBalance: `riderBalance + deliveryFee`
- Update transaction status to `completed`

## Database Fields

### Users Collection
```javascript
{
  walletBalance: 100.00,      // Available balance
  pendingAmount: 10.00,       // Amount locked for pending deliveries
  // Available to spend = walletBalance - pendingAmount
}
```

### Deliveries Collection
```javascript
{
  deliveryFee: 10.00,
  status: 'pending' | 'accepted' | 'pickedUp' | 'delivered' | 'cancelled',
  paymentStatus: 'pending' | 'in_transit' | 'completed' | 'refunded',
  businessId: 'xxx',
  riderId: 'yyy'
}
```

### Transactions Collection
```javascript
{
  type: 'pending_payment' | 'delivery_payment' | 'refund',
  status: 'pending' | 'completed' | 'failed',
  amount: 10.00,
  deliveryId: 'xxx',
  userId: 'yyy'
}
```

## Cloud Function (Recommended)

Create a Firebase Cloud Function that triggers on delivery status changes:

```javascript
// functions/index.js
exports.handleDeliveryPayment = functions.firestore
  .document('deliveries/{deliveryId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // When status changes to pickedUp
    if (newData.status === 'pickedUp' && oldData.status !== 'pickedUp') {
      await change.after.ref.update({
        paymentStatus: 'in_transit'
      });
    }
    
    // When status changes to delivered
    if (newData.status === 'delivered' && oldData.status !== 'delivered') {
      const batch = admin.firestore().batch();
      
      // 1. Update payment status
      batch.update(change.after.ref, {
        paymentStatus: 'completed',
        isPaid: true
      });
      
      // 2. Deduct from business
      const businessRef = admin.firestore().collection('users').doc(newData.businessId);
      batch.update(businessRef, {
        walletBalance: admin.firestore.FieldValue.increment(-newData.deliveryFee),
        pendingAmount: admin.firestore.FieldValue.increment(-newData.deliveryFee)
      });
      
      // 3. Add to rider
      const riderRef = admin.firestore().collection('users').doc(newData.riderId);
      batch.update(riderRef, {
        walletBalance: admin.firestore.FieldValue.increment(newData.deliveryFee)
      });
      
      // 4. Update transaction
      const transactionQuery = await admin.firestore()
        .collection('transactions')
        .where('deliveryId', '==', context.params.deliveryId)
        .where('type', '==', 'pending_payment')
        .get();
      
      transactionQuery.forEach(doc => {
        batch.update(doc.ref, {
          type: 'delivery_payment',
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
    }
  });
```

## UI Changes Needed

### Wallet Balance Display
```dart
StreamBuilder<DocumentSnapshot>(
  stream: FirebaseFirestore.instance.collection('users').doc(userId).snapshots(),
  builder: (context, snapshot) {
    final data = snapshot.data?.data() as Map<String, dynamic>?;
    final balance = data?['walletBalance'] ?? 0.0;
    final pending = data?['pendingAmount'] ?? 0.0;
    
    return Column(
      children: [
        Text('KSH ${balance.toStringAsFixed(2)}'),
        if (pending > 0)
          Text(
            '(KSH ${pending.toStringAsFixed(2)})',
            style: TextStyle(
              color: Colors.red, // or orange if in_transit
              fontSize: 12,
            ),
          ),
      ],
    );
  },
)
```

## Files Modified

1. ✅ `lib/models/delivery_model.dart` - Added `paymentStatus` field
2. ✅ `lib/models/location_data.dart` - Added `details` field  
3. ✅ `lib/screens/business/create_delivery_steps_screen.dart` - Changed to pending payment
4. ⏳ `lib/widgets/wallet_balance_widget.dart` - Need to show pending amount
5. ⏳ `functions/index.js` - Need to create Cloud Function
6. ⏳ Update Firestore rules to allow Cloud Function writes

## Next Steps

1. Deploy Cloud Function to handle automatic payment status updates
2. Update wallet balance UI to show pending amounts (red/orange)
3. Add payment status indicators in delivery cards
4. Test full flow: Create → Accept → Pickup → Deliver
5. Handle cancellation refunds (if needed)

## Color Coding

- **RED** = Pending payment (money locked, not yet deducted)
- **LIGHT ORANGE** = In transit (rider picked up, payment processing)
- **GREEN** = Completed (money transferred to rider)


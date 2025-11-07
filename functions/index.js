const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.addDailyCharges = functions.pubsub.schedule("every day 01:00").onRun(async (context) => {
  const today = new Date();
  // Do not run on Sundays (Sunday is day 0)
  if (today.getDay() === 0) {
    console.log("Skipping daily charges on Sunday.");
    return null;
  }

  const usersSnapshot = await db.collection("users").get();
  if (usersSnapshot.empty) {
    console.log("No users found.");
    return null;
  }

  const batch = db.batch();
  const todayStr = today.toISOString().split("T")[0];

  usersSnapshot.forEach((userDoc) => {
    const transactionsColRef = db.collection("users").doc(userDoc.id).collection("transactions");
    
    const chargeDoc = {
      amount: 820,
      type: "charge",
      date: admin.firestore.FieldValue.serverTimestamp(),
      description: `Daily fee for ${todayStr}`,
    };

    batch.set(transactionsColRef.doc(), chargeDoc);
  });

  try {
    await batch.commit();
    console.log(`Successfully added daily charges for ${usersSnapshot.size} users.`);
  } catch (error) {
    console.error("Failed to add daily charges:", error);
  }

  return null;
});

/**
 * Handle payment status changes based on delivery status
 * - pending -> accepted: payment stays pending
 * - accepted -> pickedUp: payment becomes 'in_transit' (orange), money still pending
 * - pickedUp -> delivered: payment becomes 'completed', deduct from pendingBalance and wallet, add to rider
 */
exports.onDeliveryStatusChange = functions.firestore
  .document('deliveries/{deliveryId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const deliveryId = context.params.deliveryId;

    // Check if status changed
    if (before.status === after.status) {
      return null;
    }

    const newStatus = after.status;
    const businessId = after.businessId;
    const riderId = after.riderId;
    const deliveryFee = after.deliveryFee;

    try {
      // Status: accepted -> Mark payment as pending (already is)
      if (newStatus === 'accepted') {
        await change.after.ref.update({
          paymentStatus: 'pending',
        });
      }

      // Status: pickedUp -> Mark payment as in_transit (show orange)
      if (newStatus === 'pickedUp') {
        await change.after.ref.update({
          paymentStatus: 'in_transit',
        });
      }

      // Status: delivered -> Complete payment
      if (newStatus === 'delivered') {
        // Start a batch write for atomic operations
        const batch = db.batch();

        // 1. Update delivery payment status
        batch.update(change.after.ref, {
          paymentStatus: 'completed',
          isPaid: true,
        });

        // 2. Deduct from business pending balance and wallet balance
        const businessRef = db.collection('users').doc(businessId);
        batch.update(businessRef, {
          pendingBalance: admin.firestore.FieldValue.increment(-deliveryFee),
          walletBalance: admin.firestore.FieldValue.increment(-deliveryFee),
        });

        // 3. Add to rider wallet balance
        if (riderId) {
          const riderRef = db.collection('users').doc(riderId);
          batch.update(riderRef, {
            walletBalance: admin.firestore.FieldValue.increment(deliveryFee),
          });

          // 4. Create transaction record for rider
          const riderTransactionRef = db.collection('transactions').doc();
          batch.set(riderTransactionRef, {
            userId: riderId,
            type: 'delivery_payment',
            amount: deliveryFee,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            deliveryId: deliveryId,
            description: `Delivery Payment - ${after.recipientName}`,
            status: 'completed',
          });
        }

        // 5. Update business transaction status
        const transactionsSnapshot = await db
          .collection('transactions')
          .where('deliveryId', '==', deliveryId)
          .where('userId', '==', businessId)
          .where('type', '==', 'pending_payment')
          .get();

        transactionsSnapshot.forEach((doc) => {
          batch.update(doc.ref, {
            status: 'completed',
            type: 'delivery_payment',
          });
        });

        // Commit all changes atomically
        await batch.commit();

        console.log(`Payment completed for delivery ${deliveryId}`);
      }

      // Status: cancelled -> Release pending balance
      if (newStatus === 'cancelled') {
        // Start a batch write
        const batch = db.batch();

        // 1. Update delivery payment status
        batch.update(change.after.ref, {
          paymentStatus: 'cancelled',
        });

        // 2. Release pending balance
        const businessRef = db.collection('users').doc(businessId);
        batch.update(businessRef, {
          pendingBalance: admin.firestore.FieldValue.increment(-deliveryFee),
        });

        // 3. Update transaction status
        const transactionsSnapshot = await db
          .collection('transactions')
          .where('deliveryId', '==', deliveryId)
          .where('userId', '==', businessId)
          .where('type', '==', 'pending_payment')
          .get();

        transactionsSnapshot.forEach((doc) => {
          batch.update(doc.ref, {
            status: 'cancelled',
          });
        });

        await batch.commit();

        console.log(`Payment cancelled for delivery ${deliveryId}, pending balance released`);
      }

      return null;
    } catch (error) {
      console.error('Error handling payment status change:', error);
      return null;
    }
  });

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

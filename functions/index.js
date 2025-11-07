const functions = require("firebase-functions");
const admin = require("firebase-admin");
const https = require("https");

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

/**
 * Get route between two points using OSRM (Open Source Routing Machine)
 * This function acts as a proxy to bypass CORS issues on web
 * OSRM is free and doesn't require API keys
 */
exports.getRoute = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    console.log('Route request:', { startLat, startLng, endLat, endLng });

    if (!startLat || !startLng || !endLat || !endLng) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    // Use OSRM public server - format: /route/v1/driving/lon,lat;lon,lat
    const apiUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    
    console.log('Calling OSRM:', apiUrl);

    // Make request to OSRM
    https.get(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Sureboda-App/1.0'
      },
    }, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          console.log('OSRM response status:', apiRes.statusCode);
          
          const routeData = JSON.parse(data);
          
          if (routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
            const coordinates = routeData.routes[0].geometry.coordinates;
            console.log('Route found with', coordinates.length, 'points');
            
            // Convert to GeoJSON format that matches OpenRouteService
            const geoJson = {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates
                },
                properties: {
                  distance: routeData.routes[0].distance,
                  duration: routeData.routes[0].duration
                }
              }]
            };
            
            res.status(200).json(geoJson);
          } else {
            console.error('No route found:', routeData);
            res.status(404).json({ error: 'No route found', details: routeData });
          }
        } catch (error) {
          console.error('Error parsing route data:', error);
          console.error('Raw data:', data);
          res.status(500).json({ error: 'Failed to parse route data', raw: data.substring(0, 500) });
        }
      });
    }).on('error', (error) => {
      console.error('Error fetching route from OSRM:', error);
      res.status(500).json({ error: 'Failed to fetch route', details: error.message });
    });

  } catch (error) {
    console.error('Error in getRoute function:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

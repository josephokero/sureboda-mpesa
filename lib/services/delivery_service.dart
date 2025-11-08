import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/delivery_model.dart';
import '../models/user_model.dart';

class DeliveryService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  // Create new delivery request
  static Future<String> createDelivery(DeliveryModel delivery) async {
    try {
      DocumentReference docRef = await _firestore.collection('deliveries').add(delivery.toMap());
      
      // Notify all online riders
      await _notifyOnlineRiders(docRef.id, delivery);
      
      return docRef.id;
    } catch (e) {
      throw Exception('Failed to create delivery: $e');
    }
  }

  // Notify all online riders about new delivery
  static Future<void> _notifyOnlineRiders(String deliveryId, DeliveryModel delivery) async {
    try {
      // Get all online riders
      QuerySnapshot ridersSnapshot = await _firestore
          .collection('users')
          .where('role', isEqualTo: 'rider')
          .where('isOnline', isEqualTo: true)
          .get();

      // Create notification for each online rider
      for (var riderDoc in ridersSnapshot.docs) {
        await _firestore.collection('notifications').add({
          'type': 'new_delivery',
          'deliveryId': deliveryId,
          'riderId': riderDoc.id,
          'businessId': delivery.businessId,
          'businessName': delivery.businessName,
          'pickupAddress': delivery.pickupLocation.address,
          'deliveryAddress': delivery.deliveryLocation.address,
          'deliveryFee': delivery.deliveryFee,
          'createdAt': FieldValue.serverTimestamp(),
          'isRead': false,
        });
      }
    } catch (e) {
      print('Error notifying riders: $e');
    }
  }

  // Rider accepts delivery
  static Future<void> acceptDelivery(String deliveryId, String riderId, String riderName) async {
    try {
      await _firestore.collection('deliveries').doc(deliveryId).update({
        'riderId': riderId,
        'riderName': riderName,
        'status': 'accepted',
        'acceptedAt': FieldValue.serverTimestamp(),
      });

      // Mark notification as read
      QuerySnapshot notifications = await _firestore
          .collection('notifications')
          .where('deliveryId', isEqualTo: deliveryId)
          .where('riderId', isEqualTo: riderId)
          .get();

      for (var notif in notifications.docs) {
        await notif.reference.update({'isRead': true});
      }

      // Notify business that rider accepted
      var deliveryDoc = await _firestore.collection('deliveries').doc(deliveryId).get();
      var delivery = DeliveryModel.fromFirestore(deliveryDoc);

      await _firestore.collection('notifications').add({
        'type': 'delivery_accepted',
        'deliveryId': deliveryId,
        'userId': delivery.businessId,
        'riderName': riderName,
        'message': '$riderName accepted your delivery request',
        'createdAt': FieldValue.serverTimestamp(),
        'isRead': false,
      });
    } catch (e) {
      throw Exception('Failed to accept delivery: $e');
    }
  }

  // Rider rejects delivery
  static Future<void> rejectDelivery(String deliveryId, String riderId) async {
    try {
      // Just mark notification as read
      QuerySnapshot notifications = await _firestore
          .collection('notifications')
          .where('deliveryId', isEqualTo: deliveryId)
          .where('riderId', isEqualTo: riderId)
          .get();

      for (var notif in notifications.docs) {
        await notif.reference.update({'isRead': true});
      }
    } catch (e) {
      throw Exception('Failed to reject delivery: $e');
    }
  }

  // Rider starts trip (picked up package)
  static Future<void> startTrip(String deliveryId) async {
    try {
      await _firestore.collection('deliveries').doc(deliveryId).update({
        'status': 'pickedUp',
        'pickedUpAt': FieldValue.serverTimestamp(),
      });

      // Notify business
      var deliveryDoc = await _firestore.collection('deliveries').doc(deliveryId).get();
      var delivery = DeliveryModel.fromFirestore(deliveryDoc);

      await _firestore.collection('notifications').add({
        'type': 'delivery_picked_up',
        'deliveryId': deliveryId,
        'userId': delivery.businessId,
        'riderName': delivery.riderName,
        'message': '${delivery.riderName} picked up your package',
        'createdAt': FieldValue.serverTimestamp(),
        'isRead': false,
      });
    } catch (e) {
      throw Exception('Failed to start trip: $e');
    }
  }

  // Rider completes delivery
  static Future<void> completeDelivery(String deliveryId) async {
    try {
      var deliveryDoc = await _firestore.collection('deliveries').doc(deliveryId).get();
      var delivery = DeliveryModel.fromFirestore(deliveryDoc);

      await _firestore.collection('deliveries').doc(deliveryId).update({
        'status': 'delivered',
        'deliveredAt': FieldValue.serverTimestamp(),
      });

      // Calculate 20% commission
      double commission = delivery.deliveryFee * 0.20;

      // Add commission to rider's debt (rider owes platform 20%)
      await _firestore.collection('users').doc(delivery.riderId).update({
        'commissionDebt': FieldValue.increment(commission),
      });

      // Update rider's stats
      await _firestore.collection('users').doc(delivery.riderId).update({
        'completedDeliveries': FieldValue.increment(1),
      });

      // Notify business
      await _firestore.collection('notifications').add({
        'type': 'delivery_completed',
        'deliveryId': deliveryId,
        'userId': delivery.businessId,
        'riderName': delivery.riderName,
        'message': '${delivery.riderName} completed your delivery',
        'createdAt': FieldValue.serverTimestamp(),
        'isRead': false,
      });
    } catch (e) {
      throw Exception('Failed to complete delivery: $e');
    }
  }

  // Rider aborts delivery
  static Future<void> abortDelivery(String deliveryId, String reason) async {
    try {
      var deliveryDoc = await _firestore.collection('deliveries').doc(deliveryId).get();
      var delivery = DeliveryModel.fromFirestore(deliveryDoc);

      // Update delivery status to cancelled with reason
      await _firestore.collection('deliveries').doc(deliveryId).update({
        'status': 'cancelled',
        'cancelReason': reason,
        'cancelledAt': FieldValue.serverTimestamp(),
        'paymentStatus': 'cancelled',
      });

      // Note: Money return is handled by Cloud Function
      // The Cloud Function will:
      // 1. Release pendingBalance back to business
      // 2. NOT add money to rider wallet
      // 3. Update transaction status to 'refunded'

      // Notify business about cancellation
      await _firestore.collection('notifications').add({
        'type': 'delivery_cancelled',
        'deliveryId': deliveryId,
        'userId': delivery.businessId,
        'riderName': delivery.riderName,
        'cancelReason': reason,
        'message': '${delivery.riderName} cancelled your delivery. Reason: $reason. Your payment has been refunded.',
        'createdAt': FieldValue.serverTimestamp(),
        'isRead': false,
      });
    } catch (e) {
      throw Exception('Failed to abort delivery: $e');
    }
  }

  // Update rider location in real-time
  static Future<void> updateRiderLocation(String deliveryId, double lat, double lng) async {
    try {
      await _firestore.collection('deliveries').doc(deliveryId).update({
        'riderCurrentLocation': {
          'latitude': lat,
          'longitude': lng,
          'timestamp': FieldValue.serverTimestamp(),
        },
      });
    } catch (e) {
      print('Error updating location: $e');
    }
  }

  // Business rates rider
  static Future<void> rateRider(String deliveryId, double rating, String review) async {
    try {
      var deliveryDoc = await _firestore.collection('deliveries').doc(deliveryId).get();
      var delivery = DeliveryModel.fromFirestore(deliveryDoc);

      await _firestore.collection('deliveries').doc(deliveryId).update({
        'businessRating': rating,
        'businessReview': review,
      });

      // Update rider's average rating
      await _updateRiderRating(delivery.riderId!, rating);
    } catch (e) {
      throw Exception('Failed to rate rider: $e');
    }
  }

  // Rider rates business
  static Future<void> rateBusiness(String deliveryId, double rating, String review) async {
    try {
      var deliveryDoc = await _firestore.collection('deliveries').doc(deliveryId).get();
      var delivery = DeliveryModel.fromFirestore(deliveryDoc);

      await _firestore.collection('deliveries').doc(deliveryId).update({
        'riderRating': rating,
        'riderReview': review,
      });

      // Update business's average rating
      await _updateBusinessRating(delivery.businessId, rating);
    } catch (e) {
      throw Exception('Failed to rate business: $e');
    }
  }

  static Future<void> _updateRiderRating(String riderId, double newRating) async {
    try {
      var riderDoc = await _firestore.collection('users').doc(riderId).get();
      var rider = UserModel.fromFirestore(riderDoc);

      double currentRating = rider.rating ?? 0.0;
      int totalRatings = rider.totalRatings ?? 0;

      double updatedRating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);

      await _firestore.collection('users').doc(riderId).update({
        'rating': updatedRating,
        'totalRatings': FieldValue.increment(1),
      });
    } catch (e) {
      print('Error updating rider rating: $e');
    }
  }

  static Future<void> _updateBusinessRating(String businessId, double newRating) async {
    try {
      var businessDoc = await _firestore.collection('users').doc(businessId).get();
      var business = UserModel.fromFirestore(businessDoc);

      double currentRating = business.rating ?? 0.0;
      int totalRatings = business.totalRatings ?? 0;

      double updatedRating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);

      await _firestore.collection('users').doc(businessId).update({
        'rating': updatedRating,
        'totalRatings': FieldValue.increment(1),
      });
    } catch (e) {
      print('Error updating business rating: $e');
    }
  }

  // Get delivery updates stream (for real-time updates)
  static Stream<DeliveryModel> getDeliveryStream(String deliveryId) {
    return _firestore
        .collection('deliveries')
        .doc(deliveryId)
        .snapshots()
        .map((doc) => DeliveryModel.fromFirestore(doc));
  }

  // Get pending deliveries for riders
  static Stream<List<DeliveryModel>> getPendingDeliveriesStream() {
    return _firestore
        .collection('deliveries')
        .where('status', isEqualTo: 'pending')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => DeliveryModel.fromFirestore(doc))
            .toList());
  }

  // Get rider's active deliveries
  static Stream<List<DeliveryModel>> getRiderActiveDeliveriesStream(String riderId) {
    return _firestore
        .collection('deliveries')
        .where('riderId', isEqualTo: riderId)
        .where('status', whereIn: ['accepted', 'pickedUp', 'inTransit'])
        .orderBy('acceptedAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => DeliveryModel.fromFirestore(doc))
            .toList());
  }

  // Get business's active deliveries
  static Stream<List<DeliveryModel>> getBusinessActiveDeliveriesStream(String businessId) {
    return _firestore
        .collection('deliveries')
        .where('businessId', isEqualTo: businessId)
        .where('status', whereIn: ['pending', 'accepted', 'pickedUp', 'inTransit'])
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => DeliveryModel.fromFirestore(doc))
            .toList());
  }

  // Get notifications for user
  static Stream<List<Map<String, dynamic>>> getNotificationsStream(String userId) {
    return _firestore
        .collection('notifications')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .limit(50)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => {'id': doc.id, ...doc.data() as Map<String, dynamic>})
            .toList());
  }

  // Get notifications for rider (for new delivery notifications)
  static Stream<List<Map<String, dynamic>>> getRiderNotificationsStream(String riderId) {
    return _firestore
        .collection('notifications')
        .where('riderId', isEqualTo: riderId)
        .where('type', isEqualTo: 'new_delivery')
        .where('isRead', isEqualTo: false)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => {'id': doc.id, ...doc.data() as Map<String, dynamic>})
            .toList());
  }
}

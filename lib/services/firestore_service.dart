import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/delivery_model.dart';
import '../models/transaction_model.dart';

class FirestoreService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Create delivery request
  Future<String> createDelivery(DeliveryModel delivery) async {
    try {
      DocumentReference docRef = await _firestore
          .collection('deliveries')
          .add(delivery.toMap());
      return docRef.id;
    } catch (e) {
      print('Error creating delivery: $e');
      rethrow;
    }
  }

  // Get available deliveries for riders (pending status)
  Stream<List<DeliveryModel>> getAvailableDeliveries() {
    return _firestore
        .collection('deliveries')
        .where('status', isEqualTo: 'pending')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => DeliveryModel.fromFirestore(doc))
            .toList());
  }

  // Get business deliveries
  Stream<List<DeliveryModel>> getBusinessDeliveries(String businessId) {
    return _firestore
        .collection('deliveries')
        .where('businessId', isEqualTo: businessId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => DeliveryModel.fromFirestore(doc))
            .toList());
  }

  // Get rider active deliveries
  Stream<List<DeliveryModel>> getRiderActiveDeliveries(String riderId) {
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

  // Get rider completed deliveries
  Stream<List<DeliveryModel>> getRiderCompletedDeliveries(String riderId) {
    return _firestore
        .collection('deliveries')
        .where('riderId', isEqualTo: riderId)
        .where('status', isEqualTo: 'delivered')
        .orderBy('deliveredAt', descending: true)
        .limit(50)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => DeliveryModel.fromFirestore(doc))
            .toList());
  }

  // Update delivery status
  Future<void> updateDeliveryStatus({
    required String deliveryId,
    required DeliveryStatus status,
    String? riderId,
    String? riderName,
    String? cancelReason,
  }) async {
    try {
      Map<String, dynamic> updates = {
        'status': _statusToString(status),
      };

      if (riderId != null) updates['riderId'] = riderId;
      if (riderName != null) updates['riderName'] = riderName;
      if (cancelReason != null) updates['cancelReason'] = cancelReason;

      switch (status) {
        case DeliveryStatus.accepted:
          updates['acceptedAt'] = Timestamp.now();
          break;
        case DeliveryStatus.pickedUp:
          updates['pickedUpAt'] = Timestamp.now();
          break;
        case DeliveryStatus.delivered:
          updates['deliveredAt'] = Timestamp.now();
          break;
        default:
          break;
      }

      await _firestore.collection('deliveries').doc(deliveryId).update(updates);
    } catch (e) {
      print('Error updating delivery status: $e');
      rethrow;
    }
  }

  // Accept delivery (rider)
  Future<void> acceptDelivery({
    required String deliveryId,
    required String riderId,
    required String riderName,
  }) async {
    try {
      await _firestore.collection('deliveries').doc(deliveryId).update({
        'riderId': riderId,
        'riderName': riderName,
        'status': 'accepted',
        'acceptedAt': Timestamp.now(),
      });
    } catch (e) {
      print('Error accepting delivery: $e');
      rethrow;
    }
  }

  // Create transaction
  Future<void> createTransaction(TransactionModel transaction) async {
    try {
      await _firestore
          .collection('transactions')
          .add(transaction.toMap());
    } catch (e) {
      print('Error creating transaction: $e');
      rethrow;
    }
  }

  // Get user transactions
  Stream<List<TransactionModel>> getUserTransactions(String userId) {
    return _firestore
        .collection('transactions')
        .where('userId', isEqualTo: userId)
        .orderBy('timestamp', descending: true)
        .limit(100)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => TransactionModel.fromFirestore(doc))
            .toList());
  }

  // Update user wallet balance
  Future<void> updateWalletBalance(String userId, double amount) async {
    try {
      DocumentReference userRef = _firestore.collection('users').doc(userId);
      await _firestore.runTransaction((transaction) async {
        DocumentSnapshot snapshot = await transaction.get(userRef);
        if (!snapshot.exists) {
          throw Exception('User does not exist');
        }

        double currentBalance = (snapshot.get('walletBalance') ?? 0.0).toDouble();
        double newBalance = currentBalance + amount;

        transaction.update(userRef, {'walletBalance': newBalance});
      });
    } catch (e) {
      print('Error updating wallet: $e');
      rethrow;
    }
  }

  // Update rider stats after delivery
  Future<void> updateRiderStats(String riderId, double rating) async {
    try {
      DocumentReference riderRef = _firestore.collection('users').doc(riderId);
      await _firestore.runTransaction((transaction) async {
        DocumentSnapshot snapshot = await transaction.get(riderRef);
        if (!snapshot.exists) {
          throw Exception('Rider does not exist');
        }

        int totalDeliveries = (snapshot.get('totalDeliveries') ?? 0) + 1;
        double currentRating = (snapshot.get('rating') ?? 5.0).toDouble();
        double newRating = ((currentRating * (totalDeliveries - 1)) + rating) / totalDeliveries;

        transaction.update(riderRef, {
          'totalDeliveries': totalDeliveries,
          'rating': newRating,
        });
      });
    } catch (e) {
      print('Error updating rider stats: $e');
      rethrow;
    }
  }

  // Get single delivery
  Future<DeliveryModel?> getDelivery(String deliveryId) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('deliveries').doc(deliveryId).get();
      if (doc.exists) {
        return DeliveryModel.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      print('Error getting delivery: $e');
      return null;
    }
  }

  String _statusToString(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.pending:
        return 'pending';
      case DeliveryStatus.accepted:
        return 'accepted';
      case DeliveryStatus.pickedUp:
        return 'pickedUp';
      case DeliveryStatus.inTransit:
        return 'inTransit';
      case DeliveryStatus.delivered:
        return 'delivered';
      case DeliveryStatus.cancelled:
        return 'cancelled';
    }
  }
}

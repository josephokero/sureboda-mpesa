import 'package:cloud_firestore/cloud_firestore.dart';

enum DeliveryStatus {
  pending,
  accepted,
  pickedUp,
  inTransit,
  delivered,
  cancelled
}

class LocationData {
  final double latitude;
  final double longitude;
  final String address;

  LocationData({
    required this.latitude,
    required this.longitude,
    required this.address,
  });

  Map<String, dynamic> toMap() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }

  factory LocationData.fromMap(Map<String, dynamic> map) {
    return LocationData(
      latitude: map['latitude']?.toDouble() ?? 0.0,
      longitude: map['longitude']?.toDouble() ?? 0.0,
      address: map['address'] ?? '',
    );
  }
}

class DeliveryModel {
  final String id;
  final String businessId;
  final String businessName;
  final String? riderId;
  final String? riderName;
  final LocationData pickupLocation;
  final LocationData deliveryLocation;
  final String recipientName;
  final String recipientPhone;
  final String packageDescription;
  final double packageWeight; // in kg
  final double deliveryFee;
  final DeliveryStatus status;
  final DateTime createdAt;
  final DateTime? acceptedAt;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;
  final String? cancelReason;
  final bool isPaid;
  final String? paymentTransactionId;
  final String? specialInstructions;
  final DateTime? scheduledFor;
  final double? businessRating; // Business rates rider (1-5)
  final String? businessReview; // Business review of rider
  final double? riderRating; // Rider rates business (1-5)
  final String? riderReview; // Rider review of business

  DeliveryModel({
    required this.id,
    required this.businessId,
    required this.businessName,
    this.riderId,
    this.riderName,
    required this.pickupLocation,
    required this.deliveryLocation,
    required this.recipientName,
    required this.recipientPhone,
    required this.packageDescription,
    required this.packageWeight,
    required this.deliveryFee,
    required this.status,
    required this.createdAt,
    this.acceptedAt,
    this.pickedUpAt,
    this.deliveredAt,
    this.cancelReason,
    this.isPaid = false,
    this.paymentTransactionId,
    this.specialInstructions,
    this.scheduledFor,
    this.businessRating,
    this.businessReview,
    this.riderRating,
    this.riderReview,
  });

  factory DeliveryModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    
    DeliveryStatus parseStatus(String status) {
      switch (status) {
        case 'pending':
          return DeliveryStatus.pending;
        case 'accepted':
          return DeliveryStatus.accepted;
        case 'pickedUp':
          return DeliveryStatus.pickedUp;
        case 'inTransit':
          return DeliveryStatus.inTransit;
        case 'delivered':
          return DeliveryStatus.delivered;
        case 'cancelled':
          return DeliveryStatus.cancelled;
        default:
          return DeliveryStatus.pending;
      }
    }

    return DeliveryModel(
      id: doc.id,
      businessId: data['businessId'] ?? '',
      businessName: data['businessName'] ?? '',
      riderId: data['riderId'],
      riderName: data['riderName'],
      pickupLocation: LocationData.fromMap(data['pickupLocation']),
      deliveryLocation: LocationData.fromMap(data['deliveryLocation']),
      recipientName: data['recipientName'] ?? '',
      recipientPhone: data['recipientPhone'] ?? '',
      packageDescription: data['packageDescription'] ?? '',
      packageWeight: (data['packageWeight'] ?? 0.0).toDouble(),
      deliveryFee: (data['deliveryFee'] ?? 0.0).toDouble(),
      status: parseStatus(data['status'] ?? 'pending'),
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      acceptedAt: data['acceptedAt'] != null ? (data['acceptedAt'] as Timestamp).toDate() : null,
      pickedUpAt: data['pickedUpAt'] != null ? (data['pickedUpAt'] as Timestamp).toDate() : null,
      deliveredAt: data['deliveredAt'] != null ? (data['deliveredAt'] as Timestamp).toDate() : null,
      cancelReason: data['cancelReason'],
      isPaid: data['isPaid'] ?? false,
      paymentTransactionId: data['paymentTransactionId'],
      specialInstructions: data['specialInstructions'],
      scheduledFor: data['scheduledFor'] != null ? (data['scheduledFor'] as Timestamp).toDate() : null,
      businessRating: data['businessRating']?.toDouble(),
      businessReview: data['businessReview'],
      riderRating: data['riderRating']?.toDouble(),
      riderReview: data['riderReview'],
    );
  }

  Map<String, dynamic> toMap() {
    String statusToString(DeliveryStatus status) {
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

    return {
      'businessId': businessId,
      'businessName': businessName,
      'riderId': riderId,
      'riderName': riderName,
      'pickupLocation': pickupLocation.toMap(),
      'deliveryLocation': deliveryLocation.toMap(),
      'recipientName': recipientName,
      'recipientPhone': recipientPhone,
      'packageDescription': packageDescription,
      'packageWeight': packageWeight,
      'deliveryFee': deliveryFee,
      'status': statusToString(status),
      'createdAt': Timestamp.fromDate(createdAt),
      'acceptedAt': acceptedAt != null ? Timestamp.fromDate(acceptedAt!) : null,
      'pickedUpAt': pickedUpAt != null ? Timestamp.fromDate(pickedUpAt!) : null,
      'deliveredAt': deliveredAt != null ? Timestamp.fromDate(deliveredAt!) : null,
      'cancelReason': cancelReason,
      'isPaid': isPaid,
      'paymentTransactionId': paymentTransactionId,
      'specialInstructions': specialInstructions,
      'scheduledFor': scheduledFor != null ? Timestamp.fromDate(scheduledFor!) : null,
      'businessRating': businessRating,
      'businessReview': businessReview,
      'riderRating': riderRating,
      'riderReview': riderReview,
    };
  }

  DeliveryModel copyWith({
    String? riderId,
    String? riderName,
    DeliveryStatus? status,
    DateTime? acceptedAt,
    DateTime? pickedUpAt,
    DateTime? deliveredAt,
    String? cancelReason,
    bool? isPaid,
    String? paymentTransactionId,
  }) {
    return DeliveryModel(
      id: id,
      businessId: businessId,
      businessName: businessName,
      riderId: riderId ?? this.riderId,
      riderName: riderName ?? this.riderName,
      pickupLocation: pickupLocation,
      deliveryLocation: deliveryLocation,
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      packageDescription: packageDescription,
      packageWeight: packageWeight,
      deliveryFee: deliveryFee,
      status: status ?? this.status,
      createdAt: createdAt,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      pickedUpAt: pickedUpAt ?? this.pickedUpAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      cancelReason: cancelReason ?? this.cancelReason,
      isPaid: isPaid ?? this.isPaid,
      paymentTransactionId: paymentTransactionId ?? this.paymentTransactionId,
      specialInstructions: specialInstructions,
    );
  }
}

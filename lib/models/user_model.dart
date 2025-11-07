import 'package:cloud_firestore/cloud_firestore.dart';

enum UserType { business, rider, admin }

class UserModel {
  final String uid;
  final String email;
  final String fullName;
  final String phone;
  final String idNumber;
  final UserType userType;
  final String? location;
  final String? businessName;
  final String? profileImage;
  final double walletBalance;
  final double pendingBalance; // Money reserved for ongoing deliveries
  final bool active;
  final DateTime createdAt;
  final String? vehicleType; // For riders
  final String? vehicleNumber; // For riders
  final double? rating; // For riders
  final int? totalDeliveries; // For riders
  final int? totalRatings; // For rating system

  // Getter for id (alias for uid)
  String get id => uid;

  UserModel({
    required this.uid,
    required this.email,
    required this.fullName,
    required this.phone,
    required this.idNumber,
    required this.userType,
    this.location,
    this.businessName,
    this.profileImage,
    this.walletBalance = 0.0,
    this.pendingBalance = 0.0,
    this.active = true,
    required this.createdAt,
    this.vehicleType,
    this.vehicleNumber,
    this.rating,
    this.totalDeliveries,
    this.totalRatings,
  });

  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    
    // Parse role from Firebase (admin, business, rider)
    String roleValue = data['role'] ?? 'business';
    UserType parsedUserType;
    
    if (roleValue.toLowerCase() == 'rider') {
      parsedUserType = UserType.rider;
    } else if (roleValue.toLowerCase() == 'admin') {
      parsedUserType = UserType.admin;
    } else {
      parsedUserType = UserType.business;
    }
    
    return UserModel(
      uid: data['uid'] ?? doc.id,
      email: data['email'] ?? '',
      fullName: data['fullName'] ?? '',
      phone: data['phone'] ?? '',
      idNumber: data['idNumber'] ?? '',
      userType: parsedUserType,
      location: data['location'],
      businessName: data['businessName'],
      profileImage: data['profileImage'],
      walletBalance: (data['walletBalance'] ?? 0.0).toDouble(),
      pendingBalance: (data['pendingBalance'] ?? 0.0).toDouble(),
      active: data['active'] ?? true,
      createdAt: data['createdAt'] != null 
          ? (data['createdAt'] as Timestamp).toDate() 
          : DateTime.now(),
      vehicleType: data['vehicleType'],
      vehicleNumber: data['vehicleNumber'],
      rating: data['rating']?.toDouble(),
      totalDeliveries: data['totalDeliveries'],
      totalRatings: data['totalRatings'],
    );
  }

  Map<String, dynamic> toMap() {
    String roleString;
    if (userType == UserType.rider) {
      roleString = 'rider';
    } else if (userType == UserType.admin) {
      roleString = 'admin';
    } else {
      roleString = 'business';
    }
    
    return {
      'uid': uid,
      'email': email,
      'fullName': fullName,
      'phone': phone,
      'idNumber': idNumber,
      'role': roleString,
      'location': location,
      'businessName': businessName,
      'profileImage': profileImage,
      'walletBalance': walletBalance,
      'pendingBalance': pendingBalance,
      'active': active,
      'createdAt': Timestamp.fromDate(createdAt),
      'vehicleType': vehicleType,
      'vehicleNumber': vehicleNumber,
      'rating': rating,
      'totalDeliveries': totalDeliveries,
      'totalRatings': totalRatings,
    };
  }
}

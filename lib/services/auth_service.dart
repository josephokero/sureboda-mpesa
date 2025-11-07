import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Get current user
  User? get currentUser => _auth.currentUser;

  // Stream of auth changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Sign up
  Future<UserModel?> signUp({
    required String email,
    required String password,
    required String fullName,
    required String phone,
    required String idNumber,
    required UserType userType,
    String? location,
    String? businessName,
    String? vehicleType,
    String? vehicleNumber,
  }) async {
    try {
      UserCredential result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      User? user = result.user;
      if (user != null) {
        // Create user document matching your Firebase structure
        UserModel newUser = UserModel(
          uid: user.uid,
          email: email,
          fullName: fullName,
          phone: phone,
          idNumber: idNumber,
          userType: userType,
          location: location,
          businessName: businessName,
          createdAt: DateTime.now(),
          active: true,
          vehicleType: vehicleType,
          vehicleNumber: vehicleNumber,
          rating: userType == UserType.rider ? 5.0 : null,
          totalDeliveries: userType == UserType.rider ? 0 : null,
        );

        await _firestore.collection('users').doc(user.uid).set(newUser.toMap());
        return newUser;
      }
      return null;
    } catch (e) {
      print('Error in sign up: $e');
      rethrow;
    }
  }

  // Sign in
  Future<UserModel?> signIn({
    required String email,
    required String password,
  }) async {
    try {
      UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      User? user = result.user;
      if (user != null) {
        // Fetch user document from 'users' collection
        DocumentSnapshot doc = await _firestore.collection('users').doc(user.uid).get();
        
        if (!doc.exists) {
          throw Exception('User data not found in database');
        }
        
        return UserModel.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      print('Error in sign in: $e');
      rethrow;
    }
  }

  // Get user data
  Future<UserModel?> getUserData(String uid) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return UserModel.fromFirestore(doc);
      }
      return null;
    } catch (e) {
      print('Error getting user data: $e');
      return null;
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } catch (e) {
      print('Error signing out: $e');
      rethrow;
    }
  }

  // Update user profile
  Future<void> updateUserProfile({
    required String uid,
    String? fullName,
    String? phone,
    String? location,
    String? profileImage,
    String? businessName,
    String? vehicleType,
    String? vehicleNumber,
  }) async {
    try {
      Map<String, dynamic> updates = {};
      if (fullName != null) updates['fullName'] = fullName;
      if (phone != null) updates['phone'] = phone;
      if (location != null) updates['location'] = location;
      if (profileImage != null) updates['profileImage'] = profileImage;
      if (businessName != null) updates['businessName'] = businessName;
      if (vehicleType != null) updates['vehicleType'] = vehicleType;
      if (vehicleNumber != null) updates['vehicleNumber'] = vehicleNumber;

      await _firestore.collection('users').doc(uid).update(updates);
    } catch (e) {
      print('Error updating profile: $e');
      rethrow;
    }
  }

  // Reset password
  Future<void> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } catch (e) {
      print('Error resetting password: $e');
      rethrow;
    }
  }
}

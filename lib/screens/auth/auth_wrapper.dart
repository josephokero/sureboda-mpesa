import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../services/auth_service.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import '../business/business_home_screen.dart';
import '../rider/rider_home_screen.dart';
import 'welcome_screen.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();

    return StreamBuilder<User?>(
      stream: authService.authStateChanges,
      builder: (context, snapshot) {
        // Show loading while checking auth state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: AppColors.black,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.accent),
                  SizedBox(height: 20),
                  Text(
                    'Loading...',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ],
              ),
            ),
          );
        }

        // If user is not logged in, show welcome screen
        if (!snapshot.hasData || snapshot.data == null) {
          return const WelcomeScreen();
        }

        // User is logged in, fetch user data and redirect to appropriate screen
        return FutureBuilder<UserModel?>(
          future: authService.getUserData(snapshot.data!.uid),
          builder: (context, userSnapshot) {
            // Show loading while fetching user data
            if (userSnapshot.connectionState == ConnectionState.waiting) {
              return const Scaffold(
                backgroundColor: AppColors.black,
                body: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: AppColors.accent),
                      SizedBox(height: 20),
                      Text(
                        'Loading your profile...',
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                    ],
                  ),
                ),
              );
            }

            // If user data not found or error, sign out and show welcome
            if (!userSnapshot.hasData || userSnapshot.data == null) {
              // Sign out the user since their data is corrupted/missing
              authService.signOut();
              return const WelcomeScreen();
            }

            final userData = userSnapshot.data!;

            // Redirect to appropriate dashboard based on user type
            if (userData.userType == UserType.business) {
              return BusinessHomeScreen(user: userData);
            } else if (userData.userType == UserType.rider) {
              return RiderHomeScreen(user: userData);
            } else {
              // Unknown user type, sign out and show welcome
              authService.signOut();
              return const WelcomeScreen();
            }
          },
        );
      },
    );
  }
}

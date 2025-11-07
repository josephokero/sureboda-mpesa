import 'package:flutter/material.dart';
import '../../utils/theme.dart';
import '../../utils/constants.dart';
import 'login_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(flex: 2),
              
              // Logo - Simple and Clean
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.motorcycle,
                  color: Colors.white,
                  size: 36,
                ),
              ),
              
              const SizedBox(height: 40),
              
              // App Name - Clean Typography
              const Text(
                AppConstants.appName,
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.1,
                  letterSpacing: -1,
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Slogan
              Text(
                AppConstants.appSlogan,
                style: TextStyle(
                  fontSize: 18,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              
              const SizedBox(height: 8),
              
              // Tagline with accent
              Row(
                children: [
                  Container(
                    width: 4,
                    height: 20,
                    decoration: BoxDecoration(
                      color: AppColors.accent,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    AppConstants.appTagline,
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              
              const Spacer(flex: 1),
              
              // Description
              Text(
                'Connect businesses with professional riders for fast, reliable deliveries across Kenya.',
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
              
              const Spacer(flex: 2),
              
              // CTA Buttons
              ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const LoginScreen(),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: const Text('Get Started'),
              ),
              
              const SizedBox(height: 16),
              
              OutlinedButton(
                onPressed: () {
                  // Learn more
                },
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                ),
                child: const Text('Learn More'),
              ),
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

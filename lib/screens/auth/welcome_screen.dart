import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../utils/theme.dart';
import '../../utils/constants.dart';
import 'account_type_selection_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late AnimationController _floatController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _floatController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fadeController, curve: Curves.easeOut),
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOutCubic));
    
    _fadeController.forward();
    _slideController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _floatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 60),
                  
                  // Animated Logo Section
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Center(
                        child: Column(
                          children: [
                            // Floating Animated Logo
                            AnimatedBuilder(
                              animation: _floatController,
                              builder: (context, child) {
                                return Transform.translate(
                                  offset: Offset(0, math.sin(_floatController.value * 2 * math.pi) * 10),
                                  child: Container(
                                    width: 150,
                                    height: 150,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.accent.withOpacity(0.5),
                                          blurRadius: 40,
                                          spreadRadius: 0,
                                        ),
                                      ],
                                    ),
                                    child: ClipOval(
                                      child: Image.asset(
                                        'assets/images/logosureboda.jpg',
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          // Fallback to icon if image fails to load
                                          return Container(
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              gradient: LinearGradient(
                                                colors: [
                                                  AppColors.accent,
                                                  AppColors.accentLight,
                                                ],
                                              ),
                                            ),
                                            child: const Icon(
                                              Icons.motorcycle,
                                              size: 60,
                                              color: AppColors.black,
                                            ),
                                          );
                                        },
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                            
                            const SizedBox(height: 40),
                            
                            // App Name with Glow Effect
                            ShaderMask(
                              shaderCallback: (bounds) => LinearGradient(
                                colors: [
                                  AppColors.white,
                                  AppColors.accentLight,
                                ],
                              ).createShader(bounds),
                              child: const Text(
                                AppConstants.appName,
                                style: TextStyle(
                                  fontSize: 56,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  letterSpacing: 2,
                                ),
                              ),
                            ),
                            
                            const SizedBox(height: 12),
                            
                            // Slogan
                            Text(
                              AppConstants.appSlogan,
                              style: TextStyle(
                                fontSize: 18,
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 60),
                  
                  // Feature Cards
                  _buildFeatureCard(
                    icon: Icons.business_outlined,
                    title: 'For Businesses',
                    description: 'Request deliveries instantly. Track in real-time. Pay securely with M-Pesa.',
                    delay: 200,
                  ),
                  
                  const SizedBox(height: 16),
                  
                  _buildFeatureCard(
                    icon: Icons.motorcycle_outlined,
                    title: 'For Riders',
                    description: 'Accept jobs. Earn money. Withdraw instantly to your M-Pesa account.',
                    delay: 400,
                  ),
                  
                  const SizedBox(height: 16),
                  
                  _buildFeatureCard(
                    icon: Icons.bolt,
                    title: 'Lightning Fast',
                    description: 'Real-time matching. Instant notifications. Quick deliveries across Kenya.',
                    delay: 600,
                  ),
                  
                  const SizedBox(height: 50),
                  
                  // CTA Buttons
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: Column(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              colors: [
                                AppColors.accent,
                                AppColors.accentLight,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.accent.withOpacity(0.4),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const AccountTypeSelectionScreen(
                                    isLogin: true,
                                  ),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              minimumSize: const Size(double.infinity, 60),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Get Started',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                SizedBox(width: 8),
                                Icon(Icons.arrow_forward_rounded),
                              ],
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        OutlinedButton(
                          onPressed: () {
                            _showAboutDialog(context);
                          },
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 60),
                          ),
                          child: const Text('Learn More'),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 40),
                  
                  // Footer
                  Center(
                    child: Text(
                      '© 2025 SUREBODA • Built in Kenya 🇰🇪',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required int delay,
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 800 + delay),
      curve: Curves.easeOut,
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 30 * (1 - value)),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.cardDark,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.darkGray.withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.accent.withOpacity(0.2),
                          AppColors.accentLight.withOpacity(0.1),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      icon,
                      color: AppColors.accent,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          description,
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'About SUREBODA',
          style: TextStyle(color: AppColors.white),
        ),
        content: const Text(
          'SUREBODA is Kenya\'s premier delivery platform connecting businesses with professional riders for fast, reliable deliveries.\n\n'
          'Features:\n'
          '• Real-time order tracking\n'
          '• Secure M-Pesa payments\n'
          '• Instant rider matching\n'
          '• Transparent pricing\n'
          '• 24/7 support',
          style: TextStyle(color: AppColors.textSecondary, height: 1.6),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }
}

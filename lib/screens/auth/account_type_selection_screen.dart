import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import 'login_screen.dart';
import 'register_screen.dart';

class AccountTypeSelectionScreen extends StatefulWidget {
  final bool isLogin; // true for login, false for register

  const AccountTypeSelectionScreen({
    super.key,
    required this.isLogin,
  });

  @override
  State<AccountTypeSelectionScreen> createState() => _AccountTypeSelectionScreenState();
}

class _AccountTypeSelectionScreenState extends State<AccountTypeSelectionScreen>
    with SingleTickerProviderStateMixin {
  UserType? _selectedUserType;
  bool _showForm = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleNext() {
    if (_selectedUserType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an account type')),
      );
      return;
    }

    setState(() {
      _showForm = true;
    });

    // Navigate after animation
    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      
      if (widget.isLogin) {
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
                LoginScreen(preSelectedUserType: _selectedUserType),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        );
      } else {
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
                RegisterScreen(preSelectedUserType: _selectedUserType),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: AnimatedOpacity(
          opacity: _showForm ? 0.0 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),

                // Title
                Text(
                  widget.isLogin ? 'Sign In As' : 'Join SUREBODA As',
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: AppColors.white,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 12),

                // Subtitle
                Text(
                  'Choose your account type to continue',
                  style: TextStyle(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 60),

                // Business Card
                _buildAccountTypeCard(
                  userType: UserType.business,
                  icon: Icons.business_center,
                  title: 'Business Account',
                  description:
                      'Request deliveries for your business. Track orders in real-time and manage payments easily.',
                  features: [
                    'Create delivery requests',
                    'Track riders in real-time',
                    'Secure M-Pesa payments',
                    'Order history & receipts',
                  ],
                ),

                const SizedBox(height: 24),

                // Rider Card
                _buildAccountTypeCard(
                  userType: UserType.rider,
                  icon: Icons.motorcycle,
                  title: 'Rider Account',
                  description:
                      'Accept delivery jobs and earn money. Get instant payments to your M-Pesa account.',
                  features: [
                    'Accept delivery jobs',
                    'Flexible working hours',
                    'Instant M-Pesa withdrawals',
                    'Track your earnings',
                  ],
                ),

                const SizedBox(height: 40),

                // Next Button
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: LinearGradient(
                      colors: [
                        _selectedUserType != null
                            ? AppColors.accent
                            : AppColors.darkGray,
                        _selectedUserType != null
                            ? AppColors.accentLight
                            : AppColors.darkGray,
                      ],
                    ),
                    boxShadow: _selectedUserType != null
                        ? [
                            BoxShadow(
                              color: AppColors.accent.withOpacity(0.4),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ]
                        : [],
                  ),
                  child: ElevatedButton(
                    onPressed: _selectedUserType != null ? _handleNext : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      minimumSize: const Size(double.infinity, 60),
                      disabledBackgroundColor: Colors.transparent,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Continue',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: _selectedUserType != null
                                ? AppColors.black
                                : AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          Icons.arrow_forward_rounded,
                          color: _selectedUserType != null
                              ? AppColors.black
                              : AppColors.textMuted,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAccountTypeCard({
    required UserType userType,
    required IconData icon,
    required String title,
    required String description,
    required List<String> features,
  }) {
    final isSelected = _selectedUserType == userType;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedUserType = userType;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent.withOpacity(0.1) : AppColors.cardDark,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.accent : AppColors.darkGray.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isSelected
                          ? [AppColors.accent, AppColors.accentLight]
                          : [
                              AppColors.darkGray.withOpacity(0.3),
                              AppColors.darkGray.withOpacity(0.1)
                            ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    icon,
                    color: isSelected ? AppColors.black : AppColors.textSecondary,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? AppColors.accent : AppColors.white,
                        ),
                      ),
                      if (isSelected)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.accent,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'Selected',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.black,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              description,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            ...features.map(
              (feature) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 18,
                      color: isSelected ? AppColors.accent : AppColors.darkGray,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        feature,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

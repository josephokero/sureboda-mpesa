import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import '../../utils/helpers.dart';
import '../business/business_home_screen.dart';
import '../rider/rider_home_screen.dart';

class RegisterScreen extends StatefulWidget {
  final UserType? preSelectedUserType;
  
  const RegisterScreen({super.key, this.preSelectedUserType});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _idNumberController = TextEditingController();
  final _passwordController = TextEditingController();
  final _businessNameController = TextEditingController();
  final _vehicleTypeController = TextEditingController();
  final _vehicleNumberController = TextEditingController();
  final _authService = AuthService();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  late UserType _selectedUserType;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _selectedUserType = widget.preSelectedUserType ?? UserType.business;
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
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _idNumberController.dispose();
    _passwordController.dispose();
    _businessNameController.dispose();
    _vehicleTypeController.dispose();
    _vehicleNumberController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      UserModel? user = await _authService.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        fullName: _nameController.text.trim(),
        phone: Helpers.formatKenyanPhone(_phoneController.text.trim()),
        idNumber: _idNumberController.text.trim(),
        userType: _selectedUserType,
        location: 'Kenya', // Default location
        businessName: _selectedUserType == UserType.business 
            ? _businessNameController.text.trim() 
            : null,
        vehicleType: _selectedUserType == UserType.rider 
            ? _vehicleTypeController.text.trim() 
            : null,
        vehicleNumber: _selectedUserType == UserType.rider 
            ? _vehicleNumberController.text.trim() 
            : null,
      );

      if (!mounted) return;

      if (user != null) {
        Helpers.showSnackBar(context, 'Account created successfully!');
        
        // Navigate based on user type
        if (user.userType == UserType.business) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => BusinessHomeScreen(user: user),
            ),
          );
        } else {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => RiderHomeScreen(user: user),
            ),
          );
        }
      }
    } catch (e) {
      if (!mounted) return;
      Helpers.showSnackBar(context, e.toString(), isError: true);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final userTypeIcon = _selectedUserType == UserType.business
        ? Icons.business_center
        : Icons.motorcycle;
    final userTypeLabel = _selectedUserType == UserType.business
        ? 'Business'
        : 'Rider';

    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Join SUREBODA',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Account Type Display
                  if (widget.preSelectedUserType != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.cardDark,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.accent.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            userTypeIcon,
                            color: AppColors.accent,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '$userTypeLabel Account',
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  const SizedBox(height: 30),
                
                // Name Field
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your name';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Email Field
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your email';
                    }
                    if (!Helpers.isValidEmail(value)) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Phone Field
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone Number',
                    prefixIcon: Icon(Icons.phone_outlined),
                    hintText: '0712345678',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your phone number';
                    }
                    if (!Helpers.isValidKenyanPhone(value)) {
                      return 'Please enter a valid Kenyan phone number';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // ID Number Field
                TextFormField(
                  controller: _idNumberController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'ID Number',
                    prefixIcon: Icon(Icons.badge_outlined),
                    hintText: 'Enter your ID number',
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your ID number';
                    }
                    if (value.length < 6) {
                      return 'Please enter a valid ID number';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Conditional Fields based on user type
                if (_selectedUserType == UserType.business) ...[
                  TextFormField(
                    controller: _businessNameController,
                    decoration: const InputDecoration(
                      labelText: 'Business Name',
                      prefixIcon: Icon(Icons.store_outlined),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your business name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                ],
                
                if (_selectedUserType == UserType.rider) ...[
                  TextFormField(
                    controller: _vehicleTypeController,
                    decoration: const InputDecoration(
                      labelText: 'Vehicle Type',
                      prefixIcon: Icon(Icons.motorcycle_outlined),
                      hintText: 'e.g., Motorcycle, Bicycle',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your vehicle type';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _vehicleNumberController,
                    decoration: const InputDecoration(
                      labelText: 'Vehicle Number Plate',
                      prefixIcon: Icon(Icons.badge_outlined),
                      hintText: 'KXX 123Y',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your vehicle number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                ],
                
                // Password Field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a password';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                
                const SizedBox(height: 30),
                
                // Register Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _register,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Create Account'),
                ),
                
                const SizedBox(height: 20),
                
                // Login Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? '),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      child: const Text('Login'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
  }
}

class _UserTypeCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _UserTypeCard({
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent : AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.accent : AppColors.darkGray,
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 40,
              color: isSelected ? Colors.white : AppColors.textSecondary,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

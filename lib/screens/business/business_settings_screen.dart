import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import '../../services/auth_service.dart';
import 'test_mpesa_screen.dart';

class BusinessSettingsScreen extends StatefulWidget {
  final UserModel user;

  const BusinessSettingsScreen({super.key, required this.user});

  @override
  State<BusinessSettingsScreen> createState() => _BusinessSettingsScreenState();
}

class _BusinessSettingsScreenState extends State<BusinessSettingsScreen> {
  final AuthService _authService = AuthService();
  bool _notificationsEnabled = true;
  bool _emailNotifications = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.cardDark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Settings',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfileSection(),
            const SizedBox(height: 24),
            _buildSectionTitle('Account Settings'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.business,
                'Business Information',
                'Update your business details',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.location_on_outlined,
                'Business Location',
                widget.user.location ?? 'Not set',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.phone,
                'Phone Number',
                widget.user.phone,
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.email_outlined,
                'Email',
                widget.user.email,
                () {},
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Notifications'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSwitchItem(
                Icons.notifications_active_outlined,
                'Push Notifications',
                'Get notified about delivery updates',
                _notificationsEnabled,
                (value) {
                  setState(() {
                    _notificationsEnabled = value;
                  });
                },
              ),
              _buildDivider(),
              _buildSwitchItem(
                Icons.email_outlined,
                'Email Notifications',
                'Receive delivery updates via email',
                _emailNotifications,
                (value) {
                  setState(() {
                    _emailNotifications = value;
                  });
                },
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Payment'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.money,
                'M-Pesa Payment (LIVE)',
                'Send real M-Pesa payment requests',
                () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const TestMpesaScreen(),
                    ),
                  );
                },
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.payment,
                'Payment Methods',
                'Manage M-Pesa and other methods',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.receipt_long,
                'Billing History',
                'View all transactions',
                () {},
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Support'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.help_outline,
                'Help Center',
                'FAQs and support articles',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.contact_support_outlined,
                'Contact Support',
                'Get help from our team',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.info_outline,
                'About',
                'Version 1.0.0',
                () {},
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Danger Zone'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.lock_outline,
                'Change Password',
                'Update your account password',
                () {},
                isDestructive: false,
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.logout,
                'Logout',
                'Sign out from your account',
                () async {
                  await _showLogoutDialog();
                },
                isDestructive: true,
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.delete_outline,
                'Delete Account',
                'Permanently delete your account',
                () {},
                isDestructive: true,
              ),
            ]),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.accent.withOpacity(0.2),
            AppColors.accent.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.accent.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              color: AppColors.accent,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.business, color: Colors.black, size: 35),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.user.businessName ?? widget.user.fullName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Business Account',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'ID: ${widget.user.idNumber}',
                  style: TextStyle(
                    color: AppColors.accent,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.edit, color: Colors.white),
            style: IconButton.styleFrom(
              backgroundColor: Colors.white.withOpacity(0.1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingsItem(
    IconData icon,
    String title,
    String subtitle,
    VoidCallback onTap, {
    bool isDestructive = false,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDestructive
                    ? Colors.red.withOpacity(0.1)
                    : AppColors.accent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: isDestructive ? Colors.red : AppColors.accent,
                size: 22,
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
                      color: isDestructive ? Colors.red : Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Colors.white.withOpacity(0.3),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSwitchItem(
    IconData icon,
    String title,
    String subtitle,
    bool value,
    Function(bool) onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.accent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.accent, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.accent,
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Divider(color: Colors.white.withOpacity(0.1), height: 1),
    );
  }

  Future<void> _showLogoutDialog() async {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Logout',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: const Text(
          'Are you sure you want to logout?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            onPressed: () async {
              await _authService.signOut();
              if (mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil('/welcome', (route) => false);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

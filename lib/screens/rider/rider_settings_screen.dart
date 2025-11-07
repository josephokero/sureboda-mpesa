import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import '../../services/auth_service.dart';

class RiderSettingsScreen extends StatefulWidget {
  final UserModel user;

  const RiderSettingsScreen({super.key, required this.user});

  @override
  State<RiderSettingsScreen> createState() => _RiderSettingsScreenState();
}

class _RiderSettingsScreenState extends State<RiderSettingsScreen> {
  final AuthService _authService = AuthService();
  bool _notificationsEnabled = true;
  bool _locationSharing = true;
  bool _autoAcceptEnabled = false;

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
            _buildSectionTitle('Rider Information'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.motorcycle,
                'Vehicle Type',
                widget.user.vehicleType ?? 'Not set',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.confirmation_number_outlined,
                'Vehicle Number',
                widget.user.vehicleNumber ?? 'Not set',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.star,
                'Rating',
                '${widget.user.rating?.toStringAsFixed(1) ?? '5.0'} ⭐',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.delivery_dining,
                'Total Deliveries',
                '${widget.user.totalDeliveries ?? 0} completed',
                () {},
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Account Settings'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.person_outline,
                'Full Name',
                widget.user.fullName,
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
              _buildDivider(),
              _buildSettingsItem(
                Icons.location_on_outlined,
                'Location',
                widget.user.location ?? 'Kenya',
                () {},
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Delivery Settings'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSwitchItem(
                Icons.location_searching,
                'Location Sharing',
                'Share location with customers',
                _locationSharing,
                (value) {
                  setState(() {
                    _locationSharing = value;
                  });
                },
              ),
              _buildDivider(),
              _buildSwitchItem(
                Icons.auto_mode,
                'Auto-Accept Deliveries',
                'Automatically accept nearby orders',
                _autoAcceptEnabled,
                (value) {
                  setState(() {
                    _autoAcceptEnabled = value;
                  });
                },
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Notifications'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSwitchItem(
                Icons.notifications_active_outlined,
                'Push Notifications',
                'Get notified about new deliveries',
                _notificationsEnabled,
                (value) {
                  setState(() {
                    _notificationsEnabled = value;
                  });
                },
              ),
            ]),
            const SizedBox(height: 24),
            _buildSectionTitle('Earnings & Wallet'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.account_balance_wallet,
                'Wallet Balance',
                'KSH ${widget.user.walletBalance?.toStringAsFixed(2) ?? '0.00'}',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.history,
                'Transaction History',
                'View all earnings and withdrawals',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.payment,
                'M-Pesa Settings',
                'Configure withdrawal details',
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
                'FAQs and rider guides',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.contact_support_outlined,
                'Contact Support',
                '24/7 rider support',
                () {},
              ),
              _buildDivider(),
              _buildSettingsItem(
                Icons.article_outlined,
                'Terms & Conditions',
                'Rider agreement',
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
            _buildSectionTitle('Account Actions'),
            const SizedBox(height: 12),
            _buildSettingsCard([
              _buildSettingsItem(
                Icons.lock_outline,
                'Change Password',
                'Update your password',
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
            child: const Icon(Icons.person, color: Colors.black, size: 35),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.user.fullName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Rider Account',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      '${widget.user.rating?.toStringAsFixed(1) ?? '5.0'}',
                      style: TextStyle(
                        color: AppColors.accent,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      ' • ${widget.user.totalDeliveries ?? 0} trips',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                    ),
                  ],
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

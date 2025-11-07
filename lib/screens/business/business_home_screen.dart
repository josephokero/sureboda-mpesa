import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user_model.dart';
import '../../models/delivery_model.dart';
import '../../utils/theme.dart';
import '../../services/auth_service.dart';
import 'create_delivery_screen.dart';
import 'track_delivery_screen.dart';
import 'payment_history_screen.dart';
import 'business_settings_screen.dart';
import 'wallet_topup_screen.dart';

import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user_model.dart';
import '../../models/delivery_model.dart';
import '../../utils/theme.dart';
import '../../services/auth_service.dart';
import 'create_delivery_screen.dart';
import 'create_delivery_steps_screen.dart';
import 'track_delivery_screen.dart';
import 'payment_history_screen.dart';
import 'business_settings_screen.dart';
import 'wallet_topup_screen.dart';
import 'active_riders_screen.dart';

class BusinessHomeScreen extends StatefulWidget {
  final UserModel user;

  const BusinessHomeScreen({super.key, required this.user});

  @override
  State<BusinessHomeScreen> createState() => _BusinessHomeScreenState();
}

class _BusinessHomeScreenState extends State<BusinessHomeScreen> {
  final AuthService _authService = AuthService();
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: _selectedIndex == 0 ? _buildHomeTab() : _buildOrdersTab(),
      bottomNavigationBar: _buildBottomNav(),
      floatingActionButton: _selectedIndex == 0 ? _buildFAB() : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildHomeTab() {
    return SafeArea(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 20),
            _buildWalletCard(),
            const SizedBox(height: 24),
            _buildStatsCards(),
            const SizedBox(height: 24),
            _buildQuickActions(),
            const SizedBox(height: 24),
            _buildRecentDeliveries(),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.accent.withOpacity(0.1), Colors.transparent],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Logo
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: AppColors.cardDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.accent.withOpacity(0.3)),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.asset(
                    'assets/images/profilelogo.jpg',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(Icons.store, color: AppColors.accent);
                    },
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.user.businessName ?? 'My Business',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'ID: ${widget.user.idNumber}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(Icons.notifications_outlined, color: Colors.white),
                onPressed: () {},
              ),
              PopupMenuButton(
                icon: Icon(Icons.more_vert, color: Colors.white),
                color: AppColors.cardDark,
                itemBuilder: (context) => [
                  PopupMenuItem(
                    child: Text('Profile', style: TextStyle(color: Colors.white)),
                    onTap: () {
                      Future.delayed(Duration.zero, () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BusinessSettingsScreen(user: widget.user),
                          ),
                        );
                      });
                    },
                  ),
                  PopupMenuItem(
                    child: Text('Settings', style: TextStyle(color: Colors.white)),
                    onTap: () {
                      Future.delayed(Duration.zero, () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BusinessSettingsScreen(user: widget.user),
                          ),
                        );
                      });
                    },
                  ),
                  PopupMenuItem(
                    child: Text('Logout', style: TextStyle(color: Colors.red)),
                    onTap: () async {
                      await _authService.signOut();
                      if (context.mounted) {
                        Navigator.of(context).pushReplacementNamed('/welcome');
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            'Welcome back, ${widget.user.fullName}!',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Manage your deliveries efficiently',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWalletCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance
            .collection('users')
            .doc(widget.user.uid)
            .snapshots(),
        builder: (context, snapshot) {
          double walletBalance = widget.user.walletBalance;
          double pendingBalance = widget.user.pendingBalance;
          if (snapshot.hasData && snapshot.data!.exists) {
            final data = snapshot.data!.data() as Map<String, dynamic>;
            walletBalance = (data['walletBalance'] ?? 0.0).toDouble();
            pendingBalance = (data['pendingBalance'] ?? 0.0).toDouble();
          }
          double availableBalance = walletBalance - pendingBalance;

          return InkWell(
            onTap: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => WalletTopUpScreen(user: widget.user),
                ),
              );
              if (result == true) {
                setState(() {}); // Refresh to show updated balance
              }
            },
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.accent,
                    AppColors.accent.withOpacity(0.7),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.account_balance_wallet,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Wallet Balance',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'KSH ${walletBalance.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (pendingBalance > 0) ...[
                          const SizedBox(height: 4),
                          Text(
                            '- KSH ${pendingBalance.toStringAsFixed(2)} (Pending)',
                            style: const TextStyle(
                              color: Colors.red,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                        const SizedBox(height: 4),
                        Text(
                          'Available: KSH ${availableBalance.toStringAsFixed(2)}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.add, color: Colors.black, size: 18),
                        SizedBox(width: 4),
                        Text(
                          'Top Up',
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatsCards() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('deliveries')
          .where('businessId', isEqualTo: widget.user.uid)
          .snapshots(),
      builder: (context, snapshot) {
        int totalDeliveries = 0;
        int activeDeliveries = 0;
        double totalSpent = 0.0;

        if (snapshot.hasData) {
          totalDeliveries = snapshot.data!.docs.length;
          for (var doc in snapshot.data!.docs) {
            final data = doc.data() as Map<String, dynamic>;
            final status = data['status'] ?? '';
            if (status == 'pending' || status == 'accepted' || status == 'pickedUp' || status == 'inTransit') {
              activeDeliveries++;
            }
            if (data['isPaid'] == true) {
              totalSpent += (data['deliveryFee'] ?? 0.0).toDouble();
            }
          }
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Total\nDeliveries',
                  totalDeliveries.toString(),
                  Icons.local_shipping_outlined,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Active\nOrders',
                  activeDeliveries.toString(),
                  Icons.pending_actions_outlined,
                  Colors.orange,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Total\nSpent',
                  'KSH ${totalSpent.toStringAsFixed(0)}',
                  Icons.payments_outlined,
                  Colors.green,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 11,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Quick Actions',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  'Track Order',
                  Icons.location_on_outlined,
                  AppColors.accent,
                  () {
                    // Show dialog to select delivery to track
                    _showTrackOrderDialog();
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionCard(
                  'Active Riders',
                  Icons.motorcycle_outlined,
                  Colors.green,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ActiveRidersScreen(user: widget.user),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  'Payment History',
                  Icons.receipt_long_outlined,
                  Colors.purple,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PaymentHistoryScreen(user: widget.user),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionCard(
                  'Settings',
                  Icons.settings_outlined,
                  Colors.orange,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BusinessSettingsScreen(user: widget.user),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(String label, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: Colors.white.withOpacity(0.4), size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentDeliveries() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Deliveries',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    _selectedIndex = 1;
                  });
                },
                child: Text(
                  'See all',
                  style: TextStyle(color: AppColors.accent),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance
              .collection('deliveries')
              .where('businessId', isEqualTo: widget.user.uid)
              .orderBy('createdAt', descending: true)
              .limit(5)
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: CircularProgressIndicator(),
                ),
              );
            }

            if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
              return _buildEmptyState();
            }

            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: snapshot.data!.docs.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                  final delivery = DeliveryModel.fromFirestore(snapshot.data!.docs[index]);
                return _buildDeliveryCard(delivery, context);
              },
            );
          },
        ),
      ],
    );
  }

  void _showTrackOrderDialog() async {
    final snapshot = await FirebaseFirestore.instance
        .collection('deliveries')
        .where('businessId', isEqualTo: widget.user.uid)
        .where('status', whereIn: ['pending', 'accepted', 'pickedUp', 'inTransit'])
        .get();

    if (!mounted) return;

    if (snapshot.docs.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No active deliveries to track')),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Delivery to Track',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...snapshot.docs.map((doc) {
              final delivery = DeliveryModel.fromFirestore(doc);
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(Icons.local_shipping, color: AppColors.accent),
                title: Text(
                  delivery.recipientName,
                  style: const TextStyle(color: Colors.white),
                ),
                subtitle: Text(
                  _getStatusText(delivery.status),
                  style: TextStyle(color: _getStatusColor(delivery.status)),
                ),
                trailing: const Icon(Icons.arrow_forward_ios, color: Colors.white54, size: 16),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => TrackDeliveryScreen(deliveryId: delivery.id),
                    ),
                  );
                },
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.accent.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Icon(
            Icons.delivery_dining_outlined,
            size: 64,
            color: AppColors.accent.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'No deliveries yet',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Create your first delivery request',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryCard(DeliveryModel delivery, BuildContext context) {
    Color statusColor = _getStatusColor(delivery.status);
    String statusText = _getStatusText(delivery.status);
    IconData statusIcon = _getStatusIcon(delivery.status);

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => TrackDeliveryScreen(deliveryId: delivery.id),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: statusColor.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(statusIcon, color: statusColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      delivery.recipientName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      delivery.packageDescription,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.location_on_outlined, color: Colors.white.withOpacity(0.6), size: 16),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  delivery.deliveryLocation.address,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.phone_outlined, color: Colors.white.withOpacity(0.6), size: 16),
                  const SizedBox(width: 6),
                  Text(
                    delivery.recipientPhone,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'KSH ${delivery.deliveryFee.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: _getPaymentStatusColor(delivery.paymentStatus ?? 'pending'),
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getPaymentStatusColor(delivery.paymentStatus ?? 'pending').withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _getPaymentStatusText(delivery.paymentStatus ?? 'pending'),
                      style: TextStyle(
                        color: _getPaymentStatusColor(delivery.paymentStatus ?? 'pending'),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (delivery.riderName != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.person_outline, color: Colors.white.withOpacity(0.6), size: 16),
                const SizedBox(width: 6),
                Text(
                  'Rider: ${delivery.riderName}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    ),
    );
  }

  Widget _buildOrdersTab() {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Image.asset(
                  'assets/images/logosureboda.jpg',
                  width: 40,
                  height: 40,
                  errorBuilder: (context, error, stackTrace) {
                    return Icon(Icons.store, color: AppColors.accent, size: 40);
                  },
                ),
                const SizedBox(width: 12),
                const Text(
                  'All Orders',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('deliveries')
                  .where('businessId', isEqualTo: widget.user.uid)
                  .orderBy('createdAt', descending: true)
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return _buildEmptyState();
                }

                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: snapshot.data!.docs.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final delivery = DeliveryModel.fromFirestore(snapshot.data!.docs[index]);
                    return _buildDeliveryCard(delivery, context);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFAB() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 20),
      height: 56,
      child: ElevatedButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreateDeliveryStepsScreen(user: widget.user),
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.accent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 8,
          shadowColor: AppColors.accent.withOpacity(0.5),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_circle_outline, color: Colors.black),
            SizedBox(width: 12),
            Text(
              'Request New Delivery',
              style: TextStyle(
                color: Colors.black,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        border: Border(
          top: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(Icons.home_outlined, Icons.home, 'Home', 0),
              _buildNavItem(Icons.list_alt_outlined, Icons.list_alt, 'Orders', 1),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData outlinedIcon, IconData filledIcon, String label, int index) {
    bool isSelected = _selectedIndex == index;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? filledIcon : outlinedIcon,
              color: isSelected ? AppColors.accent : Colors.white.withOpacity(0.6),
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  color: AppColors.accent,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.pending:
        return Colors.orange;
      case DeliveryStatus.accepted:
        return Colors.blue;
      case DeliveryStatus.pickedUp:
        return Colors.purple;
      case DeliveryStatus.inTransit:
        return AppColors.accent;
      case DeliveryStatus.delivered:
        return Colors.green;
      case DeliveryStatus.cancelled:
        return Colors.red;
    }
  }

  Color _getPaymentStatusColor(String paymentStatus) {
    switch (paymentStatus) {
      case 'pending':
        return Colors.red; // Red for pending (money reserved)
      case 'in_transit':
        return Colors.orange; // Orange when rider picked up
      case 'completed':
        return Colors.green; // Green when delivered
      case 'cancelled':
        return Colors.grey;
      default:
        return Colors.red;
    }
  }

  String _getPaymentStatusText(String paymentStatus) {
    switch (paymentStatus) {
      case 'pending':
        return 'PENDING';
      case 'in_transit':
        return 'IN TRANSIT';
      case 'completed':
        return 'PAID';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }

  String _getStatusText(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.pending:
        return 'PENDING';
      case DeliveryStatus.accepted:
        return 'ACCEPTED';
      case DeliveryStatus.pickedUp:
        return 'PICKED UP';
      case DeliveryStatus.inTransit:
        return 'IN TRANSIT';
      case DeliveryStatus.delivered:
        return 'DELIVERED';
      case DeliveryStatus.cancelled:
        return 'CANCELLED';
    }
  }

  IconData _getStatusIcon(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.pending:
        return Icons.pending_outlined;
      case DeliveryStatus.accepted:
        return Icons.check_circle_outline;
      case DeliveryStatus.pickedUp:
        return Icons.inventory_2_outlined;
      case DeliveryStatus.inTransit:
        return Icons.local_shipping_outlined;
      case DeliveryStatus.delivered:
        return Icons.done_all;
      case DeliveryStatus.cancelled:
        return Icons.cancel_outlined;
    }
  }
}

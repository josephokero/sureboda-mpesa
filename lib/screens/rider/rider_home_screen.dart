import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user_model.dart';
import '../../models/delivery_model.dart';
import '../../utils/theme.dart';
import '../../services/auth_service.dart';
import '../../services/delivery_service.dart';
import '../../widgets/delivery_notification_dialog.dart';
import 'delivery_details_screen.dart';
import 'active_delivery_screen.dart';
import 'withdrawal_screen.dart';
import 'rider_settings_screen.dart';
import 'dart:async';

class RiderHomeScreen extends StatefulWidget {
  final UserModel user;

  const RiderHomeScreen({super.key, required this.user});

  @override
  State<RiderHomeScreen> createState() => _RiderHomeScreenState();
}

class _RiderHomeScreenState extends State<RiderHomeScreen> {
  final AuthService _authService = AuthService();
  int _selectedIndex = 0;
  bool _isOnline = true;
  StreamSubscription? _notificationSubscription;
  List<String> _shownNotifications = []; // Track shown notifications

  @override
  void initState() {
    super.initState();
    _startListeningForNotifications();
  }

  @override
  void dispose() {
    _notificationSubscription?.cancel();
    super.dispose();
  }

  void _startListeningForNotifications() {
    if (!_isOnline) return;

    _notificationSubscription = DeliveryService.getRiderNotificationsStream(widget.user.id)
        .listen((notifications) {
      for (var notification in notifications) {
        String notificationId = notification['id'];
        
        // Only show if not already shown
        if (!_shownNotifications.contains(notificationId)) {
          _shownNotifications.add(notificationId);
          _showDeliveryNotification(notification);
        }
      }
    });
  }

  void _showDeliveryNotification(Map<String, dynamic> notification) {
    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => DeliveryNotificationDialog(
        notification: notification,
        onAccepted: () async {
          Navigator.pop(context);
          try {
            await DeliveryService.acceptDelivery(
              notification['deliveryId'],
              widget.user.id,
              widget.user.fullName,
            );

            // Get the delivery and navigate to active delivery screen
            final deliveryDoc = await FirebaseFirestore.instance
                .collection('deliveries')
                .doc(notification['deliveryId'])
                .get();
            
            final delivery = DeliveryModel.fromFirestore(deliveryDoc);

            if (mounted) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ActiveDeliveryScreen(
                    delivery: delivery,
                    rider: widget.user,
                  ),
                ),
              );
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Error accepting delivery: $e'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        },
        onRejected: () async {
          Navigator.pop(context);
          try {
            await DeliveryService.rejectDelivery(
              notification['deliveryId'],
              widget.user.id,
            );
          } catch (e) {
            print('Error rejecting delivery: $e');
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: _selectedIndex == 0
          ? _buildHomeTab()
          : _selectedIndex == 1
              ? _buildDeliveriesTab()
              : _buildEarningsTab(),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildHomeTab() {
    return SafeArea(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            _buildOnlineToggle(),
            const SizedBox(height: 24),
            _buildEarningsCard(),
            const SizedBox(height: 24),
            _buildStatsCards(),
            const SizedBox(height: 24),
            _buildAvailableDeliveries(),
            const SizedBox(height: 24),
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
              // Logo with online indicator
              Stack(
                children: [
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
                          return Icon(Icons.motorcycle, color: AppColors.accent);
                        },
                      ),
                    ),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: _isOnline ? Colors.green : Colors.grey,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.black, width: 2),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
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
                    Row(
                      children: [
                        Icon(
                          Icons.star,
                          color: Colors.amber,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${widget.user.rating?.toStringAsFixed(1) ?? '5.0'}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '• ${widget.user.totalDeliveries ?? 0} trips',
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
                            builder: (context) => RiderSettingsScreen(user: widget.user),
                          ),
                        );
                      });
                    },
                  ),
                  PopupMenuItem(
                    child: Text('Vehicle Info', style: TextStyle(color: Colors.white)),
                    onTap: () {
                      Future.delayed(Duration.zero, () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => RiderSettingsScreen(user: widget.user),
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
                            builder: (context) => RiderSettingsScreen(user: widget.user),
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
            _isOnline ? 'Ready for deliveries!' : 'You\'re offline',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _isOnline ? 'Accept orders to start earning' : 'Go online to receive delivery requests',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOnlineToggle() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: _isOnline
                ? [Colors.green.withOpacity(0.2), Colors.green.withOpacity(0.05)]
                : [Colors.grey.withOpacity(0.2), Colors.grey.withOpacity(0.05)],
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isOnline ? Colors.green.withOpacity(0.5) : Colors.grey.withOpacity(0.3),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _isOnline ? Colors.green.withOpacity(0.2) : Colors.grey.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _isOnline ? Icons.power_settings_new : Icons.power_settings_new_outlined,
                color: _isOnline ? Colors.green : Colors.grey,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _isOnline ? 'You\'re Online' : 'You\'re Offline',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    _isOnline ? 'Receiving delivery requests' : 'Tap to go online',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            Switch(
              value: _isOnline,
              onChanged: (value) async {
                setState(() {
                  _isOnline = value;
                });
                
                // Update online status in Firebase
                try {
                  await FirebaseFirestore.instance
                      .collection('users')
                      .doc(widget.user.id)
                      .update({'isOnline': value});
                  
                  if (value) {
                    // Start listening for notifications
                    _startListeningForNotifications();
                  } else {
                    // Stop listening
                    _notificationSubscription?.cancel();
                    _notificationSubscription = null;
                  }
                } catch (e) {
                  print('Error updating online status: $e');
                }
              },
              activeColor: Colors.green,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEarningsCard() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.accent, AppColors.accent.withOpacity(0.7)],
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Available Balance',
                  style: TextStyle(
                    color: Colors.black87,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.account_balance_wallet, color: Colors.black87, size: 14),
                      SizedBox(width: 6),
                      Text(
                        'Wallet',
                        style: TextStyle(
                          color: Colors.black87,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'KSH ${widget.user.walletBalance?.toStringAsFixed(2) ?? '0.00'}',
              style: const TextStyle(
                color: Colors.black,
                fontSize: 36,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => WithdrawalScreen(user: widget.user),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.payment, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Withdraw to M-Pesa',
                    style: TextStyle(
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
  }

  Widget _buildStatsCards() {
    return StreamBuilder<QuerySnapshot>(
      stream: FirebaseFirestore.instance
          .collection('deliveries')
          .where('riderId', isEqualTo: widget.user.uid)
          .snapshots(),
      builder: (context, snapshot) {
        int completedToday = 0;
        double earnedToday = 0.0;

        if (snapshot.hasData) {
          final today = DateTime.now();
          for (var doc in snapshot.data!.docs) {
            final data = doc.data() as Map<String, dynamic>;
            final deliveredAt = data['deliveredAt'];
            if (deliveredAt != null) {
              final deliveredDate = (deliveredAt as Timestamp).toDate();
              if (deliveredDate.year == today.year &&
                  deliveredDate.month == today.month &&
                  deliveredDate.day == today.day) {
                completedToday++;
                earnedToday += (data['deliveryFee'] ?? 0.0).toDouble();
              }
            }
          }
        }

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Today\'s\nDeliveries',
                  completedToday.toString(),
                  Icons.local_shipping_outlined,
                  Colors.blue,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Today\'s\nEarnings',
                  'KSH ${earnedToday.toStringAsFixed(0)}',
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

  Widget _buildAvailableDeliveries() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Available Deliveries',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (_isOnline)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.withOpacity(0.5)),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.wifi, color: Colors.green, size: 12),
                      SizedBox(width: 4),
                      Text(
                        'LIVE',
                        style: TextStyle(
                          color: Colors.green,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance
              .collection('deliveries')
              .where('status', isEqualTo: 'pending')
              .orderBy('createdAt', descending: true)
              .limit(10)
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
                return _buildAvailableDeliveryCard(delivery, context);
              },
            );
          },
        ),
      ],
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
            _isOnline ? Icons.hourglass_empty : Icons.power_settings_new,
            size: 64,
            color: AppColors.accent.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            _isOnline ? 'No deliveries available' : 'You\'re offline',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _isOnline ? 'New requests will appear here' : 'Go online to see available deliveries',
            style: TextStyle(
              color: Colors.white.withOpacity(0.6),
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAvailableDeliveryCard(DeliveryModel delivery, BuildContext context) {
    // TODO: Calculate distance from rider's location
    double distance = 2.5; // Placeholder

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.accent.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.accent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.store, color: AppColors.accent, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      delivery.businessName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${distance.toStringAsFixed(1)} km away',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'KSH ${delivery.deliveryFee.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: AppColors.accent,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Delivery fee',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Divider(color: Colors.white.withOpacity(0.1)),
          const SizedBox(height: 12),
          _buildLocationRow(
            'Pickup',
            delivery.pickupLocation.address,
            Colors.blue,
            Icons.place_outlined,
          ),
          const SizedBox(height: 8),
          _buildLocationRow(
            'Dropoff',
            delivery.deliveryLocation.address,
            AppColors.accent,
            Icons.location_on,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DeliveryDetailsScreen(
                          delivery: delivery,
                          rider: widget.user,
                        ),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Colors.white.withOpacity(0.3)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text(
                    'Details',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: () async {
                    await _acceptDelivery(delivery, context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle, color: Colors.black, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Accept',
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocationRow(String label, String address, Color color, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(icon, color: color, size: 16),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                address,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDeliveriesTab() {
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
                    return Icon(Icons.motorcycle, color: AppColors.accent, size: 40);
                  },
                ),
                const SizedBox(width: 12),
                const Text(
                  'My Deliveries',
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
                  .where('riderId', isEqualTo: widget.user.uid)
                  .orderBy('createdAt', descending: true)
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return _buildEmptyDeliveriesState();
                }

                return ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: snapshot.data!.docs.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final delivery = DeliveryModel.fromFirestore(snapshot.data!.docs[index]);
                    return _buildMyDeliveryCard(delivery);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyDeliveriesState() {
    return Center(
      child: Container(
        margin: const EdgeInsets.all(20),
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppColors.cardDark,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.delivery_dining_outlined, size: 64, color: AppColors.accent.withOpacity(0.5)),
            const SizedBox(height: 16),
            const Text(
              'No deliveries yet',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Accept orders to start earning',
              style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyDeliveryCard(DeliveryModel delivery) {
    Color statusColor = _getStatusColor(delivery.status);
    String statusText = _getStatusText(delivery.status);

    return Container(
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                delivery.businessName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
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
          Text(
            delivery.recipientName,
            style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
          ),
          const SizedBox(height: 8),
          Text(
            delivery.deliveryLocation.address,
            style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'KSH ${delivery.deliveryFee.toStringAsFixed(0)}',
                style: TextStyle(
                  color: AppColors.accent,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (delivery.status == DeliveryStatus.accepted || delivery.status == DeliveryStatus.pickedUp)
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DeliveryDetailsScreen(
                          delivery: delivery,
                          rider: widget.user,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: Text(
                    delivery.status == DeliveryStatus.accepted ? 'View Details' : 'View Details',
                    style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEarningsTab() {
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
                    return Icon(Icons.payments, color: AppColors.accent, size: 40);
                  },
                ),
                const SizedBox(width: 12),
                const Text(
                  'Earnings',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _buildEarningsCard(),
          ),
          const SizedBox(height: 24),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Recent Transactions',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppColors.cardDark,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long_outlined, size: 64, color: AppColors.accent.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  const Text(
                    'No transactions yet',
                    style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Complete deliveries to see earnings',
                    style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
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
              _buildNavItem(Icons.list_alt_outlined, Icons.list_alt, 'Deliveries', 1),
              _buildNavItem(Icons.payments_outlined, Icons.payments, 'Earnings', 2),
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? filledIcon : outlinedIcon,
              color: isSelected ? AppColors.accent : Colors.white.withOpacity(0.6),
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppColors.accent : Colors.white.withOpacity(0.6),
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _acceptDelivery(DeliveryModel delivery, BuildContext context) async {
    try {
      await FirebaseFirestore.instance.collection('deliveries').doc(delivery.id).update({
        'riderId': widget.user.uid,
        'riderName': widget.user.fullName,
        'status': 'accepted',
        'acceptedAt': Timestamp.now(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Delivery accepted! Check your deliveries tab.'),
            backgroundColor: Colors.green,
          ),
        );
        setState(() {
          _selectedIndex = 1; // Switch to deliveries tab
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error accepting delivery: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
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
}

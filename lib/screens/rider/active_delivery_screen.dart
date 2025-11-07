import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/delivery_model.dart';
import '../../models/user_model.dart';
import '../../services/delivery_service.dart';
import '../../services/location_service.dart';
import '../../utils/theme.dart';
import '../../widgets/delivery_route_map.dart';
import '../chat_screen.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';

class ActiveDeliveryScreen extends StatefulWidget {
  final DeliveryModel delivery;
  final UserModel rider;

  const ActiveDeliveryScreen({
    super.key,
    required this.delivery,
    required this.rider,
  });

  @override
  State<ActiveDeliveryScreen> createState() => _ActiveDeliveryScreenState();
}

class _ActiveDeliveryScreenState extends State<ActiveDeliveryScreen> {
  Timer? _locationTimer;
  bool _isUpdatingLocation = false;

  @override
  void initState() {
    super.initState();
    // Start tracking location when trip is active
    if (widget.delivery.status == DeliveryStatus.pickedUp) {
      _startLocationTracking();
    }
  }

  @override
  void dispose() {
    _locationTimer?.cancel();
    super.dispose();
  }

  void _startLocationTracking() {
    // Update location every 10 seconds
    _locationTimer = Timer.periodic(const Duration(seconds: 10), (timer) async {
      if (!_isUpdatingLocation) {
        _isUpdatingLocation = true;
        try {
          Position? position = await LocationService.getCurrentLocation();
          if (position != null) {
            await DeliveryService.updateRiderLocation(
              widget.delivery.id,
              position.latitude,
              position.longitude,
            );
          }
        } catch (e) {
          print('Error updating location: $e');
        } finally {
          _isUpdatingLocation = false;
        }
      }
    });
  }

  void _stopLocationTracking() {
    _locationTimer?.cancel();
  }

  Future<void> _startTrip() async {
    try {
      await DeliveryService.startTrip(widget.delivery.id);
      _startLocationTracking();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Trip started! Navigate to delivery location'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _completeDelivery() async {
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: const Text('Complete Delivery?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Have you delivered the package to the recipient?',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Not Yet'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
            ),
            child: const Text('Yes, Complete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await DeliveryService.completeDelivery(widget.delivery.id);
        _stopLocationTracking();
        
        if (mounted) {
          // Show rating dialog
          await _showRatingDialog();
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Delivery completed! +KSh ${widget.delivery.deliveryFee} added to balance'),
              backgroundColor: Colors.green,
            ),
          );
          
          Navigator.pop(context);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _showRatingDialog() async {
    double rating = 5.0;
    String review = '';

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: const Text('Rate Business', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'How was your experience with this business?',
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < rating ? Icons.star : Icons.star_border,
                    color: AppColors.accent,
                    size: 32,
                  ),
                  onPressed: () {
                    setState(() => rating = index + 1.0);
                  },
                );
              }),
            ),
            const SizedBox(height: 16),
            TextField(
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Leave a review (optional)',
                hintStyle: TextStyle(color: Colors.grey[600]),
                filled: true,
                fillColor: AppColors.black,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
              maxLines: 3,
              onChanged: (value) => review = value,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Skip'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await DeliveryService.rateBusiness(
                  widget.delivery.id,
                  rating,
                  review,
                );
                Navigator.pop(context);
              } catch (e) {
                print('Error rating business: $e');
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accent,
              foregroundColor: Colors.black,
            ),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Future<void> _callBusiness() async {
    // Get business phone from Firebase
    final Uri phoneUri = Uri.parse('tel:${widget.delivery.recipientPhone}');
    if (await canLaunchUrl(phoneUri)) {
      await launchUrl(phoneUri);
    }
  }

  Future<void> _openChat() async {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChatScreen(
          deliveryId: widget.delivery.id,
          currentUser: widget.rider,
          otherUserId: widget.delivery.businessId,
          otherUserName: widget.delivery.businessName,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.cardDark,
        title: const Text('Active Delivery', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone, color: Colors.white),
            onPressed: _callBusiness,
            tooltip: 'Call Business',
          ),
          IconButton(
            icon: const Icon(Icons.chat, color: Colors.white),
            onPressed: _openChat,
            tooltip: 'Chat',
          ),
        ],
      ),
      body: StreamBuilder<DeliveryModel>(
        stream: DeliveryService.getDeliveryStream(widget.delivery.id),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          final delivery = snapshot.data!;

          return SingleChildScrollView(
            child: Column(
              children: [
                // Status indicator
                Container(
                  padding: const EdgeInsets.all(16),
                  color: _getStatusColor(delivery.status),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(_getStatusIcon(delivery.status), color: Colors.white),
                      const SizedBox(width: 8),
                      Text(
                        _getStatusText(delivery.status),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Route Map
                      DeliveryRouteMap(
                        pickupLat: delivery.pickupLocation.latitude,
                        pickupLng: delivery.pickupLocation.longitude,
                        deliveryLat: delivery.deliveryLocation.latitude,
                        deliveryLng: delivery.deliveryLocation.longitude,
                        pickupAddress: delivery.pickupLocation.address,
                        deliveryAddress: delivery.deliveryLocation.address,
                      ),

                      const SizedBox(height: 20),

                      // Delivery Fee
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Delivery Fee',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              'KSh ${delivery.deliveryFee.toStringAsFixed(2)}',
                              style: TextStyle(
                                color: AppColors.accent,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Package Details
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Package Details',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _buildDetailRow('Description', delivery.packageDescription),
                            _buildDetailRow('Weight', '${delivery.packageWeight} kg'),
                            _buildDetailRow('Recipient', delivery.recipientName),
                            _buildDetailRow('Phone', delivery.recipientPhone),
                            if (delivery.specialInstructions != null)
                              _buildDetailRow('Instructions', delivery.specialInstructions!),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Action Buttons
                      if (delivery.status == DeliveryStatus.accepted)
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton.icon(
                            onPressed: _startTrip,
                            icon: const Icon(Icons.play_arrow, size: 28),
                            label: const Text(
                              'START TRIP',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),

                      if (delivery.status == DeliveryStatus.pickedUp)
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton.icon(
                            onPressed: _completeDelivery,
                            icon: const Icon(Icons.check_circle, size: 28),
                            label: const Text(
                              'COMPLETE DELIVERY',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accent,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.accepted:
        return Colors.blue;
      case DeliveryStatus.pickedUp:
        return Colors.orange;
      case DeliveryStatus.delivered:
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.accepted:
        return Icons.check_circle;
      case DeliveryStatus.pickedUp:
        return Icons.local_shipping;
      case DeliveryStatus.delivered:
        return Icons.done_all;
      default:
        return Icons.pending;
    }
  }

  String _getStatusText(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.accepted:
        return 'Accepted - Go to Pickup';
      case DeliveryStatus.pickedUp:
        return 'In Transit - Delivering';
      case DeliveryStatus.delivered:
        return 'Delivered';
      default:
        return 'Unknown Status';
    }
  }
}

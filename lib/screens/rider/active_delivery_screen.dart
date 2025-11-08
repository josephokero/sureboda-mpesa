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

  Future<void> _abortDelivery() async {
    // Show reason selection dialog
    String? reason = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: const Text('Abort Delivery', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Please select a reason for aborting this delivery:',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 16),
            _buildReasonOption(context, 'Vehicle breakdown'),
            _buildReasonOption(context, 'Emergency'),
            _buildReasonOption(context, 'Wrong package'),
            _buildReasonOption(context, 'Safety concerns'),
            _buildReasonOption(context, 'Other'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );

    if (reason == null) return;

    // If "Other" is selected, show text input
    if (reason == 'Other') {
      TextEditingController reasonController = TextEditingController();
      String? customReason = await showDialog<String>(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: AppColors.cardDark,
          title: const Text('Specify Reason', style: TextStyle(color: Colors.white)),
          content: TextField(
            controller: reasonController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Enter reason...',
              hintStyle: TextStyle(color: Colors.grey[600]),
              filled: true,
              fillColor: AppColors.black,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none,
              ),
            ),
            maxLines: 3,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, reasonController.text),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
              ),
              child: const Text('Submit'),
            ),
          ],
        ),
      );

      if (customReason == null || customReason.trim().isEmpty) return;
      reason = customReason;
    }

    // Confirm abort
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: const Text('Confirm Abort', style: TextStyle(color: Colors.white)),
        content: Text(
          'Are you sure you want to abort this delivery?\n\nReason: $reason\n\nNote: You will not receive payment for this delivery.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No, Go Back'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Yes, Abort'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await DeliveryService.abortDelivery(widget.delivery.id, reason);
        _stopLocationTracking();
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Delivery aborted. Business has been notified and refunded.'),
              backgroundColor: Colors.orange,
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

  Widget _buildReasonOption(BuildContext context, String reason) {
    return InkWell(
      onTap: () => Navigator.pop(context, reason),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: AppColors.black,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey[800]!),
        ),
        child: Row(
          children: [
            Icon(
              _getReasonIcon(reason),
              color: Colors.white70,
              size: 20,
            ),
            const SizedBox(width: 12),
            Text(
              reason,
              style: const TextStyle(color: Colors.white, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getReasonIcon(String reason) {
    switch (reason) {
      case 'Vehicle breakdown':
        return Icons.build;
      case 'Emergency':
        return Icons.emergency;
      case 'Wrong package':
        return Icons.inventory_2;
      case 'Safety concerns':
        return Icons.warning;
      case 'Other':
        return Icons.more_horiz;
      default:
        return Icons.info;
    }
  }

  Future<void> _completeDelivery() async {
    // Step 1: Show payment received confirmation
    bool? paymentReceived = await _showPaymentConfirmation();
    
    if (paymentReceived != true) return;

    // Step 2: Mark delivery as complete
    try {
      await DeliveryService.completeDelivery(widget.delivery.id);
      _stopLocationTracking();
      
      if (mounted) {
        // Step 3: Show commission breakdown
        await _showCommissionBreakdown();
        
        // Step 4: Show rating dialog
        await _showRatingDialog();
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery completed successfully!'),
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

  Future<bool?> _showPaymentConfirmation() async {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: Row(
          children: [
            Icon(
              widget.delivery.paymentMethod == 'mpesa' ? Icons.phone_android : Icons.money,
              color: AppColors.accent,
              size: 28,
            ),
            const SizedBox(width: 12),
            const Text('Receive Payment', style: TextStyle(color: Colors.white)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Have you received payment from the business?',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.accent.withOpacity(0.2), AppColors.accent.withOpacity(0.1)],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.accent.withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  Text(
                    'Amount to Receive',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'KSH ${widget.delivery.deliveryFee.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          widget.delivery.paymentMethod == 'mpesa' ? Icons.phone_android : Icons.money,
                          color: Colors.white.withOpacity(0.8),
                          size: 14,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          widget.delivery.paymentMethod == 'mpesa' ? 'M-Pesa' : 'Cash',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.8),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.orange.shade400, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Only confirm after receiving the full payment',
                      style: TextStyle(
                        color: Colors.orange.shade200,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Not Yet', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            icon: const Icon(Icons.check_circle, size: 20),
            label: const Text('Payment Received'),
          ),
        ],
      ),
    );
  }

  Future<void> _showCommissionBreakdown() async {
    double commission = widget.delivery.deliveryFee * 0.20;
    double netEarnings = widget.delivery.deliveryFee - commission;
    
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: const Text('Earnings Breakdown', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildBreakdownRow('Delivery Fee', widget.delivery.deliveryFee, Colors.green),
            const Divider(color: Colors.white24, height: 24),
            _buildBreakdownRow('Platform Commission (20%)', -commission, Colors.orange),
            const Divider(color: Colors.white24, height: 24),
            _buildBreakdownRow('Commission Owed', commission, Colors.red, isBold: true),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue.shade300, size: 18),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Pay commission via M-Pesa to keep receiving deliveries',
                      style: TextStyle(
                        color: Colors.blue.shade200,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got It'),
          ),
        ],
      ),
    );
  }

  Widget _buildBreakdownRow(String label, double amount, Color color, {bool isBold = false}) {
    bool isNegative = amount < 0;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: isBold ? 16 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          '${isNegative ? '-' : ''}KSH ${amount.abs().toStringAsFixed(2)}',
          style: TextStyle(
            color: color,
            fontSize: isBold ? 18 : 16,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Future<void> _completeDeliveryOLD() async {
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

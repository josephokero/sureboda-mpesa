import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/delivery_model.dart';
import '../../utils/theme.dart';

class TrackDeliveryScreen extends StatelessWidget {
  final String deliveryId;

  const TrackDeliveryScreen({super.key, required this.deliveryId});

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
          'Track Delivery',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance
            .collection('deliveries')
            .doc(deliveryId)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || !snapshot.data!.exists) {
            return const Center(
              child: Text(
                'Delivery not found',
                style: TextStyle(color: Colors.white),
              ),
            );
          }

          final delivery = DeliveryModel.fromFirestore(snapshot.data!);

          return SingleChildScrollView(
            child: Column(
              children: [
                _buildMapPlaceholder(),
                _buildDeliveryInfo(delivery),
                _buildStatusTimeline(delivery),
                if (delivery.riderName != null) _buildRiderInfo(delivery),
                _buildLocationDetails(delivery),
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMapPlaceholder() {
    return Container(
      height: 300,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Stack(
        children: [
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.map_outlined,
                  size: 80,
                  color: AppColors.accent.withOpacity(0.5),
                ),
                const SizedBox(height: 16),
                Text(
                  'Live Map Tracking',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Google Maps integration coming soon',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            top: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Row(
                children: [
                  Icon(Icons.wifi, color: Colors.white, size: 16),
                  SizedBox(width: 6),
                  Text(
                    'LIVE',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryInfo(DeliveryModel delivery) {
    Color statusColor = _getStatusColor(delivery.status);
    String statusText = _getStatusText(delivery.status);

    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Delivery Status',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: statusColor.withOpacity(0.5)),
                    ),
                    child: Text(
                      statusText,
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Delivery Fee',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'KSH ${delivery.deliveryFee.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: AppColors.accent,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white24),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.inventory_2_outlined, 'Package', delivery.packageDescription),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.person_outline, 'Recipient', delivery.recipientName),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.phone_outlined, 'Phone', delivery.recipientPhone),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.accent, size: 20),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Colors.white54,
                fontSize: 11,
              ),
            ),
            Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatusTimeline(DeliveryModel delivery) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Delivery Timeline',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          _buildTimelineItem(
            'Order Created',
            _formatDateTime(delivery.createdAt),
            true,
            Icons.check_circle,
            Colors.green,
          ),
          if (delivery.acceptedAt != null)
            _buildTimelineItem(
              'Accepted by Rider',
              _formatDateTime(delivery.acceptedAt!),
              true,
              Icons.check_circle,
              Colors.blue,
            ),
          if (delivery.pickedUpAt != null)
            _buildTimelineItem(
              'Package Picked Up',
              _formatDateTime(delivery.pickedUpAt!),
              true,
              Icons.check_circle,
              Colors.purple,
            ),
          if (delivery.deliveredAt != null)
            _buildTimelineItem(
              'Delivered',
              _formatDateTime(delivery.deliveredAt!),
              true,
              Icons.check_circle,
              Colors.green,
              isLast: true,
            )
          else
            _buildTimelineItem(
              'Awaiting Delivery',
              'In progress',
              false,
              Icons.radio_button_unchecked,
              Colors.white54,
              isLast: true,
            ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(
    String title,
    String time,
    bool isCompleted,
    IconData icon,
    Color color, {
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Icon(icon, color: color, size: 24),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: isCompleted ? color : Colors.white24,
              ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: isCompleted ? Colors.white : Colors.white54,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                time,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.5),
                  fontSize: 12,
                ),
              ),
              if (!isLast) const SizedBox(height: 16),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRiderInfo(DeliveryModel delivery) {
    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.accent.withOpacity(0.2),
            AppColors.accent.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.accent.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Your Rider',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: Colors.black, size: 30),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      delivery.riderName!,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        const Text(
                          '4.9',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          ' • Motorcycle',
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
                icon: Icon(Icons.phone, color: AppColors.accent, size: 28),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.1),
                  shape: const CircleBorder(),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocationDetails(DeliveryModel delivery) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Locations',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildLocationCard(
            'Pickup Location',
            delivery.pickupLocation.address,
            Colors.blue,
            Icons.place_outlined,
          ),
          const SizedBox(height: 12),
          _buildLocationCard(
            'Delivery Location',
            delivery.deliveryLocation.address,
            AppColors.accent,
            Icons.location_on,
          ),
        ],
      ),
    );
  }

  Widget _buildLocationCard(String label, String address, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  address,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
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

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes} min ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} hours ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
    }
  }
}

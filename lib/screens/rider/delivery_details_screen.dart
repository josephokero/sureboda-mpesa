import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/delivery_model.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import '../../services/location_service.dart';

class DeliveryDetailsScreen extends StatefulWidget {
  final DeliveryModel delivery;
  final UserModel rider;

  const DeliveryDetailsScreen({
    super.key,
    required this.delivery,
    required this.rider,
  });

  @override
  State<DeliveryDetailsScreen> createState() => _DeliveryDetailsScreenState();
}

class _DeliveryDetailsScreenState extends State<DeliveryDetailsScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  final Set<Marker> _markers = {};
  final Set<Polyline> _polylines = {};

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  Future<void> _initializeMap() async {
    // Request location permission
    bool hasPermission = await LocationService.requestLocationPermission();
    
    if (hasPermission) {
      _currentPosition = await LocationService.getCurrentLocation();
      setState(() {});
    }

    // Add markers for pickup and delivery locations
    _markers.add(
      Marker(
        markerId: const MarkerId('pickup'),
        position: LatLng(
          widget.delivery.pickupLocation.latitude,
          widget.delivery.pickupLocation.longitude,
        ),
        infoWindow: InfoWindow(
          title: 'Pickup Location',
          snippet: widget.delivery.pickupLocation.address,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ),
    );

    _markers.add(
      Marker(
        markerId: const MarkerId('delivery'),
        position: LatLng(
          widget.delivery.deliveryLocation.latitude,
          widget.delivery.deliveryLocation.longitude,
        ),
        infoWindow: InfoWindow(
          title: 'Delivery Location',
          snippet: widget.delivery.deliveryLocation.address,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ),
    );

    if (_currentPosition != null) {
      _markers.add(
        Marker(
          markerId: const MarkerId('current'),
          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          infoWindow: const InfoWindow(title: 'Your Location'),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
        ),
      );
    }

    // Draw route line between pickup and delivery
    _polylines.add(
      Polyline(
        polylineId: const PolylineId('route'),
        points: [
          LatLng(
            widget.delivery.pickupLocation.latitude,
            widget.delivery.pickupLocation.longitude,
          ),
          LatLng(
            widget.delivery.deliveryLocation.latitude,
            widget.delivery.deliveryLocation.longitude,
          ),
        ],
        color: AppColors.accent,
        width: 4,
      ),
    );

    setState(() {});
  }

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
          'Delivery Details',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location, color: Colors.white),
            onPressed: () {
              if (_currentPosition != null && _mapController != null) {
                _mapController!.animateCamera(
                  CameraUpdate.newLatLng(
                    LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                  ),
                );
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildMap(),
            _buildDeliveryInfo(context),
            _buildLocations(),
            _buildPackageInfo(),
            _buildRecipientInfo(context),
            if (widget.delivery.specialInstructions != null) _buildSpecialInstructions(),
            const SizedBox(height: 20),
          ],
        ),
      ),
      bottomNavigationBar: _buildActionButtons(context),
    );
  }

  Widget _buildMap() {
    return Container(
      height: 300,
      color: AppColors.cardDark,
      child: _markers.isEmpty
          ? Center(
              child: CircularProgressIndicator(color: AppColors.accent),
            )
          : GoogleMap(
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  widget.delivery.pickupLocation.latitude,
                  widget.delivery.pickupLocation.longitude,
                ),
                zoom: 13,
              ),
              onMapCreated: (controller) => _mapController = controller,
              markers: _markers,
              polylines: _polylines,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
              onCameraMove: (_) {},
            ),
    );
  }

  Widget _buildDeliveryInfo(BuildContext context) {
    Color statusColor = _getStatusColor(widget.delivery.status);
    String statusText = _getStatusText(widget.delivery.status);

    return Container(
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.accent, AppColors.accent.withOpacity(0.7)],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Delivery Fee',
                    style: TextStyle(
                      color: Colors.black87,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    'KSH ${widget.delivery.deliveryFee.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: Colors.black,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Icon(Icons.access_time, color: Colors.black87, size: 20),
                    const SizedBox(height: 4),
                    Text(
                      '~15 min',
                      style: TextStyle(
                        color: Colors.black,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Business',
                      style: TextStyle(
                        color: Colors.black87,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      widget.delivery.businessName,
                      style: const TextStyle(
                        color: Colors.black,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.phone, color: Colors.black),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.3),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocations() {
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
            'Route',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildLocationItem(
            'Pickup',
            widget.delivery.pickupLocation.address,
            Icons.store,
            Colors.blue,
            true,
          ),
          Container(
            margin: const EdgeInsets.only(left: 20),
            height: 30,
            width: 2,
            color: Colors.white24,
          ),
          _buildLocationItem(
            'Dropoff',
            widget.delivery.deliveryLocation.address,
            Icons.location_on,
            AppColors.accent,
            false,
          ),
        ],
      ),
    );
  }

  Widget _buildLocationItem(
    String label,
    String address,
    IconData icon,
    Color color,
    bool isPickup,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                address,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () {},
          icon: Icon(Icons.navigation_outlined, color: color, size: 20),
        ),
      ],
    );
  }

  Widget _buildPackageInfo() {
    return Container(
      margin: const EdgeInsets.all(20),
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
            'Package Information',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.inventory_2_outlined, 'Description', widget.delivery.packageDescription),
          const SizedBox(height: 12),
          _buildInfoRow(
            Icons.scale,
            'Weight',
            '${widget.delivery.packageWeight.toStringAsFixed(1)} kg',
          ),
        ],
      ),
    );
  }

  Widget _buildRecipientInfo(BuildContext context) {
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
            'Recipient',
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
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.accent.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.person, color: AppColors.accent, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.delivery.recipientName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      widget.delivery.recipientPhone,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () {},
                icon: Icon(Icons.phone, color: AppColors.accent, size: 24),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.accent.withOpacity(0.1),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSpecialInstructions() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.orange.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: Colors.orange, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Special Instructions',
                style: TextStyle(
                  color: Colors.orange,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            widget.delivery.specialInstructions!,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
            ),
          ),
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
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
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

  Widget _buildActionButtons(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
      ),
      child: SafeArea(
        child: _buildStatusButton(context),
      ),
    );
  }

  Widget _buildStatusButton(BuildContext context) {
    if (widget.delivery.status == DeliveryStatus.accepted) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: () => _updateStatus(context, DeliveryStatus.pickedUp),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.check_circle, color: Colors.white),
              SizedBox(width: 12),
              Text(
                'Confirm Pickup',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    } else if (widget.delivery.status == DeliveryStatus.pickedUp) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: () => _updateStatus(context, DeliveryStatus.inTransit),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.purple,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.local_shipping, color: Colors.white),
              SizedBox(width: 12),
              Text(
                'Start Delivery',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    } else if (widget.delivery.status == DeliveryStatus.inTransit) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: () => _updateStatus(context, DeliveryStatus.delivered),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.done_all, color: Colors.white),
              SizedBox(width: 12),
              Text(
                'Complete Delivery',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container();
  }

  Future<void> _updateStatus(BuildContext context, DeliveryStatus newStatus) async {
    try {
      Map<String, dynamic> updateData = {'status': _statusToString(newStatus)};
      
      if (newStatus == DeliveryStatus.pickedUp) {
        updateData['pickedUpAt'] = Timestamp.now();
      } else if (newStatus == DeliveryStatus.delivered) {
        updateData['deliveredAt'] = Timestamp.now();
      }

      await FirebaseFirestore.instance
          .collection('deliveries')
          .doc(widget.delivery.id)
          .update(updateData);

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Delivery status updated to ${_getStatusText(newStatus)}'),
            backgroundColor: Colors.green,
          ),
        );
        
        if (newStatus == DeliveryStatus.delivered) {
          Navigator.pop(context);
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating status: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _statusToString(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.pending:
        return 'pending';
      case DeliveryStatus.accepted:
        return 'accepted';
      case DeliveryStatus.pickedUp:
        return 'pickedUp';
      case DeliveryStatus.inTransit:
        return 'inTransit';
      case DeliveryStatus.delivered:
        return 'delivered';
      case DeliveryStatus.cancelled:
        return 'cancelled';
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



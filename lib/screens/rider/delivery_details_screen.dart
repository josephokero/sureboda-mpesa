import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'dart:convert';
import '../../models/delivery_model.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import '../../services/location_service.dart';
import 'chat_screen.dart';

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
  final MapController _mapController = MapController();
  Position? _currentPosition;
  bool _isLoading = false;
  List<LatLng> _routePoints = [];
  bool _isLoadingRoute = true;

  @override
  void initState() {
    super.initState();
    _initializeMap();
    _fetchRoute();
  }

  Future<void> _initializeMap() async {
    // Request location permission
    bool hasPermission = await LocationService.requestLocationPermission();
    
    if (hasPermission) {
      _currentPosition = await LocationService.getCurrentLocation();
      if (mounted) setState(() {});
    }
  }

  Future<void> _fetchRoute() async {
    try {
      final pickupLat = widget.delivery.pickupLocation.latitude;
      final pickupLng = widget.delivery.pickupLocation.longitude;
      final dropoffLat = widget.delivery.deliveryLocation.latitude;
      final dropoffLng = widget.delivery.deliveryLocation.longitude;

      // Using Firebase Cloud Function as proxy to avoid CORS issues
      final url = Uri.parse(
        'https://us-central1-astute-empire.cloudfunctions.net/getRoute?'
        'startLat=$pickupLat&startLng=$pickupLng&endLat=$dropoffLat&endLng=$dropoffLng',
      );

      print('Fetching route from Cloud Function...');
      final response = await http.get(url);

      print('Response status: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['features'] != null && data['features'].isNotEmpty) {
          final coordinates = data['features'][0]['geometry']['coordinates'] as List;
          
          setState(() {
            _routePoints = coordinates
                .map((coord) => LatLng(coord[1] as double, coord[0] as double))
                .toList();
            _isLoadingRoute = false;
          });
          
          print('Route loaded successfully with ${_routePoints.length} points');
        } else {
          // No route found, use straight line
          print('No route found in response, using straight line');
          _useStraightLine(pickupLat, pickupLng, dropoffLat, dropoffLng);
        }
      } else {
        // API error, fallback to straight line
        print('API error: ${response.statusCode}, using straight line');
        _useStraightLine(pickupLat, pickupLng, dropoffLat, dropoffLng);
      }
    } catch (e) {
      print('Error fetching route: $e');
      // Fallback to straight line
      _useStraightLine(
        widget.delivery.pickupLocation.latitude,
        widget.delivery.pickupLocation.longitude,
        widget.delivery.deliveryLocation.latitude,
        widget.delivery.deliveryLocation.longitude,
      );
    }
  }

  void _useStraightLine(double pickupLat, double pickupLng, double dropoffLat, double dropoffLng) {
    setState(() {
      _routePoints = [
        LatLng(pickupLat, pickupLng),
        LatLng(dropoffLat, dropoffLng),
      ];
      _isLoadingRoute = false;
    });
  }

  Future<void> _makePhoneCall(String phoneNumber, String contactName) async {
    final Uri phoneUri = Uri(scheme: 'tel', path: phoneNumber);
    
    try {
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Cannot make call to $contactName'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: Unable to call $phoneNumber'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
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
              if (_currentPosition != null) {
                _mapController.move(
                  LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                  15,
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
    final pickupLatLng = LatLng(
      widget.delivery.pickupLocation.latitude,
      widget.delivery.pickupLocation.longitude,
    );
    final dropoffLatLng = LatLng(
      widget.delivery.deliveryLocation.latitude,
      widget.delivery.deliveryLocation.longitude,
    );

    // Calculate center and zoom to show both points
    final bounds = LatLngBounds(pickupLatLng, dropoffLatLng);
    final center = bounds.center;

    return Container(
      height: 350,
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.1))),
      ),
      child: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: center,
              initialZoom: 13.0,
              minZoom: 5.0,
              maxZoom: 18.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.sureboda.surebodaApp',
              ),
              // Blue route line following actual roads
              if (_routePoints.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _routePoints,
                      strokeWidth: 6.0,
                      color: Colors.blue,
                      borderStrokeWidth: 2.0,
                      borderColor: Colors.white,
                    ),
                  ],
                ),
              // Markers
              MarkerLayer(
                markers: [
                  // Pickup marker (Orange)
                  Marker(
                    point: pickupLatLng,
                    width: 60,
                    height: 60,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.orange,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.orange.withOpacity(0.5),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.store,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Dropoff marker (Blue)
                  Marker(
                    point: dropoffLatLng,
                    width: 60,
                    height: 60,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.blue,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.blue.withOpacity(0.5),
                                blurRadius: 10,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.location_on,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Current location marker if available
                  if (_currentPosition != null)
                    Marker(
                      point: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      width: 40,
                      height: 40,
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 3),
                        ),
                        child: const Icon(
                          Icons.navigation,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
          // Route loading indicator
          if (_isLoadingRoute)
            Positioned(
              top: 16,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Loading route...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          // Distance badge
          Positioned(
            top: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blue.withOpacity(0.5)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.route, color: Colors.blue, size: 16),
                  const SizedBox(width: 6),
                  Text(
                    _calculateDistance(pickupLatLng, dropoffLatLng),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
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

  String _calculateDistance(LatLng point1, LatLng point2) {
    const Distance distance = Distance();
    final km = distance.as(LengthUnit.Kilometer, point1, point2);
    return '${km.toStringAsFixed(1)} km';
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
    return Column(
      children: [
        // Business Contact Section with Chat
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.business, color: AppColors.accent, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'Business Contact',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.accent.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.store, color: AppColors.accent, size: 28),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.delivery.businessName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Pickup Location Contact',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () async {
                      // Fetch business phone number from Firestore
                      try {
                        final businessDoc = await FirebaseFirestore.instance
                            .collection('users')
                            .doc(widget.delivery.businessId)
                            .get();
                        
                        if (businessDoc.exists) {
                          final businessPhone = businessDoc.data()?['phoneNumber'] as String?;
                          if (businessPhone != null && businessPhone.isNotEmpty) {
                            _makePhoneCall(businessPhone, widget.delivery.businessName);
                          } else {
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Business phone number not available'),
                                  backgroundColor: Colors.orange,
                                ),
                              );
                            }
                          }
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
                    },
                    icon: Icon(Icons.phone, color: AppColors.accent, size: 24),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.accent.withOpacity(0.2),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ChatScreen(
                            deliveryId: widget.delivery.id!,
                            otherUserId: widget.delivery.businessId,
                            otherUserName: widget.delivery.businessName,
                            currentUserId: widget.rider.uid,
                            currentUserName: widget.rider.fullName,
                          ),
                        ),
                      );
                    },
                    icon: Icon(Icons.chat_bubble, color: AppColors.accent, size: 24),
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.accent.withOpacity(0.2),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Recipient/Delivery Person Section
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.cardDark,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.blue.withOpacity(0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.person_pin, color: Colors.blue, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'Delivery Recipient',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.blue.withOpacity(0.5)),
                    ),
                    child: const Text(
                      'DELIVER TO',
                      style: TextStyle(
                        color: Colors.blue,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person, color: Colors.blue, size: 28),
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
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.phone_android, color: Colors.blue, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              widget.delivery.recipientPhone,
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Person receiving the package',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                            fontSize: 11,
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      _makePhoneCall(
                        widget.delivery.recipientPhone,
                        widget.delivery.recipientName,
                      );
                    },
                    icon: const Icon(Icons.phone, color: Colors.blue, size: 24),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.blue.withOpacity(0.2),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
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
    // For pending deliveries - show Accept button
    if (widget.delivery.status == DeliveryStatus.pending) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: _isLoading ? null : () => _acceptDelivery(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.accent,
            disabledBackgroundColor: AppColors.accent.withOpacity(0.5),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 8,
            shadowColor: AppColors.accent.withOpacity(0.5),
          ),
          child: _isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.check_circle, color: Colors.white, size: 24),
                    SizedBox(width: 12),
                    Text(
                      'Accept Delivery',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
        ),
      );
    }
    // For accepted deliveries - show "Reached Pickup Point" button
    else if (widget.delivery.status == DeliveryStatus.accepted) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: _isLoading ? null : () => _updateStatus(context, DeliveryStatus.pickedUp),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orange,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 8,
            shadowColor: Colors.orange.withOpacity(0.5),
          ),
          child: _isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.store, color: Colors.white),
                    SizedBox(width: 12),
                    Text(
                      'Reached Pickup Point',
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
    // For picked up deliveries - show "Start Journey" button
    else if (widget.delivery.status == DeliveryStatus.pickedUp) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: _isLoading ? null : () => _updateStatus(context, DeliveryStatus.inTransit),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.purple,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 8,
            shadowColor: Colors.purple.withOpacity(0.5),
          ),
          child: _isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.directions_bike, color: Colors.white),
                    SizedBox(width: 12),
                    Text(
                      'Start Journey',
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
    // For in transit deliveries - show "Delivered" button
    else if (widget.delivery.status == DeliveryStatus.inTransit) {
      return SizedBox(
        width: double.infinity,
        height: 56,
        child: ElevatedButton(
          onPressed: _isLoading ? null : () => _showDeliveryConfirmation(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 8,
            shadowColor: Colors.green.withOpacity(0.5),
          ),
          child: _isLoading
              ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.location_on, color: Colors.white),
                    SizedBox(width: 12),
                    Text(
                      'Mark as Delivered',
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

  Future<void> _acceptDelivery(BuildContext context) async {
    setState(() => _isLoading = true);
    
    try {
      await FirebaseFirestore.instance
          .collection('deliveries')
          .doc(widget.delivery.id)
          .update({
        'status': 'accepted',
        'riderId': widget.rider.uid,
        'riderName': widget.rider.fullName,
        'acceptedAt': Timestamp.now(),
      });

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery accepted! Start your journey when ready.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
        
        // Refresh the screen to show new status
        Navigator.pop(context);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DeliveryDetailsScreen(
              delivery: widget.delivery.copyWith(
                status: DeliveryStatus.accepted,
                riderId: widget.rider.uid,
                riderName: widget.rider.fullName,
              ),
              rider: widget.rider,
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error accepting delivery: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _showDeliveryConfirmation(BuildContext context) async {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.cardDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 28),
              SizedBox(width: 12),
              Text(
                'Confirm Delivery',
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
          content: const Text(
            'Have you successfully delivered the package to the recipient?',
            style: TextStyle(color: Colors.white70, fontSize: 15),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(dialogContext);
                _completeDelivery(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Confirm', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _completeDelivery(BuildContext context) async {
    setState(() => _isLoading = true);
    
    try {
      await FirebaseFirestore.instance
          .collection('deliveries')
          .doc(widget.delivery.id)
          .update({
        'status': 'delivered',
        'deliveredAt': Timestamp.now(),
      });

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery completed! Payment will be added to your wallet.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
        
        // Show rating dialog after a short delay
        await Future.delayed(const Duration(milliseconds: 500));
        if (context.mounted) {
          _showRatingDialog(context);
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error completing delivery: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showRatingDialog(BuildContext context) {
    int rating = 5;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: AppColors.cardDark,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.star, color: Colors.amber, size: 40),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Rate the Business',
                    style: TextStyle(color: Colors.white, fontSize: 20),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    widget.delivery.businessName,
                    style: TextStyle(
                      color: AppColors.accent,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return IconButton(
                        onPressed: () {
                          setDialogState(() {
                            rating = index + 1;
                          });
                        },
                        icon: Icon(
                          index < rating ? Icons.star : Icons.star_border,
                          color: Colors.amber,
                          size: 40,
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    rating == 5
                        ? 'Excellent!'
                        : rating >= 4
                            ? 'Very Good!'
                            : rating >= 3
                                ? 'Good'
                                : 'Needs Improvement',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(dialogContext);
                    Navigator.pop(context); // Go back to rider home
                  },
                  child: const Text('Skip', style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  onPressed: () async {
                    await _submitRating(rating);
                    if (dialogContext.mounted) Navigator.pop(dialogContext);
                    if (context.mounted) Navigator.pop(context); // Go back to rider home
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Submit', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _submitRating(int rating) async {
    try {
      await FirebaseFirestore.instance.collection('reviews').add({
        'deliveryId': widget.delivery.id,
        'businessId': widget.delivery.businessId,
        'riderId': widget.rider.uid,
        'rating': rating,
        'createdAt': Timestamp.now(),
      });
    } catch (e) {
      print('Error submitting rating: $e');
    }
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



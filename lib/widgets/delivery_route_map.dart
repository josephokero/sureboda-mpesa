import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/theme.dart';

class DeliveryRouteMap extends StatefulWidget {
  final double pickupLat;
  final double pickupLng;
  final double deliveryLat;
  final double deliveryLng;
  final String pickupAddress;
  final String deliveryAddress;

  const DeliveryRouteMap({
    super.key,
    required this.pickupLat,
    required this.pickupLng,
    required this.deliveryLat,
    required this.deliveryLng,
    required this.pickupAddress,
    required this.deliveryAddress,
  });

  @override
  State<DeliveryRouteMap> createState() => _DeliveryRouteMapState();
}

class _DeliveryRouteMapState extends State<DeliveryRouteMap> {
  final MapController _mapController = MapController();
  List<LatLng> _routePoints = [];
  bool _isLoadingRoute = true;
  String _distance = '';
  String _duration = '';
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  Future<void> _loadRoute() async {
    try {
      // Use OSRM (Open Source Routing Machine) - FREE routing service
      final url = Uri.parse(
        'https://router.project-osrm.org/route/v1/driving/'
        '${widget.pickupLng},${widget.pickupLat};'
        '${widget.deliveryLng},${widget.deliveryLat}'
        '?overview=full&geometries=geojson&steps=true'
      );

      final response = await http.get(
        url,
        headers: {'User-Agent': 'SureBoda/1.0'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final route = data['routes'][0];
          final geometry = route['geometry'];
          final coordinates = geometry['coordinates'] as List;

          // Convert coordinates to LatLng
          List<LatLng> points = coordinates.map((coord) {
            return LatLng(coord[1], coord[0]); // Note: GeoJSON is [lng, lat]
          }).toList();

          // Get distance and duration
          double distanceMeters = route['distance'].toDouble();
          double durationSeconds = route['duration'].toDouble();

          setState(() {
            _routePoints = points;
            _distance = _formatDistance(distanceMeters);
            _duration = _formatDuration(durationSeconds);
            _isLoadingRoute = false;
          });

          // Fit map to show entire route
          _fitMapToRoute();
        } else {
          setState(() {
            _errorMessage = 'No route found';
            _isLoadingRoute = false;
          });
        }
      } else {
        throw Exception('Failed to load route');
      }
    } catch (e) {
      print('Error loading route: $e');
      setState(() {
        _errorMessage = 'Could not load route';
        _isLoadingRoute = false;
      });
    }
  }

  void _fitMapToRoute() {
    if (_routePoints.isEmpty) return;

    // Calculate bounds
    double minLat = _routePoints[0].latitude;
    double maxLat = _routePoints[0].latitude;
    double minLng = _routePoints[0].longitude;
    double maxLng = _routePoints[0].longitude;

    for (var point in _routePoints) {
      if (point.latitude < minLat) minLat = point.latitude;
      if (point.latitude > maxLat) maxLat = point.latitude;
      if (point.longitude < minLng) minLng = point.longitude;
      if (point.longitude > maxLng) maxLng = point.longitude;
    }

    // Add padding
    double latPadding = (maxLat - minLat) * 0.2;
    double lngPadding = (maxLng - minLng) * 0.2;

    LatLng center = LatLng(
      (minLat + maxLat) / 2,
      (minLng + maxLng) / 2,
    );

    // Calculate appropriate zoom level
    double zoom = _calculateZoom(maxLat - minLat, maxLng - minLng);

    _mapController.move(center, zoom);
  }

  double _calculateZoom(double latDiff, double lngDiff) {
    double maxDiff = latDiff > lngDiff ? latDiff : lngDiff;
    if (maxDiff > 0.5) return 10;
    if (maxDiff > 0.2) return 11;
    if (maxDiff > 0.1) return 12;
    if (maxDiff > 0.05) return 13;
    if (maxDiff > 0.02) return 14;
    return 15;
  }

  String _formatDistance(double meters) {
    if (meters < 1000) {
      return '${meters.toInt()} m';
    } else {
      return '${(meters / 1000).toStringAsFixed(1)} km';
    }
  }

  String _formatDuration(double seconds) {
    int minutes = (seconds / 60).round();
    if (minutes < 60) {
      return '$minutes min';
    } else {
      int hours = minutes ~/ 60;
      int remainingMinutes = minutes % 60;
      return '${hours}h ${remainingMinutes}min';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardDark),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            // Map with route
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: LatLng(widget.pickupLat, widget.pickupLng),
                initialZoom: 13.0,
                minZoom: 5.0,
                maxZoom: 18.0,
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.sureboda.app',
                  maxZoom: 19,
                ),
                // Route line (like Uber's blue line)
                if (_routePoints.isNotEmpty)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _routePoints,
                        color: AppColors.accent,
                        strokeWidth: 5.0,
                      ),
                    ],
                  ),
                // Markers for pickup and delivery
                MarkerLayer(
                  markers: [
                    // Pickup marker (Green)
                    Marker(
                      point: LatLng(widget.pickupLat, widget.pickupLng),
                      width: 80,
                      height: 80,
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.3),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Text(
                              'PICKUP',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const Icon(
                            Icons.location_on,
                            color: Colors.green,
                            size: 40,
                          ),
                        ],
                      ),
                    ),
                    // Delivery marker (Red)
                    Marker(
                      point: LatLng(widget.deliveryLat, widget.deliveryLng),
                      width: 80,
                      height: 80,
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.3),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Text(
                              'DELIVERY',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const Icon(
                            Icons.location_on,
                            color: Colors.red,
                            size: 40,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            
            // Loading indicator
            if (_isLoadingRoute)
              Container(
                color: Colors.black.withOpacity(0.5),
                child: const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
              ),

            // Distance and duration card at top
            if (!_isLoadingRoute && _routePoints.isNotEmpty)
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          Icon(Icons.straighten, color: AppColors.accent, size: 20),
                          const SizedBox(height: 4),
                          Text(
                            _distance,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const Text(
                            'Distance',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        width: 1,
                        height: 40,
                        color: Colors.grey[300],
                      ),
                      Column(
                        children: [
                          Icon(Icons.access_time, color: AppColors.accent, size: 20),
                          const SizedBox(height: 4),
                          Text(
                            _duration,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const Text(
                            'Duration',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

            // Error message
            if (_errorMessage.isNotEmpty)
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _errorMessage,
                    style: const TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),

            // Address info at bottom
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.circle, color: Colors.green, size: 12),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.pickupAddress,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.black87,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.circle, color: Colors.red, size: 12),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.deliveryAddress,
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.black87,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

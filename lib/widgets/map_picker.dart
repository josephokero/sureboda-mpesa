import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart' as geo;
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/location_service.dart';
import '../utils/theme.dart';

class MapPickerScreen extends StatefulWidget {
  final double? initialLat;
  final double? initialLng;
  final String title;

  const MapPickerScreen({
    super.key,
    this.initialLat,
    this.initialLng,
    this.title = 'Pick Location',
  });

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  final MapController _mapController = MapController();
  LatLng? _selectedLocation;
  Position? _currentPosition;
  bool _isLoading = true;
  String _selectedAddress = '';
  final TextEditingController _searchController = TextEditingController();
  List<Map<String, dynamic>> _searchResults = []; // Store full location data
  List<String> _searchSuggestions = [];
  bool _showSuggestions = false;

  @override
  void initState() {
    super.initState();
    _initializeLocation();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _initializeLocation() async {
    try {
      // Try to get current location
      try {
        _currentPosition = await LocationService.getCurrentLocation();
      } catch (e) {
        print('Could not get current location: $e');
      }
      
      // Use provided initial location or current location or default to Nairobi
      if (widget.initialLat != null && widget.initialLng != null) {
        _selectedLocation = LatLng(widget.initialLat!, widget.initialLng!);
      } else if (_currentPosition != null) {
        _selectedLocation = LatLng(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
        );
      } else {
        // Default to Nairobi center
        _selectedLocation = LatLng(-1.286389, 36.817223);
      }
      
      await _getAddressFromLatLng(_selectedLocation!);
      
      setState(() => _isLoading = false);
    } catch (e) {
      print('Error initializing location: $e');
      setState(() {
        _selectedLocation = LatLng(-1.286389, 36.817223);
        _selectedAddress = 'Nairobi, Kenya';
        _isLoading = false;
      });
    }
  }

  Future<void> _getAddressFromLatLng(LatLng position) async {
    try {
      List<geo.Placemark> placemarks = await geo.placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );
      
      if (placemarks.isNotEmpty) {
        geo.Placemark place = placemarks[0];
        setState(() {
          _selectedAddress = '${place.street}, ${place.locality}, ${place.country}';
          if (_selectedAddress.startsWith(', ')) {
            _selectedAddress = '${place.locality}, ${place.country}';
          }
        });
      }
    } catch (e) {
      setState(() {
        _selectedAddress = '${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)}';
      });
    }
  }

  Future<void> _searchLocation(String query) async {
    if (query.length < 3) {
      setState(() {
        _searchSuggestions = [];
        _searchResults = [];
        _showSuggestions = false;
      });
      return;
    }

    try {
      // Use Nominatim API (OpenStreetMap) for detailed location search
      // This gives us results like "Deliverance Church Kitengela", "Kitengela Mall", etc.
      final url = Uri.parse(
        'https://nominatim.openstreetmap.org/search?'
        'q=${Uri.encodeComponent(query)},Kenya&'
        'format=json&'
        'addressdetails=1&'
        'limit=10&'
        'countrycodes=ke'
      );
      
      final response = await http.get(
        url,
        headers: {
          'User-Agent': 'SureBoda/1.0',
          'Accept': 'application/json',
        },
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> results = json.decode(response.body);
        List<String> suggestions = [];
        List<Map<String, dynamic>> locationData = [];
        
        for (var result in results) {
          String displayName = result['display_name'] ?? '';
          double lat = double.parse(result['lat'].toString());
          double lon = double.parse(result['lon'].toString());
          
          // Extract meaningful parts of the address
          var address = result['address'] ?? {};
          String suggestion = '';
          
          // Build a clean suggestion like: "Deliverance Church, Kitengela"
          if (address['amenity'] != null) {
            suggestion = address['amenity'];
          } else if (address['shop'] != null) {
            suggestion = address['shop'];
          } else if (address['building'] != null) {
            suggestion = address['building'];
          } else if (address['road'] != null) {
            suggestion = address['road'];
          } else if (address['neighbourhood'] != null) {
            suggestion = address['neighbourhood'];
          } else if (address['suburb'] != null) {
            suggestion = address['suburb'];
          }
          
          // Add locality/town
          if (address['town'] != null || address['city'] != null || address['suburb'] != null) {
            String locality = address['town'] ?? address['city'] ?? address['suburb'] ?? '';
            if (suggestion.isNotEmpty && locality.isNotEmpty) {
              suggestion += ', $locality';
            } else if (locality.isNotEmpty) {
              suggestion = locality;
            }
          }
          
          // Fallback to display name if no good parts found
          if (suggestion.isEmpty) {
            // Get first 2-3 meaningful parts from display name
            List<String> parts = displayName.split(',').map((e) => e.trim()).toList();
            suggestion = parts.take(2).join(', ');
          }
          
          if (suggestion.isNotEmpty && !suggestions.contains(suggestion)) {
            suggestions.add(suggestion);
            locationData.add({
              'name': suggestion,
              'lat': lat,
              'lon': lon,
              'display_name': displayName,
            });
          }
        }
        
        setState(() {
          _searchSuggestions = suggestions;
          _searchResults = locationData;
          _showSuggestions = suggestions.isNotEmpty;
        });
      } else {
        throw Exception('Failed to search location');
      }
    } catch (e) {
      print('Error searching location: $e');
      // Fallback to popular locations on error
      List<String> fallbackSuggestions = _getPopularLocations(query);
      setState(() {
        _searchSuggestions = fallbackSuggestions;
        _searchResults = [];
        _showSuggestions = fallbackSuggestions.isNotEmpty;
      });
    }
  }

  List<String> _getPopularLocations(String query) {
    // No hardcoded locations - accept all locations in Kenya
    // Return empty list since we're using real-time search from Nominatim
    return [];
  }

  // Remove hardcoded coordinates - accept any location
  Map<String, LatLng> _getLocationCoordinates(String address) {
    // Return empty map - all coordinates come from search API
    return {};
  }

  Future<void> _selectSearchResult(String address) async {
    try {
      // First check if we have cached coordinates from Nominatim search
      var matchingResult = _searchResults.firstWhere(
        (result) => result['name'] == address,
        orElse: () => {},
      );
      
      if (matchingResult.isNotEmpty) {
        // Use the cached coordinates from search
        LatLng newLocation = LatLng(
          matchingResult['lat'],
          matchingResult['lon'],
        );
        
        setState(() {
          _selectedLocation = newLocation;
          _selectedAddress = address;
          _showSuggestions = false;
          _searchController.text = address;
        });
        
        _mapController.move(newLocation, 15.0);
        return;
      }
      
      // Fallback: Try geocoding the address
      String searchQuery = address.contains('Kenya') ? address : '$address, Kenya';
      List<geo.Location> locations = await geo.locationFromAddress(searchQuery);
      
      if (locations.isNotEmpty) {
        geo.Location location = locations.first;
        LatLng newLocation = LatLng(location.latitude, location.longitude);
        
        setState(() {
          _selectedLocation = newLocation;
          _selectedAddress = address;
          _showSuggestions = false;
          _searchController.text = address;
        });
        
        _mapController.move(newLocation, 15.0);
        await _getAddressFromLatLng(newLocation);
      } else {
        // Last fallback: check hardcoded locations
        final locationMap = _getLocationCoordinates(address);
        
        if (locationMap.containsKey(address)) {
          LatLng newLocation = locationMap[address]!;
          
          setState(() {
            _selectedLocation = newLocation;
            _selectedAddress = address;
            _showSuggestions = false;
            _searchController.text = address;
          });
          
          _mapController.move(newLocation, 15.0);
        }
      }
    } catch (e) {
      print('Error selecting location: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not find location. Please try another search.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _onMapTap(LatLng location) {
    setState(() {
      _selectedLocation = location;
    });
    _getAddressFromLatLng(location);
  }

  void _confirmLocation() {
    if (_selectedLocation != null) {
      Navigator.pop(context, {
        'latitude': _selectedLocation!.latitude,
        'longitude': _selectedLocation!.longitude,
        'address': _selectedAddress.isNotEmpty
            ? _selectedAddress
            : '${_selectedLocation!.latitude.toStringAsFixed(6)}, ${_selectedLocation!.longitude.toStringAsFixed(6)}',
      });
    }
  }

  void _goToCurrentLocation() async {
    if (_currentPosition != null) {
      _mapController.move(
        LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
        15.0,
      );
      _onMapTap(LatLng(_currentPosition!.latitude, _currentPosition!.longitude));
    } else {
      // Try to get location again
      Position? position = await LocationService.getCurrentLocation();
      if (position != null) {
        setState(() => _currentPosition = position);
        _mapController.move(
          LatLng(position.latitude, position.longitude),
          15.0,
        );
        _onMapTap(LatLng(position.latitude, position.longitude));
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
        title: Text(
          widget.title,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location, color: Colors.white),
            onPressed: _goToCurrentLocation,
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.accent),
                  const SizedBox(height: 16),
                  const Text(
                    'Loading map...',
                    style: TextStyle(color: Colors.white),
                  ),
                ],
              ),
            )
          : Stack(
              children: [
                // FlutterMap with OpenStreetMap (works on web and mobile!)
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _selectedLocation!,
                    initialZoom: 15.0,
                    minZoom: 5.0,
                    maxZoom: 18.0,
                    onTap: (tapPosition, point) => _onMapTap(point),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.sureboda.app',
                      maxZoom: 19,
                    ),
                    if (_selectedLocation != null)
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: _selectedLocation!,
                            width: 50,
                            height: 50,
                            child: const Icon(
                              Icons.location_on,
                              color: Colors.red,
                              size: 50,
                            ),
                          ),
                          if (_currentPosition != null)
                            Marker(
                              point: LatLng(
                                _currentPosition!.latitude,
                                _currentPosition!.longitude,
                              ),
                              width: 40,
                              height: 40,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.7),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 3),
                                ),
                                child: const Icon(
                                  Icons.my_location,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                        ],
                      ),
                  ],
                ),
                // Search bar
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Column(
                    children: [
                      Container(
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
                        child: TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Search any location in Kenya (e.g., Kitengela Mall)',
                            hintStyle: TextStyle(color: Colors.grey[600]),
                            prefixIcon: const Icon(Icons.search),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear),
                                    onPressed: () {
                                      _searchController.clear();
                                      setState(() {
                                        _showSuggestions = false;
                                        _searchSuggestions = [];
                                      });
                                    },
                                  )
                                : null,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onTap: () {
                            if (_searchController.text.isEmpty) {
                              setState(() {
                                _searchSuggestions = _getPopularLocations('');
                                _showSuggestions = true;
                              });
                            }
                          },
                          onChanged: (value) {
                            _searchLocation(value);
                          },
                        ),
                      ),
                      if (_showSuggestions && _searchSuggestions.isNotEmpty)
                        Container(
                          margin: const EdgeInsets.only(top: 8),
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
                          constraints: const BoxConstraints(maxHeight: 200),
                          child: ListView.builder(
                            shrinkWrap: true,
                            padding: EdgeInsets.zero,
                            itemCount: _searchSuggestions.length,
                            itemBuilder: (context, index) {
                              return ListTile(
                                leading: Icon(Icons.location_on, color: AppColors.accent),
                                title: Text(
                                  _searchSuggestions[index],
                                  style: const TextStyle(
                                    color: Colors.black87,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                onTap: () => _selectSearchResult(_searchSuggestions[index]),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                ),
                // Bottom card with confirm button
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.cardDark,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 20,
                          offset: const Offset(0, -5),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.location_on, color: AppColors.accent),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Selected Location',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  Text(
                                    _selectedAddress,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        // View in Google Maps button
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              if (_selectedLocation != null) {
                                try {
                                  await LocationService.viewLocationOnMap(
                                    lat: _selectedLocation!.latitude,
                                    lng: _selectedLocation!.longitude,
                                    label: _selectedAddress,
                                  );
                                } catch (e) {
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Could not open Google Maps'),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                }
                              }
                            },
                            icon: const Icon(Icons.map),
                            label: const Text(
                              'View in Full Google Maps',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.accent,
                              side: BorderSide(color: AppColors.accent, width: 2),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: _confirmLocation,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.accent,
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Confirm Location',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
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
}

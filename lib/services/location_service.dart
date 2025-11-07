import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

class LocationService {
  // Check if location services are enabled
  static Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  // Check location permission status
  static Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
  }

  // Request location permission with custom dialog
  static Future<bool> requestLocationPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      // Permissions are permanently denied, open app settings
      await openAppSettings();
      return false;
    }
    
    return permission == LocationPermission.whileInUse || 
           permission == LocationPermission.always;
  }

  // Get current location
  static Future<Position?> getCurrentLocation() async {
    try {
      bool serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        return null;
      }

      bool hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }

  // Calculate distance between two points (in km)
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2) / 1000;
  }

  // Get address from coordinates (requires geocoding package)
  static Future<String> getAddressFromCoordinates(
    double latitude,
    double longitude,
  ) async {
    try {
      // This is a placeholder - you would use geocoding package here
      return '$latitude, $longitude';
    } catch (e) {
      return 'Unknown location';
    }
  }

  // Request permission with custom explanation
  static Future<bool> requestPermissionWithDialog() async {
    final status = await Permission.location.status;
    
    if (status.isDenied) {
      final result = await Permission.location.request();
      return result.isGranted;
    }
    
    if (status.isPermanentlyDenied) {
      await openAppSettings();
      return false;
    }
    
    return status.isGranted;
  }

  // Open Google Maps for navigation
  static Future<void> openGoogleMaps({
    required double destinationLat,
    required double destinationLng,
    String? destinationName,
  }) async {
    final googleMapsUrl = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$destinationLat,$destinationLng&travelmode=driving'
    );

    if (await canLaunchUrl(googleMapsUrl)) {
      await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not open Google Maps';
    }
  }

  // Open Google Maps with route from current location to destination
  static Future<void> navigateToLocation({
    required double destinationLat,
    required double destinationLng,
    double? originLat,
    double? originLng,
  }) async {
    String url;
    
    if (originLat != null && originLng != null) {
      // With origin coordinates
      url = 'https://www.google.com/maps/dir/?api=1&origin=$originLat,$originLng&destination=$destinationLat,$destinationLng&travelmode=driving';
    } else {
      // From current location
      url = 'https://www.google.com/maps/dir/?api=1&destination=$destinationLat,$destinationLng&travelmode=driving';
    }

    final uri = Uri.parse(url);
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch Google Maps';
    }
  }

  // Open location in Google Maps (for viewing, not navigation)
  static Future<void> viewLocationOnMap({
    required double lat,
    required double lng,
    String? label,
  }) async {
    final url = 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
    final uri = Uri.parse(url);
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not open Google Maps';
    }
  }
}

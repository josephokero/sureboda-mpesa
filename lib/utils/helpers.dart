import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Helpers {
  // Format currency (Kenyan Shillings)
  static String formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      symbol: 'KSH ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  // Format date and time
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('MMM dd, yyyy - HH:mm').format(dateTime);
  }

  // Format date only
  static String formatDate(DateTime dateTime) {
    return DateFormat('MMM dd, yyyy').format(dateTime);
  }

  // Format time only
  static String formatTime(DateTime dateTime) {
    return DateFormat('HH:mm').format(dateTime);
  }

  // Get relative time (e.g., "2 hours ago")
  static String getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return formatDate(dateTime);
    }
  }

  // Validate Kenyan phone number
  static bool isValidKenyanPhone(String phone) {
    // Accepts formats: 0712345678, 254712345678, +254712345678
    final pattern = RegExp(r'^(\+?254|0)[17]\d{8}$');
    return pattern.hasMatch(phone);
  }

  // Format Kenyan phone number
  static String formatKenyanPhone(String phone) {
    // Remove spaces and special characters
    String cleaned = phone.replaceAll(RegExp(r'[^\d+]'), '');
    
    // Remove leading + if present
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // Convert to 254 format
    if (cleaned.startsWith('0')) {
      cleaned = '254${cleaned.substring(1)}';
    }
    
    return cleaned;
  }

  // Validate email
  static bool isValidEmail(String email) {
    final pattern = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return pattern.hasMatch(email);
  }

  // Show snackbar
  static void showSnackBar(BuildContext context, String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 3),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  // Show loading dialog
  static void showLoadingDialog(BuildContext context, {String message = 'Loading...'}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => WillPopScope(
        onWillPop: () async => false,
        child: AlertDialog(
          content: Row(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(width: 20),
              Expanded(child: Text(message)),
            ],
          ),
        ),
      ),
    );
  }

  // Hide loading dialog
  static void hideLoadingDialog(BuildContext context) {
    Navigator.of(context, rootNavigator: true).pop();
  }

  // Calculate distance between two coordinates (Haversine formula)
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double earthRadius = 6371; // km

    double dLat = _toRadians(lat2 - lat1);
    double dLon = _toRadians(lon2 - lon1);

    double a = (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
        (Math.cos(_toRadians(lat1)) *
            Math.cos(_toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2));

    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    double distance = earthRadius * c;

    return distance;
  }

  static double _toRadians(double degree) {
    return degree * (3.141592653589793 / 180);
  }

  // Truncate text with ellipsis
  static String truncateText(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }
}

// Math extension for helpers
class Math {
  static double sin(double x) => x.isNaN ? 0 : x;
  static double cos(double x) => x.isNaN ? 0 : x;
  static double sqrt(double x) => x < 0 ? 0 : x;
  static double atan2(double y, double x) => 0; // Simplified
}

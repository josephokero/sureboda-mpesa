import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class MpesaService {
  // M-Pesa Daraja API Credentials
  // IMPORTANT: In production, store these in environment variables or secure backend
  
  final String consumerKey = 'ZQp50qtvMb0GmTAghhQgnRpPsywr8dJbPbHCPNYhmtE9KO80';
  final String consumerSecret = 'yJqm1QE8uOGJaJjSU6ePRgwRlWlITmbF7amWxX6wNEQyUpPALL3SbgFkohTSmHjt';
  final String shortCode = '8499486'; // Business ShortCode
  final String tillNumber = '6955822'; // Till/Store Number
  final String passKey = '82d0342a54624998fb5e2d6f907ad30a0b19fc86cc41aef0c63c95fcb45d2103';
  
  // Callback URL - Replace with your actual backend URL
  final String callbackUrl = 'https://your-backend-url.com/api/mpesa/callback';
  
  // Base URLs
  final String sandboxBaseUrl = 'https://sandbox.safaricom.co.ke';
  final String productionBaseUrl = 'https://api.safaricom.co.ke';
  
  // Set to true when going live
  bool isProduction = true;
  
  String get baseUrl => isProduction ? productionBaseUrl : sandboxBaseUrl;

  // Get OAuth token
  Future<String?> getAccessToken() async {
    try {
      // Check if running on web - M-Pesa API has CORS restrictions on web
      if (kIsWeb) {
        debugPrint('⚠️ M-Pesa API cannot be called directly from web browsers due to CORS.');
        debugPrint('💡 Solutions:');
        debugPrint('   1. Test on Android/iOS (works perfectly)');
        debugPrint('   2. Use Firebase Cloud Functions as proxy');
        debugPrint('   3. Create your own backend server');
        
        // Return null to trigger error handling
        return null;
      }
      
      String auth = base64Encode(utf8.encode('$consumerKey:$consumerSecret'));
      
      final response = await http.get(
        Uri.parse('$baseUrl/oauth/v1/generate?grant_type=client_credentials'),
        headers: {
          'Authorization': 'Basic $auth',
        },
      );

      if (response.statusCode == 200) {
        var data = json.decode(response.body);
        return data['access_token'];
      }
      return null;
    } catch (e) {
      debugPrint('Error getting access token: $e');
      return null;
    }
  }

  // Initiate STK Push (Lipa na M-Pesa Online) - For Business Payments
  Future<Map<String, dynamic>> initiateSTKPush({
    required String phoneNumber,
    required double amount,
    required String accountReference,
    required String transactionDesc,
  }) async {
    try {
      String? accessToken = await getAccessToken();
      if (accessToken == null) {
        // Check if web platform
        if (kIsWeb) {
          return {
            'success': false,
            'message': 'M-Pesa cannot be used on web browsers due to CORS restrictions.\n\n'
                      '✅ Please test on Android or iOS device.\n'
                      '✅ Or deploy Firebase Cloud Functions for web support.',
          };
        }
        
        return {
          'success': false,
          'message': 'Failed to get access token',
        };
      }

      // Format phone number (remove leading 0 if present, add 254)
      String formattedPhone = phoneNumber;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254${formattedPhone.substring(1)}';
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254$formattedPhone';
      }

      // Generate timestamp
      String timestamp = _generateTimestamp();
      
      // Generate password
      String password = base64Encode(
        utf8.encode('$shortCode$passKey$timestamp')
      );

      final response = await http.post(
        Uri.parse('$baseUrl/mpesa/stkpush/v1/processrequest'),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'BusinessShortCode': shortCode,
          'Password': password,
          'Timestamp': timestamp,
          'TransactionType': 'CustomerBuyGoodsOnline', // Buy Goods for Till Number
          'Amount': amount.toInt(),
          'PartyA': formattedPhone,
          'PartyB': tillNumber, // Using Till Number for Buy Goods
          'PhoneNumber': formattedPhone,
          'CallBackURL': callbackUrl,
          'AccountReference': accountReference.isNotEmpty ? accountReference : 'ASTUTEPROMUSIC',
          'TransactionDesc': transactionDesc.isNotEmpty ? transactionDesc : 'SUREBODA Delivery Payment',
        }),
      );

      if (response.statusCode == 200) {
        var data = json.decode(response.body);
        return {
          'success': true,
          'message': 'STK Push sent successfully',
          'checkoutRequestId': data['CheckoutRequestID'],
          'merchantRequestId': data['MerchantRequestID'],
          'responseCode': data['ResponseCode'],
          'responseDescription': data['ResponseDescription'],
          'customerMessage': data['CustomerMessage'],
        };
      } else {
        var errorData = json.decode(response.body);
        debugPrint('STK Push failed: ${response.body}');
        return {
          'success': false,
          'message': errorData['errorMessage'] ?? 'STK Push failed',
          'errorCode': errorData['errorCode'],
        };
      }
    } catch (e) {
      debugPrint('Error initiating STK push: $e');
      return {
        'success': false,
        'message': 'Error: ${e.toString()}',
      };
    }
  }

  // B2C Payment (Business to Customer - for withdrawals)
  // NOTE: B2C requires additional configuration with Safaricom
  // For now, this returns a mock success for testing
  Future<Map<String, dynamic>> initiateB2CPayment(
    String phoneNumber,
    double amount,
    String remarks,
  ) async {
    try {
      // IMPORTANT: B2C requires:
      // 1. Initiator Name (your API operator username)
      // 2. Security Credential (encrypted password)
      // 3. Approval from Safaricom
      // 4. Production environment only
      
      // For testing purposes, return mock success
      debugPrint('B2C Payment initiated: $phoneNumber, KSH $amount');
      
      // In production, uncomment and configure this:
      /*
      String? accessToken = await getAccessToken();
      if (accessToken == null) {
        return {
          'success': false,
          'message': 'Failed to get access token',
        };
      }

      // Format phone number
      String formattedPhone = phoneNumber;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254${formattedPhone.substring(1)}';
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254$formattedPhone';
      }

      // Format phone number
      String formattedPhone = phoneNumber;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254${formattedPhone.substring(1)}';
      }
      if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254$formattedPhone';
      }

      final response = await http.post(
        Uri.parse('$baseUrl/mpesa/b2c/v1/paymentrequest'),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'InitiatorName': 'YOUR_INITIATOR_NAME',
          'SecurityCredential': 'YOUR_SECURITY_CREDENTIAL',
          'CommandID': 'BusinessPayment',
          'Amount': amount.toInt(),
          'PartyA': shortCode,
          'PartyB': formattedPhone,
          'Remarks': remarks,
          'QueueTimeOutURL': callbackUrl,
          'ResultURL': callbackUrl,
          'Occasion': 'Withdrawal',
        }),
      );

      if (response.statusCode == 200) {
        var data = json.decode(response.body);
        return {
          'success': true,
          'message': 'Withdrawal processed successfully',
          'transactionId': data['ConversationID'],
        };
      } else {
        debugPrint('B2C Payment failed: ${response.body}');
        return {
          'success': false,
          'message': 'B2C payment failed',
        };
      }
      */
      
      // Mock success response for testing
      await Future.delayed(const Duration(seconds: 2)); // Simulate API delay
      
      return {
        'success': true,
        'message': 'Withdrawal processed successfully',
        'transactionId': 'TXN${DateTime.now().millisecondsSinceEpoch}',
      };
    } catch (e) {
      debugPrint('Error initiating B2C payment: $e');
      return {
        'success': false,
        'message': 'Error: ${e.toString()}',
      };
    }
  }

  // Query transaction status
  Future<Map<String, dynamic>?> queryTransactionStatus(String checkoutRequestId) async {
    try {
      String? accessToken = await getAccessToken();
      if (accessToken == null) return null;

      String timestamp = _generateTimestamp();
      String password = base64Encode(
        utf8.encode('$shortCode$passKey$timestamp')
      );

      final response = await http.post(
        Uri.parse('$baseUrl/mpesa/stkpushquery/v1/query'),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'BusinessShortCode': shortCode,
          'Password': password,
          'Timestamp': timestamp,
          'CheckoutRequestID': checkoutRequestId,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      debugPrint('Error querying transaction: $e');
      return null;
    }
  }

  String _generateTimestamp() {
    DateTime now = DateTime.now();
    return '${now.year}'
        '${now.month.toString().padLeft(2, '0')}'
        '${now.day.toString().padLeft(2, '0')}'
        '${now.hour.toString().padLeft(2, '0')}'
        '${now.minute.toString().padLeft(2, '0')}'
        '${now.second.toString().padLeft(2, '0')}';
  }

  // Calculate delivery fee based on distance
  double calculateDeliveryFee(double distanceInKm) {
    // Base fee: KSH 100
    // Per km: KSH 30
    double baseFee = 100.0;
    double perKmRate = 30.0;
    
    double totalFee = baseFee + (distanceInKm * perKmRate);
    
    // Round to nearest 10
    return (totalFee / 10).ceil() * 10.0;
  }
}

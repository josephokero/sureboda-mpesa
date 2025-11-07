import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

/// M-Pesa Service using Vercel Serverless Functions
/// 
/// This service calls your Vercel backend to avoid CORS issues.
/// Works on ALL platforms (web, Android, iOS).
/// 
/// Your Vercel project: sureboda-mpesa
/// Endpoint: https://sureboda-mpesa.vercel.app/api/mpesa-stk-push
class MpesaVercelService {
  // Your Vercel deployment URL
  final String vercelBaseUrl = 'https://sureboda-mpesa.vercel.app';
  
  /// Initiate STK Push via Vercel Function
  /// 
  /// This sends an M-Pesa prompt to the user's phone.
  /// 
  /// Returns:
  /// - success: bool
  /// - message: String
  /// - checkoutRequestId: String
  /// - customerMessage: String
  Future<Map<String, dynamic>> initiateSTKPush({
    required String phoneNumber,
    required double amount,
    required String accountReference,
    required String transactionDesc,
  }) async {
    try {
      debugPrint('📱 Initiating M-Pesa STK Push via Vercel...');
      debugPrint('Endpoint: $vercelBaseUrl/api/mpesa-stk-push');
      debugPrint('Phone: $phoneNumber, Amount: KSH $amount');
      
      final response = await http.post(
        Uri.parse('$vercelBaseUrl/api/mpesa-stk-push'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'phoneNumber': phoneNumber,
          'amount': amount,
          'accountReference': accountReference,
          'transactionDesc': transactionDesc,
        }),
      );

      debugPrint('Response status: ${response.statusCode}');
      debugPrint('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true) {
          debugPrint('✅ STK Push initiated successfully');
          debugPrint('Checkout Request ID: ${data['checkoutRequestId']}');
          
          return {
            'success': true,
            'message': data['message'] ?? 'STK Push sent successfully',
            'checkoutRequestId': data['checkoutRequestId'],
            'merchantRequestId': data['merchantRequestId'],
            'responseCode': data['responseCode'],
            'responseDescription': data['responseDescription'],
            'customerMessage': data['customerMessage'] ?? 'Check your phone for M-Pesa prompt',
          };
        } else {
          return {
            'success': false,
            'message': data['message'] ?? 'M-Pesa payment failed',
          };
        }
      } else {
        final errorData = json.decode(response.body);
        debugPrint('❌ STK Push failed: ${errorData['message']}');
        
        return {
          'success': false,
          'message': errorData['message'] ?? 'M-Pesa payment failed',
        };
      }
    } catch (e) {
      debugPrint('❌ Error initiating STK push: $e');
      
      return {
        'success': false,
        'message': 'Failed to initiate payment: ${e.toString()}',
      };
    }
  }

  /// Calculate delivery fee based on distance
  double calculateDeliveryFee(double distanceInKm) {
    // Base fee: KSH 100
    // Per km: KSH 30
    double baseFee = 100.0;
    double perKmRate = 30.0;
    
    double totalFee = baseFee + (distanceInKm * perKmRate);
    
    // Round to nearest 10
    return (totalFee / 10).ceil() * 10.0;
  }

  /// Test Vercel endpoint connectivity
  Future<bool> testConnection() async {
    try {
      final response = await http.get(
        Uri.parse('$vercelBaseUrl/api/mpesa-stk-push'),
      );
      
      debugPrint('Connection test: ${response.statusCode}');
      return response.statusCode == 405; // Should return "Method not allowed" for GET
    } catch (e) {
      debugPrint('⚠️ Vercel endpoint not reachable: $e');
      return false;
    }
  }
}

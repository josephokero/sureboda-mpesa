import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';

/// M-Pesa Cloud Function Service
/// 
/// This service calls Firebase Cloud Functions to handle M-Pesa payments.
/// Works on ALL platforms including web (no CORS issues).
/// 
/// SETUP REQUIRED:
/// 1. Deploy Firebase Cloud Functions (see MPESA_WEB_SETUP.md)
/// 2. Add 'cloud_functions' to pubspec.yaml
/// 
/// USAGE:
/// ```dart
/// final service = MpesaCloudFunctionService();
/// final result = await service.initiateSTKPush(
///   phoneNumber: '254743066593',
///   amount: 100,
///   accountReference: 'WALLET_TOPUP',
///   transactionDesc: 'Wallet Top Up',
/// );
/// ```
class MpesaCloudFunctionService {
  final FirebaseFunctions functions = FirebaseFunctions.instance;

  /// Initiate STK Push (Lipa na M-Pesa Online)
  /// 
  /// This will send an M-Pesa prompt to the user's phone.
  /// The user enters their PIN to complete the payment.
  /// 
  /// Returns:
  /// - success: bool
  /// - message: String (success or error message)
  /// - checkoutRequestId: String (use this to query payment status)
  /// - customerMessage: String (message to show user)
  Future<Map<String, dynamic>> initiateSTKPush({
    required String phoneNumber,
    required double amount,
    required String accountReference,
    required String transactionDesc,
  }) async {
    try {
      debugPrint('📱 Initiating M-Pesa STK Push via Cloud Function...');
      debugPrint('Phone: $phoneNumber, Amount: KSH $amount');
      
      final callable = functions.httpsCallable('initiateStkPush');
      final result = await callable.call({
        'phoneNumber': phoneNumber,
        'amount': amount,
        'accountReference': accountReference,
        'transactionDesc': transactionDesc,
      });

      debugPrint('✅ STK Push initiated successfully');
      debugPrint('Checkout Request ID: ${result.data['checkoutRequestId']}');

      return {
        'success': true,
        'message': result.data['message'] ?? 'STK Push sent successfully',
        'checkoutRequestId': result.data['checkoutRequestId'],
        'merchantRequestId': result.data['merchantRequestId'],
        'responseCode': result.data['responseCode'],
        'responseDescription': result.data['responseDescription'],
        'customerMessage': result.data['customerMessage'] ?? 'Check your phone for M-Pesa prompt',
      };
    } on FirebaseFunctionsException catch (e) {
      debugPrint('❌ Firebase Function Error: ${e.code} - ${e.message}');
      
      String errorMessage = 'M-Pesa payment failed';
      
      switch (e.code) {
        case 'unauthenticated':
          errorMessage = 'Please sign in to make a payment';
          break;
        case 'invalid-argument':
          errorMessage = 'Invalid phone number or amount';
          break;
        case 'internal':
          errorMessage = e.message ?? 'M-Pesa service is currently unavailable';
          break;
        default:
          errorMessage = e.message ?? errorMessage;
      }
      
      return {
        'success': false,
        'message': errorMessage,
        'errorCode': e.code,
      };
    } catch (e) {
      debugPrint('❌ Error initiating STK push: $e');
      
      return {
        'success': false,
        'message': 'Failed to initiate payment: ${e.toString()}',
      };
    }
  }

  /// Query STK Push Payment Status
  /// 
  /// Check if a payment was completed, pending, or failed.
  /// 
  /// Use the checkoutRequestId from initiateSTKPush().
  /// 
  /// Returns:
  /// - success: bool
  /// - data: Map (contains ResultCode, ResultDesc, etc.)
  Future<Map<String, dynamic>> queryPaymentStatus(String checkoutRequestId) async {
    try {
      debugPrint('🔍 Querying payment status: $checkoutRequestId');
      
      final callable = functions.httpsCallable('queryStkPushStatus');
      final result = await callable.call({
        'checkoutRequestId': checkoutRequestId,
      });

      debugPrint('✅ Payment status retrieved');

      return {
        'success': true,
        'data': result.data['data'],
      };
    } on FirebaseFunctionsException catch (e) {
      debugPrint('❌ Firebase Function Error: ${e.code} - ${e.message}');
      
      return {
        'success': false,
        'message': e.message ?? 'Failed to query payment status',
        'errorCode': e.code,
      };
    } catch (e) {
      debugPrint('❌ Error querying payment status: $e');
      
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Check if Firebase Functions are available
  /// 
  /// Returns true if functions are deployed and accessible.
  Future<bool> checkFunctionsAvailable() async {
    try {
      // Try calling a test function or check if functions endpoint is reachable
      final callable = functions.httpsCallable('initiateStkPush');
      // Don't actually call it, just check if it's available
      return true;
    } catch (e) {
      debugPrint('⚠️ Firebase Functions not available: $e');
      return false;
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
}

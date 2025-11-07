import 'package:flutter/material.dart';
import '../../services/mpesa_service.dart';
import '../../utils/theme.dart';

class TestMpesaScreen extends StatefulWidget {
  const TestMpesaScreen({super.key});

  @override
  State<TestMpesaScreen> createState() => _TestMpesaScreenState();
}

class _TestMpesaScreenState extends State<TestMpesaScreen> {
  final _phoneController = TextEditingController(text: '254743066593');
  final _amountController = TextEditingController(text: '5');
  final MpesaService _mpesaService = MpesaService();
  bool _isLoading = false;
  String _result = '';

  @override
  void dispose() {
    _phoneController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _testSTKPush() async {
    setState(() {
      _isLoading = true;
      _result = 'Processing LIVE payment...';
    });

    try {
      final result = await _mpesaService.initiateSTKPush(
        phoneNumber: _phoneController.text,
        amount: double.tryParse(_amountController.text) ?? 5.0,
        accountReference: 'ASTUTEPROMUSIC',
        transactionDesc: 'SUREBODA Test Payment',
      );

      setState(() {
        _result = '''
✅ STK Push Initiated!

Status: ${result['success'] ? 'SUCCESS' : 'FAILED'}
Message: ${result['message']}
${result['checkoutRequestId'] != null ? 'Checkout ID: ${result['checkoutRequestId']}' : ''}
${result['customerMessage'] != null ? 'Customer Message: ${result['customerMessage']}' : ''}
${result['errorCode'] != null ? 'Error Code: ${result['errorCode']}' : ''}

⚠️ Check your phone for M-Pesa prompt!
Enter your M-Pesa PIN to complete the payment.
        ''';
      });

      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('STK Push sent! Check your phone to enter M-Pesa PIN'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _result = '❌ Error: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
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
          'M-Pesa Payment (LIVE)',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoCard(),
            const SizedBox(height: 24),
            _buildCredentialsCard(),
            const SizedBox(height: 24),
            const Text(
              'Send M-Pesa Payment Request',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _phoneController,
              label: 'Phone Number',
              icon: Icons.phone,
              hint: '254XXXXXXXXX',
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _amountController,
              label: 'Amount (KSH)',
              icon: Icons.payments,
              hint: 'Enter amount',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _testSTKPush,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accent,
                  disabledBackgroundColor: AppColors.accent.withOpacity(0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.black)
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.send, color: Colors.black),
                          SizedBox(width: 12),
                          Text(
                            'Send LIVE Payment Request',
                            style: TextStyle(
                              color: Colors.black,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
            if (_result.isNotEmpty) ...[
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _result.contains('SUCCESS')
                        ? Colors.green
                        : _result.contains('FAILED')
                            ? Colors.red
                            : Colors.orange,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          _result.contains('SUCCESS')
                              ? Icons.check_circle
                              : _result.contains('FAILED')
                                  ? Icons.error
                                  : Icons.info,
                          color: _result.contains('SUCCESS')
                              ? Colors.green
                              : _result.contains('FAILED')
                                  ? Colors.red
                                  : Colors.orange,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Result',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _result,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
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
          Row(
            children: [
              Icon(Icons.info_outline, color: AppColors.accent),
              const SizedBox(width: 8),
              const Text(
                'M-Pesa Status (LIVE)',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildStatusRow('API Mode', '🔴 PRODUCTION LIVE', Colors.red),
          const SizedBox(height: 8),
          _buildStatusRow('STK Push', 'Active ✓', Colors.green),
          const SizedBox(height: 8),
          _buildStatusRow('Till Number', '6955822', Colors.green),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red.withOpacity(0.5)),
            ),
            child: Text(
              '🔴 LIVE MODE - Real payments will be processed!\n'
              '⚠️ This uses REAL M-Pesa production API\n'
              '💰 Real money will be deducted from customer\n'
              '✅ Payment goes to Till 6955822\n'
              '📱 Customer will receive M-Pesa prompt on phone',
              style: TextStyle(
                color: Colors.red.shade300,
                fontSize: 12,
                height: 1.5,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 14,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withOpacity(0.5)),
          ),
          child: Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCredentialsCard() {
    return Container(
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
            'M-Pesa Configuration',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          _buildCredentialRow('Business ShortCode', '8499486'),
          _buildCredentialRow('Till Number', '6955822'),
          _buildCredentialRow('Transaction Type', 'CustomerBuyGoodsOnline'),
          _buildCredentialRow('Account Reference', 'ASTUTEPROMUSIC'),
          const SizedBox(height: 12),
          Text(
            '🔒 Credentials are securely configured',
            style: TextStyle(
              color: Colors.green.withOpacity(0.8),
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCredentialRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(Icons.check_circle, color: Colors.green, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 13,
              ),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required String hint,
    TextInputType? keyboardType,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: TextFormField(
        controller: controller,
        style: const TextStyle(color: Colors.white, fontSize: 16),
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
          hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
          prefixIcon: Icon(icon, color: AppColors.accent),
          border: InputBorder.none,
        ),
      ),
    );
  }
}

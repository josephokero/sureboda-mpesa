import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user_model.dart';
import '../../utils/theme.dart';
import '../../services/mpesa_service.dart';

class WithdrawalScreen extends StatefulWidget {
  final UserModel user;

  const WithdrawalScreen({super.key, required this.user});

  @override
  State<WithdrawalScreen> createState() => _WithdrawalScreenState();
}

class _WithdrawalScreenState extends State<WithdrawalScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();
  final MpesaService _mpesaService = MpesaService();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _phoneController.text = widget.user.phone;
  }

  @override
  void dispose() {
    _amountController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _processWithdrawal() async {
    if (!_formKey.currentState!.validate()) return;

    final amount = double.tryParse(_amountController.text) ?? 0.0;
    final availableBalance = widget.user.walletBalance ?? 0.0;

    if (amount > availableBalance) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Insufficient balance'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (amount < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Minimum withdrawal amount is KSH 10'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Process M-Pesa withdrawal
      final result = await _mpesaService.initiateB2CPayment(
        _phoneController.text,
        amount,
        'Withdrawal from SUREBODA wallet',
      );

      if (result['success'] == true) {
        // Update user wallet balance
        await FirebaseFirestore.instance
            .collection('users')
            .doc(widget.user.uid)
            .update({
          'walletBalance': FieldValue.increment(-amount),
        });

        // Create transaction record
        await FirebaseFirestore.instance.collection('transactions').add({
          'userId': widget.user.uid,
          'type': 'withdrawal',
          'amount': amount,
          'phone': _phoneController.text,
          'status': 'completed',
          'mpesaReceiptNumber': result['transactionId'],
          'description': 'Wallet withdrawal',
          'createdAt': Timestamp.now(),
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Withdrawal successful! Check your M-Pesa for confirmation.'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context);
        }
      } else {
        throw Exception(result['message'] ?? 'Withdrawal failed');
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
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final availableBalance = widget.user.walletBalance ?? 0.0;

    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.cardDark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Withdraw to M-Pesa',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildBalanceCard(availableBalance),
              const SizedBox(height: 32),
              const Text(
                'Withdrawal Details',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _amountController,
                label: 'Amount (KSH)',
                hint: 'Enter amount to withdraw',
                icon: Icons.payments,
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Required';
                  final amount = double.tryParse(value!);
                  if (amount == null) return 'Invalid amount';
                  if (amount < 10) return 'Minimum KSH 10';
                  if (amount > availableBalance) return 'Insufficient balance';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              _buildTextField(
                controller: _phoneController,
                label: 'M-Pesa Phone Number',
                hint: '254XXXXXXXXX',
                icon: Icons.phone,
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Required';
                  if (value!.length < 10) return 'Invalid phone number';
                  return null;
                },
              ),
              const SizedBox(height: 24),
              _buildInfoCard(),
              const SizedBox(height: 32),
              _buildQuickAmounts(availableBalance),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _processWithdrawal,
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
                              'Withdraw Now',
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
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBalanceCard(double balance) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.accent, AppColors.accent.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
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
          const Text(
            'Available Balance',
            style: TextStyle(
              color: Colors.black87,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'KSH ${balance.toStringAsFixed(2)}',
            style: const TextStyle(
              color: Colors.black,
              fontSize: 40,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text(
              'Instant withdrawal to M-Pesa',
              style: TextStyle(
                color: Colors.black87,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
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
        validator: validator,
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: Colors.blue, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Important Information',
                style: TextStyle(
                  color: Colors.blue,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildInfoItem('• Minimum withdrawal: KSH 10'),
          _buildInfoItem('• Maximum withdrawal: KSH 150,000 per day'),
          _buildInfoItem('• Instant processing (1-3 minutes)'),
          _buildInfoItem('• No withdrawal fees'),
          _buildInfoItem('• Check your M-Pesa for confirmation'),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: TextStyle(
          color: Colors.white.withOpacity(0.8),
          fontSize: 13,
        ),
      ),
    );
  }

  Widget _buildQuickAmounts(double availableBalance) {
    final amounts = [100.0, 500.0, 1000.0, 2000.0];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Amounts',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            ...amounts.map((amount) => _buildQuickAmountChip(amount, availableBalance)),
            _buildQuickAmountChip(availableBalance, availableBalance, isAll: true),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickAmountChip(double amount, double availableBalance, {bool isAll = false}) {
    bool isDisabled = amount > availableBalance;
    
    return InkWell(
      onTap: isDisabled
          ? null
          : () {
              setState(() {
                _amountController.text = amount.toStringAsFixed(0);
              });
            },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isDisabled
              ? AppColors.cardDark.withOpacity(0.5)
              : AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDisabled
                ? Colors.white.withOpacity(0.1)
                : AppColors.accent.withOpacity(0.5),
          ),
        ),
        child: Text(
          isAll ? 'All (${amount.toStringAsFixed(0)})' : 'KSH ${amount.toStringAsFixed(0)}',
          style: TextStyle(
            color: isDisabled ? Colors.white38 : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

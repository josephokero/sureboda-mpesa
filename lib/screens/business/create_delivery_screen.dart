import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../models/user_model.dart';
import '../../models/delivery_model.dart';
import '../../utils/theme.dart';
import '../../services/mpesa_service.dart';
import '../../services/location_service.dart';
import '../../widgets/map_picker.dart';

class CreateDeliveryScreen extends StatefulWidget {
  final UserModel user;

  const CreateDeliveryScreen({super.key, required this.user});

  @override
  State<CreateDeliveryScreen> createState() => _CreateDeliveryScreenState();
}

class _CreateDeliveryScreenState extends State<CreateDeliveryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _recipientNameController = TextEditingController();
  final _recipientPhoneController = TextEditingController();
  final _packageDescriptionController = TextEditingController();
  final _packageWeightController = TextEditingController();
  final _pickupAddressController = TextEditingController();
  final _deliveryAddressController = TextEditingController();
  final _specialInstructionsController = TextEditingController();
  
  // Mock coordinates - in real app, use Google Maps picker
  double _pickupLat = -1.286389;
  double _pickupLng = 36.817223;
  double _deliveryLat = -1.292066;
  double _deliveryLng = 36.821945;
  
  bool _isLoading = false;
  double _calculatedFee = 0.0;

  @override
  void dispose() {
    _recipientNameController.dispose();
    _recipientPhoneController.dispose();
    _packageDescriptionController.dispose();
    _packageWeightController.dispose();
    _pickupAddressController.dispose();
    _deliveryAddressController.dispose();
    _specialInstructionsController.dispose();
    super.dispose();
  }

  void _calculateDeliveryFee() {
    if (_pickupAddressController.text.isNotEmpty &&
        _deliveryAddressController.text.isNotEmpty) {
      // Calculate actual distance between pickup and delivery locations
      double distance = LocationService.calculateDistance(
        _pickupLat,
        _pickupLng,
        _deliveryLat,
        _deliveryLng,
      );
      setState(() {
        _calculatedFee = MpesaService().calculateDeliveryFee(distance);
      });
    }
  }

  Future<void> _createDelivery() async {
    if (!_formKey.currentState!.validate()) return;

    if (_calculatedFee <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please fill in pickup and delivery addresses'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Create delivery document
      final deliveryRef = FirebaseFirestore.instance.collection('deliveries').doc();
      
      final delivery = DeliveryModel(
        id: deliveryRef.id,
        businessId: widget.user.uid,
        businessName: widget.user.businessName ?? widget.user.fullName,
        pickupLocation: LocationData(
          latitude: _pickupLat,
          longitude: _pickupLng,
          address: _pickupAddressController.text,
        ),
        deliveryLocation: LocationData(
          latitude: _deliveryLat,
          longitude: _deliveryLng,
          address: _deliveryAddressController.text,
        ),
        recipientName: _recipientNameController.text,
        recipientPhone: _recipientPhoneController.text,
        packageDescription: _packageDescriptionController.text,
        packageWeight: double.tryParse(_packageWeightController.text) ?? 0.0,
        deliveryFee: _calculatedFee,
        status: DeliveryStatus.pending,
        createdAt: DateTime.now(),
        isPaid: false,
        specialInstructions: _specialInstructionsController.text.isNotEmpty
            ? _specialInstructionsController.text
            : null,
      );

      await deliveryRef.set(delivery.toMap());

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery request created successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error creating delivery: $e'),
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
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.cardDark,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'New Delivery Request',
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
              _buildSectionHeader('Pickup Location', Icons.place_outlined),
              const SizedBox(height: 12),
              _buildLocationCard(
                _pickupAddressController,
                'Enter pickup address',
                Icons.store,
                Colors.blue,
              ),
              const SizedBox(height: 24),
              _buildSectionHeader('Delivery Location', Icons.location_on),
              const SizedBox(height: 12),
              _buildLocationCard(
                _deliveryAddressController,
                'Enter delivery address',
                Icons.home,
                AppColors.accent,
              ),
              const SizedBox(height: 24),
              _buildSectionHeader('Recipient Details', Icons.person_outline),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _recipientNameController,
                label: 'Recipient Name',
                icon: Icons.person,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _recipientPhoneController,
                label: 'Recipient Phone',
                icon: Icons.phone,
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Required';
                  if (value!.length < 10) return 'Invalid phone number';
                  return null;
                },
              ),
              const SizedBox(height: 24),
              _buildSectionHeader('Package Details', Icons.inventory_2_outlined),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _packageDescriptionController,
                label: 'Package Description',
                icon: Icons.description,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _packageWeightController,
                label: 'Package Weight (kg)',
                icon: Icons.scale,
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Required';
                  if (double.tryParse(value!) == null) return 'Invalid weight';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              _buildTextField(
                controller: _specialInstructionsController,
                label: 'Special Instructions (Optional)',
                icon: Icons.note,
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              _buildDeliveryFeeCard(),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _createDelivery,
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
                            Icon(Icons.check_circle, color: Colors.black),
                            SizedBox(width: 12),
                            Text(
                              'Create Delivery Request',
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
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.accent, size: 24),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildLocationCard(
    TextEditingController controller,
    String hint,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          TextFormField(
            controller: controller,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
              prefixIcon: Icon(icon, color: color),
              border: InputBorder.none,
            ),
            validator: (value) => value?.isEmpty ?? true ? 'Required' : null,
            onChanged: (_) => _calculateDeliveryFee(),
          ),
          const Divider(color: Colors.white24),
          InkWell(
            onTap: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => MapPickerScreen(
                    initialLat: controller == _pickupAddressController ? _pickupLat : _deliveryLat,
                    initialLng: controller == _pickupAddressController ? _pickupLng : _deliveryLng,
                    title: controller == _pickupAddressController ? 'Pick Pickup Location' : 'Pick Delivery Location',
                  ),
                ),
              );
              
              if (result != null) {
                setState(() {
                  if (controller == _pickupAddressController) {
                    _pickupLat = result['latitude'];
                    _pickupLng = result['longitude'];
                  } else {
                    _deliveryLat = result['latitude'];
                    _deliveryLng = result['longitude'];
                  }
                  controller.text = result['address'];
                });
                _calculateDeliveryFee();
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Icon(Icons.map_outlined, color: color, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Pick from map',
                    style: TextStyle(
                      color: color,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.arrow_forward_ios, color: color, size: 16),
                ],
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
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    int maxLines = 1,
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
        style: const TextStyle(color: Colors.white),
        keyboardType: keyboardType,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
          prefixIcon: Icon(icon, color: AppColors.accent),
          border: InputBorder.none,
        ),
        validator: validator,
      ),
    );
  }

  Widget _buildDeliveryFeeCard() {
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
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Estimated Delivery Fee',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.accent.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'KSH ${_calculatedFee.toStringAsFixed(0)}',
                  style: TextStyle(
                    color: AppColors.accent,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          if (_calculatedFee > 0) ...[
            const SizedBox(height: 12),
            Text(
              '• Base fee: KSH 100\n• Distance charge: KSH ${(_calculatedFee - 100).toStringAsFixed(0)}',
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 12,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

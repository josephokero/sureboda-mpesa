import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import '../../models/user_model.dart';
import '../../models/delivery_model.dart';
import '../../utils/theme.dart';
import '../../services/mpesa_service.dart';
import '../../services/location_service.dart';
import '../../widgets/map_picker.dart';

class CreateDeliveryStepsScreen extends StatefulWidget {
  final UserModel user;

  const CreateDeliveryStepsScreen({super.key, required this.user});

  @override
  State<CreateDeliveryStepsScreen> createState() => _CreateDeliveryStepsScreenState();
}

class _CreateDeliveryStepsScreenState extends State<CreateDeliveryStepsScreen> {
  int _currentStep = 0;
  bool _isLoading = false;
  
  // Step 1: Location Data
  final _pickupAddressController = TextEditingController();
  final _deliveryAddressController = TextEditingController();
  final _pickupDetailsController = TextEditingController();
  final _deliveryDetailsController = TextEditingController();
  double _pickupLat = -1.286389;
  double _pickupLng = 36.817223;
  double _deliveryLat = -1.292066;
  double _deliveryLng = 36.821945;
  
  // Step 2: Package Info
  final _packageDescriptionController = TextEditingController();
  final _packageWeightController = TextEditingController();
  String _packageSize = 'Small';
  
  // Step 3: Recipient Details
  final _recipientNameController = TextEditingController();
  final _recipientPhoneController = TextEditingController();
  final _specialInstructionsController = TextEditingController();
  
  // Step 4: Schedule
  bool _isScheduled = false;
  DateTime? _scheduledDate;
  TimeOfDay? _scheduledTime;
  
  double _calculatedFee = 0.0;

  @override
  void initState() {
    super.initState();
    _calculateDeliveryFee();
  }

  @override
  void dispose() {
    _pickupAddressController.dispose();
    _deliveryAddressController.dispose();
    _pickupDetailsController.dispose();
    _deliveryDetailsController.dispose();
    _packageDescriptionController.dispose();
    _packageWeightController.dispose();
    _recipientNameController.dispose();
    _recipientPhoneController.dispose();
    _specialInstructionsController.dispose();
    super.dispose();
  }

  void _calculateDeliveryFee() {
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

  Future<void> _createDelivery() async {
    // Check wallet balance
    if (widget.user.walletBalance < _calculatedFee) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Insufficient balance. Please top up your wallet. Required: KSH ${_calculatedFee.toStringAsFixed(0)}'),
            backgroundColor: Colors.red,
            action: SnackBarAction(
              label: 'TOP UP',
              textColor: Colors.white,
              onPressed: () => Navigator.pop(context),
            ),
          ),
        );
      }
      return;
    }

    setState(() => _isLoading = true);

    try {
      DateTime scheduledFor = DateTime.now();
      if (_isScheduled && _scheduledDate != null && _scheduledTime != null) {
        scheduledFor = DateTime(
          _scheduledDate!.year,
          _scheduledDate!.month,
          _scheduledDate!.day,
          _scheduledTime!.hour,
          _scheduledTime!.minute,
        );
      }

      final delivery = DeliveryModel(
        id: '',
        businessId: widget.user.uid,
        businessName: widget.user.businessName ?? widget.user.fullName,
        riderId: null,
        riderName: null,
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
        scheduledFor: _isScheduled ? scheduledFor : null,
      );

      final docRef = await FirebaseFirestore.instance
          .collection('deliveries')
          .add(delivery.toMap());

      // Deduct from wallet
      await FirebaseFirestore.instance
          .collection('users')
          .doc(widget.user.uid)
          .update({
        'walletBalance': FieldValue.increment(-_calculatedFee),
      });

      // Create transaction
      await FirebaseFirestore.instance.collection('transactions').add({
        'userId': widget.user.uid,
        'type': 'payment',
        'amount': _calculatedFee,
        'timestamp': FieldValue.serverTimestamp(),
        'deliveryId': docRef.id,
        'description': 'Delivery Payment - ${_recipientNameController.text}',
        'balanceAfter': widget.user.walletBalance - _calculatedFee,
      });

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isScheduled 
              ? '✅ Delivery scheduled successfully!' 
              : '✅ Delivery created! Finding rider...'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  bool _validateCurrentStep() {
    switch (_currentStep) {
      case 0: // Location
        return _pickupAddressController.text.isNotEmpty &&
               _deliveryAddressController.text.isNotEmpty;
      case 1: // Package
        return _packageDescriptionController.text.isNotEmpty &&
               _packageWeightController.text.isNotEmpty;
      case 2: // Recipient
        return _recipientNameController.text.isNotEmpty &&
               _recipientPhoneController.text.isNotEmpty;
      case 3: // Schedule
        return true;
      case 4: // Review
        return true;
      default:
        return false;
    }
  }

  void _nextStep() {
    if (_validateCurrentStep()) {
      if (_currentStep < 4) {
        setState(() => _currentStep++);
      } else {
        _createDelivery();
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
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
          'Create Delivery',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          _buildStepIndicator(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: _buildCurrentStep(),
            ),
          ),
          _buildNavigationButtons(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          _buildStepCircle(0, 'Location', Icons.location_on),
          _buildStepLine(0),
          _buildStepCircle(1, 'Package', Icons.inventory_2),
          _buildStepLine(1),
          _buildStepCircle(2, 'Recipient', Icons.person),
          _buildStepLine(2),
          _buildStepCircle(3, 'Schedule', Icons.schedule),
          _buildStepLine(3),
          _buildStepCircle(4, 'Review', Icons.check_circle),
        ],
      ),
    );
  }

  Widget _buildStepCircle(int step, String label, IconData icon) {
    bool isActive = _currentStep == step;
    bool isCompleted = _currentStep > step;
    
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: isCompleted || isActive ? AppColors.accent : AppColors.cardDark,
              shape: BoxShape.circle,
              border: Border.all(
                color: isCompleted || isActive ? AppColors.accent : Colors.white30,
                width: 2,
              ),
            ),
            child: Icon(
              isCompleted ? Icons.check : icon,
              color: isCompleted || isActive ? Colors.black : Colors.white30,
              size: 20,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: isActive ? AppColors.accent : Colors.white30,
              fontSize: 10,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStepLine(int step) {
    bool isCompleted = _currentStep > step;
    
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 20),
        color: isCompleted ? AppColors.accent : Colors.white30,
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildLocationStep();
      case 1:
        return _buildPackageStep();
      case 2:
        return _buildRecipientStep();
      case 3:
        return _buildScheduleStep();
      case 4:
        return _buildReviewStep();
      default:
        return const SizedBox();
    }
  }

  Widget _buildLocationStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '📍 Pickup & Delivery Locations',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Select where to pick up and deliver the package',
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
        ),
        const SizedBox(height: 32),
        _buildLocationCard(
          'Pickup Location',
          _pickupAddressController,
          _pickupDetailsController,
          Icons.store,
          Colors.orange,
          true,
        ),
        const SizedBox(height: 20),
        _buildLocationCard(
          'Delivery Location',
          _deliveryAddressController,
          _deliveryDetailsController,
          Icons.home,
          Colors.blue,
          false,
        ),
        const SizedBox(height: 24),
        _buildDistanceFeeCard(),
      ],
    );
  }

  Widget _buildLocationCard(
    String title,
    TextEditingController controller,
    TextEditingController detailsController,
    IconData icon,
    Color color,
    bool isPickup,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: TextStyle(
                  color: color,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MapPickerScreen(
                      initialLat: isPickup ? _pickupLat : _deliveryLat,
                      initialLng: isPickup ? _pickupLng : _deliveryLng,
                      title: isPickup ? 'Pick Pickup Location' : 'Pick Delivery Location',
                    ),
                  ),
                );
                
                if (result != null) {
                  setState(() {
                    if (isPickup) {
                      _pickupLat = result['latitude'];
                      _pickupLng = result['longitude'];
                    } else {
                      _deliveryLat = result['latitude'];
                      _deliveryLng = result['longitude'];
                    }
                    controller.text = result['address'] ?? 'Location Selected';
                  });
                  _calculateDeliveryFee();
                }
              },
              icon: Icon(Icons.map, color: Colors.white),
              label: Text(
                controller.text.isEmpty ? 'Enter Location' : 'Location Selected ✓',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: color,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          if (controller.text.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: color.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.location_on, color: color, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      controller.text,
                      style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: detailsController,
            style: const TextStyle(color: Colors.white),
            maxLines: 2,
            decoration: InputDecoration(
              labelText: 'More Details (Optional)',
              labelStyle: TextStyle(color: color.withOpacity(0.7)),
              hintText: 'e.g., Floor 3, Building B, Next to...',
              hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: color.withOpacity(0.2)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: color, width: 2),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDistanceFeeCard() {
    double distance = LocationService.calculateDistance(
      _pickupLat,
      _pickupLng,
      _deliveryLat,
      _deliveryLng,
    );

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.accent, AppColors.accent.withOpacity(0.7)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Estimated Distance',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              Text(
                '${distance.toStringAsFixed(2)} km',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          Container(
            width: 2,
            height: 40,
            color: Colors.white30,
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text(
                'Delivery Fee',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              Text(
                'KSH ${_calculatedFee.toStringAsFixed(0)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPackageStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '📦 Package Information',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Tell us about the package to be delivered',
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
        ),
        const SizedBox(height: 32),
        _buildTextField(
          controller: _packageDescriptionController,
          label: 'Package Description',
          icon: Icons.description,
          hint: 'e.g., Electronics, Food, Documents',
        ),
        const SizedBox(height: 20),
        _buildTextField(
          controller: _packageWeightController,
          label: 'Weight (kg)',
          icon: Icons.scale,
          hint: 'e.g., 2.5',
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: 20),
        const Text(
          'Package Size',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        _buildPackageSizeSelector(),
      ],
    );
  }

  Widget _buildPackageSizeSelector() {
    return Row(
      children: [
        Expanded(child: _buildSizeOption('Small', Icons.inventory_2_outlined)),
        const SizedBox(width: 12),
        Expanded(child: _buildSizeOption('Medium', Icons.inventory_outlined)),
        const SizedBox(width: 12),
        Expanded(child: _buildSizeOption('Large', Icons.inventory)),
      ],
    );
  }

  Widget _buildSizeOption(String size, IconData icon) {
    bool isSelected = _packageSize == size;
    return InkWell(
      onTap: () => setState(() => _packageSize = size),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accent.withOpacity(0.2) : AppColors.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.accent : Colors.white.withOpacity(0.1),
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.accent : Colors.white70,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              size,
              style: TextStyle(
                color: isSelected ? AppColors.accent : Colors.white70,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecipientStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '👤 Recipient Details',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Who will receive this package?',
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
        ),
        const SizedBox(height: 32),
        _buildTextField(
          controller: _recipientNameController,
          label: 'Recipient Name',
          icon: Icons.person,
          hint: 'Full name',
        ),
        const SizedBox(height: 20),
        _buildTextField(
          controller: _recipientPhoneController,
          label: 'Phone Number',
          icon: Icons.phone,
          hint: '254XXXXXXXXX',
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 20),
        _buildTextField(
          controller: _specialInstructionsController,
          label: 'Special Instructions (Optional)',
          icon: Icons.note,
          hint: 'Any special delivery notes...',
          maxLines: 4,
        ),
      ],
    );
  }

  Widget _buildScheduleStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '⏰ Schedule Delivery',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Deliver now or schedule for later',
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
        ),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.cardDark,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _isScheduled ? AppColors.accent : Colors.white.withOpacity(0.1),
            ),
          ),
          child: Column(
            children: [
              SwitchListTile(
                value: _isScheduled,
                onChanged: (value) => setState(() => _isScheduled = value),
                title: const Text(
                  'Schedule for Later',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  _isScheduled ? 'Pick a date and time' : 'Deliver as soon as possible',
                  style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                ),
                activeColor: AppColors.accent,
                contentPadding: EdgeInsets.zero,
              ),
              if (_isScheduled) ...[
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildScheduleButton(
                        icon: Icons.calendar_today,
                        label: _scheduledDate == null
                            ? 'Pick Date'
                            : DateFormat('MMM dd, yyyy').format(_scheduledDate!),
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: DateTime.now(),
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 30)),
                            builder: (context, child) {
                              return Theme(
                                data: ThemeData.dark().copyWith(
                                  colorScheme: ColorScheme.dark(
                                    primary: AppColors.accent,
                                    surface: AppColors.cardDark,
                                  ),
                                ),
                                child: child!,
                              );
                            },
                          );
                          if (date != null) {
                            setState(() => _scheduledDate = date);
                          }
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildScheduleButton(
                        icon: Icons.access_time,
                        label: _scheduledTime == null
                            ? 'Pick Time'
                            : _scheduledTime!.format(context),
                        onTap: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: TimeOfDay.now(),
                            builder: (context, child) {
                              return Theme(
                                data: ThemeData.dark().copyWith(
                                  colorScheme: ColorScheme.dark(
                                    primary: AppColors.accent,
                                    surface: AppColors.cardDark,
                                  ),
                                ),
                                child: child!,
                              );
                            },
                          );
                          if (time != null) {
                            setState(() => _scheduledTime = time);
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blue.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.blue.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: Colors.blue, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  _isScheduled
                      ? 'Scheduled deliveries will be assigned to riders 30 minutes before the scheduled time'
                      : 'Your delivery will be immediately available for riders to accept',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 12,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildScheduleButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.accent.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.accent),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '✅ Review & Confirm',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Please review your delivery details',
          style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14),
        ),
        const SizedBox(height: 32),
        _buildReviewCard(
          'Locations',
          Icons.location_on,
          [
            'From: ${_pickupAddressController.text}',
            'To: ${_deliveryAddressController.text}',
          ],
        ),
        const SizedBox(height: 16),
        _buildReviewCard(
          'Package',
          Icons.inventory_2,
          [
            _packageDescriptionController.text,
            '${_packageWeightController.text} kg - $_packageSize',
          ],
        ),
        const SizedBox(height: 16),
        _buildReviewCard(
          'Recipient',
          Icons.person,
          [
            _recipientNameController.text,
            _recipientPhoneController.text,
          ],
        ),
        if (_isScheduled) ...[
          const SizedBox(height: 16),
          _buildReviewCard(
            'Schedule',
            Icons.schedule,
            [
              'Date: ${DateFormat('MMM dd, yyyy').format(_scheduledDate!)}',
              'Time: ${_scheduledTime!.format(context)}',
            ],
          ),
        ],
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.accent, AppColors.accent.withOpacity(0.7)],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Fee',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  Text(
                    'From Your Wallet',
                    style: TextStyle(color: Colors.white70, fontSize: 10),
                  ),
                ],
              ),
              Text(
                'KSH ${_calculatedFee.toStringAsFixed(0)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.green.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.green.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Icon(Icons.account_balance_wallet, color: Colors.green, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Wallet Balance: KSH ${widget.user.walletBalance.toStringAsFixed(2)}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReviewCard(String title, IconData icon, List<String> details) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.accent, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...details.map((detail) => Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text(
              detail,
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 13,
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    String? hint,
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          maxLines: maxLines,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
            prefixIcon: Icon(icon, color: AppColors.accent),
            filled: true,
            fillColor: AppColors.cardDark,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.accent, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: _previousStep,
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: BorderSide(color: Colors.white.withOpacity(0.3)),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Back'),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _nextStep,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        color: Colors.black,
                        strokeWidth: 2,
                      ),
                    )
                  : Text(
                      _currentStep == 4 ? 'Confirm & Create' : 'Continue',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

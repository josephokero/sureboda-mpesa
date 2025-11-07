class AppConstants {
  // App Info
  static const String appName = 'SUREBODA';
  static const String appSlogan = 'Kwa Wakati, Kila Wakati';
  static const String appTagline = 'We Deliver, You Thrive.';
  
  // Firebase Collections
  static const String usersCollection = 'users';
  static const String deliveriesCollection = 'deliveries';
  static const String transactionsCollection = 'transactions';
  
  // M-Pesa Configuration (Use your actual credentials)
  static const String mpesaConsumerKey = 'YOUR_CONSUMER_KEY';
  static const String mpesaConsumerSecret = 'YOUR_CONSUMER_SECRET';
  static const String mpesaShortCode = 'YOUR_SHORTCODE';
  static const String mpesaPassKey = 'YOUR_PASSKEY';
  
  // Delivery Fee Calculation
  static const double baseFee = 100.0; // KSH
  static const double perKmRate = 30.0; // KSH per km
  static const double minimumWithdrawal = 500.0; // KSH
  
  // App Configuration
  static const int maxDeliveryDistance = 50; // km
  static const int deliveryTimeout = 30; // minutes
  
  // Regex Patterns
  static const String phonePattern = r'^(254|0)[17]\d{8}$';
  static const String emailPattern = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
}

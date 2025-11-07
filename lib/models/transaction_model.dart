import 'package:cloud_firestore/cloud_firestore.dart';

enum TransactionType { payment, earning, withdrawal, refund }

class TransactionModel {
  final String id;
  final String userId;
  final TransactionType type;
  final double amount;
  final DateTime timestamp;
  final String? deliveryId;
  final String? mpesaTransactionId;
  final String description;
  final double balanceAfter;

  TransactionModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.timestamp,
    this.deliveryId,
    this.mpesaTransactionId,
    required this.description,
    required this.balanceAfter,
  });

  factory TransactionModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    
    TransactionType parseType(String type) {
      switch (type) {
        case 'payment':
          return TransactionType.payment;
        case 'earning':
          return TransactionType.earning;
        case 'withdrawal':
          return TransactionType.withdrawal;
        case 'refund':
          return TransactionType.refund;
        default:
          return TransactionType.payment;
      }
    }

    return TransactionModel(
      id: doc.id,
      userId: data['userId'] ?? '',
      type: parseType(data['type'] ?? 'payment'),
      amount: (data['amount'] ?? 0.0).toDouble(),
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      deliveryId: data['deliveryId'],
      mpesaTransactionId: data['mpesaTransactionId'],
      description: data['description'] ?? '',
      balanceAfter: (data['balanceAfter'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toMap() {
    String typeToString(TransactionType type) {
      switch (type) {
        case TransactionType.payment:
          return 'payment';
        case TransactionType.earning:
          return 'earning';
        case TransactionType.withdrawal:
          return 'withdrawal';
        case TransactionType.refund:
          return 'refund';
      }
    }

    return {
      'userId': userId,
      'type': typeToString(type),
      'amount': amount,
      'timestamp': Timestamp.fromDate(timestamp),
      'deliveryId': deliveryId,
      'mpesaTransactionId': mpesaTransactionId,
      'description': description,
      'balanceAfter': balanceAfter,
    };
  }
}

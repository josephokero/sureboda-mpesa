// Types for payment records and payment status

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  description: string;
  type: 'debit' | 'credit';
}

export interface PaymentStatus {
  assignedDate: Date;
  lastPaidDate: Date | null;
  totalPaid: number;
  daysLate: number;
  overdueAmount: number;
  isCritical: boolean;
  paymentRecords: PaymentRecord[];
}

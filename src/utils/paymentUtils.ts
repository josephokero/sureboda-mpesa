// Utility for payment calculations and overdue logic
import { Timestamp } from 'firebase/firestore';

export function getDaysBetween(start: Date, end: Date): number {
  // Returns the number of days between two dates (inclusive of start, exclusive of end)
  const msPerDay = 24 * 60 * 60 * 1000;
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay);
}

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
}

export function isOverdue(daysLate: number): boolean {
  return daysLate > 0;
}

export function isCriticalOverdue(daysLate: number): boolean {
  return daysLate > 3;
}

// Convert Firestore Timestamp to JS Date
export function timestampToDate(ts: Timestamp | Date): Date {
  if (ts instanceof Date) return ts;
  return ts.toDate();
}

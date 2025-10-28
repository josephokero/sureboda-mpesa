// Utility to add a payment record for the current user
import { getAuth } from 'firebase/auth';
import { db } from '../firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function addUserPayment(amount: number, description: string) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not logged in');
  const payment = {
    amount,
    description,
    date: serverTimestamp(),
  };
  await addDoc(collection(db, 'users', user.uid, 'payments'), payment);
}

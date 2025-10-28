import React, { useState } from 'react';

// Replace with your IntaSend publishable key
const INTASEND_PUBLISHABLE_KEY = 'ISPubKey_live_74408962-eb3b-4785-a4c7-68a18e625eb2';

export default function MpesaTestPage() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
  const res = await fetch('http://localhost:5001/api/intasend/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phone,
          email: 'test@example.com', // You can make this dynamic if needed
          amount: Number(amount),
          narrative: 'Test M-Pesa STK Push',
        }),
      });
      const data = await res.json();
      if (data.status === 'PENDING' && data.invoice_url) {
        setStatus('Redirecting to payment...');
        window.location.href = data.invoice_url;
      } else if (data.status === 'SUCCESS') {
        setStatus('Payment successful!');
      } else {
        setStatus(data.message || 'Payment initiation failed.');
      }
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Test M-Pesa Payment (IntaSend)</h1>
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Phone Number (07...)</label>
            <input
              type="tel"
              className="border rounded px-3 py-2 w-full"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              pattern="07[0-9]{8}"
              placeholder="0712345678"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Amount (KES)</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded font-bold hover:bg-primary/90 transition"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay with M-Pesa'}
          </button>
        </form>
        {status && <div className="mt-4 text-center text-sm text-red-600">{status}</div>}
      </div>
    </div>
  );
}

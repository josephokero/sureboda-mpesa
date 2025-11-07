import React, { useState } from "react";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const MpesaLabelPayment = ({ amount, labelInfo, planType, planName, onSuccess, onClose }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    // Format phone number to 254XXXXXXXXX (accepts 07XXXXXXXXX and 01XXXXXXXXX)
    let formattedPhone = phone.trim();
    if (/^(07|01)\d{8}$/.test(formattedPhone)) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (/^\+254(7|1)\d{8}$/.test(formattedPhone)) {
      formattedPhone = formattedPhone.replace("+", "");
    }
    try {
      const res = await fetch(
        "https://kentune-mpesa-backend.vercel.app/api/mpesa/stk-push",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: formattedPhone,
            amount: Number(amount),
            narrative: "Kentunez Label Payment",
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        const checkoutId = data.data?.CheckoutRequestID;
        if (checkoutId) {
          let pollCount = 0;
          const pollInterval = setInterval(async () => {
            pollCount++;
            try {
              const statusRes = await fetch(`https://kentune-mpesa-backend.vercel.app/api/mpesa/payment-status/${checkoutId}`);
              const statusData = await statusRes.json();
              if (statusData.status === "paid") {
                setShowSuccess(true);
                setLoading(false);
                clearInterval(pollInterval);
                // Save label subscription info in Firestore
                try {
                  const db = getFirestore();
                  const now = new Date();
                  let expiryDate = new Date(now);
                  if (planType === "monthly") {
                    expiryDate.setMonth(expiryDate.getMonth() + 1);
                  } else {
                    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                  }
                  const subDoc = {
                    ...labelInfo,
                    paymentDate: now,
                    purchaseDate: serverTimestamp(),
                    planType: planType || "yearly",
                    planName: planName || (planType === "monthly" ? "Monthly Plan" : "Yearly Plan"),
                    amountPaid: Number(amount),
                    status: "active",
                    expiryDate,
                  };
                  await setDoc(doc(db, "labelsubscription", `${labelInfo.email}_${Date.now()}`), subDoc);
                  // Save to kentunezlabelsubmission collection
                  setSaving(true);
                  await setDoc(doc(db, "kentunezlabelsubmission", `${labelInfo.email}_${Date.now()}`), {
                    ...labelInfo,
                    paymentDate: now,
                    planType,
                    planName,
                    amountPaid: Number(amount),
                  });
                  setSaving(false);
                  setSaved(true);
                  if (typeof onSuccess === "function") onSuccess();
                } catch (err) {
                  setStatus("Payment succeeded but label submission was not created. Please contact support.");
                }
              } else if (statusData.status === "failed") {
                setStatus("Payment Declined");
                setLoading(false);
                clearInterval(pollInterval);
              }
              if (pollCount > 24) {
                setStatus("Payment Declined");
                setLoading(false);
                clearInterval(pollInterval);
              }
            } catch (err) {}
          }, 5000);
        } else {
          setLoading(false);
        }
      } else {
        setStatus(data.message || data.error || "Payment initiation failed.");
        setLoading(false);
      }
    } catch (err) {
      setStatus("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gradient-to-br from-yellow-50 via-orange-100 to-orange-50 rounded-3xl shadow-2xl p-10 w-full max-w-lg mx-auto text-center">
        <h2 className="text-3xl font-extrabold mb-4 text-orange-600">Pay with MPesa</h2>
        <p className="mb-6 text-lg text-gray-700">Enter your phone number to complete payment for your label registration.</p>
        <form onSubmit={handlePay} className="flex flex-col gap-6">
          <input
            type="tel"
            required
            placeholder="e.g. 07XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border-2 border-orange-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-orange-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-orange-600 transition"
          >
            {loading ? "Processing..." : `Pay Ksh ${amount}`}
          </button>
        </form>
        {status && <div className="mt-4 text-red-600 font-semibold">{status}</div>}
        {showSuccess && (
          <div className="mt-6 text-green-600 font-bold text-xl">
            Payment successful! Your label subscription is being created.<br />
            {saving && <span className="block mt-4 text-orange-600">Saving your information...</span>}
            {saved && (
              <span className="block mt-4 text-green-700">
                Saved and everything successful.<br />
                Call or text support: <a href="tel:0743066593" className="underline">0743066593</a><br />
                Wait for login details in your email or WhatsApp.
              </span>
            )}
          </div>
        )}
        <button className="mt-6 text-gray-600 underline" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default MpesaLabelPayment;

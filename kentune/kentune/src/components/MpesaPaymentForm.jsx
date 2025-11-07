import React, { useState } from "react";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';


export default function MpesaPaymentForm({ selectedAmount = '', isAmountReadOnly = false, planType = '', planName = '', onClose, successMessage, successButtonText, successButtonAction, onPaymentSuccess, externalLoading = false }) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(selectedAmount);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creatingSubscription, setCreatingSubscription] = useState(false);
  const [creationError, setCreationError] = useState("");

            // ...existing code...

  const handlePay = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);
    // Check if user is logged in
    const auth = getAuth();
    let uid = null;
    if (typeof window !== 'undefined') {
      uid = localStorage.getItem('kentunez-loggedin-uid');
    }
    const user = auth.currentUser;
    if (!uid && user) {
      uid = user.uid;
    }
    if (!uid) {
      setLoading(false);
      setStatus("You must log in or create an account first to pay.");
      setTimeout(() => {
        window.location.href = '/clean-sign-in-page?message=Please log in or create an account first.';
      }, 1500);
      return;
    }
    try {
      // Format phone number to 254XXXXXXXXX (accepts 07XXXXXXXXX and 01XXXXXXXXX)
      let formattedPhone = phone.trim();
      if (/^(07|01)\d{8}$/.test(formattedPhone)) {
        formattedPhone = "254" + formattedPhone.substring(1);
      } else if (/^\+254(7|1)\d{8}$/.test(formattedPhone)) {
        formattedPhone = formattedPhone.replace("+", "");
      }
      const res = await fetch(
        "https://kentune-mpesa-backend.vercel.app/api/mpesa/stk-push",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_number: formattedPhone,
            amount: Number(amount),
            narrative: "Kentunez Payment",
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        // Only show loading popup after prompt is sent
        setStatus("");
        const checkoutId = data.data?.CheckoutRequestID;
        if (checkoutId) {
          let pollCount = 0;
          const pollInterval = setInterval(async () => {
            pollCount++;
            try {
              const statusRes = await fetch(`https://kentune-mpesa-backend.vercel.app/api/mpesa/payment-status/${checkoutId}`);
              const statusData = await statusRes.json();
              if (statusData.status === 'paid') {
                setShowSuccess(true);
                setLoading(false);
                clearInterval(pollInterval);
                let subscriptionCreated = false;
                let subscriptionError = null;
                if (typeof onPaymentSuccess === 'function') {
                  onPaymentSuccess();
                } else {
                  // Save subscription/payment info in Firestore for current user
                  setCreatingSubscription(true);
                  setCreationError("");
                  try {
                    const db = getFirestore();
                    // Calculate expiry date
                    const now = new Date();
                    let expiryDate = new Date(now);
                    if (planType === 'monthly') {
                      expiryDate.setMonth(expiryDate.getMonth() + 1);
                    } else {
                      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                    }
                    // Save subscription document with UID as doc ID
                    const subDoc = {
                      userId: uid,
                      paymentDate: now,
                      purchaseDate: serverTimestamp(),
                      planType: planType || 'yearly',
                      planName: planName || (planType === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'),
                      amountPaid: Number(amount),
                      status: 'active',
                      expiryDate,
                    };
                    await setDoc(doc(db, 'subscriptions', uid), subDoc);
                    // Optionally update user profile with currentSubscriptionId
                    const profileRef = doc(db, 'profiles', uid);
                    await updateDoc(profileRef, { paymentStatus: 'paid', currentSubscriptionId: uid });
                    setCreatingSubscription(false);
                    setShowSuccess(true);
                    // Redirect instantly to dashboard
                    window.location.href = '/artist-dashboard';
                  } catch (err) {
                    setCreationError('Payment succeeded but subscription was not created. Please contact support.');
                    setCreatingSubscription(false);
                  }
                }
              } else if (statusData.status === 'failed') {
                setStatus('Payment Declined');
                setLoading(false);
                clearInterval(pollInterval);
              }
              // Stop polling after 2 minutes (timeout)
              if (pollCount > 24) {
                setStatus('Payment Declined');
                setLoading(false);
                clearInterval(pollInterval);
              }
            } catch (err) {
              // Ignore polling errors
            }
          }, 5000);
        } else {
          setLoading(false);
        }
      } else {
        console.error("MPesa Payment Error:", data);
        setStatus(data.message || data.error || "Payment initiation failed.");
        setLoading(false);
      }
    } catch (err) {
      setStatus("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: "2.5rem 1.5rem 2rem 1.5rem",
        background: "linear-gradient(90deg, #009e3a 0%, #00b14f 100%)",
        borderRadius: 24,
        boxShadow: "0 2px 32px 0 rgba(0,0,0,0.08)",
        color: "#fff",
        position: "relative",
      }}
    >
      <button
        onClick={() => {
          if (typeof onClose === 'function') onClose();
        }}
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          background: '#fff',
          color: '#009e3a',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '0.4rem 1.2rem',
          border: '1px solid #009e3a44',
          borderRadius: 10,
          cursor: 'pointer',
          zIndex: 2,
        }}
      >Close</button>
  {/* Removed debug message */}
      {/* Loading Popup for payment or external (mastering) upload */}
      {(loading || externalLoading) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            boxShadow: '0 2px 32px 0 rgba(0,0,0,0.18)',
            textAlign: 'center',
            minWidth: 280,
          }}>
            <div style={{ fontSize: '2.2rem', color: '#009e3a', fontWeight: 800, marginBottom: 12 }}>{loading ? 'Processing Payment...' : 'Uploading Track...'}</div>
            <div style={{ fontSize: '1.1rem', color: '#222', marginBottom: 8 }}>{loading ? 'Please wait while we confirm your payment.' : 'Please wait while we upload your track and save your mastering request.'}</div>
            <div className="loader" style={{ margin: '1.5rem auto 0 auto', width: 48, height: 48, border: '6px solid #e6ffe6', borderTop: '6px solid #009e3a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      {/* Subscription Creation Loading Popup */}
      {creatingSubscription && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            boxShadow: '0 2px 32px 0 rgba(0,0,0,0.18)',
            textAlign: 'center',
            minWidth: 280,
          }}>
            <div style={{ fontSize: '2.2rem', color: '#009e3a', fontWeight: 800, marginBottom: 12 }}>Payment Successful!</div>
            <div style={{ fontSize: '1.1rem', color: '#222', marginBottom: 8 }}>Creating your subscription... Please wait.</div>
            <div className="loader" style={{ margin: '1.5rem auto 0 auto', width: 48, height: 48, border: '6px solid #e6ffe6', borderTop: '6px solid #009e3a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
      {/* Error Popup */}
      {creationError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            boxShadow: '0 2px 32px 0 rgba(0,0,0,0.18)',
            textAlign: 'center',
            minWidth: 280,
          }}>
            <div style={{ fontSize: '2.2rem', color: '#d32f2f', fontWeight: 800, marginBottom: 12 }}>Error</div>
            <div style={{ fontSize: '1.1rem', color: '#222', marginBottom: 18 }}>{creationError}</div>
            <button onClick={() => setCreationError("")} style={{ background: '#e6ffe6', color: '#065f46', fontWeight: 700, fontSize: '1.1rem', padding: '0.7rem 2rem', border: '1px solid #009e3a44', borderRadius: 10, cursor: 'pointer', boxShadow: 'none', transition: 'all 0.2s' }}>Close</button>
          </div>
        </div>
      )}
      {/* Declined Popup */}
      {status === 'Payment Declined' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            boxShadow: '0 2px 32px 0 rgba(0,0,0,0.18)',
            textAlign: 'center',
            minWidth: 280,
          }}>
            <div style={{ fontSize: '2.2rem', color: '#d32f2f', fontWeight: 800, marginBottom: 12 }}>Payment Declined</div>
            <div style={{ fontSize: '1.1rem', color: '#222', marginBottom: 18 }}>Your payment was not completed. Please try again.</div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => { setStatus(""); setLoading(false); }}
                style={{
                  background: 'linear-gradient(90deg, #009e3a 0%, #00b14f 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  padding: '0.7rem 2rem',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px 0 #009e3a22',
                  transition: 'all 0.2s',
                }}
              >Pay Again</button>
              <button
                onClick={() => setStatus("")}
                style={{
                  background: '#e6ffe6',
                  color: '#065f46',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  padding: '0.7rem 2rem',
                  border: '1px solid #009e3a44',
                  borderRadius: 10,
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
      <img
        src="/assets/partners/header_image"
        alt="MPesa Header"
        style={{
          width: "100%",
          maxWidth: 320,
          margin: "0 auto 2rem auto",
          display: "block",
          borderRadius: 12,
        }}
      />
      <h1
        style={{
          fontSize: "2.2rem",
          fontWeight: 800,
          textAlign: "center",
          letterSpacing: "-1px",
          marginBottom: "0.5rem",
          color: "#fff",
        }}
      >
        Pay with MPesa
      </h1>
      <p
        style={{
          textAlign: "center",
          fontSize: "1.1rem",
          fontWeight: 500,
          marginBottom: "2rem",
          color: "#e6ffe6",
        }}
      >
        Secure, instant mobile payment for artists. Enter your details below to
        complete your payment.
      </p>
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 1px 8px 0 rgba(0,0,0,0.04)",
        }}
      >
        {/* Animated gradient background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            background: "linear-gradient(120deg, #fff 60%, #e6ffe6 100%)",
            animation: "gradientMove 6s ease-in-out infinite alternate",
          }}
        />
        {/* Geometric shapes for creativity */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            pointerEvents: "none",
          }}
          viewBox="0 0 400 300"
          fill="none"
        >
          <circle cx="340" cy="40" r="32" fill="#00b14f22" />
          <rect x="20" y="220" width="60" height="18" rx="9" fill="#009e3a22" />
          <circle cx="60" cy="60" r="18" fill="#009e3a11" />
        </svg>
  {/* Removed X icon close button as requested */}
        <form
          onSubmit={handlePay}
          className="flex flex-col gap-6"
          style={{
            background: "transparent",
            borderRadius: 16,
            padding: "2rem 1.5rem",
            color: "#222",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Phone Number Field */}
          <label
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              marginBottom: 8,
              color: "#065f46",
            }}
          >
            Phone Number
          </label>
          <input
            type="tel"
            required
            placeholder="e.g. 07XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            style={{
              fontSize: "1.1rem",
              padding: "0.75rem 1rem",
              border: "1px solid #009e3a",
              borderRadius: 8,
              marginBottom: 16,
              outline: "none",
              background: loading ? '#e6ffe6' : '#fff',
              color: loading ? '#065f46' : '#222',
              cursor: loading ? 'not-allowed' : 'auto',
            }}
          />
          {/* Amount Field */}
          <label
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              marginBottom: 8,
              color: "#065f46",
            }}
          >
            Amount (KES)
          </label>
          <input
            type="number"
            required
            min={1}
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            readOnly={isAmountReadOnly}
            disabled={loading}
            style={{
              fontSize: "1.1rem",
              padding: "0.75rem 1rem",
              border: "1px solid #009e3a",
              borderRadius: 8,
              marginBottom: 16,
              outline: "none",
              background: loading || isAmountReadOnly ? '#e6ffe6' : '#fff',
              color: loading || isAmountReadOnly ? '#065f46' : '#222',
              cursor: loading || isAmountReadOnly ? 'not-allowed' : 'auto',
            }}
          />
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #009e3a 0%, #00b14f 100%)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.2rem",
              padding: "0.9rem 0",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
          {/* Status message rendering remains unchanged */}
        </form>
      </div>
      <style>{`
                @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
            `}</style>
    </div>
  );
}

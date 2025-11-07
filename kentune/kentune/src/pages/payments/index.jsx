import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import './Payments.css';

const Payments = () => {
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('mpesa'); // Only 'mpesa'
  const [mpesa, setMpesa] = useState('');
  const [mpesaName, setMpesaName] = useState('');
  const [paypal, setPaypal] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState(true);
  const [justSent, setJustSent] = useState(false);

  useEffect(() => {
    let unsubProfile = null;
    let unsubEarnings = null;
    async function listenPaymentInfo() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return setLoading(false);
        const { doc, onSnapshot, collection, query, where } = await import('firebase/firestore');
        // Listen to profile for payment method
        const docRef = doc(db, 'profiles', user.uid);
        unsubProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMpesa(data.mpesa || '');
            setMpesaName(data.mpesaName || '');
            setPaypal(data.paypal || '');
            setPaymentMethod(data.paymentMethod || '');
            if (data.paymentMethod) {
              setEditMode(false);
            } else {
              setEditMode(true);
            }
          } else {
            setEditMode(true);
          }
          setLoading(false);
        }, () => setLoading(false));
        // Listen to earnings for balance
        const earningsQuery = query(collection(db, 'earnings'), where('artistId', '==', user.uid));
        unsubEarnings = onSnapshot(earningsQuery, (snap) => {
          const earningsArr = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEarnings(earningsArr);
          // Only sum payments with status 'pending' for available balance
          const pendingBalance = earningsArr.filter(e => e.status !== 'sent').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          setBalance(pendingBalance);
          // If there are no pending earnings, ensure profile balance is 0
          if (pendingBalance === 0) {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
              import('firebase/firestore').then(({ doc, updateDoc }) => {
                updateDoc(doc(db, 'profiles', user.uid), { balance: 0 });
              });
            }
          }
        });
      } catch (e) {
        setError('Failed to load payment info');
        setLoading(false);
      }
    }
  listenPaymentInfo();
  return () => { if (unsubProfile) unsubProfile(); if (unsubEarnings) unsubEarnings(); };
  }, []);

  useEffect(() => {
    let unsub = null;
    async function listenWithdrawalStatus() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return setWithdrawalLoading(false);
        const { doc, onSnapshot } = await import('firebase/firestore');
        const docRef = doc(db, 'withdrawal_requests', user.uid);
        unsub = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const status = docSnap.data().status || 'processing';
            setWithdrawalStatus(status);
            // If withdrawal is sent, reset local balance to 0
            if (status === 'sent') {
              setBalance(0);
            }
          } else {
            setWithdrawalStatus(null);
          }
          setWithdrawalLoading(false);
        }, () => setWithdrawalLoading(false));
      } catch (e) {
        setWithdrawalStatus(null);
        setWithdrawalLoading(false);
      }
    }
    listenWithdrawalStatus();
    return () => { if (unsub) unsub(); };
  }, []);


  const handleSave = async () => {
    setError('');
    setSuccess(false);
    if (!mpesa || !mpesaName) {
      setError('Please enter your M-Pesa number and full name');
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }
      await setDoc(doc(db, 'profiles', user.uid), {
        paymentMethod: 'mpesa',
        mpesa,
        mpesaName
      }, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError('Failed to save payment info');
    }
  };

  const TRANSACTION_COST = 30; // Example transaction cost in KSh
  const MIN_WITHDRAWAL = 150;
  const handleWithdraw = async () => {
    setError('');
    setSuccess(false);
    if (!paymentMethod) {
      setError('Please select and save a payment method first');
      return;
    }
    if (balance < MIN_WITHDRAWAL) {
      setError('Sorry, you have not reached the withdrawal limit of KSh 150.');
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }
      await setDoc(doc(db, 'withdrawal_requests', user.uid), {
        userId: user.uid,
        amount: balance,
  paymentMethod: 'mpesa',
  mpesa,
  mpesaName,
  requestedAt: new Date().toISOString(),
  status: 'pending',
  transactionCost: TRANSACTION_COST
      });
      setSuccess(true);
      setJustSent(true);
      setTimeout(() => setJustSent(false), 4000);
    } catch (e) {
      setError('Failed to request withdrawal');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="payments-bg min-h-screen flex flex-col items-center justify-center py-10 px-2" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #f8fdff 100%)' }}>
      <div className="w-full max-w-2xl relative animate-fade-in">
        <button onClick={() => window.history.back()} className="absolute left-6 top-6 flex items-center text-primary hover:underline font-medium z-10">
          <Icon name="ArrowLeft" size={18} className="mr-2" /> Go Back
        </button>


  {/* Plan payment/upgrade UI removed. Payments page is now for artist withdrawals only. */}

        {/* Balance Card */}
        <div className="w-full flex justify-center mb-8 mt-2" style={(withdrawalStatus === 'pending' || withdrawalStatus === 'processing' || justSent) ? { opacity: 0.5, filter: 'blur(1px)' } : {}}>
          <div className="bg-gradient-to-r from-green-400 via-green-300 to-blue-300 shadow-lg rounded-2xl px-8 py-6 flex items-center space-x-4 border-2 border-success/30">
            <Icon name="Wallet" size={40} className="text-white drop-shadow" />
            <div>
              <div className="text-xs text-white/80 font-medium uppercase tracking-wider">Balance</div>
              <div className="text-4xl font-extrabold text-white drop-shadow">KSh {balance.toLocaleString()}</div>
            </div>
          </div>
          {justSent && (
            <div className="absolute mt-20 text-success font-bold text-lg">Withdrawal sent! Your balance is now 0.</div>
          )}
        </div>
        <div className="w-full bg-white rounded-2xl shadow-2xl border border-border p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-1 text-foreground">Payments & Withdrawals</h2>
            <p className="text-muted-foreground text-base">Manage your payment methods, view your balance, and request withdrawals securely.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Payment Method</h3>
              {(!editMode) ? (
                <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Icon name="Phone" size={24} className="mr-2" />
                    <span className="font-semibold">M-Pesa</span>
                  </div>
                  <div className="text-sm text-foreground"><strong>Number:</strong> {mpesa}</div>
                  <div className="text-sm text-foreground"><strong>Name:</strong> {mpesaName}</div>
                  <Button onClick={() => setEditMode(true)} className="mt-4 w-full" variant="outline">Edit</Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex flex-col space-y-4">
                    <div>
                      <label className="block font-medium mb-1">M-Pesa Number</label>
                      <Input value={mpesa} onChange={e => setMpesa(e.target.value)} placeholder="Enter M-Pesa number" />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Full Name (as per M-Pesa)</label>
                      <Input value={mpesaName} onChange={e => setMpesaName(e.target.value)} placeholder="Enter your full name" />
                    </div>
                  </div>
                  <Button onClick={async () => { await handleSave(); setEditMode(false); }} className="w-full">Save Payment Info</Button>
                </>
              )}
            </div>
            <div>
              {/* Only show Withdraw Funds if payment method is saved and not in edit mode */}
              {(!editMode && paymentMethod) ? (
                <>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Withdraw Funds</h3>
                  {withdrawalLoading ? (
                    <div className="mb-4 text-muted-foreground text-sm">Checking withdrawal status...</div>
                  ) : (
                    <>
                      {/* Always show request UI if not pending/processing */}
                      {(!withdrawalStatus || withdrawalStatus === 'sent' || withdrawalStatus === 'rejected') && (
                        <>
                          <div className="mb-4 text-muted-foreground text-sm">
                            You cannot choose a custom withdrawal amount. You must withdraw your full balance as long as it is more than KSh 150.
                          </div>
                          <Button
                            onClick={handleWithdraw}
                            variant={justSent ? 'success' : 'success'}
                            className="w-full"
                            disabled={balance < 150 || justSent}
                          >
                            {justSent ? 'Sent' : 'Request Withdrawal of Full Balance'}
                          </Button>
                          <div className="text-xs text-muted-foreground mt-2">
                            Minimum withdrawal amount is KSh 150. Withdrawals are processed by the admin. You will be notified once your request is approved.
                          </div>
                        </>
                      )}
                      {/* Show status if pending/processing */}
                      {(withdrawalStatus === 'pending' || withdrawalStatus === 'processing') && (
                        <div className="mb-4 text-muted-foreground text-sm">
                          <span className="font-bold text-warning">Withdrawal Status: Processing</span><br/>
                          Your withdrawal request is being processed by the admin. Please wait.
                        </div>
                      )}
                      {/* Show rejected message if status is rejected and balance < 150 */}
                      {withdrawalStatus === 'rejected' && balance < 150 && (
                        <div className="mb-4 text-danger font-semibold">Withdrawal request was rejected. You do not have enough balance to request again.</div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground text-sm">Please save a payment method to enable withdrawals.</div>
              )}
            </div>
          </div>
          {success && <div className="mt-6 text-success text-center font-semibold">Success!</div>}
          {error && <div className="mt-6 text-danger text-center font-semibold">{error}</div>}
          {/* Trusted Badge */}
          <div className="mt-10 flex flex-col items-center">
            <span style={{display:'block', textAlign:'center'}}>
              <a href="https://intasend.com/security" target="_blank" rel="noopener noreferrer">
                <img src="https://intasend-prod-static.s3.amazonaws.com/img/trust-badges/intasend-trust-badge-v-light.png" width="220" alt="IntaSend Secure Payments (PCI-DSS Compliant)" style={{margin:'0 auto'}} />
              </a>
              <strong>
                <a style={{display:'block', color:'#454545', textDecoration:'none', fontSize:'0.8em', marginTop:'0.6em'}} href="https://intasend.com/security" target="_blank" rel="noopener noreferrer">
                  Secured by IntaSend Payments
                </a>
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;

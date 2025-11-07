import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { FaCheckCircle, FaStar, FaBolt, FaUsers, FaChartLine, FaClock, FaMusic } from 'react-icons/fa';
import PricingFAQ from './pricing-faq';
import PricingTestimonials from './pricing-testimonials';
import MpesaPaymentForm from '../components/MpesaPaymentForm';
// ...existing code...

const PromoCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    // 60 days from today
    const promoEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const timer = setInterval(() => {
      const now = new Date();
      const diff = promoEnd - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center justify-center gap-4 mt-4 mb-2">
      <FaClock className="text-orange-500" />
      <span className="font-bold text-orange-600">Promo ends in:</span>
      <span className="font-mono text-lg text-orange-700">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
    </div>
  );
};

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingType, setBillingType] = useState('monthly');

  const monthlyPlans = [
    {
      name: 'Starter (Testing the Waters)',
  priceKES: 300,
      highlight: true,
  description: 'Dip your toes into music distribution. Ideal for new artists releasing singles and collaborating with a friend.',
      features: [
        'Distribute unlimited singles',
        'No album or EP releases',
        'Up to 2 artists/collaborators',
        'No stats/analytics',
        '100% earnings',
        'Support response: 1-3 days',
        'Mastering audio available',
      ],
    },
    {
      name: 'Growth',
      priceKES: 400,
      popular: true,
  description: 'Step up your game! Grow your fanbase, collaborate, and get noticed by industry pros. Popular pick for rising stars.',
      features: [
        'Unlimited singles, albums, EPs',
        'Up to 3 artists/collaborators',
        'Basic stats/analytics',
        '100% earnings',
        'Support response: 1-2 days',
        'Mastering audio available',
        'Record deal advantage',
        'Get help directly with our admins (calling support)',
      ],
    },
    {
      name: 'Pro',
      priceKES: 650,
  description: 'Go pro and unlock the full toolkit: advanced stats, instant support, creative guidance, and fast payouts. For serious artists ready to level up.',
      features: [
        'Unlimited singles, albums, EPs',
        'Up to 3 collaborators',
        'Unlimited contributors (lyricist, etc.)',
        'Professional stats and daily stats',
        'Get support whenever you need (including video call support)',
  'Marketing included',
  'Mixing included',
  'Mastering audio available',
  'Access tutorials and guidance for success',
  'Get paid instantly',
  '100% earnings',
      ],
    },
    {
      name: 'Partnership (Invite Only)',
  priceKES: 0, // Display as '0 KES (Free)'
  description: 'The ultimate experience. Join by invitation, connect with our team, and enjoy exclusive perks, media features, and studio access.',
      features: [
        'Get all plans together for free',
        'Sign contracts',
        'Be featured in our media kits',
        'Get interviews',
        'Meet our developers, admins, and managers in person',
        'Get promotion',
        'Free music studio sessions',
      ],
    },
  ];
  const yearlyPlans = [
    {
      name: 'Starter (Testing the Waters)',
  priceKES: 1500,
      highlight: true,
  description: 'Dip your toes into music distribution. Ideal for new artists releasing singles and collaborating with a friend.',
      features: [
        'Distribute unlimited singles',
        'No album or EP releases',
        'Up to 2 artists/collaborators',
        'No stats/analytics',
        '100% earnings',
        'Support response: 1-3 days',
        'Mastering audio available',
      ],
    },
    {
      name: 'Growth',
  priceKES: 3500,
      popular: true,
  description: 'Step up your game! Grow your fanbase, collaborate, and get noticed by industry pros. Popular pick for rising stars.',
      features: [
        'Unlimited singles, albums, EPs',
        'Up to 3 artists/collaborators',
        'Basic stats/analytics',
        '100% earnings',
        'Support response: 1-2 days',
        'Mastering audio available',
        'Record deal advantage',
        'Get help directly with our admins (calling support)',
      ],
    },
    {
      name: 'Pro',
  priceKES: 6200,
  description: 'Go pro and unlock the full toolkit: advanced stats, instant support, creative guidance, and fast payouts. For serious artists ready to level up.',
      features: [
        'Unlimited singles, albums, EPs',
        'Up to 3 collaborators',
        'Unlimited contributors (lyricist, etc.)',
        'Professional stats and daily stats',
        'Get support whenever you need (including video call support)',
  'Marketing included',
  'Mixing included',
  'Mastering audio available',
  'Access tutorials and guidance for success',
  'Get paid instantly',
  '100% earnings',
      ],
    },
    {
      name: 'Partnership (Invite Only)',
      priceKES: null,
  description: 'The ultimate experience. Join by invitation, connect with our team, and enjoy exclusive perks, media features, and studio access.',
      features: [
        'Get all plans together for free',
        'Sign contracts',
        'Be featured in our media kits',
        'Get interviews',
        'Meet our developers, admins, and managers in person',
        'Get promotion',
        'Free music studio sessions',
      ],
    },
  ];
  const plans = billingType === 'monthly' ? monthlyPlans : yearlyPlans;

  return (
    <div className="min-h-screen bg-[#fdf6ee] flex flex-col items-center py-12 px-4 relative">
      {/* Billing Type Card */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 24px 0 rgba(0,0,0,0.08)',
        padding: '2rem 2.5rem',
        minWidth: 280,
        textAlign: 'center',
        marginBottom: 32,
        display: 'flex',
        gap: 24,
        justifyContent: 'center',
      }}>
        <button
          style={{
            background: billingType === 'monthly' ? '#009e3a' : '#e6ffe6',
            color: billingType === 'monthly' ? '#fff' : '#065f46',
            fontWeight: 700,
            fontSize: '1.1rem',
            padding: '0.7rem 2rem',
            border: '1px solid #009e3a44',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: 'none',
            transition: 'all 0.2s',
          }}
          onClick={() => setBillingType('monthly')}
        >Pay Monthly</button>
        <button
          style={{
            background: billingType === 'yearly' ? '#009e3a' : '#e6ffe6',
            color: billingType === 'yearly' ? '#fff' : '#065f46',
            fontWeight: 700,
            fontSize: '1.1rem',
            padding: '0.7rem 2rem',
            border: '1px solid #009e3a44',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: 'none',
            transition: 'all 0.2s',
          }}
          onClick={() => setBillingType('yearly')}
        >Pay Yearly</button>
      </div>
  {/* Removed Standout CTA Button */}
  <h1 className="text-5xl font-extrabold text-black mb-2">Pricing</h1>
  <p className="text-xl text-gray-800 mb-8 font-medium text-center max-w-2xl">
        {billingType === 'monthly' ? (
          <>Choose your <span className="text-black font-bold">Monthly</span> plan and unlock all features instantly.</>
        ) : (
          <>Choose your <span className="text-black font-bold">Yearly</span> plan and unlock all features instantly. <span className="text-black font-bold">Best Value!</span></>
        )}
      </p>
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`relative rounded-xl shadow-2xl p-8 flex flex-col items-center transition-transform duration-300 bg-white border border-black z-10 scale-105 book-card hover:scale-105`}
          >
            {plan.popular && (
              <div className="popular-badge animate-popular-bounce" style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#ff9800',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '0.4rem 1.2rem',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(255,152,0,0.18)',
                letterSpacing: '0.04em',
                zIndex: 2,
              }}>
                Popular
              </div>
            )}
            <div className="text-4xl font-extrabold mb-2 text-black">{plan.priceKES} <span className="text-lg font-normal">KES</span></div>
            <div className="text-2xl font-bold mb-2 text-black">{plan.name}</div>
            {plan.description && <div className="text-base mb-3 text-center font-medium text-gray-800">{plan.description}</div>}
            <ul className="text-base mb-4 list-none text-left w-full max-w-xs mx-auto text-black">
              {plan.features.map((feature, fidx) => (
                <li key={fidx} className="flex items-center mb-2 group">
                  <span className="inline-block w-6 h-6 mr-2 rounded-full bg-black flex items-center justify-center text-[#fdf6ee] text-xl font-bold shadow-md">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className="w-full text-center bg-black text-[#fdf6ee] font-bold py-2 px-6 rounded-xl hover:bg-[#fdf6ee] hover:text-black transition-colors shadow text-lg border border-black sticky-purchase-btn"
              onClick={() => {
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
                  window.location.href = '/clean-sign-in-page?message=Please log in or create an account first.';
                  return;
                }
                setSelectedPlan(plan);
              }}
            >
              Purchase Plan
            </button>
          </div>
        ))}
      </div>
      {selectedPlan && (() => {
        const auth = getAuth();
        let uid = null;
        if (typeof window !== 'undefined') {
          uid = localStorage.getItem('kentunez-loggedin-uid');
        }
        const user = auth.currentUser;
        if (!uid && user) {
          uid = user.uid;
        }
        if (!uid) return null;
        return (
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
            justifyContent: 'center'
          }}>
            <MpesaPaymentForm
              selectedAmount={selectedPlan.priceKES}
              isAmountReadOnly={true}
              planType={billingType}
              planName={selectedPlan.name}
              onClose={() => setSelectedPlan(null)}
            />
          </div>
        );
      })()}
      <PricingTestimonials />
      <PricingFAQ />
      <div className="mt-12 text-center text-lg text-orange-600 font-bold animate-bounce">Tell a friend to tell a friend and enjoy the promotion!</div>
      <style>{`
        .animate-popular-bounce {
          animation: popularBounce 1.2s infinite alternate;
        }
        @keyframes popularBounce {
          0% { transform: scale(1) translateY(0); box-shadow: 0 2px 12px rgba(255,152,0,0.18); }
          60% { transform: scale(1.08) translateY(-4px); box-shadow: 0 6px 24px rgba(255,152,0,0.22); }
          100% { transform: scale(1.04) translateY(-2px); box-shadow: 0 4px 16px rgba(255,152,0,0.20); }
        }
        .badge-classic {
          font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
          letter-spacing: 0.04em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-radius: 0.75rem;
        }
        .animate-badge-fade {
          animation: badgeFadeIn 1.2s ease-in;
        }
        @keyframes badgeFadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .book-card {
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 1.5px 0 #e5e5e5 inset;
          border-radius: 1.2rem 1.2rem 1.2rem 1.2rem;
          position: relative;
        }
        .book-card:before, .book-card:after {
          content: '';
          position: absolute;
          top: 0;
          width: 40%;
          height: 100%;
          background: rgba(0,0,0,0.04);
          z-index: 0;
          border-radius: 1.2rem;
          pointer-events: none;
        }
        .book-card:before {
          left: 0;
          box-shadow: 8px 0 24px -8px rgba(0,0,0,0.08);
        }
        .book-card:after {
          right: 0;
          box-shadow: -8px 0 24px -8px rgba(0,0,0,0.08);
        }
        .sticky-purchase-btn {
          position: static;
        }
        @media (max-width: 640px) {
          .book-card {
            padding: 1.2rem !important;
          }
          .badge-classic {
            font-size: 0.95rem !important;
            padding: 0.5rem 1rem !important;
          }
          .sticky-purchase-btn {
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 20;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
          }
        }
      `}</style>
    </div>
  );
}

// ...removed duplicate PricingPage declaration...

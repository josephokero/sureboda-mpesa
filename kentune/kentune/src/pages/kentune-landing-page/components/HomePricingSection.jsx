import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import MpesaPaymentForm from '../../../components/MpesaPaymentForm';

const HomePricingSection = () => {
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
      priceKES: 0,
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
      priceKES: 0,
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
    <section
      className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative"
      style={{
        backgroundImage: 'url(/assets/images/pricing.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-40 pointer-events-none"></div>
      <div className="relative">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <h2
            className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 bg-clip-text text-transparent animate-fadein font-[Montserrat,Segoe UI,sans-serif]"
            style={{fontFamily: 'Montserrat, Segoe UI, sans-serif', letterSpacing: '1px'}}
          >
            Kentunez Artist Dashboard Pricing Plans
          </h2>
          <p className="text-xl font-semibold mb-6 text-white drop-shadow-lg animate-fadein2" style={{textShadow:'0 2px 8px rgba(0,0,0,0.25)'}}>
            Your music journey deserves the best tools.<br />
            <span className="text-yellow-300">Choose a plan, unlock your potential, and let your sound inspire the world!</span>
          </p>
          <p className="text-lg font-semibold mb-6 text-orange-300 animate-fadein3" style={{textShadow:'0 2px 8px rgba(0,0,0,0.25)'}}>
            <span className="bg-black/40 px-2 py-1 rounded">Purchase a plan to be able to log in and enjoy the dashboard and all exclusive artist features.</span>
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <button
              className={`px-6 py-2 rounded-lg font-bold border ${billingType === 'monthly' ? 'bg-green-600 text-white' : 'bg-white text-green-600'}`}
              onClick={() => setBillingType('monthly')}
            >
              Pay Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-bold border ${billingType === 'yearly' ? 'bg-green-600 text-white' : 'bg-white text-green-600'}`}
              onClick={() => setBillingType('yearly')}
            >
              Pay Yearly
            </button>
          </div>
        </div>
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className="relative rounded-xl shadow-2xl p-8 flex flex-col items-center bg-white border border-black"
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-white font-bold px-4 py-1 rounded-full">Popular</div>
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
              justifyContent: 'center',
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
      </div>
      </div>
    </section>
  );
};

export default HomePricingSection;

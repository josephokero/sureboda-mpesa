import React from 'react';
import { useNavigate } from 'react-router-dom';

const OwnALabelSection = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: 'Yearly Plan',
      amount: 5500,
      type: 'yearly',
      label: 'Ksh 5,500 / year',
    },
    {
      name: '6-Month Plan',
      amount: 3000,
      type: '6-month',
      label: 'Ksh 3,000 / 6 months',
    },
    {
      name: 'Monthly Plan',
      amount: 1000,
      type: 'monthly',
      label: 'Ksh 1,000 / month',
    },
  ];
  return (
    <section
      className="relative py-20 px-4"
      style={{
        backgroundImage: 'url(/assets/images/ownlabel.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60 pointer-events-none"></div>
      <div className="relative max-w-5xl mx-auto text-center">
      <div className="mb-8">
        <div className="relative mb-8">
          <div className="relative inline-block w-full">
            <h2
              className="text-5xl font-extrabold mb-4 drop-shadow-lg bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 bg-clip-text text-transparent font-[Montserrat,Segoe UI,sans-serif]"
              style={{fontFamily: 'Montserrat, Segoe UI, sans-serif'}}
            >
              Kentunez gives you the opportunity to own a label<br />
              <span className="text-3xl font-bold bg-gradient-to-r from-white via-yellow-400 to-orange-500 bg-clip-text text-transparent">Powered by <span className="bg-gradient-to-r from-white via-yellow-400 to-orange-500 bg-clip-text text-transparent">AstuteProMusic</span></span>
            </h2>
            {/* Animated underline effect */}
            <span className="block h-2 w-2/3 mx-auto mt-2 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 animate-pulse" style={{animation: 'underlineAnim 2s infinite'}}></span>
            <style>{`
              @keyframes underlineAnim {
                0% { opacity: 0.5; transform: scaleX(0.8); }
                50% { opacity: 1; transform: scaleX(1.05); }
                100% { opacity: 0.5; transform: scaleX(0.8); }
              }
            `}</style>
          </div>
        </div>
        <p className="text-xl text-white mb-6 font-medium">
          Are you ready to take your music business to the next level? <span className="text-white font-bold">Kentunez</span>, in partnership with <span className="text-white font-bold">AstuteProMusic</span>, empowers you to launch and manage your own label with unlimited possibilities. Distribute music for unlimited artists, manage your roster, get <span className="text-yellow-600 font-bold">24/7 support</span>, <span className="text-white font-bold">OAC</span>, <span className="text-white font-bold">VEVO linking</span>, and exclusive resources to help your label thrive.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        {plans.map((plan, idx) => (
          <div key={plan.name} className="rounded-2xl p-8 bg-black/40 backdrop-blur-lg shadow-2xl hover:scale-105 transition-transform duration-300 border border-yellow-400" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.37)', border:'1.5px solid #FFD600'}}>
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-2xl font-semibold text-white mb-2">{plan.label}</p>
            <ul className="text-left text-white list-disc list-inside mb-4 text-lg">
              <li>Distribute unlimited artists</li>
              <li>Distribute unlimited tracks</li>
              <li>Manage unlimited artists</li>
              <li>24/7 dedicated support</li>
              <li>OAC & VEVO linking for your artists</li>
              <li>Exclusive label resources</li>
              <li>Priority onboarding & guidance</li>
            </ul>
            <button
              className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold hover:bg-orange-500 transition-all text-lg shadow"
              onClick={() => navigate(`/label-registration?plan=${plan.type}&amount=${plan.amount}&name=${encodeURIComponent(plan.name)}`)}
            >
              Choose {plan.name.split(' ')[0]}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <p className="text-lg text-white font-semibold">Start your journey to owning a label and empower your artists with <span className="text-white font-bold">Kentunez</span> & <span className="text-white font-bold">AstuteProMusic</span>!</p>
        <div className="flex justify-center mt-4 gap-4">
          <span className="inline-block px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur-md bg-purple-200/60 text-white border border-white/30" style={{boxShadow:'0 4px 16px 0 rgba(31, 38, 135, 0.18)', border:'1px solid rgba(255,255,255,0.18)'}}>Unlimited Artists</span>
          <span className="inline-block px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur-md bg-yellow-200/60 text-white border border-white/30" style={{boxShadow:'0 4px 16px 0 rgba(31, 38, 135, 0.18)', border:'1px solid rgba(255,255,255,0.18)'}}>24/7 Support</span>
          <span className="inline-block px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur-md bg-orange-200/60 text-white border border-white/30" style={{boxShadow:'0 4px 16px 0 rgba(31, 38, 135, 0.18)', border:'1px solid rgba(255,255,255,0.18)'}}>VEVO Linking</span>
          <span className="inline-block px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur-md bg-yellow-200/60 text-white border border-white/30" style={{boxShadow:'0 4px 16px 0 rgba(31, 38, 135, 0.18)', border:'1px solid rgba(255,255,255,0.18)'}}>OAC Access</span>
        </div>
      </div>
    </div>
  </section>
  );
};

export default OwnALabelSection;

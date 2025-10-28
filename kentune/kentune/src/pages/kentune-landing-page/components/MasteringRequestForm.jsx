import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const MasteringRequestForm = () => {
  const [artistName, setArtistName] = useState('');
  const [email, setEmail] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [trackFile, setTrackFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Simulate file upload to Firebase Storage (replace with actual upload logic)
  async function uploadTrack(file) {
    // TODO: Replace with actual upload logic
    return URL.createObjectURL(file); // For demo only
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!artistName || !email || !trackFile) {
      setError('Please fill all required fields and upload your track.');
      return;
    }
    setUploading(true);
    try {
      const trackUrl = await uploadTrack(trackFile);
      await addDoc(collection(db, 'public_mastering_requests'), {
        artistName,
        email,
        instructions,
        deliveryMethod,
        trackUrl,
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
      setArtistName('');
      setEmail('');
      setInstructions('');
      setDeliveryMethod('email');
      setTrackFile(null);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    }
    setUploading(false);
  };

  return (
    <div>
      {/* Animated separator line between sections */}
      <div className="relative w-full h-10 overflow-hidden -mt-8 z-20">
        <svg className="absolute left-0 top-0 w-full h-full" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="animate-wave" d="M0,20 Q360,40 720,20 T1440,20" stroke="url(#grad)" strokeWidth="5" fill="none" />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff6a00" />
              <stop offset="0.5" stopColor="#ffb347" />
              <stop offset="1" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
        <style>{`
          @keyframes wave {
            0% { stroke-dashoffset: 0; filter: drop-shadow(0 0 8px #ff6a00); }
            50% { stroke-dashoffset: 40; filter: drop-shadow(0 0 16px #d946ef); }
            100% { stroke-dashoffset: 0; filter: drop-shadow(0 0 8px #ff6a00); }
          }
          .animate-wave {
            stroke-dasharray: 1440;
            stroke-dashoffset: 0;
            animation: wave 3s ease-in-out infinite;
          }
        `}</style>
      </div>
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center py-20 px-2 overflow-hidden">
      {/* Vibrant, lively background with animated shapes and musical notes */}
  <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-100 via-pink-200 via-60% to-purple-900" />
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-pink-200 opacity-30 rounded-full blur-2xl animate-move-slow" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-purple-200 opacity-30 rounded-full blur-2xl animate-move-slow" />
      <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-orange-100 opacity-20 rounded-full blur-3xl animate-move-medium" style={{transform:'translate(-50%,-50%)'}} />
      {/* Musical notes SVGs */}
      <svg className="absolute left-10 top-24 w-10 h-10 opacity-40 animate-float" viewBox="0 0 24 24" fill="none"><path d="M7 17V7l10-2v10" stroke="#d946ef" strokeWidth="2" strokeLinecap="round"/></svg>
      <svg className="absolute right-16 top-40 w-8 h-8 opacity-30 animate-float-delay" viewBox="0 0 24 24" fill="none"><path d="M12 19V9l7-2v10" stroke="#f59e42" strokeWidth="2" strokeLinecap="round"/></svg>
      <svg className="absolute left-1/2 bottom-10 w-12 h-12 opacity-30 animate-float" style={{transform:'translateX(-50%)'}} viewBox="0 0 24 24" fill="none"><path d="M5 19V9l14-3v10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
      {/* Custom keyframes for animation */}
      <style>{`
        @keyframes move-slow { 0%{transform:translateY(0);} 50%{transform:translateY(30px);} 100%{transform:translateY(0);} }
        @keyframes move-medium { 0%{transform:translate(-50%,-50%) scale(1);} 50%{transform:translate(-50%,-55%) scale(1.05);} 100%{transform:translate(-50%,-50%) scale(1);} }
        @keyframes float { 0%{transform:translateY(0);} 50%{transform:translateY(-20px);} 100%{transform:translateY(0);} }
        @keyframes float-delay { 0%{transform:translateY(0);} 50%{transform:translateY(20px);} 100%{transform:translateY(0);} }
        @keyframes shine {
          0% { left: -100%; }
          60% { left: 100%; }
          100% { left: 100%; }
        }
        .animate-move-slow { animation: move-slow 8s ease-in-out infinite; }
        .animate-move-medium { animation: move-medium 10s ease-in-out infinite; }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 9s ease-in-out infinite; }
        .animate-shine > div { position: absolute; top:0; left:-100%; width:100%; height:100%; pointer-events:none; animation: shine 2.5s linear infinite; }
      `}</style>

      {/* Section Title */}
      <div className="relative z-10 text-center mb-10">
        <div className="relative inline-block">
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-wide animate-gradient-text"
            style={{
              fontFamily: 'Playfair Display, serif',
              background: 'linear-gradient(90deg, #ff6a00 0%, #ffb347 40%, #ff6a00 60%, #d946ef 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              textShadow: '0 2px 16px rgba(255,106,0,0.12), 0 1px 2px rgba(217,70,239,0.10)',
              letterSpacing: '0.04em',
              position: 'relative',
              zIndex: 1,
              transition: 'background 1s',
            }}
          >
            Get Your Music Mastered
          </h1>
          {/* Animated shine effect */}
          <span className="absolute left-0 top-0 w-full h-full pointer-events-none overflow-hidden" style={{zIndex:2}}>
            <span className="block w-1/3 h-full bg-gradient-to-r from-white/60 to-white/0 blur-lg animate-title-shine" style={{height:'100%',position:'absolute',left:0,top:0}}></span>
          </span>
          <style>{`
            @keyframes title-shine {
              0% { left: -40%; opacity: 0.7; }
              50% { left: 100%; opacity: 1; }
              100% { left: 100%; opacity: 0; }
            }
            .animate-title-shine {
              position: absolute;
              top: 0;
              left: -40%;
              width: 40%;
              height: 100%;
              animation: title-shine 2.5s linear infinite;
            }
          `}</style>
        </div>
        <p className="text-lg sm:text-xl font-medium mb-2 animate-fade-in" style={{color:'#d97706',fontFamily:'Playfair Display, serif'}}>World-class mastering for every artist. No account needed.</p>
      </div>

      {/* How We Work Card */}
      <div className="relative z-10 bg-gradient-to-br from-[#f8ecd4] via-white to-[#f8ecd4] rounded-[1.5rem] shadow-2xl p-8 mb-8 border-[1.5px] border-orange-300 flex flex-col items-center animate-fade-in" style={{fontFamily:'Playfair Display, serif', boxShadow:'0 8px 32px 0 rgba(255,140,0,0.12)'}}>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-orange-500 text-white rounded-full p-3 shadow-lg border-2 border-white">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </span>
          <h2 className="text-3xl font-extrabold text-orange-600 tracking-wide" style={{fontFamily:'Playfair Display, serif'}}>How We Work</h2>
        </div>
        <ul className="text-gray-800 text-lg list-disc ml-8 mb-2" style={{fontFamily:'Playfair Display, serif'}}>
          <li>Upload your track and details below.</li>
          <li>Our mastering engineers review and process your submission.</li>
          <li>Receive your mastered track via your chosen delivery method.</li>
          <li>No account required. Fast, secure, and professional.</li>
        </ul>
        <div className="mt-2 text-orange-700 text-base font-semibold italic text-center" style={{fontFamily:'Playfair Display, serif'}}>
          <span>Delivery time: <span className="font-bold">1-48 hrs</span> (often within an hour!)</span>
        </div>
      </div>

      {/* Side-by-side cards: Comparison + Form + Pricing */}
  <div className="relative z-10 w-full flex flex-col lg:flex-row gap-6 justify-center items-center">
        {/* Comparison Card */}
  <div className="flex-1 bg-white rounded-[2rem] shadow-[0_8px_32px_0_rgba(60,0,80,0.25)] p-3 border-[1.5px] border-pink-300 mb-8 lg:mb-0 flex flex-col justify-start items-center min-w-[220px] max-w-xs h-[420px] relative overflow-hidden">
    {/* Glass shine animation */}
    <div className="absolute inset-0 pointer-events-none z-10 animate-shine">
      <div style={{background:'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%)',opacity:0.7}} />
    </div>
          <div className="absolute top-0 left-0 w-10 h-10 bg-pink-400 rounded-tl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-400 rounded-br-[2rem]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-purple-300 rounded-bl-full" />
          <div className="absolute top-0 right-0 w-6 h-6 bg-pink-300 rounded-tr-full" />
          <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-wide">Hear the Difference</h3>
          <div className="flex flex-col gap-6 w-full">
            <div className="bg-white rounded-lg shadow p-1 flex flex-col items-center border border-gray-200 w-full mb-2 max-w-[220px] mx-auto">
              <span className="font-semibold text-gray-700 mb-1 text-xs">Normal Mix</span>
              <audio controls src="/assets/UNMASTERED SONG.mp3" className="w-full h-8" />
            </div>
            <div className="bg-white rounded-lg shadow p-1 flex flex-col items-center border border-gray-200 w-full mb-2 max-w-[220px] mx-auto">
              <span className="font-semibold text-gray-700 mb-1 text-xs">Dry Vocal</span>
              <audio controls src="/assets/VOCAL UNMASTERED.mp3" className="w-full h-8" />
            </div>
            <div className="bg-white rounded-lg shadow p-1 flex flex-col items-center border border-gray-200 w-full max-w-[220px] mx-auto">
              <span className="font-semibold text-pink-600 mb-1 text-xs">Polished Master</span>
              <audio controls src="/assets/MASTERED.mp3" className="w-full h-8" />
            </div>
          </div>
        </div>

        {/* Mastering Request Form Card */}
        <div className="flex-[1.2] w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_8px_32px_0_rgba(60,0,80,0.25)] p-10 border-[1.5px] border-pink-300 relative overflow-hidden">
          {/* Glass shine animation */}
          <div className="absolute inset-0 pointer-events-none z-10 animate-shine">
            <div style={{background:'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%)',opacity:0.7}} />
          </div>
          <div className="absolute top-0 left-0 w-12 h-12 bg-pink-400 rounded-tl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-indigo-400 rounded-br-[2rem]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-purple-300 rounded-bl-full" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-pink-300 rounded-tr-full" />
          <h2 className="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-3 tracking-tight">
            <span className="bg-pink-100 text-pink-600 rounded-full p-3">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            Mastering Request
          </h2>
          <p className="mb-6 text-gray-700 text-base">Submit your track for professional mastering. No account required!</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <input
              type="text"
              placeholder="Artist Name*"
              className="border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm bg-white"
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              required
            />
            {/* Delivery method-specific input */}
            {deliveryMethod === 'email' && (
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Your Email Address*"
                  className="border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm bg-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <span className="text-xs text-pink-600 font-semibold">Ensure this is accurate. This is what the engineer will use to communicate.</span>
              </div>
            )}
            {deliveryMethod === 'whatsapp' && (
              <div className="flex flex-col gap-2">
                <input
                  type="tel"
                  placeholder="WhatsApp Number*"
                  className="border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm bg-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <span className="text-xs text-pink-600 font-semibold">Ensure this is accurate. This is what the engineer will use to communicate.</span>
              </div>
            )}
            <textarea
              placeholder="Instructions (optional)"
              className="border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm bg-white min-h-[80px]"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
            <div>
              <label className="block mb-2 font-semibold text-pink-600">Track File* (MP3, WAV, etc.)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={e => setTrackFile(e.target.files[0])}
                required
                className="border border-gray-300 rounded-lg px-5 py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm bg-white"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-pink-600">Delivery Method</label>
              <select
                className="border border-gray-300 rounded-lg px-5 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-base shadow-sm bg-white"
                value={deliveryMethod}
                onChange={e => setDeliveryMethod(e.target.value)}
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <button
              type="button"
              className="bg-gray-400 text-white font-bold py-3 px-8 rounded-lg shadow text-lg tracking-wide cursor-not-allowed opacity-70"
              disabled
            >
              Coming Soon
            </button>
            {error && <div className="text-red-600 font-semibold mt-2">{error}</div>}
            {success && <div className="text-green-600 font-semibold mt-2 flex items-center gap-2"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22c55e" opacity=".2"/><path d="M7 13l3 3 7-7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/></svg>Request submitted successfully!</div>}
          </form>
        </div>

        {/* Pricing Card */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-[0_8px_32px_0_rgba(60,0,80,0.25)] p-4 border-[1.5px] border-pink-300 flex flex-col justify-center items-center min-w-[180px] max-w-xs h-[180px] relative overflow-hidden">
          {/* Glass shine animation */}
          <div className="absolute inset-0 pointer-events-none z-10 animate-shine">
            <div style={{background:'linear-gradient(120deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%)',opacity:0.7}} />
          </div>
          <div className="absolute top-0 left-0 w-10 h-10 bg-pink-400 rounded-tl-[2rem]" />
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-400 rounded-br-[2rem]" />
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-purple-300 rounded-bl-full" />
          <div className="absolute top-0 right-0 w-6 h-6 bg-pink-300 rounded-tr-full" />
          <div className="absolute top-0 right-0 bg-pink-500 text-white font-bold px-3 py-1 rounded-bl-2xl rounded-tr-[2rem] shadow text-base tracking-wide">KES 200</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-wide">Pricing</h3>
          <div className="text-xl font-extrabold text-pink-600 mb-1">KES 200</div>
          <div className="text-base text-gray-700 mb-2 font-semibold">per track</div>
          <div className="text-xs text-gray-700 text-center">For bulk mastering requests, <span className="font-semibold text-pink-600">contact support</span>.</div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default MasteringRequestForm;

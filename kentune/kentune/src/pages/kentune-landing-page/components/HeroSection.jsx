import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Music, Globe } from 'lucide-react';
import DashboardTeaser from '../../artist-dashboard/components/DashboardTeaser';

const HeroSection = ({ language = 'en' }) => {
  // Text dictionary
  const t = {
    tagline1: language === 'en' ? 'Distribute Your Music' : 'Sambaza Muziki Wako',
    tagline2: language === 'en' ? 'Across Kenya & Beyond' : 'Kenya na Zaidi',
    subtitle: language === 'en'
      ? "Join Kenya's leading music distribution platform. Get your music on Spotify, Apple Music, Boomplay and more. Receive royalty payments directly to your M-Pesa."
      : "Jiunge na jukwaa bora la usambazaji muziki Kenya. Pata muziki wako kwenye Spotify, Apple Music, Boomplay na zaidi. Pokea malipo ya royalty moja kwa moja kwa M-Pesa yako.",
    cta: language === 'en' ? 'Start Your Music Journey' : 'Anza Safari Yako ya Muziki',
    demo: language === 'en' ? 'Watch Demo' : 'Tazama Demo',
    statArtists: language === 'en' ? 'Kenyan Artists' : 'Wasanii wa Kenya',
    statStreams: language === 'en' ? 'Streams Generated' : 'Mzunguko Uliopatikana',
    statPlatforms: language === 'en' ? 'Platforms' : 'Majukwaa',
    heroTitle: language === 'en' ? 'Kenyan Music Goes Global' : 'Muziki wa Kenya Wafika Ulimwenguni',
    heroDesc: language === 'en' ? 'Distribute your music worldwide and reach new audiences.' : 'Sambaza muziki wako duniani kote na ufikie mashabiki wapya.',
    liveSpotify: language === 'en' ? 'Live on Spotify' : 'Moja kwa Moja Spotify',
    mpesaPayout: language === 'en' ? 'M-Pesa Payout' : 'Malipo ya M-Pesa',
  };
  return (
    <section className="relative bg-gradient-to-br from-orange-50 to-orange-100 py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 transform rotate-6 scale-110"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            {/* Logo and H1 removed as requested */}
            {/* Tagline */}
            <h2 className="text-5xl font-extrabold text-gray-900 mb-2 leading-tight drop-shadow-md text-center">
              {t.tagline1}
            </h2>
            <h2 className="text-5xl font-bold mb-2 leading-tight text-orange-600 text-center" style={{fontWeight:'bold', fontFamily:'Montserrat, Segoe UI, sans-serif'}}>
              {t.tagline2}
            </h2>
            <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto lg:mx-0 text-center">
              {t.subtitle}
            </p>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/artist-registration"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-xl"
              >
                <Music className="w-5 h-5" />
                {t.cta}
              </Link>
              <a
                href="https://youtube.com/@kentunez_music?si=H97KvovGA9wMAgh4"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-xl"
              >
                <Play className="w-5 h-5" />
                {t.demo}
              </a>
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">{t.statArtists}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50M+</div>
                <div className="text-sm text-gray-600">{t.statStreams}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">20+</div>
                <div className="text-sm text-gray-600">{t.statPlatforms}</div>
              </div>
            </div>
          </div>
          
          {/* Hero Image/Video Area */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-8 shadow-2xl">
                <div className="aspect-video bg-black/20 rounded-xl flex flex-col items-center justify-center">
                  <div className="text-center text-white mb-4">
                    <Globe className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-medium">{t.heroTitle}</p>
                    <p className="text-sm opacity-80 mb-2">{t.heroDesc}</p>
                  </div>
                  {/* Dashboard Teaser Preview */}
                  <div className="w-full flex justify-center">
                    <DashboardTeaser />
                  </div>
                  {/* Removed 'Preview coming soon' text for a cleaner look */}
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg p-3 shadow-lg hidden lg:block">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{t.liveSpotify}</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg p-3 shadow-lg hidden lg:block">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{t.mpesaPayout}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
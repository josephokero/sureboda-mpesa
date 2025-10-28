import React from 'react';
import { Globe, Play, Smartphone, Music } from 'lucide-react';
import { SiSpotify, SiApplemusic, SiYoutubemusic, SiAmazonmusic, SiTidal } from 'react-icons/si';
import { MdMusicNote } from 'react-icons/md';

const PlatformIntegrations = () => {
  const globalPlatforms = [
    { name: 'Spotify', icon: <SiSpotify className="w-10 h-10" color="#1DB954" />, users: '400M+' },
    { name: 'Apple Music', icon: <SiApplemusic className="w-10 h-10" color="#FA243C" />, users: '100M+' },
    { name: 'YouTube Music', icon: <SiYoutubemusic className="w-10 h-10" color="#FF0000" />, users: '80M+' },
    { name: 'Amazon Music', icon: <SiAmazonmusic className="w-10 h-10" color="#FF9900" />, users: '75M+' },
  { name: 'Deezer', icon: <MdMusicNote className="w-10 h-10" color="#FF0000" />, users: '16M+' },
    { name: 'Tidal', icon: <SiTidal className="w-10 h-10" color="#00FFFF" />, users: '5M+' }
  ];

  const localPlatforms = [
    { name: 'Boomplay', icon: <Play className="w-8 h-8 text-yellow-500" />, users: '85M+', region: 'Africa' }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Your Music, Everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Distribute your music to major global streaming platforms and local Kenyan services 
            with a single upload. Reach listeners worldwide and in your home market.
          </p>
        </div>
        
        {/* Global Platforms */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Globe className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-semibold text-gray-900">Global Platforms</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {globalPlatforms?.map((platform, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-200 group">
                <div className="mb-3 group-hover:scale-110 transition-transform duration-200 flex justify-center">{platform?.icon}</div>
                <div className="font-semibold text-gray-900 mb-1">{platform?.name}</div>
                <div className="text-sm text-gray-600">{platform?.users} users</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Local/African Platforms */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Smartphone className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-semibold text-gray-900">African & Kenyan Platforms</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {localPlatforms?.map((platform, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-200 group border-2 border-orange-100">
                <div className="mb-3 group-hover:scale-110 transition-transform duration-200 flex justify-center">{platform?.icon}</div>
                <div className="font-semibold text-gray-900 mb-1">{platform?.name}</div>
                <div className="text-sm text-orange-600 font-medium mb-1">{platform?.region}</div>
                <div className="text-sm text-gray-600">{platform?.users} users</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Distribution Stats */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">150+</div>
              <div className="text-gray-600">Streaming Platforms</div>
            </div>
            
            <div>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">200+</div>
              <div className="text-gray-600">Countries Reached</div>
            </div>
            
            <div>
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24hrs</div>
              <div className="text-gray-600">Average Go-Live Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformIntegrations;
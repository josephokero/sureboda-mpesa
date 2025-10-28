import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const WelcomeBanner = ({ artist }) => {
  const currentHour = new Date()?.getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
              <Image
                src={artist?.avatar || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&crop=face"}
                alt={`${artist?.name} profile`}
                className="w-full h-full object-cover"
              />
            </div>
            {artist?.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={14} color="white" />
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-heading font-bold">
              {getGreeting()}, {artist?.name}!
            </h1>
            <p className="text-white/80 text-sm">
              {artist?.isVerified ? 'Verified Artist' : 'Artist Profile'} • {artist?.genre}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2">
          <div className="text-right">
            <p className="text-xs text-white/60">Member Since</p>
            <p className="text-sm font-medium">{artist?.memberSince}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Icon name="Music" size={16} />
            <span className="text-sm">{artist?.totalTracks} Tracks</span>
          </div>
          {/* Followers removed as requested */}
        </div>

        <div className="flex items-center space-x-2">
          {artist?.distributionStatus === 'active' && (
            <div className="flex items-center space-x-1 bg-success/20 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-xs">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfilePreview = ({ profileData, currentLanguage }) => {
  const mockStats = {
    totalStreams: 125430,
    monthlyListeners: 8920,
    followers: 2340,
    tracksReleased: 12
  };

  const mockRecentTracks = [
    {
      id: 1,
      title: "Nairobi Nights",
      plays: 15420,
      duration: "3:45",
      coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Kenyan Dreams",
      plays: 8930,
      duration: "4:12",
      coverArt: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Mombasa Vibes",
      plays: 6750,
      duration: "3:28",
      coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000)?.toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000)?.toFixed(1) + 'K';
    }
    return num?.toString();
  };

  const getGenreDisplay = () => {
    if (!profileData?.genres || profileData?.genres?.length === 0) {
      return currentLanguage === 'en' ? 'No genres selected' : 'Hakuna aina zilizochaguliwa';
    }
    return profileData?.genres?.slice(0, 3)?.join(', ');
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground">
            {currentLanguage === 'en' ? 'Profile Preview' : 'Muhtasari wa Wasifu'}
          </h3>
          <div className="flex items-center space-x-2">
            <Icon name="Eye" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {currentLanguage === 'en' ? 'Public View' : 'Mwonekano wa Umma'}
            </span>
          </div>
        </div>
      </div>
      {/* Banner Image */}
      <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20">
        {profileData?.bannerImage ? (
          <Image
            src={profileData?.bannerImage}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="Image" size={32} className="text-muted-foreground" />
          </div>
        )}
        
        {/* Profile Photo Overlay */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 rounded-full border-4 border-background overflow-hidden bg-muted">
            {profileData?.profilePhoto ? (
              <Image
                src={profileData?.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="User" size={24} className="text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Verification Badge */}
        {profileData?.verificationStatus === 'verified' && (
          <div className="absolute -bottom-2 left-16">
            <div className="bg-success text-success-foreground rounded-full p-1">
              <Icon name="CheckCircle" size={16} />
            </div>
          </div>
        )}
      </div>
      {/* Profile Info */}
      <div className="p-6 pt-12">
        <div className="space-y-4">
          {/* Name and Location */}
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">
              {profileData?.stageName || (currentLanguage === 'en' ? 'Your Stage Name' : 'Jina Lako la Jukwaani')}
            </h2>
            {profileData?.location && (
              <div className="flex items-center space-x-1 mt-1">
                <Icon name="MapPin" size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground capitalize">
                  {profileData?.location}
                </span>
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profileData?.bio || (currentLanguage === 'en' ?'Your bio will appear here. Tell your fans about your music journey and what inspires you.' :'Maelezo yako yataonekana hapa. Waambie mashabiki wako kuhusu safari yako ya muziki na kinachokuvutia.'
              )}
            </p>
          </div>

          {/* Genres */}
          <div className="flex items-center space-x-2">
            <Icon name="Music" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {getGenreDisplay()}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-border">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{formatNumber(mockStats?.totalStreams)}</p>
              <p className="text-xs text-muted-foreground">
                {currentLanguage === 'en' ? 'Total Streams' : 'Jumla ya Mtiririko'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{formatNumber(mockStats?.monthlyListeners)}</p>
              <p className="text-xs text-muted-foreground">
                {currentLanguage === 'en' ? 'Monthly Listeners' : 'Wasikilizaji wa Kila Mwezi'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{formatNumber(mockStats?.followers)}</p>
              <p className="text-xs text-muted-foreground">
                {currentLanguage === 'en' ? 'Followers' : 'Wafuasi'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{mockStats?.tracksReleased}</p>
              <p className="text-xs text-muted-foreground">
                {currentLanguage === 'en' ? 'Tracks' : 'Nyimbo'}
              </p>
            </div>
          </div>

          {/* Social Links */}
          {profileData?.socialLinks && Object.values(profileData?.socialLinks)?.some(link => link) && (
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-2">
                {currentLanguage === 'en' ? 'Follow Me' : 'Nifuate'}
              </p>
              <div className="flex items-center space-x-3">
                {Object.entries(profileData?.socialLinks)?.map(([platform, url]) => {
                  if (!url) return null;
                  
                  const iconMap = {
                    instagram: 'Instagram',
                    twitter: 'Twitter',
                    facebook: 'Facebook',
                    youtube: 'Youtube',
                    tiktok: 'Music'
                  };

                  return (
                    <button
                      key={platform}
                      className="w-8 h-8 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Icon name={iconMap?.[platform] || 'Link'} size={16} className="text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Tracks */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">
                {currentLanguage === 'en' ? 'Recent Tracks' : 'Nyimbo za Hivi Karibuni'}
              </p>
              <Button variant="ghost" size="sm">
                <span className="text-xs">
                  {currentLanguage === 'en' ? 'View All' : 'Ona Zote'}
                </span>
              </Button>
            </div>
            <div className="space-y-2">
              {mockRecentTracks?.map((track) => (
                <div key={track?.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded bg-muted overflow-hidden">
                    <Image
                      src={track?.coverArt}
                      alt={track?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{track?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(track?.plays)} {currentLanguage === 'en' ? 'plays' : 'michezaji'} • {track?.duration}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Icon name="Play" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border pt-4 space-y-2">
            <Button variant="default" size="sm" fullWidth iconName="UserPlus" iconPosition="left">
              {currentLanguage === 'en' ? 'Follow' : 'Fuata'}
            </Button>
            <Button variant="outline" size="sm" fullWidth iconName="MessageCircle" iconPosition="left">
              {currentLanguage === 'en' ? 'Message' : 'Ujumbe'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;
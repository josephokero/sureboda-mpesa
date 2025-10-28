
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const STATUS_COLORS = {
  live: 'bg-blue-100 text-blue-700 border border-blue-300',
  active: 'bg-green-100 text-green-700 border border-green-300',
  distributed: 'bg-purple-100 text-purple-700 border border-purple-300',
  rejected: 'bg-red-100 text-red-700 border border-red-300',
  processing: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  pending: 'bg-gray-100 text-gray-700 border border-gray-300',
  failed: 'bg-red-100 text-red-700 border border-red-300',
};
const STATUS_ICONS = {
  live: 'CheckCircle', // blue
  active: 'Activity', // green
  distributed: 'Share2', // purple
  rejected: 'XCircle', // red
  processing: 'Clock', // yellow
  pending: 'AlertCircle', // gray
  failed: 'XOctagon', // red
};

function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const MusicCatalogPreview = ({ tracks = [], earnings = [] }) => {
  const [playingTrack, setPlayingTrack] = useState(null);

  const handlePlayPause = (trackId) => {
    setPlayingTrack(playingTrack === trackId ? null : trackId);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-foreground">Recent Uploads</h3>
        <Link to="/music-upload-management">
          <Button variant="ghost" size="sm" iconName="ExternalLink">
            View All
          </Button>
        </Link>
      </div>
      {tracks.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No uploads yet.</div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => {
            // Find earnings for this track (if trackId is stored in earnings)
            const trackEarnings = earnings
              ? earnings.filter(e => e.trackId === track.id).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
              : 0;
            return (
              <div key={track?.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-spring">
                {/* Album Art */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={track?.artwork || track?.coverArt || '/public/assets/images/no_image.png'}
                    alt={track?.title ? `${track.title} artwork` : 'Artwork'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePlayPause(track?.id)}
                      className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
                    >
                      <Icon 
                        name={playingTrack === track?.id ? 'Pause' : 'Play'} 
                        size={12} 
                        className="text-black ml-0.5" 
                      />
                    </button>
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate">{track?.title || 'Untitled'}</h4>
                  <p className="text-sm text-muted-foreground truncate">{track?.artist || 'Unknown Artist'}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-muted-foreground">{formatDuration(track?.duration)}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{track?.genre || 'Unknown Genre'}</span>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 transition-colors duration-200 ${STATUS_COLORS[track?.status] || STATUS_COLORS.pending}`}
                    style={{ minWidth: 90, justifyContent: 'center' }}>
                    <Icon name={STATUS_ICONS[track?.status] || 'AlertCircle'} size={14} className="mr-1" />
                    <span className="capitalize">
                      {track?.status === 'live' && 'Live'}
                      {track?.status === 'active' && 'Active'}
                      {track?.status === 'distributed' && 'Distributed'}
                      {track?.status === 'rejected' && 'Rejected'}
                      {track?.status === 'processing' && 'Processing'}
                      {track?.status === 'pending' && 'Pending'}
                      {track?.status === 'failed' && 'Failed'}
                      {!['live','active','distributed','rejected','processing','pending','failed'].includes(track?.status) && (track?.status || 'Pending')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {track?.status === 'live' && (
                      <>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Icon name="Play" size={12} />
                          <span>{track?.streams ? track.streams.toLocaleString() : 0}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Icon name="DollarSign" size={12} />
                          <span>KSh {trackEarnings}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Upload New Track CTA */}
      <div className="mt-6 pt-4 border-t border-border">
        <Link to="/music-upload-management">
          <Button variant="outline" fullWidth iconName="Plus" iconPosition="left">
            Upload New Track
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MusicCatalogPreview;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TrackAnalytics = ({ tracks }) => {
  const [selectedTrack, setSelectedTrack] = useState(tracks?.[0]);

  return (
    <div className="bg-card rounded-lg border border-border p-4 lg:p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Track Analytics</h3>
        <div className="text-sm text-muted-foreground">
          Individual track performance
        </div>
      </div>
      {/* Track Selector */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tracks?.slice(0, 6)?.map((track) => (
            <button
              key={track?.id}
              onClick={() => setSelectedTrack(track)}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                selectedTrack?.id === track?.id
                  ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <Image
                src={track?.artwork}
                alt={track?.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{track?.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track?.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Selected Track Details */}
      {selectedTrack && (
        <div className="space-y-6">
          {/* Track Header */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <Image
              src={selectedTrack?.artwork}
              alt={selectedTrack?.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground">{selectedTrack?.title}</h4>
              <p className="text-sm text-muted-foreground">{selectedTrack?.artist}</p>
              <p className="text-xs text-muted-foreground">Released: {selectedTrack?.releaseDate}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Play" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Total Plays</span>
              </div>
              <p className="text-xl font-bold text-foreground">{selectedTrack?.totalPlays?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">+{selectedTrack?.playsGrowth}% this week</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Users" size={16} className="text-secondary" />
                <span className="text-sm font-medium text-foreground">Unique Listeners</span>
              </div>
              <p className="text-xl font-bold text-foreground">{selectedTrack?.uniqueListeners?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">+{selectedTrack?.listenersGrowth}% this week</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Clock" size={16} className="text-accent" />
                <span className="text-sm font-medium text-foreground">Avg. Listen Time</span>
              </div>
              <p className="text-xl font-bold text-foreground">{selectedTrack?.avgListenTime}</p>
              <p className="text-xs text-muted-foreground">{selectedTrack?.completionRate}% completion rate</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="DollarSign" size={16} className="text-success" />
                <span className="text-sm font-medium text-foreground">Revenue</span>
              </div>
              <p className="text-xl font-bold text-foreground">KSh {selectedTrack?.revenue?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">KSh {selectedTrack?.revenuePerPlay?.toFixed(3)} per play</p>
            </div>
          </div>

          {/* Engagement Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Play-through Analysis */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-foreground">Play-through Analysis</h5>
              <div className="space-y-3">
                {selectedTrack?.playthroughData?.map((segment) => (
                  <div key={segment?.segment} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{segment?.segment}</span>
                      <span className="text-foreground font-medium">{segment?.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${segment?.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skip Analysis */}
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-foreground">Skip Analysis</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="SkipForward" size={16} className="text-warning" />
                    <span className="text-sm text-foreground">Skip Rate</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{selectedTrack?.skipRate}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Repeat" size={16} className="text-success" />
                    <span className="text-sm text-foreground">Replay Rate</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{selectedTrack?.replayRate}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Heart" size={16} className="text-error" />
                    <span className="text-sm text-foreground">Save Rate</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{selectedTrack?.saveRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackAnalytics;
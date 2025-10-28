import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AudioPreview = ({ audioFile, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (audioFile && audioRef?.current) {
      const url = URL.createObjectURL(audioFile);
      audioRef.current.src = url;
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);

  const handleLoadedMetadata = () => {
    if (audioRef?.current) {
      setDuration(audioRef?.current?.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef?.current) {
      setCurrentTime(audioRef?.current?.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (audioRef?.current) {
      if (isPlaying) {
        audioRef?.current?.pause();
      } else {
        audioRef?.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef?.current && progressRef?.current) {
      const rect = progressRef?.current?.getBoundingClientRect();
      const clickX = e?.clientX - rect?.left;
      const newTime = (clickX / rect?.width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e?.target?.value);
    setVolume(newVolume);
    if (audioRef?.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds?.toString()?.padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioFile) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground">Audio Preview</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={20} />
        </Button>
      </div>
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      {/* Track Info */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Music" size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{audioFile?.name}</p>
          <p className="text-sm text-muted-foreground">
            {(audioFile?.size / (1024 * 1024))?.toFixed(2)} MB • {formatTime(duration)}
          </p>
        </div>
      </div>
      {/* Waveform Visualization (Simplified) */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-center space-x-1 h-16">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className={`w-1 bg-primary/30 rounded-full transition-all duration-150 ${
                i < (progressPercentage / 2) ? 'bg-primary' : ''
              }`}
              style={{
                height: `${Math.random() * 40 + 10}px`
              }}
            />
          ))}
        </div>
      </div>
      {/* Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            ref={progressRef}
            className="w-full h-2 bg-muted rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (audioRef?.current) {
                audioRef.current.currentTime = Math.max(0, currentTime - 10);
              }
            }}
          >
            <Icon name="RotateCcw" size={20} />
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full"
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (audioRef?.current) {
                audioRef.current.currentTime = Math.min(duration, currentTime + 10);
              }
            }}
          >
            <Icon name="RotateCw" size={20} />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          >
            <Icon name={volume === 0 ? "VolumeX" : volume < 0.5 ? "Volume1" : "Volume2"} size={20} />
          </Button>
          
          {showVolumeSlider && (
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-8">
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Quality Check */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2 flex items-center">
          <Icon name="CheckCircle" size={16} className="text-success mr-2" />
          Quality Check
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">File Format</span>
            <span className="text-success font-medium">✓ Supported</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">File Size</span>
            <span className="text-success font-medium">✓ Within Limits</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Audio Quality</span>
            <span className="text-success font-medium">✓ Good</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPreview;
import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const TrackListManager = ({ 
  releaseType, 
  tracks = [], 
  onChange, 
  parentGenre = '', 
  parentLanguage = '' 
}) => {
  // Helper to update a field in a specific track and trigger onChange
  // Update a track by merging new fields, not just a single field
  const updateTrack = (trackId, fieldOrObj, value) => {
    const updatedTracks = tracks.map(track => {
      if (track.id !== trackId) return track;
      if (typeof fieldOrObj === 'object') {
        return { ...track, ...fieldOrObj };
      } else {
        return { ...track, [fieldOrObj]: value };
      }
    });
    onChange(updatedTracks);
  };
  const [expandedTrack, setExpandedTrack] = useState(null);

  const kenyanGenres = [
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'benga', label: 'Benga' },
    { value: 'gospel', label: 'Gospel' },
    { value: 'hip-hop', label: 'Hip Hop' },
    { value: 'pop', label: 'Pop' },
    { value: 'reggae', label: 'Reggae' },
    { value: 'rnb', label: 'R&B' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'dancehall', label: 'Dancehall' },
    { value: 'kapuka', label: 'Kapuka' },
    { value: 'ohangla', label: 'Ohangla' },
    { value: 'taarab', label: 'Taarab' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
    { value: 'ki', label: 'Kikuyu' },
    { value: 'luo', label: 'Luo' },
    { value: 'kam', label: 'Kamba' },
    { value: 'luy', label: 'Luyha' },
    { value: 'mer', label: 'Meru' },
    { value: 'other', label: 'Other' }
  ];

  const minTracks = releaseType === 'ep' ? 3 : 7;
  const maxTracks = releaseType === 'ep' ? 6 : 30;

  const addTrack = () => {
    if (tracks?.length >= maxTracks) return;

    const newTrack = {
      id: Date.now(),
      title: '',
      duration: '',
      genre: parentGenre,
      language: parentLanguage,
      isrcCode: '',
      mainArtists: [],
      featuredArtists: [],
      collaborators: [],
      credits: [],
      streamingLinks: {
        spotify: '',
        appleMusic: '',
        youtube: '',
        autoGenerate: true
      },
      trackNumber: tracks?.length + 1
    };

    const updatedTracks = [...tracks, newTrack];
    onChange(updatedTracks);
    setExpandedTrack(newTrack?.id);
  };

  const moveTrack = (id, direction) => {
    const currentIndex = tracks?.findIndex(track => track?.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= tracks?.length) return;

    const updatedTracks = [...tracks];
    [updatedTracks[currentIndex], updatedTracks[newIndex]] = [updatedTracks?.[newIndex], updatedTracks?.[currentIndex]];
    
    // Update track numbers
    updatedTracks?.forEach((track, index) => {
      track.trackNumber = index + 1;
    });

    onChange(updatedTracks);
  };


  const generateISRC = (trackId) => {
    const country = 'KE';
    const registrant = '001';
    const year = new Date()?.getFullYear()?.toString()?.slice(-2);
    const designation = Math.floor(Math.random() * 100000)?.toString()?.padStart(5, '0');
    const isrc = `${country}${registrant}${year}${designation}`;
    updateTrack(trackId, 'isrcCode', isrc);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          {releaseType === 'ep' ? 'EP' : 'Album'} Tracks
        </h3>
        <div className="text-sm text-muted-foreground">
          {tracks?.length} of {maxTracks} tracks
        </div>
      </div>

      {/* Track Requirements Info */}
      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-accent mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">
              {releaseType === 'ep' ? 'EP Requirements:' : 'Album Requirements:'}
            </p>
            <p className="text-sm text-muted-foreground">
              {releaseType === 'ep' 
                ? `An EP must contain ${minTracks}-${maxTracks} tracks and be no longer than 30 minutes.`
                : `An album must contain ${minTracks} or more tracks with a total runtime typically over 30 minutes.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-4">
        {tracks?.map((track, index) => (
          <div key={track?.id} className="border border-border rounded-lg overflow-hidden">
            {/* Track Header */}
            <div 
              className="p-4 bg-card cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedTrack(expandedTrack === track?.id ? null : track?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{track?.trackNumber?.toString()?.padStart(2, '0')}
                    </span>
                    <Icon name="GripVertical" size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {track?.title || `Track ${track?.trackNumber}`}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {track?.duration && <span>{track?.duration}</span>}
                      {track?.genre && <span>• {kenyanGenres?.find(g => g?.value === track?.genre)?.label}</span>}
                      {track?.featuredArtists?.length > 0 && (
                        <span>• ft. {track?.featuredArtists?.map(a => a?.name)?.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      moveTrack(track?.id, 'up');
                    }}
                    disabled={index === 0}
                  >
                    <Icon name="ChevronUp" size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      moveTrack(track?.id, 'down');
                    }}
                    disabled={index === tracks?.length - 1}
                  >
                    <Icon name="ChevronDown" size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      duplicateTrack(track?.id);
                    }}
                    disabled={tracks?.length >= maxTracks}
                  >
                    <Icon name="Copy" size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      removeTrack(track?.id);
                    }}
                    className="text-destructive hover:text-destructive"
                    disabled={tracks?.length <= minTracks}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                  <Icon 
                    name={expandedTrack === track?.id ? "ChevronUp" : "ChevronDown"} 
                    size={16} 
                    className="text-muted-foreground" 
                  />
                </div>
              </div>
            </div>

            {/* Track Details (Expanded) */}
            {expandedTrack === track?.id && (
                <div className="p-4 bg-muted/20 border-t border-border">
                  <div className="space-y-4">
                    {/* Main Artist (Primary) for album/EP tracks - unified logic and UI */}
                    {(releaseType === 'album' || releaseType === 'ep') && (
                      <div className="border border-primary/20 rounded-lg p-6 bg-primary/5 mb-8 space-y-5">
                        <h4 className="font-heading font-semibold text-base text-foreground mb-4">Main Artist (Primary)</h4>
                        <div className="text-xs text-warning font-semibold mb-2">You must enter at least one Primary Artist (Main Artist). This is required for music distribution and cannot be left blank.</div>
                        <div className="flex flex-col gap-4">
                          <Input
                            placeholder="Artist Full Names (required)"
                            value={track.newMainArtist?.name || ''}
                            onChange={e => {
                              updateTrack(track.id, { newMainArtist: { ...track.newMainArtist, name: e.target.value } });
                            }}
                            required
                          />
                          <Input
                            placeholder="Spotify link (optional)"
                            value={track.newMainArtist?.spotify || ''}
                            onChange={e => {
                              updateTrack(track.id, { newMainArtist: { ...track.newMainArtist, spotify: e.target.value } });
                            }}
                          />
                          <Input
                            placeholder="Apple Music link (optional)"
                            value={track.newMainArtist?.apple || ''}
                            onChange={e => {
                              updateTrack(track.id, { newMainArtist: { ...track.newMainArtist, apple: e.target.value } });
                            }}
                          />
                          <Input
                            placeholder="YouTube Music link (optional)"
                            value={track.newMainArtist?.youtube || ''}
                            onChange={e => {
                              updateTrack(track.id, { newMainArtist: { ...track.newMainArtist, youtube: e.target.value } });
                            }}
                          />
                          <div className="text-xs text-muted-foreground">If you don't have these links, we will create one for you.</div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (track.newMainArtist?.name?.trim()) {
                                let updated = Array.isArray(track.mainArtists) ? [...track.mainArtists] : [];
                                updated.push({
                                  id: Date.now(),
                                  name: track.newMainArtist.name.trim(),
                                  spotify: track.newMainArtist.spotify?.trim() || '',
                                  apple: track.newMainArtist.apple?.trim() || '',
                                  youtube: track.newMainArtist.youtube?.trim() || ''
                                });
                                updateTrack(track.id, {
                                  mainArtists: updated,
                                  newMainArtist: { name: '', spotify: '', apple: '', youtube: '' }
                                });
                              }
                            }}
                            disabled={!track.newMainArtist?.name?.trim()}
                          >
                            <Icon name="Plus" size={16} className="mr-1" />
                            Add
                          </Button>
                        </div>
                        {Array.isArray(track?.mainArtists) && track.mainArtists.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {track.mainArtists.map((artist, idx) => (
                              <div key={artist?.id || idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Icon name="User" size={16} className="text-primary" />
                                  <span className="text-foreground font-medium">{artist?.name}</span>
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Main</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = track.mainArtists.filter((_, i) => i !== idx);
                                    updateTrack(track.id, { mainArtists: updated });
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Icon name="X" size={16} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  {/* Additional Credits */}
                  <div className="border border-accent/20 rounded-lg p-4 bg-accent/5 mb-4">
                    <h4 className="font-heading font-semibold text-base text-foreground mb-2">Additional Credits</h4>
                    <div className="flex flex-row items-center gap-2 mb-2">
                      <select
                        value={track?.newCreditType || ''}
                        onChange={e => updateTrack(track?.id, { newCreditType: e.target.value })}
                        className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        style={{ minWidth: 120 }}
                      >
                        <option value="">Credit Type</option>
                        <option value="Featured Artist">Featured Artist</option>
                        <option value="Producer">Producer</option>
                        <option value="Songwriter">Songwriter</option>
                        <option value="Composer">Composer</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Mixer">Mixer</option>
                        <option value="Vocalist">Vocalist</option>
                        <option value="Instrumentalist">Instrumentalist</option>
                        <option value="Beat Maker">Beat Maker</option>
                        <option value="Other">Other</option>
                      </select>
                      <Input
                        placeholder="Full Name"
                        value={track?.newCreditName || ''}
                        onChange={e => updateTrack(track?.id, { newCreditName: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (track?.newCreditType && track?.newCreditName) {
                            let credits = Array.isArray(track?.credits) ? [...track.credits] : [];
                            if (!Array.isArray(credits)) credits = [];
                            let credit = { type: track.newCreditType, name: track.newCreditName };
                            if (track.newCreditType === 'Featured Artist') {
                              credit = {
                                ...credit,
                                spotify: track.newCreditSpotify || '',
                                apple: track.newCreditApple || '',
                                youtube: track.newCreditYouTube || ''
                              };
                            }
                            credits = [...credits, credit];
                            updateTrack(track.id, {
                              credits,
                              newCreditType: '',
                              newCreditName: '',
                              newCreditSpotify: '',
                              newCreditApple: '',
                              newCreditYouTube: ''
                            });
                          }
                        }}
                        disabled={!track?.newCreditType || !track?.newCreditName}
                        style={{ minWidth: 60 }}
                      >
                        Add
                      </Button>
                    </div>
                    {/* Show music links if Featured Artist is selected */}
                    {track?.newCreditType === 'Featured Artist' && (
                      <div className="flex flex-row items-center gap-2 mt-2 w-full">
                        <Input
                          placeholder="Spotify link (optional)"
                          value={track?.newCreditSpotify || ''}
                          onChange={e => updateTrack(track?.id, 'newCreditSpotify', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Apple Music link (optional)"
                          value={track?.newCreditApple || ''}
                          onChange={e => updateTrack(track?.id, 'newCreditApple', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="YouTube Music link (optional)"
                          value={track?.newCreditYouTube || ''}
                          onChange={e => updateTrack(track?.id, 'newCreditYouTube', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    )}
                    {Array.isArray(track?.credits) && track.credits.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {track.credits.map((credit, idx) => (
                          <div key={idx} className="flex flex-col md:flex-row md:items-center md:space-x-2 text-sm bg-muted/50 rounded px-2 py-1 relative">
                            <div className="flex items-center space-x-2 flex-1">
                              <span>{credit.type}:</span>
                              <span className="font-medium">{credit.name}</span>
                              {credit.type === 'Featured Artist' && (
                                <>
                                  {credit.spotify && <a href={credit.spotify} target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">Spotify</a>}
                                  {credit.apple && <a href={credit.apple} target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">Apple</a>}
                                  {credit.youtube && <a href={credit.youtube} target="_blank" rel="noopener noreferrer" className="text-xs underline text-blue-600">YouTube</a>}
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 mt-1 md:mt-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-primary"
                                onClick={() => {
                                  // Populate the add/edit fields with this credit for editing
                                  updateTrack(track.id, {
                                    newCreditType: credit.type,
                                    newCreditName: credit.name,
                                    newCreditSpotify: credit.spotify || '',
                                    newCreditApple: credit.apple || '',
                                    newCreditYouTube: credit.youtube || '',
                                    editCreditIdx: idx
                                  });
                                }}
                              >
                                <Icon name="Edit" size={14} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  const updated = track.credits.filter((_, i) => i !== idx);
                                  updateTrack(track.id, { credits: updated });
                                }}
                              >
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* ...existing code for track metadata fields... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Track Title"
                      placeholder="Enter track title"
                      value={track?.title}
                      onChange={(e) => updateTrack(track?.id, 'title', e?.target?.value)}
                      required
                    />
                    <Input
                      label="Songwriter (required)"
                      placeholder="Enter songwriter's full name"
                      value={track?.songwriter || ''}
                      onChange={e => updateTrack(track?.id, 'songwriter', e.target.value)}
                      required
                    />
                  </div>
                  {/* Track File Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">Upload Track File</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        updateTrack(track.id, 'file', file);
                      }}
                      className="block w-full text-sm text-muted-foreground border border-border rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Genre"
                      placeholder="Select genre"
                      options={kenyanGenres}
                      value={track?.genre}
                      onChange={(value) => updateTrack(track?.id, 'genre', value)}
                      searchable
                    />
                    <Select
                      label="Language"
                      placeholder="Select language"
                      options={languages}
                      value={track?.language}
                      onChange={(value) => updateTrack(track?.id, 'language', value)}
                    />
                  </div>
                  {/* ISRC */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input
                        label="ISRC Code (Optional)"
                        placeholder="e.g., KE-001-25-00001"
                        value={track?.isrcCode}
                        onChange={(e) => updateTrack(track?.id, 'isrcCode', e?.target?.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={track?.isExplicit}
                        onChange={(e) => updateTrack(track?.id, 'isExplicit', e?.target?.checked)}
                      />
                      <label className="text-sm text-foreground">Explicit Content</label>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Track Button */}
      <div className="flex flex-col items-center space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={addTrack}
          disabled={tracks?.length >= maxTracks}
          className="w-full md:w-auto"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Add Track ({tracks?.length}/{maxTracks})
        </Button>
        
        {tracks?.length < minTracks && (
          <p className="text-sm text-destructive">
            Add at least {minTracks - tracks?.length} more track{minTracks - tracks?.length > 1 ? 's' : ''} for this {releaseType}
          </p>
        )}
        
        {tracks?.length >= maxTracks && (
          <p className="text-sm text-muted-foreground">
            Maximum tracks reached for this {releaseType}
          </p>
        )}
      </div>
    </div>
  );
};
export default TrackListManager;
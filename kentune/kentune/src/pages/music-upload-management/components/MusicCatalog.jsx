import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const MusicCatalog = ({ onEditTrack, onDeleteTrack, onDuplicateTrack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Live tracks from Firestore
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takedownRequests, setTakedownRequests] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    // Query the correct collection for user uploads
    const q = query(collection(db, 'music_releases'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setTracks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    // Listen for takedown requests for this user
    const tq = query(collection(db, 'takedown_requests'), where('userId', '==', user.uid));
    const unsubTakedown = onSnapshot(tq, (snapshot) => {
      setTakedownRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsub(); unsubTakedown(); };
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'live', label: 'Live' },
    { value: 'processing', label: 'Processing' },
    { value: 'draft', label: 'Draft' },
    { value: 'failed', label: 'Failed' }
  ];

  const genreOptions = [
    { value: 'all', label: 'All Genres' },
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'benga', label: 'Benga' },
    { value: 'gospel', label: 'Gospel' },
    { value: 'hip-hop', label: 'Hip Hop' },
    { value: 'pop', label: 'Pop' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'plays', label: 'Most Plays' },
    { value: 'revenue', label: 'Highest Revenue' }
  ];

  // Consistent status colors and icons for all statuses
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
  const getStatusLabel = (status) => {
    if (!status || typeof status !== 'string') return 'Pending';
    switch (status) {
      case 'live': return 'Live';
      case 'active': return 'Active';
      case 'distributed': return 'Distributed';
      case 'rejected': return 'Rejected';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default:
        // Fallback for unknown status
        try {
          return status.charAt(0).toUpperCase() + status.slice(1);
        } catch {
          return 'Pending';
        }
    }
  };

  const filteredTracks = tracks?.filter(track => {
    const matchesSearch = track?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         track?.album?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || track?.status === statusFilter;
    const matchesGenre = genreFilter === 'all' || track?.genre?.toLowerCase() === genreFilter;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  return (
    <div className="space-y-6">
      {/* Track Details Modal */}
      {showModal && selectedTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setShowModal(false)}>
              <Icon name="X" size={20} />
            </button>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-lg overflow-hidden mb-4 bg-muted flex items-center justify-center">
                <Image src={selectedTrack?.artwork || selectedTrack?.coverArt || '/public/assets/images/no_image.png'} alt={selectedTrack?.title || 'Artwork'} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold text-lg mb-1">{selectedTrack?.title || 'Untitled'}</h3>
              <div className="text-sm text-muted-foreground mb-2">{selectedTrack?.artist || 'Unknown Artist'}</div>
              <div className="flex flex-col gap-1 w-full">
                <div><b>Status:</b> {getStatusLabel(selectedTrack?.status)}</div>
                <div><b>Genre:</b> {selectedTrack?.genre || 'Unknown Genre'}</div>
                <div><b>Release Date:</b> {selectedTrack?.releaseDate || 'N/A'}</div>
                <div><b>Streams:</b> {selectedTrack?.streams ?? 0}</div>
                <div><b>Earnings:</b> KSh {selectedTrack?.earnings ?? 0}</div>
                <div><b>ISRC:</b> {selectedTrack?.isrcCode || 'N/A'}</div>
                <div><b>Language:</b> {selectedTrack?.language || 'N/A'}</div>
                <div><b>Copyright:</b> {selectedTrack?.copyrightInfo || 'N/A'}</div>
              </div>
              {selectedTrack?.trackFile && (
                <div className="mt-4 w-full">
                  <audio controls src={selectedTrack?.trackFile} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Filters: Only Search and Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="search"
          placeholder="Search tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="w-full"
        />
        <Select
          placeholder="Sort by"
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />
      </div>
      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.isArray(filteredTracks) && filteredTracks.map((track, idx) => {
          try {
            if (!track || typeof track !== 'object') return null;
            const status = track.status || 'pending';
            const statusIcon = STATUS_ICONS[status] || 'AlertCircle';
            const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;
            return (
              <div key={track.id || idx} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-card transition-shadow">
                {/* Cover Art */}
                <div className="relative aspect-square">
                  <Image
                    src={track.coverArt || '/public/assets/images/no_image.png'}
                    alt={`${track.title || 'Untitled'} cover art`}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 ${statusColor}`}
                      style={{ minWidth: 90, justifyContent: 'center' }}>
                      <Icon name={statusIcon} size={14} className="mr-1" />
                      <span>{getStatusLabel(status)}</span>
                    </div>
                  </div>
                  {/* Play Button Overlay */}
                  {status === 'live' && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="default" size="icon" className="w-12 h-12 rounded-full">
                        <Icon name="Play" size={20} />
                      </Button>
                    </div>
                  )}
                </div>
                {/* Track Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-heading font-semibold text-foreground truncate">{track.title || 'Untitled'}</h3>
                    <p className="text-sm text-muted-foreground truncate">{track.album || ''}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{track.genre || ''}</span>
                    <span>{track.duration || ''}</span>
                  </div>
                  {/* Track Preview */}
                  {track.trackFile && (
                    <div className="mt-2">
                      <audio controls src={track.trackFile} className="w-full">
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  {/* Release Date */}
                  <div className="text-xs text-muted-foreground mt-2">
                    <b>Release Date:</b> {track.releaseDate ? track.releaseDate : 'N/A'}
                  </div>
                  {/* Stats */}
                  {status === 'live' && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Plays</p>
                        <p className="font-medium text-foreground">{track.plays ? track.plays.toLocaleString() : 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-medium text-foreground">KSh {track.revenue ? track.revenue.toLocaleString() : 0}</p>
                      </div>
                    </div>
                  )}
                  {/* Error Message */}
                  {status === 'failed' && track.errorMessage && (
                    <div className="p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
                      {track.errorMessage}
                    </div>
                  )}
                  {/* Platforms */}
                  {Array.isArray(track.platforms) && track.platforms.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">On:</span>
                      <div className="flex space-x-1">
                        {track.platforms.slice(0, 3).map((platform, i) => (
                          <div key={platform || i} className="w-5 h-5 bg-muted rounded flex items-center justify-center">
                            <Icon name="Music" size={12} className="text-muted-foreground" />
                          </div>
                        ))}
                        {track.platforms.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{track.platforms.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2">
                    {(() => {
                      const req = takedownRequests.find(r => r.trackId === track.id);
                      if (req) {
                        if (req.status === 'completed') {
                          return (
                            <Button variant="outline" size="sm" disabled className="flex-1 text-green-600 border-green-600 opacity-60 cursor-not-allowed">
                              <Icon name="CheckCircle" size={14} className="mr-1" />
                              Takedown Completed
                            </Button>
                          );
                        } else {
                          return (
                            <Button variant="outline" size="sm" disabled className="flex-1 text-warning border-warning opacity-60 cursor-not-allowed">
                              <Icon name="AlertTriangle" size={14} className="mr-1" />
                              Take Down In Progress
                            </Button>
                          );
                        }
                      }
                      return (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to request a takedown for this release? This will notify the admin to facilitate the takedown.')) {
                              try {
                                // Add a takedown request to Firestore (collection: takedown_requests)
                                const auth = getAuth();
                                const user = auth.currentUser;
                                if (!user) throw new Error('Not authenticated');
                                await import('firebase/firestore').then(({ collection, addDoc, serverTimestamp }) =>
                                  addDoc(collection(db, 'takedown_requests'), {
                                    userId: user.uid,
                                    trackId: track.id,
                                    title: track.title || '',
                                    requestedAt: serverTimestamp(),
                                    status: 'pending',
                                  })
                                );
                                alert('Takedown request submitted. The admin will review and process your request.');
                              } catch (err) {
                                alert('Failed to submit takedown request. Please try again.');
                              }
                            }
                          }}
                          className="flex-1 text-warning border-warning"
                        >
                          <Icon name="AlertTriangle" size={14} className="mr-1" />
                          Take Down
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          } catch (err) {
            console.error('Error rendering track:', err, track);
            return null;
          }
        })}
      </div>
      {/* Empty State */}
      {Array.isArray(filteredTracks) && filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Music" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">No tracks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || genreFilter !== 'all' ?'Try adjusting your filters to see more tracks.' :'Upload your first track to get started.'
            }
          </p>
          {(!searchQuery && statusFilter === 'all' && genreFilter === 'all') && (
            <Button variant="default">
              <Icon name="Plus" size={16} className="mr-2" />
              Upload Your First Track
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicCatalog;
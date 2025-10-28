import React, { useState, useEffect } from 'react';
import AnalyticsChart from '../../components/AnalyticsChart';
import TermsManagement from './components/TermsManagement';
import ContactMessages from './components/ContactMessages';
// ...existing code...
// Plan filter states must be inside the main AdminDashboard component
// ...existing code...
// Move SupportTicketsList to the top after imports
function SupportTicketsList({ supportTickets, artists }) {
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  return (
    <ul className="space-y-4">
      {supportTickets.map((ticket) => {
        const expanded = expandedTicketId === ticket.id;
        const artist = artists.find(a => a.id === ticket.userId) || {};
        return (
          <li key={ticket.id} className="bg-white border border-border rounded-lg p-4 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedTicketId(expanded ? null : ticket.id)}>
              <div>
                <span className="font-bold text-lg">{ticket.subject || 'No Subject'}</span>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold ${ticket.status === 'attended' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {ticket.status === 'attended' ? 'Attended' : 'Unattended'}
                </span>
              </div>
              <button className="text-primary text-xs underline ml-2">{expanded ? 'Hide' : 'View'}</button>
            </div>
            {expanded && (
              <div className="mt-4 border-t pt-4">
                <div className="mb-2"><span className="font-semibold">Message:</span> {ticket.message}</div>
                <div className="mb-2"><span className="font-semibold">Category:</span> {ticket.category}</div>
                <div className="mb-2"><span className="font-semibold">Priority:</span> {ticket.priority}</div>
                <div className="mb-2"><span className="font-semibold">Submitted:</span> {ticket.createdAt?.seconds ? new Date(ticket.createdAt.seconds * 1000).toLocaleString() : ''}</div>
                <div className="mb-2"><span className="font-semibold">From:</span> {ticket.name} ({ticket.email})</div>
                <div className="mb-2"><span className="font-semibold">User ID:</span> {ticket.userId}</div>
                {/* Artist profile details */}
                {artist && artist.id && (
                  <div className="mt-4 p-3 bg-muted/40 rounded-lg">
                    <div className="font-bold mb-1">Artist Profile</div>
                    <div><span className="font-semibold">Name:</span> {artist.stage_name || artist.full_name || artist.stageName || artist.fullName || '-'}</div>
                    <div><span className="font-semibold">Email:</span> {artist.email}</div>
                    <div><span className="font-semibold">Phone:</span> {artist.phone || artist.phoneNumber || '-'}</div>
                    <div><span className="font-semibold">Location:</span> {artist.location}</div>
                    <div><span className="font-semibold">Genres:</span> {Array.isArray(artist.genres) ? artist.genres.join(', ') : artist.genre || '-'}</div>
                    <div><span className="font-semibold">Bio:</span> {artist.bio}</div>
                    <div><span className="font-semibold">Joined:</span> {artist.createdAt ? new Date(artist.createdAt.seconds ? artist.createdAt.seconds * 1000 : artist.createdAt).toLocaleDateString() : '-'}</div>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant={ticket.status === 'unattended' ? 'primary' : 'outline'} onClick={async () => {
                    await updateDoc(doc(collection(db, 'support_tickets'), ticket.id), { status: 'unattended' });
                  }}>Unattended</Button>
                  <Button size="sm" variant={ticket.status === 'attended' ? 'primary' : 'outline'} onClick={async () => {
                    await updateDoc(doc(collection(db, 'support_tickets'), ticket.id), { status: 'attended' });
                  }}>Attended</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete this support ticket? This cannot be undone.')) return;
                    try {
                      const { deleteDoc, collection, doc } = await import('firebase/firestore');
                      await deleteDoc(doc(collection(db, 'support_tickets'), ticket.id));
                      // Remove ticket from UI
                      if (typeof setSupportTickets === 'function') {
                        setSupportTickets(prev => prev.filter(t => t.id !== ticket.id));
                      }
                      window.alert('Support ticket deleted successfully.');
                    } catch (err) {
                      window.alert('Failed to delete support ticket: ' + (err.message || err));
                    }
                  }}>Delete</Button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ...existing code...



// Helper: Audio preview and download
const TrackDetailsRow = ({ track, isOpen, onToggle }) => {
  // Show all fields in a table for transparency
  const entries = Object.entries(track);
  // Try all possible audio fields
  const audioSrc = track.audioUrl || track.trackFile || track.fileUrl || track.file || '';
  // Extract streaming links, parse if string
  let streamingLinks = track.streamingLinks || {};
  if (typeof streamingLinks === 'string') {
    try {
      streamingLinks = JSON.parse(streamingLinks);
    } catch {
      streamingLinks = {};
    }
  }
  // If this is an EP/Album with a tracks array, show a professional tracklist
  const isMultiTrack = Array.isArray(track.tracks) && track.tracks.length > 0;
  return (
    <>
      <tr className="border-b border-border">
        <td className="p-3 flex items-center gap-2">
          <button onClick={onToggle} className="text-primary focus:outline-none">
            <Icon name={isOpen ? 'ChevronDown' : 'ChevronRight'} size={18} />
          </button>
          {track.title}
        </td>
        <td className="p-3">
          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-muted text-foreground`}>
            {track.status === 'processing' && 'Processing'}
            {track.status === 'active' && 'Active'}
            {track.status === 'distributed' && 'Distributed'}
            {track.status === 'live' && 'Live'}
            {track.status === 'rejected' && 'Rejected'}
            {!['processing','active','distributed','live','rejected'].includes(track.status) && (track.status || 'N/A')}
          </span>
        </td>
        <td className="p-3">{track.releaseDate ? new Date(track.releaseDate).toLocaleDateString() : 'N/A'}</td>
      </tr>
      {isOpen && (
        <tr className="bg-muted/30">
          <td colSpan={3} className="p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-h-96 overflow-y-auto w-full">
              <div className="w-full sm:w-1/3">
                <Image src={track.coverArtUrl || track.coverArt || '/assets/images/no_image.png'} alt="Cover Art" className="w-24 h-24 sm:w-32 sm:h-32 rounded object-cover mb-2" />
                {audioSrc && (
                  <>
                    <audio controls src={audioSrc} className="w-full mt-2" />
                    <div className="mt-2">
                      <a href={audioSrc} target="_blank" rel="noopener noreferrer" className="text-primary underline">Open Track in New Tab</a>
                    </div>
                    <a href={audioSrc} download className="btn btn-sm btn-outline-primary mt-2">Download</a>
                  </>
                )}
                {/* Streaming Links for each track (show all, or 'None' if not provided) */}
                <div className="mt-4">
                  <div className="font-bold mb-1">Artists & Streaming Links:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <div className="font-semibold mb-1">Main Artists:</div>
                      {Array.isArray(track.mainArtists) && track.mainArtists.length > 0 ? (
                        <ul className="ml-2">
                          {track.mainArtists.map((artist, idx) => (
                            <li key={artist.name || artist || idx} className="mb-2">
                              <span className="font-semibold">{artist.name || artist}</span>
                              <div className="ml-2 text-xs">
                                <div className="mb-1">
                                  <span className="font-semibold">Spotify: </span>
                                  {artist.spotify && artist.spotify.trim() ? (
                                    <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open</a>
                                  ) : (
                                    <span className="text-muted-foreground">None</span>
                                  )}
                                </div>
                                <div className="mb-1">
                                  <span className="font-semibold">Apple Music: </span>
                                  {artist.apple && artist.apple.trim() ? (
                                    <a href={artist.apple} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Open</a>
                                  ) : (
                                    <span className="text-muted-foreground">None</span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold">YouTube: </span>
                                  {artist.youtube && artist.youtube.trim() ? (
                                    <a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Open</a>
                                  ) : (
                                    <span className="text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="ml-2">-</span>
                      )}
                      <div className="mt-2 font-semibold">Featured Artists:</div>
                      {Array.isArray(track.featuredArtists) && track.featuredArtists.length > 0 ? (
                        <ul className="ml-2">
                          {track.featuredArtists.map((artist, idx) => (
                            <li key={artist.name || artist || idx} className="mb-2">
                              <span className="font-semibold">{artist.name || artist}</span>
                              <div className="ml-2 text-xs">
                                <div className="mb-1">
                                  <span className="font-semibold">Spotify: </span>
                                  {artist.spotify && artist.spotify.trim() ? (
                                    <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open</a>
                                  ) : (
                                    <span className="text-muted-foreground">None</span>
                                  )}
                                </div>
                                <div className="mb-1">
                                  <span className="font-semibold">Apple Music: </span>
                                  {artist.apple && artist.apple.trim() ? (
                                    <a href={artist.apple} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Open</a>
                                  ) : (
                                    <span className="text-muted-foreground">None</span>
                                  )}
                                </div>
                                <div>
                                  <span className="font-semibold">YouTube: </span>
                                  {artist.youtube && artist.youtube.trim() ? (
                                    <a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Open</a>
                                  ) : (
                                    <span className="text-muted-foreground">None</span>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="ml-2">-</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Multi-track (EP/Album) tracklist */}
                {isMultiTrack && (
                  <div className="mt-4 overflow-x-auto">
                    <div className="font-bold mb-2 text-base sm:text-lg">Tracklist</div>
                    <table className="min-w-full text-xs sm:text-sm border border-border rounded-lg">
                      <thead>

                        
                        <tr className="bg-muted">
                          <th className="p-1 sm:p-2 text-left">#</th>
                          <th className="p-1 sm:p-2 text-left">Title</th>
                          <th className="p-1 sm:p-2 text-left">ISRC</th>
                          <th className="p-1 sm:p-2 text-left">Duration</th>
                          <th className="p-1 sm:p-2 text-left">Download</th>
                          <th className="p-1 sm:p-2 text-left">Links</th>
                        </tr>
                      </thead>
                      <tbody>
                        {track.tracks.map((t, i) => (
                          <tr key={t.id || t.title || i} className="border-b border-border">
                            <td className="p-1 sm:p-2 font-bold">{i + 1}</td>
                            <td className="p-1 sm:p-2">{t.title || '-'}</td>
                            <td className="p-2">{t.isrc || t.isrcCode || '-'}</td>
                            <td className="p-2">{t.duration || '-'}</td>
                            <td className="p-2">
                              {t.fileUrl || t.audioUrl ? (
                                <a href={t.fileUrl || t.audioUrl} download className="text-primary underline">Download</a>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="p-2">
                              {t.streamingLinks ? (
                                <>
                                  {t.streamingLinks.spotify && (
                                    <a href={t.streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline mr-2">Spotify</a>
                                  )}
                                  {t.streamingLinks.appleMusic && (
                                    <a href={t.streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline mr-2">Apple</a>
                                  )}
                                  {t.streamingLinks.youtube && (
                                    <a href={t.streamingLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">YouTube</a>
                                  )}
                                </>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                                    {/* Songwriter field */}
                                    <div className="mb-2">
                                      <span className="font-semibold">Songwriter(s):</span> {
                                        Array.isArray(track.songwriters) ? track.songwriters.join(', ') : (track.songwriter || '-')
                                      }
                                    </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <tbody>
                      {entries.map(([key, value]) => (
                        <tr key={key}>
                          <td className="font-bold pr-2 align-top whitespace-nowrap">{key}:</td>
                          <td className="break-all">{typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => alert('Approve coming soon!')}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => alert('Reject coming soon!')}>Reject</Button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Image from '../../components/AppImage';
import { useAuth } from '../../contexts/AuthContext';

const SECTIONS = [
  { key: 'artists', label: 'Artists', icon: 'Users' },
  { key: 'label', label: 'Label', icon: 'Tag' },
  { key: 'tracks', label: 'Track Submissions', icon: 'Music' },
  { key: 'takedown', label: 'Take Down', icon: 'AlertTriangle' },
  { key: 'youtube', label: 'YouTube', icon: 'Youtube' },
  { key: 'support', label: 'Support Tickets', icon: 'HelpCircle' },
  { key: 'contact', label: 'Contact Messages', icon: 'Mail' },
  { key: 'mastering', label: 'Mastering Requests', icon: 'Settings' },
  { key: 'earnings', label: 'Earnings', icon: 'DollarSign' },
  { key: 'withdrawals', label: 'Withdrawals', icon: 'ArrowDownCircle' },
  { key: 'analytics', label: 'Analytics', icon: 'BarChart2' },
  { key: 'payments', label: 'Payments', icon: 'CreditCard' },

];
  // ...existing code...
  {/* ...existing code... */}

const AdminDashboard = () => {
  const [labelAttendedFilter, setLabelAttendedFilter] = useState('all');
  const [labelPlanFilter, setLabelPlanFilter] = useState('all');
  const [expandedLabelId, setExpandedLabelId] = useState(null);
  const [labelSubscriptions, setLabelSubscriptions] = useState([]);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState(null);

  // State for YouTube status filter
  const [youtubeStatusFilter, setYoutubeStatusFilter] = useState('all');
  // Handler for deleting a YouTube request
  const handleDeleteRequest = async (reqId) => {
    if (!window.confirm('Are you sure you want to delete this YouTube request? This cannot be undone.')) return;
    try {
      const { deleteDoc, doc, collection } = await import('firebase/firestore');
      await deleteDoc(doc(collection(db, 'youtubeRequests'), reqId));
      setYoutubeRequests(prev => prev.filter(r => r.id !== reqId));
    } catch (err) {
      window.alert('Failed to delete request: ' + (err.message || err));
    }
  };
  // Handler for attended checkbox
  const handleAttendedChange = async (req, idx) => {
    try {
      const { updateDoc, doc, collection } = await import('firebase/firestore');
      await updateDoc(doc(collection(db, 'youtubeRequests'), req.id), { attended: !req.attended });
      setYoutubeRequests(prev => prev.map((r, i) => i === idx ? { ...r, attended: !r.attended } : r));
    } catch (err) {
      window.alert('Failed to update attended status: ' + (err.message || err));
    }
  };
  // State for expanded YouTube request card
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [section, setSection] = useState('artists');
  // State for YouTube Requests
  const [youtubeRequests, setYoutubeRequests] = useState([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState(null);

  useEffect(() => {
    if (section !== 'youtube') return;
    setYoutubeLoading(true);
    setYoutubeError(null);
    import('firebase/firestore').then(({ collection, getDocs }) => {
      getDocs(collection(db, 'youtubeRequests')).then(snapshot => {
        setYoutubeRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setYoutubeLoading(false);
      }).catch(err => {
        setYoutubeError(err.message || 'Failed to fetch YouTube requests');
        setYoutubeLoading(false);
      });
    }).catch(err => {
      setYoutubeError(err.message || 'Failed to load Firestore');
      setYoutubeLoading(false);
    });
  }, [section]);
  // No state needed for YouTube menu

  // No effect needed for YouTube menu
        {section === 'uidsearch' && (
          <div className="max-w-2xl mx-auto w-full">
            <h1 className="font-heading text-2xl font-bold mb-8 text-primary">UID Search</h1>
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <input
                type="text"
                placeholder="Enter Artist UID..."
                className="border-2 border-primary rounded-lg px-4 py-3 text-lg w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-primary transition"
                value={uidSearch || ''}
                onChange={e => setUidSearch(e.target.value)}
              />
            </div>
            {/* Artist details and related info will be shown here after search */}
            {uidSearchLoading && (
              <div className="text-center text-lg text-muted-foreground mt-6">Searching...</div>
            )}
            {uidSearchError && !uidSearchLoading && (
              <div className="text-center text-lg text-red-600 mt-6">{uidSearchError}</div>
            )}
            {uidSearchResult && !uidSearchLoading && (
              <div className="bg-white rounded-lg shadow border border-border p-6 mt-6">
                <h2 className="font-heading text-xl font-bold mb-2 text-primary">Artist Profile</h2>
                <div className="mb-2"><span className="font-semibold">Name:</span> {uidSearchResult.stage_name || uidSearchResult.full_name || uidSearchResult.stageName || uidSearchResult.fullName || '-'}</div>
                <div className="mb-2"><span className="font-semibold">Email:</span> {uidSearchResult.email || '-'}</div>
                <div className="mb-2"><span className="font-semibold">Phone:</span> {uidSearchResult.phone || uidSearchResult.phoneNumber || '-'}</div>
                <div className="mb-2"><span className="font-semibold">Location:</span> {uidSearchResult.location || '-'}</div>
                <div className="mb-2"><span className="font-semibold">Genres:</span> {Array.isArray(uidSearchResult.genres) ? uidSearchResult.genres.join(', ') : uidSearchResult.genre || '-'}</div>
                <div className="mb-2"><span className="font-semibold">Bio:</span> {uidSearchResult.bio || '-'}</div>
                <div className="mb-2"><span className="font-semibold">Joined:</span> {uidSearchResult.createdAt ? (uidSearchResult.createdAt.seconds ? new Date(uidSearchResult.createdAt.seconds * 1000).toLocaleDateString() : new Date(uidSearchResult.createdAt).toLocaleDateString()) : '-'}</div>
                <div className="mb-2"><span className="font-semibold">UID:</span> {uidSearchResult.id}</div>
              </div>
            )}
          </div>
        )}
        {section === 'youtube' && (() => {
          try {
            console.error('YouTube menu clicked');
            return (
              <div className="p-8 text-center">
                <h1 className="font-heading text-2xl font-bold mb-4">YouTube</h1>
                <div className="text-lg text-primary">hello</div>
              </div>
            );
          } catch (err) {
            return (
              <div className="p-8 text-center text-red-600">
                Error rendering YouTube menu: {err.message}
              </div>
            );
          }
        })()}
  
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Analytics subscription filter state
  const [analyticsSubFilter, setAnalyticsSubFilter] = useState('');
  const [analyticsSuccess, setAnalyticsSuccess] = useState('');
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  useEffect(() => {
    // Fetch all subscription plans from Firestore
    const fetchPlans = async () => {
      try {
        const q = collection(db, 'subscriptions');
        const snapshot = await getDocs(q);
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubscriptionPlans(plans);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchPlans();
  }, []);
  // --- TRACK SUBMISSION CONTROLS ---
  // Search/filter/sort UI
  const [tracks, setTracks] = useState([]);
  // --- EP/ALBUM CONTROLS ---
  const [epAlbumSearch, setEpAlbumSearch] = useState('');
  const [epAlbumStatusFilter, setEpAlbumStatusFilter] = useState('');
  const [epAlbumSort, setEpAlbumSort] = useState('newest');
  const [epAlbumActionFilter, setEpAlbumActionFilter] = useState('');
  // Filtered EP/Albums derived from tracks
  const filteredEpAlbums = tracks
    .filter(t => Array.isArray(t.tracks) && t.tracks.length > 0)
    .filter(t =>
      (!epAlbumSearch || t.title?.toLowerCase().includes(epAlbumSearch.toLowerCase())) &&
      (!epAlbumStatusFilter || t.status === epAlbumStatusFilter) &&
      (!epAlbumActionFilter || t[epAlbumActionFilter])
    )
    .sort((a, b) => {
      if (epAlbumSort === 'newest') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }
    });
  // Handler for action checkboxes
  const handleEpAlbumAction = (id, action, value) => {
    // Persist change to Firestore and update local state
    import('firebase/firestore').then(({ updateDoc, doc, collection }) => {
      updateDoc(doc(collection(db, 'music_releases'), id), { [action]: value })
        .then(() => {
          setTracks(prev => prev.map(t => t.id === id ? { ...t, [action]: value } : t));
        })
        .catch(err => {
          alert('Failed to update: ' + err.message);
        });
    });
  };
  // State for expanded EP/Album card
  const [expandedEpAlbumId, setExpandedEpAlbumId] = useState(null);
  const [epAlbumTrackModal, setEpAlbumTrackModal] = useState(null);
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Plan filter states
  const [planTypeFilter, setPlanTypeFilter] = useState("");
  const [planDurationFilter, setPlanDurationFilter] = useState("");
  const [endingSoonFilter, setEndingSoonFilter] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  // State for analytics streaming stats table
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistStats, setArtistStats] = useState([]);

  // Load stats from Firestore when artist changes
  useEffect(() => {
    if (!selectedArtist) { setArtistStats([]); return; }
    let unsub = null;
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
      const q = query(collection(db, 'analytics'), where('artistId', '==', selectedArtist.id));
      unsub = onSnapshot(q, (snap) => {
        setArtistStats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    });
    return () => { if (unsub) unsub(); };
  }, [selectedArtist]);
  const { userProfile, loading: authLoading, signOut } = useAuth();

  // Add artistFilter state for earnings filter
  const [artistFilter, setArtistFilter] = useState('eligible');
  const [artists, setArtists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  // Add missing state for search, sort, filter, and page
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new'); // 'new' or 'old'
  const [trackFilter, setTrackFilter] = useState('all'); // 'all', 'new', 'old'
  // Track submission analytics state
  const [trackAnalytics, setTrackAnalytics] = useState({ total: 0, approved: 0, processing: 0, mostActiveArtists: [] });
  // Notification sound
  const notificationAudio = React.useRef(null);
  // Helper: Play notification sound
  const playNotification = (submitterName) => {
    if (notificationAudio.current) {
      notificationAudio.current.play();
      window.alert(`New track submitted by ${submitterName}`);
    }
  };
  // Live calculation of track analytics from tracks state
  useEffect(() => {
    if (!Array.isArray(tracks) || tracks.length === 0) {
      setTrackAnalytics({
        total: 0,
        approved: 0,
        processing: 0,
        rejected: 0,
        approvalRate: 0,
        mostActiveArtists: [],
        topGenres: [],
        topTerritories: [],
        dailyTrends: Array.from({length: 30}, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(), count: 0 }))
      });
      return;
    }
    const total = tracks.length;
    const approved = tracks.filter(t => t.status === 'approved').length;
    const processing = tracks.filter(t => t.status === 'processing').length;
    const rejected = tracks.filter(t => t.status === 'rejected').length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    // Most active artists by submission count
    const artistCounts = {};
    tracks.forEach(t => {
      const artist = t.artist || (Array.isArray(t.mainArtists) && t.mainArtists.length > 0 ? (t.mainArtists[0].name || t.mainArtists[0]) : null);
      if (artist) {
        artistCounts[artist] = (artistCounts[artist] || 0) + 1;
      }
    });
    const mostActiveArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    // Top genres
    const genreCounts = {};
    tracks.forEach(t => {
      const genres = Array.isArray(t.genres) ? t.genres : (t.genre ? [t.genre] : []);
      genres.forEach(g => {
        if (g) genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([g]) => g);
    // Top territories
    const territoryCounts = {};
    tracks.forEach(t => {
      const territory = t.territory;
      if (territory) territoryCounts[territory] = (territoryCounts[territory] || 0) + 1;
    });
    const topTerritories = Object.entries(territoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t);
    // Daily submission trends for all available data
    let minDate = null, maxDate = null;
    tracks.forEach(t => {
      if (t.submittedAt) {
        const d = new Date(t.submittedAt);
        if (!minDate || d < minDate) minDate = d;
        if (!maxDate || d > maxDate) maxDate = d;
      }
    });
    if (!minDate || !maxDate) {
      minDate = new Date();
      maxDate = new Date();
    }
    // Build daily range
    const days = [];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    const dailyTrends = days.map(day => {
      const dayStr = day.toLocaleDateString();
      const count = tracks.filter(t => {
        const submitted = t.submittedAt ? new Date(t.submittedAt) : null;
        return submitted && submitted.toLocaleDateString() === dayStr;
      }).length;
      return { date: dayStr, count };
    });
    setTrackAnalytics({
      total,
      approved,
      processing,
      rejected,
      approvalRate,
      mostActiveArtists,
      topGenres,
      topTerritories,
      dailyTrends
    });
  }, [tracks]);
  // Render search/filter/sort UI for track submissions
  const renderTrackSubmissionControls = () => (
    <div className="flex flex-col md:flex-row gap-2 mb-4 items-center justify-between w-full">
      <input
        type="text"
        placeholder="Search track by name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border rounded px-3 py-2 w-full md:w-64"
      />
      <select value={trackFilter} onChange={e => setTrackFilter(e.target.value)} className="border rounded px-3 py-2 w-full md:w-auto">
        <option value="all">All Tracks</option>
        <option value="new">New Tracks</option>
        <option value="old">Old Tracks</option>
      </select>
      <select value={sort} onChange={e => setSort(e.target.value)} className="border rounded px-3 py-2 w-full md:w-auto">
        <option value="new">Newest First</option>
        <option value="old">Oldest First</option>
      </select>
    </div>
  );
  // Track list state (move above usage)
  // Filter, sort, and number tracks
  const filteredTracks = tracks
    .filter(track => track.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(track => {
      if (trackFilter === 'new') {
        // Consider tracks submitted in the last 7 days as 'new'
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return new Date(track.submittedAt).getTime() >= sevenDaysAgo;
      }
      if (trackFilter === 'old') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return new Date(track.submittedAt).getTime() < sevenDaysAgo;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'new') return new Date(b.submittedAt) - new Date(a.submittedAt);
      if (sort === 'old') return new Date(a.submittedAt) - new Date(b.submittedAt);
      return 0;
    });
  // Render track list with numbering
  const renderTrackList = () => (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full border rounded-lg">
        <thead>
          <tr className="bg-muted">
            <th className="p-2">#</th>
            <th className="p-2">Track Name</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredTracks.map((track, idx) => (
            <TrackDetailsRow key={track.id} track={track} number={idx + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
  // Render beautiful stats/insights section for track submissions
  const renderTrackAnalytics = () => {
    // Defensive: always use arrays for .map
    const mostActiveArtists = Array.isArray(trackAnalytics.mostActiveArtists) ? trackAnalytics.mostActiveArtists : [];
    const topGenres = Array.isArray(trackAnalytics.topGenres) ? trackAnalytics.topGenres : [];
    const topTerritories = Array.isArray(trackAnalytics.topTerritories) ? trackAnalytics.topTerritories : [];
    return (
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Submissions */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center relative group">
            <span className="absolute top-4 right-4 text-blue-400 group-hover:text-blue-600 transition" title="Total Submissions">
              <Icon name="Music" size={32} />
            </span>
            <span className="text-4xl font-extrabold text-blue-700">{trackAnalytics.total}</span>
            <span className="mt-2 text-sm text-blue-700 font-semibold">Total Submissions</span>
          </div>
          {/* Approved */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center relative group">
            <span className="absolute top-4 right-4 text-green-400 group-hover:text-green-600 transition" title="Approved Tracks">
              <Icon name="CheckCircle" size={32} />
            </span>
            <span className="text-4xl font-extrabold text-green-700">{trackAnalytics.approved}</span>
            <span className="mt-2 text-sm text-green-700 font-semibold">Approved</span>
            <span className="text-xs text-green-700 mt-1" title="Approval Rate">{trackAnalytics.approvalRate}% Approval Rate</span>
          </div>
          {/* Processing */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center relative group">
            <span className="absolute top-4 right-4 text-yellow-400 group-hover:text-yellow-600 transition" title="Processing Tracks">
              <Icon name="Loader" size={32} />
            </span>
            <span className="text-4xl font-extrabold text-yellow-700">{trackAnalytics.processing}</span>
            <span className="mt-2 text-sm text-yellow-700 font-semibold">Processing</span>
          </div>
          {/* Rejected */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center relative group">
            <span className="absolute top-4 right-4 text-red-400 group-hover:text-red-600 transition" title="Rejected Tracks">
              <Icon name="XCircle" size={32} />
            </span>
            <span className="text-4xl font-extrabold text-red-700">{trackAnalytics.rejected}</span>
            <span className="mt-2 text-sm text-red-700 font-semibold">Rejected</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Most Active Artists */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
              <Icon name="Users" size={22} className="text-primary" /> Most Active Artists
            </div>
            <ul className="list-disc ml-4 text-sm">
              {mostActiveArtists.length === 0 ? (
                <li className="text-muted-foreground">No data yet</li>
              ) : mostActiveArtists.map((artist, idx) => (
                <li key={artist + idx} className="mb-1">{artist}</li>
              ))}
            </ul>
          </div>
          {/* Genre & Territory Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="font-bold text-lg mb-2 text-primary flex items-center gap-2">
              <Icon name="Globe" size={22} className="text-primary" /> Genre & Territory Breakdown
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Top Genres</div>
                <ul className="list-disc ml-4 text-sm">
                  {topGenres.length === 0 ? (
                    <li className="text-muted-foreground">No data yet</li>
                  ) : topGenres.map((genre, idx) => (
                    <li key={genre + idx}>{genre}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Top Territories</div>
                <ul className="list-disc ml-4 text-sm">
                  {topTerritories.length === 0 ? (
                    <li className="text-muted-foreground">No data yet</li>
                  ) : topTerritories.map((territory, idx) => (
                    <li key={territory + idx}>{territory}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  const [page, setPage] = useState(1);
  // Map of artistId to artist profile (for quick lookup)
  const [artistProfiles, setArtistProfiles] = useState({});
  const [artistTracks, setArtistTracks] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  // Fetch support tickets in real time
  useEffect(() => {
    if (section !== 'support') return;
    setLoading(true);
    let unsub = null;
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
      unsub = onSnapshot(collection(db, 'support_tickets'), (snap) => {
        setSupportTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
    });
    return () => { if (unsub) unsub(); };

  }, [section]);
  const [masteringRequests, setMasteringRequests] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  // Fetch all analytics stats from Firestore
  async function fetchAnalytics() {
    try {
      const snap = await getDocs(collection(db, 'analytics'));
      setAnalytics(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setAnalytics([]);
    }
  }

  useEffect(() => {
    if (section === 'analytics') {
      fetchAnalytics();
    }
  }, [section]);
  const [payments, setPayments] = useState([]);
  // Withdrawal requests state
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  // For expanding/collapsing withdrawal details
  const [openWithdrawalIdx, setOpenWithdrawalIdx] = useState(null);


  // Fetch withdrawal requests
  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        // Get all docs in withdrawal_requests, including those with user.uid as ID
        const snap = await getDocs(collection(db, 'withdrawal_requests'));
        const requests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWithdrawalRequests(requests);
      } catch (err) {
        setWithdrawalRequests([]);
      }
    }
    fetchWithdrawals();
  }, []);

  // ...existing code...
  // Add filter state for earnings table
  const [earningsFilter, setEarningsFilter] = useState('');

  // Place this inside your main return's JSX, with the other sections:
  // {section === 'withdrawals' && (
  //   <div>...</div>
  // )}
  const [loading, setLoading] = useState(true);
  const [takedownRequests, setTakedownRequests] = useState([]);
  // Track details dropdown state for artist modal
  const [openTrackIdx, setOpenTrackIdx] = useState(null);
  // Dedicated state for mastering card expand/collapse
  // Use a single index for open mastering card
  const [openMasteringIdx, setOpenMasteringIdx] = useState(null);
  // Attended state for mastering cards
  const [attendedMastering, setAttendedMastering] = useState({});
  // Track details expand state for EP/Album cards
  const [expandedTrackIdx, setExpandedTrackIdx] = useState(null);


  useEffect(() => {
    async function fetchArtists() {
      setLoading(true);
      const snap = await getDocs(collection(db, 'profiles'));
      setArtists(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    async function fetchSubscriptions() {
      const snap = await getDocs(collection(db, 'subscriptions'));
      setSubscriptions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    async function fetchTracks() {
      setLoading(true);
      const snap = await getDocs(collection(db, 'music_releases'));
      setTracks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    // Fetch all artist profiles for contact info
    async function fetchArtistProfiles() {
      const snap = await getDocs(collection(db, 'profiles'));
      const profiles = {};
      snap.docs.forEach(doc => {
        profiles[doc.id] = { id: doc.id, ...doc.data() };
      });
      setArtistProfiles(profiles);
    }
    async function fetchMasteringRequests() {
      setLoading(true);
      const snap = await getDocs(collection(db, 'mastering_requests'));
      setMasteringRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    if (section === 'artists') {
      fetchArtists();
      fetchSubscriptions();
    } else if (section === 'tracks') {
      fetchTracks();
      fetchArtistProfiles();
    } else if (section === 'withdrawals') {
      fetchArtistProfiles();
      // Also fetch latest earnings to update table after withdrawal
      import('firebase/firestore').then(({ collection, getDocs }) =>
        getDocs(collection(db, 'earnings')).then(snap => {
          setEarnings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        })
      );
    } else if (section === 'mastering') {
          fetchMasteringRequests();
        {section === 'mastering' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Mastering Requests</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masteringRequests.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground text-lg py-12">No mastering requests found.</div>
              ) : (
                masteringRequests.map((req, idx) => {
                  const isOpen = openMasteringIdx === idx;
                  return (
                    <div key={req.id || idx} className="bg-pink-200 border border-pink-300 rounded-xl shadow p-6 flex flex-col gap-2 cursor-pointer" onClick={() => setOpenMasteringIdx(isOpen ? null : idx)}>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg mb-2">{req.trackTitle || req.title || 'Untitled Track'}</div>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">{isOpen ? 'Hide' : 'View'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">Requested by: {req.artistName || req.artist || req.userId || 'Unknown'}</div>
                      <div className="text-sm mb-1">Status: <span className="font-semibold">{req.status || 'pending'}</span></div>
                      {isOpen && (
                        <div className="mt-2 border-t pt-3">
                          {Object.entries(req).map(([key, value]) => (
                            <div key={key} className="mb-2">
                              <span className="font-semibold capitalize mr-2">{key}:</span>
                              {/* Show audio preview for audio URLs */}
                              {typeof value === 'string' && value.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                                <audio controls src={value} className="w-full" />
                              ) : (
                                <span className="text-muted-foreground">{typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
    } else if (section === 'takedown') {
      setLoading(true);
      import('firebase/firestore').then(({ collection, getDocs }) =>
        getDocs(collection(db, 'takedown_requests')).then(snap => {
          setTakedownRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        })
      );
    } else if (section === 'earnings') {
      setLoading(true);
      import('firebase/firestore').then(({ collection, getDocs }) =>
        getDocs(collection(db, 'earnings')).then(snap => {
          setEarnings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        })
      );
    } else if (section === 'label') {
      setLabelLoading(true);
      setLabelError(null);
      import('firebase/firestore').then(({ collection, getDocs }) => {
        getDocs(collection(db, 'labelsubscription')).then(snapshot => {
          setLabelSubscriptions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLabelLoading(false);
        }).catch(err => {
          setLabelError(err.message || 'Failed to fetch label subscriptions');
          setLabelLoading(false);
        });
      }).catch(err => {
        setLabelError(err.message || 'Failed to load Firestore');
        setLabelLoading(false);
      });
    }
  }, [section]);

  useEffect(() => {
    // Fetch tracks for selected artist
    async function fetchArtistTracks() {
      if (selectedArtist) {
        const q = query(collection(db, 'music_releases'), where('userId', '==', selectedArtist.id));
        const snap = await getDocs(q);
        setArtistTracks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setArtistTracks([]);
      }
    }
    fetchArtistTracks();
  }, [selectedArtist]);

  if (authLoading) return <div className="p-8">Loading...</div>;
  if (!userProfile || userProfile.role !== 'admin') {
    return <div className="p-8 text-center text-destructive font-bold">Access Denied: Admins only</div>;
  }

  return (
    <React.Fragment>
      <div className="flex flex-col md:flex-row min-h-screen bg-muted">
        {/* Mobile menu button */}
        <button
          className="md:hidden fixed top-4 right-4 z-50 bg-white border border-border rounded-full p-2 shadow-lg"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open admin menu"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="2" fill="#333"/><circle cx="12" cy="12" r="2" fill="#333"/><circle cx="19" cy="12" r="2" fill="#333"/></svg>
        </button>
  {/* Sidebar: hidden on mobile, visible on md+ */}
  <aside className="hidden md:flex md:w-64 bg-white border-r border-border flex-col py-8 px-4">
          <h2 className="font-heading text-xl font-bold mb-8 text-primary">Admin Panel</h2>
          <nav className="flex-1 space-y-2">
            {SECTIONS.map(s => (
              <button
                key={s.key}
                className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors font-medium ${section === s.key ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60 text-foreground'}`}
                onClick={() => { setSection(s.key); setSelectedArtist(null); setMobileMenuOpen(false); }}
              >
                <Icon name={s.icon} size={20} className="mr-3" />
                {s.label}
              </button>
            ))}
          </nav>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => { await signOut(); window.location.reload(); }}
            className="mt-8"
          >
            <Icon name="LogOut" size={16} className="mr-1" />
            Log Out
          </Button>
        </aside>
        {/* Mobile sidebar drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex">
            <aside className="w-64 bg-white border-r border-border flex flex-col py-8 px-4 h-full">
              <button className="absolute top-4 right-4 text-muted-foreground" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <Icon name="X" size={24} />
              </button>
              <h2 className="font-heading text-xl font-bold mb-8 text-primary">Admin Panel</h2>
              <nav className="flex-1 space-y-2">
                {SECTIONS.map(s => (
                  <button
                    key={s.key}
                    className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors font-medium ${section === s.key ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60 text-foreground'}`}
                    onClick={() => { setSection(s.key); setSelectedArtist(null); setMobileMenuOpen(false); }}
                  >
                    <Icon name={s.icon} size={20} className="mr-3" />
                    {s.label}
                  </button>
                ))}
              </nav>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => { await signOut(); window.location.reload(); }}
                className="mt-8"
              >
                <Icon name="LogOut" size={16} className="mr-1" />
                Log Out
              </Button>
            </aside>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}
        {/* Main Content */}
  <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {section === 'mastering' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Mastering Requests</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masteringRequests.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground text-lg py-12">No mastering requests found.</div>
              ) : (
                masteringRequests.map((req, idx) => {
                  const isOpen = openMasteringIdx === idx;
                  const attended = !!attendedMastering[idx];
                  return (
                    <div
                      key={req.id || idx}
                      className={`${attended ? 'bg-green-200 border-green-300' : 'bg-pink-200 border-pink-300'} rounded-xl shadow p-6 flex flex-col gap-2 cursor-pointer`}
                      onClick={() => setOpenMasteringIdx(isOpen ? null : idx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg mb-2">{req.trackTitle || req.title || 'Untitled Track'}</div>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-semibold">{isOpen ? 'Hide' : 'View'}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm text-muted-foreground">Requested by: {req.artistName || req.artist || req.userId || 'Unknown'}</div>
                        <label className="flex items-center gap-1 text-green-700 font-semibold">
                          <input
                            type="checkbox"
                            checked={attended}
                            onChange={e => setAttendedMastering(prev => ({ ...prev, [idx]: e.target.checked }))}
                          />
                          Attended
                        </label>
                      </div>
                      <div className="text-sm mb-1">Status: <span className="font-semibold">{req.status || 'pending'}</span></div>
                      {isOpen && (
                        <div className="mt-2 border-t pt-3">
                          {Object.entries(req).map(([key, value]) => (
                            <div key={key} className="mb-2">
                              <span className="font-semibold capitalize mr-2">{key}:</span>
                              {/* Show audio preview for any audio URL or field named TrackUrl/trackUrl/trackFile */}
                              {typeof value === 'string' && (
                                (key.toLowerCase().includes('trackurl') || key.toLowerCase().includes('trackfile') || value.match(/\.(mp3|wav|ogg|m4a)$/i))
                              ) ? (
                                <audio controls src={value} className="w-full" />
                              ) : (
                                <span className="text-muted-foreground">{typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
          {section === 'contact' && (
            <ContactMessages />
          )}
          {section === 'artists' && (
            <div>
              <h1 className="font-heading text-2xl font-bold mb-6">All Artists</h1>
              {/* Search, filter, sort, pagination UI */}
              <div className="mb-4 flex flex-col md:flex-row gap-2 items-center flex-wrap w-full">
                <input
                  type="text"
                  placeholder="Search artist by name, stage name, or email..."
                  className="border rounded px-2 py-1 text-sm w-64"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <label className="font-semibold">Filter:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={artistFilter}
                  onChange={e => { setArtistFilter(e.target.value); setPage(1); }}
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="frozen">Frozen</option>
                  <option value="unfrozen">Unfrozen</option>
                </select>
                <label className="font-semibold">Plan Type:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={planTypeFilter}
                  onChange={e => { setPlanTypeFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All</option>
                  <option value="Starter">Starter</option>
                  <option value="Growth">Growth</option>
                  <option value="Pro">Pro</option>
                </select>
                <label className="font-semibold">Duration:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={planDurationFilter}
                  onChange={e => { setPlanDurationFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <button
                  className={`border rounded px-2 py-1 text-sm ${endingSoonFilter ? 'bg-yellow-200 border-yellow-400' : 'bg-white border-gray-300'}`}
                  onClick={() => { setEndingSoonFilter(f => !f); setPage(1); }}
                >
                  {endingSoonFilter ? 'Showing plans ending soon' : 'Show plans ending soon'}
                </button>
                <label className="font-semibold">Sort:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                >
                  <option value="new">Newest</option>
                  <option value="old">Oldest</option>
                </select>
              </div>
              {loading ? (
                <div>Loading artists...</div>
              ) : (
                (() => {
                  // Filter, sort, and paginate artists
                  let filtered = [...artists];
                  filtered = filtered.filter(a => a.createdAt);
                  if (search) {
                    const s = search.toLowerCase();
                    filtered = filtered.filter(a => {
                      const fullName = (a.full_name || a.fullName || a.stage_name || a.stageName || '').toLowerCase();
                      const email = (a.email || '').toLowerCase();
                      return fullName.includes(s) || email.includes(s);
                    });
                  }
                  if (artistFilter === 'paid') filtered = filtered.filter(a => a.paymentStatus === 'paid');
                  if (artistFilter === 'paid') {
                    filtered = filtered.filter(a => {
                      const sub = subscriptions.find(s => (s.userId === a.id || s['user id'] === a.id));
                      return sub && sub.amountPaid && sub.amountPaid > 0;
                    });
                  }
                  if (artistFilter === 'unpaid') {
                    filtered = filtered.filter(a => {
                      const sub = subscriptions.find(s => (s.userId === a.id || s['user id'] === a.id));
                      return !sub || !sub.amountPaid || sub.amountPaid === 0;
                    });
                  }
                  if (artistFilter === 'frozen') filtered = filtered.filter(a => a.frozen);
                  if (artistFilter === 'unfrozen') filtered = filtered.filter(a => !a.frozen);
                  // Plan type filter
                  if (planTypeFilter) {
                    filtered = filtered.filter(a => {
                      const sub = subscriptions.find(s => (s.userId === a.id || s['user id'] === a.id));
                      if (!sub || !sub.planName) return false;
                      return sub.planName.toLowerCase().includes(planTypeFilter.toLowerCase());
                    });
                  }
                  // Plan duration filter
                  if (planDurationFilter) {
                    filtered = filtered.filter(a => {
                      const sub = subscriptions.find(s => (s.userId === a.id || s['user id'] === a.id));
                      if (!sub || !sub.planType) return false;
                      return sub.planType.toLowerCase() === planDurationFilter.toLowerCase();
                    });
                  }
                  // Ending soon filter (within 7 days)
                  if (endingSoonFilter) {
                    filtered = filtered.filter(a => {
                      const sub = subscriptions.find(s => (s.userId === a.id || s['user id'] === a.id));
                      if (!sub || !sub.expiryDate || !sub.planType) return false;
                      let expiryDate;
                      const expiry = sub.expiryDate;
                      if (typeof expiry === 'string') expiryDate = new Date(expiry);
                      else if (expiry.toDate) expiryDate = expiry.toDate();
                      else if (expiry.seconds) expiryDate = new Date(expiry.seconds * 1000);
                      const now = new Date();
                      if (sub.planType.toLowerCase() === 'monthly') {
                        // Show if expiry is within next 2 weeks
                        return expiryDate && expiryDate > now && (expiryDate - now <= 14 * 24 * 60 * 60 * 1000);
                      } else if (sub.planType.toLowerCase() === 'yearly') {
                        // Show if expiry is within next 3 months
                        return expiryDate && expiryDate > now && (expiryDate - now <= 90 * 24 * 60 * 60 * 1000);
                      }
                      return false;
                    });
                  }
                  // Sort
                  if (sort === 'new') {
                    filtered.sort((a, b) => new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt) - new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt));
                  } else {
                    filtered.sort((a, b) => new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt) - new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt));
                  }
                  // Pagination
                  const PAGE_SIZE = 10;
                  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
                  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                        {paginated.map((artist, idx) => {
                          const sub = subscriptions.find(s => (s.userId === artist.id || s['user id'] === artist.id));
                          return (
                            <div
                              key={artist.id}
                              className="bg-white rounded-lg border border-border p-4 sm:p-6 flex flex-col items-center shadow hover:shadow-lg transition cursor-pointer w-full"
                              onClick={() => {
                                setSelectedArtist(artist);
                                setOpenTrackIdx(null);
                              }}
                            >
                              <div className="text-xs text-muted-foreground mb-1">Artist {(page - 1) * PAGE_SIZE + idx + 1}</div>
                              <Image src={artist.profilePhoto || '/assets/images/no_image.png'} alt={artist.stageName || artist.full_name || 'Artist'} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mb-3" />
                              <div className="font-bold text-base sm:text-lg">{artist.stageName || artist.full_name || 'Artist'}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">{artist.email}</div>
                              <div className="mt-2 text-xs sm:text-xs">
                                <b>Plan:</b> {sub ? (sub.planType || sub.planName || 'None') : 'None'}<br />
                                <b>Status:</b> {sub ? (sub.status || 'None') : 'None'}<br />
                                <b>Purchase Date:</b> {sub && sub['purchase date'] ? (typeof sub['purchase date'] === 'string' ? sub['purchase date'] : (sub['purchase date'].toDate ? sub['purchase date'].toDate().toLocaleString() : sub['purchase date'].seconds ? new Date(sub['purchase date'].seconds * 1000).toLocaleString() : 'None')) : 'None'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Pagination controls */}
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                          className="px-3 py-1 border rounded bg-gray-100"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                        >Prev</button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                          className="px-3 py-1 border rounded bg-gray-100"
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages}
                        >Next</button>
                      </div>
                    </>
                  );
                })()
              )}
            {/* Artist Details Modal */}
            {selectedArtist && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-2 sm:p-8 relative mx-2 sm:mx-auto overflow-y-auto" style={{maxHeight: '90vh'}}>
                  <button className="absolute top-2 right-2 text-muted-foreground" onClick={() => setSelectedArtist(null)}>
                    <Icon name="X" size={20} />
                  </button>
                  <div className="flex flex-col md:flex-row gap-8">
                    <Image src={selectedArtist.profilePhoto || '/assets/images/no_image.png'} alt={selectedArtist.stageName || selectedArtist.full_name || 'Artist'} className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover mb-4" />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-lg sm:text-2xl mb-2">{selectedArtist.stageName || selectedArtist.full_name || 'Artist'}</h2>
                      <div className="mb-2 text-muted-foreground text-xs sm:text-base">{selectedArtist.email}</div>
                      <div className="mb-2 text-xs sm:text-base"><b>Phone:</b> {selectedArtist.phone || selectedArtist.phoneNumber || <span className='italic'>No phone</span>}</div>
                      <div className="mb-2 text-xs sm:text-base"><b>Role:</b> {selectedArtist.role}</div>
                      <div className="mb-2 text-xs sm:text-base"><b>Joined:</b> {selectedArtist.createdAt ? new Date(selectedArtist.createdAt).toLocaleDateString() : 'N/A'}</div>
                      <div className="mb-2 text-xs sm:text-base"><b>Bio:</b> {selectedArtist.bio || 'N/A'}</div>
                      <div className="mb-2 text-xs sm:text-base"><b>Tracks Submitted:</b> {artistTracks.length}</div>
                      <div className="mb-2 text-xs sm:text-base"><b>Status:</b> {selectedArtist.frozen ? <span className="text-red-600 font-bold">Frozen (Read Only)</span> : <span className="text-green-600 font-bold">Active</span>}</div>
                      {/* Subscription details from subscriptions collection */}
                      {(() => {
                        const sub = subscriptions.find(s => (s.userId === selectedArtist.id || s['user id'] === selectedArtist.id));
                        return (
                          <>
                            <div className="mb-2"><b>Plan:</b> {sub ? (sub.planType || sub.planName || 'None') : 'None'}</div>
                            <div className="mb-2"><b>Purchase Date:</b> {sub && sub.paymentDate ? new Date(sub.paymentDate.seconds ? sub.paymentDate.seconds * 1000 : sub.paymentDate).toLocaleString() : 'None'}</div>
                            <div className="mb-2"><b>Expiry Date:</b> {sub && sub.expiryDate ? new Date(sub.expiryDate.seconds ? sub.expiryDate.seconds * 1000 : sub.expiryDate).toLocaleString() : 'None'}</div>
                            <div className="mb-2"><b>Amount Paid:</b> {sub ? sub.amountPaid : 'None'}</div>
                            <div className="mb-2"><b>Subscription ID:</b> {sub ? sub.id : 'None'}</div>
                          </>
                        );
                      })()}
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant={selectedArtist.frozen ? 'primary' : 'outline'}
                          className={selectedArtist.frozen ? 'text-green-700 border-green-700' : 'text-warning border-warning'}
                          onClick={async () => {
                            const { updateDoc, doc } = await import('firebase/firestore');
                            await updateDoc(doc(db, 'profiles', selectedArtist.id), { frozen: !selectedArtist.frozen });
                            setSelectedArtist({ ...selectedArtist, frozen: !selectedArtist.frozen });
                          }}
                        >
                          <Icon name={selectedArtist.frozen ? 'PlayCircle' : 'PauseCircle'} className="mr-2" />
                          {selectedArtist.frozen ? 'Unfreeze Account' : 'Freeze Account'}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to delete this artist and all their content? This cannot be undone.')) return;
                            try {
                              const { deleteDoc, collection, doc, getDocs, query, where } = await import('firebase/firestore');
                              // Delete artist profile
                              await deleteDoc(doc(collection(db, 'profiles'), selectedArtist.id));
                              // Delete all music releases by this artist
                              const releasesSnap = await getDocs(query(collection(db, 'music_releases'), where('userId', '==', selectedArtist.id)));
                              for (const releaseDoc of releasesSnap.docs) {
                                await deleteDoc(doc(collection(db, 'music_releases'), releaseDoc.id));
                              }
                              // Optionally, delete other related data (earnings, support tickets, etc.)
                              // Remove artist from UI
                              setSelectedArtist(null);
                              setArtists(prev => prev.filter(a => a.id !== selectedArtist.id));
                              window.alert('Artist account and all their content have been deleted.');
                            } catch (err) {
                              window.alert('Failed to delete artist: ' + (err.message || err));
                            }
                          }}
                        >
                          <Icon name="Trash" className="mr-2" />Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Track Submissions</h3>
                    {artistTracks.length === 0 ? (
                      <div className="text-muted-foreground">No tracks submitted yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-border rounded-lg">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-3 text-left">Title</th>
                              <th className="p-3 text-left">Status</th>
                              <th className="p-3 text-left">Release Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {artistTracks.map((track, idx) => (
                              <TrackDetailsRow
                                key={track.id}
                                track={track}
                                isOpen={openTrackIdx === idx}
                                onToggle={() => setOpenTrackIdx(openTrackIdx === idx ? null : idx)}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {section === 'label' && (() => {
          const filteredLabelSubscriptions = labelSubscriptions.filter(sub => {
            if (labelAttendedFilter === 'all') return true;
            if (labelAttendedFilter === 'attended') return sub.attended;
            if (labelAttendedFilter === 'unattended') return !sub.attended;
            return true;
          }).filter(sub => {
            if (labelPlanFilter === 'all') return true;
            // Assuming the plan duration is stored in a field like 'planType' or 'duration'
            return sub.planType === labelPlanFilter || sub.duration === labelPlanFilter;
          });

          return (
            <div>
              <h1 className="font-heading text-2xl font-bold mb-8">Label Subscriptions</h1>
              <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow">
                <div>
                  <label htmlFor="attendedFilter" className="block text-sm font-medium text-gray-700">Attended Status</label>
                  <select
                    id="attendedFilter"
                    value={labelAttendedFilter}
                    onChange={e => setLabelAttendedFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  >
                    <option value="all">All</option>
                    <option value="attended">Attended</option>
                    <option value="unattended">Unattended</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="planFilter" className="block text-sm font-medium text-gray-700">Plan Type</label>
                  <select
                    id="planFilter"
                    value={labelPlanFilter}
                    onChange={e => setLabelPlanFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  >
                    <option value="all">All</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="6 months">6 Months</option>
                  </select>
                </div>
              </div>

              {labelLoading && <div className="text-center text-lg text-muted-foreground">Loading subscriptions...</div>}
              {labelError && <div className="text-center text-lg text-red-600">{labelError}</div>}
              {!labelLoading && !labelError && filteredLabelSubscriptions.length === 0 ? (
                <div className="text-center text-muted-foreground text-lg py-12">No matching label subscriptions found.</div>
              ) : (
                <div className="space-y-4">
                  {filteredLabelSubscriptions.map(sub => {
                    const isExpanded = expandedLabelId === sub.id;
                    const handleAttendedChange = async (e) => {
                      e.stopPropagation();
                      const newAttended = e.target.checked;
                      if (!window.confirm(`Mark this subscription as ${newAttended ? 'attended' : 'unattended'}?`)) {
                        return;
                      }
                      try {
                        const { updateDoc, doc } = await import('firebase/firestore');
                        await updateDoc(doc(db, 'labelsubscription', sub.id), { attended: newAttended });
                        setLabelSubscriptions(prevSubs =>
                          prevSubs.map(s => s.id === sub.id ? { ...s, attended: newAttended } : s)
                        );
                      } catch (err) {
                        alert('Failed to update status: ' + err.message);
                      }
                    };

                    return (
                      <div key={sub.id} className={`bg-white border rounded-xl shadow-lg transition hover:shadow-2xl ${sub.attended ? 'border-green-400 bg-green-50' : 'border-border'}`}>
                        <div className="p-6 cursor-pointer" onClick={() => setExpandedLabelId(isExpanded ? null : sub.id)}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl text-primary truncate">{sub.labelName || 'Unnamed Label'}</h3>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={!!sub.attended}
                                  onChange={handleAttendedChange}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="font-semibold text-sm">Attended</span>
                              </label>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {sub.status || 'pending'}
                              </span>
                              <Button variant="outline" size="sm">
                                {isExpanded ? 'Hide' : 'View'} Details
                              </Button>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border p-6">
                            <h4 className="font-semibold text-lg mb-4">Subscription Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                              {Object.entries(sub).map(([key, value]) => {
                                let displayValue;
                                if (value && typeof value.seconds === 'number') {
                                  displayValue = new Date(value.seconds * 1000).toLocaleString();
                                } else if (typeof value === 'boolean') {
                                  displayValue = value ? 'Yes' : 'No';
                                } else if (Array.isArray(value)) {
                                  displayValue = value.join(', ');
                                } else if (value === null || value === undefined || value === '') {
                                  displayValue = 'N/A';
                                } else {
                                  displayValue = String(value);
                                }

                                return (
                                  <div key={key} className="flex justify-between border-b py-1">
                                    <span className="font-semibold capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span className="text-right">{displayValue}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        })()}
        {section === 'youtube' && (
          <div className="p-8">
            <h1 className="font-heading text-2xl font-bold mb-8 text-center">YouTube Requests</h1>
            <div className="mb-6 flex flex-col sm:flex-row gap-2 items-center justify-center">
              <label className="font-semibold">Filter by Status:</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={youtubeStatusFilter}
                onChange={e => setYoutubeStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="attended">Attended</option>
                <option value="unattended">Unattended</option>
              </select>
            </div>
            {youtubeLoading && <div className="text-center text-lg text-muted-foreground">Loading...</div>}
            {youtubeError && <div className="text-center text-red-600 font-bold mb-4">{youtubeError}</div>}
            {!youtubeLoading && !youtubeError && youtubeRequests.length === 0 && (
              <div className="text-center text-muted-foreground text-lg">No YouTube requests found.</div>
            )}
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white border border-border rounded-lg text-xs sm:text-sm md:text-base">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 sm:p-3 text-left">#</th>
                    <th className="p-2 sm:p-3 text-left">Name</th>
                    <th className="p-2 sm:p-3 text-left">Email</th>
                    <th className="p-2 sm:p-3 text-left">Date</th>
                    <th className="p-2 sm:p-3 text-left">Status</th>
                    <th className="p-2 sm:p-3 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {youtubeRequests
                    .filter(req => {
                      if (youtubeStatusFilter === 'all') return true;
                      if (youtubeStatusFilter === 'attended') return !!req.attended;
                      if (youtubeStatusFilter === 'unattended') return !req.attended;
                      return true;
                    })
                    .map((req, idx) => [
                    <tr key={req.id} className={req.attended ? 'bg-green-200' : expandedIdx === idx ? 'bg-green-50' : ''}>
                      <td className="p-2 sm:p-3">{idx + 1}</td>
                      <td className="p-2 sm:p-3 break-words max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">{req.name || '-'}</td>
                      <td className="p-2 sm:p-3 break-words max-w-[140px] sm:max-w-[200px] md:max-w-[240px]">{req.email || '-'}</td>
                      <td className="p-2 sm:p-3">{req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-')}</td>
                      <td className="p-2 sm:p-3">{req.attended ? 'Attended' : (req.status || '-')}</td>
                      <td className="p-2 sm:p-3 flex flex-col sm:flex-row gap-2">
                        <button type="button" className="px-2 py-1 sm:px-4 sm:py-2 bg-primary text-white rounded w-full sm:w-auto" onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                          {expandedIdx === idx ? 'Hide' : 'Details'}
                        </button>
                        <button type="button" className="px-2 py-1 sm:px-4 sm:py-2 bg-red-600 text-white rounded w-full sm:w-auto" onClick={() => handleDeleteRequest(req.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>,
                    expandedIdx === idx ? (
                      <tr key={req.id + '-details'}>
                        <td colSpan={6} className={req.attended ? 'p-2 sm:p-4 bg-green-200' : 'p-2 sm:p-4 bg-muted/40'}>
                          <div className="flex justify-center">
                            <div className="bg-white border border-border rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xl">
                              <h2 className="font-heading text-lg sm:text-xl font-bold mb-4 text-primary">YouTube Request Details</h2>
                              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                <div><span className="font-semibold">Name:</span> {req.name || '-'}</div>
                                <div><span className="font-semibold">Email:</span> {req.email || '-'}</div>
                                <div><span className="font-semibold">User ID:</span> {req.userId || '-'}</div>
                                <div><span className="font-semibold">Message:</span> {req.message || '-'}</div>
                                <div><span className="font-semibold">Category:</span> {req.category || '-'}</div>
                                <div><span className="font-semibold">Priority:</span> {req.priority || '-'}</div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">Status:</span> {req.status || '-'}
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!req.attended}
                                      onChange={() => handleAttendedChange(req, idx)}
                                      style={{ accentColor: req.attended ? '#22c55e' : undefined }}
                                    />
                                    <span style={{ color: req.attended ? '#22c55e' : undefined, fontWeight: 'bold' }}>Attended</span>
                                  </label>
                                </div>
                                <div><span className="font-semibold">Created:</span> {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleString() : (req.createdAt ? new Date(req.createdAt).toLocaleString() : '-')}</div>
                                {/* Show all other fields dynamically */}
                                {Object.entries(req).map(([key, value]) => (
                                  ['id','name','email','userId','message','category','priority','status','createdAt'].includes(key) ? null : (
                                    <div key={key}><span className="font-semibold">{key}:</span> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}</div>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null
                  ])}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === 'uidsearch' && (
          <div className="max-w-2xl mx-auto w-full">
            <h1 className="font-heading text-2xl font-bold mb-8 text-primary">UID Search</h1>
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <input
                type="text"
                placeholder="Enter Artist UID..."
                className="border-2 border-primary rounded-lg px-4 py-3 text-lg w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-primary transition"
                value={uidSearch || ''}
                onChange={e => setUidSearch(e.target.value)}
              />
              <button
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold text-lg shadow hover:bg-primary/90 transition"
                disabled={!uidSearch.trim()}
                onClick={() => setUidSearch(uidSearch.trim())}
              >Search</button>
            </div>
            {/* Artist details and related info will be shown here after search */}
          </div>
        )}
        {section === 'tracks' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Track Submissions</h1>
            <div className="mb-4 text-lg text-primary">hello</div>
            {renderTrackAnalytics()}
            {loading ? <div>Loading tracks...</div> : (
              <>
                {/* --- FILTER BAR & SEARCH --- */}
                <div className="flex flex-col md:flex-row gap-2 mb-6 items-center justify-between w-full">
                  <input
                    type="text"
                    placeholder="Search track by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 w-full md:w-64"
                  />
                  {/* Action Filter Dropdown */}
                  <select
                    value={actionFilter || ''}
                    onChange={e => setActionFilter(e.target.value)}
                    className="border rounded px-3 py-2 w-full md:w-auto"
                  >
                    <option value="">All Actions</option>
                    <option value="attended">Attended</option>
                    <option value="unattended">Unattended</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="copyrightIssue">Copyright Issue</option>
                    <option value="paused">Pause/Later</option>
                  </select>
                  {/* Status Filter Dropdown */}
                  <select
                    value={statusFilter || ''}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border rounded px-3 py-2 w-full md:w-auto"
                  >
                    <option value="">All Statuses</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="distributed">Distributed</option>
                    <option value="live">Live</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {/* Singles Section */}
                <div className="overflow-x-auto mb-12 w-full">
                  <h2 className="font-heading text-xl font-bold mb-4">Singles</h2>
                  <table className="min-w-full bg-white border border-border rounded-lg w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-3 text-left">#</th>
                        <th className="p-3 text-left">Title</th>
                        <th className="p-3 text-left">Artist</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Release Date</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks
                        .filter(t => !Array.isArray(t.tracks) || t.tracks.length === 0)
                        .filter(track => track.title?.toLowerCase().includes(search.toLowerCase()))
                        .filter(track => {
                          if (!actionFilter) return true;
                          if (actionFilter === 'unattended') return !track.attended;
                          return !!track[actionFilter];
                        })
                        .filter(track => {
                          if (!statusFilter) return true;
                          return (track.status === statusFilter);
                        })
                        .filter(track => {
                          if (trackFilter === 'new') {
                            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                            return new Date(track.submittedAt).getTime() >= sevenDaysAgo;
                          }
                          if (trackFilter === 'old') {
                            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                            return new Date(track.submittedAt).getTime() < sevenDaysAgo;
                          }
                          return true;
                        })
                        .sort((a, b) => {
                          // Always sort oldest first (earliest submission at top)
                      return new Date(b.submittedAt) - new Date(a.submittedAt);
                        })
                        .map((track, idx) => (
                          <React.Fragment key={track.id}>
                            <tr className={`border-b border-border hover:bg-muted/40 transition
                              ${track.attended ? 'bg-green-100' : ''}
                              ${track.paused ? 'bg-purple-100' : ''}
                              ${track.copyrightIssue ? 'bg-orange-100' : ''}
                              ${track.duplicate ? 'bg-yellow-100' : ''}
                            `}
                              style={(Number(!!track.attended) + Number(!!track.duplicate) + Number(!!track.copyrightIssue) + Number(!!track.paused)) > 1 ? {
                                border: '2px solid #000', borderRadius: '0.5rem'
                              } : {}}>
                              <td className="p-3 font-bold">{idx + 1}</td>
                              {/* Status Stars */}
                              <div className="flex items-center gap-1 mr-2">
                                {track.attended && <span title="Attended" className="text-green-500 text-xl">★</span>}
                                {track.duplicate && <span title="Duplicate" className="text-yellow-500 text-xl">★</span>}
                                {track.copyrightIssue && <span title="Copyright Issue" className="text-orange-500 text-xl">★</span>}
                                {track.paused && <span title="Pause/Later" className="text-purple-500 text-xl">★</span>}
                                {(track.attended || track.duplicate || track.copyrightIssue || track.paused) && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    Status:
                                    {track.attended && <span className="ml-1">Attended</span>}
                                    {track.duplicate && <span className="ml-1">Duplicate</span>}
                                    {track.copyrightIssue && <span className="ml-1">Copyright</span>}
                                    {track.paused && <span className="ml-1">Pause</span>}
                                  </span>
                                )}
                              </div>
                              <td className="p-3 flex items-center gap-2">
                                <button onClick={() => setOpenTrackIdx(idx === openTrackIdx ? null : idx)} className="text-primary focus:outline-none">
                                  <Icon name={openTrackIdx === idx ? 'ChevronDown' : 'ChevronRight'} size={18} />
                                </button>
                                {track.title}
                                {/* Badge for new/old */}
                                {(() => {
                                  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                                  const isNew = new Date(track.submittedAt).getTime() >= sevenDaysAgo;
                                  return (
                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${isNew ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {isNew ? 'New' : 'Old'}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="p-3">
                                {track.artist
                                  || (Array.isArray(track.mainArtists) && track.mainArtists.length > 0 && (typeof track.mainArtists[0] === 'string' ? track.mainArtists[0] : track.mainArtists[0]?.name))
                                  || 'Unknown'}
                              </td>
                              <td className="p-3">
                                <select
                                  className="border rounded px-2 py-1 text-sm"
                                  value={track.status || 'processing'}
                                  onChange={async e => {
                                    const newStatus = e.target.value;
                                    try {
                                      await updateDoc(doc(db, 'music_releases', track.id), { status: newStatus });
                                      setTracks(prev => prev.map(t => t.id === track.id ? { ...t, status: newStatus } : t));
                                    } catch (err) {
                                      alert('Failed to update status: ' + err.message);
                                    }
                                  }}
                                >
                                  <option value="processing">Processing</option>
                                  <option value="approved">Approved</option>
                                  <option value="active">Active</option>
                                  <option value="distributed">Distributed</option>
                                  <option value="live">Live</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                            </td>
                            <td className="p-3">{track.releaseDate ? new Date(track.releaseDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="p-3 flex gap-2">
                              {/* Copyright Issue Checkbox */}
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={track.copyrightIssue || false}
                                  onChange={async e => {
                                    if (e.target.checked) {
                                      if (!window.confirm('Flag this track for copyright issues? This will turn the row orange.')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { copyrightIssue: true });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, copyrightIssue: true } : t));
                                      } catch (err) {
                                        alert('Failed to mark copyright issue: ' + err.message);
                                      }
                                    } else {
                                      if (!window.confirm('Unmark copyright issue for this track?')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { copyrightIssue: false });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, copyrightIssue: false } : t));
                                      } catch (err) {
                                        alert('Failed to unmark copyright issue: ' + err.message);
                                      }
                                    }
                                  }}
                                  className="w-4 h-4 accent-orange-500 border-2 border-orange-400 rounded-lg shadow focus:ring-2 focus:ring-orange-300"
                                />
                                <span className="text-orange-700 text-xs font-semibold">Copyright Issue</span>
                              </label>
                              {/* Duplicate Track Checkbox */}
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={track.duplicate || false}
                                  onChange={async e => {
                                    if (e.target.checked) {
                                      if (!window.confirm('Flag this track as a duplicate? This will turn the row yellow.')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { duplicate: true });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, duplicate: true } : t));
                                      } catch (err) {
                                        alert('Failed to mark duplicate: ' + err.message);
                                      }
                                    } else {
                                      if (!window.confirm('Unmark duplicate for this track?')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { duplicate: false });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, duplicate: false } : t));
                                      } catch (err) {
                                        alert('Failed to unmark duplicate: ' + err.message);
                                      }
                                    }
                                  }}
                                  className="w-4 h-4 accent-yellow-500 border-2 border-yellow-400 rounded-lg shadow focus:ring-2 focus:ring-yellow-300"
                                />
                                <span className="text-yellow-700 text-xs font-semibold">Duplicate Track</span>
                              </label>
                              {/* Attended Checkbox */}
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={track.attended || false}
                                  onChange={async e => {
                                    if (e.target.checked) {
                                      if (!window.confirm('Mark this track as attended? This will turn the row green and indicate you have finished working on it.')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { attended: true, paused: false });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, attended: true, paused: false } : t));
                                      } catch (err) {
                                        alert('Failed to mark as attended: ' + err.message);
                                      }
                                    } else {
                                      if (!window.confirm('Unmark this track as attended? This will remove the green highlight.')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { attended: false });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, attended: false } : t));
                                      } catch (err) {
                                        alert('Failed to unmark as attended: ' + err.message);
                                      }
                                    }
                                  }}
                                  className="w-4 h-4 accent-green-500 border-2 border-green-400 rounded-lg shadow focus:ring-2 focus:ring-green-300"
                                />
                                <span className="text-green-700 text-xs font-semibold">Attended</span>
                              </label>
                              {/* Pause/Later Checkbox */}
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={track.paused || false}
                                  onChange={async e => {
                                    if (e.target.checked) {
                                      if (!window.confirm('Pause this track for later? This will turn the row purple and indicate you will come back to it.')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { paused: true, attended: false });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, paused: true, attended: false } : t));
                                      } catch (err) {
                                        alert('Failed to mark as paused: ' + err.message);
                                      }
                                    } else {
                                      if (!window.confirm('Unmark this track as paused? This will remove the purple highlight.')) return;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', track.id), { paused: false });
                                        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, paused: false } : t));
                                      } catch (err) {
                                        alert('Failed to unmark as paused: ' + err.message);
                                      }
                                    }
                                  }}
                                  className="w-4 h-4 accent-purple-500 border-2 border-purple-400 rounded-lg shadow focus:ring-2 focus:ring-purple-300"
                                />
                                <span className="text-purple-700 text-xs font-semibold">Pause/Later</span>
                              </label>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  if (!window.confirm('Are you sure you want to delete this track? This cannot be undone.')) return;
                                  try {
                                    const { deleteDoc, collection, doc } = await import('firebase/firestore');
                                    await deleteDoc(doc(collection(db, 'music_releases'), track.id));
                                    setTracks(prev => prev.filter(t => t.id !== track.id));
                                    window.alert('Track deleted successfully.');
                                  } catch (err) {
                                    window.alert('Failed to delete track: ' + (err.message || err));
                                  }
                                }}
                              >Delete</Button>
                            </td>
                          </tr>
                          {openTrackIdx === idx && (
                            <tr className="bg-muted/30">
                              <td colSpan={5} className="p-4">
                                <div className="flex flex-col md:flex-row gap-8 max-h-96 overflow-y-auto">
                                  {/* Left: Cover, Audio, Contact Info, Main/Featured Artists & Streaming Links */}
                                  <div className="min-w-[220px] flex flex-col items-center gap-4">
                                    <Image src={track.coverArtUrl || track.coverArt || '/assets/images/no_image.png'} alt="Cover Art" className="w-36 h-36 rounded object-cover shadow mb-2" />
                                    {/* Artist Contact Info */}
                                    <div className="w-full mt-2">
                                      <div className="font-bold mb-1">Artist Contact Info:</div>
                                      <div className="text-xs text-muted-foreground">
                                        {/* Artist contact info rendering logic should go here. Remove invalid IIFE and return statement. */}
                                      </div>
                                    </div>
                                    {(track.audioUrl || track.trackFile || track.fileUrl || track.file) && (
                                      <>
                                        <audio controls src={track.audioUrl || track.trackFile || track.fileUrl || track.file} className="w-full mt-2" />
                                        <div className="mt-2">
                                          <a href={track.audioUrl || track.trackFile || track.fileUrl || track.file} target="_blank" rel="noopener noreferrer" className="text-primary underline">Open Track in New Tab</a>
                                        </div>
                                        <a href={track.audioUrl || track.trackFile || track.fileUrl || track.file} download className="btn btn-sm btn-outline-primary mt-2">Download</a>
                                      </>
                                    )}
                                    {/* Main Artists & Streaming Links */}
                                    <div className="w-full mt-4">
                                      <div className="font-bold mb-1">Main Artists & Streaming Links:</div>
                                      {Array.isArray(track.mainArtists) && track.mainArtists.length > 0 ? (
                                        <ul className="ml-2 space-y-2">
                                          {track.mainArtists.map((artist, idx) => (
                                            <li key={artist.name || artist || idx} className="mb-1">
                                              <span className="font-semibold">{artist.name || artist}</span>
                                              <div className="ml-2 text-xs flex flex-col gap-1">
                                                <span><span className="font-semibold">Spotify:</span> {artist.spotify && artist.spotify.trim() ? (<a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open</a>) : (<span className="text-muted-foreground">None</span>)}</span>
                                                <span><span className="font-semibold">Apple Music:</span> {artist.apple && artist.apple.trim() ? (<a href={artist.apple} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Open</a>) : (<span className="text-muted-foreground">None</span>)}</span>
                                                <span><span className="font-semibold">YouTube:</span> {artist.youtube && artist.youtube.trim() ? (<a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Open</a>) : (<span className="text-muted-foreground">None</span>)}</span>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : <span className="ml-2">-</span>}
                                    </div>
                                    {/* Featured Artists & Streaming Links */}
                                    <div className="w-full mt-4">
                                      <div className="font-bold mb-1">Featured Artists & Streaming Links:</div>
                                      {Array.isArray(track.featuredArtists) && track.featuredArtists.length > 0 ? (
                                        <ul className="ml-2 space-y-2">
                                          {track.featuredArtists.map((artist, idx) => (
                                            <li key={artist.name || artist || idx} className="mb-1">
                                              <span className="font-semibold">{artist.name || artist}</span>
                                              <div className="ml-2 text-xs flex flex-col gap-1">
                                                <span><span className="font-semibold">Spotify:</span> {artist.spotify && artist.spotify.trim() ? (<a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open</a>) : (<span className="text-muted-foreground">None</span>)}</span>
                                                <span><span className="font-semibold">Apple Music:</span> {artist.apple && artist.apple.trim() ? (<a href={artist.apple} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Open</a>) : (<span className="text-muted-foreground">None</span>)}</span>
                                                <span><span className="font-semibold">YouTube:</span> {artist.youtube && artist.youtube.trim() ? (<a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Open</a>) : (<span className="text-muted-foreground">None</span>)}</span>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : <span className="ml-2">-</span>}
                                    </div>
                                    {/* Track-level Streaming Links */}
                                    {(() => {
                                      let streamingLinks = track.streamingLinks || {};
                                      if (typeof streamingLinks === 'string') {
                                        try {
                                          streamingLinks = JSON.parse(streamingLinks);
                                        } catch {
                                          streamingLinks = {};
                                        }
                                      }
                                      return (
                                        (streamingLinks.spotify && streamingLinks.spotify.trim()) ||
                                        (streamingLinks.appleMusic && streamingLinks.appleMusic.trim()) ||
                                        (streamingLinks.youtube && streamingLinks.youtube.trim())
                                      ) ? (
                                        <div className="mt-4 space-y-2">
                                          <div className="font-bold mb-1">Track Streaming Links:</div>
                                          {streamingLinks.spotify && streamingLinks.spotify.trim() && (
                                            <div className="flex items-center gap-2">
                                              <Icon name="Spotify" size={18} className="text-green-600" />
                                              <a href={streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline break-all">Spotify</a>
                                            </div>
                                          )}
                                          {streamingLinks.appleMusic && streamingLinks.appleMusic.trim() && (
                                            <div className="flex items-center gap-2">
                                              <Icon name="Apple" size={18} className="text-gray-700" />
                                              <a href={streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline break-all">Apple Music</a>
                                            </div>
                                          )}
                                          {streamingLinks.youtube && streamingLinks.youtube.trim() && (
                                            <div className="flex items-center gap-2">
                                              <Icon name="Youtube" size={18} className="text-red-600" />
                                              <a href={streamingLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline break-all">YouTube</a>
                                            </div>
                                          )}
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                  {/* Right: All Details Table */}
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-white border border-border rounded-lg p-4 shadow">
                                      <div className="mb-2 flex items-center gap-4">
                                        <span className="font-bold text-lg text-primary">{track.title || 'Untitled Track'}</span>
                                        {track.coverArtUrl || track.coverArt ? (
                                          <a href={track.coverArtUrl || track.coverArt} target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-blue-100 text-blue-700 rounded px-3 py-1 font-semibold shadow hover:bg-blue-200">View Cover Image</a>
                                        ) : null}
                                        {(track.audioUrl || track.trackFile || track.fileUrl || track.file) && (
                                          <>
                                            <a href={track.audioUrl || track.trackFile || track.fileUrl || track.file} target="_blank" rel="noopener noreferrer" className="btn btn-sm bg-green-100 text-green-700 rounded px-3 py-1 font-semibold shadow hover:bg-green-200">Open Track</a>
                                            <a href={track.audioUrl || track.trackFile || track.fileUrl || track.file} download className="btn btn-sm bg-purple-100 text-purple-700 rounded px-3 py-1 font-semibold shadow hover:bg-purple-200 ml-2">Download Track</a>
                                          </>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                                        <div><span className="font-semibold text-orange-600">Additional Credits:</span> {Array.isArray(track.additionalCredits) ? track.additionalCredits.join(', ') : (track.additionalCredits || '-')}</div>
                                        <div><span className="font-semibold">Songwriter(s):</span> {Array.isArray(track.songwriters) ? track.songwriters.join(', ') : (track.songwriter || '-')}</div>
                                        <div><span className="font-semibold text-blue-700">Status:</span> {track.status || 'Processing'}</div>
                                        <div><span className="font-semibold text-green-700">Artist:</span> {track.artist || (Array.isArray(track.mainArtists) && track.mainArtists.length > 0 ? track.mainArtists.map(a => a.name || a).join(', ') : 'Unknown')}</div>
                                        <div><span className="font-semibold text-purple-700">Featured Artists:</span> {Array.isArray(track.featuredArtists) && track.featuredArtists.length > 0 ? track.featuredArtists.map(a => a.name || a).join(', ') : '-'}</div>
                                        <div><span className="font-semibold text-pink-700">Collaboration:</span> {track.collaboration || '-'}</div>
                                        <div><span className="font-semibold text-orange-700">Release Date:</span> {track.releaseDate ? new Date(track.releaseDate).toLocaleDateString() : 'N/A'}</div>
                                        <div><span className="font-semibold text-indigo-700">ISRC:</span> {track.isrc || track.isrcCode || '-'}</div>
                                        <div><span className="font-semibold text-teal-700">Duration:</span> {track.duration || '-'}</div>
                                        <div><span className="font-semibold text-red-700">Explicit:</span> {track.isExplicit ? 'Yes' : 'No'}</div>
                                        <div><span className="font-semibold text-gray-700">Language:</span> {track.language || '-'}</div>
                                        <div><span className="font-semibold text-yellow-700">Territory:</span> {track.territory || '-'}</div>
                                        <div><span className="font-semibold text-cyan-700">Distribution Platforms:</span> {Array.isArray(track.distributionPlatforms) ? track.distributionPlatforms.join(', ') : '-'}</div>
                                        <div><span className="font-semibold text-fuchsia-700">Copyright Info:</span> {track.copyrightInfo || '-'}</div>
                                        <div><span className="font-semibold text-lime-700">Submitted By:</span> {track.submitterName || track.userId || '-'}<br />
                                        <span className="font-semibold text-blue-700">Email:</span> {track.submitterEmail || '-'}</div>
                                        <div><span className="font-semibold text-rose-700">Genres:</span> {Array.isArray(track.genres) ? track.genres.join(', ') : track.genre || '-'}</div>
                                        <div><span className="font-semibold text-violet-700">Description:</span> {track.description || '-'}</div>
                                        <div><span className="font-semibold text-sky-700">Track ID:</span> {track.id}</div>
                                        <div><span className="font-semibold text-amber-700">Songwriter(s):</span> {Array.isArray(track.songwriters) ? track.songwriters.join(', ') : (track.songwriter || '-')}</div>
                                      </div>
                                      {/* Streaming Links */}
                                      <div className="mb-2">
                                        <span className="font-semibold">Track Streaming Links:</span>
                                        {(() => {
                                          let streamingLinks = track.streamingLinks || {};
                                          if (typeof streamingLinks === 'string') {
                                            try {
                                              streamingLinks = JSON.parse(streamingLinks);
                                            } catch {
                                              streamingLinks = {};
                                            }
                                          }
                                          return (
                                            <div className="flex gap-4 mt-1 flex-wrap">
                                              {streamingLinks.spotify && (
                                                <a href={streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Spotify</a>
                                              )}
                                              {streamingLinks.appleMusic && (
                                                <a href={streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Apple Music</a>
                                              )}
                                              {streamingLinks.youtube && (
                                                <a href={streamingLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">YouTube</a>
                                              )}
                                              {!streamingLinks.spotify && !streamingLinks.appleMusic && !streamingLinks.youtube && <span className="text-muted-foreground">None</span>}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* EPs & Albums Section */}
                  {/* EPs & Albums Section - Enhanced */}
                  <div className="overflow-x-auto w-full">
                    <h2 className="font-heading text-xl font-bold mb-4 mt-12">EPs & Albums</h2>
                    {/* Filter/Search/Sort Bar for EPs/Albums */}
                    <div className="flex flex-wrap gap-4 mb-4 items-center">
                      <input type="text" className="border rounded px-2 py-1 text-sm" placeholder="Search EP/Album title..." value={epAlbumSearch || ''} onChange={e => setEpAlbumSearch(e.target.value)} />
                      <select className="border rounded px-2 py-1 text-sm" value={epAlbumStatusFilter || ''} onChange={e => setEpAlbumStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="processing">Processing</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="distributed">Distributed</option>
                        <option value="live">Live</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <select className="border rounded px-2 py-1 text-sm" value={epAlbumSort || 'newest'} onChange={e => setEpAlbumSort(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                      </select>
                      {/* Action Filter Bar */}
                      <select className="border rounded px-2 py-1 text-sm" value={epAlbumActionFilter || ''} onChange={e => setEpAlbumActionFilter(e.target.value)}>
                        <option value="">All Actions</option>
                        <option value="attended">Attended</option>
                        <option value="duplicate">Duplicate</option>
                        <option value="copyright">Copyright</option>
                        <option value="pause">Pause/Later</option>
                      </select>
                    </div>
                    {/* EPs/Albums List */}
                    {filteredEpAlbums.length === 0 ? (
                      <div className="text-muted-foreground">No EPs or albums found.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                        {filteredEpAlbums.map((release, idx) => (
                          <div
                            key={release.id}
                            className={`bg-white border border-border rounded-lg shadow p-6 flex flex-col cursor-pointer
                              ${release.attended ? 'border-green-400 bg-green-50' : release.duplicate ? 'border-yellow-400 bg-yellow-50' : release.copyright ? 'border-red-400 bg-red-50' : release.pause ? 'border-purple-400 bg-purple-50' : 'border-border'}`}
                            onClick={() => setExpandedEpAlbumId(expandedEpAlbumId === release.id ? null : release.id)}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <Image src={release.coverArtUrl || release.coverArt || '/assets/images/no_image.png'} alt="Cover Art" className="w-24 h-24 rounded object-cover" />
                              <div>
                                <div className="font-bold text-lg flex items-center gap-2">{release.title}
                                  {/* Show all selected stars at once */}
                                  {release.attended && <span title="Attended (Green)" className="text-green-500 text-xl" style={{cursor:'pointer'}} aria-label="Attended (Green)">★</span>}
                                  {release.duplicate && <span title="Duplicate (Yellow)" className="text-yellow-500 text-xl" style={{cursor:'pointer'}} aria-label="Duplicate (Yellow)">★</span>}
                                  {release.copyright && <span title="Copyright Issue (Red)" className="text-red-500 text-xl" style={{cursor:'pointer'}} aria-label="Copyright Issue (Red)">★</span>}
                                  {release.pause && <span title="Pause/Later (Purple)" className="text-purple-500 text-xl" style={{cursor:'pointer'}} aria-label="Pause/Later (Purple)">★</span>}
                                  {/* Fallback for status if no action selected */}
                                  {!(release.attended || release.duplicate || release.copyright || release.pause) && (
                                    <span title={release.status === 'approved' ? 'Approved (Yellow)' : release.status === 'processing' ? 'Processing (Gray)' : release.status === 'rejected' ? 'Rejected (Red)' : 'Active (Green)'} className={`ml-2 text-xl`} style={{cursor:'pointer'}} aria-label={release.status === 'approved' ? 'Approved (Yellow)' : release.status === 'processing' ? 'Processing (Gray)' : release.status === 'rejected' ? 'Rejected (Red)' : 'Active (Green)'}>{/* color class below */}<span className={release.status === 'approved' ? 'text-yellow-500' : release.status === 'processing' ? 'text-gray-400' : release.status === 'rejected' ? 'text-red-500' : 'text-green-500'}>★</span></span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {/* Action Checkboxes with confirmation and color logic */}
                                  <label className="flex items-center gap-1 text-xs" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={!!release.attended}
                                      onChange={async e => {
                                        e.stopPropagation();
                                        if (e.target.checked) {
                                          if (!window.confirm('Mark this release as attended? This will turn the card green and show a green star.')) return;
                                        } else {
                                          if (!window.confirm('Unmark as attended? This will remove the green highlight.')) return;
                                        }
                                        handleEpAlbumAction(release.id, 'attended', e.target.checked);
                                      }}
                                    />Attended
                                  </label>
                                  <label className="flex items-center gap-1 text-xs" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={!!release.duplicate}
                                      onChange={async e => {
                                        e.stopPropagation();
                                        if (e.target.checked) {
                                          if (!window.confirm('Mark this release as duplicate? This will turn the card yellow and show a yellow star.')) return;
                                        } else {
                                          if (!window.confirm('Unmark as duplicate? This will remove the yellow highlight.')) return;
                                        }
                                        handleEpAlbumAction(release.id, 'duplicate', e.target.checked);
                                      }}
                                    />Duplicate
                                  </label>
                                  <label className="flex items-center gap-1 text-xs" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={!!release.copyright}
                                      onChange={async e => {
                                        e.stopPropagation();
                                        if (e.target.checked) {
                                          if (!window.confirm('Mark this release as copyright issue? This will turn the card red and show a red star.')) return;
                                        } else {
                                          if (!window.confirm('Unmark as copyright issue? This will remove the red highlight.')) return;
                                        }
                                        handleEpAlbumAction(release.id, 'copyright', e.target.checked);
                                      }}
                                    />Copyright
                                  </label>
                                  <label className="flex items-center gap-1 text-xs" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={!!release.pause}
                                      onChange={async e => {
                                        e.stopPropagation();
                                        if (e.target.checked) {
                                          if (!window.confirm('Pause this release for later? This will turn the card purple and show a purple star.')) return;
                                        } else {
                                          if (!window.confirm('Unmark as pause/later? This will remove the purple highlight.')) return;
                                        }
                                        handleEpAlbumAction(release.id, 'pause', e.target.checked);
                                      }}
                                    />Pause/Later
                                  </label>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-2">Status:
                                  <select
                                    className="border rounded px-2 py-1 text-xs"
                                    value={release.status || ''}
                                    onChange={async e => {
                                      e.stopPropagation();
                                      const newStatus = e.target.value;
                                      try {
                                        await updateDoc(doc(db, 'music_releases', release.id), { status: newStatus });
                                        setTracks(prev => prev.map(t => t.id === release.id ? { ...t, status: newStatus } : t));
                                      } catch (err) {
                                        alert('Failed to update status: ' + err.message);
                                      }
                                    }}
                                  >
                                    <option value="">Select status</option>
                                    <option value="processing">Processing</option>
                                    <option value="approved">Approved</option>
                                    <option value="active">Active</option>
                                    <option value="distributed">Distributed</option>
                                    <option value="live">Live</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="ml-2"
                                    onClick={async e => {
                                      e.stopPropagation();
                                      if (!window.confirm('Are you sure you want to delete this EP/Album? This cannot be undone.')) return;
                                      try {
                                        const { deleteDoc, collection, doc } = await import('firebase/firestore');
                                        await deleteDoc(doc(collection(db, 'music_releases'), release.id));
                                        setTracks(prev => prev.filter(t => t.id !== release.id));
                                        window.alert('EP/Album deleted successfully.');
                                      } catch (err) {
                                        window.alert('Failed to delete EP/Album: ' + (err.message || err));
                                      }
                                    }}
                                  >Delete</Button>
                                </div>
                              </div>
                            </div>
                            {/* Expanded details: show if expandedEpAlbumId === release.id */}
                            {expandedEpAlbumId === release.id && (
                              <>
                                {/* Powerful Card Design */}
                                <div className="bg-white rounded-xl shadow-lg border border-primary p-6 mb-6 flex flex-col gap-6">
                                  <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex flex-col items-center gap-2 min-w-[120px]">
                                      <Image src={release.coverArtUrl || release.coverArt || '/assets/images/no_image.png'} alt="Cover Art" className="w-32 h-32 rounded-lg object-cover shadow" />
                                      <div className="font-bold text-lg mt-2">{release.title}</div>
                                      <div className="text-xs text-muted-foreground">{release.releaseType || 'EP/Album'}</div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div><span className="font-bold">Artist(s):</span> {Array.isArray(release.mainArtists) ? release.mainArtists.map(a => a.name || a).join(', ') : (release.artist || '-')}</div>
                                      <div><span className="font-bold">Featured Artists:</span> {Array.isArray(release.featuredArtists) ? release.featuredArtists.map(a => a.name || a).join(', ') : '-'}</div>
                                      <div><span className="font-bold">Release Date:</span> {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : '-'}</div>
                                      <div><span className="font-bold">Genre:</span> {release.genre || '-'}</div>
                                      <div><span className="font-bold">Language:</span> {release.language || '-'}</div>
                                      <div><span className="font-bold">Explicit:</span> {release.isExplicit ? 'Yes' : 'No'}</div>
                                      <div><span className="font-bold">Territory:</span> {release.territory || '-'}</div>
                                      <div><span className="font-bold">Distribution Platforms:</span> {Array.isArray(release.distributionPlatforms) ? release.distributionPlatforms.join(', ') : '-'}</div>
                                      <div className="col-span-2"><span className="font-bold">Copyright Info:</span> {release.copyrightInfo || '-'}</div>
                                      <div className="col-span-2 flex gap-6 mt-2">
                                        <span className="font-bold">Artist Links:</span>
                                        <span>Spotify: {release.streamingLinks?.spotify ? <a href={release.streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open</a> : <span className="text-muted-foreground">None</span>}</span>
                                        <span>Apple Music: {release.streamingLinks?.appleMusic ? <a href={release.streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Open</a> : <span className="text-muted-foreground">None</span>}</span>
                                        <span>YouTube: {release.streamingLinks?.youtube ? <a href={release.streamingLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Open</a> : <span className="text-muted-foreground">None</span>}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* Tracklist Table - Modern Design */}
                                <div className="mb-2 font-semibold text-lg">Tracklist</div>
                                <div className="rounded-xl shadow bg-white border border-border mb-4 overflow-x-auto w-full max-w-full">
                                  <table className="min-w-[600px] w-full text-sm">
                                    <thead>
                                      <tr className="bg-muted">
                                        <th className="p-3 text-left">#</th>
                                        <th className="p-3 text-left">Title</th>
                                        <th className="p-3 text-left">ISRC</th>
                                        <th className="p-3 text-left">Duration</th>
                                        <th className="p-3 text-left">Download</th>
                                        <th className="p-3 text-left">Links</th>
                                        <th className="p-3 text-left">Details</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {release.tracks.map((t, i) => (
                                        <tr key={t.id || t.title || i} className="border-b border-border hover:bg-primary/10 transition cursor-pointer">
                                          <td className="p-3 font-bold whitespace-nowrap">{i + 1}</td>
                                          <td className="p-3 whitespace-nowrap">{t.title || '-'}</td>
                                          <td className="p-3 whitespace-nowrap">{t.isrc || t.isrcCode || '-'}</td>
                                          <td className="p-3 whitespace-nowrap">{t.duration || '-'}</td>
                                          <td className="p-3 whitespace-nowrap">
                                            {t.fileUrl || t.audioUrl ? (
                                              <a href={t.fileUrl || t.audioUrl} download className="text-primary underline">Download</a>
                                            ) : (
                                              '-'
                                            )}
                                          </td>
                                          <td className="p-3 whitespace-nowrap">
                                            {t.streamingLinks ? (
                                              <>
                                                {t.streamingLinks.spotify && (
                                                  <a href={t.streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline mr-2">Spotify</a>
                                                )}
                                                {t.streamingLinks.appleMusic && (
                                                  <a href={t.streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline mr-2">Apple</a>
                                                )}
                                                {t.streamingLinks.youtube && (
                                                  <a href={t.streamingLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">YouTube</a>
                                                )}
                                              </>
                                            ) : '-'}
                                          </td>
                                          <td className="p-3 whitespace-nowrap">
                                            <button
                                              type="button"
                                              className="text-primary underline font-semibold"
                                              onClick={e => {
                                                e.stopPropagation();
                                                setEpAlbumTrackModal({ release, track: t, idx: i });
                                              }}
                                            >View</button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            )}
      {/* EP/Album Track Modal - Powerful Card Design */}
      {epAlbumTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full relative flex flex-col md:flex-row gap-8">
            <button className="absolute top-2 right-2 text-xl text-muted-foreground" type="button" tabIndex={0} aria-label="Close" onClick={e => { e.stopPropagation(); setEpAlbumTrackModal(null); }}>&times;</button>
            {/* Left: Cover Art & Audio */}
            <div className="flex flex-col items-center gap-2 min-w-[160px]">
              <Image src={epAlbumTrackModal.release.coverArtUrl || epAlbumTrackModal.release.coverArt || '/assets/images/no_image.png'} alt="Cover Art" className="w-36 h-36 rounded object-cover shadow mb-2" />
              <a href={epAlbumTrackModal.release.coverArtUrl || epAlbumTrackModal.release.coverArt || '/assets/images/no_image.png'} download className="btn btn-sm btn-outline-primary w-full mb-2">Download Cover Art</a>
              <div className="font-bold text-lg mb-2">{epAlbumTrackModal.track.title || '-'}</div>
              {epAlbumTrackModal.track.fileUrl || epAlbumTrackModal.track.audioUrl ? (
                <audio controls src={epAlbumTrackModal.track.fileUrl || epAlbumTrackModal.track.audioUrl} className="w-full mb-2" />
              ) : null}
              {epAlbumTrackModal.track.fileUrl || epAlbumTrackModal.track.audioUrl ? (
                <a href={epAlbumTrackModal.track.fileUrl || epAlbumTrackModal.track.audioUrl} download className="btn btn-sm btn-outline-primary w-full">Download Track</a>
              ) : null}
            </div>
            {/* Right: Details */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <div><span className="font-bold">Songwriter:</span> {epAlbumTrackModal.track.songwriter || '-'}</div>
              <div><span className="font-bold">Genre:</span> {epAlbumTrackModal.track.genre || '-'}</div>
              <div><span className="font-bold">Track Number:</span> {epAlbumTrackModal.track.trackNumber || epAlbumTrackModal.idx + 1}</div>
              <div><span className="font-bold">ISRC:</span> {epAlbumTrackModal.track.isrc || epAlbumTrackModal.track.isrcCode || '-'}</div>
              <div><span className="font-bold">Duration:</span> {epAlbumTrackModal.track.duration || '-'}</div>
              <div><span className="font-bold">Language:</span> {epAlbumTrackModal.track.language || '-'}</div>
              <div><span className="font-bold">Explicit:</span> {epAlbumTrackModal.track.isExplicit ? 'Yes' : 'No'}</div>
              {/* Main Artists with streaming links */}
              <div className="col-span-2 mt-2">
                <div className="font-bold">Main Artists:</div>
                {Array.isArray(epAlbumTrackModal.track.mainArtists) && epAlbumTrackModal.track.mainArtists.length > 0 ? (
                  <ul className="ml-2">
                    {epAlbumTrackModal.track.mainArtists.map((artist, idx) => (
                      <li key={artist.name || artist || idx} className="mb-1">
                        <span className="font-semibold">{artist.name || artist}</span>
                        <div className="ml-2 text-xs">
                          <span className="font-semibold">Spotify: </span>
                          {artist.spotify && artist.spotify.trim() ? (
                            <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open</a>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                          <span className="ml-3 font-semibold">Apple Music: </span>
                          {artist.apple && artist.apple.trim() ? (
                            <a href={artist.apple} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Open</a>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                          <span className="ml-3 font-semibold">YouTube: </span>
                          {artist.youtube && artist.youtube.trim() ? (
                            <a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Open</a>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <span className="ml-2">-</span>}
              </div>
              {/* Featured Artists */}
              <div className="col-span-2 mt-2">
                <span className="font-bold">Featured Artists:</span> {Array.isArray(epAlbumTrackModal.track.featuredArtists) && epAlbumTrackModal.track.featuredArtists.length > 0 ? epAlbumTrackModal.track.featuredArtists.map(a => a.name || a).join(', ') : '-'}
              </div>
              {/* Collaborators */}
              <div className="col-span-2 mt-2">
                <span className="font-bold">Collaborators:</span> {Array.isArray(epAlbumTrackModal.track.collaborators) ? epAlbumTrackModal.track.collaborators.map(a => a.name || a).join(', ') : '-'}
              </div>
              {/* Credits */}
              <div className="col-span-2 mt-2">
                <span className="font-bold">Credits:</span> {Array.isArray(epAlbumTrackModal.track.credits) ? epAlbumTrackModal.track.credits.map(c => `${c.name} (${c.type})`).join(', ') : '-'}
              </div>
              {/* Streaming Links */}
              <div className="col-span-2 mt-2">
                <div className="font-bold">Streaming Links:</div>
                <div className="flex gap-4 flex-wrap">
                  {epAlbumTrackModal.track.streamingLinks && epAlbumTrackModal.track.streamingLinks.spotify && (
                    <span>Spotify: <a href={epAlbumTrackModal.track.streamingLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">Open</a></span>
                  )}
                  {!epAlbumTrackModal.track.streamingLinks?.spotify && <span>Spotify: <span className="text-muted-foreground">None</span></span>}
                  {epAlbumTrackModal.track.streamingLinks && epAlbumTrackModal.track.streamingLinks.appleMusic && (
                    <span>Apple Music: <a href={epAlbumTrackModal.track.streamingLinks.appleMusic} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">Open</a></span>
                  )}
                  {!epAlbumTrackModal.track.streamingLinks?.appleMusic && <span>Apple Music: <span className="text-muted-foreground">None</span></span>}
                  {epAlbumTrackModal.track.streamingLinks && epAlbumTrackModal.track.streamingLinks.youtube && (
                    <span>YouTube: <a href={epAlbumTrackModal.track.streamingLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-700 underline">Open</a></span>
                  )}
                  {!epAlbumTrackModal.track.streamingLinks?.youtube && <span>YouTube: <span className="text-muted-foreground">None</span></span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </>
            )}
          </div>
        )}
        {section === 'support' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Support Tickets</h1>
            {loading ? <div>Loading tickets...</div> : (
              <SupportTicketsList supportTickets={supportTickets} artists={artists} />
            )}
          </div>
        )}

        {section === 'takedown' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Takedown Requests</h1>
            {loading ? <div>Loading takedown requests...</div> : (
              takedownRequests.length === 0 ? (
                <div className="text-muted-foreground">No takedown requests found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {takedownRequests.map(req => {
                    // Only render takedown requests, no mastering logic
                    let requester = null;
                    if (req.requestedBy) {
                      requester = artists.find(a => a.email === req.requestedBy || a.id === req.requestedBy || a.stageName === req.requestedBy);
                    }
                    if (!requester && req.email) {
                      requester = artists.find(a => a.email === req.email);
                    }
                    if (!requester && req.userId) {
                      requester = artists.find(a => a.id === req.userId);
                    }
                    const cardColor = req.attended ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50';
                    return (
                      <div
                        key={req.id}
                        className={`bg-white border rounded-xl shadow p-6 flex flex-col gap-2 cursor-pointer transition ${cardColor}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg">{req.trackTitle || req.title || 'N/A'}</span>
                          {req.attended && <span title="Attended" className="text-green-500 text-xl">★</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">ID: {req.id}</div>
                        <div className="text-xs text-muted-foreground mb-1">Track ID: {req.trackId || 'N/A'}</div>
                        <div className="text-sm mb-1"><b>Reason:</b> {req.reason || 'N/A'}</div>
                        <div className="text-sm mb-1"><b>Requested By:</b> {req.requestedBy || req.email || 'N/A'}</div>
                        {requester && (
                          <div className="text-xs bg-muted/30 rounded p-2 mb-1">
                            <div><b>Name:</b> {requester.stageName || requester.full_name || requester.name || '-'}</div>
                            <div><b>Email:</b> {requester.email || '-'}</div>
                            <div><b>Phone:</b> {requester.phone || requester.phoneNumber || '-'}</div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mb-2"><b>Date:</b> {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}</div>
                        <div className="flex gap-2 items-center mt-2">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={!!req.attended}
                              onChange={async e => {
                                const checked = e.target.checked;
                                if (checked) {
                                  if (!window.confirm('Mark this takedown request as attended? This will turn the card green.')) return;
                                } else {
                                  if (!window.confirm('Unmark as attended? This will turn the card red.')) return;
                                }
                                try {
                                  const { updateDoc, doc } = await import('firebase/firestore');
                                  await updateDoc(doc(db, 'takedown_requests', req.id), { attended: checked });
                                  setTakedownRequests(prev => prev.map(r => r.id === req.id ? { ...r, attended: checked } : r));
                                } catch (err) {
                                  alert('Failed to update attended status: ' + err.message);
                                }
                              }}
                              className="w-4 h-4 accent-green-500 border-2 border-green-400 rounded-lg shadow focus:ring-2 focus:ring-green-300"
                            />
                            <span className="text-green-700 text-xs font-semibold">Attended</span>
                          </label>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (!window.confirm('Are you sure you want to delete this takedown request? This cannot be undone.')) return;
                              try {
                                const { deleteDoc, collection, doc } = await import('firebase/firestore');
                                await deleteDoc(doc(collection(db, 'takedown_requests'), req.id));
                                setTakedownRequests(prev => prev.filter(r => r.id !== req.id));
                                window.alert('Takedown request deleted successfully.');
                              } catch (err) {
                                window.alert('Failed to delete takedown request: ' + (err.message || err));
                              }
                            }}
                          >Delete</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
        {section === 'earnings' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Earnings</h1>
            <div className="bg-white border border-border rounded-xl shadow p-2 sm:p-6 mb-8 w-full">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                <label className="font-semibold">Filter by:</label>
                <select
                  className="border rounded px-2 py-1 text-sm min-w-[180px]"
                  value={earningsFilter || ''}
                  onChange={e => setEarningsFilter(e.target.value)}
                >
                  <option value="">All Artists</option>
                  <option value="paid">Paid Subscription (Green)</option>
                  <option value="unpaid">No Subscription</option>
                </select>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="min-w-[500px] w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 sm:p-3 text-left">#</th>
                      <th className="p-2 sm:p-3 text-left">Artist Name</th>
                      <th className="p-2 sm:p-3 text-left">Email</th>
                      <th className="p-2 sm:p-3 text-left">Joined</th>
                      <th className="p-2 sm:p-3 text-left">Total Earnings</th>
                      <th className="p-2 sm:p-3 text-left">Sent Earnings</th>
                      <th className="p-2 sm:p-3 text-left">Payments</th>
                      <th className="p-2 sm:p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artists
                      .filter(artist => {
                        const hasPaidSubscription = subscriptions.some(s => (s.userId === artist.id || s['user id'] === artist.id) && s.amountPaid && s.amountPaid > 0);
                        if (earningsFilter === 'paid') return hasPaidSubscription;
                        if (earningsFilter === 'unpaid') return !hasPaidSubscription;
                        return true;
                      })
                      .map((artist, idx) => {
                        const pendingEarnings = earnings.filter(e => e.artistId === artist.id && e.status !== 'sent');
                        const totalEarnings = pendingEarnings.length > 0 ? pendingEarnings.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) : 0;
                        const sentEarnings = earnings.filter(e => e.artistId === artist.id && e.status === 'sent').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                        const paymentsCount = earnings.filter(e => e.artistId === artist.id).length;
                        const hasPaidSubscription = subscriptions.some(s => (s.userId === artist.id || s['user id'] === artist.id) && s.amountPaid && s.amountPaid > 0);
                        const rowColor = hasPaidSubscription ? 'bg-green-50 border-green-400' : '';
                        return (
                          <tr key={artist.id} className={`border-b border-border hover:bg-muted/40 transition ${rowColor}`}>
                            <td className="p-2 sm:p-3 font-bold whitespace-nowrap">{idx + 1}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">{artist.stageName || artist.full_name || '-'}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">{artist.email || '-'}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">{artist.createdAt ? (artist.createdAt.seconds ? new Date(artist.createdAt.seconds * 1000).toLocaleDateString() : new Date(artist.createdAt).toLocaleDateString()) : '-'}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">KSh {totalEarnings}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap text-green-700 font-bold">KSh {sentEarnings}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">{paymentsCount}</td>
                            <td className="p-2 sm:p-3 whitespace-nowrap">
                              <button
                                className="btn btn-sm btn-primary rounded shadow px-3 sm:px-4 py-1 font-semibold"
                                onClick={() => setSelectedArtist(artist)}
                              >Post Payment</button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Modal for posting payment */}
            {selectedArtist && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
                <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 max-w-lg w-full relative flex flex-col">
                  <button className="absolute top-4 right-4 text-muted-foreground text-2xl font-bold" onClick={() => setSelectedArtist(null)} aria-label="Close">×</button>
                  <h2 className="font-heading text-xl font-bold mb-4">Post Payment for {selectedArtist.stageName || selectedArtist.full_name || selectedArtist.email}</h2>
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold">Email:</div>
                      <div className="mb-2">{selectedArtist.email || <span className='italic'>No email</span>}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Joined:</div>
                      <div className="mb-2">{selectedArtist.createdAt ? (selectedArtist.createdAt.seconds ? new Date(selectedArtist.createdAt.seconds * 1000).toLocaleDateString() : new Date(selectedArtist.createdAt).toLocaleDateString()) : '-'}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Total Earnings:</div>
                      <div className="mb-2">KSh {earnings.filter(e => e.artistId === selectedArtist.id && e.status !== 'sent').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Payments:</div>
                      <div className="mb-2">{earnings.filter(e => e.artistId === selectedArtist.id).length}</div>
                    </div>
                  </div>
                  {/* Tracks dropdown */}
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Select Track for Payment:</div>
                    {artistTracks.length === 0 ? (
                      <div className="text-muted-foreground italic">No tracks submitted.</div>
                    ) : (
                      <select name="trackId" className="border-2 border-primary rounded px-3 py-2 w-full mb-2">
                        <option value="">-- Select Track --</option>
                        {artistTracks.map(track => (
                          <option key={track.id} value={track.id}>{track.title || 'Untitled Track'}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <form className="flex flex-col gap-4" onSubmit={async e => {
                    e.preventDefault();
                    const form = e.target;
                    const amount = form.amount.value;
                    const trackId = form.trackId ? form.trackId.value : '';
                    if (!amount || isNaN(amount) || Number(amount) <= 0) {
                      alert('Enter a valid amount');
                      return;
                    }
                    if (artistTracks.length > 0 && !trackId) {
                      alert('Please select a track for payment.');
                      return;
                    }
                    try {
                      const newPayment = {
                        artistId: selectedArtist.id,
                        artistName: selectedArtist.stageName || selectedArtist.full_name || selectedArtist.email,
                        amount: Number(amount),
                        createdAt: new Date().toISOString(),
                        status: 'pending',
                        trackId: trackId || null,
                      };
                      const docRef = await addDoc(collection(db, 'earnings'), newPayment);
                      // After posting, fetch latest earnings from Firestore
                      import('firebase/firestore').then(({ collection, getDocs }) =>
                        getDocs(collection(db, 'earnings')).then(snap => {
                          setEarnings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                        })
                      );
                      form.reset();
                      setSelectedArtist(null);
                    } catch (err) {
                      alert('Failed to add payment: ' + err.message);
                    }
                  }}>
                    <label className="block text-xs font-semibold mb-1 text-primary">Amount (KSh)</label>
                    <input name="amount" type="number" min="1" step="any" className="border-2 border-primary rounded px-3 py-2 w-full text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" required placeholder="Enter amount..." />
                    <button type="submit" className="btn btn-primary px-6 py-2 text-lg rounded shadow hover:bg-primary/90 transition w-full">Post Payment</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        {section === 'analytics' && (
          <div>
            <h1 className="font-heading text-3xl font-bold mb-8 text-primary">Analytics</h1>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-primary/10 to-primary/30 rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-4xl font-bold text-primary mb-2">{artists.length}</div>
                <div className="font-semibold text-lg">Total Artists</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-4xl font-bold text-yellow-800 mb-2">{subscriptionPlans.filter(p => p.planName?.toLowerCase().includes('starter')).length}</div>
                <div className="font-semibold text-lg">Starter Subs</div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-4xl font-bold text-green-800 mb-2">{subscriptionPlans.filter(p => p.planName?.toLowerCase().includes('growth')).length}</div>
                <div className="font-semibold text-lg">Growth Subs</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-4xl font-bold text-blue-800 mb-2">{subscriptionPlans.filter(p => p.planName?.toLowerCase().includes('pro')).length}</div>
                <div className="font-semibold text-lg">Pro Subs</div>
              </div>
            </div>
            {/* Filter and Form */}
            <div className="mb-8 bg-white border border-border rounded-xl shadow p-6">
              <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
                <label className="font-semibold">Filter by Subscription:</label>
                <select
                  className="border-2 border-primary rounded px-3 py-2 min-w-[140px]"
                  value={analyticsSubFilter || ''}
                  onChange={e => setAnalyticsSubFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              <form className="flex flex-col md:flex-row gap-4 items-end w-full" onSubmit={async e => {
                e.preventDefault();
                setAnalyticsError(null);
                setAnalyticsSuccess('');
                const form = e.target;
                const artistId = form.artistId.value;
                const month = form.month.value;
                const platform = form.platform.value;
                const streams = form.streams.value;
                if (!artistId || !month || !platform || !streams || isNaN(streams)) return;
                if (!window.confirm(`Post ${streams} streams for ${platform} in ${month}?`)) return;
                try {
                  await addDoc(collection(db, 'analytics'), { month, platform, streams: Number(streams), artistId });
                  setAnalyticsSuccess('Stats posted successfully!');
                  form.reset();
                  await fetchAnalytics();
                } catch (err) {
                  setAnalyticsError('Failed to save analytics: ' + (err.message || err.code || 'Unknown error'));
                }
              }}>
                <select name="artistId" className="border-2 border-primary rounded px-3 py-2 min-w-[260px]" required>
                  <option value="">-- Select Artist --</option>
                  {artists.map((a, idx) => {
                    // Find subscription plan for this artist
                    const sub = subscriptionPlans.find(p => p.userId === a.id && p.status === 'active');
                    let planType = sub?.planName?.toLowerCase().includes('starter') ? 'starter'
                      : sub?.planName?.toLowerCase().includes('growth') ? 'growth'
                      : sub?.planName?.toLowerCase().includes('pro') ? 'pro'
                      : '';
                    if (analyticsSubFilter && planType !== analyticsSubFilter) return null;
                    let subColor = '';
                    if (planType === 'starter') subColor = 'background: #FEF3C7; color: #92400E;'; // yellow
                    if (planType === 'growth') subColor = 'background: #D1FAE5; color: #065F46;'; // green
                    if (planType === 'pro') subColor = 'background: #DBEAFE; color: #1E3A8A;'; // blue
                    return (
                      <option key={a.id} value={a.id}>
                        {`#${idx + 1} | ${a.stageName || a.full_name || a.email} | ${a.email || 'No email'} `}
                        {planType && (
                          `| ${planType.charAt(0).toUpperCase() + planType.slice(1)}`
                        )}
                      </option>
                    );
                  })}
                </select>
                <input name="month" type="month" className="border-2 border-primary rounded px-3 py-2" required />
                <select name="platform" className="border-2 border-primary rounded px-3 py-2" required>
                  <option value="">Platform</option>
                  <option value="Spotify">Spotify</option>
                  <option value="Apple Music">Apple Music</option>
                  <option value="YouTube">YouTube</option>
                </select>
                <input name="streams" type="number" min="0" className="border-2 border-primary rounded px-3 py-2" placeholder="Total Streams" required />
                <button type="submit" className="btn btn-primary px-6 py-2 rounded shadow">Post Stats</button>
              </form>
              {analyticsSuccess && (
                <div className="text-green-600 mt-2 font-semibold">{analyticsSuccess}</div>
              )}
              {analyticsError && (
                <div className="text-red-600 mt-2">{analyticsError}</div>
              )}
            </div>
// Add this state near the top of the component
const [analyticsSubFilter, setAnalyticsSubFilter] = useState('');
            <div className="bg-white border border-border rounded-xl shadow p-6 mb-6 w-full">
              <div className="font-bold mb-4 text-xl">Monthly Streaming Stats</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-border rounded-lg">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Artist</th>
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-left">Platform</th>
                      <th className="p-2 text-left">Streams</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((stat, idx) => {
                      const artist = artists.find(a => a.id === stat.artistId);
                      const sub = subscriptionPlans.find(p => p.userId === stat.artistId && p.status === 'active');
                      let planType = sub?.planName?.toLowerCase().includes('starter') ? 'starter'
                        : sub?.planName?.toLowerCase().includes('growth') ? 'growth'
                        : sub?.planName?.toLowerCase().includes('pro') ? 'pro'
                        : '';
                      let badgeClass = '';
                      if (planType === 'starter') badgeClass = 'bg-yellow-200 text-yellow-800';
                      if (planType === 'growth') badgeClass = 'bg-green-200 text-green-800';
                      if (planType === 'pro') badgeClass = 'bg-blue-200 text-blue-800';
                      return (
                        <tr key={stat.id || idx}>
                          <td className="p-2">
                            <span className="font-semibold">{artist ? (artist.stageName || artist.full_name || artist.email) : stat.artistId}</span>
                            {planType && (
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${badgeClass}`}>{planType.charAt(0).toUpperCase() + planType.slice(1)}</span>
                            )}
                          </td>
                          <td className="p-2">{stat.month}</td>
                          <td className="p-2">{stat.platform}</td>
                          <td className="p-2">{stat.streams}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {section === 'payments' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Payments</h1>
            {loading ? <div>Loading payments...</div> : (
              <ul className="space-y-4">
                {payments.map(p => (
                  <li key={p.id} className="bg-white border border-border rounded-lg p-4">
                    <div className="font-bold">{p.artistName || 'Artist'}</div>
                    <div className="text-sm text-muted-foreground">KSh {p.amount}</div>
                    <div className="text-xs text-muted-foreground mt-2">Status: {p.status}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {section === 'withdrawals' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Withdrawal Requests</h1>
            {loading ? <div>Loading withdrawal requests...</div> : (
              withdrawalRequests.length === 0 ? (
                <div className="text-muted-foreground">No withdrawal requests found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {withdrawalRequests.map((req, idx) => {
                    const artist = artistProfiles[req.userId || req.id] || {};
                    const isSent = req.status === 'sent';
                    // Find if artist has any pending earnings
                    const hasPendingEarnings = earnings.some(e => e.artistId === req.userId || e.artistId === req.id && e.status !== 'sent');
                    return (
                      <div key={req.id} className={`bg-white border border-border rounded-xl shadow-lg p-6 flex flex-col gap-4 relative ${isSent ? 'border-green-400 bg-green-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-lg text-primary">{artist.stageName || artist.full_name || req.mpesaName || 'Artist'}</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isSent ? 'bg-green-200 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status || 'pending'}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">Email: {artist.email || req.mpesaEmail || '-'}</div>
                        <div className="flex flex-col gap-1 mb-2">
                          <div><span className="font-semibold">Amount:</span> <span className="text-lg font-bold">KSh {req.amount}</span></div>
                          <div><span className="font-semibold">Requested At:</span> {req.requestedAt ? (req.requestedAt.seconds ? new Date(req.requestedAt.seconds * 1000).toLocaleString() : new Date(req.requestedAt).toLocaleString()) : 'N/A'}</div>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Payment Method:</span> {req.paymentMethod || '-'}
                          {req.paymentMethod === 'mpesa' && (
                            <div className="mt-1 ml-2">
                              <div><span className="font-semibold">M-Pesa Name:</span> {req.mpesaName || '-'}</div>
                              <div><span className="font-semibold">M-Pesa Number:</span> {req.mpesa || '-'}</div>
                            </div>
                          )}
                          {req.paymentMethod === 'bank' && (
                            <div className="mt-1 ml-2">
                              <div><span className="font-semibold">Bank Name:</span> {req.bankName || '-'}</div>
                              <div><span className="font-semibold">Account Number:</span> {req.bankAccount || '-'}</div>
                              <div><span className="font-semibold">Account Name:</span> {req.bankAccountName || '-'}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSent || !hasPendingEarnings}
                            onClick={async () => {
                              try {
                                await updateDoc(doc(collection(db, 'withdrawal_requests'), req.id), { status: 'sent' });
                                await updateDoc(doc(collection(db, 'profiles'), req.userId || req.id), { balance: 0 });
                                // Mark ALL pending earnings for this artist as sent
                                const q = query(collection(db, 'earnings'), where('artistId', '==', req.userId || req.id), where('status', '==', 'pending'));
                                const snap = await getDocs(q);
                                for (const d of snap.docs) {
                                  await updateDoc(doc(collection(db, 'earnings'), d.id), { status: 'sent', type: 'withdrawal' });
                                }
                                const wrSnap = await getDocs(collection(db, 'withdrawal_requests'));
                                setWithdrawalRequests(wrSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))); 
                                // Refetch earnings to update sent column
                                import('firebase/firestore').then(({ collection, getDocs }) =>
                                  getDocs(collection(db, 'earnings')).then(snap => {
                                    setEarnings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))); 
                                  })
                                );
                                window.alert('Withdrawal marked as sent, artist balance set to 0, and all earnings updated.');
                              } catch (err) {
                                window.alert('Failed to mark as sent: ' + (err.message || err));
                              }
                            }}
                          >Send</Button>
                          <Button size="sm" variant="destructive" onClick={() => alert('Decline logic coming soon!')}>Decline</Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (!window.confirm('Are you sure you want to delete this withdrawal request? This cannot be undone.')) return;
                              try {
                                const { deleteDoc, collection, doc } = await import('firebase/firestore');
                                await deleteDoc(doc(collection(db, 'withdrawal_requests'), req.id));
                                setWithdrawalRequests(prev => prev.filter(w => w.id !== req.id));
                                window.alert('Withdrawal request deleted successfully.');
                              } catch (err) {
                                window.alert('Failed to delete withdrawal request: ' + (err.message || err));
                              }
                            }}
                          >Delete</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
        </main>
      </div>
    </React.Fragment>
  );
}


  export default AdminDashboard;



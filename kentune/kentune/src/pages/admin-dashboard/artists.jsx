
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const PAGE_SIZE = 10;

const ArtistAdminDashboard = () => {
  const [artists, setArtists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [planType, setPlanType] = useState('all');
  const [duration, setDuration] = useState('all');
  const [showEndingSoon, setShowEndingSoon] = useState(false);
  const [sort, setSort] = useState('new');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchArtistsAndSubscriptions = async () => {
      setLoading(true);
      try {
        const [profilesSnap, subsSnap] = await Promise.all([
          getDocs(query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'subscriptions')),
        ]);
        const profiles = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const subs = subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArtists(profiles);
        setSubscriptions(subs);
      } catch (err) {
        // Optionally handle error
      }
      setLoading(false);
    };
    fetchArtistsAndSubscriptions();
  }, []);

  // Filter and search logic
  // Join subscriptions to artists
  const artistsWithSubs = artists.map(artist => {
    const subs = subscriptions.filter(sub => sub.userId === artist.id && sub.status === 'active');
    // Pick the latest active subscription
    const latestSub = subs.sort((a, b) => (b.expiryDate?.seconds || 0) - (a.expiryDate?.seconds || 0))[0];
    return {
      ...artist,
      subscription: latestSub || null,
    };
  });

  let filteredArtists = artistsWithSubs.filter(artist => {
    const matchesSearch = artist.full_name?.toLowerCase().includes(search.toLowerCase()) || artist.stage_name?.toLowerCase().includes(search.toLowerCase()) || artist.email?.toLowerCase().includes(search.toLowerCase());
    let matchesFilter = true;
    if (filter === 'paid') matchesFilter = artist.subscription && artist.subscription.amountPaid > 0;
    if (filter === 'unpaid') matchesFilter = !artist.subscription || artist.subscription.amountPaid === 0;
    if (filter === 'frozen') matchesFilter = artist.frozen === true;
    if (filter === 'unfrozen') matchesFilter = artist.frozen !== true;

    let matchesPlanType = true;
    if (planType !== 'all') matchesPlanType = artist.subscription && artist.subscription.planName && artist.subscription.planName.toLowerCase().includes(planType.toLowerCase());

    let matchesDuration = true;
    if (duration !== 'all') matchesDuration = artist.subscription && artist.subscription.planType && artist.subscription.planType.toLowerCase() === duration.toLowerCase();

    let matchesEndingSoon = true;
    if (showEndingSoon) {
      if (artist.subscription && artist.subscription.expiryDate) {
        const expiry = new Date(artist.subscription.expiryDate.seconds * 1000);
        const now = new Date();
        const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // next 7 days
        matchesEndingSoon = expiry > now && expiry <= soon;
      } else {
        matchesEndingSoon = false;
      }
    }

    return matchesSearch && matchesFilter && matchesPlanType && matchesDuration && matchesEndingSoon;
  });

  // Sorting
  if (sort === 'new') {
    filteredArtists = filteredArtists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'old') {
    filteredArtists = filteredArtists.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === 'expiry') {
    filteredArtists = filteredArtists.sort((a, b) => {
      const aExp = a.subscription?.expiryDate?.seconds || 0;
      const bExp = b.subscription?.expiryDate?.seconds || 0;
      return bExp - aExp;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredArtists.length / PAGE_SIZE);
  const paginatedArtists = filteredArtists.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Artists</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search artist by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded w-64"
        />
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="frozen">Frozen</option>
          <option value="unfrozen">Unfrozen</option>
        </select>
        <span className="font-bold">Plan Type:</span>
        <select value={planType} onChange={e => { setPlanType(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="all">All</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
        <span className="font-bold">Duration:</span>
        <select value={duration} onChange={e => { setDuration(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="all">All</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <button
          className={`border px-3 py-2 rounded ${showEndingSoon ? 'bg-yellow-200' : ''}`}
          onClick={() => { setShowEndingSoon(!showEndingSoon); setPage(1); }}
        >Show plans ending soon</button>
        <span className="font-bold">Sort:</span>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="new">Newest</option>
          <option value="old">Oldest</option>
          <option value="expiry">Expiry Date</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : paginatedArtists.length === 0 ? (
        <div>No artists found.</div>
      ) : (
        <>
          <table className="min-w-full border mb-8">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Stage Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Frozen</th>
                <th className="border px-4 py-2">Created</th>
                <th className="border px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedArtists.map(artist => (
                <tr key={artist.id}>
                  <td className="border px-4 py-2">{artist.full_name || 'N/A'}</td>
                  <td className="border px-4 py-2">{artist.stage_name || 'N/A'}</td>
                  <td className="border px-4 py-2">{artist.email}</td>
                  <td className="border px-4 py-2">{artist.frozen ? 'Frozen' : 'Active'}</td>
                  <td className="border px-4 py-2">{artist.createdAt ? new Date(artist.createdAt).toLocaleString() : 'N/A'}</td>
                  <td className="border px-4 py-2">
                    <button className="text-blue-600 underline" onClick={() => setSelectedArtist(artist)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-2 mb-8">
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
      )}
      {/* Artist details modal/panel */}
      {selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-red-600 font-bold text-xl"
              onClick={() => setSelectedArtist(null)}
            >×</button>
            <h3 className="text-xl font-bold mb-2">Artist Details</h3>
            <div className="mb-2"><strong>Name:</strong> {selectedArtist.full_name || 'N/A'}</div>
            <div className="mb-2"><strong>Stage Name:</strong> {selectedArtist.stage_name || 'N/A'}</div>
            <div className="mb-2"><strong>Email:</strong> {selectedArtist.email}</div>
            <div className="mb-2"><strong>Status:</strong> {selectedArtist.paymentStatus || 'N/A'}</div>
            <div className="mb-2"><strong>Frozen:</strong> {selectedArtist.frozen ? 'Frozen' : 'Active'}</div>
            <div className="mb-2"><strong>Created:</strong> {selectedArtist.createdAt ? new Date(selectedArtist.createdAt).toLocaleString() : 'N/A'}</div>
            <div className="mb-2"><strong>Phone:</strong> {selectedArtist.phone || 'N/A'}</div>
            <div className="mb-2"><strong>Mpesa Number:</strong> {selectedArtist.mpesa_number || 'N/A'}</div>
            <div className="mb-2"><strong>Bio:</strong> {selectedArtist.bio || 'N/A'}</div>
            <div className="mb-2"><strong>Genres:</strong> {selectedArtist.genres?.join(', ') || 'N/A'}</div>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded font-bold mt-6 hover:bg-red-700"
              onClick={async () => {
                if (!window.confirm('Are you sure you want to delete this artist and all their data? This cannot be undone.')) return;
                const uid = selectedArtist.id;
                try {
                  const { doc, deleteDoc, collection, getDocs, query, where } = await import('firebase/firestore');
                  const db = (await import('../../lib/firebase')).db;
                  // Delete profile
                  await deleteDoc(doc(db, 'profiles', uid));
                  // Delete subscriptions
                  const subsSnap = await getDocs(query(collection(db, 'subscriptions'), where('userId', '==', uid)));
                  for (const sub of subsSnap.docs) await deleteDoc(sub.ref);
                  // Delete music releases
                  const musicSnap = await getDocs(query(collection(db, 'music_releases'), where('userId', '==', uid)));
                  for (const m of musicSnap.docs) await deleteDoc(m.ref);
                  // Delete earnings
                  const earnSnap = await getDocs(query(collection(db, 'earnings'), where('userId', '==', uid)));
                  for (const e of earnSnap.docs) await deleteDoc(e.ref);
                  // Delete mastering requests
                  const masterSnap = await getDocs(query(collection(db, 'mastering_requests'), where('userId', '==', uid)));
                  for (const mr of masterSnap.docs) await deleteDoc(mr.ref);
                  // Delete artist submissions
                  const submSnap = await getDocs(query(collection(db, 'artist_submissions'), where('userId', '==', uid)));
                  for (const s of submSnap.docs) await deleteDoc(s.ref);
                  // Optionally: delete other collections as needed
                  setSelectedArtist(null);
                  setArtists(artists.filter(a => a.id !== uid));
                  alert('Artist and all related data deleted successfully.');
                } catch (err) {
                  alert('Failed to delete artist: ' + err.message);
                }
              }}
            >Delete Artist & All Data</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistAdminDashboard;

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const MasteringRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'mastering_requests'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(data);
      } catch (err) {
        // Optionally handle error
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Mastering Requests</h2>
      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div>No mastering requests found.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Artist</th>
              <th className="border px-4 py-2">Track Name</th>
              <th className="border px-4 py-2">Instructions</th>
              <th className="border px-4 py-2">Delivery</th>
              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Created</th>
              <th className="border px-4 py-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              console.log('Admin Mastering Full Debug:', req);
              // Fallback: find any field with a valid audio URL
              let audioUrl = req.trackUrl;
              if (!audioUrl) {
                // Try to find any field with a valid audio URL
                for (const key in req) {
                  if (typeof req[key] === 'string' && req[key].startsWith('https://') && req[key].includes('firebasestorage')) {
                    audioUrl = req[key];
                    break;
                  }
                }
              }
              return (
                <tr key={req.id}>
                  <td className="border px-4 py-2">{req.artistName}</td>
                  <td className="border px-4 py-2">{req.trackName}</td>
                  <td className="border px-4 py-2">{req.artistInstructions}</td>
                  <td className="border px-4 py-2">{req.deliveryMethod} ({req.deliveryContact})</td>
                  <td className="border px-4 py-2">{req.amount}</td>
                  <td className="border px-4 py-2">{req.status}</td>
                  <td className="border px-4 py-2">{new Date(req.createdAt).toLocaleString()}</td>
                  <td className="border px-4 py-2">
                    {audioUrl ? (
                      <audio controls src={audioUrl} style={{ width: '180px' }}>
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <span style={{ color: '#d32f2f' }}>No audio</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MasteringRequestsAdmin;

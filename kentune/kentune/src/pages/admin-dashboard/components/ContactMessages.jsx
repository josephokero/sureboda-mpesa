import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'contact_messages'));
        setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError('Failed to load messages');
      }
      setLoading(false);
    }
    fetchMessages();
  }, []);

  async function markAsRead(id) {
    try {
      await updateDoc(doc(db, 'contact_messages', id), { status: 'read' });
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-primary">Contact Messages</h2>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        <ul className="space-y-4">
          {messages.length === 0 ? <div>No messages found.</div> : messages.map(msg => (
            <li key={msg.id} className="border rounded p-4 bg-gray-50">
              <div className="font-semibold text-lg mb-1">{msg.name} <span className="text-xs text-gray-500">({msg.email})</span></div>
              <div className="mb-2 text-gray-700">{msg.message}</div>
              <div className="text-xs text-gray-500 mb-2">{msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : ''}</div>
              <div className="flex gap-2 items-center">
                <span className={`px-2 py-1 rounded text-xs font-bold ${msg.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{msg.status === 'read' ? 'Read' : 'New'}</span>
                {msg.status !== 'read' && <button className="text-primary underline text-xs" onClick={() => markAsRead(msg.id)}>Mark as Read</button>}
                <button
                  className="text-red-600 underline text-xs ml-2"
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete this message? This cannot be undone.')) return;
                    try {
                      const { deleteDoc, doc, collection } = await import('firebase/firestore');
                      await deleteDoc(doc(collection(db, 'contact_messages'), msg.id));
                      setMessages(msgs => msgs.filter(m => m.id !== msg.id));
                      window.alert('Message deleted successfully.');
                    } catch (err) {
                      window.alert('Failed to delete message: ' + (err.message || err));
                    }
                  }}
                >Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContactMessages;

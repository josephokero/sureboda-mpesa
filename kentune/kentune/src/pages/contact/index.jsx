import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logArtistActivity } from '../artist-dashboard/components/RecentActivity';
import { db } from '../../lib/firebase';

const categories = [
  { value: 'profile', label: '📝 Profile/Artist Info Update Request' },
  { value: 'payment', label: '💳 Payment & Billing' },
  { value: 'track', label: '📤 Track Submission' },
  { value: 'collab', label: '🤝 Collaboration Issues' },
  { value: 'mastering', label: '🎛️ Mastering Services' },
  { value: 'technical', label: '⚙️ Technical Support' },
  { value: 'account', label: '👤 Account Management' },
  { value: 'takedown', label: '🚫 Song Takedown Request' },
  { value: 'other', label: '📋 Other Issues' },
];

const priorities = [
  { value: 'low', label: 'Low Priority (General questions)' },
  { value: 'medium', label: 'Medium Priority (Standard support)' },
  { value: 'high', label: 'High Priority (Urgent issues)' },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    priority: '',
    subject: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSending(true);
    if (!form.name || !form.category || !form.priority || !form.subject || !form.message) {
      setError('Please fill in all required fields.');
      setSending(false);
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      await addDoc(collection(db, 'support_tickets'), {
        userId: user ? user.uid : null,
        email: user ? user.email : '',
        name: form.name,
        category: form.category,
        priority: form.priority,
        subject: form.subject,
        message: form.message,
        createdAt: serverTimestamp(),
        status: 'open'
      });
      // Log activity
      if (user) {
        await logArtistActivity(user.uid, {
          title: 'Support Ticket Submitted',
          description: `Category: ${form.category}, Priority: ${form.priority}, Subject: ${form.subject}`,
          icon: 'HelpCircle',
          color: 'bg-primary',
          status: 'support',
        });
      }
      setSuccess(true);
      setForm({ name: '', category: '', priority: '', subject: '', message: '' });
    } catch (err) {
      console.error('Support request submission error:', err);
      setError('Failed to submit support request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-10 animate-fade-in">
      <button onClick={() => window.history.back()} className="mb-4 flex items-center text-primary hover:underline font-medium">
        <span style={{fontSize: '1.2em', marginRight: '0.5em'}}>&larr;</span> Go Back
      </button>
      <h2 className="text-2xl font-bold mb-2 flex items-center">🎧 Professional Support Center</h2>
      <p className="mb-6 text-muted-foreground">Get expert help from our team of music industry professionals. Categorized support for faster resolution and 24-hour response guarantee.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium mb-1">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter your full name" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Issue Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
            <option value="">Select a category</option>
            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Priority Level</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
            <option value="">Select priority</option>
            {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Subject *</label>
          <input name="subject" value={form.subject} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Brief description of your issue" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Detailed Message *</label>
          <textarea name="message" value={form.message} onChange={handleChange} className="w-full border rounded px-3 py-2 min-h-[100px]" placeholder="Please provide detailed information about your issue, including any error messages or steps that led to the problem." required />
        </div>
        {error && <div className="text-danger text-sm">{error}</div>}
        {success && <div className="text-success text-sm">🚀 Support request submitted! We typically respond within 24 hours.</div>}
        <Button type="submit" variant="success" fullWidth disabled={sending}>
          {sending ? 'Sending...' : '🚀 Submit Support Request'}
        </Button>
      </form>
    </div>
  );
};

export default Contact;

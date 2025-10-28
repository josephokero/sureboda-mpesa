import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { FaEdit, FaCheck } from 'react-icons/fa';

const TERMS_LIST = [
  { key: 'about-us', label: 'About Us', description: 'Learn about our mission, vision, and team.' },
  { key: 'how-it-works', label: 'How It Works', description: 'Step-by-step guide to using KENTUNEZ.' },
  { key: 'faqs', label: 'FAQs', description: 'Answers to common questions about our platform.' },
  { key: 'contact-us', label: 'Contact Us', description: 'Get in touch with our support team.' },
  { key: 'artist-resources', label: 'Artist Resources', description: 'Guides and tools to help you grow as an artist.' },
  { key: 'success-stories', label: 'Success Stories', description: 'Real stories from artists who use KENTUNEZ.' },
  { key: 'terms-and-conditions', label: 'Terms and Conditions', description: '' },
  { key: 'privacy-policy', label: 'Privacy Policy', description: '' },
];

const TermsManagement = () => {
  const [selectedKey, setSelectedKey] = useState(TERMS_LIST[0].key);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const docRef = doc(db, 'site_terms', selectedKey);
      const docSnap = await getDoc(docRef);
      setContent(docSnap.exists() ? docSnap.data().content : '');
      setLoading(false);
    };
    fetchContent();
  }, [selectedKey, db]);

  const handleSave = async () => {
    setSaving(true);
    const docRef = doc(db, 'site_terms', selectedKey);
    await setDoc(docRef, { content });
    setSaving(false);
    alert('Changes saved!');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Terms Management</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Select Section:</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={selectedKey}
          onChange={e => setSelectedKey(e.target.value)}
        >
          {TERMS_LIST.map(term => (
            <option key={term.key} value={term.key}>{term.label}</option>
          ))}
        </select>
        <div className="text-xs text-muted-foreground mt-1">{TERMS_LIST.find(t => t.key === selectedKey)?.description}</div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Content:</label>
        <textarea
          className="border rounded px-3 py-2 w-full min-h-[180px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={loading}
        />
      </div>
      <button
        className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2"
        onClick={handleSave}
        disabled={saving || loading}
      >
        {saving ? <FaCheck /> : <FaEdit />} Edit & Save Changes
      </button>
    </div>
  );
};

export default TermsManagement;

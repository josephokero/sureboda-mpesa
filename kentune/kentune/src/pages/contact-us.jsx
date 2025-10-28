import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
        status: 'new',
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
    setLoading(false);
  }

  return (
    <form className="bg-gray-50 border border-gray-200 rounded p-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-semibold mb-1">Your Name</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter your name" required value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Your Email</label>
        <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Enter your email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Message</label>
        <textarea className="w-full border border-gray-300 rounded px-3 py-2" rows="4" placeholder="Type your message here..." required value={message} onChange={e => setMessage(e.target.value)}></textarea>
      </div>
      <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded transition-colors w-fit self-end" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</button>
      {success && <div className="text-green-600 text-sm mt-2">Message sent! Our team will get back to you soon.</div>}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

    </form>
  );
}

const ContactUs = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-800">
    <h1 className="text-4xl font-extrabold mb-8 text-primary">Contact Us</h1>
    <p className="mb-8 text-lg leading-relaxed">Have questions or need support? We're here to help! Reach out to us using any of the methods below and our team will get back to you as soon as possible.</p>

    <div className="mb-10">
      <h2 className="text-xl font-bold mb-2 text-primary">Send Us a Message</h2>
      <ContactForm />
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Email</h2>
      <p>Send us an email at <a href="mailto:support@kentunez.com" className="text-orange-500 underline">support@kentunez.com</a> and our team will get back to you as soon as possible.</p>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Phone</h2>
      <p>Call us at <a href="tel:+254701956808" className="text-orange-500 underline">+254701956808</a> during business hours.</p>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Office</h2>
      <p>Nairobi, Kenya</p>
      <div className="mt-3">
        <h3 className="text-base font-semibold mb-1">Business Hours</h3>
        <ul className="text-sm text-gray-700">
          <li>Monday – Friday: <span className="font-medium">8:00 am – 6:00 pm</span></li>
          <li>Saturday: <span className="font-medium">8:00 am – 2:00 pm</span></li>
          <li>Sunday: <span className="font-medium">Closed</span></li>
        </ul>
      </div>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Social Media</h2>
      <div className="flex gap-4 mt-2">
        <a href="https://facebook.com/kentunez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
        <a href="https://twitter.com/kentunez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="Twitter"><i className="fab fa-twitter" /></a>
  <a href="https://www.instagram.com/kentunez_music?igsh=bGRoaTlxeXlkNGRq&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="Instagram"><i className="fab fa-instagram" /></a>
        <a href="https://youtube.com/kentunez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="YouTube"><i className="fab fa-youtube" /></a>
      </div>
      <div className="text-xs text-gray-500 mt-2">Follow us for updates, news, and support.</div>
    </div>
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Email</h2>
      <p>Send us an email at <a href="mailto:support@kentunez.com" className="text-orange-500 underline">support@kentunez.com</a> and our team will get back to you as soon as possible.</p>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Phone</h2>
      <p>Call us at <a href="tel:+254701956808" className="text-orange-500 underline">+254701956808</a> during business hours.</p>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Office</h2>
      <p>Nairobi, Kenya</p>
      <div className="mt-3">
        <h3 className="text-base font-semibold mb-1">Business Hours</h3>
        <ul className="text-sm text-gray-700">
          <li>Monday – Friday: <span className="font-medium">8:00 am – 6:00 pm</span></li>
          <li>Saturday: <span className="font-medium">8:00 am – 2:00 pm</span></li>
          <li>Sunday: <span className="font-medium">Closed</span></li>
        </ul>
      </div>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2 text-primary">Social Media</h2>
      <div className="flex gap-4 mt-2">
        <a href="https://facebook.com/kentunez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
        <a href="https://twitter.com/kentunez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="Twitter"><i className="fab fa-twitter" /></a>
        <a href="https://instagram.com/kentunez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="Instagram"><i className="fab fa-instagram" /></a>
        <a href="https://youtube.com/kentunez" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 text-2xl" aria-label="YouTube"><i className="fab fa-youtube" /></a>
      </div>
      <div className="text-xs text-gray-500 mt-2">Follow us for updates, news, and support.</div>
    </div>
  </div>
);

export default ContactUs;

import React from 'react';

const ArtistResources = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
    <h1 className="text-4xl font-extrabold mb-8 text-primary">Artist Resources</h1>
    <p className="mb-8 text-lg leading-relaxed">
      Find expert guides, actionable tips, and essential tools to help you succeed as an artist on KENTUNEZ. Whether you’re just starting out or looking to take your career to the next level, these resources are here to support you every step of the way.
    </p>

    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-2 text-primary">Getting Started</h2>
      <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
        <li>How to set up your artist profile for maximum impact</li>
        <li>Step-by-step guide to uploading your first track</li>
        <li>Checklist for submitting your music for distribution</li>
        <li>Understanding your dashboard and analytics</li>
      </ul>
    </div>

    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-2 text-primary">Marketing Your Music</h2>
      <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
        <li>Building your brand and artist identity</li>
        <li>How to grow your fanbase on social media</li>
        <li>Tips for pitching your music to playlists and blogs</li>
        <li>Creating engaging content for your audience</li>
        <li>Collaborating with other artists and influencers</li>
      </ul>
    </div>

    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-2 text-primary">Copyright & Legal</h2>
      <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
        <li>Understanding your rights as an artist</li>
        <li>How to protect your music from copyright infringement</li>
        <li>Registering your works with relevant authorities</li>
        <li>Clearing samples and third-party content</li>
        <li>Basics of music contracts and agreements</li>
      </ul>
    </div>

    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-2 text-primary">Monetization</h2>
      <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
        <li>How to maximize your earnings on KENTUNEZ</li>
        <li>Understanding streaming royalties and payouts</li>
        <li>Tips for getting paid faster and more reliably</li>
        <li>Exploring additional revenue streams (merch, shows, sync licensing)</li>
      </ul>
    </div>

    <div className="bg-primary/10 border-l-4 border-primary p-6 rounded">
      <h3 className="text-lg font-semibold mb-2 text-primary">Need More Help?</h3>
      <p className="mb-2">Check out our <a href="/faqs" className="text-orange-500 underline">FAQs</a> or <a href="/contact-us" className="text-orange-500 underline">contact our support team</a> for personalized assistance.</p>
    </div>
  </div>
);

export default ArtistResources;

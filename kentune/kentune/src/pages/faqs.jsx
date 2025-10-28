import React from 'react';

const FAQs = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
    <h1 className="text-4xl font-extrabold mb-8 text-primary">Frequently Asked Questions (FAQs)</h1>
    <div className="mb-10 text-lg leading-relaxed text-gray-700">
      Find answers to the most common questions about KENTUNEZ, music distribution, payments, and more. If you have a question that’s not answered here, <a href="/contact-us" className="text-orange-500 underline">contact us</a>.
    </div>
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">How do I sign up?</h2>
        <p>Click the <a href="/artist-registration" className="text-orange-500 underline">Sign Up</a> button, choose your plan, and fill in your details to create your artist account. You’ll get access to your dashboard immediately.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">How do I get paid?</h2>
        <p>Earnings are paid out via M-Pesa and other available methods. You can track your payments and earnings in real time in your dashboard. We pay you 100% of your earnings as long as your plan is active.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">Which platforms do you distribute to?</h2>
        <p>We distribute to all major streaming platforms in Kenya and globally, including Spotify, Apple Music, Boomplay, YouTube Music, Deezer, Audiomack, and more.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">Is there a fee to use KENTUNEZ?</h2>
        <p>We offer both free and premium plans. All plans allow you to keep 100% of your earnings. See our pricing page for details on features and benefits.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">How long does it take for my music to go live?</h2>
        <p>Most releases are live on streaming platforms within a few days after approval. Some platforms may take longer depending on their review process.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">Can I distribute music if I’m not in Kenya?</h2>
        <p>Yes! While we focus on Kenyan artists, KENTUNEZ is open to artists from anywhere in Africa and beyond.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">Do I keep the rights to my music?</h2>
        <p>Absolutely. You always retain full ownership and rights to your music. KENTUNEZ only acts as your distribution partner.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">How do I contact support?</h2>
        <p>Email us at <a href="mailto:support@kentunez.com" className="text-orange-500 underline">support@kentunez.com</a> or use the <a href="/contact-us" className="text-orange-500 underline">contact form</a> on our website. Our support team is here to help you succeed.</p>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">Where can I find more resources?</h2>
        <p>Visit our <a href="/artist-resources" className="text-orange-500 underline">Artist Resources</a> page for guides, tips, and tools to help you grow your career.</p>
      </div>
    </div>
    <div className="mt-12 bg-primary/10 border-l-4 border-primary p-6 rounded">
      <h3 className="text-lg font-semibold mb-2 text-primary">Still have questions?</h3>
      <p>We’re here to help! <a href="/contact-us" className="text-orange-500 underline">Contact our support team</a> and we’ll get back to you as soon as possible.</p>
    </div>
  </div>
);

export default FAQs;

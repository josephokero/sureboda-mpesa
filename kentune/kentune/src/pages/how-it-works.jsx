import React from 'react';

const HowItWorks = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
    <h1 className="text-4xl font-extrabold mb-8 text-primary">How KENTUNEZ Works</h1>
    <p className="mb-8 text-lg leading-relaxed">
      Discover how easy it is to distribute your music, reach new fans, and get paid with KENTUNEZ. Our platform is designed to make every step simple, transparent, and artist-friendly.
    </p>

    <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded mb-10">
      <h2 className="text-xl font-bold mb-2 text-orange-700">Step-by-Step Process</h2>
      <ol className="list-decimal ml-6 space-y-2 text-base">
        <li><b>Choose a Plan:</b> Select the distribution plan that fits your needs. All plans allow you to keep 100% of your earnings as long as your plan is active.</li>
        <li><b>Create Your Account:</b> Sign up for your artist account on KENTUNEZ in minutes.</li>
        <li><b>Upload Your Music:</b> Add your tracks, artwork, and all the details needed for distribution.</li>
        <li><b>Distribution:</b> We deliver your music to top streaming platforms in Kenya and worldwide, including Spotify, Apple Music, Boomplay, and more.</li>
        <li><b>Get Paid:</b> Track your streams and earnings in your dashboard. Receive 100% of your earnings via M-Pesa and other secure methods, as long as your plan is active.</li>
        <li><b>Grow Your Career:</b> Use our analytics, resources, and support to reach more fans and maximize your impact.</li>
      </ol>
    </div>

    <div className="grid md:grid-cols-2 gap-10 mb-12">
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">What You Get</h2>
        <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
          <li>Fast, easy music uploads with a user-friendly interface</li>
          <li>Transparent payments and real-time earnings dashboard</li>
          <li>Distribution to all major streaming platforms</li>
          <li>Local support team ready to help you succeed</li>
          <li>Marketing and promotional tools for artists</li>
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2 text-primary">Why Choose KENTUNEZ?</h2>
        <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
          <li>Trusted by thousands of Kenyan artists</li>
          <li>Quick payouts via M-Pesa and other local options</li>
          <li>Analytics to help you understand your audience</li>
          <li>Educational resources and artist guides</li>
          <li>Community of artists and music professionals</li>
        </ul>
      </div>
    </div>

    <div className="mb-12">
      <h2 className="text-xl font-bold mb-2 text-primary">Frequently Asked Questions</h2>
      <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
        <li><b>How long does it take for my music to go live?</b> Most releases are live on platforms within a few days after approval.</li>
        <li><b>What platforms do you distribute to?</b> We deliver to all major streaming services, including Spotify, Apple Music, Boomplay, YouTube Music, and more.</li>
        <li><b>How do I get paid?</b> Earnings are paid out via M-Pesa and other available methods. You can track your payments in your dashboard.</li>
        <li><b>Is there a fee?</b> We offer both free and premium services. See our pricing page for details.</li>
      </ul>
      <div className="mt-4 text-sm">
        For more answers, visit our <a href="/faqs" className="text-orange-500 underline">FAQs page</a> or <a href="/contact-us" className="text-orange-500 underline">contact us</a>.
      </div>
    </div>

    <div className="bg-primary/10 border-l-4 border-primary p-6 rounded">
      <h3 className="text-lg font-semibold mb-2 text-primary">Ready to Get Started?</h3>
      <p className="mb-2">Join KENTUNEZ today and take control of your music career. <a href="/artist-registration" className="text-orange-500 underline">Sign up now</a> and start distributing your music to the world!</p>
    </div>
  </div>
);

export default HowItWorks;

import React from 'react';

const AboutUs = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 text-gray-800">
    <h1 className="text-4xl font-extrabold mb-8 text-primary">About KENTUNEZ</h1>
    <p className="mb-8 text-lg leading-relaxed">
      <span className="font-semibold">KENTUNEZ</span> is Kenya’s leading music distribution platform, dedicated to empowering artists by making music distribution simple, transparent, and accessible. Our mission is to help artists reach global audiences, earn from their music, and grow their careers with confidence and support.
    </p>

    <div className="grid md:grid-cols-2 gap-10 mb-12">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-primary">Our Story</h2>
        <p className="mb-4">Founded by passionate music lovers and industry professionals, KENTUNEZ was created to solve the challenges faced by independent artists in Kenya. We believe every artist deserves a platform to share their voice with the world, regardless of background or resources.</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2 text-primary">Our Vision</h2>
        <p className="mb-4">To be the most trusted and innovative music distribution platform in Africa, enabling artists to thrive and be recognized globally.</p>
      </div>
    </div>

    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-2 text-primary">Our Team</h2>
      <p className="mb-4">Our team is made up of music experts, technologists, and support staff who are committed to your success. We work closely with artists, partners, and streaming platforms to deliver the best experience possible. Every member of our team is passionate about music and dedicated to helping you grow your career.</p>
      <ul className="list-disc ml-6 text-sm text-gray-700">
        <li>Experienced music industry professionals</li>
        <li>Talented software engineers and designers</li>
        <li>Friendly and responsive artist support</li>
        <li>Local and international music business advisors</li>
      </ul>
    </div>

    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-2 text-primary">What Makes Us Different?</h2>
      <ul className="list-disc ml-6 text-base text-gray-700 space-y-2">
        <li><b>Artist-First Approach:</b> We put artists at the center of everything we do, offering fair terms and transparent payments.</li>
        <li><b>Local Support:</b> Our support team is based in Kenya and understands the unique needs of Kenyan artists.</li>
        <li><b>Global Reach:</b> We distribute your music to all major streaming platforms worldwide.</li>
        <li><b>Easy Payments:</b> Get paid quickly and securely via M-Pesa and other local methods.</li>
        <li><b>Education & Resources:</b> Access guides, tips, and tools to help you succeed as an artist.</li>
      </ul>
    </div>

    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-2 text-primary">Our Commitment</h2>
      <p className="mb-4">We are committed to supporting artists at every stage of their journey. Whether you are just starting out or already established, KENTUNEZ is here to help you distribute your music, grow your audience, and achieve your dreams.</p>
    </div>

    <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded">
      <h3 className="text-lg font-semibold mb-2 text-orange-700">Join Us</h3>
      <p className="mb-2">Ready to take your music career to the next level? <span className="font-semibold">Sign up today</span> and become part of the KENTUNEZ family.</p>
      <p>For questions or partnership opportunities, <a href="/contact-us" className="text-orange-500 underline">contact us</a>.</p>
    </div>
  </div>
);

export default AboutUs;

import React from 'react';

const SuccessStories = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-800">
        <h1 className="text-3xl font-extrabold mb-4 text-primary">Success Stories</h1>
        <p className="mb-8 text-lg text-gray-800 max-w-2xl">Discover how Kenyan artists are transforming their music careers with KENTUNEZ. Our platform empowers musicians to reach global audiences, earn more, and take control of their creative journey. Here are some of our most inspiring stories:</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-primary">
            <h3 className="text-lg font-bold mb-2 text-primary">Jane Mwangi</h3>
            <p className="italic text-gray-700 mb-2">Afro-pop Artist</p>
            <p className="text-gray-800">“KENTUNEZ helped me reach over <span className='font-semibold'>100K streams</span> across Africa. The M-Pesa payments make everything so easy! I can finally focus on my music, knowing my royalties are secure and paid on time.”</p>
            <div className="mt-3 text-xs text-gray-500">Joined: 2023</div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-green-500">
            <h3 className="text-lg font-bold mb-2 text-green-700">Sam Ochieng</h3>
            <p className="italic text-gray-700 mb-2">Gospel Singer</p>
            <p className="text-gray-800">“I love the <span className='font-semibold'>transparency</span> and support. My music is now on all the top platforms, and I get real-time analytics on my fans. KENTUNEZ is a game-changer for independent artists.”</p>
            <div className="mt-3 text-xs text-gray-500">Joined: 2024</div>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-yellow-500">
            <h3 className="text-lg font-bold mb-2 text-yellow-700">Amina Said</h3>
            <p className="italic text-gray-700 mb-2">Hip-Hop/Rap</p>
            <p className="text-gray-800">“The <span className='font-semibold'>analytics dashboard</span> helped me understand my fans and grow my audience. I’ve doubled my streams and built a loyal following thanks to KENTUNEZ’s tools and community.”</p>
            <div className="mt-3 text-xs text-gray-500">Joined: 2023</div>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-2 text-primary">Why Artists Succeed with KENTUNEZ</h2>
          <ul className="list-disc pl-6 text-gray-800 space-y-1">
            <li>100% earnings paid directly to artists via M-Pesa and bank transfer</li>
            <li>Distribution to Spotify, Apple Music, Boomplay, YouTube, and more</li>
            <li>Real-time analytics and transparent reporting</li>
            <li>Dedicated support for Kenyan musicians</li>
            <li>Community events, workshops, and networking opportunities</li>
          </ul>
        </div>

        <div className="text-center mt-10">
          <h3 className="text-lg font-semibold mb-2">Ready to write your own success story?</h3>
          <a href="/artist-registration" className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full shadow transition">Get Started with KENTUNEZ</a>
        </div>
  </div>
);

export default SuccessStories;

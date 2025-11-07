import React from 'react';

const testimonials = [
  {
    name: 'Amina, Artist',
    quote: 'Kentune helped me launch my first single and connect with fans. The Starter plan is perfect for beginners!'
  },
  {
    name: 'Brian, Producer',
    quote: 'Mixing, mastering, and instant support—Kentune Pro is a game changer for serious musicians.'
  },
  {
    name: 'Clinton, Artist',
    quote: 'I grew my audience and learned so much from the tutorials. The Growth plan is truly popular for a reason!'
  },
];

const PricingTestimonials = () => (
  <div className="max-w-3xl mx-auto mt-16 mb-8 p-8 bg-gradient-to-br from-green-50 via-white to-orange-50 rounded-2xl shadow-lg">
    <h2 className="text-3xl font-bold text-green-600 mb-6">What Our Users Say</h2>
    <ul>
      {testimonials.map((t, idx) => (
        <li key={idx} className="mb-6">
          <div className="italic text-lg text-gray-700 mb-2">"{t.quote}"</div>
          <div className="text-green-700 font-semibold">- {t.name}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default PricingTestimonials;

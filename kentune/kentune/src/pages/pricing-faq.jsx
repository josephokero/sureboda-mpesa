import React from 'react';

const faqs = [
  {
    q: 'What is included in the Starter Plan?',
    a: 'Starter gives you unlimited single uploads, mastering, and basic support for new artists at a low price.'
  },
  {
    q: 'Can I upgrade later?',
    a: 'Yes! You can upgrade to Growth, Pro, or Partnership plans anytime for more features and support.'
  },
  {
    q: 'Is there support?',
    a: 'All plans include support. Growth and Pro offer faster response and more ways to get help.'
  },
  {
    q: 'How do I pay?',
    a: 'Pay easily with Mpesa on the payment page.'
  },
];

const PricingFAQ = () => (
  <div className="max-w-3xl mx-auto mt-16 mb-8 p-8 bg-white rounded-2xl shadow-lg">
    <h2 className="text-3xl font-bold text-orange-500 mb-6">Frequently Asked Questions</h2>
    <ul>
      {faqs.map((faq, idx) => (
        <li key={idx} className="mb-6">
          <div className="font-semibold text-lg text-gray-800 mb-2">{faq.q}</div>
          <div className="text-gray-600 text-base">{faq.a}</div>
        </li>
      ))}

    </ul>
  </div>
);

export default PricingFAQ;


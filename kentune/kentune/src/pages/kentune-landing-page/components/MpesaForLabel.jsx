import React, { useState } from 'react';
import MpesaLabelPayment from './MpesaLabelPayment';

const MpesaForLabel = ({ selectedAmount, planType, planName, onClose, extraFields = [], large = false }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    labelName: '',
    ...Object.fromEntries(extraFields.map(f => [f.name, ''])),
  });
  const [submitted, setSubmitted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPayment(true);
  }

  if (showPayment) {
    return (
      <MpesaLabelPayment
        amount={selectedAmount}
        labelInfo={form}
        planType={planType}
        planName={planName}
        onSuccess={() => setSubmitted(true)}
        onClose={() => setShowPayment(false)}
      />
    );
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Thank you for your payment!</h2>
        <p className="mb-4">Your information has been received. Please wait 1-12 hours for your account to be created. You will receive login details in your email to start accessing your account.</p>
        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold" onClick={onClose}>Close</button>
      </div>
    );
  }

  if (showPayment) {
    return (
      <MpesaLabelPayment
        amount={selectedAmount}
        labelInfo={form}
        planType={planType}
        planName={planName}
        onSuccess={() => { setShowPayment(false); setSubmitted(true); }}
        onClose={() => setShowPayment(false)}
      />
    );
  }

  return (
    <form className={`bg-white ${large ? 'rounded-3xl shadow-2xl p-12 max-w-2xl' : 'rounded-xl shadow-xl p-8 max-w-md'} mx-auto`} onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4 text-orange-600">Complete Your Label Registration</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Full Name</label>
        <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        <span className="text-xs text-orange-600">Ensure your email is accurate. Our team will contact you using this email.</span>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Phone Number</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        <span className="text-xs text-orange-600">Ensure your phone number is accurate. Our team will contact you using this number.</span>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Label Name</label>
        <input type="text" name="labelName" value={form.labelName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
      </div>
      {extraFields.map((field, idx) => (
        <div className="mb-4" key={field.name}>
          <label className="block font-semibold mb-1">{field.label}</label>
          {field.name === 'preferredPassword' ? (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 pr-10"
                required={field.required || false}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-xs text-gray-600 underline"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          ) : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required={field.required || false}
            />
          )}
        </div>
      ))}
      <div className="mb-6">
        <div className="font-bold mb-2">Plan: <span className="text-orange-600">{planName}</span></div>
        <div className="font-bold mb-2">Type: <span className="text-orange-600">{planType}</span></div>
        <div className="font-bold mb-2">Amount: <span className="text-green-600">Ksh {selectedAmount}</span></div>
      </div>
      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold w-full">Pay & Register</button>
      <button type="button" className="mt-4 text-gray-600 underline" onClick={onClose}>Cancel</button>
    </form>
  );
};

export default MpesaForLabel;

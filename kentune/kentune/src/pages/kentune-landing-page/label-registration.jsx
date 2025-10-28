import React from 'react';
import MpesaForLabel from './components/MpesaForLabel';
import { useLocation } from 'react-router-dom';

const LabelRegistrationPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const planType = params.get('plan');
  const selectedAmount = params.get('amount');
  const planName = params.get('name');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">Why Choose Us?</h2>
            <ul className="text-left text-gray-700 list-disc list-inside text-lg">
              <li>Trusted by hundreds of Kenyan labels and artists</li>
              <li>Fast, secure account setup and payment</li>
              <li>24/7 support and guidance</li>
              <li>Access to exclusive resources and partnerships</li>
              <li>Transparent pricing, no hidden fees</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">How We Work</h2>
            <ul className="text-left text-gray-700 list-disc list-inside text-lg">
              <li>Fill out your label details and pay securely</li>
              <li>Our team reviews and creates your account</li>
              <li>Receive login details by email within 1-12 hours</li>
              <li>Start managing unlimited artists and tracks</li>
              <li>Get ongoing support and updates</li>
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-10">
          <h1 className="text-4xl font-extrabold mb-4 text-orange-600 text-center">Label Registration & Payment</h1>
          <p className="text-xl text-gray-800 text-center mb-6">
            Welcome to Kentunez Label Registration! Fill in your details below to create your label account.<br />
            <span className="font-semibold text-orange-500">Our label team will create your account after payment. You will receive login details in your email within 1-12 hours.</span><br />
            <span className="block mt-2 text-green-700 font-bold">For faster account creation, contact support: <a href="tel:0743066593" className="underline">Call</a> or <a href="https://wa.me/254743066593" target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a> 0743066593</span>
            <span className="block mt-2 text-gray-500">All information is kept secure and used only for account creation and support.</span>
          </p>
        </div>
        <MpesaForLabel
          selectedAmount={selectedAmount}
          planType={planType}
          planName={planName}
          onClose={() => window.location.href = '/'}
          extraFields={[{label:'Label Website (optional)',name:'labelWebsite',type:'url'},{label:'Location',name:'location',type:'text',required:true},{label:'Preferred Contact Method',name:'contactMethod',type:'text'},{label:'Preferred Password',name:'preferredPassword',type:'password',required:true}]}
          large
        />
      </div>
    </div>
  );
};

export default LabelRegistrationPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import OwnALabelSection from './components/OwnALabelSection';
import FeaturesSection from './components/FeaturesSection';
import SuccessStories from './components/SuccessStories';
import HomePricingSection from './components/HomePricingSection';
import PlatformIntegrations from './components/PlatformIntegrations';
import TrustIndicators from './components/TrustIndicators';
import Footer from './components/Footer';
import MasteringRequestForm from './components/MasteringRequestForm';

const KentunezLandingPage = () => {


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-xl">
                  KENTUNEZ
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Pricing Link */}
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium border border-transparent rounded-md transition-colors"
              >
                Pricing
              </Link>
              {/* Login Link */}
              <Link
                to="/clean-sign-in-page"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium border border-transparent rounded-md transition-colors"
              >
                Login
              </Link>
              {/* Sign Up Link */}
              <Link
                to="/clean-sign-up-page"
                className="text-white bg-primary hover:bg-orange-600 px-3 py-2 text-sm font-medium rounded-md transition-colors shadow-sm"
                style={{background:'#f97316'}} // Tailwind orange-500
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

  {/* Main Content */}
  <HeroSection />
  <OwnALabelSection />
  <FeaturesSection />
  {/* Creative placement: Mastering form between features and stories */}
  <MasteringRequestForm />
  <SuccessStories />

  {/* Pricing Section from pricing page */}
  <HomePricingSection />
  {/* <PlatformIntegrations /> section removed as requested */}
  <TrustIndicators />
  <Footer />
    </div>
  );
};

export default KentunezLandingPage;
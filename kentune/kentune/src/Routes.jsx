import Mastering from './pages/mastering';
import YoutubeConnect from './pages/youtube-connect';
import PrivacyPolicy from './pages/privacy-policy';
import TermsAndConditions from './pages/terms-and-conditions';
import AboutUs from './pages/about-us';
import HowItWorks from './pages/how-it-works';
import FAQs from './pages/faqs';
import ContactUs from './pages/contact-us';
import ArtistResources from './pages/artist-resources';
import SuccessStories from './pages/success-stories';
import Payments from './pages/payments';
import Contact from './pages/contact';
import React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ArtistProfileManagement from './pages/artist-profile-management';
import AnalyticsRevenueTracking from './pages/analytics-revenue-tracking';
import ArtistDashboard from './pages/artist-dashboard';

import MusicUploadManagement from './pages/music-upload-management';
import KentunezLandingPage from './pages/kentune-landing-page';
import LabelRegistrationPage from './pages/kentune-landing-page/label-registration';
import PricingPage from './pages/pricing';
import CleanSignInPage from './pages/clean-sign-in-page';
import CleanSignUpPage from './pages/clean-sign-up-page';
import MpesaTestPage from './pages/mpesa';
import VerifyEmailPage from './pages/verify-email';
import EmailVerificationPage from './pages/email-verification';
import PaymentRequired from './pages/payment-required';
import AdminDashboard from './pages/admin-dashboard';

const Routes = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
  {/* Define your route here */}
  <Route path="/" element={<KentunezLandingPage />} />
  <Route path="/label-registration" element={<LabelRegistrationPage />} />
  <Route path="/kentunez-landing-page" element={<KentunezLandingPage />} />
  <Route path="/pricing" element={<PricingPage />} />
        <Route path="/artist-profile-management" element={<ArtistProfileManagement />} />
        <Route path="/analytics-revenue-tracking" element={<AnalyticsRevenueTracking />} />
        <Route path="/artist-dashboard" element={<ArtistDashboard />} />
  <Route path="/payments" element={<Payments />} />
  <Route path="/mastering" element={<Mastering />} />
  <Route path="/contact" element={<Contact />} />
  {/* Removed artist-registration and artist-login routes */}
        <Route path="/music-upload-management" element={<MusicUploadManagement />} />
        <Route path="/clean-sign-in-page" element={<CleanSignInPage />} />
        <Route path="/clean-sign-up-page" element={<CleanSignUpPage />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />
  <Route path="/email-verification" element={<EmailVerificationPage />} />
        <Route path="/payment-required" element={<PaymentRequired />} />
  <Route path="/admin-dashboard" element={<AdminDashboard />} />
  <Route path="/youtube-connect-astutepromusic" element={<YoutubeConnect />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/artist-resources" element={<ArtistResources />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  );
};

export default Routes;
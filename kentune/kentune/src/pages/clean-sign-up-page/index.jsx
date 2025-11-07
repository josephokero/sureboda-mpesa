import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CleanAuthHeader from './components/CleanAuthHeader';
import SignUpForm from './components/SignUpForm';
import AuthFooter from './components/AuthFooter';

const CleanSignUpPage = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async (formData) => {
    setIsSubmitting(true);
    setAuthError('');
    setSuccessMessage('');

    try {
      const metadata = {
        full_name: formData?.fullName,
        stage_name: formData?.stageName,
        phone: formData?.phone,
        role: 'artist'
      };

      const { data, error } = await signUp(formData?.email, formData?.password, metadata);
      
      if (error) {
        setAuthError(error);
        setIsSubmitting(false);
        return;
      }

      // Check if email confirmation is required
      if (data?.user && !data?.session) {
        setSuccessMessage('Account created successfully! Please check your email to verify your account before signing in.');
        setIsSubmitting(false);
        return;
      }

      // Successful sign up with immediate session - redirect to login
      setSuccessMessage('Welcome to KENTUNEZ! Your account has been created successfully. Please log in to continue.');
      setTimeout(() => {
        navigate('/clean-sign-in-page');
      }, 2000);
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background flex flex-col">
      {/* Enhanced Go Back Button */}
      <div className="p-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-all duration-200 hover:translate-x-1 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:w-6 group-hover:h-6 transition-all duration-200" />
          <span className="text-base font-medium">Go Back</span>
        </button>
      </div>

      {/* Inspiring Intro */}
      {/* Why Join Us Card */}
      <div className="flex justify-center mt-2 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-xl animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Why Join KENTUNEZ?</h1>
          <ul className="list-none space-y-3 text-base text-gray-800">
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> 100% of your earnings paid directly via M-Pesa or bank</li>
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> Distribute to Spotify, Apple Music, Boomplay, YouTube & more</li>
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> Social media distribution (Instagram, TikTok, Facebook, YouTube Shorts)</li>
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> Mastering service for professional sound</li>
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> Record label opportunities & support</li>
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> Real-time analytics and transparent reporting</li>
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> Dedicated support for Kenyan artists</li>
            <li className="flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 cursor-pointer"><span className="text-orange-500 font-bold">•</span> Workshops, events, and a supportive community</li>
          </ul>
          <p className="mt-6 text-base text-gray-700 font-medium">Empowering Kenyan artists to reach global audiences, earn more, and own their music journey. <span className="font-semibold text-orange-500 transition-colors duration-200 hover:text-orange-700 cursor-pointer">Sign up and become part of a thriving creative community!</span></p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Clean Authentication Card */}
          <div className="bg-card rounded-lg border border-border shadow-lg p-8 animate-fade-in">
            {/* Header */}
            <CleanAuthHeader 
              title="Create Your Artist Account"
              subtitle="Share your music with the world and get paid instantly"
            />

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 text-success mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-success font-medium">
                      {successMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Authentication Error */}
            {authError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 text-destructive mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-medium">
                      {authError}
                    </p>
                    {authError?.includes('Supabase project') && (
                      <button 
                        onClick={() => navigator.clipboard?.writeText?.(authError)}
                        className="mt-2 text-xs text-destructive/70 hover:text-destructive underline"
                      >
                        Copy error message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sign Up Form */}
            <SignUpForm 
              onSubmit={handleSignUp}
              isSubmitting={isSubmitting}
              disabled={isSubmitting}
            />


            {/* Footer Links */}
            <AuthFooter>
              {/* Only show sign in link, remove duplicate privacy/terms/help links */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link 
                    to="/clean-sign-in-page" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </AuthFooter>
          </div>

          {/* Prominent Trust Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-base font-semibold text-success bg-success/10 rounded-full px-6 py-3 shadow">
              <div className="w-5 h-5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Secure & Trusted by 1,000+ Kenyan Artists</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanSignUpPage;
import Button from '../../components/ui/Button';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SignInForm from './components/SignInForm';
import AuthFooter from './components/AuthFooter';

const CleanSignInPage = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [lastFormData, setLastFormData] = useState(null);

  const handleSignIn = async (formData) => {
    setIsSubmitting(true);
    setAuthError('');
    setLastFormData(formData);
    try {
      const { data, error } = await signIn(formData?.email, formData?.password);
      if (error) {
        setAuthError(error);
        setIsSubmitting(false);
        return;
      }
      if (data?.user && !data.user.emailVerified) {
        setAuthError('Please verify your email address before logging in.');
        setShowVerifyPrompt(true);
        setIsSubmitting(false);
        return;
      }
      // Fetch user profile to check role
      const db = (await import('../../lib/firebase')).db;
      const { doc, getDoc, getDocs, collection, query, where } = await import('firebase/firestore');
      const profileRef = doc(db, 'profiles', data.user.uid);
      const profileSnap = await getDoc(profileRef);
      const role = profileSnap.exists() ? profileSnap.data().role : 'artist';
      // Check subscriptions collection for active subscription
      let hasActiveSubscription = false;
      let subscriptionError = null;
      try {
        const subsQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', data.user.uid),
          where('status', '==', 'active')
        );
        const subsSnap = await getDocs(subsQuery);
        hasActiveSubscription = !subsSnap.empty;
      } catch (err) {
        subscriptionError = 'Could not check subscription status. Please try again.';
      }
      // Check if this is the user's first login
      const firstLoginKey = `kentunez-first-login-${data.user.uid}`;
      const isFirstLogin = !localStorage.getItem(firstLoginKey);
      // Save UID to localStorage for payment tracking
      localStorage.setItem('kentunez-loggedin-uid', data.user.uid);
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (subscriptionError) {
        setAuthError(subscriptionError);
        setIsSubmitting(false);
        return;
      } else if (isFirstLogin || !hasActiveSubscription) {
        localStorage.setItem(firstLoginKey, 'true');
        navigate('/pricing');
      } else {
        navigate('/artist-dashboard');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('');
    setIsSubmitting(true);
    try {
      if (!lastFormData?.email || !lastFormData?.password) {
        setResendStatus('Please enter your email and password first.');
        setIsSubmitting(false);
        return;
      }
      const { data } = await signIn(lastFormData.email, lastFormData.password);
      if (data?.user && !data.user.emailVerified) {
        await import('firebase/auth').then(({ sendEmailVerification }) => sendEmailVerification(data.user));
        setResendStatus('Verification email sent! Please check your inbox.');
      } else {
        setResendStatus('Unable to resend. Please check your credentials.');
      }
    } catch (err) {
      setResendStatus('Failed to resend verification email.');
    }
    setIsSubmitting(false);
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
      {/* Main Content Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border shadow-lg p-8">
            <div className="flex flex-col items-center mb-6 animate-fade-in">
              <div className="bg-gradient-to-tr from-orange-500 via-pink-500 to-yellow-400 rounded-full p-5 shadow-2xl mb-4 animate-fade-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-lg animate-fade-in">Welcome Back</h2>
              <p className="text-lg text-muted-foreground animate-fade-in">Sign in to continue your musical journey</p>
            </div>
            {/* Authentication Error or Verification Prompt */}
            {showVerifyPrompt ? (
              <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg text-center">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-warning font-semibold">Please verify your email address before logging in.</p>
                  <Button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isSubmitting}
                    className="mt-2"
                  >Resend Verification Email</Button>
                  {resendStatus && <div className="text-green-600 text-sm font-medium mt-2">{resendStatus}</div>}
                </div>
              </div>
            ) : authError && (
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
                  </div>
                </div>
              </div>
            )}
            {/* Sign In Form */}
            <SignInForm 
              onSubmit={handleSignIn}
              isSubmitting={isSubmitting}
              disabled={isSubmitting}
            />
            <AuthFooter>
              {/* Only show sign up link, remove duplicate privacy/terms links */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  New to KENTUNEZ?{' '}
                  <Link 
                    to="/clean-sign-up-page" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </AuthFooter>
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground bg-muted rounded-full px-4 py-2">
              <div className="w-4 h-4 text-success">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Secure & Trusted by 1,000+ Artists</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanSignInPage;
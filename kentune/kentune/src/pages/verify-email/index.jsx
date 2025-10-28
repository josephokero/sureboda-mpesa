import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [verificationState, setVerificationState] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const token = searchParams?.get('token');
        const type = searchParams?.get('type');
        // Debug log the query params
        console.log('VerifyEmailPage: token =', token, 'type =', type);
        // Check if this is an email verification request
        if (type === 'signup' || type === 'email_confirmation') {
          if (!token) {
            setVerificationState('error');
            setMessage('Invalid verification link. Please try signing up again.');
            console.log('VerifyEmailPage: No token found in query params');
            return;
          }

          // Use the correct type from the query string
          let verifyType = type;
          // Fallback for older links or unexpected types
          if (!['signup', 'email_confirmation'].includes(verifyType)) {
            verifyType = 'signup';
          }
          const { data, error } = await supabase?.auth?.verifyOtp({
            token_hash: token,
            type: verifyType
          });
          // Debug log the result
          console.log('VerifyEmailPage: verifyOtp result:', { data, error });

          if (error) {
            setVerificationState('error');
            setMessage('Email verification failed. The link may be expired, already used, or invalid. Please try signing up again and use the latest email.');
            return;
          }

          if (data?.user) {
            setVerificationState('success');
            setMessage('Email verified successfully! You can now sign in to your account.');
          } else {
            setVerificationState('error');
            setMessage('Verification failed. Please try again.');
          }
        } else if (user) {
          // User is already verified and logged in
          setVerificationState('success');
          setMessage('Your email is already verified! Redirecting to dashboard...');
        } else {
          // No verification token and no user
          setVerificationState('error');
          setMessage('Invalid verification link. Please check your email or try signing up again.');
        }
      } catch (error) {
        setVerificationState('error');
        setMessage('An unexpected error occurred during verification. Please try again.');
        console.log('VerifyEmailPage: Exception during verification', error);
      }
    };

    handleEmailVerification();
  }, [searchParams, user]);

  // Countdown timer for redirect
  useEffect(() => {
    if (verificationState === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (user) {
              navigate('/artist-dashboard');
            } else {
              navigate('/clean-sign-in-page');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationState, navigate, user]);

  const handleContinue = () => {
    if (verificationState === 'success') {
      if (user) {
        navigate('/artist-dashboard');
      } else {
        navigate('/clean-sign-in-page');
      }
    } else {
      navigate('/clean-sign-up-page');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border shadow-lg p-8 text-center">
          
          {/* Loading State */}
          {verificationState === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Verifying Email
              </h1>
              <p className="text-muted-foreground mb-6">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {/* Success State */}
          {verificationState === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Email Verified!
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Redirecting in {countdown} seconds...
              </p>
            </>
          )}

          {/* Error State */}
          {verificationState === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-16 h-16 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Verification Failed
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
            </>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {verificationState === 'success' ? (
              <button
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {user ? 'Continue to Dashboard' : 'Sign In Now'}
              </button>
            ) : verificationState === 'error' ? (
              <button
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            ) : null}
            
            <button
              onClick={() => navigate('/')}
              className="w-full text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Back to Home
            </button>
          </div>

          {/* Help Text */}
          {verificationState === 'error' && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-2">
                Need Help?
              </h3>
              <p className="text-xs text-muted-foreground">
                If you continue having issues, please check your spam folder or contact support. 
                Make sure to use the latest verification email we sent you.
              </p>
            </div>
          )}
        </div>

  {/* KENTUNEZ Branding */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground bg-muted rounded-full px-4 py-2">
            <div className="w-4 h-4 text-primary">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <span>KENTUNEZ - Music Distribution Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
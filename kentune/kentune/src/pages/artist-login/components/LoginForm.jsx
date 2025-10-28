import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const LoginForm = ({ currentLanguage }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const { signIn, resetPassword } = useAuth(); // Now uses Firebase Auth
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [resendStatus, setResendStatus] = useState('');



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else {
      // Basic email format validation
      const isEmail = formData?.email?.includes('@');
      if (!isEmail) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setShowVerifyPrompt(false);
    setResendStatus('');
    try {
      const { data, error } = await signIn(formData?.email, formData?.password);
      if (!error && data?.user) {
        if (!data.user.emailVerified) {
          setErrors({
            general: 'Please verify your email address before logging in. Check your inbox for a verification link.'
          });
          setShowVerifyPrompt(true);
          setIsLoading(false);
          return;
        }
        // Always fetch the latest user profile after sign-in and only redirect after profile is loaded
        const db = getFirestore();
        const docRef = doc(db, 'profiles', data.user.uid);
        let profile = null;
        let attempts = 0;
        // Wait for profile to exist (in case of slow Firestore propagation)
        while (attempts < 5 && !profile) {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            profile = docSnap.data();
            break;
          }
          await new Promise(res => setTimeout(res, 200));
          attempts++;
        }
        // Check subscriptions collection for active subscription
        let hasActiveSubscription = false;
        try {
          const { getDocs, collection, query, where } = await import('firebase/firestore');
          const subsQuery = query(
            collection(db, 'subscriptions'),
            where('userId', '==', data.user.uid),
            where('status', '==', 'active')
          );
          const subsSnap = await getDocs(subsQuery);
          hasActiveSubscription = !subsSnap.empty;
        } catch (err) {
          // Ignore subscription fetch errors
        }
        if (profile?.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (hasActiveSubscription) {
          navigate('/artist-dashboard');
        } else {
          // Not paid or no active subscription, redirect to pricing
          navigate('/pricing');
        }
      } else {
        setErrors({
          general: 'Invalid credentials. Please check your email and password.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('');
    setIsLoading(true);
    try {
      const { data } = await signIn(formData?.email, formData?.password);
      if (data?.user && !data.user.emailVerified) {
        await sendEmailVerification(data.user);
        setResendStatus('Verification email sent! Please check your inbox.');
      } else {
        setResendStatus('Unable to resend. Please check your credentials.');
      }
    } catch (err) {
      setResendStatus('Failed to resend verification email.');
    }
    setIsLoading(false);
  };

  const handleGoBack = () => {
    setShowVerifyPrompt(false);
    setErrors({});
    setResendStatus('');
  };


  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = () => {
    setShowForgotModal(true);
    setForgotEmail(formData.email || '');
    setForgotStatus('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus('');
    setForgotLoading(true);
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotStatus('Please enter a valid email address.');
      setForgotLoading(false);
      return;
    }
    const { error } = await resetPassword(forgotEmail);
    if (error) {
      setForgotStatus(error);
    } else {
      setForgotStatus('A password reset link has been sent to your email.');
    }
    setForgotLoading(false);
  };

  return (
    <>
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-xl" onClick={() => setShowForgotModal(false)}>&times;</button>
            <h2 className="font-bold text-lg mb-2">Reset your password</h2>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
                disabled={forgotLoading}
              />
              <Button type="submit" variant="primary" fullWidth disabled={forgotLoading}>
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              {forgotStatus && <div className={`text-sm mt-2 ${forgotStatus.includes('sent') ? 'text-success' : 'text-error'}`}>{forgotStatus}</div>}
            </form>
          </div>
        </div>
      )}
      {!showVerifyPrompt ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors?.general && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={18} className="text-error mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-error font-medium">{errors?.general}</p>
                </div>
              </div>
            </div>
          )}
          {/* Email Input */}
          <div className="space-y-2">
            <Input
              label={'Email'}
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleInputChange}
              placeholder={'artist@kentunez.com'}
              error={errors?.email}
              required
              disabled={isLoading}
              className="h-12"
            />
          </div>
          {/* Password Input */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                label={'Password'}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData?.password}
                onChange={handleInputChange}
                placeholder={'Enter your password'}
                error={errors?.password}
                required
                disabled={isLoading}
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
              </button>
            </div>
          </div>
          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <Checkbox
              label={currentLanguage === 'en' ? 'Remember me' : 'Nikumbuke'}
              name="rememberMe"
              checked={formData?.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
              size="sm"
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
              disabled={isLoading}
            >
              {currentLanguage === 'en' ? 'Forgot Password?' : 'Umesahau Nenosiri?'}
            </button>
          </div>
          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="default"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              iconName="LogIn"
              iconPosition="left"
              className="h-12 font-semibold"
            >
              {currentLanguage === 'en' ? 'Sign In' : 'Ingia'}
            </Button>
          </div>
          {/* Social login options removed as requested */}
        </form>
      ) : (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Icon name="MailCheck" size={40} className="text-primary mb-2" />
              <h2 className="text-xl font-bold text-primary mb-1">Verify Your Email</h2>
              <p className="text-base text-muted-foreground">We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.</p>
            </div>
            {resendStatus && <div className="text-green-600 text-sm font-medium">{resendStatus}</div>}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                iconName="RefreshCw"
                iconPosition="left"
              >
                {isLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button
                type="button"
                onClick={handleGoBack}
                className="w-full bg-muted text-foreground font-medium py-3 px-4 rounded-lg border border-input"
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
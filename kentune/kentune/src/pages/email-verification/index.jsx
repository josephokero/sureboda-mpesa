import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getAuth, confirmPasswordReset, verifyPasswordResetCode, applyActionCode } from 'firebase/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('');
  const [oobCode, setOobCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordResetReady, setPasswordResetReady] = useState(false);

  useEffect(() => {
    const m = searchParams.get('mode');
    const code = searchParams.get('oobCode');
    setMode(m);
    setOobCode(code);
    setLoading(false);
    if (m === 'resetPassword' && code) {
      // Check if code is valid and get email
      const auth = getAuth();
      verifyPasswordResetCode(auth, code)
        .then(email => {
          setEmail(email);
          setPasswordResetReady(true);
        })
        .catch(() => {
          setError('Invalid or expired password reset link.');
        });
    }
    if (m === 'verifyEmail' && code) {
      // Try to apply the action code
      const auth = getAuth();
      applyActionCode(auth, code)
        .then(() => {
          setSuccess('Your email has been verified! You can now sign in.');
        })
        .catch(() => {
          setError('Invalid or expired email verification link.');
        });
    }
  }, [searchParams]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess('Your password has been reset! You can now sign in.');
    } catch {
      setError('Failed to reset password. Please try again or request a new link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border shadow-lg p-8 text-center">
          {loading && (
            <div className="flex justify-center mb-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
          )}
          {mode === 'verifyEmail' && !loading && (
            <>
              {success ? (
                <>
                  <div className="flex justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-success" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-4">Email Verified!</h1>
                  <p className="text-muted-foreground mb-6">{success}</p>
                  <Button onClick={() => navigate('/clean-sign-in-page')}>Sign In</Button>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <XCircle className="w-16 h-16 text-destructive" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-4">Verification Failed</h1>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button onClick={() => navigate('/')}>Back to Home</Button>
                </>
              )}
            </>
          )}
          {mode === 'resetPassword' && !loading && (
            <>
              {passwordResetReady ? (
                <form onSubmit={handlePasswordReset} className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-success" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-4">Reset Your Password</h1>
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={loading}>Reset Password</Button>
                  {success && <p className="text-success mt-4">{success}</p>}
                  {error && <p className="text-destructive mt-4">{error}</p>}
                </form>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <XCircle className="w-16 h-16 text-destructive" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-4">Password Reset Failed</h1>
                  <p className="text-muted-foreground mb-6">{error}</p>
                  <Button onClick={() => navigate('/')}>Back to Home</Button>
                </>
              )}
            </>
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

export default EmailVerificationPage;

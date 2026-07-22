import React, { useState, useEffect } from 'react';
import { Heart, Package, Rocket, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword, resendOtp } from '../../services/authService';
import AuthLayout from './components/AuthLayout';
import { AuthButton, AuthInput, PasswordStrength } from './components/AuthFormComponents';

const forgotPerks = [
  { icon: ShieldCheck, text: 'Secure, encrypted account protection' },
  { icon: Package, text: 'Track all your orders in real-time' },
  { icon: Heart, text: 'Access your saved wishlist anytime' },
  { icon: Rocket, text: 'Faster checkout with saved addresses' },
];

const ForgotPasswordView = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!secondsLeft) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await forgotPassword(email);
      setMessage('OTP has been sent to your email.');
      setStep(2);
      setSecondsLeft(60);
    } catch (err) {
      const payload = err?.response?.data || {};
      const errMsg = payload?.message || err.message || 'Failed to send OTP. Please try again.';
      setError(errMsg);
      
      const waitMatch = errMsg.match(/wait (\d+) seconds/i);
      if (waitMatch) {
        setSecondsLeft(parseInt(waitMatch[1], 10));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (event) => {
    if (event) event.preventDefault();
    if (secondsLeft > 0) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resendOtp(email, 'reset_password');
      setMessage('A new OTP has been sent to your email.');
      setSecondsLeft(60);
    } catch (err) {
      const payload = err?.response?.data || {};
      const errMsg = payload?.message || err.message || 'Failed to resend OTP. Please try again.';
      setError(errMsg);

      const waitMatch = errMsg.match(/wait (\d+) seconds/i);
      if (waitMatch) {
        setSecondsLeft(parseInt(waitMatch[1], 10));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password has been reset successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      const payload = err?.response?.data || {};
      setError(
        payload?.message ||
          err.message ||
          'Failed to reset password. Please check your OTP and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title={step === 1 ? 'Forgot Password' : 'Reset Password'}
      // subtitle="Remember your password?"
      // subtitleLink="/auth/login"
      subtitleLinkText="Sign In"
      leftTagline="Regain access to your marketplace"
      leftTaglineEmphasis=""
      leftDescription="We will send a one-time password (OTP) to your email to help you reset your password."
      leftPerks={forgotPerks}
    >
      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <AuthInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@email.com"
            icon="mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {error ? <p className="text-red mb-3 text-sm">{error}</p> : null}
          {message ? <p className="mb-3 text-sm text-green-400">{message}</p> : null}

          <AuthButton type="submit" disabled={loading || !email || secondsLeft > 0}>
            {loading ? 'Sending...' : (secondsLeft > 0 ? `Wait ${secondsLeft}s` : 'Send OTP')}
          </AuthButton>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <AuthInput
            id="otp"
            label="One-Time Password (OTP)"
            type="text"
            placeholder="Enter the 6-digit OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
          />

          <AuthInput
            id="newPassword"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            icon={showPassword ? 'eyeOff' : 'eye'}
            onIconClick={() => setShowPassword((prev) => !prev)}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          {newPassword && <PasswordStrength value={newPassword} />}
          <div className="mb-4" />

          {error ? <p className="text-red mb-3 text-sm">{error}</p> : null}
          {message ? <p className="mb-3 text-sm text-green-400">{message}</p> : null}

          <AuthButton type="submit" disabled={loading || !otp || !newPassword}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </AuthButton>

          <p className="text-gray mt-2 text-center text-[0.8rem]">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || secondsLeft > 0}
              className="text-teal disabled:text-gray font-medium no-underline disabled:cursor-not-allowed"
            >
              Resend OTP
            </button>{' '}
            {secondsLeft > 0 ? <span>in {secondsLeft}s</span> : null}
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordView;

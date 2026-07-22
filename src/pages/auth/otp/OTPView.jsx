import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { AuthButton } from '../components/AuthFormComponents';
import { resendOtp, verifyOtp } from '../../../services/authService';

const otpPerks = [
  { icon: ShieldCheck, text: 'OTP expires in 10 minutes' },
  { icon: Smartphone, text: 'Sent to your email and phone' },
  { icon: RefreshCw, text: 'Can resend after 60 seconds' },
];

const OTPView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const email = location.state?.email || localStorage.getItem('pendingEmail') || 'your email';
  const pendingUserId = location.state?.userId || localStorage.getItem('pendingUserId');

  const routeByRole = (role) => {
    if (role === 'merchant') return '/merchant';
    if (role === 'admin' || role === 'sub_admin') return '/admin';
    return '/dashboard';
  };

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

  const handleInput = (index, value) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    const nextDigits = [...digits];
    nextDigits[index] = cleanValue;
    setDigits(nextDigits);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    const userEmail = location.state?.email || localStorage.getItem('pendingEmail');
    if (!pendingUserId || !userEmail || secondsLeft > 0) return;

    setError('');
    setInfo('');
    try {
      await resendOtp(userEmail, 'register');
      setInfo('A new OTP has been sent.');
      setSecondsLeft(60);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Could not resend OTP.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    if (!pendingUserId) {
      setError('Missing registration session. Please register again.');
      setLoading(false);
      return;
    }

    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOtp(pendingUserId, code);
      const nextPath = routeByRole(response?.user?.role);

      localStorage.removeItem('pendingUserId');
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingToken');
      localStorage.removeItem('pendingUser');

      navigate(nextPath);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="otp"
      title="Verify Your Account"
      subtitle={`We sent a 6-digit code to ${email || 'your email'}. Enter it below to continue.`}
      leftTagline="Almost there! Verify your account"
      leftTaglineEmphasis=""
      leftDescription="We sent a 6-digit code to your email and phone. Enter it to confirm your identity and activate your account."
      leftPerks={otpPerks}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-5 flex justify-center gap-2.5 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              value={digit}
              onChange={(event) => handleInput(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              className="bg-navy3 border-border focus:border-teal h-14 w-11 rounded-lg border text-center font-['Syne'] text-[1.35rem] font-bold text-white outline-none sm:w-13"
              type="text"
              inputMode="numeric"
              maxLength={1}
            />
          ))}
        </div>

        {error ? <p className="mb-3 text-center text-sm text-red">{error}</p> : null}
        {info ? <p className="mb-3 text-center text-sm text-teal">{info}</p> : null}

        <p className="text-gray mb-5 text-center text-[0.8rem]">
          Didn't receive it?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className="text-teal disabled:text-gray font-medium disabled:cursor-not-allowed"
          >
            Resend code
          </button>{' '}
          {secondsLeft > 0 ? <span>in {secondsLeft}s</span> : null}
        </p>

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify and Continue'}
        </AuthButton>

        <AuthButton type="button" variant="outline" onClick={() => navigate('/auth/register')}>
          Back
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default OTPView;

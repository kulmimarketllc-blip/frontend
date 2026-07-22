import React, { useState } from 'react';
import { Heart, Package, Rocket, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, startGoogleOAuth } from '../../services/authService';
import { setKeepSignedIn } from '../../utils/storage';
import AuthLayout from './components/AuthLayout';
import {
  AuthButton,
  AuthDivider,
  AuthInput,
  CheckboxField,
  SocialButton,
} from './components/AuthFormComponents';

const loginPerks = [
  { icon: Package, text: 'Track all your orders in real-time' },
  { icon: Heart, text: 'Access your saved wishlist anytime' },
  { icon: Rocket, text: 'Faster checkout with saved addresses' },
  { icon: ShieldCheck, text: 'Secure, encrypted account protection' },
];

const LoginView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const routeByRole = (role) => {
    if (role === 'merchant') return '/merchant';
    if (role === 'admin') return '/admin';
    if (role === 'sub_admin') return '/subadmin';
    return '/dashboard';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      setKeepSignedIn(remember);
      const { user } = await login(email, password);
      localStorage.removeItem('pendingToken');
      localStorage.removeItem('pendingUser');
      localStorage.removeItem('pendingUserId');

      if (remember) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // If user was redirected to login from a protected route, go back there
      const returnTo = location.state?.from?.pathname;
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate(routeByRole(user?.role));
      }
    } catch (err) {
      const payload = err?.response?.data || {};
      const message = payload?.message || err.message || 'Invalid email or password.';

      if (payload?.requiresOtp || String(message).toLowerCase().includes('not verified')) {
        const pendingUserId = payload?.userId;
        if (pendingUserId) {
          localStorage.setItem('pendingUserId', pendingUserId);
          localStorage.setItem('pendingEmail', payload?.email || email);
          navigate('/auth/otp', {
            state: {
              userId: pendingUserId,
              email: payload?.email || email,
            },
          });
          return;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { user } = await startGoogleOAuth();
      const returnTo = location.state?.from?.pathname;
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate(routeByRole(user?.role));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Sign In"
      subtitle="Don't have an account?"
      subtitleLink="/auth/register"
      subtitleLinkText="Create one free"
      leftTagline="Welcome back to your marketplace"
      leftTaglineEmphasis=""
      leftDescription="Sign in to track orders, manage your wishlist, save addresses, and enjoy a personalized shopping experience."
      leftPerks={loginPerks}
    >
      <div className="mb-6 flex overflow-hidden rounded-md border border-white/10">
        <button
          type="button"
          className="bg-teal text-navy flex-1 cursor-pointer px-4 py-2.5 text-[0.82rem] font-semibold tracking-[0.04em]"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => navigate('/auth/register')}
          className="text-gray hover:text-teal flex-1 cursor-pointer bg-transparent px-4 py-2.5 text-[0.82rem] font-medium tracking-[0.04em] transition-colors"
        >
          Create Account
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3">
        <SocialButton provider="google" onClick={handleGoogleLogin}>
          Google
        </SocialButton>
        {/* <SocialButton provider="facebook">Facebook</SocialButton> */}
      </div>

      <AuthDivider text="or continue with email" />

      <form onSubmit={handleSubmit}>
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@email.com"
          icon="mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthInput
          id="password"
          label="Password"
          labelRight={
            <Link
              to="/auth/forgot-password"
              className="text-teal hover:text-teal2 transition-colors"
            >
              Forgot Password?
            </Link>
          }
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          icon={showPassword ? 'eyeOff' : 'eye'}
          onIconClick={() => setShowPassword((prev) => !prev)}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? <p className="text-red mb-3 text-sm">{error}</p> : null}

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In ->'}
        </AuthButton>

        <CheckboxField
          id="remember"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        >
          Keep me signed in on this device
        </CheckboxField>

        <p className="text-gray mt-2 text-center text-[0.8rem]">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-teal font-medium no-underline">
            Create one free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginView;

import React, { useState } from 'react';
import { CreditCard, Gift, MailCheck, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { register, startGoogleOAuth } from '../../services/authService';
import AuthLayout from './components/AuthLayout';
import {
  AuthButton,
  AuthDivider,
  AuthInput,
  CheckboxField,
  PasswordStrength,
  SocialButton,
} from './components/AuthFormComponents';

const registerPerks = [
  { icon: Gift, text: 'Get $10 off your first order' },
  { icon: MailCheck, text: 'Exclusive deals for members' },
  { icon: RotateCcw, text: '30-day hassle-free returns' },
  { icon: CreditCard, text: 'Save payment methods securely' },
];

const RegisterView = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const normalizePhone = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return undefined;

    return trimmed.startsWith('+') ? `+${digits}` : `+${digits}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!agreedTerms) {
      setError('Please accept the terms to continue.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const phone = normalizePhone(formData.phone);
      if (phone) {
        payload.phone = phone;
      }

      const response = await register(payload);
      localStorage.setItem('pendingUserId', response.userId);
      localStorage.setItem('pendingEmail', payload.email);
      navigate('/auth/otp', { state: { email: payload.email, userId: response.userId } });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="register"
      title="Create Account"
      subtitle="Already have one?"
      subtitleLink="/auth/login"
      subtitleLinkText="Sign in here"
      leftTagline="Join thousands of happy shoppers"
      leftTaglineEmphasis=""
      leftDescription="Create your free Kulmi Market account and start shopping from hundreds of verified merchants, all in one place."
      leftPerks={registerPerks}
    >
      <div className="mb-4 grid grid-cols-1 gap-3">
        <SocialButton provider="google" onClick={startGoogleOAuth}>Continue with Google</SocialButton>
        {/* <SocialButton provider="facebook">Continue with Facebook</SocialButton> */}
      </div>

      <AuthDivider text="or sign up with email" />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AuthInput
            id="first-name"
            label="First Name"
            placeholder="John"
            icon="user"
            value={formData.firstName}
            onChange={handleChange('firstName')}
          />
          <AuthInput
            id="last-name"
            label="Last Name"
            placeholder="Doe"
            icon="user"
            value={formData.lastName}
            onChange={handleChange('lastName')}
          />
        </div>

        <AuthInput
          id="register-email"
          label="Email Address"
          type="email"
          placeholder="you@email.com"
          icon="mail"
          value={formData.email}
          onChange={handleChange('email')}
        />

        <AuthInput
          id="register-phone"
          label="Phone Number"
          type="tel"
          placeholder="(555) 000-0000"
          prefix="+1"
          value={formData.phone}
          onChange={handleChange('phone')}
        />

        <AuthInput
          id="register-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 8 characters"
          icon={showPassword ? 'eyeOff' : 'eye'}
          onIconClick={() => setShowPassword((prev) => !prev)}
          value={formData.password}
          onChange={handleChange('password')}
        />

        <PasswordStrength value={formData.password} />

        {error ? <p className="mt-2 mb-3 text-sm text-red">{error}</p> : null}

        <div className="mt-4">
          <CheckboxField
            id="terms"
            checked={agreedTerms}
            required
            onChange={(event) => setAgreedTerms(event.target.checked)}
          >
            I agree to the{' '}
            <Link to="#" className="text-teal no-underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="text-teal no-underline">
              Privacy Policy
            </Link>
          </CheckboxField>

          <CheckboxField
            id="marketing"
            checked={marketingOptIn}
            onChange={(event) => setMarketingOptIn(event.target.checked)}
          >
            Send me exclusive deals and updates
          </CheckboxField>
        </div>

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account - It\'s Free ->'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default RegisterView;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountLayout from '../../../layout/account/AccountLayout';
import { User, Mail, Lock, UserPlus, ShieldIcon, HelpCircle } from 'lucide-react';

const RegisterView = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/otp'); // Forward to OTP for confirmation
  };

  return (
    <AccountLayout title="Join Kulmi Market" sub="The ultimate marketplace experience">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray/70 mb-1 block text-[0.65rem] font-bold tracking-[0.12em] uppercase">
              First Name
            </label>
            <div className="relative">
              <User size={14} className="text-gray absolute top-2.5 left-3" />
              <input
                required
                className="bg-navy3/40 focus:border-teal w-full rounded border border-white/5 py-2 pr-3 pl-9 text-[0.8rem] text-white outline-none"
                placeholder="Ahmed"
              />
            </div>
          </div>
          <div>
            <label className="text-gray/70 mb-1 block text-[0.65rem] font-bold tracking-[0.12em] uppercase">
              Last Name
            </label>
            <div className="relative">
              <User size={14} className="text-gray absolute top-2.5 left-3" />
              <input
                required
                className="bg-navy3/40 focus:border-teal w-full rounded border border-white/5 py-2 pr-3 pl-9 text-[0.8rem] text-white outline-none"
                placeholder="Mohamed"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-gray/70 mb-1 block text-[0.65rem] font-bold tracking-[0.12em] uppercase">
            Email
          </label>
          <div className="relative">
            <Mail size={14} className="text-gray absolute top-2.5 left-3" />
            <input
              required
              type="email"
              className="bg-navy3/40 focus:border-teal w-full rounded border border-white/5 py-2 pr-3 pl-9 text-[0.8rem] text-white outline-none"
              placeholder="ahmed@mail.com"
            />
          </div>
        </div>

        <div>
          <label className="text-gray/70 mb-1 block text-[0.65rem] font-bold tracking-[0.12em] uppercase">
            Password
          </label>
          <div className="relative">
            <Lock size={14} className="text-gray absolute top-2.5 left-3" />
            <input
              required
              type="password"
              title="Enter a strong password"
              placeholder="••••••••"
              className="bg-navy3/40 focus:border-teal w-full rounded border border-white/5 py-2 pr-3 pl-9 text-[0.8rem] text-white outline-none"
            />
          </div>
        </div>

        <div className="bg-teal/5 border-teal/10 flex items-center gap-2 rounded border p-3">
          <ShieldIcon size={14} className="text-teal" />
          <span className="text-gray2 text-[0.68rem] leading-tight">
            By continuing, I agree to the{' '}
            <Link className="text-teal font-medium underline">Terms of Service</Link> and{' '}
            <Link className="text-teal font-medium underline">Privacy Policy</Link>.
          </span>
        </div>

        <button
          type="submit"
          className="bg-teal hover:bg-teal2 text-navy mt-2 flex w-full items-center justify-center gap-2 rounded px-4 py-3 text-[0.9rem] font-bold transition-all hover:scale-[1.01]"
        >
          <UserPlus size={18} /> Create My Account
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <HelpCircle size={14} className="text-gray" />
          <Link
            to="/merchant-register"
            title="Sell on Kulmi Market"
            className="text-teal hover:text-teal2 text-[0.7rem] font-bold tracking-widest uppercase no-underline"
          >
            Sell on Kulmi Market?
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray2 text-[0.8rem]">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:text-teal2 font-bold no-underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AccountLayout>
  );
};

export default RegisterView;

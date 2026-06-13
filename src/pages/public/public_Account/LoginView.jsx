import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountLayout from '../../../layout/account/AccountLayout';
import { Mail, Lock, LogIn, ChevronRight, Apple, Github } from 'lucide-react';

const LoginView = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/otp'); // Forward to OTP for "security"
  };

  return (
    <AccountLayout title="Welcome Back" sub="Secure access to your Kulmi Market account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-gray mb-1.5 block text-[0.7rem] font-medium tracking-[0.14em] uppercase">
            Email Address
          </label>
          <div className="relative">
            <Mail className="text-gray absolute top-3.5 left-3 h-4 w-4" />
            <input
              type="email"
              required
              className="bg-navy3/40 focus:border-teal placeholder:text-gray/40 w-full rounded border border-white/[0.07] py-3 pr-4 pl-10 text-[0.88rem] text-white transition-colors outline-none"
              placeholder="example@email.com"
            />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-gray block text-[0.7rem] font-medium tracking-[0.14em] uppercase">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="text-gray absolute top-3.5 left-3 h-4 w-4" />
            <input
              type="password"
              required
              className="bg-navy3/40 focus:border-teal placeholder:text-gray/40 w-full rounded border border-white/[0.07] py-3 pr-4 pl-10 text-[0.88rem] text-white transition-colors outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-teal hover:bg-teal2 text-navy flex w-full items-center justify-center gap-2 rounded px-4 py-3.5 text-[0.9rem] font-bold transition-all hover:scale-[1.01]"
        >
          <LogIn size={18} /> Sign In
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.07]"></div>
          </div>
          <span className="bg-card text-gray/60 relative px-4 text-[0.68rem] font-bold tracking-widest uppercase">
            Or continue with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="bg-navy3/20 flex items-center justify-center gap-2 rounded border border-white/[0.07] px-4 py-2.5 text-[0.82rem] font-medium text-white transition-colors hover:bg-white/4"
          >
            <Apple size={16} /> Apple
          </button>
          <button
            type="button"
            className="bg-navy3/20 flex items-center justify-center gap-2 rounded border border-white/[0.07] px-4 py-2.5 text-[0.82rem] font-medium text-white transition-colors hover:bg-white/4"
          >
            <Github size={16} /> Github
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray2 text-[0.8rem]">
            New to Kulmi Market?{' '}
            <Link
              to="/register"
              className="text-teal hover:text-teal2 inline-flex items-center gap-0.5 font-bold no-underline"
            >
              Create account <ChevronRight size={12} />
            </Link>
          </p>
        </div>
      </form>
    </AccountLayout>
  );
};

export default LoginView;

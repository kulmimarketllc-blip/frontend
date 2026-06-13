import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';

const AccountLayout = ({ children, title, sub, showHome = true }) => {
  return (
    <div className="bg-navy flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md animate-[fadeUp_0.4s_ease_both] space-y-8">
        <div className="text-center">
          <Logo className="h-12 w-fit mx-auto mb-2" textClassName="text-white" />
          <h2 className="mt-6 font-['Syne'] text-[1.4rem] font-bold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-gray mt-2 text-[0.88rem]">{sub}</p>
        </div>
        <div className="bg-card rounded-lg border border-white/[0.07] p-8 shadow-xl">
          {children}
        </div>
        {showHome && (
          <div className="text-center">
            <Link
              to="/"
              className="text-gray hover:text-teal text-[0.78rem] font-medium transition-colors"
            >
              ← Back to Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountLayout;

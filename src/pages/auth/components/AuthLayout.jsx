import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../../components/Logo';

const AuthLayout = ({
  mode,
  title,
  subtitle,
  subtitleLink,
  subtitleLinkText,
  leftTagline,
  leftTaglineEmphasis,
  leftDescription,
  leftPerks,
  children,
}) => {
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';

  return (
    <div className="bg-navy relative min-h-screen text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(140deg,#0A1628_0%,#0D2137_50%,#091520_100%)] px-16 py-24 lg:flex lg:flex-col lg:justify-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(0,201,167,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 60%)',
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, #F8FAFC 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10">
            <Logo className="h-10 min-[640px]:h-12 w-fit mb-8" textClassName="text-white" />
            <h2 className="font-syne mb-4 text-[2.2rem] leading-[1.2] font-bold text-white">
              {leftTagline} <em className="text-teal not-italic">{leftTaglineEmphasis}</em>
            </h2>
            <p className="text-gray mb-10 max-w-[95%] text-[1rem] leading-[1.75]">
              {leftDescription}
            </p>

            <div className="flex flex-col gap-3.5">
              {leftPerks.map((perk) => (
                <div key={perk.text} className="text-gray2 flex items-center gap-3 text-[0.85rem]">
                  <span className="bg-teal/10 border-teal/20 text-teal inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                    <perk.icon size={15} />
                  </span>
                  <span>{perk.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy2 relative flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
          <div className="absolute top-6 right-6 lg:top-8 lg:right-10">
            <Link
              to="/"
              className="text-gray hover:text-teal text-[0.72rem] font-bold tracking-wide uppercase transition-colors md:text-[0.82rem]"
            >
              &larr; Back to Store
            </Link>
          </div>

          <div className="w-full max-w-[420px]">
            <Logo className="h-10 w-fit mb-10 lg:hidden" textClassName="text-white" />

            <h1 className="font-syne text-[1.8rem] font-extrabold text-white">{title}</h1>

            {subtitle && (
              <p className="text-gray mt-2 text-[0.88rem] leading-[1.6]">
                {subtitle}{' '}
                {subtitleLink ? (
                  <Link to={subtitleLink} className="text-teal font-medium no-underline">
                    {subtitleLinkText}
                  </Link>
                ) : null}
              </p>
            )}

            <div className="mt-7">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;

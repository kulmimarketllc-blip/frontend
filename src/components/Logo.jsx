import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "h-7 sm:h-10", textClassName = "text-white" }) => {
  return (
    <Link to="/" className={`flex items-center gap-1.5 sm:gap-2.5 no-underline shrink-0 ${className} min-[900px]:col-start-1`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto shrink-0">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#00C9A7" strokeWidth="2.5"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.12"/>
        <rect x="23" y="30" width="54" height="16" rx="4" fill="#00C9A7"/>
        <rect x="23" y="54" width="54" height="16" rx="4" fill="currentColor" opacity="0.12"/>
      </svg>
      <div className={`flex flex-col justify-center leading-[1.1] shrink-0 ${textClassName}`}>
        <span className="font-['Syne'] text-[0.75rem] sm:text-[1.1rem] font-extrabold tracking-[0.06em]">KULMI</span>
        <span className="font-['Syne'] text-[0.75rem] sm:text-[1.1rem] font-extrabold tracking-[0.06em] opacity-80">MARKET</span>
      </div>
    </Link>
  );
};

export default Logo;

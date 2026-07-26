import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "h-7 sm:h-10", textClassName = "", imgClassName = "" }) => {
  return (
    <Link to="/" className={`flex items-center no-underline shrink-0 ${className} min-[900px]:col-start-1`}>
      <img
        src="/logo.png"
        alt="Kulmi Market"
        className={`h-full w-auto object-contain shrink-0 ${imgClassName}`}
      />
    </Link>
  );
};

export default Logo;

import React from 'react';

const MerchantPageHeader = ({ title, subtitle, className = '' }) => {
  return (
    <div className={className}>
      <h1 className="font-['Syne'] text-[1.4rem] lg:text-[1.5rem] font-bold text-white">{title}</h1>
      <p className="text-gray text-[1rem]">{subtitle}</p>
    </div>
  );
};

export default MerchantPageHeader;

import React from 'react';

const UserPageHeader = ({ title, subtitle, className = '' }) => {
  return (
    <div className={className}>
      <h1 className="font-['Syne'] text-[1.4rem] font-bold text-white lg:text-[1.5rem]">{title}</h1>
      <p className="text-gray text-[1rem]">{subtitle}</p>
    </div>
  );
};

export default UserPageHeader;

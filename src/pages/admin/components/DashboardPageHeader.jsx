import React from 'react';

const DashboardPageHeader = ({ title, subtitle, actions, className = '' }) => {
  return (
    <div className={`mb-5 flex flex-wrap items-start justify-between gap-4 ${className}`.trim()}>
      <div>
        <h1 className="font-['Syne'] text-[1.4rem] lg:text-[1.5rem] font-bold text-white">{title}</h1>
        <p className="text-gray text-[1rem]">{subtitle}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export default DashboardPageHeader;

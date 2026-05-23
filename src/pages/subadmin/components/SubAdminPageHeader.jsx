import React from 'react';

const SubAdminPageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-['Syne'] text-[1.4rem] font-bold text-white lg:text-[1.5rem]">{title}</h1>
        <p className="text-gray text-[1rem]">{subtitle}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export default SubAdminPageHeader;

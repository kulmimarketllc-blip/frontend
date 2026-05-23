import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ icon: Icon, name, itemCount, path }) => {
  const Wrapper = path ? Link : 'div';
  const wrapperProps = path ? { to: path, className: 'no-underline' } : {};

  return (
    <Wrapper {...wrapperProps}>
      <div className="bg-card hover:border-teal hover:bg-teal/5 cursor-pointer rounded border border-white/10 p-6 text-center transition-all hover:-translate-y-1">
        <div className="mx-auto mb-3 flex justify-center">
          {Icon && <Icon size={40} className="text-teal" />}
        </div>
        <h3 className="mb-1 text-sm font-semibold text-white">{name}</h3>
        <p className="text-gray text-xs">{itemCount} items</p>
      </div>
    </Wrapper>
  );
};

export default CategoryCard;

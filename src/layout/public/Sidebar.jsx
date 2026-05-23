import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Package, Smartphone, ShoppingBag } from 'lucide-react';
import { getCurrentUser } from '../../services/authService';
import { getToken } from '../../utils/storage';

const Sidebar = ({ categories, selectedCategory, mobileMenuOpen, onSelectCategory }) => {
  const location = useLocation();
  return (
    <div
      className={`bg-navy2 fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-white/10 pt-6 transition-transform duration-300 min-[900px]:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {categories.map((cat) => {
        const IconComponent = cat.icon;
        return (
          <Link
            key={cat.id}
            to={cat.path}
            onClick={() => onSelectCategory(cat)}
            className={`mt-4 flex w-full items-center gap-3 border-l-4 px-4 py-3 text-[0.9rem] tracking-[0.04em] no-underline transition-colors ${
              selectedCategory === cat.name
                ? 'border-teal text-teal bg-[rgba(0,201,167,0.1)]'
                : 'text-gray2 hover:text-teal border-transparent hover:bg-[rgba(0,201,167,0.05)]'
            }`}
          >
            <IconComponent size={20} />
            {cat.name}
          </Link>
        );
      })}

      <div className="mx-4 my-6 h-px bg-white/10" />
      <div className="text-gray mb-2 px-6 text-[0.65rem] font-bold tracking-widest uppercase">
        Account & Portals
      </div>

      {(() => {
        const token = getToken && getToken();
        const user = getCurrentUser && getCurrentUser();
        if (!token || !user) {
          // Not logged in
          return (
            <Link
              to="/auth/login"
              onClick={() => onSelectCategory({ path: '/auth/login' })}
              className={`mt-4 flex w-full items-center gap-3 border-l-4 px-4 py-3 text-[0.85rem] lg:text-[0.875rem] tracking-[0.04em] no-underline transition-colors ${
                location.pathname === '/auth/login'
                  ? 'border-teal text-teal bg-[rgba(0,201,167,0.1)]'
                  : 'text-gray2 hover:text-teal border-transparent hover:bg-[rgba(0,201,167,0.05)]'
              }`}
            >
              <User size={18} /> Sign In / register
            </Link>
          );
        }
        // Logged in: show only the portal for their role
        const role = user.role;
        if (role === 'customer' || role === 'delivery_partner') {
          return (
            <Link
              to="/dashboard"
              onClick={() => onSelectCategory({ path: '/dashboard' })}
              className={`mt-4 flex w-full items-center gap-3 border-l-4 px-4 py-3 text-[0.85rem] lg:text-[0.875rem] tracking-[0.04em] no-underline transition-colors ${
                location.pathname === '/dashboard'
                  ? 'border-teal text-teal bg-[rgba(0,201,167,0.1)]'
                  : 'text-gray2 hover:text-teal border-transparent hover:bg-[rgba(0,201,167,0.05)]'
              }`}
            >
              <Package size={18} /> My Dashboard
            </Link>
          );
        }
        if (role === 'admin' || role === 'sub_admin') {
          return (
            <Link
              to="/admin"
              onClick={() => onSelectCategory({ path: '/admin' })}
              className={`mt-4 flex w-full items-center gap-3 border-l-4 px-4 py-3 text-[0.85rem] lg:text-[0.875rem] tracking-[0.04em] no-underline transition-colors ${
                location.pathname === '/admin'
                  ? 'border-teal text-teal bg-[rgba(0,201,167,0.1)]'
                  : 'text-gray2 hover:text-teal border-transparent hover:bg-[rgba(0,201,167,0.05)]'
              }`}
            >
              <Smartphone size={18} /> Admin Portal
            </Link>
          );
        }
        if (role === 'merchant') {
          return (
            <Link
              to="/merchant"
              onClick={() => onSelectCategory({ path: '/merchant' })}
              className={`mt-4 flex w-full items-center gap-3 border-l-4 px-4 py-3 text-[0.85rem] lg:text-[0.875rem] tracking-[0.04em] no-underline transition-colors ${
                location.pathname === '/merchant'
                  ? 'border-teal text-teal bg-[rgba(0,201,167,0.1)]'
                  : 'text-gray2 hover:text-teal border-transparent hover:bg-[rgba(0,201,167,0.05)]'
              }`}
            >
              <ShoppingBag size={18} /> Merchant Portal
            </Link>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default Sidebar;

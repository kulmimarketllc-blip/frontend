import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../../services/authService';

const DashboardSidebar = ({ navSections, mobileOpen, onSelectItem }) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`scrollbar-hide fixed top-14 bottom-0 left-0 z-50 w-57.5 overflow-y-auto border-r border-white/[0.07] bg-[#0D1626] transition-transform duration-300 min-[700px]:static min-[700px]:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {navSections.map((section) => (
        <div key={section.label} className="px-3 pt-4 pb-2">
          <div className="text-gray mb-1.5 px-2 text-[0.6rem] font-medium tracking-[0.18em] uppercase">
            {section.label}
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.to}
                end
                onClick={onSelectItem}
                className={({ isActive }) =>
                  `mb-0.5 flex items-center gap-2.5 rounded px-3 py-2 text-[0.82rem] lg:text-[0.875rem] no-underline transition-all ${
                    isActive
                      ? 'bg-teal/10 text-teal'
                      : 'text-gray bg-transparent hover:bg-white/4 hover:text-white'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                {item.label}
                {item.badge ? (
                  <span
                    className={`ml-auto rounded-full px-1.5 py-0 text-[0.6rem] font-bold ${item.badgeColor || 'bg-red text-white'}`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      ))}

      <div className="mt-auto border-t border-white/[0.07] p-3">
        <button
          type="button"
          onClick={async () => {
            try {
              await logout();
            } catch (err) {
              console.error('Logout failed:', err);
            } finally {
              window.dispatchEvent(new Event('kulmi:auth-updated'));
              navigate('/auth/login');
            }
          }}
          className="text-red hover:bg-red/10 flex w-full cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-left text-[0.82rem] transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

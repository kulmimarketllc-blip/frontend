import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import NotificationDropdown from '../../components/ui/NotificationDropdown';
import Logo from '../../components/Logo';

const DashboardHeader = ({ panelLabel, mobileOpen, onToggleMobileMenu, actionButtons = [], user }) => {
  const navigate = useNavigate();

  return (
    <header className="z-50 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[rgba(10,15,30,0.98)] px-4 min-[700px]:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-gray hover:bg-teal/10 hover:text-teal rounded p-1.5 transition-colors min-[700px]:hidden"
          title="Toggle menu"
          onClick={onToggleMobileMenu}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-1">
          <Logo className="h-8" textClassName="text-white text-sm" />
          <sub className="text-gray ml-1 align-middle text-[0.52rem] font-normal tracking-[0.14em] uppercase">
            {panelLabel}
          </sub>
        </div>
      </div>

      <div className="flex items-center gap-2 min-[700px]:gap-3">
        {actionButtons.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              type="button"
              onClick={() => action.onClick?.(navigate)}
              className="text-gray hover:bg-teal/10 hover:text-teal relative rounded p-1.5 transition-colors"
              title={action.title}
            >
              <Icon size={18} />
              {action.dot ? <span className="bg-red absolute top-1 right-1 h-2 w-2 rounded-full" /> : null}
            </button>
          );
        })}

        <NotificationDropdown />

        <div className="flex items-center gap-2.5 ml-2">
          <div className="from-teal text-navy flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br to-blue-500 text-[0.8rem] font-bold">
            {user.initials}
          </div>
          <div className="hidden flex-col min-[700px]:flex">
            <span className="text-[0.78rem] font-medium text-white">{user.name}</span>
            <span className="text-teal text-[0.65rem]">{user.subtitle}</span>
          </div>
        </div>
      </div>
    </header>
  );
};


export default DashboardHeader;

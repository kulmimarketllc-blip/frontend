import React from 'react';

/**
 * DashboardStats - Reusable stats card grid for all dashboards (Admin, Merchant, User)
 * @param {Array} stats - Array of stat objects with: icon, label, val, bg/iconBg, trend (optional), up (optional)
 * @returns {JSX}
 */
const DashboardStats = ({ stats = [] }) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 min-[580px]:grid-cols-2 min-[1100px]:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        const bgClass = s.iconBg || s.bg;
        return (
          <div
            key={s.label}
            className="bg-card hover:border-teal/20 rounded-md border border-white/[0.07] p-5 transition-colors"
          >
            <div
              className={`mb-3 flex items-start ${s.trend ? 'justify-between' : 'justify-start'}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${bgClass}`}>
                <Icon size={20} className="text-teal" />
              </div>
              {s.trend && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.72rem] font-medium ${
                    s.up ? 'bg-green-500/10 text-green-500' : 'bg-red/10 text-red'
                  }`}
                >
                  {s.trend}
                </span>
              )}
            </div>
            <div className="font-['Syne'] text-[1.7rem] font-extrabold text-white">{s.val}</div>
            <div className="text-gray mt-1 text-[0.875rem]">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;

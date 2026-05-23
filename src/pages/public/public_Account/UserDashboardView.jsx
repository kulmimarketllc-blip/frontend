import React from 'react';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  Star,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboardView = () => {
  const stats = [
    { label: 'Orders', value: '14', icon: Package, bg: 'bg-teal/10', color: 'text-teal' },
    { label: 'Wishlist', value: '28', icon: Heart, bg: 'bg-red/10', color: 'text-red' },
    {
      label: 'Addresses',
      value: '3',
      icon: MapPin,
      bg: 'bg-purple-500/10',
      color: 'text-purple-500',
    },
    { label: 'Cards', value: '2', icon: CreditCard, bg: 'bg-yellow/10', color: 'text-yellow' },
  ];

  const recentOrders = [
    {
      id: '#ESQ-00847',
      date: 'Mar 12, 2026',
      total: '$392.95',
      status: 'Delivered',
      sc: 'bg-green-500/10 text-green-500',
    },
    {
      id: '#ESQ-00812',
      date: 'Feb 28, 2026',
      total: '$124.50',
      status: 'Processing',
      sc: 'bg-blue-500/10 text-blue-500',
    },
    {
      id: '#ESQ-00756',
      date: 'Feb 15, 2026',
      total: '$89.00',
      status: 'Shipped',
      sc: 'bg-yellow/10 text-yellow',
    },
  ];

  const menuItems = [
    { label: 'Personal Information', sub: 'Update your profile and contact details', icon: User },
    { label: 'Order History', sub: 'Track and manage your orders', icon: ShoppingBag },
    { label: 'Saved Addresses', sub: 'Manage your primary shipping addresses', icon: MapPin },
    { label: 'Payment Methods', sub: 'Manage your cards and wallets', icon: CreditCard },
    { label: 'Reviews & Ratings', sub: 'Check your feedback to merchants', icon: Star },
  ];

  return (
    <div className="container mx-auto animate-[fadeUp_0.4s_ease_both] px-4 py-8 min-[640px]:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="from-teal text-navy flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br to-blue-500 font-['Syne'] text-[1.8rem] font-bold shadow-lg">
            A
          </div>
          <div>
            <h1 className="font-['Syne'] text-[1.5rem] leading-tight font-extrabold text-white">
              Ahmed Mohamed
            </h1>
            <p className="text-gray mt-1 text-[0.88rem]">
              ahmed@email.com · <span className="text-teal font-medium">Verified Member</span>
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="border-red/20 text-red hover:bg-red/5 flex items-center gap-2 rounded-full border px-4 py-2 text-[0.82rem] font-bold transition-all"
        >
          <LogOut size={16} /> Sign Out
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 min-[900px]:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card rounded-md border border-white/[0.07] p-5 transition-transform hover:-translate-y-1"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md ${s.bg} ${s.color} mb-3`}
              >
                <Icon size={22} />
              </div>
              <div className="mb-0.5 text-[1.8rem] font-bold text-white">{s.value}</div>
              <div className="text-gray text-[0.7rem] font-bold tracking-widest uppercase">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 min-[1100px]:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
              <h3 className="flex items-center gap-2 font-['Syne'] text-[1rem] font-bold text-white">
                <Clock size={18} className="text-teal" /> Recent Orders
              </h3>
              <button className="text-teal hover:text-teal2 text-[0.78rem] font-medium">
                See all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
                  <tr className="border-b border-white/[0.07]">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[0.88rem] text-white">
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2"
                    >
                      <td className="text-teal px-6 py-4 font-medium">{o.id}</td>
                      <td className="text-gray2 px-6 py-4">{o.date}</td>
                      <td className="px-6 py-4 font-bold">{o.total}</td>
                      <td className="px-6 py-4 text-[0.78rem] font-bold">
                        <span className={`rounded-full px-2 py-0.5 ${o.sc}`}>{o.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-gray hover:border-teal hover:text-teal rounded border border-white/10 px-3 py-1 text-[0.75rem] font-bold transition-all">
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="flex items-center gap-2 px-2 font-['Syne'] text-[1rem] font-bold text-white">
            <User size={18} className="text-teal" /> Account Menu
          </h3>
          <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className="group flex w-full items-center justify-between border-b border-white/[0.07] px-6 py-4 text-left transition-colors last:border-b-0 hover:bg-white/2"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-navy3/50 text-gray group-hover:text-teal group-hover:bg-teal/5 flex h-10 w-10 items-center justify-center rounded-full transition-all">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="text-[0.92rem] leading-tight font-bold text-white">
                        {item.label}
                      </div>
                      <div className="text-gray mt-0.5 text-[0.75rem]">{item.sub}</div>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray group-hover:text-teal transition-transform group-hover:translate-x-1"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardView;

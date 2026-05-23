import React, { useEffect, useMemo, useState } from 'react';
import { Truck, MapPin, CheckCircle, Clock, Plus } from 'lucide-react';
import DashboardPageHeader from '../components/DashboardPageHeader';
import Pagination from '../components/Pagination';
import DashboardStats from '../../../components/DashboardStats';
import { getAdminDeliveryPartners } from '../../../services/adminService';

const Pill = ({ children, c }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${c}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const statusMeta = (status = '') => {
  const normalized = String(status).toLowerCase();
  if (normalized === 'online') return { label: 'Online', className: 'text-green-500 bg-green-500/10' };
  if (normalized === 'busy') return { label: 'Busy', className: 'text-yellow bg-yellow/10' };
  return { label: 'Offline', className: 'text-gray2 bg-white/10' };
};

const AdminDelivery = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDelivery, setTotalDelivery] = useState(67);
  const itemsPerPage = 10;

  const load = async (nextStatus = status, nextSearch = search, page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getAdminDeliveryPartners({
        page,
        limit: itemsPerPage,
        ...(nextSearch.trim() ? { search: nextSearch.trim() } : {}),
      });
      const all = Array.isArray(payload?.data) ? payload.data : [];
      const filtered = nextStatus ? all.filter((d) => String(d.status) === nextStatus) : all;
      setItems(filtered);
      setTotalDelivery(Number(payload?.meta?.total || 0));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load delivery partners.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const online = items.filter((d) => d.status === 'online').length;
    const busy = items.filter((d) => d.status === 'busy').length;
    const activeDeliveries = items.reduce((sum, d) => sum + Number(d.activeDeliveries || 0), 0);
    const successRate = items.length
      ? Math.round(items.reduce((sum, d) => sum + Number(d.successRate || 0), 0) / items.length)
      : 0;
    return [
      { icon: Truck, bg: 'bg-teal/10', val: String(online + busy), label: 'Active Drivers' },
      { icon: MapPin, bg: 'bg-blue-500/10', val: String(activeDeliveries), label: 'Live Deliveries' },
      { icon: CheckCircle, bg: 'bg-yellow/10', val: `${successRate}%`, label: 'Success Rate' },
      { icon: Clock, bg: 'bg-red/10', val: String(busy), label: 'Busy Drivers' },
    ];
  }, [items]);

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader
          title={<span>Delivery <span className="text-teal">Partners</span></span>}
          subtitle="Manage drivers and active deliveries"
        />
        <button className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-4 py-1.5 text-[0.8rem] font-medium">
          <Plus size={14} /> Add Driver
        </button>
      </div>

      <DashboardStats stats={stats} />
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="bg-card overflow-hidden rounded-md border border-white/[0.07]">
        <div className="border-b border-white/[0.07] px-5 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-['Syne'] text-[1rem] font-bold text-white">All Delivery Partners</h3>
            <div className="flex min-[400px]:flex-row flex-col gap-2 w-full lg:w-auto lg:ml-auto">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') load(status, search);
                }}
                className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 py-1.5 text-[0.78rem] text-white outline-none w-full lg:w-auto"
                placeholder="Search drivers..."
              />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  load(e.target.value, search);
                }}
                className="bg-navy3 text-gray2 rounded border border-white/[0.07] px-2 py-1.5 text-[0.78rem] outline-none w-full lg:w-auto"
              >
                <option value="">All Status</option>
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-navy3">
                {['Driver', 'Phone', 'Deliveries', 'Active', 'Success', 'Earnings', 'Status'].map((h) => (
                  <th key={h} className="text-gray px-4 py-2.5 text-left text-[0.7rem] font-semibold tracking-widest whitespace-nowrap uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-gray2 px-4 py-3 text-sm">Loading drivers...</td></tr>}
              {!loading && !items.length && <tr><td colSpan={7} className="text-gray2 px-4 py-3 text-sm">No delivery partners found.</td></tr>}
              {!loading && items.map((d) => {
                const s = statusMeta(d.status);
                return (
                  <tr key={d.id} className="border-b border-white/[0.07] last:border-b-0 hover:bg-white/2">
                    <td className="px-4 py-3 text-[0.82rem] font-semibold text-white">{d.fullName}</td>
                    <td className="text-gray px-4 py-3 text-[0.82rem]">{d.phone || '-'}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(d.totalDeliveries || 0)}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(d.activeDeliveries || 0)}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(d.successRate || 0)}%</td>
                    <td className="text-teal px-4 py-3 text-[0.82rem] font-medium">${Number(d.earnings || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><Pill c={s.className}>{s.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {loading && <div className="text-sm text-gray2">Loading drivers...</div>}
          {!loading && !items.length && <div className="text-sm text-gray2">No delivery partners found.</div>}
          {!loading && items.map((d) => {
            const s = statusMeta(d.status);
            return (
              <div key={d.id} className="bg-navy3 rounded-md border border-white/[0.07] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-[0.82rem] font-semibold text-white">{d.fullName}</div>
                  <Pill c={s.className}>{s.label}</Pill>
                </div>
                <div className="space-y-1 text-[0.875rem]">
                  <div className="text-gray">Phone: <span className="text-white">{d.phone || '-'}</span></div>
                  <div className="text-gray">Deliveries: <span className="text-white">{Number(d.totalDeliveries || 0)}</span></div>
                  <div className="text-gray">Active: <span className="text-white">{Number(d.activeDeliveries || 0)}</span></div>
                  <div className="text-gray">Success: <span className="text-white">{Number(d.successRate || 0)}%</span></div>
                  <div className="text-gray">Earnings: <span className="text-teal font-medium">${Number(d.earnings || 0).toFixed(2)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalItems={totalDelivery}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => load(status, search, page)}
        loading={loading}
      />
    </div>
  );
};

export default AdminDelivery;

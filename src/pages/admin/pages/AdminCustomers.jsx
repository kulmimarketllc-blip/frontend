import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, Star, Moon, Download } from 'lucide-react';
import DashboardPageHeader from '../components/DashboardPageHeader';
import Pagination from '../components/Pagination';
import DashboardStats from '../../../components/DashboardStats';
import { getAdminCustomers } from '../../../services/adminService';
import { downloadCsv } from '../../../utils/csvExport';

const Pill = ({ children, c }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${c}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const AdminCustomers = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(156);
  const itemsPerPage = 10;

  const load = async (nextStatus = status, nextSearch = search, page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getAdminCustomers({
        page,
        limit: itemsPerPage,
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(nextSearch.trim() ? { search: nextSearch.trim() } : {}),
      });
      setItems(Array.isArray(payload?.data) ? payload.data : []);
      setTotalCustomers(Number(payload?.meta?.total || 0));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load customers.');
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
    const total = items.length;
    const active = items.filter((c) => c.isActive).length;
    const verified = items.filter((c) => c.isVerified).length;
    const spent = items.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
    return [
      { icon: Users, bg: 'bg-teal/10', val: total.toLocaleString(), label: 'Total Customers', trend: `${active} active`, up: true },
      { icon: UserPlus, bg: 'bg-blue-500/10', val: active.toLocaleString(), label: 'Active Customers', trend: `${total - active} inactive`, up: true },
      { icon: Star, bg: 'bg-yellow/10', val: verified.toLocaleString(), label: 'Verified Accounts', trend: `${Math.round((verified / Math.max(total, 1)) * 100)}%`, up: true },
      { icon: Moon, bg: 'bg-red/10', val: `$${spent.toFixed(2)}`, label: 'Total Spend', trend: 'Lifetime', up: true },
    ];
  }, [items]);

  const exportCustomers = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Status', 'Verified', 'Orders', 'Total Spent', 'Joined At', 'Last Order At'];
    const rows = items.map((c) => [
      c.fullName || '',
      c.email || '',
      c.phone || '',
      c.isActive ? 'Active' : 'Inactive',
      c.isVerified ? 'Yes' : 'No',
      Number(c.ordersCount || 0),
      Number(c.totalSpent || 0).toFixed(2),
      c.joinedAt ? new Date(c.joinedAt).toISOString() : '',
      c.lastOrderAt ? new Date(c.lastOrderAt).toISOString() : '',
    ]);

    downloadCsv({
      fileName: `admin-customers-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    });
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader
          title={<span>Customer <span className="text-teal">Management</span></span>}
          subtitle="View and manage all registered customers"
        />
        <button onClick={exportCustomers} className="text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border border-white/[0.07] px-4 py-1.5 text-[0.8rem]">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <DashboardStats stats={stats} />
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="bg-card overflow-hidden rounded-md border border-white/[0.07]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">All Customers</h3>
          <div className="flex min-[400px]:flex-row flex-col gap-2 w-full lg:w-auto lg:ml-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') load(status, search);
              }}
              className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 py-1.5 text-[0.78rem] text-white outline-none w-full lg:w-auto"
              placeholder="Search customers..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-navy3">
                {['Customer', 'Email', 'Orders', 'Spent', 'Joined', 'Status'].map((h) => (
                  <th key={h} className="text-gray px-4 py-2.5 text-left text-[0.7rem] font-semibold tracking-widest whitespace-nowrap uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="text-gray2 px-4 py-3 text-sm">Loading customers...</td></tr>}
              {!loading && !items.length && <tr><td colSpan={6} className="text-gray2 px-4 py-3 text-sm">No customers found.</td></tr>}
              {!loading && items.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.07] last:border-b-0 hover:bg-white/2">
                  <td className="px-4 py-3 text-[0.82rem] text-white">{c.fullName}</td>
                  <td className="text-gray px-4 py-3 text-[0.82rem]">{c.email}</td>
                  <td className="px-4 py-3 text-[0.82rem] text-white">{Number(c.ordersCount || 0)}</td>
                  <td className="text-teal px-4 py-3 text-[0.82rem] font-medium">${Number(c.totalSpent || 0).toFixed(2)}</td>
                  <td className="text-gray px-4 py-3 text-[0.82rem]">{new Date(c.joinedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <Pill c="text-green-500 bg-green-500/10">Active</Pill>
                    ) : (
                      <Pill c="text-red bg-red/10">Inactive</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {loading && <div className="text-sm text-gray2">Loading customers...</div>}
          {!loading && !items.length && <div className="text-sm text-gray2">No customers found.</div>}
          {!loading && items.map((c) => (
            <div key={c.id} className="bg-navy3 rounded-md border border-white/[0.07] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[0.82rem] font-medium text-white">{c.fullName}</span>
                {c.isActive ? <Pill c="text-green-500 bg-green-500/10">Active</Pill> : <Pill c="text-red bg-red/10">Inactive</Pill>}
              </div>
              <div className="space-y-1 text-[0.875rem]">
                <div className="text-gray">{c.email}</div>
                <div className="text-gray">Orders: <span className="text-white">{Number(c.ordersCount || 0)}</span></div>
                <div className="text-gray">Spent: <span className="text-teal font-medium">${Number(c.totalSpent || 0).toFixed(2)}</span></div>
                <div className="text-gray">Joined: <span className="text-white">{new Date(c.joinedAt).toLocaleDateString()}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalItems={totalCustomers}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => load(status, search, page)}
        loading={loading}
      />
    </div>
  );
};

export default AdminCustomers;

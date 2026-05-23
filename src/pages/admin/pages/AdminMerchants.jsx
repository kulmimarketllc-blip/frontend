import React, { useEffect, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import DashboardPageHeader from '../components/DashboardPageHeader';
import Pagination from '../components/Pagination';
import { getAdminMerchants } from '../../../services/adminService';
import { downloadCsv } from '../../../utils/csvExport';

const Pill = ({ children, c }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${c}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const merchantStatusMeta = (status = '') => {
  const normalized = String(status).toLowerCase();
  if (normalized === 'approved') return { label: 'Approved', className: 'text-green-500 bg-green-500/10' };
  if (normalized === 'pending') return { label: 'Pending', className: 'text-yellow bg-yellow/10' };
  if (normalized === 'suspended') return { label: 'Suspended', className: 'text-red bg-red/10' };
  if (normalized === 'rejected') return { label: 'Rejected', className: 'text-red bg-red/10' };
  return { label: status || 'Unknown', className: 'text-gray2 bg-white/10' };
};

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Rejected', value: 'rejected' },
];

const AdminMerchants = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMerchants, setTotalMerchants] = useState(34);
  const itemsPerPage = 10;

  const load = async (nextStatus = status, nextSearch = search, page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getAdminMerchants({
        page,
        limit: itemsPerPage,
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(nextSearch.trim() ? { search: nextSearch.trim() } : {}),
      });
      setItems(Array.isArray(payload?.data) ? payload.data : []);
      setTotalMerchants(Number(payload?.meta?.total || 0));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load merchants.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = useMemo(() => items.filter((m) => String(m.status) === 'pending'), [items]);
  const active = useMemo(() => items.filter((m) => String(m.status) !== 'pending'), [items]);

  const exportMerchants = () => {
    const headers = ['Store', 'Owner', 'Owner Email', 'Status', 'Products', 'Orders', 'Revenue', 'Commission', 'Rating', 'Created At'];
    const rows = items.map((m) => [
      m.storeName || '',
      m.ownerName || '',
      m.ownerEmail || '',
      merchantStatusMeta(m.status).label,
      Number(m.productsCount || 0),
      Number(m.ordersCount || 0),
      Number(m.revenue || 0).toFixed(2),
      Number(m.commission || 0).toFixed(2),
      Number(m.avgRating || 0).toFixed(1),
      m.createdAt ? new Date(m.createdAt).toISOString() : '',
    ]);

    downloadCsv({
      fileName: `admin-merchants-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    });
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader
          title={<span>Merchant <span className="text-teal">Management</span></span>}
          subtitle="Approve, manage and monitor all sellers"
        />
        <div className="flex gap-3">
          <button onClick={exportMerchants} className="text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border border-white/[0.07] px-4 py-1.5 text-[0.8rem]">
            <Download size={14} /> Export
          </button>
          <button className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-4 py-1.5 text-[0.8rem] font-medium">
            <Plus size={14} /> Add Merchant
          </button>
        </div>
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setStatus(f.value);
              load(f.value, search);
            }}
            className={`rounded px-3 py-1.5 text-[0.75rem] font-medium transition-all ${
              status === f.value
                ? 'bg-teal text-navy'
                : 'text-gray2 hover:border-teal hover:text-teal border border-white/[0.07]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border-yellow/30 bg-card mb-4 overflow-hidden rounded-md border">
        <div className="border-b border-white/[0.07] px-5 py-3.5">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">Pending Approvals ({pending.length})</h3>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {loading && <div className="text-sm text-gray2">Loading merchants...</div>}
          {!loading && !pending.length && <div className="text-sm text-gray2">No pending merchants.</div>}
          {!loading && pending.map((m) => {
            const s = merchantStatusMeta(m.status);
            return (
              <div key={m.id} className="bg-navy3 rounded-md border border-white/[0.07] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-[1rem] font-semibold text-white">{m.storeName}</div>
                  <Pill c={s.className}>{s.label}</Pill>
                </div>
                <div className="space-y-1 text-[0.875rem]">
                  <div className="text-gray">Owner: <span className="text-white">{m.ownerName}</span></div>
                  <div className="text-gray">Email: <span className="text-white">{m.ownerEmail || '-'}</span></div>
                  <div className="text-gray">Applied: <span className="text-white">{new Date(m.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-navy3">
                {['Business', 'Owner', 'Email', 'Applied', 'Status'].map((h) => (
                  <th key={h} className="text-gray px-4 py-2.5 text-left text-[0.7rem] font-semibold tracking-widest whitespace-nowrap uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-gray2 px-4 py-3 text-sm">Loading merchants...</td></tr>
              )}
              {!loading && !pending.length && (
                <tr><td colSpan={5} className="text-gray2 px-4 py-3 text-sm">No pending merchants.</td></tr>
              )}
              {!loading && pending.map((m) => {
                const s = merchantStatusMeta(m.status);
                return (
                  <tr key={m.id} className="border-b border-white/[0.07] last:border-b-0">
                    <td className="px-4 py-3 text-[0.82rem] font-semibold text-white">{m.storeName}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{m.ownerName}</td>
                    <td className="text-gray px-4 py-3 text-[0.82rem]">{m.ownerEmail || '-'}</td>
                    <td className="text-gray px-4 py-3 text-[0.82rem]">{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Pill c={s.className}>{s.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card overflow-hidden rounded-md border border-white/[0.07]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">Merchant Performance ({active.length})</h3>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') load(status, search);
              }}
              className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 py-1.5 text-[0.78rem] text-white outline-none w-full"
              placeholder="Search merchants..."
            />
          </div>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-navy3">
                {['Merchant', 'Owner', 'Products', 'Orders', 'Revenue', 'Commission', 'Rating', 'Status'].map((h) => (
                  <th key={h} className="text-gray px-4 py-2.5 text-left text-[0.7rem] font-semibold tracking-widest whitespace-nowrap uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="text-gray2 px-4 py-3 text-sm">Loading merchants...</td></tr>}
              {!loading && !active.length && <tr><td colSpan={8} className="text-gray2 px-4 py-3 text-sm">No merchants found.</td></tr>}
              {!loading && active.map((m) => {
                const s = merchantStatusMeta(m.status);
                return (
                  <tr key={m.id} className="border-b border-white/[0.07] last:border-b-0 hover:bg-white/2">
                    <td className="px-4 py-3 text-[0.82rem] font-semibold text-white">{m.storeName}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{m.ownerName}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(m.productsCount || 0)}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(m.ordersCount || 0)}</td>
                    <td className="text-teal px-4 py-3 text-[0.82rem] font-medium">${Number(m.revenue || 0).toFixed(2)}</td>
                    <td className="text-gray px-4 py-3 text-[0.82rem]">${Number(m.commission || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(m.avgRating || 0).toFixed(1)}</td>
                    <td className="px-4 py-3"><Pill c={s.className}>{s.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalItems={totalMerchants}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => load(status, search, page)}
        loading={loading}
      />
    </div>
  );
};

export default AdminMerchants;

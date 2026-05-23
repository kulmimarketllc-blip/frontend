import React, { useEffect, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import DashboardPageHeader from '../components/DashboardPageHeader';
import Pagination from '../components/Pagination';
import { getAdminOrderCounts, getAdminOrders } from '../../../services/adminService';
import { downloadCsv } from '../../../utils/csvExport';

const statusMeta = (status = '') => {
  const normalized = String(status).toLowerCase();
  if (normalized === 'delivered') return { label: 'Delivered', className: 'text-green-500 bg-green-500/10' };
  if (normalized === 'in_transit') return { label: 'In Transit', className: 'text-yellow bg-yellow/10' };
  if (normalized === 'processing') return { label: 'Processing', className: 'text-blue-500 bg-blue-500/10' };
  if (normalized === 'confirmed') return { label: 'Confirmed', className: 'text-blue-500 bg-blue-500/10' };
  if (normalized === 'pending_payment') return { label: 'Pending Payment', className: 'text-yellow bg-yellow/10' };
  if (normalized === 'cancelled') return { label: 'Cancelled', className: 'text-red bg-red/10' };
  return {
    label: normalized
      .split('_')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' '),
    className: 'text-gray2 bg-white/10',
  };
};

const paymentMeta = (status = '') => {
  const normalized = String(status).toLowerCase();
  if (normalized === 'pending_payment') return { label: 'Pending', className: 'text-yellow bg-yellow/10' };
  if (normalized === 'cancelled' || normalized === 'refunded') {
    return { label: 'Failed/Refunded', className: 'text-red bg-red/10' };
  }
  return { label: 'Paid', className: 'text-green-500 bg-green-500/10' };
};

const Pill = ({ children, className }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${className}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending_payment' },
  { label: 'Processing', value: 'processing' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Returns', value: 'return_requested' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({});
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [countsLoading, setCountsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(47);
  const itemsPerPage = 10;

  const loadCounts = async () => {
    try {
      setCountsLoading(true);
      const payload = await getAdminOrderCounts();
      setOrderCounts(payload || {});
    } catch {
      setOrderCounts({});
    } finally {
      setCountsLoading(false);
    }
  };

  const load = async (nextStatus = status, nextSearch = search, page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getAdminOrders({
        page,
        limit: itemsPerPage,
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(nextSearch.trim() ? { search: nextSearch.trim() } : {}),
      });
      setOrders(Array.isArray(payload?.data) ? payload.data : []);
      setTotalOrders(Number(payload?.meta?.total || 0));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
    load('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportOrders = () => {
    const headers = ['Order ID', 'Customer', 'Customer Email', 'Merchant', 'Items', 'Total', 'Payment', 'Status', 'Created At'];
    const rows = orders.map((o) => {
      const customerName = `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() || o.customer?.email || '-';
      const merchantLabel = o.items?.[0]?.merchantId || '-';
      const payment = paymentMeta(o.status).label;
      const statusLabel = statusMeta(o.status).label;
      return [
        o.id || '',
        customerName,
        o.customer?.email || '',
        merchantLabel,
        Number(o.items?.length || 0),
        Number(o.total || 0).toFixed(2),
        payment,
        statusLabel,
        o.createdAt ? new Date(o.createdAt).toISOString() : '',
      ];
    });

    downloadCsv({
      fileName: `admin-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
    });
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader
          title={<span>Order <span className="text-teal">Management</span></span>}
          subtitle="Monitor and manage all orders across merchants"
        />
        <div className="flex gap-3">
          <button onClick={exportOrders} className="text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border border-white/[0.07] px-4 py-1.5 text-[0.8rem] transition-colors">
            <Download size={14} /> Export
          </button>
          <button className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-4 py-1.5 text-[0.8rem] font-medium">
            <Plus size={14} /> Manual Order
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const key = f.value || 'all';
          return (
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
              {f.label} ({countsLoading ? '...' : Number(orderCounts[key] || 0).toLocaleString()})
            </button>
          );
        })}
      </div>

      <div className="bg-card overflow-hidden rounded-md border border-white/[0.07]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-3.5">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">All Orders</h3>
          <div className="flex w-full flex-col gap-2 md:flex-row lg:ml-auto lg:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') load(status, search);
              }}
              className="bg-navy3 placeholder:text-gray focus:border-teal w-full rounded border border-white/[0.07] px-3 py-1.5 text-[0.78rem] text-white outline-none lg:w-auto"
              placeholder="Search orders..."
            />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                load(e.target.value, search);
              }}
              className="bg-navy3 text-gray2 w-full rounded border border-white/[0.07] px-2 py-1.5 text-[0.78rem] outline-none lg:w-auto"
            >
              {FILTERS.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {loading && <div className="text-sm text-gray2">Loading orders...</div>}
          {!loading && !orders.length && <div className="text-sm text-gray2">No orders found.</div>}
          {!loading &&
            orders.map((o) => {
              const s = statusMeta(o.status);
              const p = paymentMeta(o.status);
              const merchantLabel = o.items?.[0]?.merchantId || '-';
              return (
                <div key={o.id} className="bg-navy3 rounded-md border border-white/[0.07] p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-teal text-[0.82rem] font-medium">#{o.id}</div>
                    <Pill className={s.className}>{s.label}</Pill>
                  </div>
                  <div className="space-y-1 text-[0.875rem]">
                    <div className="text-gray">
                      Customer:{' '}
                      <span className="text-white">
                        {`${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() ||
                          o.customer?.email ||
                          '-'}
                      </span>
                    </div>
                    <div className="text-gray">
                      Merchant: <span className="text-white">{merchantLabel}</span>
                    </div>
                    <div className="text-gray">
                      Items: <span className="text-white">{o.items?.length || 0} items</span>
                    </div>
                    <div className="text-gray">
                      Total: <span className="text-white font-semibold">${Number(o.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="text-gray">
                      Payment: <Pill className={p.className}>{p.label}</Pill>
                    </div>
                    <div className="text-gray">
                      Date: <span className="text-white">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-navy3">
                {['', 'Order ID', 'Customer', 'Merchant', 'Items', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="text-gray whitespace-nowrap px-4 py-2.5 text-left text-[0.7rem] font-semibold tracking-widest uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-gray2 px-4 py-3 text-sm">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!loading && !orders.length && (
                <tr>
                  <td colSpan={9} className="text-gray2 px-4 py-3 text-sm">
                    No orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((o) => {
                  const s = statusMeta(o.status);
                  const p = paymentMeta(o.status);
                  const merchantLabel = o.items?.[0]?.merchantId || '-';
                  return (
                    <tr key={o.id} className="last:border-b-0 hover:bg-white/2 border-b border-white/[0.07]">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="accent-teal" />
                      </td>
                      <td className="text-teal px-4 py-3 text-[0.82rem] font-medium">#{o.id}</td>
                      <td className="px-4 py-3 text-[0.82rem] text-white">
                        {`${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() ||
                          o.customer?.email ||
                          '-'}
                      </td>
                      <td className="px-4 py-3 text-[0.82rem] text-white">{merchantLabel}</td>
                      <td className="text-gray px-4 py-3 text-[0.82rem]">{o.items?.length || 0} items</td>
                      <td className="px-4 py-3 text-[0.82rem] font-semibold text-white">
                        ${Number(o.total || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <Pill className={p.className}>{p.label}</Pill>
                      </td>
                      <td className="px-4 py-3">
                        <Pill className={s.className}>{s.label}</Pill>
                      </td>
                      <td className="text-gray px-4 py-3 text-[0.82rem]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalItems={totalOrders}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => load(status, search, page)}
        loading={loading}
      />
    </div>
  );
};

export default AdminOrders;

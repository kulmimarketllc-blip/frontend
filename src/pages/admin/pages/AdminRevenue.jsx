import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, RefreshCw, Download } from 'lucide-react';
import DashboardPageHeader from '../components/DashboardPageHeader';
import DashboardStats from '../../../components/DashboardStats';
import { getAdminRevenue } from '../../../services/adminService';
import { downloadCsv } from '../../../utils/csvExport';

const Pill = ({ children, c }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${c}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const AdminRevenue = () => {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (nextPeriod = period) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getAdminRevenue(nextPeriod);
      setData(payload || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load revenue analytics.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('month');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = data?.totals || {};
  const refunds = data?.refunds || {};
  const rows = Array.isArray(data?.byMerchant) ? data.byMerchant : [];

  const stats = useMemo(() => [
    {
      icon: DollarSign,
      bg: 'bg-teal/10',
      val: `$${Number(totals.gross_revenue || 0).toFixed(2)}`,
      label: 'Gross Revenue',
      trend: period,
      up: true,
    },
    {
      icon: TrendingUp,
      bg: 'bg-blue-500/10',
      val: `$${Number(totals.platform_commission || 0).toFixed(2)}`,
      label: 'Platform Commission',
      trend: period,
      up: true,
    },
    {
      icon: CreditCard,
      bg: 'bg-yellow/10',
      val: `$${Number(totals.merchant_payouts || 0).toFixed(2)}`,
      label: 'Merchant Payouts',
      trend: `${Number(totals.orders || 0)} orders`,
      up: true,
    },
    {
      icon: RefreshCw,
      bg: 'bg-red/10',
      val: `$${Number(refunds.amount || 0).toFixed(2)}`,
      label: 'Refunds Issued',
      trend: `${Number(refunds.count || 0)} refunds`,
      up: false,
    },
  ], [period, refunds.amount, refunds.count, totals.gross_revenue, totals.merchant_payouts, totals.orders, totals.platform_commission]);

  const exportRevenue = () => {
    const summaryHeaders = ['Period', 'Gross Revenue', 'Platform Commission', 'Merchant Payouts', 'Orders', 'Refund Count', 'Refund Amount'];
    const summaryRows = [[
      period,
      Number(totals.gross_revenue || 0).toFixed(2),
      Number(totals.platform_commission || 0).toFixed(2),
      Number(totals.merchant_payouts || 0).toFixed(2),
      Number(totals.orders || 0),
      Number(refunds.count || 0),
      Number(refunds.amount || 0).toFixed(2),
    ]];

    const merchantHeaders = ['Merchant', 'Gross Sales', 'Commission', 'Orders', 'Status'];
    const merchantRows = rows.map((r) => {
      const isPending = Number(r.orders || 0) > 0 && Number(r.revenue || 0) > Number(r.commission || 0);
      return [
        r.store_name || '',
        Number(r.revenue || 0).toFixed(2),
        Number(r.commission || 0).toFixed(2),
        Number(r.orders || 0),
        isPending ? 'Pending' : 'Settled',
      ];
    });

    downloadCsv({
      fileName: `admin-revenue-${period}-${new Date().toISOString().slice(0, 10)}.csv`,
      headers: summaryHeaders,
      rows: [...summaryRows, [], merchantHeaders, ...merchantRows],
    });
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader
          title={<span>Revenue <span className="text-teal">Analytics</span></span>}
          subtitle="Track earnings, commissions, and payouts"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              load(e.target.value);
            }}
            className="bg-navy3 text-gray2 rounded border border-white/[0.07] px-2 py-1.5 text-[0.78rem] outline-none"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
          <button onClick={exportRevenue} className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-4 py-1.5 text-[0.8rem] font-medium">
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      <DashboardStats stats={stats} />
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="bg-card overflow-hidden rounded-md border border-white/[0.07]">
        <div className="border-b border-white/[0.07] px-5 py-3.5">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">Revenue by Merchant</h3>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {loading && <div className="text-sm text-gray2">Loading revenue data...</div>}
          {!loading && !rows.length && <div className="text-sm text-gray2">No revenue records found.</div>}
          {!loading && rows.map((r) => {
            const isPending = Number(r.orders || 0) > 0 && Number(r.revenue || 0) > Number(r.commission || 0);
            return (
              <div key={r.merchant_id} className="bg-navy3 rounded-md border border-white/[0.07] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-[0.875rem] font-semibold text-white">{r.store_name}</div>
                  <Pill c={isPending ? 'text-yellow bg-yellow/10' : 'text-green-500 bg-green-500/10'}>
                    {isPending ? 'Pending' : 'Settled'}
                  </Pill>
                </div>
                <div className="space-y-1 text-[0.875rem]">
                  <div className="text-gray">Gross Sales: <span className="text-white">${Number(r.revenue || 0).toFixed(2)}</span></div>
                  <div className="text-gray">Commission: <span className="text-teal font-medium">${Number(r.commission || 0).toFixed(2)}</span></div>
                  <div className="text-gray">Orders: <span className="text-white">{Number(r.orders || 0)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-navy3">
                {['Merchant', 'Gross Sales', 'Commission $', 'Orders', 'Status'].map((h) => (
                  <th key={h} className="text-gray px-4 py-2.5 text-left text-[0.7rem] font-semibold tracking-widest whitespace-nowrap uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-gray2 px-4 py-3 text-sm">Loading revenue data...</td></tr>
              )}
              {!loading && !rows.length && (
                <tr><td colSpan={5} className="text-gray2 px-4 py-3 text-sm">No revenue records found.</td></tr>
              )}
              {!loading && rows.map((r) => {
                const isPending = Number(r.orders || 0) > 0 && Number(r.revenue || 0) > Number(r.commission || 0);
                return (
                  <tr key={r.merchant_id} className="border-b border-white/[0.07] last:border-b-0 hover:bg-white/2">
                    <td className="px-4 py-3 text-[0.82rem] font-semibold text-white">{r.store_name}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">${Number(r.revenue || 0).toFixed(2)}</td>
                    <td className="text-teal px-4 py-3 text-[0.82rem] font-medium">${Number(r.commission || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(r.orders || 0)}</td>
                    <td className="px-4 py-3">
                      <Pill c={isPending ? 'text-yellow bg-yellow/10' : 'text-green-500 bg-green-500/10'}>
                        {isPending ? 'Pending' : 'Settled'}
                      </Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;

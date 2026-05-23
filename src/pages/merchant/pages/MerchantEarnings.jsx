import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import MerchantPill from '../components/MerchantPill';
import { getMyMerchantEarnings } from '../../../services/merchantService';

const Pill = ({ children, c }) => (
  <MerchantPill className={c}>{children}</MerchantPill>
);

const periodOptions = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'year', label: 'Last 365 Days' },
];

const MerchantEarnings = ({ onNav }) => {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (currentPeriod = period) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getMyMerchantEarnings(currentPeriod);
      // TEMP DEBUG: inspect earnings payload shape from API
      console.debug('[MerchantEarnings] earnings payload', {
        period: currentPeriod,
        payload,
      });
      setData(payload || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load earnings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
  }, [period]);

  const summary = data?.summary || {};
  const bars = useMemo(() => {
    const chartMaxPx = 120;
    const points = Array.isArray(data?.dailyBreakdown) ? data.dailyBreakdown : [];
    // TEMP DEBUG: inspect incoming earnings trend points
    console.debug('[MerchantEarnings] trend source', {
      pointsCount: points.length,
      points,
    });
    if (!points.length) return [];

    const max = Math.max(...points.map((x) => Number(x.earnings || 0)), 1);
    return points.slice(-10).map((item) => {
      const value = Number(item.earnings || 0);
      const date = new Date(item.date);
      return {
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        height: `${Math.max(10, (value / max) * chartMaxPx)}px`,
        value,
      };
    });
  }, [data?.dailyBreakdown]);

  useEffect(() => {
    // TEMP DEBUG: final computed chart bars for earnings page
    console.debug('[MerchantEarnings] trend bars', {
      count: bars.length,
      bars,
    });
  }, [bars]);

  const rows = useMemo(() => {
    const points = Array.isArray(data?.dailyBreakdown) ? data.dailyBreakdown : [];
    return points
      .slice()
      .reverse()
      .slice(0, 12)
      .map((item) => {
        const net = Number(item.earnings || 0);
        const gross = net / 0.92;
        const commission = gross - net;
        return {
          period: new Date(item.date).toLocaleDateString(),
          gross,
          rate: '8%',
          commission,
          net,
          status: net > 0 ? 'Earned' : 'No Sales',
          sc: net > 0 ? 'text-green-500 bg-green-500/10' : 'text-gray2 bg-white/10',
        };
      });
  }, [data?.dailyBreakdown]);

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <MerchantPageHeader
          title={
            <>
              Earnings <span className="text-teal">Dashboard</span>
            </>
          }
          subtitle="Track your revenue, commissions, and settlements"
        />
        <div className="flex gap-2.5">
          <button onClick={() => load(period)} className="text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border border-white/[0.07] px-4 py-1.5 text-[0.8rem] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => onNav?.('payouts')}
            className="bg-teal text-navy hover:bg-teal2 rounded px-4 py-1.5 text-[0.8rem] font-bold transition-colors"
          >
            Request Payout
          </button>
        </div>
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="mb-4 flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-navy3 text-gray2 rounded border border-white/[0.07] px-3 py-2 text-sm outline-none"
        >
          {periodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="border-teal/20 mb-8 flex flex-wrap items-center justify-between gap-6 rounded-lg border bg-linear-to-br from-[#091830] to-[#0D2137] p-8">
        <div>
          <div className="text-teal text-[0.7rem] font-bold tracking-widest uppercase">
            Available Balance
          </div>
          <div className="mt-1 font-syne text-[2.5rem] leading-none font-extrabold text-white">
            ${Number(summary.availableBalance || 0).toFixed(2)}
          </div>
          <div className="text-gray mt-2 text-[0.88rem] tracking-wide">{loading ? 'Refreshing...' : 'Live merchant earnings data'}</div>
        </div>
        <div className="flex flex-wrap gap-8">
          {[
            { v: `$${Number(summary.gross_revenue || 0).toFixed(2)}`, l: 'Gross Sales' },
            { v: `$${Number(summary.total_commission || 0).toFixed(2)}`, l: 'Commission (8%)', c: 'text-red' },
            { v: `$${Number(summary.net_earnings || 0).toFixed(2)}`, l: 'Net Earnings' },
            { v: String(Number(summary.order_count || 0)), l: 'Orders' },
          ].map((s) => (
            <div key={s.l}>
              <div className={`font-syne text-[1.2rem] font-bold leading-none mb-1 ${s.c || 'text-white'}`}>
                {s.v}
              </div>
              <div className="text-gray text-[0.7rem] font-bold tracking-widest uppercase">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card mb-8 rounded-lg border border-white/[0.07] px-6 py-5">
        <h3 className="mb-6 font-syne text-[1rem] font-bold text-white">
          Earnings Trend
        </h3>
        <div className="relative flex h-[180px] items-end gap-3 pb-8">
          <div className="absolute right-0 bottom-8 left-0 h-px bg-white/[0.07]" />
          {bars.map((b, index) => (
            <div key={`${b.label}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className="w-full relative cursor-pointer rounded-t-xs bg-teal/20 transition-all duration-300 group-hover:bg-teal"
                style={{ height: b.height }}
              >
                <div className="bg-navy3 pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xs px-2 py-1 text-[0.65rem] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  ${b.value.toFixed(2)}
                </div>
              </div>
              <span className="text-gray mt-2 text-[0.65rem] font-bold uppercase tracking-wider">{b.label}</span>
            </div>
          ))}
          {!bars.length ? <div className="text-gray2 text-sm">No earnings data available for this period.</div> : null}
        </div>
      </div>

      <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
        <div className="border-b border-white/[0.07] px-6 py-4">
          <h3 className="font-syne text-[1rem] font-bold text-white">Daily Breakdown</h3>
        </div>

        <div className="hidden min-[800px]:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
              <tr className="border-b border-white/[0.07]">
                {[
                  'Period',
                  'Gross Sales',
                  'Commission Rate',
                  'Commission',
                  'Net Earnings',
                  'Status',
                ].map((h) => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[0.88rem] text-white">
              {rows.map((r) => (
                <tr key={r.period} className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2">
                  <td className="px-6 py-4 font-bold">{r.period}</td>
                  <td className="px-6 py-4">${r.gross.toFixed(2)}</td>
                  <td className="text-gray2 px-6 py-4">{r.rate}</td>
                  <td className="text-red px-6 py-4 font-black">${r.commission.toFixed(2)}</td>
                  <td className="text-teal px-6 py-4 font-black">${r.net.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Pill c={r.sc}>{r.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MerchantEarnings;

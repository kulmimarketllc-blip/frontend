import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  Package,
  Store,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import DashboardStats from '../../../components/DashboardStats';
import LoadingFallback from '../../../router/components/LoadingFallback';
import { getAdminDashboard, getAdminHealth } from '../../../services/adminService';
import { downloadCsv } from '../../../utils/csvExport';

const iconMap = {
  DollarSign,
  Package,
  Store,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Tag,
  CreditCard,
};

const toCurrency = (value) => {
  const numeric = Number(value || 0);
  return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
};

const toPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfWeek = (date) => {
  const day = date.getDay();
  const offset = (day + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const statusMeta = (status = '') => {
  const normalized = String(status).toLowerCase();
  if (normalized === 'pending_payment') return { label: 'Pending Payment', className: 'bg-yellow/10 text-yellow' };
  if (normalized === 'confirmed') return { label: 'Confirmed', className: 'bg-blue-500/10 text-blue-400' };
  if (normalized === 'processing') return { label: 'Processing', className: 'bg-cyan-500/10 text-cyan-400' };
  if (normalized === 'ready_for_pickup') return { label: 'Ready for Pickup', className: 'bg-violet-500/10 text-violet-400' };
  if (normalized === 'picked_up') return { label: 'Picked Up', className: 'bg-sky-500/10 text-sky-400' };
  if (normalized === 'in_transit') return { label: 'In Transit', className: 'bg-amber-500/10 text-amber-400' };
  if (normalized === 'delivered') return { label: 'Delivered', className: 'bg-green-500/10 text-green-500' };
  if (normalized === 'cancelled') return { label: 'Cancelled', className: 'bg-red/10 text-red' };
  if (normalized === 'return_requested') return { label: 'Return Requested', className: 'bg-orange-500/10 text-orange-400' };
  if (normalized === 'returned') return { label: 'Returned', className: 'bg-rose-500/10 text-rose-400' };
  if (normalized === 'refunded') return { label: 'Refunded', className: 'bg-pink-500/10 text-pink-400' };
  return {
    label: normalized.split('_').map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join(' '),
    className: 'bg-white/10 text-gray2',
  };
};

const AdminDashboard = ({ onNav }) => {
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartFilter, setChartFilter] = useState('last_7_days');

  const chartPeriod = chartFilter === 'this_year'
    ? 'year'
    : chartFilter === 'last_7_days'
      ? 'week'
      : 'month';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardPayload, healthPayload] = await Promise.all([
          getAdminDashboard(),
          getAdminHealth(),
        ]);
        setData(dashboardPayload || null);
        setHealth(healthPayload || null);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const users = data?.users || {};
  const orders = data?.orders || {};
  const revenue = data?.revenue || {};
  const categoryBreakdown = Array.isArray(data?.categoryBreakdown) ? data.categoryBreakdown : [];
  const recentOrders = Array.isArray(data?.recentOrders) ? data.recentOrders : [];
  const alerts = health?.alerts || {};

  const stats = [
    {
      icon: DollarSign,
      val: toCurrency(revenue.gross_revenue),
      label: 'Gross Revenue',
      bg: 'bg-teal/10',
      trend: `Today: ${toCurrency(revenue.revenue_today)}`,
      up: Number(revenue.revenue_today || 0) >= 0,
    },
    {
      icon: Package,
      val: Number(orders.total || 0).toLocaleString(),
      label: 'Total Orders',
      bg: 'bg-purple-500/10',
      trend: `Today: ${Number(orders.today || 0).toLocaleString()}`,
      up: Number(orders.today || 0) >= 0,
    },
    {
      icon: Store,
      val: Number(users.merchants || 0).toLocaleString(),
      label: 'Merchants',
      bg: 'bg-blue-500/10',
      trend: `Pending approvals: ${Number(alerts.pendingMerchants || 0).toLocaleString()}`,
      up: Number(alerts.pendingMerchants || 0) === 0,
    },
    {
      icon: Users,
      val: Number(users.customers || 0).toLocaleString(),
      label: 'Customers',
      bg: 'bg-yellow/10',
      trend: `New customers: ${Number(users.new_this_month || 0).toLocaleString()}`,
      up: Number(users.new_this_month || 0) >= 0,
    },
  ];

  const activities = [
    {
      icon: CheckCircle,
      bg: Number(alerts.pendingMerchants || 0) === 0 ? 'bg-green-500/10' : 'bg-yellow/10',
      text: Number(alerts.pendingMerchants || 0) === 0
        ? '<strong>All merchant approvals are up to date</strong>'
        : `<strong>${Number(alerts.pendingMerchants || 0)} merchants pending approval</strong>`,
      time: 'Current platform state',
    },
    {
      icon: Package,
      bg: Number(alerts.stuckOrders || 0) === 0 ? 'bg-green-500/10' : 'bg-red/10',
      text: Number(alerts.stuckOrders || 0) === 0
        ? '<strong>No stuck orders detected</strong>'
        : `<strong>${Number(alerts.stuckOrders || 0)} orders are stuck over 24h</strong>`,
      time: 'Monitoring',
    },
    {
      icon: Tag,
      bg: Number(alerts.lowStockProducts || 0) === 0 ? 'bg-green-500/10' : 'bg-yellow/10',
      text: Number(alerts.lowStockProducts || 0) === 0
        ? '<strong>No low-stock product alerts</strong>'
        : `<strong>${Number(alerts.lowStockProducts || 0)} products are low on stock</strong>`,
      time: 'Inventory health',
    },
  ];

  const chartRows = useMemo(() => {
    const rawRows = Array.isArray(data?.charts?.revenueTrend) ? data.charts.revenueTrend : [];
    const parsedRows = rawRows
      .map((row) => ({
        date: new Date(row.date),
        revenue: Number(row.revenue || 0),
      }))
      .filter((row) => !Number.isNaN(row.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (!parsedRows.length) return [];

    const now = new Date();

    if (chartPeriod === 'week') {
      const cutoff = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      return parsedRows
        .filter((row) => row.date >= cutoff)
        .slice(-7)
        .map((row) => ({
          key: row.date.toISOString().slice(0, 10),
          label: row.date.toLocaleDateString(undefined, { weekday: 'short' }),
          revenue: row.revenue,
        }));
    }

    if (chartPeriod === 'month') {
      const cutoff = chartFilter === 'this_month'
        ? startOfMonth(now)
        : new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const bucket = new Map();

      for (const row of parsedRows) {
        if (row.date < cutoff) continue;
        const weekStart = startOfWeek(row.date);
        const key = weekStart.toISOString().slice(0, 10);
        bucket.set(key, (bucket.get(key) || 0) + row.revenue);
      }

      return Array.from(bucket.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, revenue]) => ({
          key,
          label: new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          revenue,
        }));
    }

    const cutoff = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
    const bucket = new Map();

    for (const row of parsedRows) {
      if (row.date < cutoff) continue;
      const monthStart = startOfMonth(row.date);
      const key = monthStart.toISOString().slice(0, 10);
      bucket.set(key, (bucket.get(key) || 0) + row.revenue);
    }

    return Array.from(bucket.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, revenue]) => ({
        key,
        label: new Date(key).toLocaleDateString(undefined, { month: 'short' }),
        revenue,
      }));
  }, [chartFilter, chartPeriod, data?.charts?.revenueTrend]);

  const maxRevenue = Math.max(1, ...chartRows.map((row) => Number(row.revenue || 0)));

  const categoryTotal = Math.max(1, categoryBreakdown.reduce((sum, item) => sum + Number(item.revenue || 0), 0));
  const topCategories = categoryBreakdown.slice(0, 4).map((item, index) => {
    const palette = ['#00C9A7', '#8B5CF6', '#FBBF24', '#3B82F6'];
    const revenueValue = Number(item.revenue || 0);
    return {
      name: item.category,
      percentage: Math.round((revenueValue / categoryTotal) * 100),
      color: palette[index] || '#94A3B8',
    };
  });

  const exportDashboardReport = () => {
    const summaryHeaders = ['Metric', 'Value'];
    const summaryRows = [
      ['Gross Revenue', Number(revenue.gross_revenue || 0).toFixed(2)],
      ['Revenue Today', Number(revenue.revenue_today || 0).toFixed(2)],
      ['Revenue This Week', Number(revenue.revenue_this_week || 0).toFixed(2)],
      ['Revenue This Month', Number(revenue.revenue_this_month || 0).toFixed(2)],
      ['Total Orders', Number(orders.total || 0)],
      ['Orders Today', Number(orders.today || 0)],
      ['Confirmed Orders', Number(orders.confirmed || 0)],
      ['Customers', Number(users.customers || 0)],
      ['Merchants', Number(users.merchants || 0)],
      ['Pending Merchants', Number(alerts.pendingMerchants || 0)],
      ['Stuck Orders', Number(alerts.stuckOrders || 0)],
      ['Low Stock Products', Number(alerts.lowStockProducts || 0)],
    ];

    const trendHeaders = ['Trend Label', 'Revenue'];
    const trendRows = chartRows.map((row) => [row.label, Number(row.revenue || 0).toFixed(2)]);

    const orderHeaders = ['Order ID', 'Customer', 'Status', 'Total', 'Created At'];
    const orderRows = recentOrders.map((order) => [
      order.id || '',
      `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.customer?.email || 'Customer',
      statusMeta(order.status).label,
      Number(order.total || 0).toFixed(2),
      order.createdAt ? new Date(order.createdAt).toISOString() : '',
    ]);

    const activityHeaders = ['Activity', 'Value'];
    const activityRows = [
      ['Pending merchant approvals', Number(alerts.pendingMerchants || 0)],
      ['Stuck orders over 24h', Number(alerts.stuckOrders || 0)],
      ['Low-stock products', Number(alerts.lowStockProducts || 0)],
    ];

    downloadCsv({
      fileName: `admin-dashboard-${new Date().toISOString().slice(0, 10)}.csv`,
      headers: summaryHeaders,
      rows: [...summaryRows, [], trendHeaders, ...trendRows, [], orderHeaders, ...orderRows, [], activityHeaders, ...activityRows],
    });
  };

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-red">
        <XCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">An Error Occurred</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-syne text-[1.4rem] lg:text-[1.6rem] font-bold text-white">
            Dashboard <span className="text-teal">Overview</span>
          </h1>
          <p className="text-gray mt-1 text-[0.9rem] lg:text-[1rem]">Welcome back, Admin · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={chartFilter}
            onChange={(e) => setChartFilter(e.target.value)}
            className="bg-navy3 border-border text-gray2 rounded-md border px-3 py-2 text-[0.85rem] font-medium outline-none focus:border-teal transition-colors"
          >
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="this_month">This month</option>
            <option value="this_year">This year</option>
          </select>
          <button onClick={exportDashboardReport} className="bg-teal text-navy hover:bg-teal2 rounded-md px-4 py-2 text-[0.85rem] font-semibold transition-colors">
            ⬇ Export Report
          </button>
        </div>
      </div>

      <DashboardStats stats={stats.map((s) => ({ ...s, icon: iconMap[s.icon.name] || s.icon }))} />

      {/* CHARTS */}
      <div className="mb-6 lg:mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] mt-6">
        {/* BAR CHART */}
        <div className="bg-card border-border rounded-lg border p-5 lg:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 className="font-syne text-[1.05rem] font-bold text-white">Revenue Overview</h3>
            <div className="flex gap-1.5">
              <button
                className={`rounded px-3 py-1 text-[0.75rem] font-medium border transition-colors ${chartPeriod === 'week' ? 'bg-teal/10 border-teal text-teal' : 'border-border text-gray hover:text-teal bg-transparent'}`}
                onClick={() => setChartFilter('last_7_days')}
              >
                Week
              </button>
              <button
                className={`rounded px-3 py-1 text-[0.75rem] font-medium border transition-colors ${chartPeriod === 'month' ? 'bg-teal/10 border-teal text-teal' : 'border-border text-gray hover:text-teal bg-transparent'}`}
                onClick={() => setChartFilter('last_30_days')}
              >
                Month
              </button>
              <button
                className={`rounded px-3 py-1 text-[0.75rem] font-medium border transition-colors ${chartPeriod === 'year' ? 'bg-teal/10 border-teal text-teal' : 'border-border text-gray hover:text-teal bg-transparent'}`}
                onClick={() => setChartFilter('this_year')}
              >
                Year
              </button>
            </div>
          </div>
          <div className="border-border relative flex h-[160px] items-end gap-2 border-b pb-4 sm:gap-4 md:gap-6 mt-6 md:mt-10">
            {chartRows.map((b) => (
              <div key={b.key} className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                {/* Tooltip */}
                <div className="bg-teal text-navy absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-0.5 text-[0.7rem] font-bold opacity-0 transition-opacity group-hover:opacity-100 hidden sm:block">
                  {toCurrency(b.revenue)}
                </div>
                <div 
                  className="w-full rounded-t-sm bg-[linear-gradient(to_top,#00A88C,#00C9A7)] transition-all duration-500 cursor-pointer hover:opacity-90"
                  style={{ height: `${Math.max(8, (Number(b.revenue || 0) / maxRevenue) * 100)}%` }}
                ></div>
                <div className="text-gray absolute -bottom-7 text-[0.7rem]">
                  {b.label}
                </div>
              </div>
            ))}
            {!chartRows.length && (
              <div className="absolute inset-0 flex items-center justify-center text-[0.8rem] text-gray">
                No revenue trend data available.
              </div>
            )}
          </div>
        </div>

        {/* DONUT CHART */}
        <div className="bg-card border-border rounded-lg border p-5 lg:p-6">
          <h3 className="font-syne mb-6 text-[1.05rem] font-bold text-white">Orders by Category</h3>
          <div className="flex flex-col items-center gap-6">
            <div className="relative h-[140px] w-[140px]">
              <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90 transform">
                {/* Background circle */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#1E2A3A" strokeWidth="16" />
                {/* Electronics 38% */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#00C9A7" strokeWidth="16" strokeDasharray="120 182" strokeLinecap="round" />
                {/* Fashion 22% */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#8B5CF6" strokeWidth="16" strokeDasharray="70 232" strokeDashoffset="-120" strokeLinecap="round" />
                {/* Home & Garden 16% */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#FBBF24" strokeWidth="16" strokeDasharray="50 252" strokeDashoffset="-190" strokeLinecap="round" />
                {/* Beauty 24% */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#3B82F6" strokeWidth="16" strokeDasharray="62 240" strokeDashoffset="-240" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-syne text-[1.35rem] font-extrabold text-white">{Number(orders.total || 0).toLocaleString()}</div>
                <div className="text-gray text-[0.65rem]">Total Orders</div>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              {topCategories.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="text-gray flex-1 text-[0.8rem]">{item.name}</div>
                  <div className="text-[0.8rem] font-medium text-white">{item.percentage}%</div>
                </div>
              ))}
              {!topCategories.length && (
                <div className="text-gray text-[0.8rem]">No category data available yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mb-6 lg:mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        <div className="bg-card border-border hover:border-teal flex cursor-pointer items-center gap-3.5 rounded-lg border p-4 transition-all hover:-translate-y-0.5" onClick={() => onNav?.('merchants')}>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-teal" />
          </div>
          <div>
            <div className="text-[0.95rem] font-medium text-white">Approve Merchants</div>
            <div className="text-gray text-[0.85rem]">{Number(alerts.pendingMerchants || 0)} pending</div>
          </div>
        </div>
        <div className="bg-card border-border hover:border-teal flex cursor-pointer items-center gap-3.5 rounded-lg border p-4 transition-all hover:-translate-y-0.5" onClick={() => onNav?.('orders')}>
          <div className="flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-[0.95rem] font-medium text-white">Manage Orders</div>
            <div className="text-gray text-[0.85rem]">{Number(orders.confirmed || 0)} confirmed</div>
          </div>
        </div>
        <div className="bg-card border-border hover:border-teal flex cursor-pointer items-center gap-3.5 rounded-lg border p-4 transition-all hover:-translate-y-0.5" onClick={() => onNav?.('coupons')}>
          <div className="flex items-center justify-center">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-[0.95rem] font-medium text-white">Create Coupon</div>
            <div className="text-gray text-[0.85rem]">Run promotions</div>
          </div>
        </div>
        <div className="bg-card border-border hover:border-teal flex cursor-pointer items-center gap-3.5 rounded-lg border p-4 transition-all hover:-translate-y-0.5" onClick={() => onNav?.('payouts')}>
          <div className="flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-[0.95rem] font-medium text-white">Process Payouts</div>
            <div className="text-gray text-[0.85rem]">{toCurrency(revenue.revenue_this_week)} this week</div>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS + ACTIVITY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="bg-card border-border flex flex-col overflow-hidden rounded-lg border">
          <div className="border-border flex items-center justify-between border-b p-4 lg:px-5">
            <h3 className="font-syne text-[1.1rem] font-bold text-white">Recent Orders</h3>
            <button className="border-border text-gray2 hover:border-teal hover:text-teal rounded-md border bg-transparent px-3 py-1.5 text-[0.85rem] font-medium transition-colors" onClick={() => onNav?.('orders')}>
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead className="bg-navy3 text-gray border-border border-b text-[0.8rem] tracking-wider uppercase">
                <tr>
                  <th className="px-4 py-3.5 font-semibold lg:px-5">Order ID</th>
                  <th className="px-4 py-3.5 font-semibold lg:px-5">Customer</th>
                  <th className="px-4 py-3.5 font-semibold lg:px-5">Amount</th>
                  <th className="px-4 py-3.5 font-semibold lg:px-5">Status</th>
                  <th className="px-4 py-3.5 font-semibold lg:px-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {recentOrders.map((order) => (
                  (() => {
                    const meta = statusMeta(order.status);
                    return (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="text-teal px-4 py-4 font-medium lg:px-5">{order.id}</td>
                    <td className="px-4 py-4 text-white lg:px-5">
                      {order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.email : 'Customer'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-white lg:px-5">{toCurrency(order.total)}</td>
                    <td className="px-4 py-4 lg:px-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold whitespace-nowrap ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="text-gray px-4 py-4 lg:px-5">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                    );
                  })()
                ))}
                {!recentOrders.length && (
                  <tr>
                    <td className="text-gray px-4 py-4 lg:px-5" colSpan={5}>No recent orders available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border">
          <div className="p-4 lg:px-5">
            <h3 className="font-syne mb-1 text-[1.1rem] font-bold text-white">Recent Activity</h3>
          </div>
          <div className="flex flex-col px-4 pb-4 lg:px-5">
            {activities.map((activity, index) => {
              const ActivityIcon = iconMap[activity.icon] || CheckCircle;
              return (
                <div key={index} className="border-border flex items-start gap-3.5 border-b py-3.5 last:border-none">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.bg}`}>
                    <ActivityIcon className="h-5 w-5 text-white opacity-90" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[0.95rem] leading-snug text-white" dangerouslySetInnerHTML={{ __html: activity.text }} />
                    <p className="text-gray mt-1 text-[0.8rem]">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

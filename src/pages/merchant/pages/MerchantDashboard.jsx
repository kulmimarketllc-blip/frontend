import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import DashboardStats from '../../../components/DashboardStats';
import MerchantPageHeader from '../components/MerchantPageHeader';
import MerchantPill from '../components/MerchantPill';
import OrderDetailsModal from '../../../components/merchant/OrderDetailsModal';
import OrderDetailsButton from '../../../components/merchant/OrderDetailsButton';
import LoadingFallback from '../../../router/components/LoadingFallback';
import {
  getMyMerchantEarnings,
  getMyMerchantOrders,
  getMyMerchantProducts,
  getMyMerchantReviews,
  getMyMerchantStore,
  updateMerchantOrderStatus,
} from '../../../services/merchantService';
import { getMerchantNextStatusAction, getOrderStatusLabel, normalizeOrderStatus } from '../../../utils/orderStatus';

const statusColor = (status = '') => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'pending_payment') return 'text-yellow bg-yellow/10';
  if (normalized === 'confirmed') return 'text-teal bg-teal/10';
  if (normalized === 'processing') return 'text-blue-500 bg-blue-500/10';
  if (normalized === 'ready_for_pickup' || normalized === 'picked_up' || normalized === 'in_transit' || normalized === 'out_for_delivery') return 'text-purple-300 bg-purple-500/10';
  if (normalized === 'delivered') return 'text-green-500 bg-green-500/10';
  if (normalized === 'cancelled' || normalized === 'returned' || normalized === 'refunded') return 'text-red bg-red/10';
  if (normalized === 'return_requested') return 'text-orange-300 bg-orange-500/10';
  return 'text-gray2 bg-white/10';
};

const statusLabel = (status = '') => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'ready_for_pickup') return 'Ready for Delivery';
  if (normalized === 'picked_up') return 'Picked Up';
  if (normalized === 'in_transit' || normalized === 'out_for_delivery') return 'In Transit';
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getNextStatusAction = (status = '') => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'confirmed') return { next: 'processing', label: 'Start Processing' };
  if (normalized === 'processing') return { next: 'ready_for_pickup', label: 'Ready for Delivery' };
  return null;
};

const loadAllMerchantOrderRows = async () => {
  const first = await getMyMerchantOrders({ page: 1, limit: 100 });
  const initialRows = Array.isArray(first?.data) ? first.data : [];
  const pages = Number(first?.meta?.pages || 1);
  if (pages <= 1) return initialRows;

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, idx) => getMyMerchantOrders({ page: idx + 2, limit: 100 }))
  );

  const restRows = rest.flatMap((payload) => (Array.isArray(payload?.data) ? payload.data : []));
  return [...initialRows, ...restRows];
};

const summarizeOrders = (rows = []) => {
  const grouped = new Map();
  rows.forEach((item, index) => {
    const order = item?.order;
    const orderId = order?.id;
    if (!orderId) return;

    const existing = grouped.get(orderId);
    if (existing) {
      existing.total += Number(item?.totalPrice || 0);
      existing.qty += Number(item?.quantity || 0);
      if (item?.productName) existing.productNames.add(item.productName);
      existing.itemRows.push(item);
      return;
    }

    grouped.set(orderId, {
      key: orderId,
      id: orderId,
      order,
      createdAt: order?.createdAt,
      status: String(order?.status || '').toLowerCase(),
      customer: [order?.customer?.firstName, order?.customer?.lastName].filter(Boolean).join(' ') || order?.customer?.email || 'Customer',
      total: Number(item?.totalPrice || 0),
      qty: Number(item?.quantity || 0),
      productNames: new Set(item?.productName ? [item.productName] : []),
      sortKey: `${order?.createdAt || ''}-${index}`,
      itemRows: [item],
    });
  });

  return Array.from(grouped.values()).sort((a, b) => String(b.sortKey).localeCompare(String(a.sortKey)));
};

const loadAllMerchantProducts = async () => {
  const first = await getMyMerchantProducts({ page: 1, limit: 100, sort: 'popular' });
  const initialRows = Array.isArray(first?.data) ? first.data : [];
  const pages = Number(first?.meta?.pages || 1);
  if (pages <= 1) {
    return {
      rows: initialRows,
      total: Number(first?.meta?.total || initialRows.length),
    };
  }

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, idx) => getMyMerchantProducts({ page: idx + 2, limit: 100, sort: 'popular' }))
  );

  const restRows = rest.flatMap((payload) => (Array.isArray(payload?.data) ? payload.data : []));
  return {
    rows: [...initialRows, ...restRows],
    total: Number(first?.meta?.total || initialRows.length + restRows.length),
  };
};

const MerchantDashboard = ({ onNav }) => {
  const [store, setStore] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const merchantStore = await getMyMerchantStore();
        if (!merchantStore?.id) {
          setStore(null);
          setEarnings(null);
          setOrders([]);
          setProducts([]);
          setReviews([]);
          return;
        }

        const [earningsRes, ordersRes, productsRes, reviewsRes] = await Promise.allSettled([
          getMyMerchantEarnings('week'),
          loadAllMerchantOrderRows(),
          loadAllMerchantProducts(),
          getMyMerchantReviews(merchantStore.id, { page: 1, limit: 5, sort: 'newest' }),
        ]);

        setStore(merchantStore);
        const earningsPayload = earningsRes.status === 'fulfilled' ? earningsRes.value : null;
        const ordersPayload = ordersRes.status === 'fulfilled' ? ordersRes.value : [];
        const productsPayload = productsRes.status === 'fulfilled' ? productsRes.value : { rows: [], total: 0 };
        const reviewsPayload = reviewsRes.status === 'fulfilled' ? reviewsRes.value : { data: [] };

        setEarnings(earningsPayload || null);
        setOrders(Array.isArray(ordersPayload) ? ordersPayload : []);
        setProducts(Array.isArray(productsPayload?.rows) ? productsPayload.rows : (Array.isArray(productsPayload) ? productsPayload : []));
        setProductsTotal(Number(productsPayload?.total || (Array.isArray(productsPayload?.rows) ? productsPayload.rows.length : 0)));
        setReviews(Array.isArray(reviewsPayload?.data) ? reviewsPayload.data : []);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const orderSummaries = useMemo(() => summarizeOrders(orders), [orders]);
  const totalOrders = orderSummaries.length;

  const stats = useMemo(() => {
    const summary = earnings?.summary || {};
    return [
      {
        icon: DollarSign,
        bg: 'bg-teal/10',
        val: `$${Number(summary.availableBalance || 0).toFixed(2)}`,
        label: 'Available Balance',
      },
      {
        icon: Package,
        bg: 'bg-blue-500/10',
        val: String(totalOrders),
        label: 'Orders',
      },
      {
        icon: ShoppingBag,
        bg: 'bg-yellow/10',
        val: String(productsTotal),
        label: 'Products',
      },
      {
        icon: Star,
        bg: 'bg-green-500/10',
        val: Number(store?.avgRating || 0).toFixed(1),
        label: 'Store Rating',
      },
    ];
  }, [earnings?.summary, orderSummaries.length, productsTotal, store?.avgRating]);

  const barData = useMemo(() => {
    const chartMaxPx = 140;
    const points = Array.isArray(earnings?.dailyBreakdown) ? earnings.dailyBreakdown : [];
    if (points.length) {
      const max = Math.max(...points.map((d) => Number(d.earnings || 0)), 1);
      return points.slice(-7).map((item) => {
        const value = Number(item.earnings || 0);
        const date = new Date(item.date);
        return {
          label: date.toLocaleDateString(undefined, { weekday: 'short' }),
          val: `$${value.toFixed(2)}`,
          height: `${Math.max(12, (value / max) * chartMaxPx)}px`,
        };
      });
    }

    const grouped = new Map();
    orders.forEach((item) => {
      const createdAt = item?.order?.createdAt;
      if (!createdAt) return;
      const dayKey = new Date(createdAt).toISOString().slice(0, 10);
      const earningsValue = Number(item?.merchantEarnings || 0);
      grouped.set(dayKey, (grouped.get(dayKey) || 0) + earningsValue);
    });

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([dayKey, value]) => ({
        label: new Date(`${dayKey}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
        val: `$${Number(value || 0).toFixed(2)}`,
        height: `${Math.max(12, Number(value || 0) > 0 ? chartMaxPx : 12)}px`,
      }));
  }, [earnings?.dailyBreakdown, orders]);

  const topProducts = useMemo(() => {
    const list = Array.isArray(earnings?.topProducts) && earnings.topProducts.length
      ? earnings.topProducts
      : products
        .slice()
        .sort((a, b) => Number(b.totalSold || 0) - Number(a.totalSold || 0))
        .slice(0, 5)
        .map((item) => ({
          product_name: item.name,
          units_sold: item.totalSold || 0,
          gross_revenue: Number(item.price || 0) * Number(item.totalSold || 0),
        }));
    const top = list.slice(0, 5);
    const maxRevenue = Math.max(...top.map((p) => Number(p.gross_revenue || 0)), 1);
    return top.map((item, index) => ({
      name: item.product_name,
      sold: `${Number(item.units_sold || 0)} sold`,
      c: index % 2 ? 'bg-blue-500' : 'bg-teal',
      w: `${Math.max(10, (Number(item.gross_revenue || 0) / maxRevenue) * 100)}%`,
    }));
  }, [earnings?.topProducts, products]);

  const recentOrders = useMemo(() => {
    return orderSummaries.slice(0, 5).map((item) => {
      const names = Array.from(item.productNames || []);
      const productLabel = !names.length
        ? 'Order items'
        : names.length === 1
          ? names[0]
          : `${names[0]} + ${names.length - 1} more`;
      return {
        key: item.key,
        id: item.id,
        summary: item,
        customer: item.customer,
        product: productLabel,
        total: `$${Number(item.total || 0).toFixed(2)}`,
        status: statusLabel(item.status),
        statusRaw: item.status,
        sc: statusColor(item.status),
      };
    });
  }, [orderSummaries]);

  const applyStatus = async (orderId, status) => {
    try {
      setUpdateError('');
      setUpdateMessage('');
      setUpdatingOrderId(orderId);
      await updateMerchantOrderStatus(orderId, status);

      setOrders((prev) => prev.map((item) => {
        if (item?.order?.id !== orderId) return item;
        return {
          ...item,
          order: {
            ...item.order,
            status,
          },
        };
      }));

      setUpdateMessage(`Order ${orderId} updated to ${statusLabel(status)}.`);
    } catch (err) {
      setUpdateError(err?.response?.data?.message || 'Could not update order status.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const openOrderDetails = (orderSummary) => {
    const orderWithItems = {
      ...orderSummary.order,
      total: orderSummary.order?.total ?? orderSummary.total,
      items: (orderSummary.itemRows || []).map((row) => ({
        id: row?.id,
        productName: row?.productName || row?.product?.name || 'Product',
        sku: row?.sku || row?.product?.sku,
        quantity: row?.quantity,
        unitPrice: Number(row?.unitPrice || row?.price || 0),
        price: Number(row?.unitPrice || row?.price || 0),
        totalPrice: Number(row?.totalPrice || 0),
        image: row?.image || row?.product?.images?.[0] || null,
        product: row?.product,
      })),
    };

    setSelectedOrder({ ...orderSummary, order: orderWithItems });
    setIsDetailOpen(true);
  };

  const quickLinks = [
    { id: 'orders', label: 'Process New Orders' },
    { id: 'products', label: 'Manage Product Catalog' },
    { id: 'inventory', label: 'Update Stock Levels' },
    { id: 'payouts', label: 'Request Payout' },
  ];

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="text-red flex h-64 flex-col items-center justify-center">
        <XCircle size={48} className="mb-4" />
        <h2 className="text-xl font-semibold">An Error Occurred</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <MerchantPageHeader
        title={
          <>
            Store <span className="text-teal">Overview</span>
          </>
        }
        subtitle={`Welcome back${store?.storeName ? `, ${store.storeName}` : ''}`}
      />

      {updateMessage ? <div className="mt-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{updateMessage}</div> : null}
      {updateError ? <div className="mt-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{updateError}</div> : null}

      <DashboardStats stats={stats} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-card border-border rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-syne text-[1rem] font-bold text-white">Weekly Sales</h3>
                <p className="text-gray text-sm">Last 7 days performance</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-500">
                <TrendingUp size={16} />
                <span>{Number(earnings?.summary?.net_earnings || 0) > 0 ? 'Live' : 'No sales yet'}</span>
              </div>
            </div>

            <div className="mt-8 flex h-48 items-end justify-between gap-2">
              {barData.length ? barData.map((bar, index) => (
                <div key={`${bar.label}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end">
                  <div className="relative mb-1">
                    <div className="bg-navy3 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {bar.val}
                    </div>
                  </div>
                  <div
                    className="bg-teal/20 group-hover:bg-teal w-full rounded-t-sm transition-colors"
                    style={{ height: bar.height }}
                  />
                  <div className="text-gray mt-2 text-xs">{bar.label}</div>
                </div>
              )) : <div className="text-gray2 text-sm">No earnings data yet for this period.</div>}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="font-syne mb-4 text-[1rem] font-bold text-white">Top Products</h3>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-white">{product.name}</span>
                    <span className="text-gray">{product.sold}</span>
                  </div>
                  <div className="bg-navy3 h-2 w-full rounded">
                    <div className={`h-2 rounded ${product.c}`} style={{ width: product.w }} />
                  </div>
                </div>
              ))}
              {!topProducts.length ? <div className="text-gray2 text-sm">No product performance data yet.</div> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="font-syne mb-4 text-lg font-bold text-white">Recent Orders</h3>
          <div className="bg-card border-white/[0.07] overflow-x-auto rounded-lg border">
            {/* Desktop Table */}
            <div className="hidden min-[800px]:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
                  <tr className="border-b border-white/[0.07]">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[0.88rem] text-white">
                  {recentOrders.map((order) => (
                    <tr key={order.key} className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2">
                      <td className="text-teal font-bold px-6 py-4">{order.id}</td>
                      <td className="px-6 py-4 font-medium">{order.customer}</td>
                      <td className="text-gray2 px-6 py-4 max-w-35 truncate">{order.product}</td>
                      <td className="px-6 py-4 font-black">{order.total}</td>
                      <td className="px-6 py-4">
                        <MerchantPill className={order.sc}>{order.status}</MerchantPill>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {getNextStatusAction(order.statusRaw) ? (
                            <button
                              type="button"
                              disabled={updatingOrderId === order.id}
                              onClick={() => {
                                const action = getNextStatusAction(order.statusRaw);
                                if (action) applyStatus(order.id, action.next);
                              }}
                              className="bg-teal text-navy hover:bg-teal2 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {getNextStatusAction(order.statusRaw)?.label}
                            </button>
                          ) : null}
                          <OrderDetailsButton onClick={() => {
                            openOrderDetails(order.summary);
                          }} label="View" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!recentOrders.length ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray2">No merchant orders yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="min-[800px]:hidden divide-y divide-white/[0.07]">
              {recentOrders.map((order) => (
                <div key={order.key} className="p-5 space-y-4 hover:bg-white/2 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-teal font-black text-[0.9rem]">{order.id}</span>
                    <MerchantPill className={order.sc}>{order.status}</MerchantPill>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray text-[0.62rem] font-bold tracking-widest uppercase mb-1">Customer</p>
                      <p className="text-white text-sm font-bold">{order.customer}</p>
                    </div>
                    <div>
                      <p className="text-gray text-[0.62rem] font-bold tracking-widest uppercase mb-1">Total</p>
                      <p className="text-white text-sm font-black">{order.total}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray text-[0.62rem] font-bold tracking-widest uppercase mb-1">Product</p>
                    <p className="text-white text-sm truncate">{order.product}</p>
                  </div>
                  <div className="pt-3 border-t border-white/[0.07]">
                    <div className="flex flex-wrap gap-1.5">
                      {getNextStatusAction(order.statusRaw) ? (
                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => {
                            const action = getNextStatusAction(order.statusRaw);
                            if (action) applyStatus(order.id, action.next);
                          }}
                          className="bg-teal text-navy hover:bg-teal2 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {getNextStatusAction(order.statusRaw)?.label}
                        </button>
                      ) : null}
                      <OrderDetailsButton onClick={() => {
                        openOrderDetails(order.summary);
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              {!recentOrders.length ? <div className="p-5 text-sm text-gray2">No merchant orders yet.</div> : null}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-syne mb-4 text-lg font-bold text-white">Quick Links</h3>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => onNav?.(link.id)}
                className="bg-card border-white/[0.07] hover:border-teal flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors"
              >
                <span className="font-semibold text-white">{link.label}</span>
                <ArrowRight size={16} className="text-gray" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
        orderId={selectedOrder?.order?.id}
        order={selectedOrder?.order}
      />
    </div>
  );
};

export default MerchantDashboard;

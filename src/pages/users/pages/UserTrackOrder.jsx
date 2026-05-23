import React, { useEffect, useMemo, useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import UserPageHeader from '../components/UserPageHeader';
import UserPill from '../components/UserPill';
import LoadingFallback from '../../../router/components/LoadingFallback';
import { getMyOrderTracking, getMyOrders } from '../../../services/checkoutService';

const TRACKING_FLOW = [
  'confirmed',
  'processing',
  'in_transit',
  'delivered',
];

const TERMINAL_AFTER_DELIVERY = new Set(['return_requested', 'returned', 'refunded']);

const dotClass = {
  done: 'bg-teal',
  active: 'bg-teal ring-4 ring-teal/15',
  pending: 'border-2 border-white/[0.14] bg-navy3',
};

const lineClass = {
  done: 'bg-teal',
  active: 'bg-white/[0.07]',
  pending: 'bg-white/[0.07]',
};

const titleClass = {
  done: 'text-white',
  active: 'text-teal',
  pending: 'text-gray',
};

const prettify = (status = '') => String(status)
  .toLowerCase() === 'in_transit'
  ? 'Out for Delivery'
  : String(status)
    .split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

const orderStatusMapIndex = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'pending_payment') return 0;
  if (normalized === 'ready_for_pickup' || normalized === 'picked_up' || normalized === 'out_for_delivery') return TRACKING_FLOW.indexOf('in_transit');
  const index = TRACKING_FLOW.indexOf(status);
  return index >= 0 ? index : 0;
};

const UserTrackOrder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const ordersPayload = await getMyOrders({ page: 1, limit: 20 });
        const list = Array.isArray(ordersPayload?.data) ? ordersPayload.data : [];
        setOrders(list);

        const selectedId = orderId || list[0]?.id;
        if (selectedId) {
          setOrderId(selectedId);
          setSearchParams({ id: selectedId }, { replace: true });
          const payload = await getMyOrderTracking(selectedId);
          setTracking(payload || null);
        } else {
          setTracking(null);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load tracking details.');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeline = useMemo(() => {
    const base = Array.isArray(tracking?.timeline) ? tracking.timeline : [];
    const orderStatus = String(tracking?.status || '').toLowerCase();
    const activeStep = orderStatusMapIndex(orderStatus);
    const latestByStatus = new Map();
    base.forEach((entry) => {
      if (entry?.status) latestByStatus.set(String(entry.status).toLowerCase(), entry);
    });

    const progress = TRACKING_FLOW.map((status, index) => {
      const historyEntry = latestByStatus.get(status);
      const done = index < activeStep;
      const active = index === activeStep;
      return {
        id: status,
        title: prettify(status),
        sub: historyEntry
          ? `${new Date(historyEntry.changedAt).toLocaleString()}${historyEntry.note ? ` · ${historyEntry.note}` : ''}`
          : active
            ? 'Current status'
            : 'Pending update',
        status: done ? 'done' : active ? 'active' : 'pending',
      };
    });

    if (orderStatus === 'cancelled') {
      progress.push({
        id: 'cancelled',
        title: 'Cancelled',
        sub: 'Order was cancelled',
        status: 'active',
      });
    } else if (TERMINAL_AFTER_DELIVERY.has(orderStatus)) {
      progress.push({
        id: orderStatus,
        title: prettify(orderStatus),
        sub: 'Post-delivery update',
        status: 'active',
      });
    }

    return progress;
  }, [tracking]);

  const orderSummary = tracking ? {
    id: tracking.orderId || orderId,
    status: prettify(tracking.status),
    color: tracking.status === 'delivered' ? 'text-green-500 bg-green-500/10' : 'text-yellow bg-yellow/10',
    items: orders.find((order) => order.id === (tracking.orderId || orderId))?.items || [],
    total: orders.find((order) => order.id === (tracking.orderId || orderId))?.total,
  } : null;

  const onTrack = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError('');
      const payload = await getMyOrderTracking(orderId);
      setTracking(payload || null);
      setSearchParams({ id: orderId }, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load tracking details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !tracking) return <LoadingFallback />;

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5">
        <UserPageHeader
          title={<span>Track <span className="text-teal">Order</span></span>}
          subtitle="Real-time status of your delivery"
        />
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="bg-card mb-4 rounded-md border border-white/[0.07] p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-55 flex-1">
            <Search size={14} className="text-gray absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] py-2 pr-3 pl-8 text-[0.82rem] text-white outline-none"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter order ID"
            />
          </div>
          <button type="button" onClick={onTrack} className="bg-teal text-navy hover:bg-teal2 rounded px-4 py-2 text-[0.8rem] font-medium">
            Track
          </button>
        </div>

        {orderSummary ? (
          <div className="bg-navy3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/[0.07] p-3">
            <div>
              <div className="text-teal font-['Syne'] text-[0.875rem] font-bold">#{orderSummary.id}</div>
              <div className="text-gray text-[0.875rem]">{(orderSummary.items[0]?.productName || 'Order item')} · {orderSummary.items.length} item{orderSummary.items.length === 1 ? '' : 's'}</div>
            </div>
            <UserPill className={orderSummary.color}>{orderSummary.status}</UserPill>
          </div>
        ) : (
          <div className="text-gray2 text-sm">Track one of your order IDs to view live progress.</div>
        )}
      </div>

      <div className="bg-card rounded-md border border-white/[0.07] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">Delivery Progress</h3>
          {tracking?.driver ? (
            <div className="text-gray text-sm">Driver: <span className="text-white">{tracking.driver.name}</span></div>
          ) : null}
        </div>

        <div className="space-y-0">
          {timeline.map((step, index) => {
            const isLast = index === timeline.length - 1;
            return (
              <div key={step.id} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex w-4 shrink-0 flex-col items-center">
                  <span className={`h-3.5 w-3.5 rounded-full ${dotClass[step.status]}`} />
                  {!isLast ? <span className={`mt-1 h-full w-0.5 ${lineClass[step.status]}`} /> : null}
                </div>
                <div>
                  <div className={`text-[0.875rem] font-medium ${titleClass[step.status]}`}>{step.title}</div>
                  <div className="text-gray mt-0.5 text-[0.875rem]">{step.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {tracking?.estimatedDelivery ? (
          <div className="mt-4 rounded-md border border-white/[0.07] bg-navy3 p-3 text-sm text-gray2">
            Estimated delivery: <span className="text-white">{new Date(tracking.estimatedDelivery).toLocaleString()}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserTrackOrder;

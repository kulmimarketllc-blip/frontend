import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import UserPageHeader from '../components/UserPageHeader';
import UserPill from '../components/UserPill';
import { getMyOrders } from '../../../services/checkoutService';
import { addToCart } from '../../../services/shopStorageService';

const ACTIVE_STATUSES = [
  'pending_payment',
  'confirmed',
  'processing',
  'out_for_delivery',
  'ready_for_pickup',
  'picked_up',
  'in_transit',
];

const prettifyStatus = (status = '') => status
  .split('_')
  .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
  .join(' ');

const getStatusColor = (status = '') => {
  if (status === 'delivered') return 'text-green-500 bg-green-500/10';
  if (status === 'cancelled') return 'text-red bg-red/10';
  if (status === 'return_requested' || status === 'returned' || status === 'refunded') {
    return 'text-yellow bg-yellow/10';
  }
  return 'text-yellow bg-yellow/10';
};

const getOrderDescription = (items = []) => {
  if (!items.length) return 'Order items unavailable';
  const first = items[0]?.productName || 'Order item';
  if (items.length === 1) return first;
  return `${first} + ${items.length - 1} more`;
};

const getOrderMeta = (order) => {
  const shippingLabel = (order?.shippingMethod || 'free').replace('_', ' ');
  return `${shippingLabel.charAt(0).toUpperCase() + shippingLabel.slice(1)} Delivery`;
};

const UserOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reorderBusyId, setReorderBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const payload = await getMyOrders({ page: 1, limit: 50 });
        setOrders(Array.isArray(payload?.data) ? payload.data : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filters = useMemo(() => {
    const activeCount = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
    const returnsCount = orders.filter((o) => ['return_requested', 'returned', 'refunded'].includes(o.status)).length;

    return [
      { key: 'all', label: `All (${orders.length})` },
      { key: 'active', label: `Active (${activeCount})` },
      { key: 'delivered', label: `Delivered (${deliveredCount})` },
      { key: 'cancelled', label: `Cancelled (${cancelledCount})` },
      { key: 'returns', label: `Returns (${returnsCount})` },
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'active') return orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    if (selectedFilter === 'delivered') return orders.filter((o) => o.status === 'delivered');
    if (selectedFilter === 'cancelled') return orders.filter((o) => o.status === 'cancelled');
    if (selectedFilter === 'returns') return orders.filter((o) => ['return_requested', 'returned', 'refunded'].includes(o.status));
    return orders;
  }, [orders, selectedFilter]);

  const handleReorder = (order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    const reorderableItems = items.filter((item) => item?.productId);

    if (!reorderableItems.length) {
      setError('This order has no reorderable products. Some items may no longer be available.');
      setMessage('');
      return;
    }

    try {
      setReorderBusyId(order.id);
      setError('');
      let addedCount = 0;

      reorderableItems.forEach((item) => {
        addToCart({
          id: item.productId,
          name: item.productName,
          image: item.productImage,
          price: Number(item.unitPrice || 0),
          store: 'Marketplace Store',
          variant: item.variantId ? `Variant: ${item.variantId}` : 'Standard',
        }, Number(item.quantity || 1));
        addedCount += Number(item.quantity || 1);
      });

      setMessage(`${addedCount} item${addedCount === 1 ? '' : 's'} added to cart from order #${order.id}.`);
      navigate('/cart');
    } catch {
      setError('Unable to reorder right now. Please try again.');
      setMessage('');
    } finally {
      setReorderBusyId('');
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5">
        <UserPageHeader
          title={
            <span>
              My <span className="text-teal">Orders</span>
            </span>
          }
          subtitle="All your orders across all merchants"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setSelectedFilter(filter.key)}
            className={`rounded px-3 py-1.5 text-[0.75rem] font-medium transition-all ${
              selectedFilter === filter.key
                ? 'bg-teal text-navy'
                : 'text-gray2 hover:border-teal hover:text-teal border border-white/[0.07]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}
      {message ? <div className="mb-4 rounded border border-teal/30 bg-teal/10 px-4 py-2 text-sm text-teal">{message}</div> : null}

      <div className="space-y-3">
        {loading && (
          <div className="bg-card rounded-md border border-white/[0.07] p-4 text-sm text-gray2">Loading your orders...</div>
        )}
        {!loading && !filteredOrders.length && (
          <div className="bg-card rounded-md border border-white/[0.07] p-4 text-sm text-gray2">No orders found for this filter.</div>
        )}
        {!loading && filteredOrders.map((order) => (
          <div key={order.id} className="bg-card rounded-md border border-white/[0.07] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3">
              <div>
                <div className="text-teal text-[0.875rem] font-semibold">#{order.id}</div>
                <div className="text-gray text-[0.875rem]">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })} · {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                </div>
              </div>
              <UserPill className={getStatusColor(order.status)}>{prettifyStatus(order.status)}</UserPill>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5">
                {(order.items || []).slice(0, 3).map((item, index) => (
                  <div
                    key={`${order.id}-${index}`}
                    className="h-10 w-10 overflow-hidden rounded-md border border-white/[0.07]"
                  >
                    <img
                      src={item.productImage || 'https://placehold.co/80x80/1f2937/9ca3af?text=Item'}
                      alt={`order-item-${index}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="min-w-42.5 flex-1">
                <div className="text-[0.875rem] lg:text-[1rem] font-medium text-white">{getOrderDescription(order.items)}</div>
                <div className="text-gray mt-0.5 text-[0.875rem]">{getOrderMeta(order)}</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="font-['Syne'] text-[1rem] font-bold text-white">${Number(order.total || 0).toFixed(2)}</div>
                <Link
                  to={`/dashboard/track?id=${order.id}`}
                  className="bg-teal text-navy hover:bg-teal2 rounded px-3 py-1 text-[0.74rem] font-medium no-underline"
                >
                  Track
                </Link>
                <button
                  type="button"
                  onClick={() => handleReorder(order)}
                  disabled={reorderBusyId === order.id}
                  className="text-gray2 hover:border-teal hover:text-teal rounded border border-white/[0.07] px-3 py-1 text-[0.74rem]"
                >
                  {reorderBusyId === order.id ? 'Reordering...' : 'Reorder'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;

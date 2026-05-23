import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, Package, Star, Truck, XCircle } from 'lucide-react';
import UserPageHeader from '../components/UserPageHeader';
import UserPill from '../components/UserPill';
import DashboardStats from '../../../components/DashboardStats';
import LoadingFallback from '../../../router/components/LoadingFallback';
import { fetchCurrentUser } from '../../../services/authService';
import { getMyAddresses, getMyOrders, getMyWishlist } from '../../../services/checkoutService';
import { getWishlistItems } from '../../../services/shopStorageService';

const iconMap = { Package, Truck, Heart, Star };

const statusColor = (status = '') => {
  const normalized = String(status).toLowerCase();
  if (normalized === 'delivered') return 'text-green-500 bg-green-500/10';
  if (normalized === 'cancelled' || normalized === 'refunded' || normalized === 'returned') return 'text-red bg-red/10';
  return 'text-yellow bg-yellow/10';
};

const orderStatusLabel = (status = '') => String(status)
  .split('_')
  .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
  .join(' ');

const UserDashboard = ({ onNav }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, recentOrdersPayload, wishlistPayload, addressesPayload] = await Promise.all([
          fetchCurrentUser(),
          getMyOrders({ page: 1, limit: 5 }),
          getMyWishlist({ page: 1, limit: 8 }),
          getMyAddresses(),
        ]);

        const recentOrders = Array.isArray(recentOrdersPayload?.data) ? recentOrdersPayload.data : [];
        const totalOrders = Number(recentOrdersPayload?.meta?.total);
        const totalOrderPages = Number(recentOrdersPayload?.meta?.pages || 1);

        let allOrders = [...recentOrders];
        if (Number.isFinite(totalOrderPages) && totalOrderPages > 1) {
          const additionalRequests = [];
          for (let page = 2; page <= totalOrderPages; page += 1) {
            additionalRequests.push(getMyOrders({ page, limit: 5 }));
          }
          const additionalPayloads = await Promise.all(additionalRequests);
          additionalPayloads.forEach((payload) => {
            const pageOrders = Array.isArray(payload?.data) ? payload.data : [];
            allOrders = [...allOrders, ...pageOrders];
          });
        }

        const wishlist = Array.isArray(wishlistPayload?.data)
          ? wishlistPayload.data
          : (Array.isArray(wishlistPayload) ? wishlistPayload : []);
        const totalWishlist = Number(wishlistPayload?.meta?.total);
        const addresses = Array.isArray(addressesPayload) ? addressesPayload : [];

        const activeOrders = allOrders.filter((order) => !['delivered', 'cancelled', 'refunded', 'returned'].includes(order.status));
        const deliveredOrders = allOrders.filter((order) => order.status === 'delivered');
        const localWishlistCount = getWishlistItems().length;
        const wishlistCount = Math.max(
          Number.isFinite(totalWishlist) ? totalWishlist : wishlist.length,
          localWishlistCount,
        );
        const savedAddresses = addresses.length;
        const ordersCount = Number.isFinite(totalOrders) ? totalOrders : allOrders.length;

        const stats = [
          { icon: Package, label: 'Orders', val: String(ordersCount), bg: 'bg-teal/10', trend: `${activeOrders.length} active`, up: true },
          { icon: Truck, label: 'In Progress', val: String(activeOrders.length), bg: 'bg-blue-500/10', trend: `${deliveredOrders.length} delivered`, up: true },
          { icon: Heart, label: 'Wishlist', val: String(wishlistCount), bg: 'bg-purple-500/10', trend: 'Saved items', up: true },
          { icon: Star, label: 'Saved Addresses', val: String(savedAddresses), bg: 'bg-yellow/10', trend: 'Delivery locations', up: true },
        ];

        const recentOrderCards = recentOrders.slice(0, 4).map((order) => ({
          id: order.id,
          date: new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          status: orderStatusLabel(order.status),
          statusColor: statusColor(order.status),
          images: (order.items || []).slice(0, 3).map((item) => item.productImage || 'https://placehold.co/80x80/1f2937/9ca3af?text=Item'),
          desc: order.items?.length === 1
            ? (order.items?.[0]?.productName || 'Order item')
            : `${order.items?.[0]?.productName || 'Order item'} + ${(order.items?.length || 0) - 1} more`,
          meta: `${String(order.shippingMethod || 'free').replace('_', ' ')} delivery`,
          total: `$${Number(order.total || 0).toFixed(2)}`,
        }));

        const wishlisted = wishlist.slice(0, 4).map((item) => ({
          id: item.id || item.productId,
          image: item.image || item.productImage || 'https://placehold.co/240x240/111827/9ca3af?text=Saved',
          name: item.name || item.productName || 'Wishlisted Item',
          price: item.price || (item.productPrice ? `$${Number(item.productPrice).toFixed(2)}` : ''),
        }));

        const quickActions = [
          { id: 'orders', label: 'View Orders', sub: 'Check shipping and history' },
          { id: 'track', label: 'Track Order', sub: 'Open live delivery tracking' },
          { id: 'wishlist', label: 'Wishlist', sub: 'Review saved products' },
          { id: 'addresses', label: 'Addresses', sub: 'Manage delivery locations' },
          { id: 'profile', label: 'Profile', sub: 'Update account details' },
        ];

        setData({ user, stats, recentOrders: recentOrderCards, wishlisted, quickActions });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = data?.stats || [];
  const recentOrders = data?.recentOrders || [];
  const wishlisted = data?.wishlisted || [];
  const quickActions = data?.quickActions || [];

  const navigateTo = (key) => {
    if (key === 'track') {
      const orderId = recentOrders[0]?.id;
      if (orderId) {
        navigate(`/dashboard/track?id=${encodeURIComponent(orderId)}`);
        return;
      }
    }
    onNav?.(key);
  };

  if (loading) return <LoadingFallback />;

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <UserPageHeader
          title={<span>Account <span className="text-teal">Overview</span></span>}
          subtitle={`Welcome back, ${data?.user?.firstName || 'Customer'}. Here is your shopping summary.`}
        />
        <button
          type="button"
          onClick={() => onNav?.('orders')}
          className="text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border border-white/[0.07] px-4 py-1.5 text-[0.8rem] transition-colors"
        >
          Go to Orders <ArrowRight size={14} />
        </button>
      </div>

      <DashboardStats stats={stats.map((s) => ({ ...s, icon: iconMap[s.icon?.name] || s.icon }))} />

      <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          <div className="bg-card rounded-md border border-white/[0.07] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-['Syne'] text-[1rem] font-bold text-white">Recent Orders</h3>
              <button type="button" onClick={() => onNav?.('orders')} className="text-gray2 hover:text-teal text-[0.75rem]">View all</button>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-navy3 rounded-md border border-white/[0.07] p-3 transition-colors hover:border-teal/30">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-teal text-[0.875rem] font-semibold">{order.id}</div>
                      <div className="text-gray text-[0.875rem]">{order.date}</div>
                    </div>
                    <UserPill className={order.statusColor}>{order.status}</UserPill>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1.5">
                      {order.images.map((img, index) => (
                        <div key={`${order.id}-${index}`} className="h-9 w-9 overflow-hidden rounded-md border border-white/[0.07]">
                          <img src={img} alt={`order-item-${index}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-42.5 flex-1">
                      {/* Make product name clickable if only one item */}
                      <div className="text-[0.875rem] font-medium text-white lg:text-[1rem]">
                        {order.desc && order.desc !== 'Order item' && order.desc.indexOf('+') === -1 && data?.recentOrders
                          ? (
                              <a
                                href={
                                  `/product/${order.id}`
                                }
                                className="text-teal hover:underline"
                              >
                                {order.desc}
                              </a>
                            )
                          : order.desc}
                      </div>
                      <div className="text-gray mt-0.5 text-[0.875rem]">{order.meta}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="font-['Syne'] text-[0.95rem] font-bold text-white">{order.total}</div>
                      <button type="button" onClick={() => navigateTo('track')} className="bg-teal text-navy hover:bg-teal2 rounded px-3 py-1 text-[0.74rem] font-medium">Track</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-md border border-white/[0.07] p-5">
            <h3 className="mb-4 font-['Syne'] text-[1rem] font-bold text-white">Recently Wishlisted</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {wishlisted.map((item) => (
                <div key={item.id} className="group block overflow-hidden rounded border border-white/[0.07] bg-navy3 transition-all hover:border-teal/30">
                  <div className="relative flex h-20 items-center justify-center overflow-hidden bg-[#0F172A]">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="p-2">
                    <div className="truncate text-[0.875rem] font-medium text-white xl:text-[1rem]">{item.name}</div>
                    <div className="text-teal text-[0.875rem]">{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-md border border-white/[0.07] p-5">
            <h3 className="mb-4 font-['Syne'] text-[1rem] font-bold text-white">Quick Actions</h3>
            <div className="space-y-2.5">
              {quickActions.map((action) => (
                <button key={action.id} type="button" onClick={() => navigateTo(action.id)} className="bg-navy3 hover:border-teal flex w-full items-center justify-between rounded-md border border-white/[0.07] p-3 text-left transition-colors">
                  <div>
                    <div className="text-[0.875rem] font-medium text-white">{action.label}</div>
                    <div className="text-gray text-[0.875rem]">{action.sub}</div>
                  </div>
                  <ArrowRight size={14} className="text-teal" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Truck,
  Heart,
  User,
  MapPin,
  CreditCard,
  Settings,
} from 'lucide-react';
import DashboardShell from '../common/DashboardShell';
import { fetchCurrentUser, getCurrentUser } from '../../services/authService';
import { getMyOrders } from '../../services/checkoutService';
import { getWishlistItems } from '../../services/shopStorageService';

const actionButtons = [];

const UserLayout = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      try {
        const user = await fetchCurrentUser();
        if (!active) return;
        setCurrentUser(user || null);
      } catch {
        if (!active) return;
        setCurrentUser(getCurrentUser());
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSidebarCounts = async () => {
      try {
        const ordersPayload = await getMyOrders({ page: 1, limit: 1 });

        if (!active) return;

        const ordersTotal = Number(ordersPayload?.meta?.total);

        setOrderCount(Number.isFinite(ordersTotal)
          ? ordersTotal
          : (Array.isArray(ordersPayload?.data) ? ordersPayload.data.length : 0));

        setWishlistCount(getWishlistItems().length);
      } catch {
        if (!active) return;
        setOrderCount(0);
        setWishlistCount(getWishlistItems().length);
      }
    };

    loadSidebarCounts();

    const onShopUpdate = () => loadSidebarCounts();
    window.addEventListener('kulmi:shop-updated', onShopUpdate);

    return () => {
      active = false;
      window.removeEventListener('kulmi:shop-updated', onShopUpdate);
    };
  }, [location.pathname]);

  const navSections = useMemo(() => ([
    {
      label: 'Shopping',
      items: [
        { id: 'overview', icon: Home, label: 'Overview', to: '/dashboard' },
        {
          id: 'orders',
          icon: Package,
          label: 'My Orders',
          to: '/dashboard/orders',
          badge: String(orderCount),
          badgeColor: 'bg-red text-white',
        },
        { id: 'track', icon: Truck, label: 'Track Order', to: '/dashboard/track' },
        {
          id: 'wishlist',
          icon: Heart,
          label: 'Wishlist',
          to: '/dashboard/wishlist',
          badge: String(wishlistCount),
          badgeColor: 'bg-blue-500 text-white',
        },
      ],
    },
    {
      label: 'Account',
      items: [
        { id: 'profile', icon: User, label: 'Profile', to: '/dashboard/profile' },
        { id: 'addresses', icon: MapPin, label: 'Addresses', to: '/dashboard/addresses' },
        {
          id: 'payments',
          icon: CreditCard,
          label: 'Payment Methods',
          to: '/dashboard/payments',
        },
        { id: 'settings', icon: Settings, label: 'Settings', to: '/dashboard/settings' },
      ],
    },
  ]), [orderCount, wishlistCount]);

  const headerUser = useMemo(() => {
    const firstName = String(currentUser?.firstName || '').trim();
    const lastName = String(currentUser?.lastName || '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ') || currentUser?.email || 'Customer';
    const initials = `${firstName.charAt(0) || 'C'}${lastName.charAt(0) || ''}`.toUpperCase();
    return {
      initials,
      name,
      subtitle: currentUser?.isVerified ? 'Verified Member' : 'Customer Account',
    };
  }, [currentUser]);

  return (
    <DashboardShell
      panelLabel="User"
      navSections={navSections}
      actionButtons={actionButtons}
      user={headerUser}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default UserLayout;

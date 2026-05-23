import React, { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Users,
  Truck,
  DollarSign,
  CreditCard,
  TrendingUp,
  FolderOpen,
  ImageIcon,
  Tag,
  BarChart3,
  Settings,
} from 'lucide-react';
import DashboardShell from '../common/DashboardShell';
import { fetchCurrentUser, getCurrentUser } from '../../services/authService';
import { getAdminDashboard, getAdminHealth } from '../../services/adminService';

const baseNavSections = [
    {
      label: 'Main',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
        { id: 'orders', icon: Package, label: 'Orders', to: '/admin/orders', badgeColor: 'bg-red' },
        { id: 'products', icon: ShoppingBag, label: 'Products', to: '/admin/products' },
        {
          id: 'merchants',
          icon: Store,
          label: 'Merchants',
          to: '/admin/merchants',
          badgeColor: 'bg-teal text-navy',
        },
        { id: 'customers', icon: Users, label: 'Customers', to: '/admin/customers' },
        // Temporarily hide Delivery from admin sidebar
        // { id: 'delivery', icon: Truck, label: 'Delivery', to: '/admin/delivery' },
      ],
    },
    {
      label: 'Finance',
      items: [
        { id: 'revenue', icon: DollarSign, label: 'Revenue', to: '/admin/revenue' },
        // { id: 'payouts', icon: CreditCard, label: 'Payouts', to: '/admin/payouts' },
        // { id: 'commission', icon: TrendingUp, label: 'Commission', to: '/admin/commission' },
      ],
    },
    {
      label: 'Content',
      items: [
        // { id: 'categories', icon: FolderOpen, label: 'Categories', to: '/admin/categories' },
        // { id: 'banners', icon: ImageIcon, label: 'Banners', to: '/admin/banners' },
        { id: 'coupons', icon: Tag, label: 'Coupons', to: '/admin/coupons' },
      ],
    },
    {
      label: 'System',
      items: [
        // { id: 'analytics', icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
        { id: 'settings', icon: Settings, label: 'Settings', to: '/admin/settings' },
      ],
    },
  ];

const actionButtons = [];

const AdminLayout = () => {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [dashboardStats, setDashboardStats] = useState(null);
  const [healthStats, setHealthStats] = useState(null);

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

    const loadAdminSidebarMetrics = async () => {
      try {
        const [dashboardPayload, healthPayload] = await Promise.all([
          getAdminDashboard(),
          getAdminHealth(),
        ]);

        if (!active) return;
        setDashboardStats(dashboardPayload || null);
        setHealthStats(healthPayload || null);
      } catch {
        if (!active) return;
        setDashboardStats(null);
        setHealthStats(null);
      }
    };

    loadAdminSidebarMetrics();

    return () => {
      active = false;
    };
  }, []);

  const navSections = useMemo(() => {
    const stuckOrders = Number(healthStats?.alerts?.stuckOrders || 0);
    const pendingMerchants = Number(healthStats?.alerts?.pendingMerchants || 0);
    const totalOrders = Number(dashboardStats?.orders?.total || 0);
    const totalMerchants = Number(dashboardStats?.users?.merchants || 0);

    return baseNavSections.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.id === 'orders') {
          const value = stuckOrders > 0 ? stuckOrders : totalOrders;
          return {
            ...item,
            badge: Number(value || 0).toLocaleString(),
          };
        }

        if (item.id === 'merchants') {
          const value = pendingMerchants > 0 ? pendingMerchants : totalMerchants;
          return {
            ...item,
            badge: Number(value || 0).toLocaleString(),
          };
        }

        return item;
      }),
    }));
  }, [dashboardStats, healthStats]);

  const headerUser = useMemo(() => {
    const firstName = String(currentUser?.firstName || '').trim();
    const lastName = String(currentUser?.lastName || '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ') || currentUser?.email || 'Admin';
    const initials = `${firstName.charAt(0) || 'A'}${lastName.charAt(0) || ''}`.toUpperCase();
    const roleTitle = String(currentUser?.role || 'admin').replace(/_/g, ' ');
    const subtitle = roleTitle
      .split(' ')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ');

    return {
      initials,
      name,
      subtitle,
    };
  }, [currentUser]);

  return (
    <DashboardShell
      panelLabel="Admin"
      navSections={navSections}
      actionButtons={actionButtons}
      user={headerUser}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default AdminLayout;
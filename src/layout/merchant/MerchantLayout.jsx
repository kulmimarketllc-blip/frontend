import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ClipboardList,
  DollarSign,
  CreditCard,
  PlusCircle,
  Star,
  Tag,
  Store,
  HelpCircle,
  AlertCircle,
  Clock,
  XCircle,
  Home,
  User,
} from 'lucide-react';
import DashboardShell from '../common/DashboardShell';
import {
  getMyMerchantOrders,
  getMyMerchantProducts,
  getMyMerchantStore,
} from '../../services/merchantService';
import { fetchCurrentUser, getCurrentUser } from '../../services/authService';

const actionButtons = [];

const MerchantLayout = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [merchantName, setMerchantName] = useState('Merchant Account');
  const [ordersCount, setOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [status, setStatus] = useState('loading'); // loading, pending, approved, rejected, suspended, none
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    let active = true;

    const loadLayoutData = async () => {
      try {
        const [user, store] = await Promise.all([
          fetchCurrentUser().catch(() => getCurrentUser()),
          getMyMerchantStore(),
        ]);
        if (!active) return;

        setCurrentUser(user || getCurrentUser());
        setMerchantName(store?.storeName || 'Merchant Account');
        setStatus(store?.status || 'none');
        setRejectionReason(store?.businessInfo?.rejectionReason || '');

        if (store?.status !== 'approved') {
          return;
        }

        const [ordersResult, productsResult] = await Promise.allSettled([
          getMyMerchantOrders({ page: 1, limit: 200 }),
          getMyMerchantProducts({ page: 1, limit: 100 }),
        ]);

        if (!active) return;
        const ordersPayload = ordersResult.status === 'fulfilled' ? ordersResult.value : { data: [] };
        const productsPayload = productsResult.status === 'fulfilled' ? productsResult.value : { data: [] };
        const rows = Array.isArray(ordersPayload?.data) ? ordersPayload.data : [];
        const products = Array.isArray(productsPayload?.data) ? productsPayload.data : [];

        const actionRequiredStatuses = new Set(['confirmed', 'processing']);
        const actionRequiredOrderIds = new Set(
          rows
            .filter((item) => actionRequiredStatuses.has(String(item?.order?.status || '').toLowerCase()))
            .map((item) => item?.order?.id)
            .filter(Boolean)
        );

        const lowStock = products.filter((item) => Number(item.stock || 0) > 0 && Number(item.stock || 0) <= Number(item.lowStockAt || 10)).length;

        setOrdersCount(actionRequiredOrderIds.size);
        setLowStockCount(lowStock);
      } catch {
        if (!active) return;
        setOrdersCount(0);
        setLowStockCount(0);
      }
    };

    loadLayoutData();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const navSections = useMemo(() => [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', to: '/merchant' },
        {
          id: 'orders',
          icon: Package,
          label: 'Orders',
          to: '/merchant/orders',
          badge: String(ordersCount),
          badgeColor: ordersCount > 0 ? 'bg-red text-white' : 'bg-white/10 text-gray2',
        },
        { id: 'products', icon: ShoppingBag, label: 'Products', to: '/merchant/products' },
        {
          id: 'inventory',
          icon: ClipboardList,
          label: 'Inventory',
          to: '/merchant/inventory',
          badge: String(lowStockCount),
          badgeColor: 'bg-teal text-navy',
        },
      ],
    },
    {
      label: 'Finance',
      items: [
        { id: 'earnings', icon: DollarSign, label: 'Earnings', to: '/merchant/earnings' },
        { id: 'payouts', icon: CreditCard, label: 'Payouts', to: '/merchant/payouts' },
      ],
    },
    {
      label: 'Store',
      items: [
        { id: 'add-product', icon: PlusCircle, label: 'Add Product', to: '/merchant/add-product' },
        { id: 'reviews', icon: Star, label: 'Reviews', to: '/merchant/reviews' },
        { id: 'promotions', icon: Tag, label: 'Promotions', to: '/merchant/promotions' },
        { id: 'profile', icon: Store, label: 'Store Profile', to: '/merchant/profile' },
        { id: 'settings', icon: User, label: 'Account Settings', to: '/merchant/settings' },
      ],
    },
    {
      label: 'Support',
      items: [{ id: 'support', icon: HelpCircle, label: 'Help & Support', to: '/merchant/support' }],
    },
  ], [lowStockCount, ordersCount]);

  const headerUser = useMemo(() => {
    const firstName = String(currentUser?.firstName || '').trim();
    const lastName = String(currentUser?.lastName || '').trim();
    const name = [firstName, lastName].filter(Boolean).join(' ') || currentUser?.email || merchantName;
    const initials = `${firstName.charAt(0) || merchantName.charAt(0) || 'M'}${lastName.charAt(0) || ''}`.toUpperCase();

    return {
      initials,
      name,
      subtitle: merchantName || 'Merchant Account',
    };
  }, [currentUser, merchantName]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <Clock className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  if (status !== 'approved') {
    let title = 'Application Under Review';
    let icon = <Clock className="text-teal" size={48} />;
    let desc = 'Our team is currently reviewing your merchant application. This usually takes 1-2 business days. We will notify you once your account is activated.';
    
    if (status === 'rejected') {
      title = 'Application Rejected';
      icon = <XCircle className="text-red" size={48} />;
      desc = rejectionReason 
        ? `We regret to inform you that your merchant application was rejected for the following reason: "${rejectionReason}"`
        : 'We regret to inform you that your merchant application was rejected. Please contact support for more details.';
    } else if (status === 'suspended') {
      title = 'Account Suspended';
      icon = <AlertCircle className="text-red" size={48} />;
      desc = 'Your merchant account has been suspended due to policy violations. Please contact support to resolve this issue.';
    } else if (status === 'none') {
      title = 'Merchant Account Required';
      icon = <Store className="text-teal" size={48} />;
      desc = 'You need to register as a merchant before you can access this dashboard.';
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 text-center">
        <div className="mb-6 rounded-full bg-white/5 p-8">
          {icon}
        </div>
        <h1 className="mb-3 font-['Syne'] text-2xl font-bold text-white">{title}</h1>
        <p className="mx-auto mb-8 max-w-md text-gray">
          {desc}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            <Home size={16} />
            Back to Home
          </button>
          {status === 'rejected' && (
            <button 
              onClick={() => window.location.href = '/merchant/register'}
              className="rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-teal2"
            >
              Re-apply Now
            </button>
          )}
          {status === 'none' && (
            <button 
              onClick={() => window.location.href = '/merchant/register'}
              className="rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-navy transition-all hover:bg-teal2"
            >
              Register as Merchant
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      panelLabel="Merchant"
      navSections={navSections}
      actionButtons={actionButtons}
      user={headerUser}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default MerchantLayout;

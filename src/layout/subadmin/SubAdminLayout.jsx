import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  ChartNoAxesColumn,
  FileBarChart,
  Flag,
  MessageCircle,
  Star,
  Store,
  Ticket,
  Users,
  UserRoundCog,
} from 'lucide-react';
import DashboardShell from '../common/DashboardShell';
import { getCurrentUser } from '../../services/authService';
import subAdminService from '../../services/subAdminService';
import { useEffect, useState, useMemo } from 'react';

const actionButtons = [];

const SubAdminLayout = () => {
  const [stats, setStats] = useState({
    pendingMerchants: 0,
    flaggedReviews: 0,
    flaggedContent: 0,
    activeDisputes: 0,
    supportTickets: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardStats = await subAdminService.getDashboardStats();

        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch sidebar stats:', error);
      }
    };

    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const navSections = useMemo(() => [
    {
      label: 'Moderation',
      items: [
        { id: 'dashboard', icon: ChartNoAxesColumn, label: 'Dashboard', to: '/subadmin' },
        // Temporarily hide Support Tickets from sub-admin sidebar
        // {
        //   id: 'support-tickets',
        //   icon: Ticket,
        //   label: 'Support Tickets',
        //   to: '/subadmin/support-tickets',
        //   badge: stats.openTickets > 0 ? String(stats.openTickets) : null,
        //   badgeColor: 'bg-red text-white',
        // },
        {
          id: 'review-moderation',
          icon: Star,
          label: 'Review Moderation',
          to: '/subadmin/review-moderation',
          badge: stats.flaggedReviews > 0 ? String(stats.flaggedReviews) : null,
          badgeColor: 'bg-yellow text-navy',
        },
        {
          id: 'flagged-content',
          icon: Flag,
          label: 'Flagged Content',
          to: '/subadmin/flagged-content',
          badge: stats.flaggedContent > 0 ? String(stats.flaggedContent) : null,
          badgeColor: 'bg-red text-white',
        },
        {
          id: 'merchant-approvals',
          icon: Store,
          label: 'Merchant Approvals',
          to: '/subadmin/merchant-approvals',
          badge: stats.pendingMerchants > 0 ? String(stats.pendingMerchants) : null,
          badgeColor: 'bg-teal text-navy',
        },
      ],
    },
    {
      label: 'Monitoring',
      items: [
        { id: 'user-management', icon: UserRoundCog, label: 'User Management', to: '/subadmin/user-management' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { id: 'activity-log', icon: Users, label: 'Activity Log', to: '/subadmin/activity-log' },
        { id: 'my-reports', icon: FileBarChart, label: 'My Reports', to: '/subadmin/my-reports' },
      ],
    },
  ], [stats]);
  const user = getCurrentUser();
  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Sub-Admin';
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'SA' : 'SA';

  return (
    <DashboardShell
      panelLabel="Sub-Admin"
      navSections={navSections}
      actionButtons={actionButtons}
      user={{ initials, name, subtitle: 'Sub-Admin Portal' }}
    >
      <Outlet />
    </DashboardShell>
  );
};

export default SubAdminLayout;

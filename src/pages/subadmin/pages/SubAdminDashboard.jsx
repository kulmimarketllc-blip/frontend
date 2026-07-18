import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock3,
  Flag,
  Headset,
  ShieldAlert,
  Store,
  Ticket,
  Loader2,
} from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ActionDialog from '../../../components/ui/modals/ActionDialog';

const SubAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, ticketsData] = await Promise.all([
          subAdminService.getDashboardStats(),
          subAdminService.listSupportTickets({ limit: 5, status: 'open' }),
        ]);
        
        setStats(statsData);
        
        const ticketsArray = Array.isArray(ticketsData.data) 
          ? ticketsData.data 
          : (Array.isArray(ticketsData) ? ticketsData : []);
        
        setTickets(ticketsArray);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportLog = async () => {
    try {
      const result = await subAdminService.exportActivityLog();
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', result.filename || 'activity_log.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Activity log exported successfully');
    } catch (error) {
      
      toast.error('Failed to export log');
    }
  };

  const handleNewReport = () => setReportDialogOpen(true);

  const confirmNewReport = async ({ title }) => {
    try {
      await subAdminService.generateReport(title, 'Manually generated moderation report from dashboard.');
      toast.success('New report generated! View it in "My Reports"');
    } catch (error) {
      toast.error('Failed to generate report');
      throw error;
    }
  };

  const dashboardCards = stats ? [
    { label: 'Pending Merchants', value: stats.pendingMerchants, note: 'Awaiting approval', icon: Store, iconTone: 'text-teal', tone: 'text-teal', link: '/subadmin/merchant-approvals' },
    { label: 'Flagged Reviews', value: stats.flaggedReviews, note: 'Needs moderation', icon: AlertTriangle, iconTone: 'text-yellow', tone: 'text-yellow', link: '/subadmin/review-moderation' },
    { label: 'Flagged Products', value: stats.flaggedContent, note: 'Violation reports', icon: Flag, iconTone: 'text-red', tone: 'text-red', link: '/subadmin/flagged-content' },
    { label: 'Order Disputes', value: stats.activeDisputes, note: 'Customer issues', icon: Ticket, iconTone: 'text-purple-400', tone: 'text-purple-400', link: '/subadmin/order-disputes' },
  ] : [];

  if (loading && !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={
          <>
            <span>Sub-Admin </span>
            <span className="text-teal">Dashboard</span>
          </>
        }
        subtitle="Moderation and support overview"
        actions={
          <>
            <button 
              onClick={handleExportLog}
              className="border-border text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border px-3 py-1.5 text-[0.8rem] transition-colors"
            >
              <Headset size={14} /> Export Log
            </button>
            <button 
              onClick={handleNewReport}
              className="bg-teal text-navy hover:bg-teal2 rounded px-3 py-1.5 text-[0.8rem] font-semibold"
            >
              New Report
            </button>
          </>
        }
      />

      <div className="mb-5 flex items-start gap-3 rounded-md border border-purple-500/40 bg-purple-500/10 px-4 py-3">
        <ShieldAlert size={18} className="mt-0.5 shrink-0 text-purple-300" />
        <p className="text-gray2 text-[0.875rem]">
          <span className="font-semibold text-purple-300">Restricted Access:</span> You have moderation and support permissions only. Financial data and platform settings are handled by admin.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-md border border-white/[0.07] p-5 transition-colors">
              <Icon size={20} className={`${stat.iconTone} mb-3`} />
              <div className="text-gray mb-1 text-[0.875rem] font-semibold">{stat.label}</div>
              <div className="font-['Syne'] text-[1.7rem] font-extrabold text-white">{stat.value}</div>
              <div className={`${stat.tone} mt-1 text-[0.875rem]`}>{stat.note}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
        <div className="bg-card border-border overflow-hidden rounded-md border">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-['Syne'] text-[1rem] font-bold text-white">Recent Support Tickets</h3>
            <Link to="/subadmin/support-tickets" className="text-teal hover:underline text-[0.75rem]">View All</Link>
          </div>
          <div className="space-y-2 p-3">
            {tickets.length > 0 ? tickets.map((ticket) => (
              <div key={ticket.id} className="border-border hover:border-teal/30 rounded-md border p-3 transition-colors">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-gray text-[0.75rem]">#{ticket.id?.slice(-6) || 'N/A'}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
                    ticket.priority === 'high' ? 'bg-red/10 text-red' : 
                    ticket.priority === 'medium' ? 'bg-yellow/10 text-yellow' : 'bg-green-500/10 text-green-500'
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {ticket.priority?.toUpperCase() || 'NORMAL'}
                  </span>
                </div>
                <p className="mb-1 text-[0.875rem] font-semibold text-white">{ticket.subject}</p>
                <div className="flex items-center justify-between">
                  <p className="text-gray text-[0.8rem]">{ticket.customer?.firstName} {ticket.customer?.lastName}</p>
                  <span className="text-gray text-[0.7rem]">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )) : (
              <div className="text-gray py-10 text-center">No open tickets</div>
            )}
            <Link to="/subadmin/support-tickets" className="border-border text-gray2 hover:border-teal hover:text-teal block w-full rounded border px-3 py-2 text-center text-[0.8rem] font-medium transition-colors">
              Go to Support Center
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-card border-border rounded-md border p-3">
            <h3 className="mb-2 font-['Syne'] text-[1rem] font-bold text-white">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { icon: Store, text: 'Review Merchant Applications', link: '/subadmin/merchant-approvals' },
                { icon: AlertTriangle, text: 'Moderate Flagged Reviews', link: '/subadmin/review-moderation' },
                { icon: Flag, text: 'Review Flagged Content', link: '/subadmin/flagged-content' },
                { icon: Ticket, text: 'View Order Disputes', link: '/subadmin/order-disputes' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.text} to={action.link} className="bg-navy3 border-border text-gray2 hover:border-teal hover:text-teal flex w-full items-center gap-2 rounded border px-3 py-2 text-[0.8rem] transition-colors">
                    <Icon size={14} /> {action.text}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-card border-border rounded-md border p-3">
            <h3 className="mb-2 font-['Syne'] text-[1rem] font-bold text-white">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.875rem] text-gray2">System Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[0.7rem] font-semibold text-green-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.875rem] text-gray2">Pending Alerts</span>
                <span className="text-[0.875rem] font-bold text-white">{(stats?.pendingMerchants || 0) + (stats?.flaggedReviews || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onConfirm={confirmNewReport}
        tone="primary"
        title="Generate Report"
        message="A new moderation report will be created and saved under My Reports."
        confirmText="Generate"
        fields={[{
          name: 'title',
          label: 'Report Title',
          required: true,
          defaultValue: `Moderation Report - ${new Date().toLocaleDateString()}`,
          placeholder: 'Enter a title for this report...',
        }]}
      />
    </div>
  );
};

export default SubAdminDashboard;

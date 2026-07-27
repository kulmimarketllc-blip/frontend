import React, { useEffect, useState } from 'react';
import { Eye, Filter, Loader2, RefreshCw, Ticket } from 'lucide-react';
import { toast } from 'react-toastify';
import supportService from '../../services/supportService';
import SupportTicketDetailModal from './SupportTicketDetailModal';
import Pagination from '../../pages/admin/components/Pagination';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  formatTicketCategory,
  formatTicketStatus,
  normalizeTicketList,
  normalizeTicketMeta,
  priorityBadgeClass,
  statusBadgeClass,
} from './supportTicketUtils';

const ITEMS_PER_PAGE = 10;

const StaffSupportTicketsPage = ({ PageHeader }) => {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
  });

  const fetchData = async (page = currentPage) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
      };

      const [listResponse, countResponse] = await Promise.all([
        supportService.listTickets(params),
        supportService.getTicketCounts().catch(() => ({ open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 })),
      ]);

      setTickets(normalizeTicketList(listResponse));
      const meta = normalizeTicketMeta(listResponse);
      setTotalItems(meta.total);
      setCurrentPage(page);
      setCounts({
        open: countResponse.open || 0,
        inProgress: countResponse.inProgress || 0,
        resolved: countResponse.resolved || 0,
        closed: countResponse.closed || 0,
        total: countResponse.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.category]);

  const applySearch = () => fetchData(1);

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <PageHeader
        title={<><span>Support </span><span className="text-teal">Tickets</span></>}
        subtitle="Manage customer support requests and reply to inquiries"
        actions={(
          <>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="border-border text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border px-3 py-1.5 text-[0.8rem] transition-colors"
            >
              <Filter size={14} /> Filters
            </button>
            <button
              type="button"
              onClick={() => fetchData(currentPage)}
              className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-3 py-1.5 text-[0.8rem] font-semibold"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </>
        )}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          { label: 'Open', value: counts.open, tone: 'text-red' },
          { label: 'In Progress', value: counts.inProgress, tone: 'text-yellow' },
          { label: 'Resolved', value: counts.resolved, tone: 'text-green-500' },
          { label: 'Closed', value: counts.closed, tone: 'text-gray2' },
          { label: 'Total', value: counts.total, tone: 'text-teal' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border-border rounded-md border p-4">
            <div className="text-gray text-[0.7rem] uppercase tracking-[0.1em]">{stat.label}</div>
            <div className={`font-syne text-[1.8rem] ${stat.tone}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {showFilters ? (
        <div className="bg-card border-border mb-4 grid gap-3 rounded-md border p-4 md:grid-cols-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="bg-navy3 focus:border-teal rounded-md border border-white/[0.08] px-3 py-2 text-[0.85rem] text-white outline-none"
          >
            {TICKET_STATUSES.map((option) => (
              <option key={option.value || 'all-status'} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            className="bg-navy3 focus:border-teal rounded-md border border-white/[0.08] px-3 py-2 text-[0.85rem] text-white outline-none"
          >
            {TICKET_PRIORITIES.map((option) => (
              <option key={option.value || 'all-priority'} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="bg-navy3 focus:border-teal rounded-md border border-white/[0.08] px-3 py-2 text-[0.85rem] text-white outline-none"
          >
            <option value="">All categories</option>
            {TICKET_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
              placeholder="Search tickets..."
              className="bg-navy3 focus:border-teal min-w-0 flex-1 rounded-md border border-white/[0.08] px-3 py-2 text-[0.85rem] text-white outline-none"
            />
            <button
              type="button"
              onClick={applySearch}
              className="bg-teal text-navy hover:bg-teal2 rounded-md px-3 py-2 text-[0.8rem] font-semibold"
            >
              Go
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-card border-border overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-navy3">
                {['Ticket', 'Customer', 'Subject', 'Category', 'Priority', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="text-gray px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] uppercase">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <Loader2 className="text-teal mx-auto animate-spin" size={32} />
                  </td>
                </tr>
              ) : tickets.length > 0 ? tickets.map((ticket) => (
                <tr key={ticket.id} className="border-border border-b last:border-none">
                  <td className="px-3 py-2.5 text-[0.875rem] text-white">
                    <div className="flex items-center gap-1.5">
                      <Ticket size={13} className="text-teal" />
                      {ticket.ticketNo || `#${String(ticket.id).slice(-6)}`}
                    </div>
                    <div className="text-gray text-[0.7rem]">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-white">
                      {ticket.customer?.firstName} {ticket.customer?.lastName}
                    </div>
                    <div className="text-gray text-[0.7rem]">{ticket.customer?.email}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="max-w-[220px] truncate text-[0.875rem] font-medium text-white">{ticket.subject}</div>
                    {ticket.orderId ? (
                      <div className="text-teal text-[0.7rem]">Order #{ticket.orderId}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 capitalize text-[0.8rem] text-gray2">{formatTicketCategory(ticket.category)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold capitalize ${priorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold capitalize ${statusBadgeClass(ticket.status)}`}>
                      {formatTicketStatus(ticket.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="text-blue-500 bg-blue-500/10 flex items-center gap-1 rounded border border-blue-500/30 px-2 py-1 text-[0.7rem] font-semibold"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-gray py-20 text-center">No support tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={(page) => fetchData(page)}
        loading={loading}
      />

      {selectedTicketId ? (
        <SupportTicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onUpdated={() => fetchData(currentPage)}
          isStaff
        />
      ) : null}
    </div>
  );
};

export default StaffSupportTicketsPage;

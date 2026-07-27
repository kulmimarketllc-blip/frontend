import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Headphones, Loader2, MessageSquarePlus, Plus, Ticket, Clock, CheckCircle2,
  Package, CreditCard, Truck, User, Store, HelpCircle, RefreshCw, Search,
} from 'lucide-react';
import { toast } from 'react-toastify';
import UserPageHeader from '../components/UserPageHeader';
import supportService from '../../../services/supportService';
import { getMyOrders } from '../../../services/checkoutService';
import UserTicketDetailModal from '../../../components/support/UserTicketDetailModal';
import Pagination from '../../admin/components/Pagination';
import {
  TICKET_CATEGORIES,
  SUPPORT_FAQ,
  USER_STATUS_FILTERS,
  formatTicketCategory,
  formatTicketStatus,
  normalizeTicketList,
  normalizeTicketMeta,
  priorityBadgeClass,
  statusBadgeClass,
} from '../../../components/support/supportTicketUtils';

const ITEMS_PER_PAGE = 8;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low — general question' },
  { value: 'medium', label: 'Medium — needs attention' },
  { value: 'high', label: 'High — order or payment issue' },
  { value: 'urgent', label: 'Urgent — time-sensitive problem' },
];

const CATEGORY_ICONS = {
  order: Package,
  payment: CreditCard,
  delivery: Truck,
  account: User,
  merchant: Store,
  other: HelpCircle,
};

const emptyForm = {
  subject: '',
  description: '',
  category: 'other',
  priority: 'medium',
  orderId: '',
};

const UserSupport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get('new') === '1' ? 'create' : 'list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [form, setForm] = useState({
    ...emptyForm,
    orderId: searchParams.get('orderId') || '',
    category: searchParams.get('category') || 'other',
  });
  const [selectedTicketId, setSelectedTicketId] = useState(searchParams.get('ticket') || null);

  const fetchTickets = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
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
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load your support tickets');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchTickets(1);
  }, [fetchTickets]);

  useEffect(() => {
    getMyOrders({ page: 1, limit: 30 })
      .then((payload) => setOrders(Array.isArray(payload?.data) ? payload.data : []))
      .catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    const ticketId = searchParams.get('ticket');
    if (ticketId) setSelectedTicketId(ticketId);
  }, [searchParams]);

  const openCreateForm = (orderId = '') => {
    setForm({ ...emptyForm, orderId, category: orderId ? 'order' : 'other' });
    setView('create');
    setSearchParams(orderId ? { new: '1', orderId } : { new: '1' });
  };

  const openTicketList = () => {
    setView('list');
    setSearchParams({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.subject.trim().length < 5) {
      toast.error('Subject must be at least 5 characters');
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      const created = await supportService.createTicket({
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        ...(form.orderId ? { orderId: form.orderId } : {}),
      });
      toast.success(`Ticket ${created?.ticketNo || ''} created. Our team will respond soon.`);
      setForm(emptyForm);
      setView('list');
      setSearchParams({});
      fetchTickets(1);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = useMemo(() => ([
    { label: 'Open', value: counts.open, icon: MessageSquarePlus, tone: 'text-red' },
    { label: 'In Progress', value: counts.inProgress, icon: Clock, tone: 'text-yellow' },
    { label: 'Resolved', value: counts.resolved + counts.closed, icon: CheckCircle2, tone: 'text-green-500' },
    { label: 'Total', value: counts.total, icon: Headphones, tone: 'text-teal' },
  ]), [counts]);

  return (
    <div className="animate-[fadeUp_0.4s_ease_both] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <UserPageHeader
          title={<>Help & <span className="text-teal">Support</span></>}
          subtitle="Open a ticket for order, payment, delivery, or account help. Our team replies here."
        />
        <div className="flex flex-wrap gap-2">
          {view === 'list' ? (
            <button
              type="button"
              onClick={() => fetchTickets(currentPage)}
              className="border-border text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded-md border px-3 py-2 text-[0.8rem] font-semibold"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => (view === 'create' ? openTicketList() : openCreateForm())}
            className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded-md px-4 py-2.5 text-[0.85rem] font-semibold transition-colors"
          >
            {view === 'create' ? <Ticket size={16} /> : <Plus size={16} />}
            {view === 'create' ? 'My Tickets' : 'New Ticket'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border-border rounded-md border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray text-[0.7rem] uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={16} className={stat.tone} />
            </div>
            <div className={`font-syne text-[1.6rem] font-bold ${stat.tone}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {view === 'create' ? (
            <form onSubmit={handleSubmit} className="bg-card border-border space-y-5 rounded-md border p-5">
              <div>
                <h2 className="font-syne text-[1.1rem] font-bold text-white">Submit a Support Request</h2>
                <p className="text-gray mt-1 text-[0.85rem]">Tell us what went wrong and we will get back to you on this page.</p>
              </div>

              <div>
                <label className="text-gray mb-2 block text-[0.75rem] font-medium uppercase tracking-wider">What do you need help with?</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TICKET_CATEGORIES.map((option) => {
                    const Icon = CATEGORY_ICONS[option.value] || HelpCircle;
                    const active = form.category === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, category: option.value }))}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-left text-[0.8rem] transition-colors ${
                          active
                            ? 'border-teal bg-teal/10 text-teal'
                            : 'border-border text-gray2 hover:border-teal/40 hover:text-white'
                        }`}
                      >
                        <Icon size={15} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-gray mb-1.5 block text-[0.75rem] font-medium uppercase tracking-wider">Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. My order has not arrived yet"
                  className="bg-navy3 focus:border-teal w-full rounded-md border border-white/8 px-3 py-2.5 text-[0.9rem] text-white outline-none"
                  maxLength={180}
                />
                <p className="text-gray mt-1 text-[0.7rem]">{form.subject.length}/180</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-gray mb-1.5 block text-[0.75rem] font-medium uppercase tracking-wider">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="bg-navy3 focus:border-teal w-full rounded-md border border-white/8 px-3 py-2.5 text-[0.9rem] text-white outline-none"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray mb-1.5 block text-[0.75rem] font-medium uppercase tracking-wider">Related Order</label>
                  <select
                    value={form.orderId}
                    onChange={(e) => setForm((prev) => ({ ...prev, orderId: e.target.value }))}
                    className="bg-navy3 focus:border-teal w-full rounded-md border border-white/8 px-3 py-2.5 text-[0.9rem] text-white outline-none"
                  >
                    <option value="">No specific order</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        #{order.id} · {String(order.status || '').replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray mb-1.5 block text-[0.75rem] font-medium uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  placeholder="Describe your issue in detail. Include dates, what you expected, and what happened instead."
                  className="bg-navy3 focus:border-teal w-full resize-none rounded-md border border-white/8 px-3 py-2.5 text-[0.9rem] text-white outline-none"
                  maxLength={2000}
                />
                <p className="text-gray mt-1 text-[0.7rem]">{form.description.length}/2000 · minimum 10 characters</p>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={openTicketList}
                  className="border-border text-gray2 hover:border-teal hover:text-teal rounded-md border px-4 py-2.5 text-[0.85rem] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-teal text-navy hover:bg-teal2 rounded-md px-5 py-2.5 text-[0.85rem] font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {USER_STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => { setStatusFilter(filter.value); setCurrentPage(1); }}
                    className={`rounded-md px-3 py-1.5 text-[0.75rem] font-semibold transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-teal text-navy'
                        : 'border-border text-gray2 hover:border-teal hover:text-teal border'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="mb-3 flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search size={14} className="text-gray pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchTickets(1); }}
                    placeholder="Search your tickets..."
                    className="bg-navy3 focus:border-teal w-full rounded-md border border-white/8 py-2 pr-3 pl-9 text-[0.85rem] text-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fetchTickets(1)}
                  className="bg-teal text-navy hover:bg-teal2 rounded-md px-3 py-2 text-[0.8rem] font-semibold"
                >
                  Search
                </button>
              </div>

              <div className="bg-card border-border overflow-hidden rounded-md border">
                {loading && tickets.length === 0 ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="text-teal animate-spin" size={32} />
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="divide-y divide-white/6">
                    {tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => {
                          setSelectedTicketId(ticket.id);
                          setSearchParams({ ticket: ticket.id });
                        }}
                        className="hover:bg-navy3/30 flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-teal text-[0.75rem] font-semibold">
                              {ticket.ticketNo || `#${String(ticket.id).slice(-6)}`}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold capitalize ${statusBadgeClass(ticket.status)}`}>
                              {formatTicketStatus(ticket.status)}
                            </span>
                          </div>
                          <h3 className="truncate text-[0.95rem] font-semibold text-white">{ticket.subject}</h3>
                          <p className="text-gray mt-1 text-[0.8rem]">
                            {formatTicketCategory(ticket.category)}
                            {ticket.orderId ? ` · Order #${ticket.orderId}` : ''}
                            {' · '}
                            {new Date(ticket.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-gray2 shrink-0 text-[0.75rem]">Open →</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-16 text-center">
                    <Headphones className="text-teal mx-auto mb-3 opacity-80" size={40} />
                    <p className="font-syne text-[1rem] font-bold text-white">No tickets found</p>
                    <p className="text-gray mx-auto mt-1 max-w-md text-[0.85rem]">
                      {statusFilter !== 'all' || search
                        ? 'Try a different filter or search term.'
                        : 'Need help? Create a ticket and our support team will respond here.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => openCreateForm()}
                      className="bg-teal text-navy hover:bg-teal2 mt-4 inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-[0.85rem] font-semibold"
                    >
                      <Plus size={16} /> Create Ticket
                    </button>
                  </div>
                )}
              </div>

              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => fetchTickets(page)}
                loading={loading}
              />
            </>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-card border-border rounded-md border p-4">
            <h3 className="font-syne mb-3 text-[0.95rem] font-bold text-white">How it works</h3>
            <ol className="text-gray2 space-y-2.5 text-[0.8rem]">
              <li className="flex gap-2"><span className="text-teal font-bold">1.</span> Submit a ticket with your issue</li>
              <li className="flex gap-2"><span className="text-teal font-bold">2.</span> Support team reviews and replies here</li>
              <li className="flex gap-2"><span className="text-teal font-bold">3.</span> You get notified when there is an update</li>
            </ol>
          </div>

          <div className="bg-card border-border rounded-md border p-4">
            <h3 className="font-syne mb-3 text-[0.95rem] font-bold text-white">Common Questions</h3>
            <div className="space-y-3">
              {SUPPORT_FAQ.map((item) => (
                <div key={item.q}>
                  <p className="text-[0.8rem] font-semibold text-white">{item.q}</p>
                  <p className="text-gray mt-0.5 text-[0.75rem] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal/5 border-teal/20 rounded-md border p-4">
            <p className="text-[0.8rem] font-semibold text-white">Need help with a specific order?</p>
            <p className="text-gray mt-1 text-[0.75rem]">Open a ticket from your orders page with the order pre-selected.</p>
            <Link
              to="/dashboard/orders"
              className="text-teal hover:underline mt-2 inline-block text-[0.8rem] font-semibold"
            >
              Go to My Orders →
            </Link>
          </div>
        </aside>
      </div>

      {selectedTicketId ? (
        <UserTicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => {
            setSelectedTicketId(null);
            setSearchParams({});
          }}
          onUpdated={() => fetchTickets(currentPage)}
        />
      ) : null}
    </div>
  );
};

export default UserSupport;

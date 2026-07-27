import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Ticket, Loader2, Send, UserPlus, CheckCircle2, MessageCircle, Lock,
} from 'lucide-react';
import { toast } from 'react-toastify';
import supportService from '../../services/supportService';
import subAdminService from '../../services/subAdminService';
import {
  formatTicketCategory,
  formatTicketStatus,
  priorityBadgeClass,
  statusBadgeClass,
} from './supportTicketUtils';

const SupportTicketDetailModal = ({
  ticketId,
  onClose,
  onUpdated,
  isStaff = true,
}) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [assigneeId, setAssigneeId] = useState('');

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await supportService.getTicket(ticketId);
      setTicket(data);
      setAssigneeId(data?.assignedToId || '');
    } catch (error) {
      console.error('Failed to load ticket:', error);
      toast.error('Failed to load ticket details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ticketId) return;
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => {
    if (!isStaff) return;

    const loadStaff = async () => {
      try {
        const [subAdmins, admins] = await Promise.all([
          subAdminService.listUsers({ role: 'sub_admin', limit: 50 }).catch(() => ({ data: [] })),
          subAdminService.listUsers({ role: 'admin', limit: 20 }).catch(() => ({ data: [] })),
        ]);
        const combined = [
          ...(Array.isArray(subAdmins?.data) ? subAdmins.data : []),
          ...(Array.isArray(admins?.data) ? admins.data : []),
        ];
        setStaffUsers(combined);
      } catch {
        setStaffUsers([]);
      }
    };

    loadStaff();
  }, [isStaff]);

  const handleReply = async () => {
    const message = reply.trim();
    if (message.length < 2) {
      toast.error('Reply must be at least 2 characters');
      return;
    }

    try {
      setSending(true);
      await supportService.addTicketReply(ticketId, message, isStaff && isInternal);
      setReply('');
      setIsInternal(false);
      await loadTicket();
      onUpdated?.();
      toast.success('Reply sent');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (status) => {
    try {
      setSending(true);
      await supportService.updateTicketStatus(ticketId, status);
      await loadTicket();
      onUpdated?.();
      toast.success(`Ticket marked as ${formatTicketStatus(status)}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async () => {
    try {
      setSending(true);
      await supportService.assignTicket(ticketId, assigneeId || undefined);
      await loadTicket();
      onUpdated?.();
      toast.success(assigneeId ? 'Ticket assigned' : 'Ticket unassigned');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setSending(false);
    }
  };

  if (!ticketId) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget && !sending) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card border-border my-auto flex w-full max-w-2xl flex-col rounded-xl border shadow-2xl animate-[fadeUp_0.25s_ease_both] max-h-[min(92vh,820px)]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-teal/10 text-teal border-teal/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
              <Ticket size={18} />
            </div>
            <div>
              <h3 className="font-syne text-[0.95rem] font-bold text-white">
                Ticket <span className="text-teal">Details</span>
              </h3>
              <p className="text-gray mt-0.5 text-xs">
                {ticket?.ticketNo || `#${String(ticketId).slice(-6)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="text-gray2 hover:bg-white/10 hover:text-white rounded-lg p-1 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="text-teal animate-spin" size={36} />
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-syne text-[1.05rem] font-bold text-white">{ticket.subject}</h4>
                  <p className="text-gray mt-1 text-xs">
                    Opened {new Date(ticket.createdAt).toLocaleString()}
                    {ticket.customer && isStaff ? (
                      <> · {ticket.customer.firstName} {ticket.customer.lastName}</>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold capitalize ${statusBadgeClass(ticket.status)}`}>
                    {formatTicketStatus(ticket.status)}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold capitalize ${priorityBadgeClass(ticket.priority)}`}>
                    {ticket.priority} priority
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <div className="bg-navy3/40 rounded-lg px-3 py-2">
                  <p className="text-gray mb-0.5 font-bold uppercase tracking-wider">Category</p>
                  <p className="font-medium capitalize text-white">{formatTicketCategory(ticket.category)}</p>
                </div>
                {ticket.orderId ? (
                  <div className="bg-navy3/40 rounded-lg px-3 py-2">
                    <p className="text-gray mb-0.5 font-bold uppercase tracking-wider">Order</p>
                    <p className="font-medium text-teal">#{ticket.orderId}</p>
                  </div>
                ) : null}
                {isStaff && ticket.assignedTo ? (
                  <div className="bg-navy3/40 rounded-lg px-3 py-2">
                    <p className="text-gray mb-0.5 font-bold uppercase tracking-wider">Assigned To</p>
                    <p className="font-medium text-white">
                      {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="bg-navy3/40 rounded-lg px-3 py-2.5">
                <p className="text-gray mb-1 text-[0.65rem] font-bold uppercase tracking-wider">Description</p>
                <p className="text-gray2 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div>
                <p className="text-gray mb-2 text-[0.65rem] font-bold uppercase tracking-wider">Conversation</p>
                <div className="space-y-2.5">
                  {(ticket.replies || []).length > 0 ? ticket.replies.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-r-lg border-l-2 py-2 pl-3 pr-2 ${
                        item.isInternal
                          ? 'border-yellow bg-yellow/5'
                          : item.author?.role === 'customer'
                            ? 'border-blue-500 bg-blue-500/5'
                            : 'border-teal bg-navy3/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white">
                        <span>
                          {item.author?.firstName} {item.author?.lastName}
                          {item.author?.role ? (
                            <span className="text-gray ml-1 font-normal capitalize">({item.author.role.replace(/_/g, ' ')})</span>
                          ) : null}
                        </span>
                        {item.isInternal ? (
                          <span className="text-yellow flex items-center gap-1 text-[0.65rem] font-semibold uppercase">
                            <Lock size={10} /> Internal
                          </span>
                        ) : null}
                        <span className="text-gray text-[0.65rem] font-normal">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray2 mt-1 text-sm whitespace-pre-wrap">{item.message}</p>
                    </div>
                  )) : (
                    <div className="text-gray bg-navy3/40 rounded-lg px-3 py-4 text-center text-xs italic">
                      No replies yet. {isStaff ? 'Be the first to respond.' : 'Our team will respond soon.'}
                    </div>
                  )}
                </div>
              </div>

              {ticket.status !== 'closed' && ticket.status !== 'resolved' ? (
                <div className="bg-navy3/30 rounded-lg border border-white/[0.06] p-3">
                  <label className="text-gray mb-2 block text-[0.65rem] font-bold uppercase tracking-wider">
                    {isStaff ? 'Reply to customer' : 'Add a reply'}
                  </label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder={isStaff ? 'Type your response...' : 'Add more details or ask a follow-up question...'}
                    className="bg-navy2 focus:border-teal w-full resize-none rounded-md border border-white/[0.08] px-3 py-2.5 text-[0.85rem] text-white outline-none"
                  />
                  {isStaff ? (
                    <label className="text-gray2 mt-2 flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="accent-teal"
                      />
                      Internal note (hidden from customer)
                    </label>
                  ) : null}
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleReply}
                      disabled={sending || reply.trim().length < 2}
                      className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded-md px-4 py-2 text-[0.8rem] font-semibold transition-colors disabled:opacity-50"
                    >
                      {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : null}

              {isStaff ? (
                <div className="bg-navy3/30 rounded-lg border border-white/[0.06] p-3">
                  <p className="text-gray mb-2 text-[0.65rem] font-bold uppercase tracking-wider">Assign Ticket</p>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="bg-navy2 focus:border-teal min-w-[200px] flex-1 rounded-md border border-white/[0.08] px-3 py-2 text-[0.85rem] text-white outline-none"
                    >
                      <option value="">Unassigned</option>
                      {staffUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({String(user.role).replace(/_/g, ' ')})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={sending}
                      className="border-border text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded-md border px-3 py-2 text-[0.8rem] font-semibold"
                    >
                      <UserPlus size={14} /> Save
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-white/[0.07] px-5 py-4">
              <button
                onClick={onClose}
                disabled={sending}
                className="text-gray2 hover:bg-white/5 hover:text-white rounded-md border border-white/10 px-4 py-2 text-[0.8rem] font-semibold transition-colors"
              >
                Close
              </button>
              {isStaff && ticket.status !== 'in_progress' && ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                <button
                  onClick={() => handleStatus('in_progress')}
                  disabled={sending}
                  className="text-yellow bg-yellow/10 border-yellow/40 flex items-center gap-1.5 rounded-md border px-4 py-2 text-[0.8rem] font-semibold"
                >
                  <MessageCircle size={14} /> In Progress
                </button>
              ) : null}
              {isStaff && ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                <button
                  onClick={() => handleStatus('resolved')}
                  disabled={sending}
                  className="flex items-center gap-1.5 rounded-md bg-green-500 px-4 py-2 text-[0.8rem] font-bold text-navy hover:brightness-110 disabled:opacity-50"
                >
                  <CheckCircle2 size={14} /> Resolve
                </button>
              ) : null}
              {isStaff && ticket.status === 'resolved' ? (
                <button
                  onClick={() => handleStatus('closed')}
                  disabled={sending}
                  className="border-border text-gray2 hover:border-teal hover:text-teal rounded-md border px-4 py-2 text-[0.8rem] font-semibold"
                >
                  Close Ticket
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default SupportTicketDetailModal;

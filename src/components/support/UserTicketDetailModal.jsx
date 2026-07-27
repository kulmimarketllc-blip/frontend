import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Ticket, Loader2, Send, CheckCircle2, Clock, Headphones } from 'lucide-react';
import { toast } from 'react-toastify';
import supportService from '../../services/supportService';
import { getCurrentUser } from '../../services/authService';
import {
  formatAuthorLabel,
  formatTicketCategory,
  formatTicketStatus,
  priorityBadgeClass,
  statusBadgeClass,
} from './supportTicketUtils';

const UserTicketDetailModal = ({ ticketId, onClose, onUpdated }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const viewer = getCurrentUser();

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await supportService.getTicket(ticketId);
      setTicket(data);
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

  const handleReply = async () => {
    const message = reply.trim();
    if (message.length < 2) {
      toast.error('Reply must be at least 2 characters');
      return;
    }

    try {
      setSending(true);
      await supportService.addTicketReply(ticketId, message, false);
      setReply('');
      await loadTicket();
      onUpdated?.();
      toast.success('Reply sent to support team');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const canReply = ticket && !['closed', 'resolved'].includes(ticket.status);

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
              <h3 className="font-syne text-[0.95rem] font-bold text-white">Your Support Ticket</h3>
              <p className="text-gray mt-0.5 text-xs">{ticket?.ticketNo || `#${String(ticketId).slice(-6)}`}</p>
            </div>
          </div>
          <button
            type="button"
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
                  <p className="text-gray mt-1 text-xs">Submitted {new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold capitalize ${statusBadgeClass(ticket.status)}`}>
                    {formatTicketStatus(ticket.status)}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold capitalize ${priorityBadgeClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              {ticket.status === 'open' ? (
                <div className="flex items-center gap-2 rounded-lg border border-yellow/30 bg-yellow/5 px-3 py-2 text-xs text-yellow">
                  <Clock size={14} /> Waiting for support team to review your request.
                </div>
              ) : null}
              {ticket.status === 'in_progress' ? (
                <div className="flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2 text-xs text-teal">
                  <Headphones size={14} /> Support team is working on your ticket.
                </div>
              ) : null}
              {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-500">
                  <CheckCircle2 size={14} /> This ticket has been resolved. Reply is no longer available.
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-navy3/40 rounded-lg px-3 py-2">
                  <p className="text-gray mb-0.5 font-bold uppercase tracking-wider">Category</p>
                  <p className="font-medium capitalize text-white">{formatTicketCategory(ticket.category)}</p>
                </div>
                {ticket.orderId ? (
                  <div className="bg-navy3/40 rounded-lg px-3 py-2">
                    <p className="text-gray mb-0.5 font-bold uppercase tracking-wider">Related Order</p>
                    <p className="font-medium text-teal">#{ticket.orderId}</p>
                  </div>
                ) : null}
              </div>

              <div className="bg-navy3/40 rounded-lg px-3 py-2.5">
                <p className="text-gray mb-1 text-[0.65rem] font-bold uppercase tracking-wider">Your Message</p>
                <p className="text-gray2 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div>
                <p className="text-gray mb-2 text-[0.65rem] font-bold uppercase tracking-wider">Conversation</p>
                <div className="space-y-2.5">
                  {(ticket.replies || []).length > 0 ? ticket.replies.map((item) => {
                    const isYou = item.author?.role === 'customer' && item.author?.id === viewer?.id;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-r-lg border-l-2 py-2 pl-3 pr-2 ${
                          isYou ? 'border-blue-500 bg-blue-500/5' : 'border-teal bg-teal/5'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white">
                          <span>{formatAuthorLabel(item.author, 'customer', viewer?.id)}</span>
                          <span className="text-gray text-[0.65rem] font-normal">{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray2 mt-1 text-sm whitespace-pre-wrap">{item.message}</p>
                      </div>
                    );
                  }) : (
                    <div className="text-gray bg-navy3/40 rounded-lg px-3 py-4 text-center text-xs italic">
                      No replies yet. Our support team will respond here soon.
                    </div>
                  )}
                </div>
              </div>

              {canReply ? (
                <div className="bg-navy3/30 rounded-lg border border-white/[0.06] p-3">
                  <label className="text-gray mb-2 block text-[0.65rem] font-bold uppercase tracking-wider">
                    Add a follow-up
                  </label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Add more details or ask a follow-up question..."
                    className="bg-navy2 focus:border-teal w-full resize-none rounded-md border border-white/[0.08] px-3 py-2.5 text-[0.85rem] text-white outline-none"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
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
            </div>

            <div className="flex justify-end border-t border-white/[0.07] px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="text-gray2 hover:bg-white/5 hover:text-white rounded-md border border-white/10 px-4 py-2 text-[0.8rem] font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default UserTicketDetailModal;

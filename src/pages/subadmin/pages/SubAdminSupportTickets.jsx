import React, { useState, useEffect } from 'react';
import { Download, Filter, Ticket, Loader2, MessageCircle, UserPlus, CheckCircle } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';

const SubAdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ open: 0, 'in-progress': 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await subAdminService.listSupportTickets();
      
      const ticketsArray = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response) ? response : []);
      
      setTickets(ticketsArray);
      
      // Basic counts from the list
      const c = ticketsArray.reduce((acc, t) => {
        const status = t.status || 'open';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, { open: 0, 'in-progress': 0, resolved: 0 });
      setCounts(c);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setProcessingId(id);
      await subAdminService.updateTicketStatus(id, status);
      toast.success(`Ticket status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update ticket status');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={<><span>Support </span><span className="text-teal">Tickets</span></>}
        subtitle="Manage incoming customer support requests"
        actions={
          <>
            <button className="border-border text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border px-3 py-1.5 text-[0.8rem] transition-colors">
              <Filter size={14} /> Filters
            </button>
            <button className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-3 py-1.5 text-[0.8rem] font-semibold">
              <Download size={14} /> Export
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-4 mb-4">
        <div className="bg-card border-border rounded-md border p-4">
          <div className="text-gray text-[0.7rem] uppercase tracking-[0.1em]">Open</div>
          <div className="font-syne text-[1.8rem] text-white">{counts.open}</div>
        </div>
        <div className="bg-card border-border rounded-md border p-4">
          <div className="text-gray text-[0.7rem] uppercase tracking-[0.1em]">In Progress</div>
          <div className="font-syne text-[1.8rem] text-white">{counts['in-progress'] || counts.inProgress || 0}</div>
        </div>
        <div className="bg-card border-border rounded-md border p-4">
          <div className="text-gray text-[0.7rem] uppercase tracking-[0.1em]">Resolved</div>
          <div className="font-syne text-[1.8rem] text-white">{counts.resolved}</div>
        </div>
        <div className="bg-card border-border rounded-md border p-4">
          <div className="text-gray text-[0.7rem] uppercase tracking-[0.1em]">Total</div>
          <div className="font-syne text-[1.8rem] text-white">{tickets.length}</div>
        </div>
      </div>

      <div className="bg-card border-border rounded-md border p-3 space-y-2.5">
        {tickets.length > 0 ? tickets.map((ticket) => (
          <div key={ticket.id} className="border-border hover:border-teal/30 rounded-md border p-3 transition-colors">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Ticket size={14} className="text-teal" />
                <span className="text-[0.75rem] text-gray">#{ticket.id?.slice(-6) || 'N/A'}</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold uppercase ${
                ticket.priority === 'high' ? 'bg-red/10 text-red' : 
                ticket.priority === 'medium' ? 'bg-yellow/10 text-yellow' : 'bg-green-500/10 text-green-500'
              }`}>
                {ticket.priority} Priority
              </span>
            </div>
            <div className="text-[0.875rem] font-semibold text-white">{ticket.subject}</div>
            <div className="text-[0.8rem] text-gray mt-1">
              From: {ticket.customer?.firstName} {ticket.customer?.lastName} • {new Date(ticket.createdAt).toLocaleString()}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {ticket.status !== 'resolved' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(ticket.id, 'in-progress')}
                    className="text-yellow bg-yellow/10 rounded border border-yellow/40 px-2.5 py-1 text-[0.72rem] font-semibold flex items-center gap-1"
                  >
                    <MessageCircle size={12} /> Mark In-Progress
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                    className="text-green-500 bg-green-500/10 rounded border border-green-500/30 px-2.5 py-1 text-[0.72rem] font-semibold flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> Resolve
                  </button>
                </>
              )}
              <button className="border-border text-gray2 rounded border px-2.5 py-1 text-[0.72rem] font-semibold flex items-center gap-1">
                <UserPlus size={12} /> Assign
              </button>
              <button className="border-border text-gray2 rounded border px-2.5 py-1 text-[0.72rem] font-semibold">View Details</button>
            </div>
          </div>
        )) : null}
        {tickets.length === 0 && !loading && (
          <div className="text-gray py-20 text-center">No support tickets found</div>
        )}
      </div>
    </div>
  );
};

export default SubAdminSupportTickets;

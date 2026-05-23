import React, { useState, useEffect } from 'react';
import { MessageSquareMore, Loader2, MessageCircle, UserPlus, Archive } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';

const SubAdminCustomerMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Using support tickets as the base for customer messages
      const response = await subAdminService.listSupportTickets();
      const messagesArray = Array.isArray(response.data.data) 
        ? response.data.data 
        : (Array.isArray(response.data) ? response.data : []);
      
      setMessages(messagesArray);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={<><span>Customer </span><span className="text-teal">Messages</span></>}
        subtitle="Inbox for customer communication and escalated threads"
      />

      <div className="space-y-2.5">
        {messages.length > 0 ? messages.map((msg) => (
          <div key={msg.id} className="bg-card border-border rounded-md border p-3 hover:border-teal/20 transition-colors">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5">
                <MessageSquareMore size={14} className="text-teal" />
                <span className="text-[0.875rem] font-semibold text-white">
                  {msg.customer?.firstName} {msg.customer?.lastName}
                </span>
                <span className="text-gray text-[0.75rem]">#{msg.id?.slice(-6) || 'N/A'}</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold uppercase ${
                msg.status === 'open' ? 'text-red bg-red/10 border border-red/30' : 
                msg.status === 'resolved' ? 'text-green-500 bg-green-500/10 border border-green-500/30' : 
                'text-blue-500 bg-blue-500/10 border border-blue-500/30'
              }`}>
                {msg.status}
              </span>
            </div>
            <p className="text-[0.875rem] text-gray2">{msg.subject}</p>
            <div className="mt-2 text-[0.75rem] text-gray">
              Received: {new Date(msg.createdAt).toLocaleString()}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button className="text-teal bg-teal/10 hover:bg-teal/20 rounded border border-teal/30 px-2.5 py-1 text-[0.7rem] font-semibold flex items-center gap-1">
                <MessageCircle size={12} /> Reply
              </button>
              <button className="text-yellow bg-yellow/10 hover:bg-yellow/20 rounded border border-yellow/40 px-2.5 py-1 text-[0.7rem] font-semibold flex items-center gap-1">
                <UserPlus size={12} /> Assign
              </button>
              <button className="border-border text-gray2 hover:border-teal hover:text-teal rounded border px-2.5 py-1 text-[0.7rem] font-semibold flex items-center gap-1">
                <Archive size={12} /> Archive
              </button>
            </div>
          </div>
        )) : null}
        {messages.length === 0 && !loading && (
          <div className="text-gray py-20 text-center bg-card border border-border rounded-md">
            No customer messages found
          </div>
        )}
      </div>
    </div>
  );
};

export default SubAdminCustomerMessages;

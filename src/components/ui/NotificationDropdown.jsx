import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Box, AlertCircle, Info, Tag, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications(1, 10);
      setNotifications(res.data || []);
      setUnreadCount(res.meta?.unread || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Box size={16} className="text-blue-400" />;
      case 'dispute': return <AlertCircle size={16} className="text-red-400" />;
      case 'promo': return <Tag size={16} className="text-teal-400" />;
      case 'review': return <MessageSquare size={16} className="text-yellow-400" />;
      default: return <Info size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray hover:bg-teal/10 hover:text-teal relative rounded p-1.5 transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-2 top-16 z-50 origin-top overflow-hidden rounded-xl border border-white/10 bg-navy2 shadow-2xl animate-in fade-in slide-in-from-top-2 min-[500px]:absolute min-[500px]:inset-x-auto min-[500px]:top-auto min-[500px]:right-0 min-[500px]:mt-2 min-[500px]:w-96 min-[500px]:origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-navy3/50 px-4 py-3">
            <h3 className="font-['Syne'] text-[0.95rem] font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[0.7rem] text-teal hover:underline flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[min(60vh,350px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className={`flex items-start gap-3 border-b border-white/5 p-4 transition-colors cursor-pointer hover:bg-white/5 ${!notif.isRead ? 'bg-teal/5' : ''}`}
                  >
                    <div className={`mt-0.5 shrink-0 rounded-full p-2 ${!notif.isRead ? 'bg-navy3' : 'bg-transparent'}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[0.85rem] font-semibold ${!notif.isRead ? 'text-white' : 'text-gray2'}`}>
                          {notif.title}
                        </p>
                        <span className="shrink-0 text-[0.65rem] text-gray whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`mt-1 text-[0.75rem] line-clamp-2 ${!notif.isRead ? 'text-gray2' : 'text-gray'}`}>
                        {notif.message}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal shadow-[0_0_8px_rgba(0,201,167,0.5)]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

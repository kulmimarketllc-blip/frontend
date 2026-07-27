export const TICKET_STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const TICKET_PRIORITIES = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const TICKET_CATEGORIES = [
  { value: 'order', label: 'Order Issue' },
  { value: 'payment', label: 'Payment' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'account', label: 'Account' },
  { value: 'merchant', label: 'Merchant' },
  { value: 'other', label: 'Other' },
];

export const formatTicketStatus = (status) => {
  if (!status) return 'Unknown';
  return String(status).replace(/_/g, ' ');
};

export const formatTicketCategory = (category) => {
  if (!category) return 'General';
  return String(category).replace(/_/g, ' ');
};

export const statusBadgeClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'open') return 'text-red bg-red/10 border-red/30';
  if (normalized === 'in_progress') return 'text-yellow bg-yellow/10 border-yellow/40';
  if (normalized === 'resolved') return 'text-green-500 bg-green-500/10 border-green-500/30';
  if (normalized === 'closed') return 'text-gray2 bg-white/5 border-white/10';
  return 'text-gray2 bg-white/5 border-white/10';
};

export const priorityBadgeClass = (priority) => {
  const normalized = String(priority || 'medium').toLowerCase();
  if (normalized === 'urgent' || normalized === 'high') return 'text-red bg-red/10 border-red/30';
  if (normalized === 'medium') return 'text-yellow bg-yellow/10 border-yellow/40';
  return 'text-green-500 bg-green-500/10 border-green-500/30';
};

export const normalizeTicketList = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

export const normalizeTicketMeta = (response) => ({
  total: Number(response?.meta?.total || 0),
  page: Number(response?.meta?.page || 1),
  limit: Number(response?.meta?.limit || 20),
  pages: Number(response?.meta?.pages || 1),
});

export const formatAuthorLabel = (author, viewerRole = 'customer', viewerId) => {
  if (!author) return 'Unknown';
  if (viewerRole === 'customer') {
    if (author.role === 'customer' && author.id === viewerId) return 'You';
    if (['sub_admin', 'admin'].includes(author.role)) return 'Support Team';
  }
  return `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'User';
};

export const USER_STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const SUPPORT_FAQ = [
  {
    q: 'How fast will I get a reply?',
    a: 'Our team typically responds within 24 hours on business days. Urgent order issues are prioritized.',
  },
  {
    q: 'Can I attach photos?',
    a: 'Describe your issue in detail for now. Include order numbers and dates so we can help faster.',
  },
  {
    q: 'What if my order is late?',
    a: 'Open a ticket under Delivery or Order Issue and select the related order. We will check tracking for you.',
  },
];

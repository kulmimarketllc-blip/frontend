import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/constants';

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const apiBase = /\/v\d+$/.test(cleanBase) ? '' : '/v1';
const SUB_ADMIN_BASE = `${apiBase}/sub-admin`;
const SUPPORT_BASE = `${apiBase}/support`;

const unwrapPayload = (response) => {
  const body = response?.data;
  const data = (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) 
    ? body.data 
    : body;

  return data;
};

const subAdminService = {
  // --- Dashboard Stats ---
  getDashboardStats: async () => {
    // We combine multiple count endpoints for the dashboard cards.
    // Each request is caught individually to prevent a 403 (Forbidden) on one permission from breaking the whole dashboard.
    const [merchants, reviews, content, disputes, tickets] = await Promise.all([
      axiosInstance.get(`${SUB_ADMIN_BASE}/merchants/pending/count`).catch((err) => { console.error('Merchants count error:', err.response?.status, err.message); return { data: { data: { count: 0 } } }; }),
      axiosInstance.get(`${SUB_ADMIN_BASE}/moderation/flagged-reviews/count`).catch((err) => { console.error('Reviews count error:', err.response?.status, err.message); return { data: { data: { count: 0 } } }; }),
      axiosInstance.get(`${SUB_ADMIN_BASE}/moderation/flagged-content/count`).catch((err) => { console.error('Content count error:', err.response?.status, err.message); return { data: { data: { count: 0 } } }; }),
      axiosInstance.get(`${SUB_ADMIN_BASE}/disputes`).catch((err) => { console.error('Disputes error:', err.response?.status, err.message); return { data: { data: { meta: { total: 0 } } } }; }),
      axiosInstance.get(`${SUPPORT_BASE}/tickets/counts`).catch((err) => { console.error('Tickets error:', err.response?.status, err.message); return { data: { data: { open: 0 } } }; }),
    ]);

    const stats = {
      pendingMerchants: unwrapPayload(merchants).count || 0,
      flaggedReviews: unwrapPayload(reviews).count || 0,
      flaggedContent: unwrapPayload(content).count || 0,
      activeDisputes: unwrapPayload(disputes).meta?.total || 0,
      openTickets: unwrapPayload(tickets).open || 0,
    };
  
    return stats;
  },

  // --- Merchant Approvals ---
  listPendingMerchants: async (params) => {
    const response = await axiosInstance.get(`${SUB_ADMIN_BASE}/merchants/pending`, { params });
    return unwrapPayload(response);
  },

  getMerchantDetail: async (id) => {
    const response = await axiosInstance.get(`${SUB_ADMIN_BASE}/merchants/${id}`);
    return unwrapPayload(response);
  },

  approveMerchant: async (id, commissionRate) => {
    const response = await axiosInstance.patch(`${SUB_ADMIN_BASE}/merchants/${id}/approve`, { commissionRate });
    return unwrapPayload(response);
  },

  rejectMerchant: async (id, reason) => {
    const response = await axiosInstance.patch(`${SUB_ADMIN_BASE}/merchants/${id}/reject`, { reason });
    return unwrapPayload(response);
  },

  // --- Review Moderation ---
  listFlaggedReviews: async (params) => {
    const response = await axiosInstance.get(`${SUB_ADMIN_BASE}/moderation/flagged-reviews`, { params });
    return unwrapPayload(response);
  },

  moderateReview: async (id, action, reason) => {
    const response = await axiosInstance.patch(`${SUB_ADMIN_BASE}/moderation/reviews/${id}/action`, { action, reason });
    return unwrapPayload(response);
  },

  // --- Content (Product) Moderation ---
  listFlaggedContent: async (params) => {
    const response = await axiosInstance.get(`${SUB_ADMIN_BASE}/moderation/flagged-content`, { params });
    return unwrapPayload(response);
  },

  moderateContent: async (id, action, reason) => {
    const response = await axiosInstance.patch(`${SUB_ADMIN_BASE}/moderation/content/${id}/action`, { action, reason });
    return unwrapPayload(response);
  },

  // --- User Moderation ---
  listUsers: (params) => axiosInstance.get(`${SUB_ADMIN_BASE}/users`, { params }).then(unwrapPayload),

  moderateUser: async (id, action, reason, notes) => {
    const response = await axiosInstance.patch(`${SUB_ADMIN_BASE}/users/${id}/moderate`, { action, reason, notes });
    return unwrapPayload(response);
  },

  // --- Dispute Management ---
  listDisputes: async (params) => {
    const response = await axiosInstance.get(`${SUB_ADMIN_BASE}/disputes`, { params });
    return unwrapPayload(response);
  },

  getDispute: async (id) => {
    const response = await axiosInstance.get(`${SUB_ADMIN_BASE}/disputes/${id}`);
    return unwrapPayload(response);
  },

  resolveDispute: async (id, resolution, notes) => {
    const response = await axiosInstance.patch(`${SUB_ADMIN_BASE}/disputes/${id}/resolve`, { resolution, notes });
    return unwrapPayload(response);
  },

  addDisputeNote: async (id, note) => {
    const response = await axiosInstance.post(`${SUB_ADMIN_BASE}/disputes/${id}/notes`, { note });
    return unwrapPayload(response);
  },

  // --- Support Tickets ---
  listSupportTickets: (params) => axiosInstance.get(`${SUPPORT_BASE}/tickets`, { params }).then(unwrapPayload),

  getTicketDetails: (id) => axiosInstance.get(`${SUPPORT_BASE}/tickets/${id}`).then(unwrapPayload),

  updateTicketStatus: (id, status) => axiosInstance.patch(`${SUPPORT_BASE}/tickets/${id}/status`, { status }).then(unwrapPayload),

  addTicketReply: (id, content) => axiosInstance.post(`${SUPPORT_BASE}/tickets/${id}/replies`, { content }).then(unwrapPayload),

  assignTicket: (id, assignedToId) => axiosInstance.patch(`${SUPPORT_BASE}/tickets/${id}/assign`, { assignedToId }).then(unwrapPayload),

  // --- Activity Logs ---
  getActivityLogs: (page = 1, limit = 50, adminId) => 
    axiosInstance.get(`${SUB_ADMIN_BASE}/activity-logs`, { params: { page, limit, adminId } }).then(unwrapPayload),

  // --- Permissions ---
  getPermissions: (userId) => axiosInstance.get(`${SUB_ADMIN_BASE}/permissions/${userId}`).then(unwrapPayload),

  updatePermissions: (userId, permissions) => 
    axiosInstance.patch(`${SUB_ADMIN_BASE}/permissions/${userId}`, permissions).then(unwrapPayload),

  // --- Reports ---
  listReports: (params) => axiosInstance.get(`${SUB_ADMIN_BASE}/reports`, { params }).then(unwrapPayload),

  generateReport: (title, description) => 
    axiosInstance.post(`${SUB_ADMIN_BASE}/reports`, { title, description }).then(unwrapPayload),

  exportActivityLog: () => axiosInstance.get(`${SUB_ADMIN_BASE}/activity-log/export`).then(unwrapPayload),
};

export default subAdminService;

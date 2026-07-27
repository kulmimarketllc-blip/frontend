import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/constants';

const cleanBase = (API_CONFIG.BASE_URL || '').replace(/\/+$/, '');
const apiBase = /\/v\d+$/.test(cleanBase) ? '' : '/v1';
const SUPPORT_BASE = `${apiBase}/support`;

const unwrapPayload = (response) => {
  const body = response?.data;
  if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'data')) {
    return body.data;
  }
  return body;
};

const supportService = {
  listTickets: (params) =>
    axiosInstance.get(`${SUPPORT_BASE}/tickets`, { params }).then(unwrapPayload),

  getTicketCounts: () =>
    axiosInstance.get(`${SUPPORT_BASE}/tickets/counts`).then(unwrapPayload),

  getTicket: (id) =>
    axiosInstance.get(`${SUPPORT_BASE}/tickets/${id}`).then(unwrapPayload),

  createTicket: (payload) =>
    axiosInstance.post(`${SUPPORT_BASE}/tickets`, payload).then(unwrapPayload),

  updateTicketStatus: (id, status, note) =>
    axiosInstance.patch(`${SUPPORT_BASE}/tickets/${id}/status`, { status, note }).then(unwrapPayload),

  addTicketReply: (id, message, isInternal = false) =>
    axiosInstance.post(`${SUPPORT_BASE}/tickets/${id}/replies`, { message, isInternal }).then(unwrapPayload),

  assignTicket: (id, assignedToId) =>
    axiosInstance.patch(`${SUPPORT_BASE}/tickets/${id}/assign`, { assignedToId }).then(unwrapPayload),
};

export default supportService;

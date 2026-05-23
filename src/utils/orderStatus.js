const STATUS_LABEL_OVERRIDES = {
  pending_payment: 'Pending Payment',
  ready_for_pickup: 'Ready for Delivery',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  return_requested: 'Return Requested',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

const MERCHANT_STATUS_ACTIONS = {
  confirmed: [
    { next: 'processing', label: 'Accept' },
    { next: 'cancelled', label: 'Cancel' },
  ],
  processing: [
    { next: 'ready_for_pickup', label: 'Ready for Delivery' },
    { next: 'cancelled', label: 'Cancel' },
  ],
  ready_for_pickup: [{ next: 'picked_up', label: 'Mark Picked Up' }],
  picked_up: [{ next: 'in_transit', label: 'Mark In Transit' }],
  in_transit: [{ next: 'delivered', label: 'Mark Delivered' }],
  delivered: [{ next: 'return_requested', label: 'Return Requested' }],
  return_requested: [{ next: 'returned', label: 'Mark Returned' }],
  returned: [{ next: 'refunded', label: 'Refund' }],
  disputed: [
    { next: 'cancelled', label: 'Cancel' },
    { next: 'refunded', label: 'Refund' },
  ],
};

export const normalizeOrderStatus = (status = '') => String(status || '').trim().toLowerCase();

export const getOrderStatusLabel = (status = '') => {
  const normalized = normalizeOrderStatus(status);
  if (!normalized) return '';
  if (STATUS_LABEL_OVERRIDES[normalized]) return STATUS_LABEL_OVERRIDES[normalized];

  return normalized
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const getMerchantNextStatusActions = (status = '') => {
  const normalized = normalizeOrderStatus(status);
  return MERCHANT_STATUS_ACTIONS[normalized] || [];
};

export const getMerchantNextStatusAction = (status = '') => {
  return getMerchantNextStatusActions(status)[0] || null;
};

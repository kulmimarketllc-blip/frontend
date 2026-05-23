export const dashboardStats = [
  { label: 'Open Tickets', value: '12', note: '3 new today', tone: 'text-red', iconTone: 'text-red' },
  { label: 'Pending Merchants', value: '7', note: 'Awaiting review', tone: 'text-gray', iconTone: 'text-yellow' },
  { label: 'Flagged Reviews', value: '5', note: 'Needs action', tone: 'text-red', iconTone: 'text-red' },
  { label: 'Resolved Today', value: '18', note: '6 vs yesterday', tone: 'text-green-500', iconTone: 'text-green-500' },
  { label: 'Avg Response', value: '1.4h', note: 'Improved', tone: 'text-green-500', iconTone: 'text-blue-500' },
];

export const supportTickets = [
  {
    id: '#TKT-0091',
    title: 'Order not delivered - customer requesting refund',
    meta: 'Ahmed M. - 2 hours ago - Order ESQ-2026-00821',
    priority: 'Urgent',
    priorityClass: 'text-red bg-red/10',
  },
  {
    id: '#TKT-0090',
    title: 'Wrong item received - need replacement',
    meta: 'Hodan F. - 4 hours ago - Order ESQ-2026-00819',
    priority: 'Medium',
    priorityClass: 'text-yellow bg-yellow/10',
  },
  {
    id: '#TKT-0089',
    title: 'Cannot update delivery address after placing order',
    meta: 'Yusuf A. - 6 hours ago',
    priority: 'Low',
    priorityClass: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: '#TKT-0088',
    title: 'Payment deducted but order not confirmed',
    meta: 'Nimo H. - 8 hours ago - Order ESQ-2026-00815',
    priority: 'Medium',
    priorityClass: 'text-yellow bg-yellow/10',
  },
];

export const merchantApprovals = [
  { store: 'Barwaaqo Electronics', owner: 'Omar H.', category: 'Electronics', applied: '2 days ago', categoryClass: 'text-blue-500 bg-blue-500/10' },
  { store: 'Hibo Fashion', owner: 'Hibo A.', category: 'Fashion', applied: '3 days ago', categoryClass: 'text-purple-400 bg-purple-500/10' },
  { store: 'Suuq Fresh Foods', owner: 'Fadumo M.', category: 'Groceries', applied: '4 days ago', categoryClass: 'text-green-500 bg-green-500/10' },
  { store: 'Nabad Home Goods', owner: 'Abdi Y.', category: 'Home', applied: '5 days ago', categoryClass: 'text-yellow bg-yellow/10' },
];

export const flaggedReviews = [
  { review: 'This is a scam product...', by: 'Khalid M.', product: 'Wireless Earbuds X2', rating: '1.0', reason: 'Spam', reasonClass: 'text-red bg-red/10' },
  { review: 'Seller is a fraud...', by: 'Anonymous', product: 'Running Shoes', rating: '1.0', reason: 'Offensive', reasonClass: 'text-yellow bg-yellow/10' },
  { review: 'Buy from @other_store...', by: 'guest_user', product: 'Face Cream', rating: '2.0', reason: 'Competitor', reasonClass: 'text-blue-500 bg-blue-500/10' },
];

export const users = [
  { name: 'Ahmed Hassan', email: 'ahmed@email.com', role: 'Customer', roleClass: 'text-teal bg-teal/10', status: 'Active', statusClass: 'text-green-500 bg-green-500/10' },
  { name: 'Nimo Farah', email: 'nimo@store.com', role: 'Merchant', roleClass: 'text-purple-400 bg-purple-500/10', status: 'Flagged', statusClass: 'text-yellow bg-yellow/10' },
  { name: 'Yusuf Ali', email: 'yusuf@email.com', role: 'Customer', roleClass: 'text-teal bg-teal/10', status: 'Suspended', statusClass: 'text-red bg-red/10' },
  { name: 'Hodan Ibrahim', email: 'hodan@email.com', role: 'Customer', roleClass: 'text-teal bg-teal/10', status: 'Active', statusClass: 'text-green-500 bg-green-500/10' },
];

export const activities = [
  { action: 'Approved merchant Barwaaqo Tech', time: '10 minutes ago', tone: 'text-green-500 bg-green-500/10' },
  { action: 'Removed flagged review on Wireless Earbuds', time: '32 minutes ago', tone: 'text-red bg-red/10' },
  { action: 'Issued warning to user guest_2041 for spam', time: '1 hour ago', tone: 'text-yellow bg-yellow/10' },
  { action: 'Resolved ticket #TKT-0085 - refund approved', time: '2 hours ago', tone: 'text-teal bg-teal/10' },
  { action: 'Suspended user Yusuf Ali for policy violation', time: '3 hours ago', tone: 'text-red bg-red/10' },
  { action: 'Approved merchant Hibo Cosmetics', time: '4 hours ago', tone: 'text-green-500 bg-green-500/10' },
  { action: 'Replied to support ticket #TKT-0082', time: '5 hours ago', tone: 'text-blue-500 bg-blue-500/10' },
];

export const flaggedContent = [
  { type: 'Review', source: 'Wireless Earbuds X2', owner: 'khalid_m', reason: 'Spam links', status: 'Pending' },
  { type: 'Message', source: 'Order Chat ESQ-00822', owner: 'guest_4431', reason: 'Abusive language', status: 'Escalated' },
  { type: 'Product Q&A', source: 'Sports Shoes', owner: 'anonymous_12', reason: 'Scam accusation', status: 'Pending' },
];

export const orderDisputes = [
  { id: '#DSP-101', order: 'ESQ-2026-00821', issue: 'Not delivered', customer: 'Ahmed M.', amount: '$64.00', status: 'Open' },
  { id: '#DSP-102', order: 'ESQ-2026-00818', issue: 'Wrong item', customer: 'Hodan F.', amount: '$49.99', status: 'Investigating' },
  { id: '#DSP-103', order: 'ESQ-2026-00811', issue: 'Damaged package', customer: 'Yusuf A.', amount: '$83.50', status: 'Resolved' },
];

export const customerMessages = [
  { from: 'Amina Yusuf', subject: 'Need help changing delivery slot', channel: 'Live Chat', received: '12m ago', status: 'Unread' },
  { from: 'Mohamed Ali', subject: 'Refund status update please', channel: 'Email', received: '38m ago', status: 'Open' },
  { from: 'Hibo Farah', subject: 'Merchant behavior complaint', channel: 'Support Form', received: '1h ago', status: 'Escalated' },
];

export const reports = [
  { id: 'RPT-021', title: 'Weekly Moderation Summary', created: 'Apr 21, 2026', status: 'Submitted' },
  { id: 'RPT-020', title: 'Merchant Approval Backlog', created: 'Apr 18, 2026', status: 'Submitted' },
  { id: 'RPT-019', title: 'Flagged Reviews Analysis', created: 'Apr 14, 2026', status: 'Draft' },
];

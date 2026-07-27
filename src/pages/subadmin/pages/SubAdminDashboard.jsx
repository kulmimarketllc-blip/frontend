import { Navigate } from 'react-router-dom';

/** Sub-admin dashboard retired — moderation stats live on dedicated pages. */
const SubAdminDashboard = () => (
  <Navigate to="/subadmin/support-tickets" replace />
);

export default SubAdminDashboard;

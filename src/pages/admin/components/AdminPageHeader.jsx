import DashboardPageHeader from './DashboardPageHeader';

const AdminPageHeader = ({ title, subtitle, actions }) => {
  return <DashboardPageHeader title={title} subtitle={subtitle} actions={actions} />;
};

export default AdminPageHeader;

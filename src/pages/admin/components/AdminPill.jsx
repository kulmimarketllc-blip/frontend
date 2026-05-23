const AdminPill = ({ children, className = '' }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${className}`}>
      {children}
    </span>
  );
};

export default AdminPill;

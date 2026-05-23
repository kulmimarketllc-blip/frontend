import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check, X, Trash2 } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPill from '../components/AdminPill';
import Pagination from '../components/Pagination';
import {
  approveAdminProduct,
  deleteAdminProduct,
  getAdminPendingProducts,
  getAdminProducts,
  rejectAdminProduct,
} from '../../../services/adminService';

const Pill = ({ children, c }) => <AdminPill className={c}>{children}</AdminPill>;

const AdminProducts = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Empty means all
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(89);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', action: null, item: null });
  const itemsPerPage = 10;

  const load = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit: itemsPerPage };
      if (statusFilter) params.status = statusFilter;
      if (query) params.search = query;
      
      const payload = await getAdminProducts(params);
      setAllProducts(Array.isArray(payload?.data) ? payload.data : []);
      setTotalProducts(Number(payload?.meta?.total || 0));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [statusFilter, query]); // Reload when filter or query changes, with debounce

  const filtered = useMemo(() => {
    // Search is now handled by the server for better performance, 
    // but we can still keep local filtering for instant feedback if desired.
    // However, since we reload on query change in 'load', local filtering is redundant.
    return allProducts;
  }, [allProducts]);

  const del = async (item) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete "${item.name}"?`,
      action: 'delete',
      item,
    });
  };

  const moderate = async (item, status) => {
    const actionLabel = status === 'active' ? 'Approve' : 'Reject';
    setConfirmModal({
      isOpen: true,
      title: `${actionLabel} "${item.name}"?`,
      action: status === 'active' ? 'approve' : 'reject',
      item,
    });
  };

  const handleConfirm = async () => {
    const { action, item } = confirmModal;
    try {
      setError('');
      setMessage('');
      
      if (action === 'delete') {
        await deleteAdminProduct(item.id);
        setMessage('Product removed.');
      } else if (action === 'approve') {
        await approveAdminProduct(item.id);
        setMessage('Product approved.');
      } else if (action === 'reject') {
        await rejectAdminProduct(item.id);
        setMessage('Product rejected.');
      }
      
      setAllProducts((prev) => prev.filter((p) => p.id !== item.id));
      setConfirmModal({ isOpen: false, title: '', action: null, item: null });
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title={<><span>Product </span><span className="text-gold">Management</span></>}
          subtitle="Review and moderate products pending approval"
        />
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="bg-card mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.07] p-4">
        <div className="relative w-full max-w-sm">
          <Search className="text-gray pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-navy3 focus:border-gold w-full rounded border border-white/[0.08] py-2 pr-3 pl-8 text-sm text-white outline-none"
            placeholder="Search products by name, SKU, or ID..."
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy3 focus:border-gold rounded border border-white/[0.08] px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_review">Pending Review</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={load} className="text-gray2 hover:text-gold text-xs">{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
      </div>

      <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
              <tr className="border-b border-white/[0.07]">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[0.88rem] text-white">
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2">
                  <td className="px-6 py-4">
                    <div className="font-bold">{p.name}</div>
                    <div className="text-gray2 mt-0.5 text-[0.76rem]">{p.id}</div>
                  </td>
                  <td className="text-gray2 px-6 py-4 text-sm">{p.merchant?.storeName || p.merchantId || '-'}</td>
                  <td className="px-6 py-4 font-black">${Number(p.price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {String(p.status) === 'active' && <Pill c="text-green-500 bg-green-500/10">active</Pill>}
                    {String(p.status) === 'pending_review' && <Pill c="text-yellow bg-yellow/10">pending review</Pill>}
                    {String(p.status) === 'rejected' && <Pill c="text-red bg-red/10">rejected</Pill>}
                    {String(p.status) === 'inactive' && <Pill c="text-gray2 bg-white/10">inactive</Pill>}
                    {!['active', 'pending_review', 'rejected', 'inactive'].includes(String(p.status)) && (
                      <Pill c="text-gray2 bg-white/10">{String(p.status || 'unknown')}</Pill>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => moderate(p, 'active')} className="text-gray hover:text-green-500 hover:border-green-500 rounded border border-white/10 p-1.5 transition-colors" title="Approve product">
                        <Check size={14} />
                      </button>
                      <button onClick={() => moderate(p, 'rejected')} className="text-gray hover:text-yellow hover:border-yellow rounded border border-white/10 p-1.5 transition-colors" title="Reject product">
                        <X size={14} />
                      </button>
                      <button onClick={() => del(p)} className="text-gray hover:text-red hover:border-red rounded border border-white/10 p-1.5 transition-colors" title="Delete product permanently">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalItems={totalProducts}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => load(page)}
        loading={loading}
      />

      {/* Confirmation Modal */}
      {confirmModal.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-card border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{confirmModal.title}</h3>
            <p className="text-gray2 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', action: null, item: null })}
                className="px-4 py-2 rounded border border-white/10 text-gray hover:text-white hover:border-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded text-white font-medium transition-colors ${
                  confirmModal.action === 'delete'
                    ? 'bg-red hover:bg-red/80'
                    : confirmModal.action === 'approve'
                    ? 'bg-green hover:bg-green/80'
                    : 'bg-yellow hover:bg-yellow/80'
                }`}
              >
                {confirmModal.action === 'delete'
                  ? 'Delete'
                  : confirmModal.action === 'approve'
                  ? 'Approve'
                  : 'Reject'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminProducts;

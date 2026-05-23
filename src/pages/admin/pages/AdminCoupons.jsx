import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import DashboardPageHeader from '../components/DashboardPageHeader';
import Pagination from '../components/Pagination';
import { createAdminCoupon, deactivateAdminCoupon, getAdminCoupons, updateAdminCoupon } from '../../../services/adminService';

const Pill = ({ children, c }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${c}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {children}
  </span>
);

const couponStatusMeta = (coupon) => {
  const now = new Date();
  const expiresAt = coupon?.expiresAt ? new Date(coupon.expiresAt) : null;
  if (!coupon?.isActive) return { label: 'Inactive', className: 'text-gray2 bg-white/10' };
  if (expiresAt && expiresAt < now) return { label: 'Expired', className: 'text-red bg-red/10' };
  if (expiresAt && expiresAt.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return { label: 'Expiring', className: 'text-yellow bg-yellow/10' };
  return { label: 'Active', className: 'text-green-500 bg-green-500/10' };
};

const couponValueLabel = (coupon) => {
  const type = String(coupon?.type || '').toLowerCase();
  const value = Number(coupon?.value || 0);
  if (type === 'percentage') return `${value}%`;
  if (type === 'flat') return `$${value.toFixed(2)}`;
  if (type === 'free_shipping') return 'Free Shipping';
  return String(value);
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(23);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', action: null, coupon: null });
  const [formModal, setFormModal] = useState({ isOpen: false, mode: 'create', coupon: null });
  const [formData, setFormData] = useState({ code: '', type: 'percentage', value: '', minOrderValue: '', expiresAt: '', description: '', maxUses: '' });
  const itemsPerPage = 10;

  const load = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getAdminCoupons({ page, limit: itemsPerPage });
      setCoupons(Array.isArray(payload?.data) ? payload.data : []);
      setTotalCoupons(Number(payload?.meta?.total || 0));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load coupons.');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createCoupon = () => {
    setFormData({ code: 'SAVE20', type: 'percentage', value: '10', minOrderValue: '0', expiresAt: '', description: '', maxUses: '' });
    setFormModal({ isOpen: true, mode: 'create', coupon: null });
  };

  const editCoupon = (coupon) => {
    setFormData({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: String(coupon.value ?? ''),
      minOrderValue: String(coupon.minOrderValue ?? '0'),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      description: coupon.description || '',
      maxUses: String(coupon.maxUses ?? ''),
    });
    setFormModal({ isOpen: true, mode: 'edit', coupon });
  };

  const handleSubmitCouponForm = async () => {
    try {
      setError('');
      if (formModal.mode === 'create') {
        if (!formData.code.trim() || !formData.type.trim() || !formData.value) {
          setError('Code, type, and value are required.');
          return;
        }
        await createAdminCoupon({
          code: formData.code.trim().toUpperCase(),
          type: formData.type.trim(),
          value: Number(formData.value),
          minOrderValue: Number(formData.minOrderValue || 0),
          scope: 'all',
          ...(formData.expiresAt ? { expiresAt: new Date(formData.expiresAt).toISOString() } : {}),
        });
      } else if (formModal.mode === 'edit' && formModal.coupon) {
        if (!formData.type.trim() || !formData.value) {
          setError('Type and value are required.');
          return;
        }
        await updateAdminCoupon(formModal.coupon.id, {
          type: String(formData.type).trim(),
          value: Number(formData.value),
          description: formData.description,
          minOrderValue: Number(formData.minOrderValue || 0),
          ...(String(formData.expiresAt).trim() ? { expiresAt: new Date(String(formData.expiresAt).trim()).toISOString() } : { expiresAt: null }),
          ...(String(formData.maxUses).trim() ? { maxUses: Number(formData.maxUses) } : {}),
        });
      }
      setFormModal({ isOpen: false, mode: 'create', coupon: null });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save coupon.');
    }
  };

  const deactivateCoupon = async (coupon) => {
    setConfirmModal({
      isOpen: true,
      title: `Deactivate coupon "${coupon.code}"?`,
      action: 'deactivate',
      coupon,
    });
  };

  const reactivateCoupon = async (coupon) => {
    setConfirmModal({
      isOpen: true,
      title: `Reactivate coupon "${coupon.code}"?`,
      action: 'reactivate',
      coupon,
    });
  };

  const handleConfirm = async () => {
    const { action, coupon } = confirmModal;
    try {
      setError('');
      if (action === 'deactivate') {
        await deactivateAdminCoupon(coupon.id);
      } else if (action === 'reactivate') {
        await updateAdminCoupon(coupon.id, { isActive: true });
      }
      setConfirmModal({ isOpen: false, title: '', action: null, coupon: null });
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update coupon.');
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader
          title={<span>Coupon <span className="text-teal">Management</span></span>}
          subtitle="Create and manage promotional coupon codes"
        />
        <button onClick={createCoupon} className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-4 py-1.5 text-[0.8rem] font-medium">
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="bg-card overflow-hidden rounded-md border border-white/[0.07]">
        <div className="border-b border-white/[0.07] px-5 py-3.5">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">All Coupons</h3>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {loading && <div className="text-sm text-gray2">Loading coupons...</div>}
          {!loading && !coupons.length && <div className="text-sm text-gray2">No coupons found.</div>}
          {!loading && coupons.map((c) => {
            const s = couponStatusMeta(c);
            return (
              <div key={c.id} className="bg-navy3 rounded-md border border-white/[0.07] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="text-teal text-[0.82rem] font-bold">{c.code}</div>
                  <Pill c={s.className}>{s.label}</Pill>
                </div>
                <div className="space-y-1 text-[0.875rem]">
                  <div className="text-gray">Type: <span className="text-white">{String(c.type || '').replace('_', ' ')}</span></div>
                  <div className="text-gray">Value: <span className="text-white">{couponValueLabel(c)}</span></div>
                  <div className="text-gray">Min Order: <span className="text-white">${Number(c.minOrderValue || 0).toFixed(2)}</span></div>
                  <div className="text-gray">Used: <span className="text-white">{Number(c.usedCount || 0)}</span></div>
                  <div className="text-gray">Expires: <span className="text-white">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '-'}</span></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => editCoupon(c)} className="text-gray2 hover:border-teal hover:text-teal rounded-md border border-white/[0.07] px-3 py-2 text-[0.82rem]">Edit</button>
                  {c.isActive ? (
                    <button onClick={() => deactivateCoupon(c)} className="text-red hover:bg-red/20 rounded-md border border-red/20 bg-red/10 px-3 py-2 text-[0.82rem]">Deactivate</button>
                  ) : (
                    <button onClick={() => reactivateCoupon(c)} className="text-teal hover:bg-teal/20 rounded-md border border-teal/20 bg-teal/10 px-3 py-2 text-[0.82rem]">Reactivate</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-navy3">
                {['Code', 'Type', 'Value', 'Min Order', 'Used', 'Expires', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-gray px-4 py-2.5 text-left text-[0.7rem] font-semibold tracking-widest whitespace-nowrap uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="text-gray2 px-4 py-3 text-sm">Loading coupons...</td></tr>}
              {!loading && !coupons.length && <tr><td colSpan={8} className="text-gray2 px-4 py-3 text-sm">No coupons found.</td></tr>}
              {!loading && coupons.map((c) => {
                const s = couponStatusMeta(c);
                return (
                  <tr key={c.id} className="border-b border-white/[0.07] last:border-b-0 hover:bg-white/2">
                    <td className="text-teal px-4 py-3 text-[0.82rem] font-bold">{c.code}</td>
                    <td className="text-gray px-4 py-3 text-[0.82rem]">{String(c.type || '').replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{couponValueLabel(c)}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">${Number(c.minOrderValue || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-[0.82rem] text-white">{Number(c.usedCount || 0)}</td>
                    <td className="text-gray px-4 py-3 text-[0.82rem]">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3"><Pill c={s.className}>{s.label}</Pill></td>
                    <td className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => editCoupon(c)} className="text-gray2 hover:border-teal hover:text-teal rounded-md border border-white/[0.07] px-3 py-1.5 text-[0.78rem]">Edit</button>
                        {c.isActive ? (
                          <button onClick={() => deactivateCoupon(c)} className="text-red hover:bg-red/20 rounded-md border border-red/20 bg-red/10 px-3 py-1.5 text-[0.78rem]">Deactivate</button>
                        ) : (
                          <button onClick={() => reactivateCoupon(c)} className="text-teal hover:bg-teal/20 rounded-md border border-teal/20 bg-teal/10 px-3 py-1.5 text-[0.78rem]">Reactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalItems={totalCoupons}
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
                onClick={() => setConfirmModal({ isOpen: false, title: '', action: null, coupon: null })}
                className="px-4 py-2 rounded border border-white/10 text-gray hover:text-white hover:border-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded text-white font-medium transition-colors ${
                  confirmModal.action === 'deactivate'
                    ? 'bg-red hover:bg-red/80'
                    : 'bg-teal hover:bg-teal/80'
                }`}
              >
                {confirmModal.action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Coupon Form Modal */}
      {formModal.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-card border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              {formModal.mode === 'create' ? 'Create Coupon' : 'Edit Coupon'}
            </h3>
            {error && <div className="mb-4 rounded border border-red/30 bg-red/10 px-3 py-2 text-sm text-red-300">{error}</div>}
            <div className="space-y-3">
              {formModal.mode === 'create' && (
                <div>
                  <label className="text-sm text-gray2 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. SAVE20"
                    className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-gray2 block mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat ($)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              {formData.type !== 'free_shipping' && (
                <div>
                  <label className="text-sm text-gray2 block mb-1">Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="e.g. 10"
                    className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-gray2 block mb-1">Min Order Value</label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  placeholder="0"
                  className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray2 block mb-1">Expires At (optional)</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray2 block mb-1">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Coupon description"
                  className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors resize-none h-20"
                />
              </div>
              {formModal.mode === 'edit' && (
                <div>
                  <label className="text-sm text-gray2 block mb-1">Max Uses (optional)</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setFormModal({ isOpen: false, mode: 'create', coupon: null })}
                className="px-4 py-2 rounded border border-white/10 text-gray hover:text-white hover:border-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCouponForm}
                className="px-4 py-2 rounded bg-teal text-navy hover:bg-teal/80 font-medium transition-colors"
              >
                {formModal.mode === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminCoupons;

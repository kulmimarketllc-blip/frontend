import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tag, Plus, Calendar, Settings, Trash2 } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import MerchantPill from '../components/MerchantPill';
import Pagination from '../../admin/components/Pagination';
import DashboardStats from '../../../components/DashboardStats';
import {
  getMyMerchantProducts,
  updateMyMerchantProduct,
} from '../../../services/merchantService';

const Pill = ({ children, c }) => (
  <MerchantPill className={c}>{children}</MerchantPill>
);

const loadAllMerchantProducts = async () => {
  const first = await getMyMerchantProducts({ page: 1, limit: 100, sort: 'newest' });
  const initialRows = Array.isArray(first?.data) ? first.data : [];
  const pages = Number(first?.meta?.pages || 1);
  if (pages <= 1) {
    return initialRows;
  }

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, idx) => getMyMerchantProducts({ page: idx + 2, limit: 100, sort: 'newest' }))
  );

  const restRows = rest.flatMap((payload) => (Array.isArray(payload?.data) ? payload.data : []));
  return [...initialRows, ...restRows];
};

const MerchantPromotions = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatesPage, setCandidatesPage] = useState(1);
  const [discountModal, setDiscountModal] = useState({ isOpen: false, mode: 'create', product: null, discount: '15' });
  const itemsPerPage = 10;
  const candidatesPerPage = 10;

  const load = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');

      const [pagePayload, fullList] = await Promise.all([
        getMyMerchantProducts({
          page,
          limit: itemsPerPage,
          sort: 'newest',
          featured: true,
        }),
        loadAllMerchantProducts(),
      ]);

      setAllProducts(Array.isArray(fullList) ? fullList : []);
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load promotions data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allPromos = useMemo(() => {
    return allProducts
      .filter((p) => Number(p.comparePrice || 0) > Number(p.price || 0) || p.isFeatured)
      .map((p) => {
        const price = Number(p.price || 0);
        const compare = Number(p.comparePrice || 0);
        const off = compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
        return {
          id: p.id,
          name: p.name,
          code: p.sku || p.id,
          discount: off ? `${off}% off` : p.isFeatured ? 'Featured' : 'Custom',
          prods: p.category?.name || 'General',
          start: new Date(p.createdAt).toLocaleDateString(),
          end: compare > price ? 'Ongoing' : 'Featured',
          status: p.isActive === false ? 'Inactive' : 'Active',
          sc: p.isActive === false ? 'text-red bg-red/10' : 'text-green-500 bg-green-500/10',
          product: p,
        };
      });
  }, [allProducts]);

  const pagedPromos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return allPromos.slice(start, start + itemsPerPage);
  }, [allPromos, currentPage]);

  const totalPromotions = allPromos.length;

  const promotionCandidates = useMemo(() => {
    return allProducts
      .filter((p) => !(Number(p.comparePrice || 0) > Number(p.price || 0) || p.isFeatured))
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || p.id,
        category: p.category?.name || 'General',
        price: Number(p.price || 0),
      }));
  }, [allProducts]);

  const pagedCandidates = useMemo(() => {
    const start = (candidatesPage - 1) * candidatesPerPage;
    return promotionCandidates.slice(start, start + candidatesPerPage);
  }, [promotionCandidates, candidatesPage]);

  const stats = useMemo(() => {
    const active = allPromos.filter((x) => x.status === 'Active').length;
    const totalDiscount = allPromos.reduce((sum, x) => {
      const match = /([0-9]+)%/.exec(x.discount);
      return sum + (match ? Number(match[1]) : 0);
    }, 0);
    const avgDiscount = allPromos.length ? `${Math.round(totalDiscount / allPromos.length)}%` : '0%';
    const nextExpiring = allPromos.find((x) => x.end === 'Ongoing') ? 'Live' : 'No active deal';

    return [
      { icon: Tag, val: String(active), label: 'Active Promotions', bg: 'bg-teal/10' },
      { icon: Calendar, val: String(totalPromotions), label: 'Promotion Products', bg: 'bg-blue-500/10' },
      { icon: Tag, val: avgDiscount, label: 'Avg Discount', bg: 'bg-yellow/10' },
      { icon: Calendar, val: nextExpiring, label: 'Promotion Status', bg: 'bg-red/10' },
    ];
  }, [allPromos, totalPromotions]);

  const createPromotion = async (selectedProduct) => {
    try {
      const isClickEvent = selectedProduct && typeof selectedProduct === 'object' && 'preventDefault' in selectedProduct;
      const product = isClickEvent ? promotionCandidates[0] : (selectedProduct || promotionCandidates[0] || allProducts[0]);
      if (!product) {
        setError('No products found. Add products first.');
        return;
      }

      setDiscountModal({ isOpen: true, mode: 'create', product, discount: '15' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create promotion.');
    }
  };

  const removePromotion = async (item) => {
    try {
      setError('');
      setMessage('');
      await updateMyMerchantProduct(item.id, { comparePrice: null, isFeatured: false });
      setMessage('Promotion removed.');
      await load(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not remove promotion.');
    }
  };

  const editPromotion = async (item) => {
    try {
      const discount = item.product.comparePrice
        ? Math.round((1 - item.product.price / item.product.comparePrice) * 100)
        : '10';
      setDiscountModal({ isOpen: true, mode: 'edit', product: item.product, discount: String(discount) });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not edit promotion.');
    }
  };

  const handleSaveDiscount = async () => {
    try {
      setError('');
      setMessage('');
      const percent = Math.max(1, Math.min(90, Number(discountModal.discount)));
      const comparePrice = Number(discountModal.product.price) / (1 - percent / 100);
      await updateMyMerchantProduct(discountModal.product.id, {
        comparePrice: Number(comparePrice.toFixed(2)),
        isFeatured: true,
      });

      setMessage(`Promotion ${discountModal.mode === 'create' ? 'created' : 'updated'} for ${discountModal.product.name} (${percent}% off).`);
      setDiscountModal({ isOpen: false, mode: 'create', product: null, discount: '15' });
      await load(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || `Could not ${discountModal.mode === 'create' ? 'create' : 'update'} promotion.`);
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <MerchantPageHeader
          title={
            <>
              Store <span className="text-teal">Promotions</span>
            </>
          }
          subtitle="Boost your sales with real product discounts"
        />
        <div className="flex gap-2.5">
          <button onClick={() => createPromotion()} className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded px-4 py-1.5 text-[0.8rem] font-bold transition-colors">
            <Plus size={14} strokeWidth={3} /> Create Promotion
          </button>
        </div>
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <DashboardStats stats={stats} />

      <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
        <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
          <h3 className="font-syne text-[1rem] font-bold text-white">All Promotions</h3>
          <span className="text-xs text-gray2">{loading ? 'Loading...' : `${totalPromotions} active promotion rows`}</span>
        </div>

        <div className="hidden min-[800px]:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
              <tr className="border-b border-white/[0.07]">
                {['Name', 'Code', 'Discount', 'Products', 'Period', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[0.88rem] text-white">
              {pagedPromos.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2">
                  <td className="px-6 py-4 font-bold max-w-[200px] truncate">{p.name}</td>
                  <td className="text-teal px-6 py-4 font-black">{p.code}</td>
                  <td className="px-6 py-4">{p.discount}</td>
                  <td className="text-gray2 px-6 py-4">{p.prods}</td>
                  <td className="text-gray2 px-6 py-4">{p.start} - {p.end}</td>
                  <td className="px-6 py-4">
                    <Pill c={p.sc}>{p.status}</Pill>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => editPromotion(p)} className="text-gray hover:text-teal transition-colors">
                        <Settings size={16} />
                      </button>
                      <button onClick={() => removePromotion(p)} className="text-gray hover:text-red transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!pagedPromos.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray2">No promotions yet. Create one from your product catalog.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-6">
          <Pagination
            currentPage={currentPage}
            totalItems={totalPromotions}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            loading={loading}
          />
        </div>
      </div>

      <div className="bg-card mt-8 overflow-hidden rounded-lg border border-white/[0.07]">
        <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
          <h3 className="font-syne text-[1rem] font-bold text-white">Available Products for Promotion</h3>
          <span className="text-xs text-gray2">{promotionCandidates.length} product(s)</span>
        </div>

        <div className="hidden min-[800px]:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
              <tr className="border-b border-white/[0.07]">
                {['Name', 'SKU', 'Category', 'Price', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[0.88rem] text-white">
              {pagedCandidates.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2">
                  <td className="px-6 py-4 font-bold max-w-[220px] truncate">{p.name}</td>
                  <td className="text-teal px-6 py-4 font-black">{p.sku}</td>
                  <td className="text-gray2 px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4 font-black">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => createPromotion(p)} className="bg-teal text-navy hover:bg-teal2 rounded px-3 py-1 text-[0.75rem] font-bold transition-colors">
                      Add Promotion
                    </button>
                  </td>
                </tr>
              ))}
              {!promotionCandidates.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray2">All products currently have active promotion settings.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="px-6">
          <Pagination
            currentPage={candidatesPage}
            totalItems={promotionCandidates.length}
            itemsPerPage={candidatesPerPage}
            onPageChange={(page) => setCandidatesPage(page)}
            loading={loading}
          />
        </div>
      </div>

      {/* Discount Modal */}
      {discountModal.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-card border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              {discountModal.mode === 'create' ? 'Create Promotion' : 'Edit Promotion'}
            </h3>
            <p className="text-sm text-gray2 mb-4">
              Product: <span className="text-white font-semibold">{discountModal.product?.name}</span>
            </p>
            <p className="text-sm text-gray2 mb-4">
              Price: <span className="text-teal font-semibold">${Number(discountModal.product?.price || 0).toFixed(2)}</span>
            </p>
            {error && <div className="mb-4 rounded border border-red/30 bg-red/10 px-3 py-2 text-sm text-red-300">{error}</div>}
            <div className="mb-6">
              <label className="text-sm text-gray2 block mb-2">Discount Percent (1-90%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={discountModal.discount}
                  onChange={(e) => setDiscountModal({ ...discountModal, discount: e.target.value })}
                  className="bg-navy3 flex-1 rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors"
                />
                <span className="text-white font-semibold text-lg">%</span>
              </div>
              <p className="text-xs text-gray mt-2">
                Discounted price: ${(Number(discountModal.product?.price || 0) * (1 - Number(discountModal.discount) / 100)).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDiscountModal({ isOpen: false, mode: 'create', product: null, discount: '15' })}
                className="px-4 py-2 rounded border border-white/10 text-gray hover:text-white hover:border-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDiscount}
                className="px-4 py-2 rounded bg-teal text-navy hover:bg-teal/80 font-medium transition-colors"
              >
                {discountModal.mode === 'create' ? 'Create Promotion' : 'Update Promotion'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MerchantPromotions;

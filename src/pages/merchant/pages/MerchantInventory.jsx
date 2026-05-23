import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Package, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import MerchantPill from '../components/MerchantPill';
import Pagination from '../../admin/components/Pagination';
import DashboardStats from '../../../components/DashboardStats';
import {
  getMyMerchantProducts,
  restockMyMerchantProduct,
} from '../../../services/merchantService';

const Pill = ({ children, c }) => <MerchantPill className={c}>{children}</MerchantPill>;

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

const MerchantInventory = () => {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const load = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const [pagePayload, fullList] = await Promise.all([
        getMyMerchantProducts({ page, limit: itemsPerPage, sort: 'newest' }),
        loadAllMerchantProducts(),
      ]);
      const list = Array.isArray(pagePayload?.data) ? pagePayload.data : [];
      setItems(list);
      setAllItems(Array.isArray(fullList) ? fullList : []);
      setTotalItems(Number(pagePayload?.meta?.total || fullList?.length || list.length));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [restockModal, setRestockModal] = useState({ isOpen: false, item: null, quantity: '10' });

  const doRestock = (item) => {
    setRestockModal({ isOpen: true, item, quantity: '10' });
  };

  const handleConfirmRestock = async () => {
    const { item, quantity } = restockModal;
    if (!item) return;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }

    try {
      setError('');
      setMessage('');
      const result = await restockMyMerchantProduct(item.id, Number(quantity));
      setMessage(`Restocked ${item.name}. New stock: ${result.newStock}`);
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, stock: result.newStock } : p)));
      setAllItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, stock: result.newStock } : p)));
      setRestockModal({ isOpen: false, item: null, quantity: '10' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Restock failed.');
    }
  };

  const stats = useMemo(() => {
    const total = allItems.length;
    const low = allItems.filter((i) => Number(i.stock || 0) > 0 && Number(i.stock || 0) <= Number(i.lowStockAt || 10)).length;
    const out = allItems.filter((i) => Number(i.stock || 0) <= 0).length;

    return [
      { icon: Package, bg: 'bg-teal/10', val: String(total), label: 'Total Products' },
      { icon: AlertTriangle, bg: 'bg-yellow/10', val: String(low), label: 'Low Stock Alerts' },
      { icon: XCircle, bg: 'bg-red/10', val: String(out), label: 'Out of Stock' },
    ];
  }, [allItems]);

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <MerchantPageHeader
          title={<><span>Inventory </span><span className="text-teal">Management</span></>}
          subtitle="Track and update stock levels"
        />
        <button onClick={() => load(currentPage)} className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1.5 rounded border border-transparent px-4 py-1.5 text-[0.8rem] font-bold transition-colors">
          <RefreshCw size={14} strokeWidth={2.5} /> Refresh
        </button>
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <DashboardStats stats={stats} />


      <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
          <h3 className="font-syne text-[1rem] font-bold text-white">Stock Levels</h3>
          {loading ? <span className="text-xs text-gray2">Loading...</span> : null}
        </div>

        {/* Desktop Table */}
        <div className="hidden min-[800px]:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
              <tr className="border-b border-white/[0.07]">
                {['Product', 'SKU', 'In Stock', 'Alert At', 'Status', 'Update'].map((h) => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[0.88rem] text-white">
              {items.map((i, index) => {
                const stock = Number(i.stock || 0);
                const alertAt = Number(i.lowStockAt || 10);
                const status = stock === 0 ? 'Out of Stock' : stock <= alertAt ? 'Low Stock' : 'In Stock';
                const sc = stock === 0 ? 'text-red bg-red/10' : stock <= alertAt ? 'text-yellow bg-yellow/10' : 'text-green-500 bg-green-500/10';
                return (
                  <tr key={i.id || `${i.sku || 'product'}-${index}`} className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2">
                    <td className="px-6 py-4 max-w-55 font-bold truncate">{i.name}</td>
                    <td className="text-gray px-6 py-4 text-[0.8rem] tracking-wider">{i.sku || '-'}</td>
                    <td className="px-6 py-4">{stock}</td>
                    <td className="text-gray2 px-6 py-4">{alertAt}</td>
                    <td className="px-6 py-4"><Pill c={sc}>{status}</Pill></td>
                    <td className="px-6 py-4">
                      <button onClick={() => doRestock(i)} className="bg-teal text-navy hover:bg-teal2 rounded px-3 py-1 text-[0.75rem] font-bold transition-all">
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="block min-[800px]:hidden">
          {items.length === 0 && !loading ? (
            <div className="text-gray2 p-4 text-center">No products found.</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {items.map((i, index) => {
                const stock = Number(i.stock || 0);
                const alertAt = Number(i.lowStockAt || 10);
                const status = stock === 0 ? 'Out of Stock' : stock <= alertAt ? 'Low Stock' : 'In Stock';
                const sc = stock === 0 ? 'text-red bg-red/10' : stock <= alertAt ? 'text-yellow bg-yellow/10' : 'text-green-500 bg-green-500/10';
                return (
                  <li key={i.id || `${i.sku || 'product'}-${index}`} className="flex flex-col gap-1 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[1rem] truncate max-w-[60%]">{i.name}</span>
                      <Pill c={sc}>{status}</Pill>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[0.85rem] text-gray2 mt-1">
                      <span>SKU: <span className="text-white font-medium">{i.sku || '-'}</span></span>
                      <span>Stock: <span className="text-white font-medium">{stock}</span></span>
                      <span>Alert At: <span className="text-white font-medium">{alertAt}</span></span>
                    </div>
                    <div className="mt-2">
                      <button onClick={() => doRestock(i)} className="bg-teal text-navy hover:bg-teal2 rounded px-3 py-1 text-[0.85rem] font-bold transition-all w-full">Restock</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-2 sm:mx-4 my-4">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => load(page)}
          loading={loading}
        />
      </div>

      {restockModal.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-card border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Restock Product</h3>
            <p className="text-sm text-gray2 mb-4">Product: <span className="text-white font-semibold">{restockModal.item?.name}</span></p>
            <label className="text-sm text-gray2 block mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              value={restockModal.quantity}
              onChange={(e) => setRestockModal({ ...restockModal, quantity: e.target.value })}
              className="w-full mb-4 rounded border border-white/10 bg-navy3 px-3 py-2 text-white outline-none focus:border-teal"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRestockModal({ isOpen: false, item: null, quantity: '10' })} className="px-4 py-2 rounded border border-white/10 text-gray hover:text-white hover:border-white transition-colors">Cancel</button>
              <button onClick={handleConfirmRestock} className="px-4 py-2 rounded bg-teal text-navy hover:bg-teal/80 font-medium transition-colors">Confirm</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MerchantInventory;

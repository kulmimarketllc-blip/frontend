import React, { useEffect, useMemo, useState } from 'react';
import { Download, Check, X } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import MerchantPill from '../components/MerchantPill';
import Pagination from '../../admin/components/Pagination';
import OrderDetailsModal from '../../../components/merchant/OrderDetailsModal';
import OrderDetailsButton from '../../../components/merchant/OrderDetailsButton';
import { getMyMerchantOrders, updateMerchantOrderStatus } from '../../../services/merchantService';
import { getMerchantNextStatusAction, getOrderStatusLabel, normalizeOrderStatus } from '../../../utils/orderStatus';

const Pill = ({ children, c }) => (
  <MerchantPill className={c}>{children}</MerchantPill>
);
const statusColor = (status) => {
  const normalized = normalizeOrderStatus(status);
  if (normalized === 'pending_payment') return 'text-yellow bg-yellow/10';
  if (normalized === 'confirmed') return 'text-teal bg-teal/10';
  if (normalized === 'processing') return 'text-blue-500 bg-blue-500/10';
  if (normalized === 'ready_for_pickup' || normalized === 'picked_up' || normalized === 'in_transit' || normalized === 'out_for_delivery') {
    return 'text-purple-300 bg-purple-500/10';
  }
  if (normalized === 'delivered') return 'text-green-500 bg-green-500/10';
  if (normalized === 'return_requested') return 'text-orange-300 bg-orange-500/10';
  if (normalized === 'cancelled' || normalized === 'returned' || normalized === 'refunded' || normalized === 'disputed') return 'text-red bg-red/10';
  return 'text-gray2 bg-white/10';
};

const statusLabel = (status) => {
  const normalized = normalizeOrderStatus(status);
  if (normalized === 'ready_for_pickup') return 'Ready for Delivery';
  if (normalized === 'picked_up') return 'Picked Up';
  if (normalized === 'in_transit' || normalized === 'out_for_delivery') return 'In Transit';
  return getOrderStatusLabel(status);
};

const getNextStatusAction = (status = '') => {
  return getMerchantNextStatusAction(status);
};

const buildOrderGroups = (rows = []) => {
  const grouped = new Map();

  rows.forEach((row, index) => {
    const order = row?.order;
    const orderId = order?.id;
    if (!orderId) return;

    const existing = grouped.get(orderId);
    if (existing) {
      existing.qty += Number(row?.quantity || 0);
      existing.total += Number(row?.totalPrice || 0);
      if (row?.productName) existing.productNames.add(row.productName);
      // collect the raw item row so the modal can display it
      existing.itemRows.push(row);
      return;
    }

    grouped.set(orderId, {
      key: orderId,
      order,
      qty: Number(row?.quantity || 0),
      total: Number(row?.totalPrice || 0),
      productNames: new Set(row?.productName ? [row.productName] : []),
      sortKey: `${order?.createdAt || ''}-${index}`,
      itemRows: [row], // raw item rows for modal
    });
  });

  return Array.from(grouped.values())
    .sort((a, b) => String(b.sortKey).localeCompare(String(a.sortKey)));
};

const escapeCsv = (value) => {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const MerchantOrders = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;

  const load = async (nextStatus = statusFilter, nextQuery = query, page = currentPage) => {
    try {
      setLoading(true);
      setError('');
      const payload = await getMyMerchantOrders({
        page,
        limit: itemsPerPage,
        ...(nextStatus !== 'all' ? { status: nextStatus } : {}),
        ...(nextQuery.trim() ? { search: nextQuery.trim() } : {}),
      });
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setRows(list);
      setTotalOrders(Number(payload?.meta?.total || list.length));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load merchant orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('all', '', 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedOrders = useMemo(() => buildOrderGroups(rows), [rows]);

  const byStatus = useMemo(() => {
    const counts = { all: groupedOrders.length };
    groupedOrders.forEach((item) => {
      const key = item?.order?.status || 'unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [groupedOrders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groupedOrders.filter((item) => {
      const status = item?.order?.status || '';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!q) return true;

      const products = Array.from(item?.productNames || []).join(' ');
      const text = `${item?.order?.id || ''} ${products} ${item?.order?.customer?.firstName || ''} ${item?.order?.customer?.lastName || ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [groupedOrders, query, statusFilter]);

  const applyStatus = async (orderId, status) => {
    try {
      setError('');
      setMessage('');
      await updateMerchantOrderStatus(orderId, status);
      setMessage(`Order ${orderId} updated to ${statusLabel(status)}.`);
      setRows((prev) => prev.map((item) => {
        if (item?.order?.id !== orderId) return item;
        return { ...item, order: { ...item.order, status } };
      }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update order status.');
    }
  };

  const openOrderDetails = (orderGroup) => {
    // Reconstruct order with items[] so the modal can display them
    const orderWithItems = {
      ...orderGroup.order,
      total: orderGroup.order?.total ?? orderGroup.total,
      items: (orderGroup.itemRows || []).map((row) => ({
        id: row?.id,
        productName: row?.productName || row?.product?.name || 'Product',
        sku: row?.sku || row?.product?.sku,
        quantity: row?.quantity,
        unitPrice: Number(row?.unitPrice || row?.price || 0),
        price: Number(row?.unitPrice || row?.price || 0),
        totalPrice: Number(row?.totalPrice || 0),
        image: row?.image || row?.product?.images?.[0] || null,
        product: row?.product,
      })),
    };
    setSelectedOrder({ ...orderGroup, order: orderWithItems });
    setIsDetailOpen(true);
  };

  const exportOrdersCsv = () => {
    const headers = [
      'orderId',
      'date',
      'status',
      'customer',
      'customerEmail',
      'products',
      'totalQty',
      'orderTotal',
      'shippingMethod',
      'shippingFee',
      'city',
      'state',
      'address',
    ];

    const lines = filtered.map((o) => {
      const customerName = [o.order?.customer?.firstName, o.order?.customer?.lastName]
        .filter(Boolean)
        .join(' ') || 'Customer';
      return [
        o.order?.id || '',
        o.order?.createdAt ? new Date(o.order.createdAt).toISOString() : '',
        statusLabel(o.order?.status),
        customerName,
        o.order?.customer?.email || '',
        Array.from(o.productNames || []).join(' | '),
        Number(o.qty || 0),
        Number(o.total || 0).toFixed(2),
        o.order?.shippingMethod || '',
        Number(o.order?.shippingFee || 0).toFixed(2),
        o.order?.address?.city || '',
        o.order?.address?.state || '',
        o.order?.address?.addressLine1 || '',
      ].map(escapeCsv).join(',');
    });

    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merchant-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage(`Exported ${filtered.length} order(s) to CSV.`);
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <MerchantPageHeader
        title={
          <>
            Order <span className="text-teal">Management</span>
          </>
        }
        subtitle="Accept, process, and manage your orders"
      />
      <div className="flex gap-2.5">
        <button onClick={exportOrdersCsv} className="text-gray2 hover:border-teal hover:text-teal flex items-center gap-1.5 rounded border border-white/[0.07] px-4 py-1.5 text-[0.8rem] transition-colors">
          <Download size={14} /> Export
        </button>
      </div>
    </div>

    {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
    {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}
    
    <div className="mb-4 flex flex-wrap gap-2">
      {Object.keys(byStatus).map((status, i) => (
        <button
          key={status}
          onClick={() => {
            setStatusFilter(status);
            load(status, query, 1);
          }}
          className={`rounded px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${statusFilter === status ? 'bg-teal text-navy hover:bg-teal2' : 'text-gray2 hover:border-teal hover:text-teal border border-white/[0.07]'}`}
        >
          {status === 'all' ? 'All' : statusLabel(status)} ({byStatus[status] || 0})
        </button>
      ))}
    </div>
    
    <div className="bg-card overflow-hidden rounded-lg border border-white/[0.07]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4 flex-wrap gap-3">
        <h3 className="font-syne text-[1rem] font-bold text-white">All Orders</h3>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load(statusFilter, query, 1);
            }}
            className="bg-navy3 placeholder:text-gray focus:border-teal rounded border border-white/[0.07] px-3 py-1.5 text-[0.8rem] text-white outline-none transition-colors"
            placeholder="Search orders..."
          />
          <span className="text-gray2 text-xs self-center">{loading ? 'Loading...' : `${filtered.length} orders`}</span>
        </div>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden min-[800px]:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-navy3/50 text-gray text-[0.7rem] font-bold tracking-widest uppercase">
            <tr className="border-b border-white/[0.07]">
              {[
                'Order ID',
                'Customer',
                'Products',
                'Qty',
                'Total',
                'Date',
                'Status',
                'Actions',
              ].map((h) => (
                <th key={h} className="px-6 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[0.88rem] text-white">
            {filtered.map((o) => (
              <tr
                key={o.key}
                className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/2"
              >
                  <td className="text-teal px-6 py-4 font-bold">#{o.order?.id}</td>
                  <td className="px-6 py-4 font-medium">{[o.order?.customer?.firstName, o.order?.customer?.lastName].filter(Boolean).join(' ') || o.order?.customer?.email || 'Customer'}</td>
                  <td className="text-gray2 px-6 py-4 max-w-55 truncate">
                    {(() => {
                      const names = Array.from(o.productNames || []);
                      if (!names.length) return 'Order items';
                      if (names.length === 1) return names[0];
                      return `${names[0]} + ${names.length - 1} more`;
                    })()}
                  </td>
                  <td className="px-6 py-4">{o.qty}</td>
                  <td className="px-6 py-4 font-black">${Number(o.total || 0).toFixed(2)}</td>
                  <td className="text-gray2 px-6 py-4">{new Date(o.order?.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <Pill c={statusColor(o.order?.status)}>{statusLabel(o.order?.status)}</Pill>
                </td>
                <td className="px-6 py-4">
                  {o.order?.status === 'confirmed' ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => applyStatus(o.order.id, 'processing')} className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors">
                        <Check size={12} strokeWidth={3} /> Accept
                      </button>
                      <button onClick={() => applyStatus(o.order.id, 'cancelled')} className="border-red/20 bg-red/10 text-red hover:bg-red/20 rounded border px-2 py-1 transition-colors">
                        <X size={12} strokeWidth={3} />
                      </button>
                      <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                    </div>
                  ) : o.order?.status === 'processing' ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => applyStatus(o.order.id, 'ready_for_pickup')} className="bg-teal text-navy hover:bg-teal2 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors">
                        Ready for Delivery
                      </button>
                      <button onClick={() => applyStatus(o.order.id, 'cancelled')} className="border-red/20 bg-red/10 text-red hover:bg-red/20 rounded border px-2.5 py-1 text-[0.72rem] font-bold transition-colors">
                        Cancel
                      </button>
                      <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                    </div>
                  ) : getNextStatusAction(o.order?.status) ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          const action = getNextStatusAction(o.order?.status);
                          if (action) applyStatus(o.order.id, action.next);
                        }}
                        className="bg-teal text-navy hover:bg-teal2 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors"
                      >
                        {getNextStatusAction(o.order?.status)?.label}
                      </button>
                      <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                    </div>
                  ) : (
                    <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="min-[800px]:hidden divide-y divide-white/[0.07]">
        {filtered.map((o) => (
          <div key={o.key} className="p-5 space-y-4 hover:bg-white/2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-teal font-black text-[0.9rem]">#{o.order?.id}</span>
              <Pill c={statusColor(o.order?.status)}>{statusLabel(o.order?.status)}</Pill>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray text-[0.62rem] font-bold tracking-widest uppercase mb-1">Customer</p>
                <p className="text-white text-sm font-bold">{[o.order?.customer?.firstName, o.order?.customer?.lastName].filter(Boolean).join(' ') || o.order?.customer?.email || 'Customer'}</p>
              </div>
              <div>
                <p className="text-gray text-[0.62rem] font-bold tracking-widest uppercase mb-1">Amount</p>
                <p className="text-white text-sm font-black">${Number(o.total || 0).toFixed(2)} <span className="text-[0.62rem] font-medium text-gray lowercase">({o.qty} item{o.qty > 1 ? 's' : ''})</span></p>
              </div>
            </div>
            <div>
              <p className="text-gray text-[0.62rem] font-bold tracking-widest uppercase mb-1">Products</p>
              <p className="text-white text-sm truncate">
                {(() => {
                  const names = Array.from(o.productNames || []);
                  if (!names.length) return 'Order items';
                  if (names.length === 1) return names[0];
                  return `${names[0]} + ${names.length - 1} more`;
                })()}
              </p>
            </div>
            <div className="pt-2 flex justify-between items-center border-t border-white/[0.07]">
               <span className="text-gray text-xs">{new Date(o.order?.createdAt).toLocaleDateString()}</span>
               {o.order?.status === 'confirmed' ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => applyStatus(o.order.id, 'processing')} className="bg-teal text-navy hover:bg-teal2 flex items-center gap-1 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors">
                      <Check size={12} strokeWidth={3} /> Accept
                    </button>
                    <button onClick={() => applyStatus(o.order.id, 'cancelled')} className="border-red/20 bg-red/10 text-red hover:bg-red/20 rounded border px-2 py-1 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                    <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                  </div>
                ) : o.order?.status === 'processing' ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => applyStatus(o.order.id, 'ready_for_pickup')} className="bg-teal text-navy hover:bg-teal2 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors">
                      Ready for Delivery
                    </button>
                    <button onClick={() => applyStatus(o.order.id, 'cancelled')} className="border-red/20 bg-red/10 text-red hover:bg-red/20 rounded border px-2.5 py-1 text-[0.72rem] font-bold transition-colors">
                      Cancel
                    </button>
                    <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                  </div>
                ) : getNextStatusAction(o.order?.status) ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const action = getNextStatusAction(o.order?.status);
                        if (action) applyStatus(o.order.id, action.next);
                      }}
                      className="bg-teal text-navy hover:bg-teal2 rounded border border-transparent px-2.5 py-1 text-[0.72rem] font-bold transition-colors"
                    >
                      {getNextStatusAction(o.order?.status)?.label}
                    </button>
                    <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                  </div>
                ) : (
                  <OrderDetailsButton onClick={() => openOrderDetails(o)} />
                )}
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalOrders}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => load(statusFilter, query, page)}
        loading={loading}
      />
    </div>

    {/* Order Details Modal */}
    <OrderDetailsModal
      isOpen={isDetailOpen}
      onClose={() => {
        setIsDetailOpen(false);
        setSelectedOrder(null);
      }}
      orderId={selectedOrder?.order?.id}
      order={selectedOrder?.order}
    />
  </div>
  );
};
export default MerchantOrders;

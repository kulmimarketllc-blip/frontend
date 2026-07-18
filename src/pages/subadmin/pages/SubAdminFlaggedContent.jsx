import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flag, ShieldAlert, Loader2, Check, Trash2, Eye } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';
import ActionDialog from '../../../components/ui/modals/ActionDialog';
import Pagination from '../../admin/components/Pagination';

const ITEMS_PER_PAGE = 10;

const SubAdminFlaggedContent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { id, action, name }
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchFlaggedProducts = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await subAdminService.listFlaggedContent({ page, limit: ITEMS_PER_PAGE });
      const list = response.data || [];
      setProducts(list);
      setTotalItems(Number(response?.meta?.total || list.length));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch flagged content:', error);
      toast.error('Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = (id, action, name) => setPendingAction({ id, action, name });

  const confirmAction = async ({ reason }) => {
    const { id, action } = pendingAction;
    try {
      setProcessingId(id);
      await subAdminService.moderateContent(id, action, reason);
      toast.success('Content moderated successfully');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to moderate content');
      throw error;
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={<><span>Flagged </span><span className="text-teal">Content</span></>}
        subtitle="Moderate suspicious, offensive, or policy-violating products"
      />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-red/30 bg-red/10 px-3 py-2.5">
        <ShieldAlert size={16} className="mt-0.5 text-red" />
        <p className="text-[0.875rem] text-gray2">Items with multiple flags are highlighted for urgent review.</p>
      </div>

      <div className="bg-card border-border rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead>
              <tr className="bg-navy3">
                {['Product Name', 'Merchant', 'Category', 'Flags', 'Actions'].map((head) => (
                  <th key={head} className="text-gray px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] uppercase">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? products.map((product) => (
                <tr key={product.id} className="border-border border-b last:border-none">
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-white flex items-center gap-1.5 font-semibold">
                      <Flag size={13} className="text-red" />
                      {product.name}
                    </div>
                    <div className="text-[0.7rem] text-gray ml-5">ID: {product.id}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-white">{product.merchant?.storeName}</div>
                    <div className="text-[0.75rem] text-gray">ID: {product.merchantId}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[0.875rem] text-gray2">
                    {product.category?.name || 'Uncategorized'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-red bg-red/10 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold flex items-center gap-1 w-fit">
                      <Flag size={10} /> {product.flagCount} Flags
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleAction(product.id, 'clear_flags', product.name)}
                        disabled={processingId === product.id}
                        className="text-green-500 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-50 rounded border border-green-500/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                      >
                        <Check size={12} /> Mark Safe
                      </button>
                      <button 
                        onClick={() => handleAction(product.id, 'reject', product.name)}
                        disabled={processingId === product.id}
                        className="text-red bg-red/10 hover:bg-red/20 disabled:opacity-50 rounded border border-red/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                      <Link 
                        to={`/product/${product.slug}`} 
                        target="_blank"
                        className="border-border text-gray2 hover:border-teal hover:text-teal rounded border px-2 py-1 text-[0.7rem] font-semibold flex items-center justify-center"
                        title="View Product Details"
                      >
                        <Eye size={12} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-gray py-20 text-center">No flagged products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={(page) => fetchFlaggedProducts(page)}
        loading={loading}
      />

      <ActionDialog
        open={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
        tone={pendingAction?.action === 'reject' ? 'danger' : 'success'}
        title={pendingAction?.action === 'reject' ? 'Remove Product' : 'Mark Product as Safe'}
        message={
          pendingAction?.action === 'reject'
            ? `"${pendingAction?.name}" will be removed from the marketplace. Please provide a reason for this action.`
            : `All flags on "${pendingAction?.name}" will be cleared. Please provide a reason for this action.`
        }
        confirmText={pendingAction?.action === 'reject' ? 'Remove Product' : 'Mark Safe'}
        fields={[{
          name: 'reason',
          label: 'Reason',
          required: true,
          multiline: true,
          placeholder: 'Explain why you are taking this action...',
        }]}
      />
    </div>
  );
};

export default SubAdminFlaggedContent;

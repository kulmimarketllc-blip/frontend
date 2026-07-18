import React, { useState, useEffect } from 'react';
import { Star, Loader2, Check, Trash2, Flag, Package, ShieldCheck } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';
import ActionDialog from '../../../components/ui/modals/ActionDialog';
import Pagination from '../../admin/components/Pagination';

const ITEMS_PER_PAGE = 10;

const SubAdminReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { id, action }
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchReviews = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await subAdminService.listFlaggedReviews({ page, limit: ITEMS_PER_PAGE });
      const list = response.data || [];
      setReviews(list);
      setTotalItems(Number(response?.meta?.total || list.length));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch flagged reviews:', error);
      toast.error('Failed to load flagged reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = (id, action) => setPendingAction({ id, action });

  const confirmAction = async ({ reason }) => {
    const { id, action } = pendingAction;
    try {
      setProcessingId(id);
      await subAdminService.moderateReview(id, action, reason);
      toast.success('Review moderation completed');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to moderate review');
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
        title={<><span>Review </span><span className="text-teal">Moderation</span></>}
        subtitle="Inspect and moderate user-submitted product reviews"
      />

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => {
            const reviewerName = [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') || 'Anonymous';
            const initials = reviewerName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
            const isBusy = processingId === review.id;
            return (
              <div key={review.id} className="bg-card border-border rounded-lg border p-4 sm:p-5 transition-colors hover:border-white/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Reviewer + review */}
                  <div className="flex flex-1 min-w-0 items-start gap-3">
                    <div className="bg-teal/10 text-teal border-teal/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-[0.9rem] font-semibold text-white">{reviewerName}</span>
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={star <= Number(review.rating || 0) ? 'text-yellow fill-yellow' : 'text-white/15'}
                            />
                          ))}
                        </span>
                        <span className="text-red bg-red/10 border-red/30 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold">
                          <Flag size={10} /> {review.flagCount} {Number(review.flagCount) === 1 ? 'flag' : 'flags'}
                        </span>
                        {review.createdAt && (
                          <span className="text-gray text-[0.72rem]">{new Date(review.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-gray2 mt-2 text-[0.875rem] leading-relaxed">
                        “{review.comment}”
                      </p>
                      <div className="text-gray mt-2.5 flex items-center gap-1.5 text-[0.75rem]">
                        <Package size={12} className="text-teal shrink-0" />
                        <span className="truncate">
                          On product: <span className="text-gray2 font-medium">{review.product?.name || 'Unknown product'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2 sm:flex-col sm:items-stretch">
                    <button
                      onClick={() => handleAction(review.id, 'clear_flags')}
                      disabled={isBusy}
                      title="Clear flags and keep this review visible"
                      className="text-green-500 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-50 flex flex-1 items-center justify-center gap-1.5 rounded-md border border-green-500/30 px-3.5 py-2 text-[0.78rem] font-semibold transition-colors sm:flex-none"
                    >
                      {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Keep Review
                    </button>
                    <button
                      onClick={() => handleAction(review.id, 'reject')}
                      disabled={isBusy}
                      title="Remove this review from the product page"
                      className="text-red bg-red/10 hover:bg-red/20 disabled:opacity-50 flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red/30 px-3.5 py-2 text-[0.78rem] font-semibold transition-colors sm:flex-none"
                    >
                      {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border-border flex flex-col items-center justify-center rounded-lg border py-20 text-center">
          <div className="bg-teal/10 text-teal border-teal/30 mb-4 flex h-14 w-14 items-center justify-center rounded-full border">
            <ShieldCheck size={26} />
          </div>
          <h3 className="text-[0.95rem] font-bold text-white">All clear!</h3>
          <p className="text-gray mt-1 max-w-xs text-[0.82rem]">
            No flagged reviews to moderate right now. New reports will show up here automatically.
          </p>
        </div>
      )}

      {reviews.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => fetchReviews(page)}
          loading={loading}
        />
      )}

      <ActionDialog
        open={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
        tone={pendingAction?.action === 'reject' ? 'danger' : 'success'}
        title={pendingAction?.action === 'reject' ? 'Remove Review' : 'Keep Review'}
        message={
          pendingAction?.action === 'reject'
            ? 'This review will be removed from the product page. Please provide a reason for this action.'
            : 'All flags on this review will be cleared and it will stay visible. Please provide a reason for this action.'
        }
        confirmText={pendingAction?.action === 'reject' ? 'Remove Review' : 'Keep Review'}
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

export default SubAdminReviewModeration;

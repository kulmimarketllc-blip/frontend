import React, { useState, useEffect } from 'react';
import { Star, Loader2, Check, Trash2, Flag, AlertCircle } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';

const SubAdminReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await subAdminService.listFlaggedReviews();
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch flagged reviews:', error);
      toast.error('Failed to load flagged reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAction = async (id, action) => {
    const reason = prompt(`Enter reason for moderation action (${action}):`);
    if (!reason) return;

    try {
      setProcessingId(id);
      await subAdminService.moderateReview(id, action, reason);
      toast.success('Review moderation completed');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to moderate review');
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

      <div className="bg-card border-border overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-navy3">
                {['Review', 'Product', 'Rating', 'Flags', 'Actions'].map((head) => (
                  <th key={head} className="text-gray px-3 py-2 text-left text-[0.66rem] font-semibold tracking-[0.08em] uppercase">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? reviews.map((review) => (
                <tr key={review.id} className="border-border border-b last:border-none">
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-white max-w-[300px] whitespace-normal line-clamp-2">{review.comment}</div>
                    <div className="text-[0.75rem] text-gray mt-1">by {review.user?.firstName} {review.user?.lastName}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-gray2">{review.product?.name}</div>
                    <div className="text-[0.7rem] text-gray">ID: {review.productId}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[0.875rem] text-yellow inline-flex items-center gap-1">
                    <Star size={12} className="fill-yellow" />
                    {review.rating}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-red bg-red/10 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold flex items-center gap-1 w-fit">
                      <Flag size={10} /> {review.flagCount} Flags
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleAction(review.id, 'clear_flags')}
                        className="text-green-500 bg-green-500/10 hover:bg-green-500/20 rounded border border-green-500/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                        title="Approve and Clear Flags"
                      >
                        <Check size={12} /> Keep
                      </button>
                      <button 
                        onClick={() => handleAction(review.id, 'reject')}
                        className="text-red bg-red/10 hover:bg-red/20 rounded border border-red/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                        title="Reject Review"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-gray py-20 text-center">No flagged reviews found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubAdminReviewModeration;

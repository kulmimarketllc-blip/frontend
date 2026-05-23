import React, { useEffect, useMemo, useState } from 'react';
import { getMyOrders } from '../../../../services/checkoutService';
import { getToken } from '../../../../utils/storage';
import { getProductReviews, submitProductReview, toggleReviewHelpful, flagReview } from '../../../../services/reviewService';
import { MoreVertical, AlertTriangle } from 'lucide-react';
import ReportModal from '../../../../components/ui/modals/ReportModal';

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [reviewsState, setReviewsState] = useState({
    loading: false,
    error: '',
    items: [],
    breakdown: null,
  });
  const [reviewForm, setReviewForm] = useState({
    orderId: '',
    rating: 5,
    title: '',
    comment: '',
    images: '',
  });
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [formState, setFormState] = useState({ loading: false, error: '', success: '' });
  const [helpfulBusyId, setHelpfulBusyId] = useState('');
  const [reportingReview, setReportingReview] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const isAuthenticated = Boolean(getToken());

  const productId = product?.id;

  const ratingValue = useMemo(() => {
    const average = Number(reviewsState.breakdown?.average || 0);
    return Number.isFinite(average) ? average : 0;
  }, [reviewsState.breakdown]);

  useEffect(() => {
    let active = true;

    const loadReviews = async () => {
      if (!productId) return;
      try {
        setReviewsState((prev) => ({ ...prev, loading: true, error: '' }));
        const result = await getProductReviews(productId, { page: 1, limit: 20 });
        if (!active) return;
        setReviewsState({
          loading: false,
          error: '',
          items: Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [],
          breakdown: result?.breakdown || null,
        });
      } catch (error) {
        if (!active) return;
        setReviewsState((prev) => ({
          ...prev,
          loading: false,
          error: error?.response?.data?.message || 'Unable to load product reviews right now.',
        }));
      }
    };

    loadReviews();

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    let active = true;

    const loadEligibleOrders = async () => {
      if (!isAuthenticated || !productId) {
        setEligibleOrders([]);
        return;
      }

      try {
        const result = await getMyOrders({ page: 1, limit: 50 });
        if (!active) return;

        const orders = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
        const eligible = orders.filter((order) => {
          const isDelivered = String(order?.status || '').toLowerCase() === 'delivered';
          const items = Array.isArray(order?.items) ? order.items : [];
          return isDelivered && items.some((item) => String(item?.productId) === String(productId));
        });

        setEligibleOrders(eligible);
        setReviewForm((prev) => ({
          ...prev,
          orderId: prev.orderId || eligible[0]?.id || '',
        }));
      } catch {
        if (active) {
          setEligibleOrders([]);
        }
      }
    };

    loadEligibleOrders();

    return () => {
      active = false;
    };
  }, [isAuthenticated, productId]);

  const refreshReviews = async () => {
    if (!productId) return;
    const result = await getProductReviews(productId, { page: 1, limit: 20 });
    setReviewsState({
      loading: false,
      error: '',
      items: Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [],
      breakdown: result?.breakdown || null,
    });
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setFormState({ loading: false, error: 'Please log in to leave a review.', success: '' });
      return;
    }

    if (!reviewForm.orderId) {
      setFormState({ loading: false, error: 'Select a delivered order for this product.', success: '' });
      return;
    }

    try {
      setFormState({ loading: true, error: '', success: '' });
      const images = reviewForm.images
        .split(',')
        .map((image) => image.trim())
        .filter(Boolean);

      await submitProductReview({
        productId,
        orderId: reviewForm.orderId,
        rating: Number(reviewForm.rating),
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
        images,
      });

      await refreshReviews();
      setFormState({ loading: false, error: '', success: 'Your review has been posted.' });
      setReviewForm((prev) => ({
        ...prev,
        rating: 5,
        title: '',
        comment: '',
        images: '',
      }));
    } catch (error) {
      setFormState({
        loading: false,
        error: error?.response?.data?.message || 'Unable to submit your review right now.',
        success: '',
      });
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      setHelpfulBusyId(reviewId);
      await toggleReviewHelpful(reviewId);
      await refreshReviews();
    } catch (error) {
      setReviewsState((prev) => ({
        ...prev,
        error: error?.response?.data?.message || 'Unable to update helpful vote right now.',
      }));
    } finally {
      setHelpfulBusyId('');
    }
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'reviews', label: `Reviews (${reviewsState.breakdown?.total ?? product.reviews ?? 0})` },
    { id: 'shipping', label: 'Shipping' },
  ];

  return (
    <section className="mt-10 sm:mt-12 lg:mt-16">
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-xs font-bold tracking-widest uppercase transition-all lg:px-6 lg:py-4 lg:text-sm ${
              activeTab === tab.id
                ? 'text-teal'
                : 'text-gray/40 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute -bottom-px left-0 h-0.5 w-full bg-teal shadow-[0_-2px_6px_rgba(0,201,167,0.3)]" />
            )}
          </button>
        ))}
      </div>

      <div className="py-6 sm:py-8 lg:py-10">
        {activeTab === 'description' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
            <p className="max-w-4xl text-sm leading-relaxed text-gray2 lg:text-base">
              {product.description}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-10">
              <div className="space-y-3">
                <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-white">Materials</h3>
                <p className="text-sm leading-relaxed text-gray2">{product.materials}</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-white">Care Instructions</h3>
                <p className="text-sm leading-relaxed text-gray2">{product.care}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8 lg:space-y-10">
            <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-10">
              <div className="bg-navy2/30 rounded-xs border border-white/5 p-5 lg:p-6">
                <div className="flex flex-col gap-1.5">
                  <div className="font-['Syne'] text-[2.8rem] font-bold leading-none text-white lg:text-[3.5rem]">
                    {ratingValue ? ratingValue.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.round(ratingValue) ? 'fill-yellow text-yellow' : 'text-white/10'}
                      />
                    ))}
                  </div>
                  <p className="text-xs lg:text-sm font-medium text-gray2">
                    {reviewsState.breakdown?.total || 0} verified reviews
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const percent = reviewsState.breakdown?.percentages?.[rating] || 0;
                    return (
                      <div key={rating} className="flex items-center gap-3 text-xs text-gray2">
                        <span className="w-4">{rating}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-teal" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-10 text-right">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form
                onSubmit={handleSubmitReview}
                className="bg-navy2/30 rounded-xs border border-white/5 p-5 lg:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Leave a review</h3>
                    <p className="mt-1 text-[13px] text-gray2">Only delivered purchases for this product can be reviewed.</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-gray2">
                    Verified purchase only
                  </span>
                </div>

                {!isAuthenticated ? (
                  <div className="rounded-xs border border-teal/20 bg-teal/5 px-4 py-3 text-sm text-gray2">
                    Please log in to write a review.
                  </div>
                ) : eligibleOrders.length === 0 ? (
                  <div className="rounded-xs border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray2">
                    You do not have a delivered order for this product yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray/50">Delivered order</span>
                      <select
                        value={reviewForm.orderId}
                        onChange={(event) => setReviewForm((prev) => ({ ...prev, orderId: event.target.value }))}
                        className="w-full rounded-xs border border-white/10 bg-navy px-3 py-3 text-sm text-white outline-none transition focus:border-teal"
                      >
                        {eligibleOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            Order {order.orderNumber || order.id} - {String(order.status || '').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div>
                      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray2">Rating</span>
                      <div className="flex flex-wrap gap-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating }))}
                            className={`flex items-center gap-1 rounded-full border px-3 py-2 text-sm font-bold transition ${
                              Number(reviewForm.rating) === rating
                                ? 'border-teal bg-teal/10 text-white'
                                : 'border-white/10 text-gray2 hover:border-white/25'
                            }`}
                          >
                            <Star size={14} className={Number(reviewForm.rating) >= rating ? 'fill-yellow text-yellow' : 'text-white/20'} />
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-2 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray2">Title</span>
                        <input
                          value={reviewForm.title}
                          onChange={(event) => setReviewForm((prev) => ({ ...prev, title: event.target.value }))}
                          maxLength={120}
                          placeholder="Short headline for your review"
                          className="w-full rounded-xs border border-white/10 bg-navy px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray/35 focus:border-teal"
                        />
                      </label>

                      <label className="block space-y-2 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray2">Comment</span>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                          minLength={10}
                          rows={5}
                          placeholder="Tell other buyers what you thought about the product and delivery."
                          className="w-full rounded-xs border border-white/10 bg-navy px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray/35 focus:border-teal"
                        />
                      </label>

                      <label className="block space-y-2 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray2">Image URLs</span>
                        <textarea
                          value={reviewForm.images}
                          onChange={(event) => setReviewForm((prev) => ({ ...prev, images: event.target.value }))}
                          rows={2}
                          placeholder="Paste image URLs separated by commas"
                          className="w-full rounded-xs border border-white/10 bg-navy px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray/35 focus:border-teal"
                        />
                      </label>
                    </div>

                    {formState.error && (
                      <div className="rounded-xs border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
                        {formState.error}
                      </div>
                    )}

                    {formState.success && (
                      <div className="rounded-xs border border-teal/30 bg-teal/10 px-4 py-3 text-sm text-teal">
                        {formState.success}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={formState.loading || eligibleOrders.length === 0}
                      className="inline-flex h-11 items-center justify-center rounded-xs bg-teal px-5 text-xs font-bold uppercase tracking-widest text-navy transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {formState.loading ? 'Posting...' : 'Post review'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {reviewsState.error && (
              <div className="rounded-xs border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">
                {reviewsState.error}
              </div>
            )}

            <div className="space-y-6 lg:space-y-8">
              {reviewsState.loading ? (
                <p className="text-sm text-gray2">Loading reviews...</p>
              ) : reviewsState.items.length === 0 ? (
                <div className="rounded-xs border border-white/10 bg-white/5 px-4 py-5 text-sm text-gray2">
                  No reviews yet. Be the first verified buyer to leave feedback.
                </div>
              ) : (
                reviewsState.items.map((review) => {
                  const initials = [review.user?.firstName, review.user?.lastName]
                    .filter(Boolean)
                    .map((part) => part.trim()[0])
                    .join('')
                    || review.user?.name?.trim()?.[0]
                    || 'U';
                  const reviewName = [review.user?.firstName, review.user?.lastName]
                    .filter(Boolean)
                    .join(' ')
                    || review.user?.name
                    || 'Customer';

                  return (
                    <div key={review.id} className="space-y-4 border-b border-white/5 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-teal/10 relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xs text-[0.75rem] font-bold text-teal lg:h-9 lg:w-9 lg:text-sm">
                            <span>{initials}</span>
                            {review.user?.avatarUrl ? (
                              <img
                                src={review.user.avatarUrl}
                                alt={reviewName}
                                className="absolute inset-0 h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold leading-none text-white">{reviewName}</span>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.65rem] lg:text-xs text-gray2 font-medium">
                              <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}</span>
                              {review.isVerifiedPurchase && (
                                <span className="rounded-full border border-teal/20 bg-teal/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-teal">
                                  Verified purchase
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleHelpful(review.id)}
                          disabled={!isAuthenticated || helpfulBusyId === review.id}
                          className="rounded-full border border-white/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-gray2 transition hover:border-teal/30 hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {helpfulBusyId === review.id ? '...' : 'Helpful'} ({review.helpfulCount || 0})
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveDropdown(activeDropdown === review.id ? null : review.id)}
                            className="text-gray2 hover:text-white transition-colors p-1"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {activeDropdown === review.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-navy2 border border-white/10 rounded-xs shadow-xl z-10 animate-in fade-in slide-in-from-top-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setReportingReview(review);
                                  setActiveDropdown(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red/80 hover:text-red hover:bg-white/5 transition-colors text-left"
                              >
                                <AlertTriangle size={14} />
                                Report Review
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={12}
                            className={index < Number(review.rating || 0) ? 'fill-yellow text-yellow' : 'text-white/5'}
                          />
                        ))}
                      </div>

                      <div className="space-y-2">
                        {review.title && <h4 className="text-sm font-bold text-white">{review.title}</h4>}
                        <p className="text-sm leading-relaxed text-gray">{review.comment || review.text || ''}</p>
                      </div>

                      {Array.isArray(review.images) && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {review.images.map((image) => (
                            <a
                              key={image}
                              href={image}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xs border border-white/10 px-3 py-2 text-xs text-gray2 transition hover:border-teal/30 hover:text-white"
                            >
                              View image
                            </a>
                          ))}
                        </div>
                      )}

                      {review.merchantReply && (
                        <div className="rounded-xs border border-teal/20 bg-teal/5 p-4">
                          <div className="mb-1 text-[0.65rem] font-bold uppercase tracking-widest text-teal">Merchant reply</div>
                          <p className="text-sm leading-relaxed text-gray">{review.merchantReply}</p>
                          {review.merchantRepliedAt && (
                            <div className="mt-2 text-[0.65rem] text-gray2">
                              {new Date(review.merchantRepliedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8 lg:space-y-10">
            <div className="space-y-3">
              <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-white">Delivery Information</h3>
              <ul className="space-y-1.5 text-sm text-gray2 lg:space-y-2">
                <li>• Inside Dhaka: {product.shipping?.dhaka}</li>
                <li>• Outside Dhaka: {product.shipping?.outside}</li>
                <li>• Free delivery on orders over {'$'}{product.shipping?.free_threshold}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-white">Return Policy</h3>
              <ul className="space-y-1.5 text-sm text-gray2 lg:space-y-2">
                <li>• 7-day easy return policy</li>
                <li>• Product must be unused and in original packaging</li>
                <li>• Refund processed within 3-5 business days</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={Boolean(reportingReview)}
        onClose={() => setReportingReview(null)}
        onSubmit={(data) => flagReview(reportingReview?.id, data)}
        targetType="Review"
        targetId={reportingReview?.id}
      />
    </section>
  );
};

const Star = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default ProductTabs;

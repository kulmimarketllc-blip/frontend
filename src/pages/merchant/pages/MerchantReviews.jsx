import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import {
  addReplyToReview,
  getMyMerchantReviews,
  getMyMerchantStore,
  updateReplyToReview,
} from '../../../services/merchantService';
import Pagination from '../../admin/components/Pagination';

const ITEMS_PER_PAGE = 10;

const MerchantReviews = () => {
  const [merchantId, setMerchantId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [replyModal, setReplyModal] = useState({ isOpen: false, review: null, text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');

      let id = merchantId;
      if (!id) {
        const store = await getMyMerchantStore();
        id = store?.id;
        setMerchantId(id || '');
      }
      if (!id) {
        setRows([]);
        return;
      }

      const payload = await getMyMerchantReviews(id, { page, limit: ITEMS_PER_PAGE, sort: 'newest' });
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setRows(list);
      setTotalItems(Number(payload?.meta?.total || list.length));
      setCurrentPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breakdown = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach((r) => {
      const value = Number(r.rating || 0);
      if (value >= 1 && value <= 5) counts[value] += 1;
    });
    const total = rows.length;
    const avg = total ? (rows.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total) : 0;
    return { counts, total, avg };
  }, [rows]);

  const saveReply = async (row) => {
    setReplyModal({ isOpen: true, review: row, text: row.merchantReply || '' });
  };

  const handleSaveReply = async () => {
    if (!replyModal.text.trim()) {
      setError('Reply cannot be empty.');
      return;
    }

    try {
      setError('');
      setMessage('');
      if (replyModal.review.merchantReply) {
        await updateReplyToReview(replyModal.review.id, replyModal.text.trim());
        setMessage('Reply updated.');
      } else {
        await addReplyToReview(replyModal.review.id, replyModal.text.trim());
        setMessage('Reply posted.');
      }
      setRows((prev) => prev.map((item) => (item.id === replyModal.review.id ? { ...item, merchantReply: replyModal.text.trim() } : item)));
      setReplyModal({ isOpen: false, review: null, text: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save reply.');
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6">
        <MerchantPageHeader
          title={
            <>
              Customer <span className="text-teal">Reviews</span>
            </>
          }
          subtitle="Monitor and respond to customer feedback"
        />
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-8 mb-8">
        <div className="bg-card rounded-lg border border-white/[0.07] p-6 lg:p-8 text-center flex flex-col items-center justify-center">
          <div className="font-syne text-[3.5rem] leading-none font-extrabold text-white mb-2">{breakdown.avg.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < Math.round(breakdown.avg) ? 'fill-yellow text-yellow' : 'text-gray/20'} />
            ))}
          </div>
          <div className="text-gray text-[0.7rem] font-bold tracking-widest uppercase mb-6">
            {breakdown.total} reviews
          </div>
          <div className="w-full space-y-2.5">
            {[5, 4, 3, 2, 1].map((score) => {
              const count = breakdown.counts[score];
              const pct = breakdown.total ? (count / breakdown.total) * 100 : 0;
              return (
                <div key={score} className="flex items-center gap-3">
                  <span className="text-[0.7rem] font-bold text-gray w-2">{score}</span>
                  <div className="h-1.5 flex-1 bg-navy3 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[0.7rem] font-bold text-gray w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-white/[0.07] overflow-hidden">
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.07] px-6 py-4 gap-3">
            <h3 className="font-syne text-[1rem] font-bold text-white">Recent Reviews</h3>
            <button onClick={load} className="text-xs text-gray2 hover:text-teal">{loading ? 'Loading...' : 'Refresh'}</button>
          </div>

          <div className="p-6 space-y-6">
            {rows.map((r) => (
              <div key={r.id} className="bg-navy3 border-white/[0.07] rounded-md border p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="text-[0.95rem] font-bold text-white mb-0.5">
                      {[r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ') || 'Customer'}
                      <span className="text-gray text-[0.75rem] font-normal ml-1">· {
                        r.product?.id
                          ? (
                              <a
                                href={`/product/${r.product.id}`}
                                className="text-teal hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {r.product?.name || 'Product'}
                              </a>
                            )
                          : (r.product?.name || 'Product')
                      }</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={12} className={j < Number(r.rating || 0) ? 'fill-yellow text-yellow' : 'text-gray/20'} />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray2 text-[0.88rem] leading-relaxed mb-3 mt-3">{r.comment || 'No review text.'}</p>

                {r.merchantReply ? (
                  <div className="mb-2 rounded border border-teal/20 bg-teal/5 p-3 text-sm text-gray2">
                    <div className="mb-1 text-teal text-[0.68rem] font-bold tracking-widest uppercase">Your reply</div>
                    {r.merchantReply}
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-gray text-[0.7rem] font-bold tracking-widest uppercase">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  <button onClick={() => saveReply(r)} className="text-gray hover:border-teal hover:text-teal rounded border border-white/10 px-4 py-1.5 text-[0.75rem] font-bold transition-all">
                    {r.merchantReply ? 'Edit Reply' : 'Reply'}
                  </button>
                </div>
              </div>
            ))}
            {!rows.length ? <div className="text-sm text-gray2">No reviews yet for this store.</div> : null}
          </div>

          {rows.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => load(page)}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-card border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-2">
              {replyModal.review?.merchantReply ? 'Edit Reply' : 'Write Reply'}
            </h3>
            <p className="text-sm text-gray2 mb-4">
              Rating: <span className="text-teal font-semibold">{replyModal.review?.rating} / 5</span>
            </p>
            <p className="text-sm text-gray2 mb-4 line-clamp-2">{replyModal.review?.text}</p>
            {error && <div className="mb-4 rounded border border-red/30 bg-red/10 px-3 py-2 text-sm text-red-300">{error}</div>}
            <textarea
              value={replyModal.text}
              onChange={(e) => setReplyModal({ ...replyModal, text: e.target.value })}
              placeholder="Write your reply..."
              className="bg-navy3 w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-teal transition-colors resize-none h-32 mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setReplyModal({ isOpen: false, review: null, text: '' })}
                className="px-4 py-2 rounded border border-white/10 text-gray hover:text-white hover:border-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReply}
                className="px-4 py-2 rounded bg-teal text-navy hover:bg-teal/80 font-medium transition-colors"
              >
                {replyModal.review?.merchantReply ? 'Update' : 'Post Reply'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MerchantReviews;

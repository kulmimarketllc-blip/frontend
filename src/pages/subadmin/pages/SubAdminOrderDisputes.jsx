import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Scale, Loader2, Eye, CheckCircle2, X } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';
import ActionDialog from '../../../components/ui/modals/ActionDialog';
import Pagination from '../../admin/components/Pagination';

const ITEMS_PER_PAGE = 10;

const SubAdminOrderDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchDisputes = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await subAdminService.listDisputes({ page, limit: ITEMS_PER_PAGE });
      const list = response.data || [];
      setDisputes(list);
      setTotalItems(Number(response?.meta?.total || list.length));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResolve = (id) => setResolvingId(id);

  const confirmResolve = async ({ resolution, notes }) => {
    const id = resolvingId;
    try {
      setProcessingId(id);
      await subAdminService.resolveDispute(id, resolution, notes);
      toast.success('Dispute marked as resolved');
      fetchDisputes();
    } catch (error) {
      toast.error('Failed to resolve dispute');
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
        title={<><span>Order </span><span className="text-teal">Disputes</span></>}
        subtitle="Track and resolve customer-vs-merchant dispute cases"
      />

      <div className="bg-card border-border overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-navy3">
                {['ID', 'Order', 'Customer', 'Merchant', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="text-gray px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] uppercase">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {disputes.length > 0 ? disputes.map((row) => (
                <tr key={row.id} className="border-border border-b last:border-none">
                  <td className="px-3 py-2.5 text-[0.875rem] text-white">
                    <div className="flex items-center gap-1.5">
                      <Scale size={13} className="text-teal" />
                      #{row.id.slice(-6)}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-gray2">#{row.orderId.slice(-8)}</div>
                    <div className="text-[0.7rem] text-gray">{new Date(row.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-white">{row.customer?.firstName} {row.customer?.lastName}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-white">{row.merchant?.storeName}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold capitalize ${
                      row.status === 'open' ? 'text-red bg-red/10 border border-red/30' : 
                      row.status === 'resolved' ? 'text-green-500 bg-green-500/10 border border-green-500/30' : 
                      'text-yellow bg-yellow/10 border border-yellow/40'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setSelectedDispute(row)}
                        className="text-blue-500 bg-blue-500/10 rounded border border-blue-500/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                      >
                        <Eye size={12} /> View
                      </button>
                      {row.status !== 'resolved' && (
                        <button 
                          onClick={() => handleResolve(row.id)}
                          disabled={processingId === row.id}
                          className="text-green-500 bg-green-500/10 rounded border border-green-500/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-gray py-20 text-center">No dispute cases found</td>
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
        onPageChange={(page) => fetchDisputes(page)}
        loading={loading}
      />

      <ActionDialog
        open={!!resolvingId}
        onClose={() => setResolvingId(null)}
        onConfirm={confirmResolve}
        tone="success"
        title="Resolve Dispute"
        message={`Dispute #${resolvingId ? String(resolvingId).slice(-6) : ''} will be marked as resolved. Summarize the outcome below.`}
        confirmText="Mark Resolved"
        fields={[
          {
            name: 'resolution',
            label: 'Resolution Summary',
            required: true,
            multiline: true,
            placeholder: 'Describe how this dispute was resolved...',
          },
          {
            name: 'notes',
            label: 'Internal Notes',
            multiline: true,
            placeholder: 'Visible to admins only (optional)...',
          },
        ]}
      />

      {/* Details Modal — portaled to body so DashboardShell overflow-hidden cannot clip it */}
      {selectedDispute && createPortal(
        <div
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDispute(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-card border-border my-auto w-full max-w-lg rounded-xl border shadow-2xl animate-[fadeUp_0.25s_ease_both]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-teal/10 text-teal border-teal/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                  <Scale size={18} />
                </div>
                <div>
                  <h3 className="font-syne text-[0.95rem] font-bold text-white">
                    Dispute <span className="text-teal">Details</span>
                  </h3>
                  <p className="text-gray text-xs mt-0.5">
                    #{String(selectedDispute.id).slice(-6)} · Order #{String(selectedDispute.orderId).slice(-8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold capitalize ${
                  selectedDispute.status === 'open' ? 'text-red bg-red/10 border-red/30' :
                  selectedDispute.status === 'resolved' ? 'text-green-500 bg-green-500/10 border-green-500/30' :
                  'text-yellow bg-yellow/10 border-yellow/40'
                }`}>
                  {selectedDispute.status}
                </span>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-gray2 hover:bg-white/10 hover:text-white ml-1 rounded-lg p-1 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[min(70vh,520px)] space-y-4 overflow-y-auto px-5 py-4">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-navy3/40 rounded-lg px-3 py-2">
                  <p className="text-gray mb-0.5 font-bold uppercase tracking-wider">Customer</p>
                  <p className="font-medium text-white">
                    {[selectedDispute.customer?.firstName, selectedDispute.customer?.lastName].filter(Boolean).join(' ') || 'N/A'}
                  </p>
                </div>
                <div className="bg-navy3/40 rounded-lg px-3 py-2">
                  <p className="text-gray mb-0.5 font-bold uppercase tracking-wider">Merchant</p>
                  <p className="font-medium text-white">{selectedDispute.merchant?.storeName || 'N/A'}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-navy3/40 rounded-lg px-3 py-2.5">
                <p className="text-gray mb-1 text-[0.65rem] font-bold uppercase tracking-wider">Reason</p>
                <p className="text-teal text-sm font-semibold capitalize">{selectedDispute.reason?.replace(/_/g, ' ') || 'Not specified'}</p>
              </div>

              {/* Description */}
              <div className="bg-navy3/40 rounded-lg px-3 py-2.5">
                <p className="text-gray mb-1 text-[0.65rem] font-bold uppercase tracking-wider">Customer's Description</p>
                <p className="text-gray2 text-sm leading-relaxed">“{selectedDispute.description || 'No description provided.'}”</p>
              </div>

              {/* Notes timeline */}
              <div>
                <p className="text-gray mb-2 text-[0.65rem] font-bold uppercase tracking-wider">Status History / Notes</p>
                <div className="space-y-2.5">
                  {(selectedDispute.notes || []).length > 0 ? selectedDispute.notes.map((note, idx) => (
                    <div key={idx} className="border-teal bg-navy3/40 rounded-r-lg border-l-2 py-2 pl-3 pr-2">
                      <div className="text-xs font-semibold text-white">
                        {note.authorName}
                        <span className="text-gray ml-2 text-[0.65rem] font-normal">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-gray2 mt-0.5 text-xs italic">“{note.content}”</div>
                    </div>
                  )) : (
                    <div className="text-gray bg-navy3/40 rounded-lg px-3 py-3 text-center text-xs italic">No internal notes yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 border-t border-white/[0.07] px-5 py-4">
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-gray2 hover:bg-white/5 hover:text-white rounded-md border border-white/10 px-4 py-2 text-[0.8rem] font-semibold transition-colors"
              >
                Close
              </button>
              {selectedDispute.status !== 'resolved' && (
                <button
                  onClick={() => { const id = selectedDispute.id; setSelectedDispute(null); handleResolve(id); }}
                  className="flex items-center gap-1.5 rounded-md bg-green-500 px-4 py-2 text-[0.8rem] font-bold text-navy transition-all hover:brightness-110"
                >
                  <CheckCircle2 size={14} /> Resolve Dispute
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SubAdminOrderDisputes;

import React, { useState, useEffect } from 'react';
import { Scale, Loader2, Eye, CheckCircle2, MessageSquare } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';

const SubAdminOrderDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await subAdminService.listDisputes();
      setDisputes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id) => {
    const resolution = prompt('Enter resolution summary:');
    if (!resolution) return;
    const notes = prompt('Internal notes (optional):');

    try {
      setProcessingId(id);
      await subAdminService.resolveDispute(id, resolution, notes);
      toast.success('Dispute marked as resolved');
      fetchDisputes();
    } catch (error) {
      toast.error('Failed to resolve dispute');
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

      {/* Details Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card w-full max-w-lg rounded-xl border border-white/10 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-['Syne'] text-lg font-bold text-white">Dispute Details</h3>
              <button onClick={() => setSelectedDispute(null)} className="text-gray hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray uppercase tracking-wider mb-1">Reason</div>
                <div className="text-sm text-teal font-semibold capitalize">{selectedDispute.reason?.replace(/_/g, ' ')}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray uppercase tracking-wider mb-1">Description</div>
                <div className="text-sm text-gray2 bg-navy3 p-3 rounded border border-white/5">{selectedDispute.description}</div>
              </div>

              <div>
                <div className="text-xs text-gray uppercase tracking-wider mb-1">Status History / Notes</div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {(selectedDispute.notes || []).map((note, idx) => (
                    <div key={idx} className="text-xs border-l-2 border-teal pl-3 py-1">
                      <div className="text-white font-semibold">{note.authorName} <span className="text-[10px] text-gray font-normal">{new Date(note.createdAt).toLocaleString()}</span></div>
                      <div className="text-gray2 italic">"{note.content}"</div>
                    </div>
                  ))}
                  {(!selectedDispute.notes || selectedDispute.notes.length === 0) && <div className="text-xs text-gray italic">No internal notes yet.</div>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedDispute(null)}
                className="bg-navy3 hover:bg-navy4 border border-white/10 px-4 py-2 rounded text-sm text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminOrderDisputes;

import React, { useState, useEffect } from 'react';
import { Store, Loader2, Check, X } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';

const SubAdminMerchantApprovals = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await subAdminService.listPendingMerchants();
      const merchantsArray = Array.isArray(response.data) 
        ? response.data 
        : (Array.isArray(response) ? response : []);
      
      setMerchants(merchantsArray);
    } catch (error) {
      console.error('Failed to fetch pending merchants:', error);
      toast.error('Failed to load pending merchants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleApprove = async (merchant) => {
    if (!merchant) return;
    
    if (!window.confirm(`Are you sure you want to approve ${merchant.storeName} with a standard 8.0% commission rate?`)) {
      return;
    }

    try {
      setProcessingId(merchant.id);
      await subAdminService.approveMerchant(merchant.id, 8.0);
      toast.success('Merchant approved successfully');
      setMerchants(prev => prev.filter(m => m.id !== merchant.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve merchant');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (merchant) => {
    if (!merchant) return;
    
    const reason = window.prompt(`Enter rejection reason for ${merchant.storeName} (min 10 chars):`);
    if (reason === null) return; // Cancelled
    
    if (reason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters long');
      return;
    }

    if (!window.confirm(`Are you sure you want to reject ${merchant.storeName}?`)) return;

    try {
      setProcessingId(merchant.id);
      await subAdminService.rejectMerchant(merchant.id, reason);
      toast.success('Merchant application rejected');
      setMerchants(prev => prev.filter(m => m.id !== merchant.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject merchant');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && merchants.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={<><span>Merchant </span><span className="text-teal">Approvals</span></>}
        subtitle="Review new merchant applications before activation"
      />

      <div className="bg-card border-border overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="bg-navy3">
                {['Store Name', 'Owner', 'Business Type', 'Applied On', 'Actions'].map((head) => (
                  <th key={head} className="text-gray px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] uppercase">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchants.length > 0 ? merchants.map((merchant) => (
                <tr key={merchant.id} className="border-border border-b last:border-none">
                  <td className="px-3 py-2.5 text-[0.875rem] font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Store size={13} className="text-teal" />
                      {merchant.storeName}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-[0.875rem] text-white">{merchant.user?.firstName} {merchant.user?.lastName}</div>
                    <div className="text-gray text-[0.75rem]">{merchant.user?.email}</div>
                  </td>
                  <td className="px-3 py-2.5 text-[0.875rem] text-gray2">
                    {merchant.businessType || 'Standard'}
                  </td>
                  <td className="px-3 py-2.5 text-[0.8rem] text-gray">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleApprove(merchant)}
                        disabled={processingId === merchant.id}
                        className="text-green-500 bg-green-500/10 hover:bg-green-500/20 disabled:opacity-50 rounded border border-green-500/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                      >
                        {processingId === merchant.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(merchant)}
                        disabled={processingId === merchant.id}
                        className="text-red bg-red/10 hover:bg-red/20 disabled:opacity-50 rounded border border-red/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                      >
                        <X size={12} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-gray py-20 text-center">No pending merchant applications</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubAdminMerchantApprovals;

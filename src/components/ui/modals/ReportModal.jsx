import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, Flag } from 'lucide-react';
import { toast } from 'react-toastify';

const VIOLATION_TYPES = [
  { id: 'inappropriate_content', label: 'Inappropriate Content', icon: AlertTriangle },
  { id: 'hate_speech', label: 'Hate Speech', icon: ShieldAlert },
  { id: 'spam', label: 'Spam or Misleading', icon: Flag },
  { id: 'harassment', label: 'Harassment', icon: AlertTriangle },
  { id: 'fake_review', label: 'Fake Review / Product', icon: ShieldAlert },
  { id: 'other', label: 'Other', icon: AlertTriangle },
];

const ReportModal = ({ isOpen, onClose, onSubmit, targetType, targetId }) => {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) return;

    setLoading(true);
    try {
      await onSubmit({
        targetType,
        targetId,
        reason: selectedType,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setSelectedType('');
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error('Report failed:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-navy2 border border-white/10 rounded-xs shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-navy2/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-teal" />
            Report {targetType}
          </h3>
          <button onClick={onClose} className="text-gray/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4 animate-in slide-in-from-bottom-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal">
              <ShieldAlert size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold">Report Submitted</h4>
              <p className="text-sm text-gray2">Thank you for helping us keep the marketplace safe. Our team will review your report.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray/50">Violation Type</p>
              <div className="grid grid-cols-1 gap-2">
                {VIOLATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-3 p-3 rounded-xs border text-left transition-all ${
                      selectedType === type.id
                        ? 'bg-teal/10 border-teal text-white'
                        : 'bg-white/5 border-white/5 text-gray2 hover:border-white/20'
                    }`}
                  >
                    <type.icon size={16} className={selectedType === type.id ? 'text-teal' : 'text-gray/30'} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-gray/50">Details (Optional)</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context..."
                rows={3}
                className="w-full bg-navy border border-white/10 rounded-xs p-3 text-sm text-white outline-none focus:border-teal transition-colors resize-none placeholder:text-gray/30"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedType || loading}
                className="flex-1 h-11 bg-teal text-navy text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;

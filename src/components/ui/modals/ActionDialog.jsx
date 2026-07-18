import React, { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

/**
 * ActionDialog — premium replacement for native alert / confirm / prompt.
 *
 * Confirm-only:
 *   <ActionDialog open title="Approve Merchant" message="..." tone="success"
 *     confirmText="Approve" onConfirm={fn} onClose={fn} />
 *
 * With inputs (replaces prompt):
 *   <ActionDialog open title="Remove Product" tone="danger" confirmText="Remove"
 *     fields={[{ name: 'reason', label: 'Reason', required: true, minLength: 10, multiline: true }]}
 *     onConfirm={(values) => ...} onClose={fn} />
 */

const TONES = {
  primary: {
    Icon: AlertTriangle,
    iconWrap: 'text-teal bg-teal/10 border-teal/30',
    button: 'bg-teal text-navy hover:brightness-110',
  },
  success: {
    Icon: CheckCircle2,
    iconWrap: 'text-green-500 bg-green-500/10 border-green-500/30',
    button: 'bg-green-500 text-navy hover:brightness-110',
  },
  warning: {
    Icon: AlertTriangle,
    iconWrap: 'text-yellow bg-yellow/10 border-yellow/40',
    button: 'bg-yellow text-navy hover:brightness-110',
  },
  danger: {
    Icon: ShieldAlert,
    iconWrap: 'text-red bg-red/10 border-red/30',
    button: 'bg-red text-white hover:brightness-110',
  },
};

const ActionDialog = memo(({
  open = false,
  onClose,
  onConfirm,
  title,
  message,
  tone = 'primary',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  fields = [],
}) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const initial = {};
    fields.forEach((f) => { initial[f.name] = f.defaultValue || ''; });
    setValues(initial);
    setErrors({});
    setBusy(false);
    const t = setTimeout(() => firstInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const { Icon, iconWrap, button } = TONES[tone] || TONES.primary;

  const validate = () => {
    const next = {};
    fields.forEach((f) => {
      const val = String(values[f.name] || '').trim();
      if (f.required && !val) next[f.name] = `${f.label || 'This field'} is required`;
      else if (f.minLength && val.length < f.minLength) next[f.name] = `Must be at least ${f.minLength} characters`;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    const trimmed = {};
    fields.forEach((f) => { trimmed[f.name] = String(values[f.name] || '').trim(); });
    try {
      setBusy(true);
      await onConfirm?.(trimmed);
      onClose();
    } catch {
      setBusy(false);
    }
  };

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget && !busy) onClose();
  };

  const inputClass = (name) =>
    `w-full bg-navy border rounded-md px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray/40 ${
      errors[name] ? 'border-red/60 focus:border-red' : 'border-white/10 focus:border-teal'
    }`;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="action-dialog-title"
    >
      <div className="bg-card border-border relative w-full max-w-md rounded-xl border shadow-2xl animate-[fadeUp_0.25s_ease_both]">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5">
          <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-full border ${iconWrap}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 id="action-dialog-title" className="font-syne text-[0.95rem] font-bold text-white">
              {title}
            </h2>
            {message && <p className="text-gray2 mt-1 text-[0.82rem] leading-relaxed">{message}</p>}
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-gray2 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        {fields.length > 0 && (
          <div className="space-y-3.5 px-5 pt-4">
            {fields.map((field, idx) => (
              <div key={field.name}>
                <label className="text-gray mb-1.5 block text-[0.65rem] font-bold uppercase tracking-wider">
                  {field.label}
                  {!field.required && <span className="text-gray/50 ml-1 normal-case font-normal">(optional)</span>}
                </label>
                {field.multiline ? (
                  <textarea
                    ref={idx === 0 ? firstInputRef : null}
                    rows={3}
                    value={values[field.name] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    disabled={busy}
                    className={`${inputClass(field.name)} resize-none`}
                  />
                ) : (
                  <input
                    ref={idx === 0 ? firstInputRef : null}
                    type="text"
                    value={values[field.name] || ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    placeholder={field.placeholder}
                    disabled={busy}
                    className={inputClass(field.name)}
                  />
                )}
                {errors[field.name] && (
                  <p className="text-red mt-1.5 flex items-center gap-1 text-xs">
                    <AlertTriangle size={11} /> {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-4 mt-4 border-t border-white/[0.07]">
          <button
            onClick={onClose}
            disabled={busy}
            className="text-gray2 hover:bg-white/5 hover:text-white rounded-md border border-white/10 px-4 py-2 text-[0.8rem] font-semibold transition-colors disabled:opacity-40"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-[0.8rem] font-bold transition-all disabled:opacity-60 ${button}`}
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

ActionDialog.displayName = 'ActionDialog';

export default ActionDialog;

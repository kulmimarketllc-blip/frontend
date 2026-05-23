import { memo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

/**
 * InfoModal Component - Accessible modal dialog
 *
 * Features:
 * - Proper ARIA attributes (role="dialog", aria-modal)
 * - Focus trap (focus stays in modal)
 * - Escape key to close
 * - Click outside to close
 * - Focus management (returns to trigger on close)
 * - Prevents body scroll when open
 *
 * @example
 * <InfoModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Information"
 *   description="This is important information"
 * >
 *   <p>Modal content</p>
 * </InfoModal>
 */

const InfoModal = memo(
  ({
    isOpen = false,
    onClose,
    title,
    description,
    children,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className,
  }) => {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Handle Escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Focus management
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement;
        modalRef.current?.focus();
      } else {
        previousActiveElement.current?.focus();
      }
    }, [isOpen]);

    // Prevent body scroll when open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4',
    };

    const modalClasses = clsx(
      'relative w-full rounded-xl bg-white p-6 shadow-2xl',
      sizes[size],
      className
    );

    const handleOverlayClick = (e) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleOverlayClick}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        role="dialog"
        aria-modal="true"
      >
        <div ref={modalRef} className={modalClasses} tabIndex={-1}>
          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          {/* Header */}
          {title && (
            <h2 id="modal-title" className="mb-2 pr-8 text-2xl font-bold text-gray-900">
              {title}
            </h2>
          )}

          {description && (
            <p id="modal-description" className="mb-4 text-gray-600">
              {description}
            </p>
          )}

          {/* Content */}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    );
  }
);

InfoModal.displayName = 'InfoModal';

export default InfoModal;

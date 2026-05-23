import { memo } from 'react';
import InfoModal from './InfoModal';
import Button from '../buttons/Button';

/**
 * ConfirmModal Component - Accessible confirmation dialog
 *
 * @example
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item?"
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   variant="danger"
 * />
 */

const ConfirmModal = memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    loading = false,
    ...rest
  }) => {
    const handleConfirm = async () => {
      await onConfirm();
      onClose();
    };

    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        description={description}
        {...rest}
      >
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} loading={loading} disabled={loading}>
            {confirmText}
          </Button>
        </div>
      </InfoModal>
    );
  }
);

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal;

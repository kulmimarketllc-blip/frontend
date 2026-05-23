import { memo } from 'react';
import InfoModal from './InfoModal';

/**
 * FormModal Component - Modal wrapper for forms
 *
 * @example
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Profile"
 * >
 *   <FormWrapper onSubmit={handleSubmit}>
 *     <InputField label="Name" />
 *     <Button type="submit">Save</Button>
 *   </FormWrapper>
 * </FormModal>
 */

const FormModal = memo(
  ({ isOpen, onClose, title, description, children, size = 'lg', ...rest }) => {
    return (
      <InfoModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        description={description}
        size={size}
        closeOnOverlayClick={false} // Don't close on overlay click for forms
        {...rest}
      >
        {children}
      </InfoModal>
    );
  }
);

FormModal.displayName = 'FormModal';

export default FormModal;

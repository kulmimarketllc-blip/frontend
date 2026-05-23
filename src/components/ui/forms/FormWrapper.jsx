import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * FormWrapper Component - Accessible form container with proper structure
 *
 * Features:
 * - Semantic form element
 * - Proper heading for form sections
 * - Error summary for accessibility
 * - Loading state
 * - Disabled state
 *
 * @example
 * <FormWrapper
 *   title="Contact Form"
 *   description="Please fill out all required fields"
 *   onSubmit={handleSubmit}
 *   errors={['Email is required', 'Message is too short']}
 * >
 *   <InputField label="Email" />
 *   <Button type="submit">Submit</Button>
 * </FormWrapper>
 */

const FormWrapper = memo(
  ({
    children,
    title,
    description,
    errors = [],
    loading = false,
    disabled = false,
    className,
    onSubmit,
    ...rest
  }) => {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!loading && !disabled && onSubmit) {
        onSubmit(e);
      }
    };

    const formClasses = clsx(
      'space-y-6',
      (loading || disabled) && 'pointer-events-none opacity-60',
      className
    );

    return (
      <form
        className={formClasses}
        onSubmit={handleSubmit}
        aria-busy={loading}
        aria-disabled={disabled}
        noValidate
        {...rest}
      >
        {(title || description) && (
          <div className="mb-6">
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>
        )}

        {/* Error Summary - Announced to screen readers */}
        {errors.length > 0 && (
          <div
            className="rounded-lg border-2 border-red-500 bg-red-50 p-4"
            role="alert"
            aria-labelledby="form-errors-title"
          >
            <h3 id="form-errors-title" className="mb-2 font-semibold text-red-800">
              Please fix the following errors:
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {children}

        {loading && (
          <div className="flex items-center justify-center py-4" role="status" aria-live="polite">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <span className="ml-3 text-gray-600">Processing...</span>
          </div>
        )}
      </form>
    );
  }
);

FormWrapper.displayName = 'FormWrapper';

export default FormWrapper;

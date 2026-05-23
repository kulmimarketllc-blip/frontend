import { memo, forwardRef, useId } from 'react';
import { clsx } from 'clsx';

/**
 * InputField Component - Accessible form input with proper labeling
 *
 * Features:
 * - Automatically generates unique IDs for label association
 * - ARIA attributes for screen readers
 * - Error state handling with aria-invalid and aria-describedby
 * - Helper text and error messages properly announced
 * - Support for required, disabled states
 * - Icons (left/right)
 *
 * @example
 * <InputField
 *   label="Email Address"
 *   type="email"
 *   required
 *   error="Please enter a valid email"
 *   helperText="We'll never share your email"
 * />
 */

const InputField = memo(
  forwardRef(
    (
      {
        label,
        type = 'text',
        error,
        helperText,
        required = false,
        disabled = false,
        fullWidth = false,
        leftIcon,
        rightIcon,
        className,
        id: providedId,
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedBy,
        ...rest
      },
      ref
    ) => {
      const autoId = useId();
      const id = providedId || autoId;
      const errorId = `${id}-error`;
      const helperId = `${id}-helper`;

      // Determine aria-describedby
      const describedBy =
        [ariaDescribedBy, error ? errorId : null, helperText ? helperId : null]
          .filter(Boolean)
          .join(' ') || undefined;

      const inputClasses = clsx(
        'w-full rounded-lg border px-4 py-2.5 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        (leftIcon || rightIcon) && 'relative',
        leftIcon && 'pl-10',
        rightIcon && 'pr-10',
        className
      );

      const labelClasses = clsx(
        'mb-1.5 block text-sm font-medium text-gray-700',
        disabled && 'text-gray-500',
        required && "after:ml-0.5 after:text-red-500 after:content-['*']"
      );

      const containerClasses = clsx('relative', fullWidth ? 'w-full' : 'w-auto');

      return (
        <div className={containerClasses}>
          {label && (
            <label htmlFor={id} className={labelClasses}>
              {label}
            </label>
          )}

          <div className="relative">
            {leftIcon && (
              <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                <span aria-hidden="true">{leftIcon}</span>
              </div>
            )}

            <input
              ref={ref}
              id={id}
              type={type}
              className={inputClasses}
              disabled={disabled}
              required={required}
              aria-label={ariaLabel || (label ? undefined : 'Input field')}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={describedBy}
              aria-required={required}
              {...rest}
            />

            {rightIcon && (
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
                <span aria-hidden="true">{rightIcon}</span>
              </div>
            )}
          </div>

          {error && (
            <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {helperText && !error && (
            <p id={helperId} className="mt-1.5 text-sm text-gray-600">
              {helperText}
            </p>
          )}
        </div>
      );
    }
  )
);

InputField.displayName = 'InputField';

export default InputField;

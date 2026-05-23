import { memo, forwardRef, useId } from 'react';
import { clsx } from 'clsx';

/**
 * Checkbox Component - Accessible checkbox with proper labeling
 *
 * Features:
 * - Keyboard accessible (Space to toggle)
 * - Proper ARIA attributes
 * - Custom styling while maintaining native functionality
 * - Error state support
 * - Indeterminate state support
 *
 * @example
 * <Checkbox
 *   label="Accept terms and conditions"
 *   required
 *   checked={accepted}
 *   onChange={(e) => setAccepted(e.target.checked)}
 * />
 */

const Checkbox = memo(
  forwardRef(
    (
      {
        label,
        checked = false,
        indeterminate = false,
        disabled = false,
        required = false,
        error,
        helperText,
        className,
        id: providedId,
        'aria-label': ariaLabel,
        onChange,
        ...rest
      },
      ref
    ) => {
      const autoId = useId();
      const id = providedId || autoId;
      const errorId = `${id}-error`;
      const helperId = `${id}-helper`;

      const describedBy =
        [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') ||
        undefined;

      const checkboxClasses = clsx(
        'h-5 w-5 rounded border-2 transition-colors focus:ring-2 focus:ring-offset-2 cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-red-500 text-red-600 focus:ring-red-500'
          : 'border-gray-300 text-blue-600 focus:ring-blue-500',
        className
      );

      const labelClasses = clsx(
        'ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none',
        disabled && 'cursor-not-allowed text-gray-500',
        required && "after:ml-0.5 after:text-red-500 after:content-['*']"
      );

      return (
        <div className="flex flex-col">
          <div className="flex items-start">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              required={required}
              className={checkboxClasses}
              aria-label={ariaLabel || (label ? undefined : 'Checkbox')}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={describedBy}
              aria-required={required}
              aria-checked={indeterminate ? 'mixed' : checked}
              onChange={onChange}
              {...rest}
            />

            {label && (
              <label htmlFor={id} className={labelClasses}>
                {label}
              </label>
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;

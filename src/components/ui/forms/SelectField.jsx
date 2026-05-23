import { memo, forwardRef, useId } from 'react';
import { clsx } from 'clsx';

/**
 * SelectField Component - Accessible dropdown select
 *
 * Features:
 * - Native select with custom styling
 * - Proper ARIA attributes
 * - Error state handling
 * - Placeholder option with disabled state
 * - Required field support
 *
 * @example
 * <SelectField
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'ca', label: 'Canada' }
 *   ]}
 *   required
 * />
 */

const SelectField = memo(
  forwardRef(
    (
      {
        label,
        options = [],
        placeholder = 'Select an option',
        error,
        helperText,
        required = false,
        disabled = false,
        fullWidth = false,
        className,
        id: providedId,
        'aria-label': ariaLabel,
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

      const selectClasses = clsx(
        'w-full rounded-lg border px-4 py-2.5 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none bg-white',
        'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
        'bg-no-repeat bg-[center_right_0.75rem] bg-[length:1.5em_1.5em]',
        "[background-image:url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")]",
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        className
      );

      const labelClasses = clsx(
        'mb-1.5 block text-sm font-medium text-gray-700',
        disabled && 'text-gray-500',
        required && "after:ml-0.5 after:text-red-500 after:content-['*']"
      );

      const containerClasses = clsx(fullWidth ? 'w-full' : 'w-auto');

      return (
        <div className={containerClasses}>
          {label && (
            <label htmlFor={id} className={labelClasses}>
              {label}
            </label>
          )}

          <select
            ref={ref}
            id={id}
            className={selectClasses}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel || (label ? undefined : 'Select field')}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            aria-required={required}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

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

SelectField.displayName = 'SelectField';

export default SelectField;

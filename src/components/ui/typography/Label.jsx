import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * Label Component - Accessible form label
 *
 * Features:
 * - Proper association with form controls (for/htmlFor)
 * - Required indicator
 * - Consistent styling
 *
 * @example
 * <Label htmlFor="email" required>
 *   Email Address
 * </Label>
 * <input id="email" type="email" />
 */

const Label = memo(
  ({
    children,
    htmlFor,
    required = false,
    disabled = false,
    size = 'sm',
    weight = 'medium',
    className,
    ...rest
  }) => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
    };

    const weights = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    };

    const labelClasses = clsx(
      'block text-gray-700',
      sizes[size],
      weights[weight],
      disabled && 'text-gray-500 cursor-not-allowed',
      required && "after:ml-0.5 after:text-red-500 after:content-['*']",
      className
    );

    return (
      <label htmlFor={htmlFor} className={labelClasses} {...rest}>
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;

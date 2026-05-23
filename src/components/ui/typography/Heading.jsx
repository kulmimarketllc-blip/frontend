import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * Heading Component - Accessible heading with proper hierarchy
 *
 * Features:
 * - Enforces proper heading hierarchy (h1-h6)
 * - Multiple visual styles independent of semantic level
 * - Accessible by default
 *
 * @example
 * <Heading as="h1" size="2xl" align="center" color="primary">
 *   Page Title
 * </Heading>
 *
 * <Heading as="h2" size="xl" align="left" color="muted">
 *   Section Title
 * </Heading>
 */

const Heading = memo(
  ({
    children,
    as: Component = 'h2',
    size = 'lg',
    weight = 'bold',
    color = 'default',
    align = 'left',
    className,
    ...rest
  }) => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
    };

    const weights = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    };

    const colors = {
      default: 'text-gray-900',
      muted: 'text-gray-500',
      primary: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
    };

    const aligns = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    const headingClasses = clsx(
      sizes[size],
      weights[weight],
      colors[color],
      aligns[align],
      'leading-tight',
      className
    );

    return (
      <Component className={headingClasses} {...rest}>
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';

export default Heading;

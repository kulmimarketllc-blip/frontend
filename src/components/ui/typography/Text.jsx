import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * Text Component - Reusable text with consistent styling
 *
 * @example
 * <Text size="base" color="muted">
 *   This is paragraph text
 * </Text>
 *
 * <Text as="span" size="sm" weight="semibold">
 *   Inline text
 * </Text>
 */

const Text = memo(
  ({
    children,
    as: Component = 'p',
    size = 'base',
    weight = 'normal',
    color = 'default',
    align = 'left',
    italic = false,
    truncate = false,
    className,
    ...rest
  }) => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    const weights = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const colors = {
      default: 'text-gray-900',
      muted: 'text-gray-600',
      light: 'text-gray-500',
      primary: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      white: 'text-white',
    };

    const aligns = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    const textClasses = clsx(
      sizes[size],
      weights[weight],
      colors[color],
      aligns[align],
      italic && 'italic',
      truncate && 'truncate',
      'leading-relaxed',
      className
    );

    return (
      <Component className={textClasses} {...rest}>
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export default Text;

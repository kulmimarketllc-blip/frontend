import React, { memo } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const IconButton = memo(
  ({
    icon,
    'aria-label': ariaLabel,
    variant = 'ghost',
    size = 'md',
    loading = false,
    disabled = false,
    className,
    onClick,
    ...props
  }) => {
    if (!ariaLabel && process.env.NODE_ENV === 'development') {
      console.warn('IconButton: aria-label is required for accessibility');
    }

    const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    };

    const sizes = {
      xs: 'p-1',
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-2.5',
      xl: 'p-3',
    };

    const iconSizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7',
    };

    const classes = clsx(
      baseStyles,
      variants[variant],
      sizes[size],
      className
    );

    return (
      <button
        type="button"
        className={classes}
        disabled={disabled || loading}
        onClick={onClick}
        aria-label={ariaLabel}
        {...props}
      >
        {loading ? (
          <Loader2 className={clsx('animate-spin', iconSizes[size])} />
        ) : (
          React.cloneElement(icon, {
            className: clsx(iconSizes[size], icon.props?.className),
            'aria-hidden': 'true',
          })
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;

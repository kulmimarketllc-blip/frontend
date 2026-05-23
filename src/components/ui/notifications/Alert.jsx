import { memo } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Alert Component - Accessible alert/notification banner
 *
 * Features:
 * - Proper ARIA role and attributes
 * - Multiple variants with icons
 * - Dismissible option
 * - Screen reader announcements
 *
 * @example
 * <Alert
 *   variant="success"
 *   title="Success!"
 *   onClose={() => setShowAlert(false)}
 * >
 *   Your changes have been saved.
 * </Alert>
 */

const Alert = memo(
  ({ children, title, variant = 'info', dismissible = false, onClose, className }) => {
    const variants = {
      success: {
        container: 'bg-green-50 border-green-200 text-green-800',
        icon: <CheckCircle className="h-5 w-5" aria-hidden="true" />,
        iconColor: 'text-green-600',
        role: 'status',
      },
      error: {
        container: 'bg-red-50 border-red-200 text-red-800',
        icon: <AlertCircle className="h-5 w-5" aria-hidden="true" />,
        iconColor: 'text-red-600',
        role: 'alert',
      },
      warning: {
        container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
        iconColor: 'text-yellow-600',
        role: 'alert',
      },
      info: {
        container: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: <Info className="h-5 w-5" aria-hidden="true" />,
        iconColor: 'text-blue-600',
        role: 'status',
      },
    };

    const config = variants[variant];

    const alertClasses = clsx(
      'flex items-start gap-3 rounded-lg border p-4',
      config.container,
      className
    );

    return (
      <div
        className={alertClasses}
        role={config.role}
        aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
        aria-atomic="true"
      >
        <div className={clsx('shrink-0', config.iconColor)}>{config.icon}</div>

        <div className="flex-1">
          {title && <h4 className="mb-1 font-semibold">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>

        {dismissible && onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 transition-colors hover:bg-black/10 focus:ring-2 focus:ring-current focus:outline-none"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;

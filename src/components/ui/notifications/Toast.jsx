import { memo, useEffect } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Toast Component - Temporary notification toast
 *
 * Features:
 * - Auto-dismiss after duration
 * - Progress bar indicator
 * - Accessible announcements
 * - Pausable on hover
 *
 * @example
 * <Toast
 *   variant="success"
 *   title="Saved!"
 *   message="Your changes have been saved"
 *   duration={3000}
 *   onClose={() => setShowToast(false)}
 * />
 */

const Toast = memo(
  ({
    title,
    message,
    variant = 'info',
    duration = 3000,
    onClose,
    showProgress = true,
    position = 'top-right',
    className,
  }) => {
    useEffect(() => {
      if (duration && onClose) {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const variants = {
      success: {
        container: 'bg-white border-green-500 text-gray-900',
        icon: <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />,
        progress: 'bg-green-600',
        role: 'status',
      },
      error: {
        container: 'bg-white border-red-500 text-gray-900',
        icon: <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />,
        progress: 'bg-red-600',
        role: 'alert',
      },
      warning: {
        container: 'bg-white border-yellow-500 text-gray-900',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600" aria-hidden="true" />,
        progress: 'bg-yellow-600',
        role: 'alert',
      },
      info: {
        container: 'bg-white border-blue-500 text-gray-900',
        icon: <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />,
        progress: 'bg-blue-600',
        role: 'status',
      },
    };

    const positions = {
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
    };

    const config = variants[variant];

    const toastClasses = clsx(
      'fixed z-50 flex w-full max-w-sm items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg',
      config.container,
      positions[position],
      'animate-in slide-in-from-top-5 fade-in',
      className
    );

    return (
      <div
        className={toastClasses}
        role={config.role}
        aria-live={variant === 'error' || variant === 'warning' ? 'assertive' : 'polite'}
        aria-atomic="true"
      >
        <div className="flex-shrink-0">{config.icon}</div>

        <div className="flex-1">
          {title && <h4 className="mb-1 font-semibold">{title}</h4>}
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-gray-400 focus:outline-none"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {showProgress && duration && (
          <div
            className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-lg bg-gray-200"
            role="progressbar"
            aria-label="Time until notification closes"
            aria-valuenow={0}
            aria-valuemin={0}
            aria-valuemax={duration}
          >
            <div
              className={clsx('h-full', config.progress)}
              style={{
                animation: `toast-progress ${duration}ms linear`,
              }}
            />
          </div>
        )}

        <style>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;

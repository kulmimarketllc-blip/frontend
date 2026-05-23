import { useState, useCallback } from 'react';

/**
 * useToast Hook - Manage toast notifications
 *
 * @example
 * const { showToast, hideToast, toast } = useToast();
 *
 * showToast({
 *   variant: 'success',
 *   title: 'Success!',
 *   message: 'Operation completed',
 * });
 */

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((config) => {
    setToast({
      id: Date.now(),
      ...config,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};

export default useToast;

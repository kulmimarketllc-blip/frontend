import React, { memo } from 'react';
import { Eye } from 'lucide-react';

/**
 * OrderDetailsButton - Compact button to open order details
 *
 * @example
 * <OrderDetailsButton onClick={() => setIsOpen(true)} />
 */

const OrderDetailsButton = memo(({ onClick, label = 'Details' }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-teal bg-teal/10 border border-teal/30 rounded hover:bg-teal/20 hover:border-teal/50 transition-colors"
      aria-label={`View ${label}`}
    >
      <Eye size={12} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
});

OrderDetailsButton.displayName = 'OrderDetailsButton';

export default OrderDetailsButton;

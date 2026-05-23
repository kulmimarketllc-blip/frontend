import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * TableRow Component - Reusable table row
 */

const TableRow = memo(({ children, hoverable = true, className, ...rest }) => {
  const rowClasses = clsx(
    'border-b border-gray-200',
    hoverable && 'transition-colors hover:bg-gray-50',
    className
  );

  return (
    <tr className={rowClasses} {...rest}>
      {children}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export default TableRow;

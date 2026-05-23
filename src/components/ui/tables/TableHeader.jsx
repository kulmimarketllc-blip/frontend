import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * TableHeader Component - Reusable table header
 */

const TableHeader = memo(({ children, className, ...rest }) => {
  const headerClasses = clsx('bg-gray-50 px-6 py-3 font-semibold text-gray-900', className);

  return (
    <th scope="col" className={headerClasses} {...rest}>
      {children}
    </th>
  );
});

TableHeader.displayName = 'TableHeader';

export default TableHeader;

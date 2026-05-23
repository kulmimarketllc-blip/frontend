import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * DataTable Component - Accessible data table with proper semantic markup
 *
 * Features:
 * - Semantic table elements
 * - Proper caption for screen readers
 * - Sortable columns (visual indicators)
 * - Responsive design
 * - Loading and empty states
 *
 * @example
 * <DataTable
 *   caption="User List"
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'email', label: 'Email' }
 *   ]}
 *   data={users}
 *   loading={false}
 * />
 */

const DataTable = memo(
  ({
    caption,
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'No data available',
    striped = false,
    hoverable = true,
    className,
    onSort,
    sortBy,
    sortDirection = 'asc',
  }) => {
    const tableClasses = clsx('w-full border-collapse text-left text-sm', className);

    const handleSort = (columnKey) => {
      if (onSort) {
        const newDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(columnKey, newDirection);
      }
    };

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className={tableClasses}>
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={clsx(
                    'px-6 py-3 font-semibold text-gray-900',
                    column.sortable && 'cursor-pointer select-none hover:bg-gray-100',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  aria-sort={
                    sortBy === column.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : column.sortable
                        ? 'none'
                        : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="text-gray-400" aria-hidden="true">
                        {sortBy === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={clsx(
                    hoverable && 'transition-colors hover:bg-gray-50',
                    striped && rowIndex % 2 === 1 && 'bg-gray-25'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={clsx(
                        'px-6 py-4 text-gray-700',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;

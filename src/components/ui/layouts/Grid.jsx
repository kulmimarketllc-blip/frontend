import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * Grid Component - Responsive grid layout
 *
 * @example
 * <Grid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 */

const Grid = memo(
  ({
    children,
    cols = { default: 1, md: 2, lg: 3 },
    gap = 'md',
    className,
    as: Component = 'div',
    ...rest
  }) => {
    const gaps = {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    // Handle responsive columns
    const getColsClass = () => {
      if (typeof cols === 'number') {
        return `grid-cols-${cols}`;
      }

      const classes = [];
      if (cols.default) classes.push(`grid-cols-${cols.default}`);
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);

      return classes.join(' ');
    };

    const gridClasses = clsx('grid', getColsClass(), gaps[gap], className);

    return (
      <Component className={gridClasses} {...rest}>
        {children}
      </Component>
    );
  }
);

Grid.displayName = 'Grid';

export default Grid;

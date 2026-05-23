import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * Container Component - Responsive container with max-width
 *
 * @example
 * <Container maxWidth="lg">
 *   <h1>Content</h1>
 * </Container>
 */

const Container = memo(
  ({ children, maxWidth = 'lg', padding = true, className, as: Component = 'div', ...rest }) => {
    const maxWidths = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[1400px]',
      full: 'max-w-full',
    };

    const containerClasses = clsx(
      'mx-auto',
      maxWidths[maxWidth],
      padding && 'px-4 sm:px-6 lg:px-8',
      className
    );

    return (
      <Component className={containerClasses} {...rest}>
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';

export default Container;

import { memo } from 'react';
import { clsx } from 'clsx';

/**
 * Card Component - Accessible card container
 *
 * @example
 * <Card variant="elevated" padding="lg">
 *   <Card.Header>
 *     <h3>Card Title</h3>
 *   </Card.Header>
 *   <Card.Body>
 *     Content goes here
 *   </Card.Body>
 * </Card>
 */

const Card = memo(
  ({
    children,
    variant = 'elevated',
    padding = 'md',
    className,
    as: Component = 'div',
    ...rest
  }) => {
    const variants = {
      elevated: 'bg-white shadow-lg rounded-xl border border-gray-100',
      outlined: 'bg-white border-2 border-gray-200 rounded-xl',
      flat: 'bg-gray-50 rounded-xl',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const cardClasses = clsx(
      variants[variant],
      paddings[padding],
      'transition-shadow duration-200',
      className
    );

    return (
      <Component className={cardClasses} {...rest}>
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
Card.Header = memo(({ children, className, ...rest }) => (
  <div className={clsx('mb-4 border-b border-gray-100 pb-4', className)} {...rest}>
    {children}
  </div>
));
Card.Header.displayName = 'Card.Header';

Card.Body = memo(({ children, className, ...rest }) => (
  <div className={clsx('', className)} {...rest}>
    {children}
  </div>
));
Card.Body.displayName = 'Card.Body';

Card.Footer = memo(({ children, className, ...rest }) => (
  <div className={clsx('mt-4 border-t border-gray-100 pt-4', className)} {...rest}>
    {children}
  </div>
));
Card.Footer.displayName = 'Card.Footer';

export default Card;

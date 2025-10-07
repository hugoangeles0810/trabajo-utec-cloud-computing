import React from 'react';

import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = true,
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'badge inline-flex items-center font-medium transition-colors',
      rounded ? 'rounded-full' : 'rounded-md'
    );

    const variants = {
      default: 'bg-neutral-100 text-neutral-800',
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      success: 'bg-accent-100 text-accent-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-1.5',
              variant === 'default' && 'bg-neutral-600',
              variant === 'primary' && 'bg-primary-600',
              variant === 'secondary' && 'bg-secondary-600',
              variant === 'success' && 'bg-accent-600',
              variant === 'warning' && 'bg-yellow-600',
              variant === 'error' && 'bg-red-600',
              variant === 'info' && 'bg-blue-600'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Specialized badge components
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  className?: string;
}> = ({ status, className }) => {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'Activo' },
    inactive: { variant: 'default' as const, text: 'Inactivo' },
    pending: { variant: 'warning' as const, text: 'Pendiente' },
    completed: { variant: 'success' as const, text: 'Completado' },
    cancelled: { variant: 'error' as const, text: 'Cancelado' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  );
};

export const DiscountBadge: React.FC<{
  discount: number;
  className?: string;
}> = ({ discount, className }) => (
  <Badge variant='error' className={cn('font-bold', className)}>
    -{discount}%
  </Badge>
);

export const StockBadge: React.FC<{
  stock: number;
  lowStockThreshold?: number;
  className?: string;
}> = ({ stock, lowStockThreshold = 10, className }) => {
  if (stock === 0) {
    return (
      <Badge variant='error' className={className}>
        Sin stock
      </Badge>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <Badge variant='warning' className={className}>
        Últimas {stock} unidades
      </Badge>
    );
  }

  return (
    <Badge variant='success' className={className}>
      En stock
    </Badge>
  );
};

export const CategoryBadge: React.FC<{
  category: string;
  className?: string;
}> = ({ category, className }) => (
  <Badge variant='info' className={className}>
    {category}
  </Badge>
);

export default Badge;

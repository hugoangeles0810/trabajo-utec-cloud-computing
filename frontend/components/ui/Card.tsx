import React from 'react';

import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      clickable = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'card rounded-lg bg-white transition-all duration-200';

    const variants = {
      default: 'shadow-soft border border-neutral-200',
      outlined: 'border-2 border-neutral-300 shadow-none',
      elevated: 'shadow-strong border-0',
      flat: 'shadow-none border border-neutral-100',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const interactiveStyles = cn(
      hover && 'hover:shadow-medium hover:-translate-y-1',
      clickable && 'cursor-pointer hover:shadow-medium active:scale-[0.98]'
    );

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddingClasses[padding],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export const CardHeader: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn('space-y-1.5 pb-4', className)}>{children}</div>
);

export const CardTitle: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <h3
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-neutral-900',
      className
    )}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <p className={cn('text-sm text-neutral-600', className)}>{children}</p>
);

export const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn('space-y-4', className)}>{children}</div>
);

export const CardFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn('flex items-center pt-4', className)}>{children}</div>
);

export default Card;

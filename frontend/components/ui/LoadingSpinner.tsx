import React from 'react';

import { cn } from '@/lib/utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'neutral';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-400',
    white: 'text-white',
    neutral: 'text-neutral-500',
  };

  const spinnerClasses = cn(
    'animate-spin',
    sizeClasses[size],
    colorClasses[color],
    className
  );

  return (
    <div className='flex flex-col items-center justify-center space-y-2'>
      <svg
        className={spinnerClasses}
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
      {text && <p className='text-sm text-neutral-600 animate-pulse'>{text}</p>}
    </div>
  );
};

// Inline spinner for buttons and small spaces
export const InlineSpinner: React.FC<{
  size?: 'sm' | 'md';
  color?: 'primary' | 'white';
  className?: string;
}> = ({ size = 'sm', color = 'primary', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const colorClasses = {
    primary: 'text-primary-500',
    white: 'text-white',
  };

  return (
    <svg
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      />
    </svg>
  );
};

// Page loading spinner
export const PageSpinner: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = 'Cargando...', className }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] space-y-4',
        className
      )}
    >
      <LoadingSpinner size='xl' text={text} />
    </div>
  );
};

export default LoadingSpinner;

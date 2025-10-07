import React from 'react';

import { cn } from '@/lib/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = cn(
      'input',
      'block w-full rounded-lg border transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      fullWidth && 'w-full'
    );

    const inputStyles = cn(
      baseStyles,
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      className
    );

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className='block text-sm font-medium text-neutral-700'
          >
            {label}
          </label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-neutral-400'>{leftIcon}</span>
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={inputStyles}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <span className='text-neutral-400'>{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className='text-sm text-red-600' role='alert'>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className='text-sm text-neutral-500'>{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

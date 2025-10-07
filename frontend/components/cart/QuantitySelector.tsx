'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  MinusIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface QuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showValidation?: boolean;
  allowDirectInput?: boolean;
  showLabels?: boolean;
  label?: string;
  helperText?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onIncrement?: (newValue: number) => void;
  onDecrement?: (newValue: number) => void;
  debounceMs?: number;
  validateOnChange?: boolean;
  customValidation?: (value: number) => string | null;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  isLoading = false,
  error = null,
  className,
  variant = 'default',
  size = 'md',
  showValidation = true,
  allowDirectInput = true,
  showLabels = false,
  label,
  helperText,
  onBlur,
  onFocus,
  onIncrement,
  onDecrement,
  debounceMs = 300,
  validateOnChange = true,
  customValidation,
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'h-8',
      button: 'w-8 h-8',
      input: 'text-sm px-2',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'h-10',
      button: 'w-10 h-10',
      input: 'text-base px-3',
      icon: 'h-4 w-4'
    },
    lg: {
      container: 'h-12',
      button: 'w-12 h-12',
      input: 'text-lg px-4',
      icon: 'h-5 w-5'
    }
  };

  // Validate quantity value
  const validateQuantity = useCallback((quantity: number): string | null => {
    if (customValidation) {
      return customValidation(quantity);
    }

    if (isNaN(quantity)) {
      return 'La cantidad debe ser un número válido';
    }

    if (!Number.isInteger(quantity)) {
      return 'La cantidad debe ser un número entero';
    }

    if (quantity < min) {
      return `La cantidad mínima es ${min}`;
    }

    if (quantity > max) {
      return `La cantidad máxima es ${max}`;
    }

    return null;
  }, [min, max, customValidation]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (validateOnChange) {
      setIsValidating(true);
      debounceTimeoutRef.current = setTimeout(() => {
        const numValue = parseInt(newValue, 10);
        if (!isNaN(numValue)) {
          const error = validateQuantity(numValue);
          setValidationError(error);
          setIsValidating(false);
          
          if (!error) {
            onChange(numValue);
          }
        } else if (newValue === '') {
          setValidationError(null);
          setIsValidating(false);
        } else {
          setValidationError('La cantidad debe ser un número válido');
          setIsValidating(false);
        }
      }, debounceMs);
    }
  }, [validateOnChange, validateQuantity, onChange, debounceMs]);

  // Handle increment
  const handleIncrement = useCallback(() => {
    if (disabled || isLoading) return;
    
    const newValue = Math.min(value + step, max);
    if (newValue !== value) {
      const error = validateQuantity(newValue);
      setValidationError(error);
      setInputValue(newValue.toString());
      onChange(newValue);
      
      if (onIncrement) {
        onIncrement(newValue);
      }
    }
  }, [value, step, max, disabled, isLoading, validateQuantity, onChange, onIncrement]);

  // Handle decrement
  const handleDecrement = useCallback(() => {
    if (disabled || isLoading) return;
    
    const newValue = Math.max(value - step, min);
    if (newValue !== value) {
      const error = validateQuantity(newValue);
      setValidationError(error);
      setInputValue(newValue.toString());
      onChange(newValue);
      
      if (onDecrement) {
        onDecrement(newValue);
      }
    }
  }, [value, step, min, disabled, isLoading, validateQuantity, onChange, onDecrement]);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    
    // If input is empty or invalid, reset to current value
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
      setValidationError(null);
    } else {
      onChange(numValue);
    }
    
    if (onBlur) {
      onBlur();
    }
  }, [inputValue, value, min, max, onChange, onBlur]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
    if (onFocus) {
      onFocus();
    }
  }, [onFocus]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
      inputRef.current?.blur();
    }
  }, [handleInputBlur, value]);

  // Update input value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const isAtMin = value <= min;
  const isAtMax = value >= max;
  const displayError = error || validationError;

  const renderDefaultVariant = () => (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      {showLabels && label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Selector */}
      <div className={cn(
        'flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white',
        sizeClasses[size].container,
        disabled && 'opacity-50 cursor-not-allowed',
        displayError && 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500',
        !displayError && 'focus-within:border-primary-500 focus-within:ring-primary-500'
      )}>
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || isLoading || isAtMin}
          className={cn(
            'flex items-center justify-center border-r border-gray-300 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            sizeClasses[size].button
          )}
          aria-label="Decrementar cantidad"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <MinusIcon className={cn('text-gray-600', sizeClasses[size].icon)} />
          )}
        </button>

        {/* Input */}
        {allowDirectInput ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyPress}
            disabled={disabled || isLoading}
            className={cn(
              'flex-1 text-center border-0 focus:ring-0 focus:outline-none bg-transparent',
              sizeClasses[size].input,
              'font-medium text-gray-900'
            )}
            aria-label="Cantidad"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        ) : (
          <div className={cn(
            'flex-1 flex items-center justify-center font-medium text-gray-900',
            sizeClasses[size].input
          )}>
            {value}
          </div>
        )}

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || isLoading || isAtMax}
          className={cn(
            'flex items-center justify-center border-l border-gray-300 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
            sizeClasses[size].button
          )}
          aria-label="Incrementar cantidad"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <PlusIcon className={cn('text-gray-600', sizeClasses[size].icon)} />
          )}
        </button>
      </div>

      {/* Validation Messages */}
      {showValidation && (
        <div className="space-y-1">
          {displayError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}
          
          {!displayError && !isValidating && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
              <span>Cantidad válida</span>
            </div>
          )}

          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <LoadingSpinner size="sm" />
              <span>Validando...</span>
            </div>
          )}

          {helperText && !displayError && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderCompactVariant = () => (
    <div className={cn(
      'flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white',
      sizeClasses[size].container,
      disabled && 'opacity-50 cursor-not-allowed',
      displayError && 'border-red-300',
      className
    )}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isLoading || isAtMin}
        className={cn(
          'flex items-center justify-center border-r border-gray-300 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          sizeClasses[size].button
        )}
        aria-label="Decrementar"
      >
        <MinusIcon className={cn('text-gray-600', sizeClasses[size].icon)} />
      </button>

      {allowDirectInput ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyPress}
          disabled={disabled || isLoading}
          className={cn(
            'flex-1 text-center border-0 focus:ring-0 focus:outline-none bg-transparent font-medium text-gray-900',
            sizeClasses[size].input
          )}
          aria-label="Cantidad"
          inputMode="numeric"
          pattern="[0-9]*"
        />
      ) : (
        <div className={cn(
          'flex-1 flex items-center justify-center font-medium text-gray-900',
          sizeClasses[size].input
        )}>
          {value}
        </div>
      )}

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isLoading || isAtMax}
        className={cn(
          'flex items-center justify-center border-l border-gray-300 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          sizeClasses[size].button
        )}
        aria-label="Incrementar"
      >
        <PlusIcon className={cn('text-gray-600', sizeClasses[size].icon)} />
      </button>
    </div>
  );

  const renderMinimalVariant = () => (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isLoading || isAtMin}
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          sizeClasses[size].button
        )}
        aria-label="Decrementar"
      >
        <MinusIcon className={cn('text-gray-600', sizeClasses[size].icon)} />
      </button>

      <span className={cn(
        'font-medium text-gray-900 min-w-[2rem] text-center',
        sizeClasses[size].input
      )}>
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isLoading || isAtMax}
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          sizeClasses[size].button
        )}
        aria-label="Incrementar"
      >
        <PlusIcon className={cn('text-gray-600', sizeClasses[size].icon)} />
      </button>
    </div>
  );

  const renderInlineVariant = () => (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isLoading || isAtMin}
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          'w-6 h-6'
        )}
        aria-label="Decrementar"
      >
        <MinusIcon className="h-3 w-3 text-gray-600" />
      </button>

      <span className="text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isLoading || isAtMax}
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          'w-6 h-6'
        )}
        aria-label="Incrementar"
      >
        <PlusIcon className="h-3 w-3 text-gray-600" />
      </button>
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'minimal':
      return renderMinimalVariant();
    case 'inline':
      return renderInlineVariant();
    default:
      return renderDefaultVariant();
  }
}

// Convenience components for common use cases
export function QuantitySelectorDefault(props: Omit<QuantitySelectorProps, 'variant'>) {
  return <QuantitySelector {...props} variant="default" />;
}

export function QuantitySelectorCompact(props: Omit<QuantitySelectorProps, 'variant'>) {
  return <QuantitySelector {...props} variant="compact" />;
}

export function QuantitySelectorMinimal(props: Omit<QuantitySelectorProps, 'variant'>) {
  return <QuantitySelector {...props} variant="minimal" />;
}

export function QuantitySelectorInline(props: Omit<QuantitySelectorProps, 'variant'>) {
  return <QuantitySelector {...props} variant="inline" />;
}

// Utility functions
export const validateQuantityValue = (
  value: number,
  min: number = 1,
  max: number = 99
): { isValid: boolean; error?: string } => {
  if (isNaN(value)) {
    return { isValid: false, error: 'La cantidad debe ser un número válido' };
  }

  if (!Number.isInteger(value)) {
    return { isValid: false, error: 'La cantidad debe ser un número entero' };
  }

  if (value < min) {
    return { isValid: false, error: `La cantidad mínima es ${min}` };
  }

  if (value > max) {
    return { isValid: false, error: `La cantidad máxima es ${max}` };
  }

  return { isValid: true };
};

export const clampQuantity = (value: number, min: number = 1, max: number = 99): number => {
  return Math.max(min, Math.min(max, value));
};

export const formatQuantityDisplay = (value: number, max: number = 99): string => {
  if (value > max) {
    return `${max}+`;
  }
  return value.toString();
};

// CartIcon component for Gamarriando Frontend

'use client';

import { useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { ShoppingCartIcon as ShoppingCartSolidIcon } from '@heroicons/react/24/solid';
import { useCartStore, cartSelectors } from '@/lib/store/cart-store';
import { CartDrawer } from './CartDrawer';

interface CartIconProps {
  /**
   * Whether to show the cart item count badge
   * @default true
   */
  showBadge?: boolean;
  
  /**
   * Whether to use solid icon when cart has items
   * @default false
   */
  useSolidWhenFull?: boolean;
  
  /**
   * Size of the icon
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether the icon should be clickable
   * @default true
   */
  clickable?: boolean;
  
  /**
   * Custom click handler (overrides default cart toggle)
   */
  onClick?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to show loading state
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Whether to show error state
   * @default false
   */
  hasError?: boolean;
  
  /**
   * Accessibility label
   * @default 'Carrito de compras'
   */
  ariaLabel?: string;
}

export function CartIcon({
  showBadge = true,
  useSolidWhenFull = false,
  size = 'md',
  clickable = true,
  onClick,
  className = '',
  isLoading = false,
  hasError = false,
  ariaLabel = 'Carrito de compras',
}: CartIconProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Get cart state from store
  const totalItems = useCartStore(cartSelectors.getTotalItems);
  const isOpen = useCartStore(cartSelectors.getIsOpen);
  const loading = useCartStore(cartSelectors.getIsLoading);
  const error = useCartStore(cartSelectors.getError);

  // Determine icon to use
  const hasItems = totalItems > 0;
  const shouldUseSolid = useSolidWhenFull && hasItems;
  const IconComponent = shouldUseSolid ? ShoppingCartSolidIcon : ShoppingCartIcon;

  // Size classes
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  // Badge size classes
  const badgeSizeClasses = {
    sm: 'min-w-[16px] h-4 text-xs px-1',
    md: 'min-w-[18px] h-4.5 text-xs px-1.5',
    lg: 'min-w-[20px] h-5 text-sm px-2',
    xl: 'min-w-[24px] h-6 text-sm px-2',
  };

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (clickable) {
      setIsDrawerOpen(true);
    }
  };

  // Determine visual state
  const isActualLoading = isLoading || loading;
  const isActualError = hasError || !!error;
  const isActive = isOpen || hasItems;

  // Base classes
  const baseClasses = `
    relative inline-flex items-center justify-center
    transition-all duration-200 ease-in-out
    ${clickable ? 'cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg' : ''}
    ${isActualLoading ? 'opacity-50 cursor-wait' : ''}
    ${isActualError ? 'text-error-500' : ''}
    ${isActive ? 'text-primary-500' : 'text-neutral-600 hover:text-primary-500'}
    ${className}
  `.trim();

  return (
    <>
      <button
      type="button"
      onClick={handleClick}
      disabled={!clickable || isActualLoading}
      aria-label={`${ariaLabel}${hasItems ? ` (${totalItems} items)` : ''}`}
      className={baseClasses}
    >
      {/* Icon */}
      <IconComponent
        className={`${sizeClasses[size]} transition-colors duration-200 ${
          isActualLoading ? 'animate-pulse' : ''
        }`}
      />

      {/* Badge */}
      {showBadge && hasItems && (
        <span
          className={`
            absolute -top-2 -right-2
            ${badgeSizeClasses[size]}
            bg-primary-500 text-white
            rounded-full
            flex items-center justify-center
            font-semibold
            shadow-sm
            transition-all duration-200
            ${isActive ? 'scale-110' : 'scale-100'}
            ${isActualError ? 'bg-error-500' : ''}
          `.trim()}
          aria-label={`${totalItems} items en el carrito`}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      {/* Loading indicator */}
      {isActualLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error indicator */}
      {isActualError && !showBadge && (
        <div
          className="absolute -top-1 -right-1 w-2 h-2 bg-error-500 rounded-full"
          aria-label="Error en el carrito"
        />
      )}
    </button>
    
    {/* Cart Drawer */}
    <CartDrawer
      isOpen={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      onCheckout={() => {
        // Navigate to checkout page
        console.log('Navigate to checkout');
      }}
    />
    </>
  );
}

// Variant components for common use cases
export function CartIconCompact(props: Omit<CartIconProps, 'size' | 'showBadge'>) {
  return <CartIcon {...props} size="sm" showBadge={true} />;
}

export function CartIconLarge(props: Omit<CartIconProps, 'size'>) {
  return <CartIcon {...props} size="lg" />;
}

export function CartIconHeader(props: Omit<CartIconProps, 'size' | 'showBadge' | 'useSolidWhenFull'>) {
  return <CartIcon {...props} size="md" showBadge={true} useSolidWhenFull={true} />;
}

export function CartIconMobile(props: Omit<CartIconProps, 'size'>) {
  return <CartIcon {...props} size="lg" showBadge={true} />;
}

// Default export
export default CartIcon;

// CartButton component for Gamarriando Frontend

'use client';

import { CartIcon } from './CartIcon';
import { useCartStore, cartSelectors } from '@/lib/store/cart-store';

interface CartButtonProps {
  /**
   * Whether to show the cart item count
   * @default true
   */
  showCount?: boolean;
  
  /**
   * Whether to show the total price
   * @default false
   */
  showTotal?: boolean;
  
  /**
   * Button variant
   * @default 'outline'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the button should be full width
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Whether to show loading state
   * @default false
   */
  isLoading?: boolean;
  
  /**
   * Custom click handler
   */
  onClick?: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to show icon only on mobile
   * @default true
   */
  iconOnlyOnMobile?: boolean;
  
  /**
   * Custom text when cart is empty
   * @default 'Carrito'
   */
  emptyText?: string;
  
  /**
   * Custom text when cart has items
   * @default 'Ver Carrito'
   */
  fullText?: string;
}

export function CartButton({
  showCount = true,
  showTotal = false,
  variant = 'outline',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  onClick,
  className = '',
  iconOnlyOnMobile = true,
  emptyText = 'Carrito',
  fullText = 'Ver Carrito',
}: CartButtonProps) {
  // Get cart state from store
  const totalItems = useCartStore(cartSelectors.getTotalItems);
  const total = useCartStore(cartSelectors.getTotal);
  const currency = useCartStore(cartSelectors.getCurrency);
  const hasItems = totalItems > 0;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Icon sizes
  const iconSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  };

  // Variant classes
  const variantClasses = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    outline: 'btn btn-outline',
    ghost: 'btn btn-ghost',
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Get button text
  const getButtonText = () => {
    if (hasItems) {
      return fullText;
    }
    return emptyText;
  };

  // Get count text
  const getCountText = () => {
    if (!showCount || !hasItems) return '';
    
    if (totalItems === 1) {
      return '1 item';
    }
    return `${totalItems} items`;
  };

  // Get total text
  const getTotalText = () => {
    if (!showTotal || !hasItems) return '';
    return formatPrice(total);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
        flex items-center justify-center gap-2
        transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `.trim()}
      aria-label={`${getButtonText()}${hasItems ? ` - ${getCountText()}` : ''}`}
    >
      {/* Cart Icon */}
      <CartIcon
        size={iconSizes[size]}
        showBadge={false}
        clickable={false}
        isLoading={isLoading}
      />

      {/* Text Content */}
      <div className="flex flex-col items-start">
        {/* Main text */}
        <span className="font-medium leading-none">
          {getButtonText()}
        </span>
        
        {/* Count and total */}
        {(showCount || showTotal) && hasItems && (
          <span className="text-xs opacity-75 leading-none">
            {getCountText()}
            {showCount && showTotal && ' • '}
            {getTotalText()}
          </span>
        )}
      </div>

      {/* Mobile: Hide text when iconOnlyOnMobile is true */}
      {iconOnlyOnMobile && (
        <style jsx>{`
          @media (max-width: 640px) {
            .cart-button-text {
              display: none;
            }
          }
        `}</style>
      )}
    </button>
  );
}

// Variant components for common use cases
export function CartButtonPrimary(props: Omit<CartButtonProps, 'variant'>) {
  return <CartButton {...props} variant="primary" />;
}

export function CartButtonSecondary(props: Omit<CartButtonProps, 'variant'>) {
  return <CartButton {...props} variant="secondary" />;
}

export function CartButtonGhost(props: Omit<CartButtonProps, 'variant'>) {
  return <CartButton {...props} variant="ghost" />;
}

export function CartButtonCompact(props: Omit<CartButtonProps, 'size'>) {
  return <CartButton {...props} size="sm" />;
}

export function CartButtonLarge(props: Omit<CartButtonProps, 'size'>) {
  return <CartButton {...props} size="lg" />;
}

export function CartButtonFullWidth(props: Omit<CartButtonProps, 'fullWidth'>) {
  return <CartButton {...props} fullWidth={true} />;
}

export function CartButtonWithTotal(props: Omit<CartButtonProps, 'showTotal'>) {
  return <CartButton {...props} showTotal={true} />;
}

// Default export
export default CartButton;

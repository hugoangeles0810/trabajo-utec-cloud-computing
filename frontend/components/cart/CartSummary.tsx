'use client';

import { useState, useCallback } from 'react';
import { 
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  description?: string;
  validUntil?: string;
  isActive: boolean;
}

export interface ShippingInfo {
  method: string;
  cost: number;
  estimatedDays: number;
  freeShippingThreshold: number;
  isFree: boolean;
}

export interface TaxInfo {
  rate: number;
  amount: number;
  description: string;
}

export interface CartSummaryData {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  itemCount: number;
  totalItems: number;
}

interface CartSummaryProps {
  summary: CartSummaryData;
  coupon?: Coupon;
  shippingInfo?: ShippingInfo;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
  onCheckout?: () => void;
  onContinueShopping?: () => void;
  variant?: 'default' | 'compact' | 'sticky';
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  showCouponInput?: boolean;
  showShippingInfo?: boolean;
  showTaxBreakdown?: boolean;
  showCheckoutButton?: boolean;
  showContinueShoppingButton?: boolean;
  freeShippingThreshold?: number;
  currency?: string;
}

export function CartSummary({
  summary,
  coupon,
  shippingInfo,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  onContinueShopping,
  variant = 'default',
  className,
  disabled = false,
  isLoading = false,
  showCouponInput = true,
  showShippingInfo = true,
  showTaxBreakdown = true,
  showCheckoutButton = true,
  showContinueShoppingButton = true,
  freeShippingThreshold = 50,
  currency = 'PEN',
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }, [currency]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim() || !onApplyCoupon || isApplyingCoupon) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      await onApplyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Error al aplicar cupón');
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode, onApplyCoupon, isApplyingCoupon]);

  const handleCheckout = useCallback(async () => {
    if (!onCheckout || isCheckingOut || disabled) return;

    setIsCheckingOut(true);
    try {
      await onCheckout();
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  }, [onCheckout, isCheckingOut, disabled]);

  const getShippingStatus = useCallback(() => {
    if (!shippingInfo) return null;

    const remaining = freeShippingThreshold - summary.subtotal;
    
    if (shippingInfo.isFree) {
      return {
        status: 'free',
        message: '¡Envío gratis aplicado!',
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
        color: 'text-green-600'
      };
    } else if (remaining > 0) {
      return {
        status: 'threshold',
        message: `Agrega ${formatPrice(remaining)} más para envío gratis`,
        icon: <TruckIcon className="h-5 w-5 text-blue-500" />,
        color: 'text-blue-600'
      };
    } else {
      return {
        status: 'paid',
        message: `Envío: ${formatPrice(shippingInfo.cost)}`,
        icon: <TruckIcon className="h-5 w-5 text-gray-500" />,
        color: 'text-gray-600'
      };
    }
  }, [shippingInfo, summary.subtotal, freeShippingThreshold, formatPrice]);

  const shippingStatus = getShippingStatus();

  const renderDefaultVariant = () => (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumen del Pedido</h3>
        <p className="text-sm text-gray-600 mt-1">
          {summary.itemCount} {summary.itemCount === 1 ? 'artículo' : 'artículos'} ({summary.totalItems} unidades)
        </p>
      </div>

      {/* Coupon Input */}
      {showCouponInput && (
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Código de cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={disabled || isApplyingCoupon || isLoading}
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || disabled || isApplyingCoupon || isLoading}
              variant="outline"
              size="sm"
              className="px-4"
            >
              {isApplyingCoupon ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Aplicar'
              )}
            </Button>
          </div>
          
          {couponError && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {couponError}
            </div>
          )}

          {coupon && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Cupón "{coupon.code}" aplicado
                    </p>
                    <p className="text-xs text-green-700">
                      Descuento: {coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                    </p>
                  </div>
                </div>
                {onRemoveCoupon && (
                  <button
                    onClick={onRemoveCoupon}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                    disabled={disabled || isLoading}
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Breakdown */}
      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>

        {/* Discount */}
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Descuento</span>
            <span className="font-medium text-green-600">-{formatPrice(summary.discount)}</span>
          </div>
        )}

        {/* Shipping */}
        {showShippingInfo && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className={cn(
              'font-medium',
              shippingStatus?.color || 'text-gray-900'
            )}>
              {shippingStatus?.message || formatPrice(summary.shipping)}
            </span>
          </div>
        )}

        {/* Tax */}
        {showTaxBreakdown && summary.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Impuestos</span>
            <span className="font-medium">{formatPrice(summary.tax)}</span>
          </div>
        )}
      </div>

      {/* Shipping Status */}
      {shippingStatus && shippingStatus.status === 'threshold' && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            {shippingStatus.icon}
            <p className="text-sm text-blue-700">{shippingStatus.message}</p>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(summary.total)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {showCheckoutButton && (
          <Button
            onClick={handleCheckout}
            disabled={disabled || isLoading || isCheckingOut || summary.total === 0}
            variant="primary"
            className="w-full"
          >
            {isCheckingOut ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Procesando...
              </div>
            ) : (
              'Proceder al Checkout'
            )}
          </Button>
        )}

        {showContinueShoppingButton && onContinueShopping && (
          <Button
            onClick={onContinueShopping}
            disabled={disabled || isLoading}
            variant="outline"
            className="w-full"
          >
            Continuar Comprando
          </Button>
        )}
      </div>

      {/* Security Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <InformationCircleIcon className="h-4 w-4" />
          <span>Compra 100% segura y protegida</span>
        </div>
      </div>
    </div>
  );

  const renderCompactVariant = () => (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      {/* Summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({summary.itemCount} artículos)</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>
        
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Descuento</span>
            <span className="font-medium text-green-600">-{formatPrice(summary.discount)}</span>
          </div>
        )}
        
        {summary.shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="font-medium">{formatPrice(summary.shipping)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(summary.total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <Button
          onClick={handleCheckout}
          disabled={disabled || isLoading || isCheckingOut || summary.total === 0}
          variant="primary"
          className="w-full"
          size="sm"
        >
          {isCheckingOut ? (
            <LoadingSpinner size="sm" />
          ) : (
            'Checkout'
          )}
        </Button>
      )}
    </div>
  );

  const renderStickyVariant = () => (
    <div className={cn('bg-white border-t border-gray-200 p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">Total ({summary.itemCount} artículos)</p>
              <p className="text-xl font-bold text-primary-600">
                {formatPrice(summary.total)}
              </p>
            </div>
            
            {shippingStatus && shippingStatus.status === 'threshold' && (
              <div className="hidden sm:block">
                <p className="text-xs text-blue-600">
                  {formatPrice(freeShippingThreshold - summary.subtotal)} más para envío gratis
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {showContinueShoppingButton && onContinueShopping && (
            <Button
              onClick={onContinueShopping}
              disabled={disabled || isLoading}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Continuar
            </Button>
          )}
          
          {showCheckoutButton && (
            <Button
              onClick={handleCheckout}
              disabled={disabled || isLoading || isCheckingOut || summary.total === 0}
              variant="primary"
              size="sm"
            >
              {isCheckingOut ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Checkout'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'sticky':
      return renderStickyVariant();
    default:
      return renderDefaultVariant();
  }
}

// Convenience components for common use cases
export function CartSummaryDefault(props: Omit<CartSummaryProps, 'variant'>) {
  return <CartSummary {...props} variant="default" />;
}

export function CartSummaryCompact(props: Omit<CartSummaryProps, 'variant'>) {
  return <CartSummary {...props} variant="compact" />;
}

export function CartSummarySticky(props: Omit<CartSummaryProps, 'variant'>) {
  return <CartSummary {...props} variant="sticky" />;
}

// Utility functions
export const calculateCartSummary = (
  items: Array<{ quantity: number; price: number }>,
  discount: number = 0,
  shipping: number = 0,
  taxRate: number = 0.18
): CartSummaryData => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + shipping + tax;
  
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    currency: 'PEN',
    itemCount: items.length,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

export const validateCoupon = (coupon: Coupon, subtotal: number): { isValid: boolean; message?: string } => {
  if (!coupon.isActive) {
    return { isValid: false, message: 'El cupón no está activo' };
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    return { isValid: false, message: 'El cupón ha expirado' };
  }

  if (coupon.minAmount && subtotal < coupon.minAmount) {
    return { isValid: false, message: `El pedido mínimo es ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(coupon.minAmount)}` };
  }

  return { isValid: true };
};

export const calculateDiscount = (coupon: Coupon, subtotal: number): number => {
  if (coupon.type === 'percentage') {
    const discount = (subtotal * coupon.value) / 100;
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  } else {
    return Math.min(coupon.value, subtotal);
  }
};

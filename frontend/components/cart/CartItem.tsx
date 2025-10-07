'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { 
  TrashIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  stock: number;
  category: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    name: string;
  };
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  shippingInfo?: {
    freeShipping: boolean;
    estimatedDays: number;
  };
  warranty?: string;
  sku?: string;
}

export interface CartItemData {
  id: string;
  product_id: string;
  product: CartItemProduct;
  quantity: number;
  price: number;
  total: number;
  added_at: string;
  updated_at: string;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  showRemoveButton?: boolean;
  showFavoriteButton?: boolean;
  showQuantitySelector?: boolean;
  showProductDetails?: boolean;
  showShippingInfo?: boolean;
  showWarrantyInfo?: boolean;
  maxQuantity?: number;
  minQuantity?: number;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onToggleFavorite,
  isFavorite = false,
  variant = 'default',
  className,
  disabled = false,
  isLoading = false,
  showRemoveButton = true,
  showFavoriteButton = true,
  showQuantitySelector = true,
  showProductDetails = true,
  showShippingInfo = true,
  showWarrantyInfo = true,
  maxQuantity = 99,
  minQuantity = 1,
}: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleQuantityChange = useCallback(async (newQuantity: number) => {
    if (newQuantity < minQuantity || newQuantity > maxQuantity || disabled || isLoading) {
      return;
    }

    setIsUpdatingQuantity(true);
    try {
      setQuantity(newQuantity);
      await onQuantityChange(item.id, newQuantity);
    } catch (error) {
      // Revert quantity on error
      setQuantity(item.quantity);
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdatingQuantity(false);
    }
  }, [item.id, item.quantity, minQuantity, maxQuantity, disabled, isLoading, onQuantityChange]);

  const handleRemove = useCallback(async () => {
    if (disabled || isLoading) return;

    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
      setIsRemoving(false);
    }
  }, [item.id, disabled, isLoading, onRemove]);

  const handleToggleFavorite = useCallback(async () => {
    if (!onToggleFavorite || disabled || isLoading) return;

    setIsTogglingFavorite(true);
    try {
      await onToggleFavorite(item.product_id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [item.product_id, onToggleFavorite, disabled, isLoading]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (!item.product.originalPrice || item.product.originalPrice <= item.price) {
      return 0;
    }
    return Math.round(((item.product.originalPrice - item.price) / item.product.originalPrice) * 100);
  };

  const isLowStock = item.product.stock <= 5 && item.product.stock > 0;
  const isOutOfStock = item.product.stock === 0;

  const renderQuantitySelector = () => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuantityChange(quantity - 1)}
        disabled={quantity <= minQuantity || disabled || isLoading || isUpdatingQuantity}
        className="w-8 h-8 p-0 flex items-center justify-center"
        aria-label="Disminuir cantidad"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-[60px]">
        {isUpdatingQuantity ? (
          <LoadingSpinner size="sm" />
        ) : (
          <span className="text-sm font-medium text-center min-w-[30px]">
            {quantity}
          </span>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuantityChange(quantity + 1)}
        disabled={quantity >= maxQuantity || quantity >= item.product.stock || disabled || isLoading || isUpdatingQuantity}
        className="w-8 h-8 p-0 flex items-center justify-center"
        aria-label="Aumentar cantidad"
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderDefaultVariant = () => (
    <div className={cn(
      'flex gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow',
      isOutOfStock && 'opacity-60',
      className
    )}>
      {/* Product Image */}
      <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
        <Image
          src={item.product.images[0] || '/placeholder-product.jpg'}
          alt={item.product.name}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 640px) 80px, 96px"
        />
        {item.product.isNew && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Nuevo
          </div>
        )}
        {item.product.isBestSeller && (
          <div className="absolute -top-2 -left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Más Vendido
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Product Name */}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {item.product.name}
            </h3>

            {/* Product Details */}
            {showProductDetails && (
              <div className="text-xs text-gray-500 space-y-1 mb-2">
                <div>Categoría: {item.product.category.name}</div>
                <div>Vendedor: {item.product.vendor.name}</div>
                {item.product.sku && <div>SKU: {item.product.sku}</div>}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(item.price)}
              </span>
              {item.product.originalPrice && item.product.originalPrice > item.price && (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.product.originalPrice)}
                  </span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    -{getDiscountPercentage()}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {isLowStock && (
              <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                <ExclamationTriangleIcon className="h-3 w-3" />
                Solo {item.product.stock} unidades disponibles
              </div>
            )}
            {isOutOfStock && (
              <div className="flex items-center gap-1 text-xs text-red-600 mb-2">
                <ExclamationTriangleIcon className="h-3 w-3" />
                Producto agotado
              </div>
            )}

            {/* Shipping Info */}
            {showShippingInfo && item.product.shippingInfo && (
              <div className="text-xs text-gray-500 mb-2">
                {item.product.shippingInfo.freeShipping ? (
                  <span className="text-green-600">Envío gratis</span>
                ) : (
                  <span>Envío en {item.product.shippingInfo.estimatedDays} días</span>
                )}
              </div>
            )}

            {/* Warranty Info */}
            {showWarrantyInfo && item.product.warranty && (
              <div className="text-xs text-gray-500">
                Garantía: {item.product.warranty}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2">
            {/* Favorite Button */}
            {showFavoriteButton && onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFavorite}
                disabled={disabled || isLoading || isTogglingFavorite}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                {isTogglingFavorite ? (
                  <LoadingSpinner size="sm" />
                ) : isFavorite ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Remove Button */}
            {showRemoveButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isLoading || isRemoving}
                className="p-1 text-gray-400 hover:text-red-500"
                aria-label="Eliminar del carrito"
              >
                {isRemoving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <TrashIcon className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Quantity Selector and Total */}
        <div className="flex items-center justify-between mt-3">
          {showQuantitySelector && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Cantidad:</span>
              {renderQuantitySelector()}
            </div>
          )}

          <div className="text-right">
            <div className="text-sm text-gray-600">Total:</div>
            <div className="text-lg font-bold text-primary-600">
              {formatPrice(item.total)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompactVariant = () => (
    <div className={cn(
      'flex items-center gap-3 p-3 border-b border-gray-200',
      isOutOfStock && 'opacity-60',
      className
    )}>
      {/* Product Image */}
      <div className="relative flex-shrink-0 w-16 h-16">
        <Image
          src={item.product.images[0] || '/placeholder-product.jpg'}
          alt={item.product.name}
          fill
          className="object-cover rounded-lg"
          sizes="64px"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
          {item.product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary-600">
            {formatPrice(item.price)}
          </span>
          {item.product.originalPrice && item.product.originalPrice > item.price && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(item.product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity and Actions */}
      <div className="flex items-center gap-3">
        {showQuantitySelector && renderQuantitySelector()}
        
        <div className="text-right">
          <div className="text-sm font-bold text-primary-600">
            {formatPrice(item.total)}
          </div>
        </div>

        {showRemoveButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isLoading || isRemoving}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            {isRemoving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  const renderMinimalVariant = () => (
    <div className={cn(
      'flex items-center gap-2 py-2',
      isOutOfStock && 'opacity-60',
      className
    )}>
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={item.product.images[0] || '/placeholder-product.jpg'}
          alt={item.product.name}
          fill
          className="object-cover rounded"
          sizes="48px"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </div>
        <div className="text-xs text-gray-500">
          {quantity}x {formatPrice(item.price)}
        </div>
      </div>
      
      <div className="text-sm font-bold text-primary-600">
        {formatPrice(item.total)}
      </div>
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'minimal':
      return renderMinimalVariant();
    default:
      return renderDefaultVariant();
  }
}

// Convenience components for common use cases
export function CartItemDefault(props: Omit<CartItemProps, 'variant'>) {
  return <CartItem {...props} variant="default" />;
}

export function CartItemCompact(props: Omit<CartItemProps, 'variant'>) {
  return <CartItem {...props} variant="compact" />;
}

export function CartItemMinimal(props: Omit<CartItemProps, 'variant'>) {
  return <CartItem {...props} variant="minimal" />;
}

// Utility functions
export const calculateItemTotal = (price: number, quantity: number): number => {
  return price * quantity;
};

export const validateQuantity = (
  quantity: number,
  minQuantity: number = 1,
  maxQuantity: number = 99,
  stock: number = 99
): number => {
  return Math.max(minQuantity, Math.min(quantity, Math.min(maxQuantity, stock)));
};

export const getStockStatus = (stock: number) => {
  if (stock === 0) return { status: 'out-of-stock', message: 'Agotado', color: 'red' };
  if (stock <= 5) return { status: 'low-stock', message: `Solo ${stock} unidades`, color: 'orange' };
  return { status: 'in-stock', message: 'Disponible', color: 'green' };
};

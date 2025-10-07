'use client';

import { useEffect } from 'react';
import { 
  XMarkIcon, 
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import { useCartStore, cartSelectors } from '@/lib/store/cart-store';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
  className?: string;
}

export function CartDrawer({ 
  isOpen, 
  onClose, 
  onCheckout,
  className 
}: CartDrawerProps) {
  const {
    items,
    summary,
  } = useCartStore();

  const {
    getTotalItems,
    isEmpty,
  } = cartSelectors;

  const totalItems = getTotalItems(useCartStore.getState());
  const isCartEmpty = isEmpty(useCartStore.getState());
  
  // Calculate totals from items directly
  const cartSubtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartTotal = summary?.total || cartSubtotal;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    // Simplified for static export - in a real app, you would implement cart updates here
    console.log('Quantity change:', itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    // Simplified for static export - in a real app, you would implement item removal here
    console.log('Remove item:', itemId);
  };

  const handleClearCart = () => {
    // Simplified for static export - in a real app, you would implement cart clearing here
    console.log('Clear cart');
  };

  const handleCheckout = () => {
    onCheckout?.();
    onClose();
  };

  const renderCartItem = (item: any) => (
    <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          {item.product?.images?.[0] ? (
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCartIcon className="h-8 w-8" />
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {item.product?.name || 'Producto'}
        </h3>
        <p className="text-sm text-gray-500">
          {item.product?.vendor?.name || 'Vendedor'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(item.price)}
          </span>
          {item.product?.originalPrice && item.product?.originalPrice > item.price && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(item.product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Reducir cantidad"
        >
          <MinusIcon className="h-4 w-4 text-gray-600" />
        </button>
        
        <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
          {item.quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Aumentar cantidad"
        >
          <PlusIcon className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => handleRemoveItem(item.id)}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Eliminar producto"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ShoppingCartIcon className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Tu carrito está vacío
      </h3>
      <p className="text-gray-500 mb-6">
        Agrega algunos productos para comenzar tu compra
      </p>
      <Button
        onClick={onClose}
        variant="outline"
        className="border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white"
      >
        Continuar Comprando
      </Button>
    </div>
  );

  const renderCartSummary = () => (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
        <span className="font-medium">{formatPrice(cartSubtotal)}</span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Descuento</span>
        <span className="font-medium text-green-600">
          -{formatPrice(summary?.discount || 0)}
        </span>
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Envío</span>
        <span className="font-medium">
          Gratis
        </span>
      </div>
      
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(cartTotal)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderShippingInfo = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <TruckIcon className="h-4 w-4" />
        <span>Envío gratis en pedidos superiores a S/150</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <ShieldCheckIcon className="h-4 w-4" />
        <span>Compra 100% segura y protegida</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Carrito ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar carrito"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {isCartEmpty ? (
            renderEmptyState()
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map(renderCartItem)}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 space-y-4">
                {/* Shipping Info */}
                {renderShippingInfo()}

                {/* Cart Summary */}
                {renderCartSummary()}

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3"
                  >
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Proceder al Pago
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Continuar Comprando
                    </Button>
                    <Button
                      onClick={handleClearCart}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

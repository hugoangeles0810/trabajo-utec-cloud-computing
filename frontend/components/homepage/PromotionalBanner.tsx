'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, GiftIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PromotionalBannerProps {
  className?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function PromotionalBanner({ 
  className, 
  onClose,
  autoClose = false,
  autoCloseDelay = 10000 
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Math.floor(autoCloseDelay / 1000));

  useEffect(() => {
    if (autoClose) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText('BIENVENIDO10');
      // TODO: Show toast notification
      console.log('Cupón copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar cupón:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white transition-all duration-300 ease-in-out',
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px] animate-pulse" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-bounce" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-white rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Main Content */}
          <div className="flex items-center space-x-4 flex-1">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                <GiftIcon className="h-6 w-6 text-gray-900" />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-2 lg:space-y-0">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-yellow-400 animate-spin" />
                  <h3 className="text-lg font-bold">
                    ¡Bienvenido a Gamarriando!
                  </h3>
                </div>
                
                <div className="flex flex-col xs:flex-row xs:items-center space-y-1 xs:space-y-0 xs:space-x-2 text-sm">
                  <span className="whitespace-nowrap">Usa el cupón</span>
                  <button
                    onClick={handleCopyCoupon}
                    className="inline-flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-3 py-1 rounded-full font-bold transition-colors cursor-pointer group w-fit"
                  >
                    <TagIcon className="h-4 w-4" />
                    <span>BIENVENIDO10</span>
                  </button>
                  <span className="text-xs xs:text-sm">y obtén 10% de descuento</span>
                </div>
              </div>
              
              <p className="text-primary-100 text-xs lg:text-sm mt-1">
                Válido hasta el 31 de diciembre de 2024 • No acumulable con otras ofertas
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Timer */}
            {autoClose && timeLeft > 0 && (
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                <span className="text-primary-200">Se cierra en:</span>
                <div className="bg-white/20 px-2 py-1 rounded-full">
                  <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={() => {
                // TODO: Navigate to products page with coupon applied
                console.log('Navigate to products with BIENVENIDO10 coupon');
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-3 lg:px-4 py-2 text-sm lg:text-base whitespace-nowrap"
            >
              ¡Aprovechar Oferta!
            </Button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Cerrar banner"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Top Row - Icon and Title */}
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                <GiftIcon className="h-4 w-4 text-gray-900" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4 text-yellow-400 animate-spin" />
              <h3 className="text-base font-bold">
                ¡Bienvenido a Gamarriando!
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Cerrar banner"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Middle Row - Coupon */}
          <div className="text-center mb-3">
            <p className="text-sm text-primary-100 mb-2">
              Usa el cupón y obtén 10% de descuento
            </p>
            <button
              onClick={handleCopyCoupon}
              className="inline-flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-full font-bold transition-colors text-sm"
            >
              <TagIcon className="h-3 w-3" />
              <span>BIENVENIDO10</span>
            </button>
          </div>

          {/* Bottom Row - Timer and CTA */}
          <div className="flex flex-col items-center space-y-2 pt-2 border-t border-white/20">
            {autoClose && timeLeft > 0 && (
              <div className="text-xs text-center">
                <span className="text-primary-200">Se cierra en: </span>
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
            <Button
              onClick={() => {
                // TODO: Navigate to products page with coupon applied
                console.log('Navigate to products with BIENVENIDO10 coupon');
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-6 py-2.5 text-sm whitespace-nowrap"
            >
              ¡Aprovechar!
            </Button>
          </div>

          {/* Terms */}
          <p className="text-xs text-primary-200 mt-3 text-center">
            Válido hasta el 31 de diciembre de 2024
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {autoClose && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
          <div
            className="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
            style={{ 
              width: `${((autoCloseDelay / 1000 - timeLeft) / (autoCloseDelay / 1000)) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}

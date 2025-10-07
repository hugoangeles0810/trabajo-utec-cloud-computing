'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CartIcon } from '@/components/cart/CartIcon';
import { Navigation } from './Navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implementar búsqueda de productos
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className={cn('bg-white shadow-sm border-b border-gray-200', className)}>
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>🚚 Envío gratis en pedidos desde S/ 50</span>
              <span className="hidden sm:inline">📞 +51 999 999 999</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ayuda" className="hover:text-yellow-300 transition-colors">
                Ayuda
              </Link>
              <Link href="/siguenos" className="hover:text-yellow-300 transition-colors">
                Síguenos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900">Gamarriando</h1>
              <p className="text-xs text-gray-500 -mt-1">Tu marketplace favorito</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar productos, marcas, categorías..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    'pl-10 pr-4 py-3 border-2 transition-all duration-200',
                    isSearchFocused
                      ? 'border-primary-500 shadow-lg'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 px-4 py-2"
                >
                  Buscar
                </Button>
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="hidden lg:flex items-center space-x-2">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>Mi Cuenta</span>
              </Button>
            </div>

            {/* Cart Icon */}
            <CartIcon />

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-gray-300"
              />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 px-3 py-1 text-sm"
              >
                Buscar
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Navigation Component */}
      <Navigation />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <div className="bg-white w-80 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                <Button variant="outline" size="sm" onClick={toggleMobileMenu}>
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <nav className="p-4">
              <div className="space-y-4">
                <Link
                  href="/categorias"
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Categorías
                </Link>
                <Link
                  href="/ofertas"
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Ofertas
                </Link>
                <Link
                  href="/nuevos"
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Nuevos
                </Link>
                <Link
                  href="/marcas"
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Marcas
                </Link>
                <Link
                  href="/contacto"
                  className="block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Contacto
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

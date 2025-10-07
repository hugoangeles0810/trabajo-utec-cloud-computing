'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserIcon, 
  ChevronDownIcon,
  CogIcon,
  HeartIcon,
  ShoppingBagIcon,
  GiftIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  isAuthenticated?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function UserMenu({
  isAuthenticated = false,
  user,
  onLogin,
  onLogout,
  className,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogin}
          className="flex items-center space-x-2"
        >
          <UserIcon className="h-4 w-4" />
          <span>Iniciar Sesión</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* User Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMenu}
        className="flex items-center space-x-2"
      >
        <div className="flex items-center space-x-2">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-primary-600" />
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium">
            {user?.name || 'Usuario'}
          </span>
        </div>
        <ChevronDownIcon className={cn(
          'h-4 w-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-8 w-8 text-primary-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user?.name || 'Usuario'}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {user?.email || 'usuario@ejemplo.com'}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Account Section */}
            <div className="px-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                Mi Cuenta
              </div>
            </div>
            
            <Link
              href="/perfil"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
              Mi Perfil
            </Link>
            
            <Link
              href="/pedidos"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBagIcon className="h-4 w-4 mr-3 text-gray-400" />
              Mis Pedidos
            </Link>
            
            <Link
              href="/favoritos"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <HeartIcon className="h-4 w-4 mr-3 text-gray-400" />
              Favoritos
            </Link>
            
            <Link
              href="/cupones"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <GiftIcon className="h-4 w-4 mr-3 text-gray-400" />
              Mis Cupones
            </Link>

            {/* Settings Section */}
            <div className="px-2 mt-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                Configuración
              </div>
            </div>
            
            <Link
              href="/configuracion"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <CogIcon className="h-4 w-4 mr-3 text-gray-400" />
              Configuración
            </Link>

            {/* Logout */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => handleMenuAction(onLogout || (() => {}))}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

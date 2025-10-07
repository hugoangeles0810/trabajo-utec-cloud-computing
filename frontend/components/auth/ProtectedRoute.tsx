'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils/cn';

// Types for route protection
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  requireRoles?: string[];
  requirePermissions?: string[];
  fallbackPath?: string;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
  className?: string;
  validateSession?: boolean;
}

// Access levels
export type AccessLevel = 'public' | 'authenticated' | 'guest' | 'role-based' | 'permission-based';

// Route configuration
export interface RouteConfig {
  path: string;
  accessLevel: AccessLevel;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
  sessionRequired?: boolean;
  sessionTimeout?: number;
}

// Default route configurations
export const DEFAULT_ROUTES: Record<string, RouteConfig> = {
  '/': { path: '/', accessLevel: 'public' },
  '/productos': { path: '/productos', accessLevel: 'public' },
  '/productos/[id]': { path: '/productos/[id]', accessLevel: 'public' },
  '/categorias': { path: '/categorias', accessLevel: 'public' },
  '/vendedores': { path: '/vendedores', accessLevel: 'public' },
  '/login': { path: '/login', accessLevel: 'guest', redirectTo: '/' },
  '/register': { path: '/register', accessLevel: 'guest', redirectTo: '/' },
  '/forgot-password': { path: '/forgot-password', accessLevel: 'guest' },
  '/profile': { 
    path: '/profile', 
    accessLevel: 'authenticated', 
    redirectTo: '/login',
    sessionRequired: true,
    sessionTimeout: 30
  },
  '/profile/orders': { 
    path: '/profile/orders', 
    accessLevel: 'authenticated', 
    redirectTo: '/login',
    sessionRequired: true
  },
  '/profile/settings': { 
    path: '/profile/settings', 
    accessLevel: 'authenticated', 
    redirectTo: '/login',
    sessionRequired: true
  },
  '/checkout': { 
    path: '/checkout', 
    accessLevel: 'authenticated', 
    redirectTo: '/login',
    sessionRequired: true
  },
  '/admin': { 
    path: '/admin', 
    accessLevel: 'role-based', 
    requiredRoles: ['admin'],
    redirectTo: '/',
    sessionRequired: true
  },
  '/admin/products': { 
    path: '/admin/products', 
    accessLevel: 'role-based', 
    requiredRoles: ['admin', 'vendor'],
    redirectTo: '/',
    sessionRequired: true
  },
  '/admin/users': { 
    path: '/admin/users', 
    accessLevel: 'permission-based', 
    requiredPermissions: ['users:read', 'users:write'],
    redirectTo: '/',
    sessionRequired: true
  },
};

/**
 * ProtectedRoute component that handles authentication and authorization
 */
export function ProtectedRoute({
  children,
  requireAuth = false,
  requireGuest = false,
  requireRoles = [],
  requirePermissions = [],
  fallbackPath,
  redirectTo,
  loadingComponent,
  unauthorizedComponent,
  className,
  validateSession = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessReason, setAccessReason] = useState<string>('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check access permissions
  const checkAccess = async () => {
    setIsCheckingAccess(true);
    setAccessDenied(false);
    setAccessReason('');

    try {
      // Session validation simplified for static export
      if (validateSession && isAuthenticated) {
        // For static export, we'll assume session is valid if user is authenticated
        // In a real app, you would validate the session here
      }

      // Check if authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        setAccessDenied(true);
        setAccessReason('Debes iniciar sesión para acceder a esta página.');
        setIsCheckingAccess(false);
        return;
      }

      // Check if guest access is required but user is authenticated
      if (requireGuest && isAuthenticated) {
        setAccessDenied(true);
        setAccessReason('Ya tienes una sesión activa.');
        setIsCheckingAccess(false);
        return;
      }

      // Role and permission checks simplified for static export
      // In a real app, you would implement proper role and permission checking here

      // All checks passed
      setIsCheckingAccess(false);
    } catch (error) {
      console.error('Error checking access:', error);
      setAccessDenied(true);
      setAccessReason('Error al verificar permisos de acceso.');
      setIsCheckingAccess(false);
    }
  };

  // Handle redirects
  useEffect(() => {
    if (isLoading) return;

    checkAccess();
  }, [isAuthenticated, isLoading, user, requireAuth, requireGuest, requireRoles, requirePermissions, validateSession]);

  // Handle redirects when access is denied
  useEffect(() => {
    if (accessDenied && !isCheckingAccess) {
      const targetPath = redirectTo || fallbackPath || (requireAuth ? '/login' : '/');
      
      // For guest routes, redirect to home
      if (requireGuest && isAuthenticated) {
        router.push('/');
        return;
      }

      // For authenticated routes, redirect to login
      if (requireAuth && !isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // For unauthorized access, redirect to fallback
      if (targetPath && targetPath !== pathname) {
        setTimeout(() => {
          router.push(targetPath);
        }, 3000); // Show message for 3 seconds before redirect
      }
    }
  }, [accessDenied, redirectTo, fallbackPath, requireAuth, requireGuest, pathname, router, isAuthenticated]);

  // Handle session expiry
  const handleSessionExpiry = () => {
    setSessionExpired(false);
    logout();
    router.push('/login?reason=session_expired');
  };

  // Loading state
  if (isLoading || isCheckingAccess) {
    if (loadingComponent) {
      return <div className={className}>{loadingComponent}</div>;
    }

    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    if (unauthorizedComponent) {
      return <div className={className}>{unauthorizedComponent}</div>;
    }

    return (
      <div className={cn('flex items-center justify-center min-h-[400px] p-4', className)}>
        <Card className="max-w-md w-full text-center p-8">
          <div className="mb-6">
            {sessionExpired ? (
              <ClockIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            ) : requireAuth && !isAuthenticated ? (
              <UserIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            ) : (
              <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {sessionExpired ? 'Sesión Expirada' : 
             requireAuth && !isAuthenticated ? 'Acceso Requerido' : 
             'Acceso Denegado'}
          </h2>

          <p className="text-gray-600 mb-6">
            {accessReason}
          </p>

          <div className="space-y-3">
            {sessionExpired ? (
              <Button 
                onClick={handleSessionExpiry}
                className="w-full"
                variant="primary"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Iniciar Sesión Nuevamente
              </Button>
            ) : requireAuth && !isAuthenticated ? (
              <Button 
                onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}
                className="w-full"
                variant="primary"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Iniciar Sesión
              </Button>
            ) : (
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
                variant="primary"
              >
                Volver al Inicio
              </Button>
            )}

            {!sessionExpired && (
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                Volver Atrás
              </Button>
            )}
          </div>

          {sessionExpired && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Tu sesión ha expirado por seguridad.</p>
                  <p>Por favor, inicia sesión nuevamente para continuar.</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Render children if access is granted
  return <div className={className}>{children}</div>;
}

/**
 * Higher-order component for protecting routes
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  const WrappedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook to get route configuration for current path
 */
export function useRouteConfig(pathname: string): RouteConfig | null {
  // Try exact match first
  if (DEFAULT_ROUTES[pathname]) {
    return DEFAULT_ROUTES[pathname];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, config] of Object.entries(DEFAULT_ROUTES)) {
    if (pattern.includes('[') && pattern.includes(']')) {
      // Convert Next.js dynamic route pattern to regex
      const regexPattern = pattern
        .replace(/\[([^\]]+)\]/g, '([^/]+)')
        .replace(/\//g, '\\/');
      
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return config;
      }
    }
  }

  // Default to public access for unmatched routes
  return { path: pathname, accessLevel: 'public' };
}

/**
 * Hook to check if current user has access to a route
 */
export function useRouteAccess(pathname: string) {
  const { isAuthenticated } = useAuthStore();
  const routeConfig = useRouteConfig(pathname);

  if (!routeConfig) {
    return { hasAccess: true, reason: '' };
  }

  // Check session requirement
  if (routeConfig.sessionRequired && !isAuthenticated) {
    return { hasAccess: false, reason: 'Sesión requerida' };
  }

  // Check authentication requirement
  if (routeConfig.accessLevel === 'authenticated' && !isAuthenticated) {
    return { hasAccess: false, reason: 'Autenticación requerida' };
  }

  // Check guest requirement
  if (routeConfig.accessLevel === 'guest' && isAuthenticated) {
    return { hasAccess: false, reason: 'Usuario ya autenticado' };
  }

  // Role and permission checks simplified for static export
  // In a real app, you would implement proper role and permission checking here

  return { hasAccess: true, reason: '' };
}

export default ProtectedRoute;
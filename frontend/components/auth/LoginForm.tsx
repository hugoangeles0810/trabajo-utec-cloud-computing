'use client';

import { useState, useCallback } from 'react';
import { 
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  variant?: 'default' | 'compact' | 'modal';
  showForgotPassword?: boolean;
  showRememberMe?: boolean;
  showSocialLogin?: boolean;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error: externalError = null,
  className,
  variant = 'default',
  showForgotPassword = true,
  showRememberMe = true,
  showSocialLogin = false,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Ingresa un email válido';
    }
    return undefined;
  }, []);

  const validatePassword = useCallback((password: string): string | undefined => {
    if (!password) {
      return 'La contraseña es requerida';
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginFormErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail, validatePassword]);

  const handleInputChange = useCallback((field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleInputBlur = useCallback((field: keyof LoginFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    if (field === 'email') {
      const error = validateEmail(formData.email);
      setErrors(prev => ({ ...prev, email: error }));
    } else if (field === 'password') {
      const error = validatePassword(formData.password);
      setErrors(prev => ({ ...prev, password: error }));
    }
  }, [formData, validateEmail, validatePassword]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ email: true, password: true });
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [formData, validateForm, onSubmit]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const isFormValid = formData.email.trim() && formData.password && Object.keys(errors).length === 0;
  const displayError = externalError || errors.general;

  const renderDefaultVariant = () => (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-gray-600">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleInputBlur('email')}
                placeholder="tu@email.com"
                className={cn(
                  'pl-10',
                  touched.email && errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                )}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleInputBlur('password')}
                placeholder="Tu contraseña"
                className={cn(
                  'pl-10 pr-10',
                  touched.password && errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                )}
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            {showRememberMe && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
            )}

            {showForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary-600 hover:text-primary-500 transition-colors"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Social Login */}
        {showSocialLogin && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        )}

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onRegister}
              className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
              disabled={isLoading}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderCompactVariant = () => (
    <div className={cn('w-full', className)}>
      {/* Error Message */}
      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{displayError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email Field */}
        <div>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleInputBlur('email')}
            placeholder="Email"
            className={cn(
              touched.email && errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={isLoading}
            required
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleInputBlur('password')}
              placeholder="Contraseña"
              className={cn(
                'pr-10',
                touched.password && errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Options */}
        <div className="flex items-center justify-between text-sm">
          {showRememberMe && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-gray-600">Recordarme</span>
            </label>
          )}

          {showForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-primary-600 hover:text-primary-500"
              disabled={isLoading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>
    </div>
  );

  const renderModalVariant = () => (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Iniciar Sesión
        </h3>
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{displayError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleInputBlur('email')}
          placeholder="Email"
          className={cn(
            touched.email && errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          disabled={isLoading}
          required
        />
        {touched.email && errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}

        {/* Password Field */}
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleInputBlur('password')}
            placeholder="Contraseña"
            className={cn(
              'pr-10',
              touched.password && errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {touched.password && errors.password && (
          <p className="text-sm text-red-600">{errors.password}</p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'modal':
      return renderModalVariant();
    default:
      return renderDefaultVariant();
  }
}

// Convenience components for common use cases
export function LoginFormDefault(props: Omit<LoginFormProps, 'variant'>) {
  return <LoginForm {...props} variant="default" />;
}

export function LoginFormCompact(props: Omit<LoginFormProps, 'variant'>) {
  return <LoginForm {...props} variant="compact" />;
}

export function LoginFormModal(props: Omit<LoginFormProps, 'variant'>) {
  return <LoginForm {...props} variant="modal" />;
}

// Utility functions
export const validateLoginForm = (data: LoginFormData): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!data.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Ingresa un email válido';
  }

  if (!data.password) {
    errors.password = 'La contraseña es requerida';
  } else if (data.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
};

export const isLoginFormValid = (data: LoginFormData): boolean => {
  const errors = validateLoginForm(data);
  return Object.keys(errors).length === 0;
};

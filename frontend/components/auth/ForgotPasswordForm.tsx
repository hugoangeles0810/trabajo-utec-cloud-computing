'use client';

import { useState, useCallback } from 'react';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
  onBackToLogin?: () => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
  successMessage?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'modal';
  showBackButton?: boolean;
  showSuccessMessage?: boolean;
  showInstructions?: boolean;
  instructionsText?: string;
  emailPlaceholder?: string;
  submitButtonText?: string;
  backButtonText?: string;
  title?: string;
  description?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  error: externalError = null,
  success = false,
  successMessage = 'Hemos enviado un enlace de recuperación a tu email. Por favor revisa tu bandeja de entrada y sigue las instrucciones.',
  className,
  variant = 'default',
  showBackButton = true,
  showSuccessMessage = true,
  showInstructions = true,
  instructionsText = 'Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.',
  emailPlaceholder = 'tu@email.com',
  submitButtonText = 'Enviar Enlace de Recuperación',
  backButtonText = 'Volver al Login',
  title = '¿Olvidaste tu contraseña?',
  description = 'No te preocupes, te ayudamos a recuperarla',
}: ForgotPasswordFormProps) {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
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

  const validateForm = useCallback((): boolean => {
    const newErrors: ForgotPasswordFormErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail]);

  const handleInputChange = useCallback((field: keyof ForgotPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof ForgotPasswordFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleInputBlur = useCallback((field: keyof ForgotPasswordFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    if (field === 'email') {
      const error = validateEmail(formData.email);
      setErrors(prev => ({ ...prev, email: error }));
    }
  }, [formData, validateEmail]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ email: true });
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  }, [formData, validateForm, onSubmit]);

  const displayError = externalError || errors.general;

  const renderDefaultVariant = () => (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600">
            {description}
          </p>
        </div>

        {/* Success State */}
        {success && showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-900 mb-1">
                  Email enviado exitosamente
                </h3>
                <p className="text-sm text-green-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {displayError && !success && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{displayError}</span>
          </div>
        )}

        {/* Instructions */}
        {showInstructions && !success && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">{instructionsText}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleInputBlur('email')}
                  placeholder={emailPlaceholder}
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!formData.email.trim() || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  Enviando...
                </div>
              ) : (
                submitButtonText
              )}
            </Button>
          </form>
        )}

        {/* Back Button */}
        {showBackButton && onBackToLogin && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
              disabled={isLoading}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {backButtonText}
            </button>
          </div>
        )}

        {/* Additional Help */}
        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No recibiste el email?{' '}
              <button
                type="button"
                onClick={() => onSubmit(formData)}
                className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
                disabled={isLoading}
              >
                Reenviar
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompactVariant = () => (
    <div className={cn('w-full', className)}>
      {/* Error Message */}
      {displayError && !success && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{displayError}</span>
        </div>
      )}

      {/* Success Message */}
      {success && showSuccessMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              type="email"
              placeholder={emailPlaceholder}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleInputBlur('email')}
              className={cn(
                'pl-10',
                touched.email && errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
              required
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!formData.email.trim() || isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              submitButtonText
            )}
          </Button>
        </form>
      )}

      {/* Back Button */}
      {showBackButton && onBackToLogin && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
            disabled={isLoading}
          >
            {backButtonText}
          </button>
        </div>
      )}
    </div>
  );

  const renderModalVariant = () => (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>

      {/* Error Message */}
      {displayError && !success && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{displayError}</span>
        </div>
      )}

      {/* Success Message */}
      {success && showSuccessMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {showInstructions && !success && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">{instructionsText}</p>
          </div>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder={emailPlaceholder}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleInputBlur('email')}
              className={cn(
                'pl-10',
                touched.email && errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              disabled={isLoading}
              required
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!formData.email.trim() || isLoading}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              submitButtonText
            )}
          </Button>
        </form>
      )}

      {/* Back Button */}
      {showBackButton && onBackToLogin && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
            disabled={isLoading}
          >
            {backButtonText}
          </button>
        </div>
      )}
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
export function ForgotPasswordFormDefault(props: Omit<ForgotPasswordFormProps, 'variant'>) {
  return <ForgotPasswordForm {...props} variant="default" />;
}

export function ForgotPasswordFormCompact(props: Omit<ForgotPasswordFormProps, 'variant'>) {
  return <ForgotPasswordForm {...props} variant="compact" />;
}

export function ForgotPasswordFormModal(props: Omit<ForgotPasswordFormProps, 'variant'>) {
  return <ForgotPasswordForm {...props} variant="modal" />;
}

// Utility functions
export const validateForgotPasswordForm = (data: ForgotPasswordFormData): ForgotPasswordFormErrors => {
  const errors: ForgotPasswordFormErrors = {};

  if (!data.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Ingresa un email válido';
  }

  return errors;
};

export const isForgotPasswordFormValid = (data: ForgotPasswordFormData): boolean => {
  const errors = validateForgotPasswordForm(data);
  return Object.keys(errors).length === 0;
};

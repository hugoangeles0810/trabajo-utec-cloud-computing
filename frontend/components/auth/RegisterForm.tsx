'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  variant?: 'default' | 'compact' | 'modal';
  showMarketingOptIn?: boolean;
  showTermsLink?: boolean;
  termsUrl?: string;
  privacyUrl?: string;
  onLogin?: () => void;
}

export function RegisterForm({
  onSubmit,
  isLoading = false,
  error: externalError = null,
  className,
  variant = 'default',
  showMarketingOptIn = true,
  showTermsLink = true,
  termsUrl = '/terms',
  privacyUrl = '/privacy',
  onLogin,
}: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToMarketing: false,
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false,
  });

  const validateFirstName = useCallback((firstName: string): string | undefined => {
    if (!firstName.trim()) {
      return 'El nombre es requerido';
    }
    if (firstName.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(firstName.trim())) {
      return 'El nombre solo puede contener letras';
    }
    return undefined;
  }, []);

  const validateLastName = useCallback((lastName: string): string | undefined => {
    if (!lastName.trim()) {
      return 'El apellido es requerido';
    }
    if (lastName.trim().length < 2) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName.trim())) {
      return 'El apellido solo puede contener letras';
    }
    return undefined;
  }, []);

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
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'La contraseña debe contener al menos un carácter especial';
    }
    return undefined;
  }, []);

  const validateConfirmPassword = useCallback((confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return 'Confirma tu contraseña';
    }
    if (confirmPassword !== password) {
      return 'Las contraseñas no coinciden';
    }
    return undefined;
  }, []);

  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Al menos 8 caracteres');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Una letra minúscula');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Una letra mayúscula');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Un número');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Un carácter especial');

    if (password.length >= 12) score += 1;

    return {
      score,
      feedback,
      isValid: score >= 4,
    };
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: RegisterFormErrors = {};
    
    const firstNameError = validateFirstName(formData.firstName);
    if (firstNameError) {
      newErrors.firstName = firstNameError;
    }
    
    const lastNameError = validateLastName(formData.lastName);
    if (lastNameError) {
      newErrors.lastName = lastNameError;
    }
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateFirstName, validateLastName, validateEmail, validatePassword, validateConfirmPassword]);

  const handleInputChange = useCallback((field: keyof RegisterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof RegisterFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Calculate password strength
    if (field === 'password') {
      const strength = calculatePasswordStrength(value as string);
      setPasswordStrength(strength);
    }
  }, [errors, calculatePasswordStrength]);

  const handleInputBlur = useCallback((field: keyof RegisterFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    if (field === 'firstName') {
      const error = validateFirstName(formData.firstName);
      setErrors(prev => ({ ...prev, firstName: error }));
    } else if (field === 'lastName') {
      const error = validateLastName(formData.lastName);
      setErrors(prev => ({ ...prev, lastName: error }));
    } else if (field === 'email') {
      const error = validateEmail(formData.email);
      setErrors(prev => ({ ...prev, email: error }));
    } else if (field === 'password') {
      const error = validatePassword(formData.password);
      setErrors(prev => ({ ...prev, password: error }));
    } else if (field === 'confirmPassword') {
      const error = validateConfirmPassword(formData.confirmPassword, formData.password);
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  }, [formData, validateFirstName, validateLastName, validateEmail, validatePassword, validateConfirmPassword]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true, agreeToTerms: true });
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  }, [formData, validateForm, onSubmit]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const isFormValid = 
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    formData.email.trim() && 
    formData.password && 
    formData.confirmPassword && 
    formData.agreeToTerms && 
    passwordStrength.isValid && 
    Object.keys(errors).length === 0;

  const displayError = externalError || errors.general;

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'text-red-600 bg-red-100';
    if (score <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Débil';
    if (score <= 4) return 'Media';
    return 'Fuerte';
  };

  const renderDefaultVariant = () => (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h2>
          <p className="text-gray-600">
            Únete a Gamarriando y descubre productos gaming increíbles
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
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  onBlur={() => handleInputBlur('firstName')}
                  placeholder="Tu nombre"
                  className={cn(
                    'pl-10',
                    touched.firstName && errors.firstName && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  )}
                  disabled={isLoading}
                  autoComplete="given-name"
                  required
                />
              </div>
              {touched.firstName && errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  onBlur={() => handleInputBlur('lastName')}
                  placeholder="Tu apellido"
                  className={cn(
                    'pl-10',
                    touched.lastName && errors.lastName && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  )}
                  disabled={isLoading}
                  autoComplete="family-name"
                  required
                />
              </div>
              {touched.lastName && errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

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
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                autoComplete="new-password"
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
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        getPasswordStrengthColor(passwordStrength.score)
                      )}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    getPasswordStrengthColor(passwordStrength.score)
                  )}>
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Falta: {passwordStrength.feedback.join(', ')}
                  </p>
                )}
              </div>
            )}
            
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                placeholder="Confirma tu contraseña"
                className={cn(
                  'pl-10 pr-10',
                  touched.confirmPassword && errors.confirmPassword && 'border-red-300 focus:border-red-500 focus:ring-red-500'
                )}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors',
                    formData.agreeToTerms
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 hover:border-primary-400'
                  )}
                >
                  {formData.agreeToTerms && <CheckCircleIcon className="h-3 w-3" />}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-700">
                  Acepto los{' '}
                  {showTermsLink ? (
                    <Link href={termsUrl} className="text-primary-600 hover:text-primary-500 underline">
                      términos y condiciones
                    </Link>
                  ) : (
                    'términos y condiciones'
                  )}
                  {' '}y la{' '}
                  {showTermsLink ? (
                    <Link href={privacyUrl} className="text-primary-600 hover:text-primary-500 underline">
                      política de privacidad
                    </Link>
                  ) : (
                    'política de privacidad'
                  )}
                </span>
              </div>
            </label>
            {touched.agreeToTerms && errors.agreeToTerms && (
              <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
            )}
          </div>

          {/* Marketing Opt-in */}
          {showMarketingOptIn && (
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={formData.agreeToMarketing}
                  onChange={(e) => handleInputChange('agreeToMarketing', e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors',
                    formData.agreeToMarketing
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 hover:border-primary-400'
                  )}
                >
                  {formData.agreeToMarketing && <CheckCircleIcon className="h-3 w-3" />}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-700">
                  Quiero recibir ofertas especiales y novedades por email
                </span>
              </div>
            </label>
          )}

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
                Creando cuenta...
              </div>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onLogin}
              className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
              disabled={isLoading}
            >
              Inicia sesión aquí
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
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="Nombre"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleInputBlur('firstName')}
            className={cn(
              touched.firstName && errors.firstName && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={isLoading}
            required
          />
          <Input
            type="text"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleInputBlur('lastName')}
            className={cn(
              touched.lastName && errors.lastName && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
            disabled={isLoading}
            required
          />
        </div>

        {/* Email */}
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleInputBlur('email')}
          className={cn(
            touched.email && errors.email && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          disabled={isLoading}
          required
        />

        {/* Password */}
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          onBlur={() => handleInputBlur('password')}
          className={cn(
            'pr-10',
            touched.password && errors.password && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          disabled={isLoading}
          required
        />

        {/* Confirm Password */}
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          onBlur={() => handleInputBlur('confirmPassword')}
          className={cn(
            touched.confirmPassword && errors.confirmPassword && 'border-red-300 focus:border-red-500 focus:ring-red-500'
          )}
          disabled={isLoading}
          required
        />

        {/* Terms */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={isLoading}
          />
          <span className="text-gray-600">
            Acepto los términos y condiciones
          </span>
        </label>

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
            'Crear Cuenta'
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
          Crear Cuenta
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
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            placeholder="Nombre"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            onBlur={() => handleInputBlur('firstName')}
            disabled={isLoading}
            required
          />
          <Input
            type="text"
            placeholder="Apellido"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            onBlur={() => handleInputBlur('lastName')}
            disabled={isLoading}
            required
          />
        </div>

        {/* Email */}
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          onBlur={() => handleInputBlur('email')}
          disabled={isLoading}
          required
        />

        {/* Password */}
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          onBlur={() => handleInputBlur('password')}
          disabled={isLoading}
          required
        />

        {/* Confirm Password */}
        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          onBlur={() => handleInputBlur('confirmPassword')}
          disabled={isLoading}
          required
        />

        {/* Terms */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            disabled={isLoading}
          />
          <span className="text-gray-600">
            Acepto los términos y condiciones
          </span>
        </label>

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
            'Crear Cuenta'
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
export function RegisterFormDefault(props: Omit<RegisterFormProps, 'variant'>) {
  return <RegisterForm {...props} variant="default" />;
}

export function RegisterFormCompact(props: Omit<RegisterFormProps, 'variant'>) {
  return <RegisterForm {...props} variant="compact" />;
}

export function RegisterFormModal(props: Omit<RegisterFormProps, 'variant'>) {
  return <RegisterForm {...props} variant="modal" />;
}

// Utility functions
export const validateRegisterForm = (data: RegisterFormData): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'El nombre es requerido';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'El nombre debe tener al menos 2 caracteres';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.firstName.trim())) {
    errors.firstName = 'El nombre solo puede contener letras';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'El apellido es requerido';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.lastName.trim())) {
    errors.lastName = 'El apellido solo puede contener letras';
  }

  if (!data.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Ingresa un email válido';
  }

  if (!data.password) {
    errors.password = 'La contraseña es requerida';
  } else if (data.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(data.password)) {
    errors.password = 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña';
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  if (!data.agreeToTerms) {
    errors.agreeToTerms = 'Debes aceptar los términos y condiciones';
  }

  return errors;
};

export const isRegisterFormValid = (data: RegisterFormData): boolean => {
  const errors = validateRegisterForm(data);
  return Object.keys(errors).length === 0;
};

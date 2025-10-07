// Auth Components exports for Gamarriando Frontend

// Login Form
export { 
  LoginForm,
  LoginFormDefault,
  LoginFormCompact,
  LoginFormModal,
  validateLoginForm,
  isLoginFormValid,
  type LoginFormData,
  type LoginFormErrors
} from './LoginForm';

// Register Form
export { 
  RegisterForm,
  RegisterFormDefault,
  RegisterFormCompact,
  RegisterFormModal,
  validateRegisterForm,
  isRegisterFormValid,
  type RegisterFormData,
  type RegisterFormErrors
} from './RegisterForm';

// Forgot Password Form
export { 
  ForgotPasswordForm,
  ForgotPasswordFormDefault,
  ForgotPasswordFormCompact,
  ForgotPasswordFormModal,
  validateForgotPasswordForm,
  isForgotPasswordFormValid,
  type ForgotPasswordFormData,
  type ForgotPasswordFormErrors
} from './ForgotPasswordForm';

// Protected Route
export { 
  ProtectedRoute,
  withProtectedRoute,
  useRouteConfig,
  useRouteAccess,
  type ProtectedRouteProps,
  type AccessLevel,
  type RouteConfig
} from './ProtectedRoute';
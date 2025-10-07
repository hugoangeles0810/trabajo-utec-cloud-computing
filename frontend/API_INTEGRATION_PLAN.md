# 🔌 Plan de Integración API - Frontend Gamarriando

## 📋 Resumen

Este documento detalla la estrategia de integración del frontend con los microservicios existentes de Gamarriando, incluyendo Product Service, User Service, Payment Service, y Notification Service.

## 🏗️ Arquitectura de Integración

### **Microservicios Disponibles**

```
Frontend (NextJS)
├── Product Service (Lambda)
│   ├── Products API
│   ├── Categories API
│   └── Vendors API
├── User Service (Lambda)
│   ├── Authentication API
│   ├── User Management API
│   └── Session Management API
├── Payment Service (Lambda)
│   ├── Orders API
│   ├── Payments API
│   └── Transactions API
└── Notification Service (Lambda)
    ├── Email API
    └── SMS API
```

## 🛍️ Product Service Integration

### **Base URL**

```
https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev
```

### **Endpoints Disponibles**

#### **Products API**

```typescript
// lib/api/products.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  vendor: string;
  status: 'active' | 'inactive';
  stock: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  vendor?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export class ProductAPI {
  private baseURL =
    'https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev';

  async getProducts(filters?: ProductFilters): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseURL}/api/v1/products?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseURL}/api/v1/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return response.json();
  }
}
```

#### **Categories API**

```typescript
// lib/api/categories.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class CategoryAPI {
  private baseURL =
    'https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev';

  async getCategories(): Promise<{
    categories: Category[];
    total: number;
  }> {
    const response = await fetch(`${this.baseURL}/api/v1/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  }

  async getCategory(id: string): Promise<Category> {
    const response = await fetch(`${this.baseURL}/api/v1/categories/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.statusText}`);
    }

    return response.json();
  }
}
```

#### **Vendors API**

```typescript
// lib/api/vendors.ts
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  description?: string;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_products: number;
  created_at: string;
  updated_at: string;
}

export class VendorAPI {
  private baseURL =
    'https://c8ydsj3r02.execute-api.us-east-1.amazonaws.com/dev';

  async getVendors(): Promise<{
    vendors: Vendor[];
    total: number;
  }> {
    const response = await fetch(`${this.baseURL}/api/v1/vendors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vendors: ${response.statusText}`);
    }

    return response.json();
  }

  async getVendor(id: string): Promise<Vendor> {
    const response = await fetch(`${this.baseURL}/api/v1/vendors/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vendor: ${response.statusText}`);
    }

    return response.json();
  }
}
```

## 👤 User Service Integration

### **Base URL**

```
https://[api-id].execute-api.us-east-1.amazonaws.com/dev
```

### **Authentication API**

```typescript
// lib/api/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: {
    id: string;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    is_verified: boolean;
    roles: string[];
  };
}

export class AuthAPI {
  private baseURL = 'https://[api-id].execute-api.us-east-1.amazonaws.com/dev';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    return response.json();
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    return response.json();
  }

  async logout(token: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.statusText}`);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### **User Management API**

```typescript
// lib/api/users.ts
export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  profile_picture_url?: string;
  preferences: Record<string, any>;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export class UserAPI {
  private baseURL = 'https://[api-id].execute-api.us-east-1.amazonaws.com/dev';

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/v1/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return response.json();
  }

  async updateProfile(token: string, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/v1/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    return response.json();
  }

  async changePassword(
    token: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/v1/users/change-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to change password: ${response.statusText}`);
    }
  }
}
```

## 💳 Payment Service Integration

### **Orders API**

```typescript
// lib/api/orders.ts
export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  payment_method: 'credit_card' | 'debit_card' | 'paypal';
  coupon_code?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: any;
  billing_address: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export class OrderAPI {
  private baseURL = 'https://[api-id].execute-api.us-east-1.amazonaws.com/dev';

  async createOrder(token: string, orderData: CreateOrderData): Promise<Order> {
    const response = await fetch(`${this.baseURL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrder(token: string, orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseURL}/api/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserOrders(token: string): Promise<Order[]> {
    const response = await fetch(`${this.baseURL}/api/v1/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### **Payments API**

```typescript
// lib/api/payments.ts
export interface PaymentData {
  order_id: string;
  amount: number;
  currency: string;
  payment_method: 'credit_card' | 'debit_card' | 'paypal';
  card_details?: {
    number: string;
    expiry_month: number;
    expiry_year: number;
    cvv: string;
    holder_name: string;
  };
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export class PaymentAPI {
  private baseURL = 'https://[api-id].execute-api.us-east-1.amazonaws.com/dev';

  async processPayment(
    token: string,
    paymentData: PaymentData
  ): Promise<Payment> {
    const response = await fetch(`${this.baseURL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`Failed to process payment: ${response.statusText}`);
    }

    return response.json();
  }

  async getPayment(token: string, paymentId: string): Promise<Payment> {
    const response = await fetch(
      `${this.baseURL}/api/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payment: ${response.statusText}`);
    }

    return response.json();
  }
}
```

## 🔔 Notification Service Integration

### **Notifications API**

```typescript
// lib/api/notifications.ts
export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface SMSNotification {
  to: string;
  message: string;
}

export class NotificationAPI {
  private baseURL = 'https://[api-id].execute-api.us-east-1.amazonaws.com/dev';

  async sendEmail(
    token: string,
    notification: EmailNotification
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/v1/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
  }

  async sendSMS(token: string, notification: SMSNotification): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/v1/notifications/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      throw new Error(`Failed to send SMS: ${response.statusText}`);
    }
  }
}
```

## 🎯 React Query Integration

### **Query Keys**

```typescript
// lib/queries/keys.ts
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: ProductFilters) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    lists: () => [...queryKeys.vendors.all, 'list'] as const,
    details: () => [...queryKeys.vendors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.vendors.details(), id] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
};
```

### **Custom Hooks**

```typescript
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductAPI } from '../lib/api/products';
import { queryKeys } from '../lib/queries/keys';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters || {}),
    queryFn: () => new ProductAPI().getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => new ProductAPI().getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

// hooks/useAuth.ts
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      new AuthAPI().login(credentials),
    onSuccess: data => {
      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Update auth state
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const token = localStorage.getItem('access_token');
      return new AuthAPI().logout(token!);
    },
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Clear all cached data
      queryClient.clear();
    },
  });
}
```

## 🔧 API Client Configuration

### **Base API Client**

```typescript
// lib/api/client.ts
class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle token expiration
        await this.handleTokenRefresh();
        // Retry request
        return this.request<T>(endpoint, options);
      }

      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async handleTokenRefresh(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await new AuthAPI().refreshToken(refreshToken);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    } catch (error) {
      // Refresh failed, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  }
}

export const apiClient = new APIClient(process.env.NEXT_PUBLIC_API_BASE_URL!);
```

## 🚨 Error Handling

### **Error Types**

```typescript
// lib/types/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### **Error Boundary**

```typescript
// components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}
```

## 📊 Monitoring y Analytics

### **API Monitoring**

```typescript
// lib/monitoring/api.ts
export class APIMonitor {
  static async trackRequest(
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) {
    // Send metrics to monitoring service
    console.log(
      `API Request: ${method} ${endpoint} - ${duration}ms - ${status}`
    );
  }

  static async trackError(endpoint: string, method: string, error: Error) {
    // Send error to monitoring service
    console.error(`API Error: ${method} ${endpoint}`, error);
  }
}
```

---

**Gamarriando API Integration Plan** - Versión 1.0 🔌

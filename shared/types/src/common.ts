import { z } from 'zod';

// Common types used across all services
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    size: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  });

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
});

export const SuccessResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string(),
  data: z.record(z.any()).optional(),
});

// Type exports
export type Pagination = z.infer<typeof PaginationSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

// Common enums
export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}
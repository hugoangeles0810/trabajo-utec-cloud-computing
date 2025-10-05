import { z } from 'zod';

// API Response schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean().default(true),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.date().default(() => new Date()),
  });

export const ApiErrorSchema = z.object({
  success: z.boolean().default(false),
  error: z.string(),
  message: z.string(),
  details: z.record(z.any()).optional(),
  timestamp: z.date().default(() => new Date()),
});

// JWT Token schemas
export const JwtPayloadSchema = z.object({
  sub: z.string(), // user ID
  email: z.string().email(),
  roles: z.array(z.string()).default([]),
  vendorId: z.number().int().positive().optional(),
  exp: z.number(),
  iat: z.number(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenType: z.string().default('bearer'),
  expiresIn: z.number(),
  user: z.object({
    id: z.number().int().positive(),
    email: z.string().email(),
    name: z.string(),
    roles: z.array(z.string()),
    vendorId: z.number().int().positive().optional(),
  }),
});

// Health check schema
export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  service: z.string(),
  version: z.string(),
  timestamp: z.date(),
  dependencies: z.record(z.object({
    status: z.enum(['healthy', 'unhealthy']),
    responseTime: z.number().optional(),
    lastCheck: z.date(),
  })).optional(),
});

// Service discovery schema
export const ServiceInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  endpoints: z.array(z.object({
    path: z.string(),
    method: z.string(),
    description: z.string().optional(),
  })),
  healthCheck: z.string().url(),
  documentation: z.string().url().optional(),
});

// Type exports
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
};

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type ServiceInfo = z.infer<typeof ServiceInfoSchema>;

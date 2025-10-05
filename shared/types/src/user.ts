import { z } from 'zod';
import { UserRole } from './common';

export const UserBaseSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.date().optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().default(true),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
});

export const UserCreateSchema = UserBaseSchema.extend({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const UserUpdateSchema = UserBaseSchema.partial().extend({
  roles: z.array(z.nativeEnum(UserRole)).optional(),
});

export const UserResponseSchema = UserBaseSchema.extend({
  id: z.number().int().positive(),
  roles: z.array(z.nativeEnum(UserRole)),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export const UserProfileSchema = UserResponseSchema.extend({
  addresses: z.array(z.any()).optional(),
  preferences: z.record(z.any()).optional(),
});

export type UserBase = z.infer<typeof UserBaseSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

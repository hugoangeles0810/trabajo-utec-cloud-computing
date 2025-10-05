import { z } from 'zod';
import { NotificationType } from './common';

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export const NotificationBaseSchema = z.object({
  userId: z.number().int().positive(),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority).default(NotificationPriority.NORMAL),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  scheduledAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

export const NotificationCreateSchema = NotificationBaseSchema.omit({
  isRead: true,
});

export const NotificationUpdateSchema = NotificationBaseSchema.partial();

export const NotificationResponseSchema = NotificationBaseSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  readAt: z.date().optional(),
});

export const NotificationTemplateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  type: z.nativeEnum(NotificationType),
  subject: z.string().min(1),
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NotificationTemplateCreateSchema = NotificationTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationBase = z.infer<typeof NotificationBaseSchema>;
export type NotificationCreate = z.infer<typeof NotificationCreateSchema>;
export type NotificationUpdate = z.infer<typeof NotificationUpdateSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
export type NotificationTemplate = z.infer<typeof NotificationTemplateSchema>;
export type NotificationTemplateCreate = z.infer<typeof NotificationTemplateCreateSchema>;

import { z } from 'zod';

export const CategoryBaseSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.number().int().positive().optional(),
  sortOrder: z.number().int().min(0).default(0),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
});

export const CategoryCreateSchema = CategoryBaseSchema;

export const CategoryUpdateSchema = CategoryBaseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const CategoryResponseSchema = CategoryBaseSchema.extend({
  id: z.number().int().positive(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  children: z.array(z.lazy(() => CategoryResponseSchema)).optional(),
});

export type CategoryBase = z.infer<typeof CategoryBaseSchema>;
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

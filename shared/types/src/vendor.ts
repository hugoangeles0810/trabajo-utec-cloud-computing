import { z } from 'zod';

export const VendorBaseSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  businessName: z.string().max(255).optional(),
  businessType: z.string().max(100).optional(),
  taxId: z.string().max(100).optional(),
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
});

export const VendorCreateSchema = VendorBaseSchema;

export const VendorUpdateSchema = VendorBaseSchema.partial().extend({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

export const VendorResponseSchema = VendorBaseSchema.extend({
  id: z.number().int().positive(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type VendorBase = z.infer<typeof VendorBaseSchema>;
export type VendorCreate = z.infer<typeof VendorCreateSchema>;
export type VendorUpdate = z.infer<typeof VendorUpdateSchema>;
export type VendorResponse = z.infer<typeof VendorResponseSchema>;

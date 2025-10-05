import { z } from 'zod';

// Product enums
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  BUNDLE = 'bundle',
  DIGITAL = 'digital',
}

// Product schemas
export const ProductBaseSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1).max(100),
  productType: z.nativeEnum(ProductType).default(ProductType.SIMPLE),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  trackInventory: z.boolean().default(true),
  inventoryQuantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(5),
  allowBackorder: z.boolean().default(false),
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  attributes: z.record(z.any()).optional(),
});

export const ProductCreateSchema = ProductBaseSchema.extend({
  vendorId: z.number().int().positive(),
  categoryIds: z.array(z.number().int().positive()).default([]),
});

export const ProductUpdateSchema = ProductBaseSchema.partial().extend({
  categoryIds: z.array(z.number().int().positive()).optional(),
});

export const ProductResponseSchema = ProductBaseSchema.extend({
  id: z.number().int().positive(),
  vendorId: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  vendor: z.any().optional(),
  categories: z.array(z.any()).optional(),
  images: z.array(z.any()).optional(),
  tags: z.array(z.any()).optional(),
});

// Product Image schemas
export const ProductImageSchema = z.object({
  id: z.number().int().positive(),
  productId: z.number().int().positive(),
  imageUrl: z.string().url(),
  altText: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProductImageCreateSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

// Product Tag schemas
export const ProductTagSchema = z.object({
  id: z.number().int().positive(),
  productId: z.number().int().positive(),
  name: z.string().min(1).max(100),
  value: z.string().max(255).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProductTagCreateSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.string().max(255).optional(),
});

// Search schemas
export const ProductSearchSchema = z.object({
  query: z.string().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  vendorIds: z.array(z.number().int().positive()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// Type exports
export type ProductBase = z.infer<typeof ProductBaseSchema>;
export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductImageCreate = z.infer<typeof ProductImageCreateSchema>;
export type ProductTag = z.infer<typeof ProductTagSchema>;
export type ProductTagCreate = z.infer<typeof ProductTagCreateSchema>;
export type ProductSearch = z.infer<typeof ProductSearchSchema>;

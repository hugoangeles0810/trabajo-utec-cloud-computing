import { z } from 'zod';
import { OrderStatus } from './common';

export const OrderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
  productName: z.string(),
  productSku: z.string(),
  productImage: z.string().url().optional(),
});

export const ShippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

export const OrderBaseSchema = z.object({
  userId: z.number().int().positive(),
  vendorId: z.number().int().positive().optional(),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.PENDING),
  subtotal: z.number().positive(),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  total: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().optional(),
  shippingAddress: ShippingAddressSchema,
  billingAddress: ShippingAddressSchema.optional(),
});

export const OrderCreateSchema = OrderBaseSchema.extend({
  items: z.array(OrderItemSchema).min(1),
});

export const OrderUpdateSchema = OrderBaseSchema.partial().extend({
  items: z.array(OrderItemSchema).optional(),
});

export const OrderResponseSchema = OrderBaseSchema.extend({
  id: z.number().int().positive(),
  orderNumber: z.string(),
  items: z.array(OrderItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  shippedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type OrderBase = z.infer<typeof OrderBaseSchema>;
export type OrderCreate = z.infer<typeof OrderCreateSchema>;
export type OrderUpdate = z.infer<typeof OrderUpdateSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;

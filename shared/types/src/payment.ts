import { z } from 'zod';
import { PaymentStatus } from './common';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CRYPTOCURRENCY = 'cryptocurrency',
}

export const PaymentBaseSchema = z.object({
  orderId: z.number().int().positive(),
  userId: z.number().int().positive(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  method: z.nativeEnum(PaymentMethod),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  transactionId: z.string().optional(),
  gatewayResponse: z.record(z.any()).optional(),
  failureReason: z.string().optional(),
  processedAt: z.date().optional(),
});

export const PaymentCreateSchema = PaymentBaseSchema.omit({
  status: true,
  transactionId: true,
  gatewayResponse: true,
  failureReason: true,
  processedAt: true,
});

export const PaymentUpdateSchema = PaymentBaseSchema.partial();

export const PaymentResponseSchema = PaymentBaseSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaymentIntentSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  status: z.string(),
});

export type PaymentBase = z.infer<typeof PaymentBaseSchema>;
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;
export type PaymentUpdate = z.infer<typeof PaymentUpdateSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;

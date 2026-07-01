import { z } from "zod";

export const customerProfileSchema = z.object({
  city: z.string().min(1),
  defaultPayment: z.string().min(1),
  homeArea: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  rating: z.string().min(1),
  title: z.string().min(1)
});

export const customerPaymentSummarySchema = z.object({
  method: z.string().min(1),
  monthlySpend: z.string().min(1),
  status: z.string().min(1)
});

export const customerSupportActionSchema = z.object({
  detail: z.string().min(1),
  label: z.enum(["محادثة الدعم", "الإبلاغ عن مشكلة", "اتصال سريع"]),
  priority: z.string().min(1),
  response: z.string().min(1)
});

export const customerDestinationSchema = z.object({
  area: z.string().min(1),
  detail: z.string().min(1),
  distance: z.string().min(1),
  label: z.string().min(1),
  price: z.string().min(1)
});

export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type CustomerPaymentSummary = z.infer<typeof customerPaymentSummarySchema>;
export type CustomerSupportAction = z.infer<typeof customerSupportActionSchema>;
export type CustomerDestination = z.infer<typeof customerDestinationSchema>;

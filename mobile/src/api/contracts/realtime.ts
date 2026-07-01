import { z } from "zod";

export const mockRealtimeConnectionStatusSchema = z.enum(["connected", "offline", "syncing"]);

export const mockRealtimeEventKindSchema = z.enum([
  "captain-arrived",
  "captain-request-declined",
  "captain-request-accepted",
  "customer-feedback-submitted",
  "customer-request-created",
  "trip-completed",
  "trip-started"
]);

export const mockRealtimeEventSchema = z.object({
  audience: z.enum(["both", "captain", "customer"]),
  detail: z.string().min(1),
  id: z.string().min(1),
  kind: mockRealtimeEventKindSchema,
  requestId: z.string().min(1),
  sequence: z.number().int().positive(),
  status: z.literal("delivered"),
  title: z.string().min(1)
});

export type RealtimeConnectionStatusContract = z.infer<typeof mockRealtimeConnectionStatusSchema>;
export type RealtimeEventKindContract = z.infer<typeof mockRealtimeEventKindSchema>;
export type RealtimeEventContract = z.infer<typeof mockRealtimeEventSchema>;

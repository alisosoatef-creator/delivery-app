import { z } from "zod";

export const rideStatusSchema = z.enum(["pickup", "arrived", "driving", "completed"]);

export const captainAvailableRequestSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  destinationArea: z.string().min(1),
  destinationDetail: z.string().min(1),
  distance: z.string().min(1),
  etaToPickup: z.string().min(1),
  id: z.string().min(1),
  paymentMethod: z.string().min(1),
  pickup: z.string().min(1),
  price: z.string().min(1),
  serviceLabel: z.string().min(1)
});

export type RideStatus = z.infer<typeof rideStatusSchema>;
export type CaptainAvailableRequestContract = z.infer<typeof captainAvailableRequestSchema>;

import { z } from "zod";

export const ShipmentSchema = z.object({
    email: z.string().email('email musrt be a valid email'),
    adress: z.string().min(6, 'adress must be at least 6 characters long'),
});

export type ShipmentFormData = z.infer<typeof ShipmentSchema>
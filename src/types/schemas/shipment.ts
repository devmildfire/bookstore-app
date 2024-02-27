import { z } from 'zod';

export const ShipmentSchema = z.object({
  name: z.string().min(6, 'name must be at least 6 characters long'),
  phone: z
    .string()
    .regex(
      new RegExp('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'),
      'enter a valid phone'
    ),
  email: z.string().email('email musrt be a valid email'),
  adress: z.string().min(2, 'city must be at least 2 characters long'),
});

export type ShipmentFormData = z.infer<typeof ShipmentSchema>;

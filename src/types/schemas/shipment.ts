import { cartStore } from '@/store/CartStore';
import { z } from 'zod';

// phone: z
// .string()
// .regex(
//   new RegExp('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'),
//   'enter a valid phone'
// ).optional(),
// adress: z.string().min(2, 'city must be at least 2 characters long').optional(),


// phone: z.string().optional(),
// adress: z.string().optional(),

// phone: z
// .string()
// .regex(
//   new RegExp('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'),
//   'enter a valid phone'
// ).optional().or(z.literal('')),
// adress: z.string().min(2, 'city must be at least 2 characters long').optional().or(z.literal('')),


export const ShipmentSchema = z.object({
  name: z.string().min(6, 'name must be at least 6 characters long').optional(),
phone: z
.string()
.regex(
  new RegExp('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'),
  'enter a valid phone'
).optional(),
adress: z.string().min(2, 'city must be at least 2 characters long').optional(),
  email: z.string().email('email musrt be a valid email'),
})
.refine(
  (data) => {
console.log('cart has physical items .. ', cartStore.hasPhysicalGoods)
console.log('name from form input .. ', data.name)
console.log('name and physical goods ...', cartStore.hasPhysicalGoods && !!data.name)

console.log('test parse phone ...', z
.string()
.regex(
  new RegExp('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'),
  'enter a valid phone'
).optional().safeParse(''))


  // return cartStore.hasPhysicalGoods && !!data.name
  return true

  }, {
    message: 'name field is required for physical goods',
    path: ['name']
  }
)
;

export type ShipmentFormData = z.infer<typeof ShipmentSchema>;

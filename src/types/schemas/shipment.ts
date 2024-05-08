import { cartStore } from '@/store/CartStore';
import { z } from 'zod';

// cхема условной валидации с zod. Обязательное поле только email, но если в корзине есть
// физические товары (печатные книги или книги 2.0), то валидируются также адрес, телефон и имя

export const ShipmentSchema = z
  .object({
    name: z.string().optional(),
    phone: z
      .string()
      .min(
        6,
        'phone field with at least 6 digits is required for physical goods'
      ),
    adress: z.string().optional(),
    email: z.string().email('email musrt be a valid email'),
  })
  // .refine(
  //   (data) => {
  //     return z
  //       .string()
  //       .regex(
  //         new RegExp('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$')
  //       )
  //       .optional()
  //       .safeParse(data.phone).success;
  //   },
  //   {
  //     message: 'phone field is required for physical goods',
  //     path: ['phone'],
  //   }
  // )
  .refine(
    (data) => {
      if (cartStore.hasPhysicalGoods) {
        return z.string().min(2).safeParse(data.name).success;
      } else return true;
    },
    {
      message: 'name must be at least 2 characters long',
      path: ['name'],
    }
  )
  .refine(
    (data) => {
      if (cartStore.hasPhysicalGoods) {
        return z.string().min(6).safeParse(data.adress).success;
      } else return true;
    },
    {
      message: 'adress must be at least 6 characters long',
      path: ['adress'],
    }
  );

export type ShipmentFormData = z.infer<typeof ShipmentSchema>;

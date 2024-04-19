import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ProductArrayType, PromosType } from 'pages/dashboard/promocodes';
import slugify from 'slugify';
import { Database } from 'api/books/types';
import { DateTimePicker } from '../ui/datetime-picker';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DeleteDialog from './DeleteDialog';

type categoryType = Database['public']['Enums']['category'];
type promoTypeType = Database['public']['Enums']['promotype'];
type promoInsertType = Database['public']['Tables']['Promocodes']['Insert'];
type promoRowType = Database['public']['Tables']['Promocodes']['Row'];

type PromoFormProps = {
  categories: string[];
  types: string[];
  prods: ProductArrayType;
};

type PromoEditFormProps = {
  categories: string[];
  types: string[];
  prods: ProductArrayType;
  promo: promoRowType;
};

function PromoForm({ categories, types, prods }: PromoFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const typeSchema = z.enum(types as [string, ...string[]]);
  const categorySchema = z.enum(categories as [string, ...string[]]).optional();

  const router = useRouter();

  const formSchema = z
    .object({
      code: z.string().min(3, {
        message: 'Code must be at least 3 characters long.',
      }),
      discount: z.number().gte(1, 'promo discount must be at least 1%'),
      type: typeSchema,
      product_name: z
        .string()
        .min(3, {
          message: 'Product name must be at least 3 characters long',
        })
        .optional(),
      product_type: categorySchema,
      start_date: z
        .date({
          description: 'promo start date',
        })
        .nullable(),
      end_date: z
        .date({
          description: 'promo end date',
        })
        .nullable(),
    })
    .refine(
      (value) => {
        return value.type === 'item' ? Boolean(value.product_type) : true;
      },
      {
        message: 'if type is `item` product type must pe provided',
        path: ['product_type'],
      }
    )
    .refine(
      (value) => {
        return value.type === 'item' ? Boolean(value.product_name) : true;
      },
      {
        message: 'if type is `item` product name  must pe provided',
        path: ['product_name'],
      }
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: 'AAA',
      discount: 5,
      product_name: undefined,
      product_type: undefined,
      type: 'cart',
      start_date: new Date(),
      end_date: new Date(),
    },
  });

  const { register, handleSubmit, formState, watch } = form;
  const promoTypeValue = watch('type');
  const prodNameValue = watch('product_name');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const productName = values.type === 'item' ? values.product_name : null;
    const productType = values.type === 'item' ? values.product_type : null;

    const { data, error } = await supabase
      .from('Promocodes')
      .insert({
        code: values.code.toLocaleUpperCase(),
        discount: values.discount,
        type: values.type as promoTypeType,
        product_name: productName,
        product_type: productType as categoryType,
        start_date: values.start_date?.toISOString(),
        end_date: values.end_date?.toISOString(),
      })
      .select()
      .single();

    data && console.log('promo code added data...', data);

    error && console.log('promo code add error...', error.message);
    router.reload();
  }

  return (
    <div className=''>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4 w-full'
        >
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Promo Code</FormLabel>
                <FormControl>
                  <Input placeholder='promo code combination' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='discount'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Discount, %</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Promo Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select promo type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          {promoTypeValue === 'item' && (
            <div>
              <FormField
                control={form.control}
                name='product_name'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>product name</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select promo type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prods.map((prod) => (
                          <SelectItem key={prod.name} value={prod.name}>
                            {prod.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='product_type'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>Product type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select product type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prods.map((prod) => {
                          if (prod.name === prodNameValue) {
                            const pTypes = prod.types.map((type) => {
                              return (
                                <SelectItem key={type} value={type || 'i'}>
                                  {type}
                                </SelectItem>
                              );
                            });
                            return pTypes;
                          }
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name='start_date'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel htmlFor='start_date'>start date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('start_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                    ariaLabel='start_date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='end_date'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel htmlFor='end_date'>end date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('end_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                    ariaLabel='end_date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-48'
          >
            Добавить
          </Button>
        </form>
      </Form>
    </div>
  );
}

function PromoEditForm({
  categories,
  types,
  prods,
  promo,
}: PromoEditFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const typeSchema = z.enum(types as [string, ...string[]]);
  const categorySchema = z.enum(categories as [string, ...string[]]).optional();

  const router = useRouter();

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Promocodes')
      .select('*')
      .eq('id', promo.id)
      .single();

    data && console.log('data from req is...', data);

    data && data.code && form.setValue('code', data.code);
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const formSchema = z
    .object({
      code: z.string().min(3, {
        message: 'Code must be at least 3 characters long.',
      }),
      discount: z.number().gte(1, 'promo discount must be at least 1%'),
      type: typeSchema,
      product_name: z
        .string()
        .min(3, {
          message: 'Product name must be at least 3 characters long',
        })
        .optional(),
      product_type: categorySchema,
      start_date: z
        .date({
          description: 'promo start date',
        })
        .nullable(),
      end_date: z
        .date({
          description: 'promo end date',
        })
        .nullable(),
    })
    .refine(
      (value) => {
        return value.type === 'item' ? Boolean(value.product_type) : true;
      },
      {
        message: 'if type is `item` product type must pe provided',
        path: ['product_type'],
      }
    )
    .refine(
      (value) => {
        return value.type === 'item' ? Boolean(value.product_name) : true;
      },
      {
        message: 'if type is `item` product name  must pe provided',
        path: ['product_name'],
      }
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: promo.code,
      discount: promo.discount || undefined,
      product_name: promo.product_name || undefined,
      product_type: promo.product_type || undefined,
      type: promo.type || 'cart',
      start_date: (promo.start_date && new Date(promo.start_date)) || undefined,
      end_date: (promo.end_date && new Date(promo.end_date)) || undefined,
    },
  });

  const { register, handleSubmit, formState, watch } = form;
  const promoTypeValue = watch('type');
  const prodNameValue = watch('product_name');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const productName = values.type === 'item' ? values.product_name : null;
    const productType = values.type === 'item' ? values.product_type : null;

    const { data, error } = await supabase
      .from('Promocodes')
      .update({
        code: values.code.toLocaleUpperCase(),
        discount: values.discount,
        type: values.type as promoTypeType,
        product_name: productName,
        product_type: productType as categoryType,
        start_date: values.start_date?.toISOString(),
        end_date: values.end_date?.toISOString(),
      })
      .eq('id', promo.id)
      .select()
      .single();

    data && console.log('promo code edit data...', data);

    data && window.alert(`Промокод ${data.code} успешно изменён`);

    error && console.log('promo code edit error...', error.message);
    router.reload();
  }

  return (
    <div className=''>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4 w-full'
        >
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Promo Code</FormLabel>
                <FormControl>
                  <Input placeholder='promo code combination' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='discount'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Discount, %</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Promo Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select promo type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          {promoTypeValue === 'item' && (
            <div>
              <FormField
                control={form.control}
                name='product_name'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>product name</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select promo type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prods.map((prod) => (
                          <SelectItem key={prod.name} value={prod.name}>
                            {prod.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='product_type'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>Product type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select product type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prods.map((prod) => {
                          if (prod.name === prodNameValue) {
                            const pTypes = prod.types.map((type) => {
                              return (
                                <SelectItem key={type} value={type || 'i'}>
                                  {type}
                                </SelectItem>
                              );
                            });
                            return pTypes;
                          }
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name='start_date'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel htmlFor='start_date'>start date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('start_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                    ariaLabel='start_date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='end_date'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel htmlFor='end_date'>end date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('end_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                    ariaLabel='end_date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex flex-row gap-4 justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>

            <DeleteDialog deleteFunction={deletePromo} itemID={promo.id} />
          </div>
        </form>
      </Form>
    </div>
  );
}

const deletePromo = async (promoID: number) => {
  let success = false;

  const { error } = await supabase
    .from('Promocodes')
    .delete()
    .eq('id', promoID);

  error && window.alert(error.message);
  !error &&
    (success = true) &&
    window.alert(`Промокод номер ${promoID} успешно удалён`);

  return success;
};

export { PromoForm, PromoEditForm };

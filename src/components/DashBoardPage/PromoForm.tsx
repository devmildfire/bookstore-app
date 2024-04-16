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

type categoryType = Database['public']['Enums']['category'];
type promoTypeType = Database['public']['Enums']['promotype'];

// export const categorySchema = z.union([z.any(), z.string()]);

// export const typeSchema = z.union([z.any(), z.string()]);

// const formSchema = z.object({
//   code: z.string().min(3, {
//     message: 'Code must be at least 3 characters long.',
//   }),
//   discount: z.number().gte(1, 'promo discount must be at least 1%'),
//   product_name: z.string().min(3, {
//     message: 'Product name must be at least 3 characters long',
//   }),
//   product_type: categorySchema,
//   type: typeSchema,
// });

// const formEditSchema = z.object({
//   picture: z.any().optional(),
//   title: z.string().min(3, {
//     message: 'Award must be least 3 characters.',
//   }),
// });

type PromoFormProps = {
  categories: string[];
  types: string[];
  prods: ProductArrayType;
};

function PromoForm({ categories, types, prods }: PromoFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const typeSchema = z.enum(types as [string, ...string[]]);
  const categorySchema = z.enum(categories as [string, ...string[]]);

  const formSchema = z.object({
    code: z.string().min(3, {
      message: 'Code must be at least 3 characters long.',
    }),
    discount: z.number().gte(1, 'promo discount must be at least 1%'),
    product_name: z.string().min(3, {
      message: 'Product name must be at least 3 characters long',
    }),
    product_type: categorySchema,
    type: typeSchema,
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
  });

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

    // const photoUpload = await supabase.storage
    //   .from('awards')
    //   .upload(`award_${values.title}`, values.picture, {
    //     cacheControl: '3600',
    //     upsert: true,
    //   });

    // const publicUrl = supabase.storage
    //   .from('awards')
    //   .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    // const { data, error } = await supabase
    //   .from('Awards')
    //   .insert({
    //     title: values.title,
    //     source: publicUrl,
    //   })
    //   .select('*')
    //   .single();

    // error && window.alert(error.message);
    // data && window.alert(`${data.title} успешно добавлена к наградам`);
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
              <FormItem>
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
                  <FormItem>
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
                        {/* {prods.findIndex((val) => val.name === prodNameValue)} */}
                        {prods[
                          prods.findIndex((val) => val.name === prodNameValue)
                        ].types.map((type) => (
                          <SelectItem key={type} value={type || 'i'}>
                            {type}
                          </SelectItem>
                        ))}
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
              <FormItem>
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
              <FormItem>
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

// function AwardEditForm(award: AwardsType) {
//   const [newPhoto, setNewPhoto] = useState<string>();

//   const photoImage = useRef<HTMLImageElement | null>(null);

//   async function getDataFromReq() {
//     const { data } = await supabase
//       .from('Awards')
//       .select('*')
//       .eq('id', award.id)
//       .single();

//     data && console.log('data from req is...', data);

//     data &&
//       (data.source && setNewPhoto(data.source),
//       data.title && form.setValue('title', data.title));
//   }

//   useEffect(() => {
//     getDataFromReq();
//   }, []);

//   const router = useRouter();

//   const form = useForm<z.infer<typeof formEditSchema>>({
//     resolver: zodResolver(formEditSchema),
//     defaultValues: {
//       title: award.title ? award.title : undefined,
//     },
//   });

//   async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
//     console.log('values ... ', values);

//     let imagePath = null;
//     let publicUrl = null;

//     if (award.source && values.picture) {
//       console.log('current award picture ... ', award.source);

//       const imageNameString = award.source.split('/');

//       console.log('image Name String ... ', imageNameString);

//       console.log('selected photo file ... ', values.picture);

//       const photoRemove = await supabase.storage
//         .from('awards')
//         .remove([imageNameString.slice(-1)[0]]);

//       photoRemove.error &&
//         console.log('photo Remove error ... ', photoRemove.error.message);

//       photoRemove.data &&
//         console.log('photo Remove data... ', photoRemove.data);

//       const fileName = values.title ? slugify(values.title) : 'failNameString';
//       console.log('photo is...', values.picture);
//       console.log('photo name is...', values.picture?.name);

//       const photoUdate = await supabase.storage
//         .from('awards')
//         .upload(`award_${fileName}`, values.picture, {
//           cacheControl: '3600',
//           upsert: true,
//         });

//       photoUdate.error &&
//         console.log('photo update error ... ', photoUdate.error.message);

//       imagePath = photoUdate.data?.path;
//       console.log('image path ... ', imagePath);
//     }

//     if (award.source && !values.picture) {
//       imagePath = award.source;
//       publicUrl = award.source;
//     }

//     !publicUrl &&
//       imagePath &&
//       (publicUrl = supabase.storage.from('awards').getPublicUrl(imagePath)
//         .data.publicUrl);

//     console.log('public URL is ...', publicUrl);

//     const { data, error } = await supabase
//       .from('Awards')
//       .update({
//         source: publicUrl,
//       })
//       .eq('id', award.id)
//       .select('*')
//       .single();

//     error && window.alert(error.message);
//     data && window.alert(`награда ${data.title} успешно обновлена`);
//     data && router.reload();
//   }

//   async function onImageInputChange(event: ChangeEvent<HTMLInputElement>) {
//     const imageInput = event.target;
//     const pImage = photoImage.current;

//     if (imageInput.files) {
//       const file = imageInput.files[0];
//       if (file) {
//         pImage && (pImage.src = URL.createObjectURL(file));
//       }
//     }
//   }

//   return (
//     <div className=''>
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onEditSubmit)}
//           className='space-y-4 w-full'
//         >
//           <FormField
//             control={form.control}
//             name='picture'
//             render={({ field: { value, onChange, ...fieldProps } }) => (
//               <FormItem className='flex flex-col items-start p-1'>
//                 <FormLabel>Award Picture</FormLabel>
//                 <FormControl>
//                   <Input
//                     aria-label={'author photo'}
//                     id='photo'
//                     type='file'
//                     {...fieldProps}
//                     onChange={(event) => {
//                       onImageInputChange(event);
//                       return onChange(
//                         event.target.files && event.target.files[0]
//                       );
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//                 <img
//                   className='max-w-72'
//                   ref={photoImage}
//                   src={newPhoto || award.source || ''}
//                   alt='photo image'
//                 />
//               </FormItem>
//             )}
//           />

//           <Button
//             type='submit'
//             variant={'outline'}
//             size={'default'}
//             className='w-full max-w-48'
//           >
//             Обновить
//           </Button>
//         </form>
//       </Form>
//     </div>
//   );
// }

export {
  PromoForm,
  //  AwardEditForm
};

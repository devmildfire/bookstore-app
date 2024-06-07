import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { Textarea } from '../ui/textarea';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AuthorsType } from 'pages/dashboard/authors';
import { DateTimePicker } from '../ui/datetime-picker';
import { Checkbox } from '../ui/checkbox';
import slugify from 'slugify';
import { allEnums } from '@/utils/allEnums';
import { category } from '@/utils/EnumStrings/category';
import { titlesStore } from '@/store/locals/dashboard/TitlesStore/TitlesStore';
import { BookProductType } from 'pages/dashboard/boxsets';
import { Database } from 'api/books/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; //  5MB

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const imageSchema = z
  .instanceof(File, { message: 'Image is required.' })
  .refine((file) => file?.size <= MAX_IMAGE_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
    '.jpg, .jpeg, .png and .webp files are accepted.'
  );

const imageOptionalSchema = z
  .instanceof(File, { message: 'Image is required.' })
  .optional()
  .refine(
    (file) => !file || file?.size <= MAX_IMAGE_FILE_SIZE,
    `Max file size is 5MB.`
  )
  .refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
    '.jpg, .jpeg, .png and .webp files are accepted.'
  );

export const zCategoryType = z.enum(category);

// const productFullSchema = z.object({
//   type: zCategoryType.optional(),
//   title_id: z.number().int().positive().optional(),
// });

const productSchema = z.object({
  productNumber: z.number().int().positive().optional(),
});

const productSetSchema = z.array(productSchema);

type ProductArrayType = z.infer<typeof productSetSchema>;
type ProductInsertType =
  Database['public']['Tables']['BoxSets_Books']['Insert'];

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Box Set name must be at least 3 characters long.',
  }),
  description: z.string().min(6, {
    message: 'Box Set description must be at least 6 characters long.',
  }),
  picture: imageSchema,
  price: z.number().int().positive(),
  discount: z.number().int().positive().min(0).max(100).default(0),
  products: productSetSchema,
});

const formEditSchema = z.object({
  description: z.string().min(6, {
    message: 'Box Set description must be at least 6 characters long.',
  }),
  picture: imageOptionalSchema,
  price: z.number().int().positive(),
  discount: z.number().int().positive().min(0).max(100).default(0),
  products: productSetSchema,
});

type boxSetFormProps = {
  products: BookProductType[];
};

function BoxSetForm({ products }: boxSetFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const router = useRouter();

  const deleteStoredProducts = async (boxSetID: number) => {
    let succes = true;

    const deleteData = await supabase
      .from('BoxSets_Books')
      .delete()
      .eq('box_set', boxSetID);

    deleteData.error && (succes = false);

    return succes;
  };

  const setProductsData = async (boxSetID: number, prods: ProductArrayType) => {
    if (prods.length > 0) {
      console.log('products to add are ... ', prods);

      const productsValues: ProductInsertType[] = [];

      prods.forEach((prod) => {
        if (!prod.productNumber) return;

        const prodType = products[prod.productNumber].type;
        const prodTitleID = products[prod.productNumber].title_id;

        productsValues.push({
          box_set: boxSetID,
          category: prodType,
          title_id: prodTitleID,
        });
      });

      const productsData = await supabase
        .from('BoxSets_Books')
        .insert(productsValues)
        .select('*');

      console.log('products data is ... ', productsData);

      productsData.data &&
        window.alert(
          `Товары бокс сета ${productsData.data[0].box_set} успешно добавлены`
        );
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      picture: undefined,
      price: undefined,
      description: '',
      discount: 0,
      products: [
        {
          // type: undefined,
          // title_id: undefined,
          productNumber: undefined,
        },
      ],
    },
  });

  // Get properties from react hook form
  const {
    control,
    // handleSubmit,
  } = form;

  // Create dynamic forms
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const pictureUpload = await supabase.storage
      .from('boxsets')
      .upload(`boxset_${slugify(values.name)}`, values.picture, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('boxsets')
      .getPublicUrl(`${pictureUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('BoxSets')
      .insert({
        name: values.name,
        picture: publicUrl,
        description: values.description,
        price: values.price,
        discount: values.discount,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен к бокс сетам`);

    if (data) {
      const uploadProducts = await setProductsData(data.id, values.products);
    }

    data && router.reload();
  }

  async function onImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const imageInput = event.target;
    const pImage = photoImage.current;

    if (imageInput.files) {
      const file = imageInput.files[0];
      if (file) {
        pImage && (pImage.src = URL.createObjectURL(file));
      }
    }
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
            name='name'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Name</FormLabel>
                <FormControl>
                  <Input placeholder='somebody' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Box Set Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='picture'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Box Set Picture</FormLabel>
                <FormControl>
                  <Input
                    id='photo'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      onImageInputChange(event);
                      return onChange(
                        event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
                <img
                  className='max-w-72'
                  ref={photoImage}
                  src=''
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <div className='flex flex-col gap-4'>
            Box Set Products
            {fields.map((item, index) => {
              // console.log('fields are ... ', fields);

              return (
                <div
                  className='flex flex-row gap-4'
                  key={`productsKey.${item.id}`}
                >
                  <FormField
                    control={form.control}
                    name={`products.${index}.productNumber`}
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className='min-w-36'>
                        <FormLabel>Product Title</FormLabel>
                        <Select
                          onValueChange={onChange}
                          defaultValue={value?.toString() || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select title' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product, prodIndex) => (
                              <SelectItem
                                key={
                                  product.title_name +
                                  prodIndex +
                                  product.type +
                                  index
                                }
                                // value={prodIndex.toString()}
                                value={prodIndex.toString()}
                              >
                                {product.title_name} - {product.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                    control={form.control}
                    name={`products.${index}.type`}
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className='min-w-36'>
                        <FormLabel>Product Type</FormLabel>
                        <Select onValueChange={onChange} defaultValue={value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem
                                key={product.title_id + index}
                                value={product.type}
                              >
                                {product.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  <Button
                    color='failure'
                    type='button'
                    onClick={() => {
                      console.log('removing input index ... ', index);
                      remove(index);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              );
            })}
            <Button
              type='button'
              size={'default'}
              className='w-full max-w-48'
              onClick={() => {
                // append({
                //   title_id: 1,
                //   type: 'EBook',
                // });
                append({
                  // title_id: undefined,
                  // type: undefined,
                  productNumber: undefined,
                });
              }}
            >
              Добавить продукт
            </Button>
          </div>
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

// const getInitContactsArray = async (authorID: number) => {
//   const contactsData = await supabase
//     .from('AuthorsContacts')
//     .select('*')
//     .eq('author_id', authorID)
//     .order('id', { ascending: true });

//   contactsData && console.log('initial contacts data', contactsData.data);
//   const contactsNumber = contactsData.data?.length || 1;

//   const contactsInitArray = [];

//   for (let i = 0; i < contactsNumber; i++) {
//     contactsData.data &&
//       contactsData.data.length &&
//       contactsData.data[i].contact &&
//       contactsInitArray.push({
//         type: contactsData.data[i].type,
//         contact: contactsData.data[i].contact,
//       });
//   }

//   return contactsInitArray;
// };

// function AuthorEditForm(author: AuthorsType) {
//   const [newPhoto, setNewPhoto] = useState<string>();
//   const effectRan = useRef(false);

//   const photoImage = useRef<HTMLImageElement | null>(null);

//   async function getDataFromReq() {
//     const contactsInitArray = await getInitContactsArray(author.id);
//     const contactsNumber = contactsInitArray.length;

//     for (let i = 0; i < contactsNumber; i++) {
//       const contactType = contactsInitArray[i].type;
//       const contactContent = contactsInitArray[i].contact || '';

//       append({ contactType: contactType, contactContent: contactContent });
//     }

//     const { data } = await supabase
//       .from('Authors')
//       .select('*')
//       .eq('id', author.id)
//       .single();

//     data && console.log('data from req is...', data);

//     data &&
//       (data.photo && setNewPhoto(data.photo),
//       data.bio && form.setValue('bio', data.bio),
//       data.city && form.setValue('city', data.city),
//       data.phrase && form.setValue('phrase', data.phrase),
//       data.birth_date && form.setValue('birthDate', new Date(data.birth_date)),
//       data.death_date && form.setValue('deathDate', new Date(data.death_date)));
//   }

//   useEffect(() => {
//     if (!effectRan.current) {
//       getDataFromReq();
//     }
//     return () => {
//       effectRan.current = true;
//     };
//   }, []);

//   const router = useRouter();

//   const form = useForm<z.infer<typeof formEditSchema>>({
//     resolver: zodResolver(formEditSchema),
//     defaultValues: {
//       bio: author.bio ? author.bio : undefined,
//       birthDate: author.birth_date ? new Date(author.birth_date) : undefined,
//       deathDate: author.death_date ? new Date(author.death_date) : undefined,
//       city: author.city ? author.city : undefined,
//       // photo: undefined,
//       phrase: author.phrase ? author.phrase : undefined,
//       nonsalable: author.nonsalable,
//       contacts: [],
//     },
//   });

//   // Get properties from react hook form
//   const {
//     control,
//     // handleSubmit,
//   } = form;

//   // Create dynamic forms
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: 'contacts',
//   });

//   async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
//     console.log('values ... ', values);

//     // if (values.contacts) {
//     deleteStoredContacts(author.id);

//     const uploadContacts = await setContactsData(author.id, values.contacts);
//     // }

//     let imagePath = null;
//     let publicUrl = null;

//     if (author.photo && values.photo) {
//       console.log('current author photo ... ', author.photo);

//       const imageNameString = author.photo.split('/');

//       console.log('image Name String ... ', imageNameString);

//       console.log('selected photo file ... ', values.photo);

//       const photoRemove = await supabase.storage
//         .from('authors')
//         .remove([imageNameString.slice(-1)[0]]);

//       photoRemove.error &&
//         console.log('photo Remove error ... ', photoRemove.error.message);

//       photoRemove.data &&
//         console.log('photo Remove data... ', photoRemove.data);

//       const fileName = values.photo?.name
//         ? values.photo?.name
//         : 'failNameString';
//       console.log('photo is...', values.photo);
//       console.log('photo name is...', values.photo?.name);

//       const photoUdate = await supabase.storage
//         .from('authors')
//         .upload(`author_${slugify(author.name)}`, values.photo, {
//           cacheControl: '3600',
//           upsert: true,
//         });

//       photoUdate.error &&
//         console.log('photo update error ... ', photoUdate.error.message);

//       imagePath = photoUdate.data?.path;
//       console.log('image path ... ', imagePath);
//     }

//     if (!author.photo && values.photo) {
//       const photoUpload = await supabase.storage
//         .from('authors')
//         .upload(`author_${slugify(author.name)}`, values.photo, {
//           cacheControl: '3600',
//           upsert: true,
//         });
//       imagePath = photoUpload.data?.path;
//     }

//     if (author.photo && !values.photo) {
//       imagePath = author.photo;
//       publicUrl = author.photo;
//     }

//     !publicUrl &&
//       imagePath &&
//       (publicUrl = supabase.storage.from('authors').getPublicUrl(imagePath)
//         .data.publicUrl);

//     console.log('public URL is ...', publicUrl);

//     console.log('birth date is ...', values.birthDate);
//     console.log(
//       'birth date to base is ...',
//       values.birthDate ? values.birthDate.toUTCString() : null
//     );

//     const { data, error } = await supabase
//       .from('Authors')
//       .update({
//         birth_date: values.birthDate ? values.birthDate.toUTCString() : null,
//         death_date: values.deathDate ? values.deathDate.toUTCString() : null,
//         phrase: values.phrase,
//         photo: publicUrl,
//         city: values.city,
//         bio: values.bio,
//         nonsalable: values.nonsalable,
//       })
//       .eq('id', author.id)
//       .select('*')
//       .single();

//     error && window.alert(error.message);
//     data && window.alert(`автор ${data.name} успешно обновлён`);
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
//             name='nonsalable'
//             render={({ field }) => (
//               <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
//                 <FormControl>
//                   <Checkbox
//                     className='bg-neutral-800'
//                     checked={field.value}
//                     onCheckedChange={field.onChange}
//                   />
//                 </FormControl>
//                 <div className='space-y-1 leading-none'>
//                   <FormLabel>Непродаваемый автор</FormLabel>
//                 </div>
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='bio'
//             render={({ field }) => (
//               <FormItem className='flex flex-col items-start p-1'>
//                 <FormLabel>Aithor Bio</FormLabel>
//                 <FormControl>
//                   <Textarea
//                     aria-label={'author bio'}
//                     placeholder='Tell us a little bit about yourself'
//                     className='resize-none'
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='birthDate'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel htmlFor='datetime'>birth date</FormLabel>
//                 <FormControl>
//                   <DateTimePicker
//                     jsDate={field.value}
//                     onJsDateChange={field.onChange}
//                     onNull={() => {
//                       form.setValue('birthDate', null);

//                       console.log('on null function call');
//                       console.log('form state is...', form.getValues());
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='deathDate'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel htmlFor='datetime'>death date</FormLabel>
//                 <FormControl>
//                   <DateTimePicker
//                     jsDate={field.value}
//                     onJsDateChange={field.onChange}
//                     showClearButton={true}
//                     onNull={() => {
//                       form.setValue('deathDate', null);

//                       console.log('on null function call');
//                       console.log('form state is...', form.getValues());
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='city'
//             render={({ field }) => (
//               <FormItem className='flex flex-col items-start p-1'>
//                 <FormLabel>Author City</FormLabel>
//                 <FormControl>
//                   <Input
//                     aria-label={'author city'}
//                     placeholder='default city'
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='photo'
//             render={({ field: { value, onChange, ...fieldProps } }) => (
//               <FormItem className='flex flex-col items-start p-1'>
//                 <FormLabel>Author Photo</FormLabel>
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
//                   src={newPhoto || author.photo || ''}
//                   alt='photo image'
//                 />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='phrase'
//             render={({ field }) => (
//               <FormItem className='flex flex-col items-start p-1'>
//                 <FormLabel>Author Phrase</FormLabel>
//                 <FormControl>
//                   <Input
//                     aria-label={'author phrase'}
//                     placeholder='some profound saying'
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <div className='flex flex-col gap-4'>
//             Author Contacts
//             {fields.map((item, index) => {
//               // console.log('fields are ... ', fields);

//               return (
//                 <div
//                   className='flex flex-row gap-4'
//                   key={`contactsKey.${item.id}`}
//                 >
//                   <FormField
//                     control={form.control}
//                     name={`contacts.${index}.contactType`}
//                     render={({ field: { value, onChange, ...fieldProps } }) => (
//                       <FormItem className='min-w-36'>
//                         <FormLabel>Contact Type</FormLabel>
//                         <Select onValueChange={onChange} defaultValue={value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder='Select type' />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {allEnums.contacttypes.map((type) => (
//                               <SelectItem key={type + index} value={type}>
//                                 {type}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>

//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name={`contacts.${index}.contactContent`}
//                     // render={({ field: { value, onChange, ...fieldProps } }) => (
//                     render={({ field }) => (
//                       <FormItem className='flex flex-col flex-grow items-start p-1'>
//                         <FormLabel>Contact Content</FormLabel>
//                         <FormControl>
//                           <div className='flex flex-row gap-4 w-full'>
//                             <Input placeholder='.....' {...field} />

//                             <Button
//                               color='failure'
//                               type='button'
//                               onClick={() => {
//                                 console.log('removing input index ... ', index);
//                                 remove(index);
//                               }}
//                             >
//                               Delete
//                             </Button>
//                           </div>
//                         </FormControl>

//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               );
//             })}
//             <Button
//               type='button'
//               size={'default'}
//               className='w-full max-w-48'
//               onClick={() => {
//                 append({
//                   contactType: 'X',
//                   contactContent: '',
//                 });
//               }}
//             >
//               Добавить конткат
//             </Button>
//           </div>

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
  BoxSetForm,
  //  AuthorEditForm
};

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
import { Textarea } from '../ui/textarea';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AuthorsType } from 'pages/dashboard/authors';
import { DateTimePicker } from '../ui/datetime-picker';
import { PrintedBookType } from 'pages/dashboard/editions';
import { Database } from 'api/books/types';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type coverShadeType = Database['public']['Enums']['covershade'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const formSchema = z.object({
  counter_color: z.string({
    required_error: 'Author must pick a color for his book counter.',
  }),
  extra: z.string().min(6, {
    message: 'Extra info must be at least 6 characters long.',
  }),
  is_published: z.boolean({
    required_error: 'Publication status must be stated.',
  }),
  ISBN: z.string().min(3, {
    message: 'ISBN must be at least 3 characters long.',
  }),
  lit_form: z.string().min(3, {
    message: 'Literature dorm must be at least 3 characters long.',
  }),
  cover: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  pages: z.number().positive('must be positive'),
  discount: z.number().gte(0, 'discount must be 0 or greater'),
  sold: z.number().gte(0, 'sold copies number must be 0 or greater'),

  shade: z.literal('light').or(z.literal('dark')),

  price: z.number().positive('must be positive'),
  publish_date: z
    .date({
      description: 'publist date',
    })
    .nullable()
    .optional(),
  release_date: z
    .date({
      description: 'release date',
    })
    .nullable()
    .optional(),
  bindings: z.string().min(3, {
    message: 'bindings info must be at least 3 characters long.',
  }),
  coverType: z.string().min(3, {
    message: 'cover info must be at least 3 characters long.',
  }),
  illustrations: z.string().min(3, {
    message: 'illustrations info must be at least 3 characters long.',
  }),
  paper: z.string().min(3, {
    message: 'paper info must be at least 3 characters long.',
  }),
  height: z.number().positive('must be positive'),
  width: z.number().positive('must be positive'),
});

// const formEditSchema = z.object({
//   bio: z.string().min(6, {
//     message: 'Author bio must be at least 3 characters long.',
//   }),
//   birthDate: z
//     .date({
//       description: 'Author birth date',
//     })
//     .nullable()
//     .optional(),
//   deathDate: z
//     .date({
//       description: 'Author death date',
//     })
//     .nullable()
//     .optional(),
//   city: z.string().min(3, {
//     message: 'Author city must be at least 3 characters long.',
//   }),
//   photo: z.any().optional(),
//   phrase: z.string().min(3, {
//     message: 'phrase must be least 3 characters.',
//   }),
// });

function PrintedBookForm({ titleID }: { titleID: number }) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      counter_color: '#FFFFF',
      extra: 'some text',
      is_published: false,
      ISBN: '1-234-54789-0',
      lit_form: 'Роман',
      pages: 123,
      discount: 0,
      shade: 'light',
      price: 100,
      publish_date: new Date(),
      release_date: new Date(),
      bindings: 'HardCore!',
      coverType: 'DisCover!',
      illustrations: 'Dazzling!',
      paper: 'Two Ply',
      height: 42,
      width: 42,
      sold: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const photoUpload = await supabase.storage
      .from('covers')
      .upload(`public/cover_${values.cover.name}`, values.cover, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('covers')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    async function setCoverData(coverUrl: string, printedBookID: number) {
        // const cover = filePath;
    
        const { data, error } = await supabase
          .from("PrintedCover")
          .insert({
            PrintedBookID: printedBookID,
            source: coverUrl,
            shade: "light",
            blurHash: "NoHash",
          })
          .select("*")
          .single();
    
        console.log("cover data ... ", data);
        console.log("cover data ... ", JSON.stringify(data, null, 2));
        console.log("cover error ... ", error);
    
        const cover_ID = data ? data.id : null;
    
        console.log("printed Book ID ... ", cover_ID);
    
        return cover_ID;
      }

    const setPrintedData = async () => {

      const newPrintedBook = await supabase
      .from('PrintedBooks')
      .insert({
        title_id: titleID,
        counter_color: values.counter_color,
        extra: values.extra,
        is_published: values.is_published,
        ISBN: values.ISBN,
        lit_form: values.lit_form,
        pages: values.pages,
        price: values.price,
        discount: values.discount,
        publish_date: values.publish_date?.toISOString(),
        release_date: values.release_date?.toISOString(),
        sold: values.sold,
      })
      .select('*')
      .single();

      newPrintedBook.error && window.alert(newPrintedBook.error.message);
      newPrintedBook.data && window.alert(`${newPrintedBook.data.id} успешно добавлен к печатным книгам`);

      if (newPrintedBook.data) {

        return newPrintedBook.data.id

      } else {
        return null
      }
 
    }

    async function setPrintOptionsData( printedBookID: number) {
      const bindings = values.bindings;
      const coverType = values.coverType;
      const paper = values.paper;
      const illustrations = values.illustrations;
  
      const { data, error } = await supabase
        .from("PrintOptions")
        .insert({
          bindings: bindings,
          cover: coverType,
          paper: paper,
          illustrations: illustrations,
          PrintedBookID: printedBookID,
        })
        .select("*")
        .single();
  
      console.log("print options data ... ", data);
      console.log("print options data ... ", JSON.stringify(data, null, 2));
      console.log("print options error ... ", error);
  
      const printOptionsID = data ? data.id : null;
  
      console.log("print Options ID ... ", printOptionsID);
  
      return printOptionsID;
    }

    async function setPrintSizeData( printOptionsID: number) {
      const width = values.width;
      const height = values.height;
  
      const { data, error } = await supabase
        .from("PrintSize")
        .insert({
          width: width,
          height: height,
          PrintOptionsID: printOptionsID,
        })
        .select("*")
        .single();
  
      console.log("print size data ... ", data);
      console.log("print size data ... ", JSON.stringify(data, null, 2));
      console.log("print size error ... ", error);
  
      const printSizeID = data ? data.id : "no ID for me";
  
      console.log("print Size ID ... ", printSizeID);
  
      return printSizeID;
    }

    // let printOptionsID = null


    const bookID = await setPrintedData();
    console.log('new book ID is ...', bookID)


    if (bookID) {
      const printOptionsID = await setPrintOptionsData(bookID);
      console.log('new printed book options ID is ...', printOptionsID);
      const coverID = await setCoverData(publicUrl, bookID);
      console.log('new book COVER options ID is ...', coverID);

      if (printOptionsID) {
        const printSizeOptionsID = await setPrintSizeData(printOptionsID)
        console.log('new printed book SIZE options ID is ...', printSizeOptionsID)
      }
    } 

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
            name='counter_color'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Counter Color</FormLabel>
                <FormControl>
                  <Input type='color' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='ISBN'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>ISBN</FormLabel>
                <FormControl>
                  <Textarea
                    // placeholder='Tell us a little bit about yourself'
                    // className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='publish_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>publish date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('publish_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='release_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>release date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    showClearButton={true}
                    onNull={() => {
                      form.setValue('release_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lit_form'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Literature Form</FormLabel>
                <FormControl>
                  <Input placeholder='Повесть' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='pages'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Pages Number</FormLabel>
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
            name='cover'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>book cover</FormLabel>
                <FormControl>
                  <Input
                    id='cover'
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
          <FormField
            control={form.control}
            name='shade'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select cover shade ' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='light'>light</SelectItem>
                    <SelectItem value='dark'>dark</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>price</FormLabel>
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
            name='discount'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>discount</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    max={100}
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
            name='sold'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Number of sold copies</FormLabel>
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
            name='is_published'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    className='bg-neutral-800'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>is published</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='bindings'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Bindings</FormLabel>
                <FormControl>
                  <Input placeholder='HardCore!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='coverType'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Cover Type</FormLabel>
                <FormControl>
                  <Input placeholder='DisCover!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='illustrations'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Illustrations Type</FormLabel>
                <FormControl>
                  <Input placeholder='Dazzling!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='paper'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Paper Type</FormLabel>
                <FormControl>
                  <Input placeholder='Two Ply' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='height'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Height</FormLabel>
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
            name='width'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Width</FormLabel>
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

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-64'
          >
            Добавить Печатную Книгу
          </Button>
        </form>
      </Form>
    </div>
  );
}

// function AuthorEditForm(author: AuthorsType) {
//   const [newPhoto, setNewPhoto] = useState<string>();

//   const photoImage = useRef<HTMLImageElement | null>(null);

//   async function getDataFromReq() {
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
//     getDataFromReq();
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
//     },
//   });

//   async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
//     console.log('values ... ', values);

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
//         .upload(`author_${fileName}`, values.photo, {
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
//         .upload(`author_${values.photo.name}`, values.photo, {
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
  PrintedBookForm,
  // PrintedBookEditForm
};

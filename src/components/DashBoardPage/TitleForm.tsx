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
import { TitleType } from 'pages/dashboard/titles';
import { AuthorsType } from 'pages/dashboard/authors';

import { DateTimePicker } from '../ui/datetime-picker';
import { Checkbox } from '../ui/checkbox';
import slugify from 'slugify';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';

const MAX_VIDEO_FILE_SIZE = 8 * 1024 * 1024; //  8MB
const ACCEPTED_VIDEO_TYPES = [
  'video/x-msvideo',
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/mp2t',
  'video/webm',
  'video/3gpp',
  'video/3gpp2',
];

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const authorsOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const videoSchema = z
  .instanceof(File, { message: 'Image is required.' })
  .optional()
  .refine(
    (file: any) => !file || file?.size <= MAX_VIDEO_FILE_SIZE,
    `Max file size is 5MB.`
  )
  .refine(
    (file: any) => !file || ACCEPTED_VIDEO_TYPES.includes(file?.type),
    'wrong file type'
  );

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

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Title name must be at least 3 characters long.',
  }),
  authors: z.array(authorsOptionSchema).min(1),
  description: z.string().min(6, {
    message: 'Title description must be at least 6 characters long.',
  }),
  thesis: z.string().min(6, {
    message: 'Title thesis must be at least 6 characters long.',
  }),
  trailer: videoSchema,
  first_release: z
    .date({
      description: 'first release date',
    })
    .nullable()
    .optional(),
  age_restriction: z.number().min(0, {
    message: 'Age restriction must be 0 or more',
  }),
  cover: imageSchema,

  is_featured: z.boolean().default(false).optional(),
});

const formEditSchema = z.object({
  description: z.string().min(6, {
    message: 'Title description must be at least 6 characters long.',
  }),
  thesis: z.string().min(6, {
    message: 'Title thesis must be at least 6 characters long.',
  }),
  trailer: videoSchema,
  first_release: z
    .date({
      description: 'first release date',
    })
    .nullable()
    .optional(),
  age_restriction: z.number().min(0, {
    message: 'Age restriction must be 0 or more',
  }),
  cover: imageOptionalSchema,
  is_featured: z.boolean().default(false).optional(),
});

type TitleFormProps = {
  authors: AuthorsType[];
  defaultName: string;
  defaultThesis: string;
  defaultDescription: string;
  defaultAgeRestriction: number;
  defaultFirstRelease: Date;
  defaultIsFeatured: boolean;
};

function TitleForm(props: TitleFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);
  const trailerVideo = useRef<HTMLVideoElement | null>(null);

  const OPTIONS: Option[] = props.authors.map((author) => ({
    label: author.name,
    value: author.id.toString(),
    disable: false,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.defaultName,
      thesis: props.defaultThesis,
      description: props.defaultDescription,

      age_restriction: props.defaultAgeRestriction,
      first_release: props.defaultFirstRelease,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    form.reset({
      description: '',
      thesis: '',
      age_restriction: 0,
      cover: undefined,
      name: '',
      authors: [],
      trailer: undefined,
      first_release: undefined,
      is_featured: false,
    });

    emptyVideoInput();
    emptyCoverInput();

    const coverExtention = values.cover.name.split('.').pop();

    const photoUpload = await supabase.storage
      .from('titles')
      .upload(
        `titles_${slugify(values.name)}.${coverExtention}`,
        values.cover,
        {
          cacheControl: '3600',
          upsert: true,
        }
      );

    const publicUrl = supabase.storage
      .from('titles')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    let videoPublicUrl = null;

    if (values.trailer) {
      const trailerExtention = values.trailer.name.split('.').pop();

      const videoUpload = await supabase.storage
        .from('trailers')
        .upload(
          `trailers_${slugify(values.name)}.${trailerExtention}`,
          values.trailer,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

      videoPublicUrl = supabase.storage
        .from('trailers')
        .getPublicUrl(`${videoUpload.data?.path}`).data.publicUrl;
    }

    const { data, error } = await supabase
      .from('Titles')
      .insert({
        age_restriction: values.age_restriction,
        cover: publicUrl,
        description: values.description,
        is_featured: values.is_featured,
        name: values.name,
        slug: slugify(values.name),
        thesis: values.thesis,
        trailer: values.trailer ? videoPublicUrl : null,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен к тайтлам`);

    if (data) {
      const titlesAuthorsArray = values.authors.map((author) => {
        const authorID = parseInt(author.value);
        const titleID = data?.id;

        return {
          author_id: authorID,
          title_id: titleID,
        };
      });

      const authorsData = await supabase
        .from('Titles_Authors')
        .insert(titlesAuthorsArray)
        .select('*');
      authorsData.error && window.alert(authorsData.error.message);
      authorsData.data &&
        window.alert(`Авторы успешно добавлен к тайтлу ${data.name} `);
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

  async function onVideoInputChange(event: ChangeEvent<HTMLInputElement>) {
    const videoInput = event.target;
    const tVideo = trailerVideo.current;

    if (videoInput.files) {
      const file = videoInput.files[0];
      if (file) {
        tVideo && (tVideo.src = URL.createObjectURL(file));
      }
    }
  }

  const emptyVideoInput = () => {
    form.resetField('trailer');
    const videoInput = document.getElementById('video') as HTMLInputElement;
    videoInput.value = '';
  };

  const emptyCoverInput = () => {
    form.resetField('cover');
    const coverInput = document.getElementById('photo') as HTMLInputElement;
    coverInput.value = '';
    photoImage.current && (photoImage.current.src = '');
  };

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
                <FormLabel>Title Name</FormLabel>
                <FormControl>
                  <Input placeholder='someTitle' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='authors'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authors</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={field.value}
                    onChange={field.onChange}
                    defaultOptions={OPTIONS}
                    placeholder='Select authors for the title...'
                    emptyIndicator={
                      <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
                        no results found.
                      </p>
                    }
                  />
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
                <FormLabel>Title Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='' className='resize-none' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='thesis'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Title Thesis</FormLabel>
                <FormControl>
                  <Textarea placeholder='' className='resize-none' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='first_release'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>first release</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('first_release', null);

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
            name='age_restriction'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Age Restriction</FormLabel>
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
                <FormLabel>Title Cover</FormLabel>
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

          <FormField
            control={form.control}
            name='trailer'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Title Trailer</FormLabel>
                <div className='flex flex-row items-start p-1'>
                  <FormControl>
                    <Input
                      id='video'
                      type='file'
                      {...fieldProps}
                      onChange={(event) => {
                        onVideoInputChange(event);
                        return onChange(
                          event.target.files && event.target.files[0]
                        );
                      }}
                    />
                  </FormControl>
                  <Button
                    type='button'
                    variant={'outline'}
                    onClick={() => {
                      emptyVideoInput();
                    }}
                  >
                    clear
                  </Button>
                </div>
                <FormMessage />

                {/* `max-w-72  ${value &&}` */}

                <video
                  className={value ? 'max-w-72' : 'max-w-72 hidden'}
                  ref={trailerVideo}
                  controls
                  src=''
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_featured'
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
                  <FormLabel>is featured</FormLabel>
                </div>
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

function TitleEditForm(title: TitleType) {
  //   const [newPhoto, setNewPhoto] = useState<string>();
  //   const photoImage = useRef<HTMLImageElement | null>(null);
  async function getDataFromReq() {
    const { data } = await supabase
      .from('Titles')
      .select('*')
      .eq('id', title.id)
      .single();
    data && console.log('data from req is...', data);
    data &&
      (data.description && form.setValue('description', data.description),
      data.thesis && form.setValue('thesis', data.thesis));
    //   data.photo && setNewPhoto(data.photo),
    // data.bio && form.setValue('bio', data.bio),
    // data.city && form.setValue('city', data.city),
    // data.phrase && form.setValue('phrase', data.phrase),
    // data.birth_date && form.setValue('birthDate', new Date(data.birth_date)),
    // data.death_date && form.setValue('deathDate', new Date(data.death_date))
  }
  useEffect(() => {
    getDataFromReq();
  }, []);
  const router = useRouter();
  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      description: title.description || undefined,
      thesis: title.thesis || undefined,
      first_release: title.first_release
        ? new Date(title.first_release)
        : undefined,
      is_featured: title.is_featured !== null ? title.is_featured : undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);
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
  }

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

  return (
    <div className=''>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onEditSubmit)}
          className='space-y-4 w-full'
        >
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Title Description</FormLabel>
                <FormControl>
                  <Textarea
                    aria-label={'titleDescription'}
                    placeholder=''
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
            name='thesis'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Title Thesis</FormLabel>
                <FormControl>
                  <Textarea
                    aria-label={'titleThesis'}
                    placeholder=''
                    className='resize-none'
                    {...field}
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
            Обновить
          </Button>
        </form>
      </Form>
    </div>
  );
}

export { TitleForm, TitleEditForm };

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

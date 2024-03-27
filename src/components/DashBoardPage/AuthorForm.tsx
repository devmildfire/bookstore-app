import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  // FormDescription,
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
// import { useRouter } from 'next/navigation';

import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  ChangeEvent,
  startTransition,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AuthorsType } from 'pages/dashboard/authors';
import revalidateLink from 'api/actions';

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Author name must be at least 3 characters long.',
  }),
  bio: z.string().min(6, {
    message: 'Author bio must be at least 3 characters long.',
  }),
  birthDate: z
    .date({
      description: 'Author birth date',
    })
    .optional(),
  deathDate: z
    .date({
      description: 'Author death date',
    })
    .optional(),
  city: z.string().min(3, {
    message: 'Author city must be at least 3 characters long.',
  }),
  // photo: z.string().min(6, {
  //   message: 'photo link string must be least 6 characters.',
  // }),

  photo: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),

  phrase: z.string().min(3, {
    message: 'phrase must be least 3 characters.',
  }),
});

const formEditSchema = z.object({
  bio: z.string().min(6, {
    message: 'Author bio must be at least 3 characters long.',
  }),
  birthDate: z
    .date({
      description: 'Author birth date',
    })
    .optional(),
  deathDate: z
    .date({
      description: 'Author death date',
    })
    .optional(),
  city: z.string().min(3, {
    message: 'Author city must be at least 3 characters long.',
  }),
  photo: z.any().optional(),
  // .refine(file => file.length == 1 ? ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type) ? true : false : true, 'Invalid file. choose either JPEG or PNG image')
  // .refine(file => file.length == 1 ? file[0]?.size <= MAX_FILE_SIZE ? true : false : true, 'Max file size allowed is 5MB.'),
  phrase: z.string().min(3, {
    message: 'phrase must be least 3 characters.',
  }),
});

// z.instanceof(File, { message: 'Image is required.' }).optional()
// .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
// .refine(
//   (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
//   '.jpg, .jpeg, .png and .webp files are accepted.'
// ),

type AuthorFormProps = {
  defaultName: string;
  defaultBio: string;
  defaultBirthDate: Date;
  defaultDeathDate: Date;
  defaultCity: string;
  // defaultPhoto: File;
  defaultPhrase: string;
};

function AuthorForm(props: AuthorFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.defaultName,
      bio: props.defaultBio,
      // birthDate: props.defaultBirthDate,
      // deathDate: props.defaultDeathDate,
      city: props.defaultCity,
      // photo: '',
      phrase: props.defaultPhrase,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const photoUpload = await supabase.storage
      .from('authors')
      .upload(`author_${values.photo.name}`, values.photo, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('authors')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('Authors')
      .insert({
        name: values.name,
        birth_date: values.birthDate ? values.birthDate.toUTCString() : null,
        death_date: values.deathDate ? values.deathDate.toUTCString() : null,
        phrase: values.phrase,
        photo: publicUrl,
        city: values.city,
        bio: values.bio,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен к авторам`);
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
                {/* <FormDescription>This is your login email.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Aithor Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                {/* <FormDescription>This is your password.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='birthDate'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* <FormDescription>Author date of birth</FormDescription>  */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='deathDate'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Date of death</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {/* <FormDescription>Author date of birth</FormDescription>  */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author City</FormLabel>
                <FormControl>
                  <Input placeholder='default city' {...field} />
                </FormControl>
                {/* <FormDescription>This is your login email.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='photo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Photo</FormLabel>
                <FormControl>
                  {/* <Input placeholder='default photo' type='file' {...field} /> */}
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
                {/* <FormDescription>This is your login email.</FormDescription> */}
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
            name='phrase'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Phrase</FormLabel>
                <FormControl>
                  <Input placeholder='some profound saying' {...field} />
                </FormControl>
                {/* <FormDescription>This is your login email.</FormDescription> */}
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

function AuthorEditForm(author: AuthorsType) {
  const [newPhoto, setNewPhoto] = useState<string>();

  const photoImage = useRef<HTMLImageElement | null>(null);

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Authors')
      .select('*')
      .eq('id', author.id)
      .single();

    data && console.log('data from req is...', data);

    data &&
      (data.photo && setNewPhoto(data.photo),
      data.bio && form.setValue('bio', data.bio),
      data.city && form.setValue('city', data.city),
      data.phrase && form.setValue('phrase', data.phrase),
      data.birth_date && form.setValue('birthDate', new Date(data.birth_date)),
      data.death_date && form.setValue('deathDate', new Date(data.death_date)));
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      bio: author.bio ? author.bio : undefined,
      birthDate: author.birth_date ? new Date(author.birth_date) : undefined,
      deathDate: author.death_date ? new Date(author.death_date) : undefined,
      city: author.city ? author.city : undefined,
      // photo: undefined,
      phrase: author.phrase ? author.phrase : undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);

    let imagePath = null;
    let publicUrl = null;

    if (author.photo && values.photo) {
      console.log('current author photo ... ', author.photo);

      const imageNameString = author.photo.split('/');

      console.log('image Name String ... ', imageNameString);

      console.log('selected photo file ... ', values.photo);

      const photoRemove = await supabase.storage
        .from('authors')
        .remove([imageNameString.slice(-1)[0]]);

      photoRemove.error &&
        console.log('photo Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('photo Remove data... ', photoRemove.data);

      const fileName = values.photo?.name
        ? values.photo?.name
        : 'failNameString';
      console.log('photo is...', values.photo);
      console.log('photo name is...', values.photo?.name);

      const photoUdate = await supabase.storage
        .from('authors')
        .upload(`author_${fileName}`, values.photo, {
          cacheControl: '3600',
          upsert: true,
        });

      photoUdate.error &&
        console.log('photo update error ... ', photoUdate.error.message);

      imagePath = photoUdate.data?.path;
      console.log('image path ... ', imagePath);
    }

    if (!author.photo && values.photo) {
      const photoUpload = await supabase.storage
        .from('authors')
        .upload(`author_${values.photo.name}`, values.photo, {
          cacheControl: '3600',
          upsert: true,
        });
      imagePath = photoUpload.data?.path;
    }

    if (author.photo && !values.photo) {
      imagePath = author.photo;
      publicUrl = author.photo;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('authors').getPublicUrl(imagePath)
        .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const { data, error } = await supabase
      .from('Authors')
      .update({
        birth_date: values.birthDate ? values.birthDate.toUTCString() : null,
        death_date: values.deathDate ? values.deathDate.toUTCString() : null,
        phrase: values.phrase,
        photo: publicUrl,
        city: values.city,
        bio: values.bio,
      })
      .eq('id', author.id)
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`автор ${data.name} успешно обновлён`);
  }

  async function onImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const imageInput = event.target;
    const pImage = photoImage.current;

    if (imageInput.files) {
      const file = imageInput.files[0];
      if (file) {
        pImage && (pImage.src = URL.createObjectURL(file));
        // setNewImage(true);
      }
    }
  }

  return (
    <div className=''>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onEditSubmit)}
          className='space-y-4 w-full'
        >
          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Aithor Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                    // ref={bioRef}
                  />
                </FormControl>
                {/* <FormDescription>This is your password.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='birthDate'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='dark w-auto p-0' align='start'>
                    <Calendar
                      captionLayout='dropdown-buttons'
                      fromYear={1800}
                      toYear={2040}
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                    <div className='w-full flex flex-row justify-center pb-4 px-4'>
                      <Button
                        className='w-full py-4'
                        type='button'
                        onClick={async () => {
                          console.log('setting value ...');

                          const { data, error } = await supabase
                            .from('Authors')
                            .update({
                              birth_date: null,
                            })
                            .eq('id', author.id)
                            .select('*')
                            .single();

                          error && window.alert(error.message);
                          data && router.reload();

                          console.log('set value ...', field.value);
                        }}
                      >
                        {' '}
                        Null{' '}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* <FormDescription>Author date of birth</FormDescription>  */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='deathDate'
            render={({ field }) => (
              <FormItem className='dark flex flex-col items-start p-1'>
                <FormLabel>Date of death</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='dark w-auto p-0' align='start'>
                    <Calendar
                      captionLayout='dropdown-buttons'
                      fromYear={1800}
                      toYear={2040}
                      // fromDate={new Date('1800-01-01')}
                      // toDate={new Date('2030-01-01')}
                      mode='single'
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />

                    <div className='w-full flex flex-row justify-center pb-4 px-4'>
                      <Button
                        className='w-full py-4'
                        type='button'
                        onClick={async () => {
                          console.log('setting value ...');

                          const { data, error } = await supabase
                            .from('Authors')
                            .update({
                              death_date: null,
                            })
                            .eq('id', author.id)
                            .select('*')
                            .single();

                          error && window.alert(error.message);
                          data && router.reload();

                          console.log('set value ...', field.value);
                        }}
                      >
                        {' '}
                        Null{' '}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {/* <FormDescription>Author date of birth</FormDescription>  */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author City</FormLabel>
                <FormControl>
                  <Input
                    placeholder='default city'
                    {...field}
                    // ref={cityRef}
                  />
                </FormControl>
                {/* <FormDescription>This is your login email.</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='photo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Photo</FormLabel>
                <FormControl>
                  {/* <Input placeholder='default photo' type='file' {...field} /> */}
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
                {/* <FormDescription>This is your login email.</FormDescription> */}
                <FormMessage />
                <img
                  className='max-w-72'
                  ref={photoImage}
                  src={newPhoto || author.photo || ''}
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phrase'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Phrase</FormLabel>
                <FormControl>
                  <Input
                    placeholder='some profound saying'
                    {...field}
                    // ref={phraseRef}
                  />
                </FormControl>
                {/* <FormDescription>This is your login email.</FormDescription> */}
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

export { AuthorForm, AuthorEditForm };

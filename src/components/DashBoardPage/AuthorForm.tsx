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
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ChangeEvent, useRef } from 'react';

const MAX_FILE_SIZE = 500000;
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
  birthDate: z.date({
    description: 'Author birth date',
  }),
  deathDate: z.date({
    description: 'Author death date',
  }),
  city: z.string().min(3, {
    message: 'Author city must be at least 3 characters long.',
  }),
  // photo: z.string().min(6, {
  //   message: 'photo link string must be least 6 characters.',
  // }),
  photo: z
    .any()
    .refine((files) => files?.length == 1, 'Image is required.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  phrase: z.string().min(3, {
    message: 'phrase must be least 3 characters.',
  }),
});

type AuthorFormProps = {
  defaultName: string;
  defaultBio: string;
  defaultBirthDate: Date;
  defaultDeathDate: Date;
  defaultCity: string;
  // defaultPhoto: File;
  defaultPhrase: string;
};

export default function AuthorForm(props: AuthorFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.defaultName,
      bio: props.defaultBio,
      birthDate: props.defaultBirthDate,
      deathDate: props.defaultDeathDate,
      city: props.defaultCity,
      // photo: '',
      phrase: props.defaultPhrase,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: values.email,
    //   password: values.password,
    // });
    // console.log(values);
    // console.log('data from login ... ', data);
    // console.log('error from login ...', error);
    // console.log('session data ... ', data.session?.user);
    // error && window.alert(error.message);
    // data.session && router.reload();
  }

  function onImageInputChange(event: ChangeEvent<HTMLInputElement>): void {
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
            render={({ field }) => (
              // render={() => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Photo</FormLabel>
                <FormControl>
                  {/* <Input placeholder='default photo' type='file' {...field} /> */}
                  <Input
                    id='photo'
                    type='file'
                    {...field}
                    onChange={onImageInputChange}
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

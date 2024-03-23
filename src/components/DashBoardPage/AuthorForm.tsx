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
  photo: z.string().min(6, {
    message: 'photo link string must be least 6 characters.',
  }),
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
  defaultPhoto: string;
  defaultPhrase: string;
};

export default function AuthorForm(props: AuthorFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.defaultName,
      bio: props.defaultBio,
      birthDate: props.defaultBirthDate,
      deathDate: props.defaultDeathDate,
      city: props.defaultCity,
      photo: props.defaultPhoto,
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
              <FormItem className='flex flex-col items-start'>
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
              <FormItem className='flex flex-col items-start'>
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
              <FormItem className='flex flex-col'>
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
                <FormDescription>Author date of birth</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full'
          >
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
}

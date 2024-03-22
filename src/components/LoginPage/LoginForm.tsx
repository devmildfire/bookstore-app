import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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

const formSchema = z.object({
  email: z.string().email().min(3, {
    message: 'Username must be a walid email with at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Username must be least 6 characters.',
  }),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'mildfirey@yandex.ru',
      password: '0892387639',
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    console.log(values);
    console.log('data from login ... ', data);
    console.log('error from login ...', error);
    console.log('session data ... ', data.session?.user);

    error && window.alert(error.message);
    data.session && router.reload();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 w-48'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='flex flex-col items-start'>
              <FormLabel>email</FormLabel>
              <FormControl>
                <Input placeholder='email@example.com' {...field} />
              </FormControl>
              {/* <FormDescription>This is your login email.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='flex flex-col items-start'>
              <FormLabel>password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='yourpasswordhere'
                  {...field}
                />
              </FormControl>
              {/* <FormDescription>This is your password.</FormDescription> */}
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
  );
}

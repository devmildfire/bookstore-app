'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email().min(3, {
    message: 'Username must be a walid email with at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Username must be least 6 characters.',
  }),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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

const Login = (): React.ReactElement => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center'>
      {loggedIn ? 'logged in' : <ProfileForm />}
    </div>
  );
};

export default Login;

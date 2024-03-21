'use client';

import { Button } from '@/components/ui/button';
import { FormEvent, useEffect, useState } from 'react';
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
import { Session } from '@supabase/gotrue-js/src/lib/types';
import { UserMetadata } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
// import { checkAdmin } from 'api/actions';

const formSchema = z.object({
  email: z.string().email().min(3, {
    message: 'Username must be a walid email with at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Username must be least 6 characters.',
  }),
});

function LogOut({ session }: { session: Session }) {
  const router = useRouter();
  const [metaData, setMetaData] = useState<UserMetadata>();

  async function userGet() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setMetaData(user?.user_metadata);
  }

  // async function userSet() {
  //   const { data, error } = await supabase.auth.updateUser({
  //     data: { isAdmin: true },
  //   });

  //   data && console.log('metadata update success!');
  //   error && console.log('metadata update failed!');
  // }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { error } = await supabase.auth.signOut();

    console.log('Logging out ...  ', error);

    router.reload();
  }

  useEffect(() => {
    // userSet();
    userGet();
  }, []);

  // useEffect(() => {
  //   metaData?.isAdmin && router.push('/dashboard');
  // }, [metaData, router]);

  return (
    <div className='space-y-4 w-48'>
      <div>currently logged in as {session.user.email}</div>

      {/* {checkAdmin(session.user.id) && ( */}
      {metaData?.isAdmin && <div>you have admin access and can do stuff</div>}

      <form onSubmit={handleSubmit}>
        <Button
          type='submit'
          variant={'outline'}
          size={'default'}
          className='w-full'
        >
          Log Out
        </Button>
      </form>
    </div>
  );
}

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

const Login = (): React.ReactElement => {
  const [session, setSession] = useState<Session>();
  const router = useRouter();

  const get_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        // setUser(data.session.user);
        data.session?.user.user_metadata.isAdmin && router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    get_session();
  });

  return (
    <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center'>
      {session ? <LogOut session={session} /> : <LoginForm />}
    </div>
  );
};

export default Login;

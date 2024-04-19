import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AdminStore } from '@/store/locals';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField } from '@/components/ui/form';
import { useLocalStore } from '@/store/hooks';
import { observer } from 'mobx-react-lite';
import { FormInput } from '@/components/Dashboard/pages/components/form';

const formSchema = z.object({
  email: z.string().email().min(3, {
    message: 'Username must be a walid email with at least 3 characters.',
  }),
  password: z.string().min(6, {
    message: 'Username must be least 6 characters.',
  }),
});

const AdminLogin = () => {
  const adminStore = useLocalStore(() => new AdminStore());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'mildfirey@yandex.ru',
      password: '0892387639',
    },
  });

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-muted/5'>
      <Card className='w-full max-w-sm'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(adminStore.login)}>
            <CardHeader>
              <CardTitle className='text-2xl'>Вход</CardTitle>
              <CardDescription>
                Введите ваш email и пароль для входа
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4'>
              <FormField
                name='email'
                control={form.control}
                render={({ field }) => (
                  <FormInput
                    label='Email'
                    placeholder='email@example.com'
                    {...field}
                  />
                )}
              />
              <FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <FormInput label='Пароль' type='password' {...field} />
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                isLoading={adminStore.isLoading}
                type='submit'
                className='w-full'
              >
                Войти
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default observer(AdminLogin);

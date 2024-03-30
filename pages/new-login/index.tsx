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
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminStore } from '@/store/locals';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useLocalStore } from '@/store/hooks';
import { observer } from 'mobx-react-lite';

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
    <DashboardLayout>
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
                render={({ field }) => {
                  return (
                    <FormItem className='grid gap-2'>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='email@example.com' {...field} />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                name='password'
                control={form.control}
                render={({ field }) => (
                  <FormItem className='grid gap-2'>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>
                  </FormItem>
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
    </DashboardLayout>
  );
};

export default observer(AdminLogin);

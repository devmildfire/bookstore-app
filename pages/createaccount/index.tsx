// import Hal9000 from '@/assets/images/HAL9000.svg';
import HallIcon from '@/assets/images/HAL9000_iconic_eye.svg';
import HalLogo from '@/assets/images/HALLOGO.svg';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/Common/Text/Text';
import PageLayout from '@/layouts/PageLayout';
import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';
import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';

import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const accountFormSchema = z
  .object({
    email: z.string().email().min(3, {
      message: 'без электронной почты нельзя, Дэйв',
    }),
    password: z.string().min(6, {
      message: 'password name must be at least 6 characters long.',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // path of error
  });

const HallDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10vw;

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const HalLogoStyled = styled(HalLogo)`
  width: 100%;
  /* max-width: 404px; */
  max-width: 200px;
  /* padding-bottom: 90px; */
  padding-bottom: 5px;

  @media ${breakPoints.lg} {
    /* padding-bottom: 70px; */
    /* padding-bottom: 10px; */
  }

  @media ${breakPoints.md} {
    /* padding-bottom: 20px; */
    /* padding-bottom: 10px; */
    /* max-width: 204px; */
    max-width: 122px;
  }
`;

const HallIconStyled = styled(HallIcon)`
  width: 100%;
  /* max-width: 550px; */
  max-width: 240px;

  @media ${breakPoints.md} {
    /* max-width: 250px; */
    max-width: 150px;
  }
`;

const Hall = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      // title: props.defaultTitle,
    },
  });

  async function onSubmit(values: z.infer<typeof accountFormSchema>) {
    console.log(values);

    const success = await createUser(values.email, values.password);

    // success && router.push('/login');
    success &&
      window.alert(
        `Успех! Письмо со ссылкой-подтверждением придёт на почту ${values.email}`
      );
  }

  const createUser = async (email: string, pass: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: pass,
    });

    if (data.user) {
      return true;
    }

    return false;
  };

  return (
    <PageLayout headTitle='Страница не найдена'>
      <HallDiv>
        {/* <HallIcon as={Hal9000} /> */}
        <HallIconStyled />
        <HalLogoStyled />
        <Text variant='h2_1_HAL' align='center'>
          Привет, Дэйв,
          {/* I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that */}
        </Text>
        <Text variant='h2_1_HAL' align='center'>
          нужны твои e-mail и пароль
          {/* I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that */}
        </Text>

        <div className='my-8 '>
          <Form {...form}>
            <form
              className='space-y-4 w-full flex flex-col items-center align-middle'
              onSubmit={form.handleSubmit(onSubmit)}
            >
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
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>password</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>confirm password</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
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
                зарегистрироваться
              </Button>
            </form>
          </Form>
        </div>

        {/* <form>
          <input ref={inputRef} type='text' />
          <Button
            onClick={() => {
              changeUserPassword();
            }}
          >
            {' '}
            вот такой{' '}
          </Button>
        </form> */}
      </HallDiv>
    </PageLayout>
  );
};

export default Hall;

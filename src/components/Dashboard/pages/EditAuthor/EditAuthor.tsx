import * as React from 'react';

import { ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useRouter } from 'next/navigation';

import { AuthorForm } from './AuthorForm';
import { AuthorPhoto } from './AuthorPhoto';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthorFormFields, authorFormSchema } from '@/entities/author';
import { AuthorModel } from '@/store/models/author';

type Props = {
  author: AuthorModel;
  save: (payload: AuthorFormFields) => Promise<void>;
};

const EditAuthor: React.FC<Props> = ({ author, save }) => {
  const { back } = useRouter();

  const form = useForm<AuthorFormFields>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: {
      ...author.formData,
    },
  });

  const onSave = React.useCallback(() => {
    save(form.getValues());
  }, [form, save]);

  const discard = React.useCallback(() => {
    form.reset();
    author.photo?.reset();
  }, [form, author.photo]);

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='icon'
            className='h-7 w-7'
            onClick={back}
          >
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Назад</span>
          </Button>
          <h1 className='flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0'>
            {author.name}
          </h1>
          <div className='hidden items-center gap-2 md:ml-auto md:flex'>
            <Button
              disabled={!form.formState.isDirty}
              variant='outline'
              size='sm'
              onClick={discard}
            >
              Отменить
            </Button>
            <Button
              disabled={!form.formState.isDirty}
              size='sm'
              onClick={onSave}
            >
              Сохранить
            </Button>
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle>Информация об&nbsp;авторе</CardTitle>
              </CardHeader>
              <CardContent>
                <AuthorForm form={form} />
              </CardContent>
            </Card>
          </div>
          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
            {author.photo && <AuthorPhoto photo={author.photo} />}
            <Card>
              <CardHeader>
                <CardTitle>Удалить автора</CardTitle>
                <CardDescription>
                  Можно удалить автора, но это действие нельзя будет отменить.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size='sm' variant='destructive'>
                  Удалить
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className='flex items-center justify-center gap-2 md:hidden'>
          <Button variant='outline' size='sm' onClick={discard}>
            Отменить
          </Button>
          <Button size='sm' onClick={save}>
            Сохранить
          </Button>
        </div>
      </div>
    </main>
  );
};

export default React.memo(EditAuthor);

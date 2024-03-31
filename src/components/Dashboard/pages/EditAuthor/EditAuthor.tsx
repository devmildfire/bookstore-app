import * as React from 'react';

import Image from 'next/image';
import { ChevronLeft, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/datetime-picker';

const EditAuthor: React.FC = () => {
  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='icon' className='h-7 w-7'>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Назад</span>
          </Button>
          <h1 className='flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0'>
            Фёдор Достоевский
          </h1>
          <div className='hidden items-center gap-2 md:ml-auto md:flex'>
            <Button variant='outline' size='sm'>
              Отменить
            </Button>
            <Button size='sm'>Сохранить</Button>
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle>Информация об&nbsp;авторе</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-6'>
                  <div className='grid gap-3'>
                    <Label htmlFor='name'>Имя</Label>
                    <Input
                      id='name'
                      type='text'
                      className='w-full'
                      defaultValue='Фёдор Достоевский'
                    />
                  </div>
                  <div className='flex gap-3 items-center'>
                    <Label htmlFor='name'>Дата рождения</Label>
                    <DateTimePicker />
                    <Label htmlFor='name'>Дата смерти</Label>
                    <DateTimePicker />
                  </div>
                  <div className='grid gap-3'>
                    <Label htmlFor='name'>Город</Label>
                    <Input
                      id='name'
                      type='text'
                      className='w-full'
                      defaultValue='Cанкт-Петербург'
                    />
                  </div>
                  <div className='grid gap-3'>
                    <Label htmlFor='name'>Фраза</Label>
                    <Input
                      id='name'
                      type='text'
                      className='w-full'
                      defaultValue='Человек, который не верит в чудеса, не является реалистом.'
                    />
                  </div>
                  <div className='grid gap-3'>
                    <Label htmlFor='description'>Биография</Label>
                    <Textarea
                      id='bio'
                      defaultValue='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl nec ultricies ultricies, nunc nisl ultricies nunc, nec ultricies nunc nisl nec nunc.'
                      className='min-h-56'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
            <Card className='overflow-hidden'>
              <CardHeader>
                <CardTitle>Фотография автора</CardTitle>
                <CardDescription>
                  Фотография будет отображаться на странице автора и странице
                  его книг.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-2'>
                  <Image
                    alt='Product image'
                    className='aspect-square w-full rounded-md object-cover'
                    height='300'
                    src='https://www.rsl.ru/photo/!_ORS/3-SOBYTIJA/1-afisha/lections-2021/dostoevskij/dostoevsky-zakharov2.jpg'
                    width='300'
                  />
                  <button className='flex py-4 w-full items-center justify-center rounded-md border border-dashed'>
                    <Upload className='h-4 w-4 text-muted-foreground' />
                    <span className='sr-only'>Upload</span>
                  </button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Удалить автора</CardTitle>
                <CardDescription>
                  Можно удалить автора, но это действие нельзя будет отменить.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div></div>
                <Button size='sm' variant='destructive'>
                  Удалить
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className='flex items-center justify-center gap-2 md:hidden'>
          <Button variant='outline' size='sm'>
            Discard
          </Button>
          <Button size='sm'>Сохранить</Button>
        </div>
      </div>
    </main>
  );
};

export default React.memo(EditAuthor);

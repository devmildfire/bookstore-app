import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Pagination } from '../components/Pagination';
import { AuthorCard } from './AuthorCard';
import { Header } from './Header';
import { createSlug } from '@/utils/createSlug';

function Authors() {
  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <Header />
      <Card>
        <div className='flex'>
          <CardHeader className='flex-2'>
            <CardTitle>Авторы</CardTitle>
            <CardDescription>Панель управления авторами.</CardDescription>
          </CardHeader>
          <Pagination className='flex-1 justify-end px-6' />
        </div>
        <CardContent className='grid grid-cols-author-cards gap-8'>
          {new Array(14).fill(1).map((_, idx) => (
            <AuthorCard
              key={idx}
              author={{
                bio: 'asd',
                id: '1',
                name: 'Фёдор Достоевский',
                photo:
                  'https://www.rsl.ru/photo/!_ORS/3-SOBYTIJA/1-afisha/lections-2021/dostoevskij/dostoevsky-zakharov2.jpg',
              }}
              navigateTo={`/admin/authors/${createSlug('Фёдор Достоевский')}`}
              className='w-full'
              aspectRatio='portrait'
              width={150}
              height={130}
            />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

export default React.memo(Authors);

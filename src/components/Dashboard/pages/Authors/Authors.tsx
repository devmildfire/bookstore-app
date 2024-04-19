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
import { AuthorsStore } from '@/store/locals/dashboard/AuthorsStore';
import { useLocalStore } from '@/store/hooks';
import { observer } from 'mobx-react-lite';

const Authors = () => {
  const authorsStore = useLocalStore(() => new AuthorsStore());

  React.useEffect(() => {
    authorsStore.load();
  }, [authorsStore]);

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <Header />
      <Card>
        <div className='flex flex-col pb-6 justify-center smd:flex-row smd:pb-0 '>
          <CardHeader className='flex-2'>
            <CardTitle>Авторы</CardTitle>
            <CardDescription>Панель управления авторами.</CardDescription>
          </CardHeader>
          <Pagination className='flex-1 px-6 justify-start smd:justify-end' />
        </div>
        <CardContent className='grid grid-cols-author-cards gap-8'>
          {authorsStore.authors?.map((author) => (
            <AuthorCard
              key={author.id}
              author={author}
              navigateTo={`/admin/authors/${author.id}`}
              className='w-full'
              aspectRatio='square'
              width={150}
              height={130}
            />
          ))}
        </CardContent>
      </Card>
    </main>
  );
};

export default observer(Authors);

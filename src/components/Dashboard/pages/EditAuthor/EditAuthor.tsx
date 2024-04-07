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

import { useLocalStore } from '@/store/hooks';
import { AuthorStore, AuthorStoreProvider } from '@/store/locals/dashboard';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';

import { AuthorForm } from './AuthorForm';
import { AuthorPhoto } from './AuthorPhoto';

type Props = {
  id: string;
};

const EditAuthor: React.FC<Props> = ({ id }) => {
  const [resetKey, setResetKey] = React.useState(0);
  const { back } = useRouter();
  const authorStore = useLocalStore(() => new AuthorStore({ id }));

  const discard = () => setResetKey((prev) => prev + 1);

  React.useEffect(() => {
    authorStore.load();
  }, [authorStore]);

  if (!authorStore.author) {
    return null;
  }

  return (
    <AuthorStoreProvider value={{ store: authorStore }}>
      <main
        className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'
        key={resetKey}
      >
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
              {authorStore.author.name}
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
                  <AuthorForm author={authorStore.author} />
                </CardContent>
              </Card>
            </div>
            <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
              {authorStore.author.photo && (
                <AuthorPhoto src={authorStore.author.photo} />
              )}
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
            <Button onClick={discard} variant='outline' size='sm'>
              Discard
            </Button>
            <Button size='sm'>Сохранить</Button>
          </div>
        </div>
      </main>
    </AuthorStoreProvider>
  );
};

export default observer(EditAuthor);

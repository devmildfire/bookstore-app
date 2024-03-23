import DashMain from '@/components/DashBoardPage/DashMain';
import DashNav from '@/components/DashBoardPage/DashNav';
import { LogOut } from '@/components/LoginPage/Logout';
import { Session } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Database } from 'api/books/types';
import Text from '@/components/Common/Text';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AuthorForm from '@/components/DashBoardPage/AuthorForm';

export type AuthorsType = Database['public']['Tables']['Authors']['Row'];

const Authorslist = () => {
  const [authors, setAuthors] = useState<AuthorsType[]>();

  async function getAuthors() {
    const { data, error } = await supabase.from('Authors').select('*');

    data && console.log('authors data ... ', data);
    error && alert(error);

    data && setAuthors(data);
  }

  useEffect(() => {
    getAuthors();
  }, []);

  if (!authors) {
    return <div>zero authors found in database</div>;
  }

  return (
    <div className='w-full'>
      <Text variant='h3c'> Authors </Text>

      <Accordion type='single' collapsible className='w-full'>
        {authors.map((author) => (
          <AccordionItem
            value={`item-${author.id}`}
            key={author.id}
            className='w-full'
          >
            <AccordionTrigger> {author.name} </AccordionTrigger>
            <AccordionContent>
              <div className='text-left'>
                <span className='text-red-900 font-bold'>bio: </span>{' '}
                {author.bio}
              </div>

              <div className='text-left'>
                <span className='text-red-900 font-bold'>birth date: </span>
                {author.birth_date}
              </div>

              <div className='text-left'>
                <span className='text-red-900 font-bold'>death date: </span>{' '}
                {author.death_date}
              </div>

              {/* <div className='text-right'>city:</div> */}
              <div className='text-left'>
                <span className='text-red-900 font-bold'>city: </span>{' '}
                {author.city}
              </div>

              <div className='text-left'>
                <span className='text-red-900 font-bold'>photo: </span>
              </div>
              <div className='text-left'>
                <img
                  src={author.photo || undefined}
                  alt='no photo'
                  className='max-w-60'
                />
              </div>

              {/* <div className='text-left'>{author.photo}</div> */}

              {/* <div className='text-right'>phrase:</div> */}
              <div className='text-left'>
                <span className='text-red-900 font-bold'>phrase: </span>{' '}
                {author.phrase}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem
          value='item-createnew'
          key='create-new'
          className='w-full'
        >
          <AccordionTrigger>
            <div className='flex flex-grow items-center'>
              <div className='flex-grow items-center text-red-800 hover:underline'>
                Добавить нового
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AuthorForm
              defaultName='sdfdsfsdf'
              defaultBio='sdfdsfsdf'
              defaultBirthDate={new Date('2022-03-25')}
              defaultDeathDate={new Date('2022-03-25')}
              defaultCity='sdfdsfsdfsd'
              defaultPhoto='sdfsdfdsf'
              defaultPhrase='sdfsdfsdf'
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const Authors = (): React.ReactElement => {
  const [session, setSession] = useState<Session>();
  const router = useRouter();

  const check_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        !data.session?.user.user_metadata.isAdmin && router.push('/login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    check_session();
  }, []);

  return (
    <DashMain>
      <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
        <DashNav />
        <Authorslist />
        {session && <LogOut session={session} />}
      </div>
    </DashMain>
  );
};

export default Authors;

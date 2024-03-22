import DashMain from '@/components/DashBoardPage/DashMain';
import DashNav from '@/components/DashBoardPage/DashNav';
import { LogOut } from '@/components/LoginPage/Logout';
import { Session } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Database } from 'api/books/types';
import Text from '@/components/Common/Text';
import Image from 'next/image';

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
    <div>
      <Text variant='h3c'> Authors </Text>
      <div className='grid gap-4  grid-cols-1 md:grid-cols-2 xxl:grid-cols-3'>
        {authors.map((author) => (
          <div
            key={author.id}
            // className='grid grid-cols-authors auto-rows-min gap-2 outline outline-1 p-2'
            className='grid auto-rows-min gap-2 outline outline-1 p-2'
          >
            {/* <div className='text-right'>id:</div> */}
            <div className='text-left'>
              <span className='text-red-900 font-bold'>id: </span> {author.id}
            </div>

            {/* <div className='text-right'>name:</div> */}
            <div className='text-left'>
              <span className='text-red-900 font-bold'>name: </span>
              {author.name}
            </div>

            {/* <div className='text-right'>bio:</div> */}
            <div className='text-left'>
              <span className='text-red-900 font-bold'>bio: </span> {author.bio}
            </div>

            {/* <div className='text-right whitespace-nowrap'>birth date:</div> */}
            <div className='text-left'>
              <span className='text-red-900 font-bold'>birth date: </span>
              {author.birth_date}
            </div>

            {/* <div className='text-right whitespace-nowrap'>death date:</div> */}
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
              <img src={author.photo || undefined} alt='no photo' />
            </div>

            {/* <div className='text-left'>{author.photo}</div> */}

            {/* <div className='text-right'>phrase:</div> */}
            <div className='text-left'>
              <span className='text-red-900 font-bold'>phrase: </span>{' '}
              {author.phrase}
            </div>
          </div>
        ))}
      </div>
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

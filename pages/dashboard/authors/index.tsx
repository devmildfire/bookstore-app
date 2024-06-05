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
import {
  AuthorEditForm,
  AuthorForm,
} from '@/components/DashBoardPage/AuthorForm';
import PageLayout from '@/layouts/PageLayout';
import { observer } from 'mobx-react-lite';
import { allEnums } from '@/utils/allEnums';

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
    // enumsArrayStore.load();
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
              <AuthorEditForm {...author} />
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
              // defaultPhoto='sdfsdfdsf'
              defaultPhrase='sdfsdfsdf'
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// TODO перенести этот функционал в корень сайта
const Authors = observer(() => {
  const [session, setSession] = useState<Session>();
  const router = useRouter();

  const check_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        // !data.session?.user.user_metadata.isAdmin && router.push('/login');
        !data.session?.user.app_metadata.claims_admin && router.push('/login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    check_session();
  }, []);

  return (
    <PageLayout>
      <DashMain>
        <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
          <DashNav />
          <Authorslist />
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    </PageLayout>
  );
});

// function Authors(): React.ReactElement {
//   const [session, setSession] = useState<Session>();
//   const router = useRouter();

//   const check_session = async () => {
//     try {
//       const { data, error } = await supabase.auth.getSession();
//       if (error) {
//         console.error(error);
//       } else {
//         data.session && setSession(data.session);
//         // !data.session?.user.user_metadata.isAdmin && router.push('/login');
//         !data.session?.user.app_metadata.claims_admin && router.push('/login');
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     check_session();
//   }, []);

//   return (
//     <PageLayout>
//       <DashMain>
//         <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
//           <DashNav />
//           <Authorslist />
//           {session && <LogOut session={session} />}
//         </div>
//       </DashMain>
//     </PageLayout>
//   );
// }

// export { Authors };
export default Authors;

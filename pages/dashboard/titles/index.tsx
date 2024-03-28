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
import { TitleForm } from '@/components/DashBoardPage/TitleForm';

export type TitleType = Database['public']['Tables']['Titles']['Row'];

const Titleslist = () => {
  const [titles, setTitles] = useState<TitleType[]>();

  async function getTitles() {
    const { data, error } = await supabase.from('Titles').select('*');

    data && console.log('Titles data ... ', data);
    error && alert(error);

    data && setTitles(data);
  }

  useEffect(() => {
    getTitles();
  }, []);

  if (!titles) {
    return <div>zero titles found in database</div>;
  }

  return (
    <div className='w-full'>
      <Text variant='h3c'> Titles </Text>

      <Accordion type='single' collapsible className='w-full'>
        {titles.map((title) => (
          <AccordionItem
            value={`item-${title.id}`}
            key={title.id}
            className='w-full'
          >
            <AccordionTrigger> {title.name} </AccordionTrigger>
            <AccordionContent>
              {/* <AuthorEditForm {...author} /> */}
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
                Добавить новый
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <TitleForm
              defaultName='Default Title'
              defaultThesis='Default Thesis'
              defaultDescription='Default Description'
              defaultAgeRestriction={0}
              defaultFirstRelease={new Date('2022-03-25')}
              defaultIsFeatured={true}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

function Titles(): React.ReactElement {
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
  });

  return (
    <DashMain>
      <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
        <DashNav />
        <Titleslist />
        {session && <LogOut session={session} />}
      </div>
    </DashMain>
  );
}

// export { Authors };
export default Titles;

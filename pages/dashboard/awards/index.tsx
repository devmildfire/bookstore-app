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
import { AwardEditForm, AwardForm } from '@/components/DashBoardPage/AwardForm';
import PageLayout from '@/layouts/PageLayout';

export type AwardsType = Database['public']['Tables']['Awards']['Row'];

const AwardsList = () => {
  const [awards, setAwards] = useState<AwardsType[]>();

  async function getAwards() {
    const { data, error } = await supabase.from('Awards').select('*');

    data && console.log('awards data ... ', data);
    error && alert(error);

    data && setAwards(data);
  }

  useEffect(() => {
    getAwards();
  }, []);

  if (!awards) {
    return <div>zero awards found in database</div>;
  }

  return (
    <div className='w-full'>
      <Text variant='h3c'> Награды </Text>

      <Accordion type='single' collapsible className='w-full'>
        {awards.map((award) => (
          <AccordionItem
            value={`item-${award.id}`}
            key={award.id}
            className='w-full'
          >
            <AccordionTrigger> {award.title} </AccordionTrigger>
            <AccordionContent>
              <AwardEditForm {...award} />
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
                Добавить новую награду
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <AwardForm defaultTitle='some award' />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

function Awards(): React.ReactElement {
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
    <PageLayout>
      <DashMain>
        <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
          <DashNav />
          <AwardsList />
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    </PageLayout>
  );
}

// export { Authors };
export default Awards;

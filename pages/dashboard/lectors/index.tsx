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
  LectorEditForm,
  LectorForm,
  LectorsType,
} from '@/components/DashBoardPage/LectorForm';
import PageLayout from '@/layouts/PageLayout';

const Lectorslist = () => {
  const [lectors, setLectors] = useState<LectorsType[]>();

  async function getLectors() {
    const { data, error } = await supabase.from('Lectors').select('*');

    data && console.log('lectors data ... ', data);
    error && alert(error);

    data && setLectors(data);
  }

  useEffect(() => {
    getLectors();
  }, []);

  if (!lectors) {
    return <div>zero lectors found in database</div>;
  }

  return (
    <div className='w-full'>
      <Text variant='h3c'> Lectors </Text>

      <Accordion type='single' collapsible className='w-full'>
        {lectors.map((lector) => (
          <AccordionItem
            value={`item-${lector.id}`}
            key={lector.id}
            className='w-full'
          >
            <AccordionTrigger> {lector.name} </AccordionTrigger>
            <AccordionContent>
              {lector && <LectorEditForm {...lector} />}
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
            <LectorForm />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

function Lectors(): React.ReactElement {
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
          <Lectorslist />
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    </PageLayout>
  );
}

export default Lectors;

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
import { TitleEditForm, TitleForm } from '@/components/DashBoardPage/TitleForm';
import { AuthorsType } from '../authors';
import { AwardsType } from '../awards';
import PageLayout from '@/layouts/PageLayout';

export type Worker = {
  id: number,
  job: string | null,
  name: string | null,
  surname: string | null,
};


export type TitleType = Database['public']['Tables']['Titles']['Row'];
export type TitleTypeWithWorkers = TitleType & { workers: Worker[] }  ;

const Titleslist = () => {
  const [titles, setTitles] = useState<TitleTypeWithWorkers[]>();
  const [authors, setAuthors] = useState<AuthorsType[]>();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [awards, setAwards] = useState<AwardsType[]>();

  async function getTitles() {
    const { data, error } = await supabase.from('Titles').select(`*, workers: Workers_Products ( * , ...Workers(*))`);
   
    data && console.log('Titles data ... ', data);
    error && alert(error);
    
    data && setTitles(data);
  }

  async function getAuthors() {
    const { data, error } = await supabase.from('Authors').select('*');

    data && console.log('Authors data ... ', data);
    error && alert(error);

    data && setAuthors(data);
  }

  async function getWorkers() {
    const { data, error } = await supabase.from('Workers').select('*');

    data && console.log('Workers data ... ', data);
    error && alert(error);

    data && setWorkers(data);
  }

  async function getAwards() {
    const { data, error } = await supabase.from('Awards').select('*');

    data && console.log('Awards data ... ', data);
    error && alert(error);

    data && setAwards(data);
  }

  useEffect(() => {
    getTitles();
    getAuthors();
    getAwards();
    getWorkers();
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
            <AccordionTrigger> {title.name} 
              
            {
              title.workers.some( worker => worker.job === 'translator' ) && ` |  переводчик ` + title.workers.filter(
                worker => worker.job === 'translator'
              )[0].name + ' ' + title.workers.filter(
                worker => worker.job === 'translator'
              )[0].surname 
            }

            </AccordionTrigger>
            <AccordionContent>
              {authors && awards && (
                <TitleEditForm
                  title={title}
                  titles={[...titles]}
                  authors={[...authors]}
                  awards={[...awards]}
                  workers={[...workers]}
                />
              )}
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
            {authors && awards && (
              <TitleForm
                authors={[...authors]}
                workers={[...workers]}
                awards={[...awards]}
                titles={[...titles]}
                defaultName='Default Title'
                defaultThesis='Default Thesis'
                defaultDescription='Default Description'
                defaultAgeRestriction={0}
                defaultFirstRelease={new Date('2022-03-25')}
                defaultIsFeatured={true}
              />
            )}
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
          <Titleslist />
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    </PageLayout>
  );
}

// export { Authors };
export default Titles;

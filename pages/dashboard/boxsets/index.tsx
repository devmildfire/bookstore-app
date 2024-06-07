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
  CourseEditForm,
  CourseForm,
} from '@/components/DashBoardPage/CourseForm';
import PageLayout from '@/layouts/PageLayout';
import { titlesStore } from '@/store/locals/dashboard/TitlesStore/TitlesStore';
import { BoxSetForm } from '@/components/DashBoardPage/BoxSetForm';

export type CoursesType = Database['public']['Tables']['Courses']['Row'];
export type LectorsType = {
  id: number;
  name: string;
};

export type BoxSetType = Database['public']['Tables']['BoxSets']['Row'];
export type BookCategory = Database['public']['Enums']['category'];
export type BookProductType = {
  title_id: number;
  title_name: string;
  type: BookCategory;
};

const BoxSetList = () => {
  const [boxSets, setBoxSets] = useState<BoxSetType[]>();
  const [bookProducts, setBookProducts] = useState<BookProductType[]>();

  async function getBoxSets() {
    const { data, error } = await supabase.from('BoxSets').select('*');

    data && console.log('box sets data ... ', data);
    error && alert(error);

    data && setBoxSets(data);
  }

  async function getProducts() {
    const bookProductsArray: BookProductType[] = [];

    titlesStore.titles?.forEach((title) => {
      title.audioBook &&
        bookProductsArray.push({
          title_id: title.id,
          title_name: title.name,
          type: 'AudioBook',
        });

      title.eBook &&
        bookProductsArray.push({
          title_id: title.id,
          title_name: title.name,
          type: 'EBook',
        });

      title.cardBook &&
        bookProductsArray.push({
          title_id: title.id,
          title_name: title.name,
          type: 'Book2.0',
        });

      title.printedBook &&
        bookProductsArray.push({
          title_id: title.id,
          title_name: title.name,
          type: 'PrintBook',
        });
    });

    setBookProducts([...bookProductsArray]);
  }

  useEffect(() => {
    getBoxSets();
    getProducts();
  }, []);

  if (!boxSets) {
    return <div>zero box sets found in database</div>;
  }

  return (
    <div className='w-full'>
      <Text variant='h3c'> Box Sets </Text>

      <Accordion type='single' collapsible className='w-full'>
        {boxSets.map((boxSet) => (
          <AccordionItem
            value={`item-${boxSet.id}`}
            key={boxSet.id}
            className='w-full'
          >
            <AccordionTrigger> {boxSet.name} </AccordionTrigger>
            <AccordionContent>
              {/* {lectors && (
                <CourseEditForm course={course} lectors={[...lectors]} />
              )} */}
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
                Добавить новый Box Set
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {bookProducts && <BoxSetForm products={[...bookProducts]} />}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

function BoxSets(): React.ReactElement {
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
          <BoxSetList />
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    </PageLayout>
  );
}

export default BoxSets;

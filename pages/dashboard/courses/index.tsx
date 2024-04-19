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

import { AwardEditForm, AwardForm } from '@/components/DashBoardPage/AwardForm';
import {
  CourseEditForm,
  CourseForm,
} from '@/components/DashBoardPage/CourseForm';

export type CoursesType = Database['public']['Tables']['Courses']['Row'];
export type LectorsType = {
  id: number;
  name: string;
};

const CoursesList = () => {
  const [courses, setCourses] = useState<CoursesType[]>();
  const [lectors, setLectors] = useState<LectorsType[]>();

  async function getCourses() {
    const { data, error } = await supabase.from('Courses').select('*');

    data && console.log('courses data ... ', data);
    error && alert(error);

    data && setCourses(data);
  }

  async function getLectors() {
    const { data, error } = await supabase.from('Lectors').select('*');

    data && console.log('lectors data ... ', data);
    error && alert(error);

    data && setLectors(data as LectorsType[]);
  }

  useEffect(() => {
    getCourses();
    getLectors();
  }, []);

  if (!courses) {
    return <div>zero courses found in database</div>;
  }

  return (
    <div className='w-full'>
      <Text variant='h3c'> Курсы </Text>

      <Accordion type='single' collapsible className='w-full'>
        {courses.map((course) => (
          <AccordionItem
            value={`item-${course.id}`}
            key={course.id}
            className='w-full'
          >
            <AccordionTrigger> {course.name} </AccordionTrigger>
            <AccordionContent>
              {lectors && (
                <CourseEditForm course={course} lectors={[...lectors]} />
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
                Добавить новый курс
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {lectors && <CourseForm lectors={[...lectors]} />}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

function Courses(): React.ReactElement {
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
        <CoursesList />
        {session && <LogOut session={session} />}
      </div>
    </DashMain>
  );
}

export default Courses;

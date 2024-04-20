import React, { useEffect, useState } from 'react';
import logoPic1920 from '@/assets/images/AbzacLogo.png';
import logoPic1440 from '@/assets/images/AbzacLogo_1440.png';
import abzacLogo1024 from '@/assets/images/AbzacLogo_1024.png';
import abzacLogo320 from '@/assets/images/AbzacLogo_320.png';
import ArrowDown from '@/assets/icons/arrow_down.svg';
import CartPlusOne from '@/assets/icons/CartPlusOne.svg';
import Text from '@/components/Common/Text';
import {
  AbzacDiv,
  AnimatedAccordionItem,
  ButtonsDiv,
  CardDiv,
  CourseCardDiv,
  CourseCardTitleDiv,
  CoursePriceDiv,
  CoursesDiv,
  CourseTextDiv,
  CourseTextTitleDiv,
  DiscountPrice,
  EnrollDiv,
  HeroDiv,
  ItemsDiv,
  ItemsValuesDiv,
  StaffEnrollDiv,
  StyledButton,
  TeacherPic,
  TeachersDiv,
  TextDiv,
  TrailerDiv,
  ValuesDiv,
} from './styles';
import Video from '@/components/Common/Video/Video';
import * as Accordion from '@radix-ui/react-accordion';
import { supabase } from 'api/supabase-client';
import { LectorsType } from '@/components/DashBoardPage/LectorForm';
import { CoursesType } from 'pages/dashboard/courses';
import { QueryData } from '@supabase/supabase-js';
import { CartItemType } from 'pages/api/cart';
import { postData } from '@/utils/postData';
import { setOrGetCartCookie } from '@/utils/cardID';
import Link from 'next/link';

/**
 * компонент мастерской Абзац для страницы "Авторам"
 * возвращает весь контент компонента для
 * применения с динамическим роутингом
 *
 */

type CourseAddProps = {
  name: string;
  lector: string;
  price: number;
  discount: number;
};

async function addCourseToCart({
  name,
  lector,
  price,
  discount,
}: CourseAddProps) {
  const item: CartItemType = {
    id: setOrGetCartCookie()!.toString(),
    name: name,
    category: 'Course',
    quantity: 1,
    price: price,
    discount: discount,
    subtitle: lector,
    picture: abzacLogo320.src,
  };

  const addedItem: CartItemType = await postData(`/api/cart`, {
    oper: 'update',
    item: item,
  });
}

const CoursesWithLectorsQuery = supabase
  .from('Courses')
  .select(` *, lectors: Lectors_Courses( Lectors(*)) `);

type CoursesWithLectorsType = QueryData<typeof CoursesWithLectorsQuery>;

const getLectors = async () => {
  const { data } = await supabase.from('Lectors').select('*');

  return data || [];
};

const getCourses = async (): Promise<CoursesWithLectorsType> => {
  const { data } = await CoursesWithLectorsQuery;

  return data || [];
};

const firstPar =
  'Огромная литературная семья, включающая в себя писателей, читателей, редакторов, корректоров, верстальщиков, издателей, критиков, иллюстраторов и многих других, продолжает существовать несмотря ни на что. Сколько бы ни применяли к ней цензурных кнутов, какими бы ни закармливали пряниками поп-культуры — задушить её пока не удалось никому. А чтобы этого никому не удалось и впредь, мы открываем мастерскую Абзац, призванную объединять любителей литературы и давать им новые знания, навыки, возможности, и, что важнее прочего, — друг друга.';

const Abzac = (): React.ReactElement => {
  const [lectors, setLectors] = useState<LectorsType[]>();
  const [courses, setCourses] = useState<CoursesWithLectorsType>();

  const getData = async () => {
    const lectors = await getLectors();
    const courses = await getCourses();
    lectors && setLectors(lectors);
    courses && setCourses(courses);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <AbzacDiv>
      <HeroDiv>
        {/* //  может стоит выделить этот picture в отдельный common компонент */}
        <picture>
          <source srcSet={logoPic1920.src} media='(min-width: 1920px)' />
          <source srcSet={logoPic1440.src} media='(min-width: 1440px)' />
          <source srcSet={abzacLogo1024.src} media='(min-width: 1024px)' />
          <source srcSet={abzacLogo1024.src} media='(min-width: 540px)' />
          <img src={abzacLogo320.src} alt='Мастерская Абзац' />
        </picture>

        <Text variant='abzacText'>{firstPar}</Text>
      </HeroDiv>
      <Trailer />
      {courses && <Curriculum courses={courses} />}
      <StaffEnrollDiv>
        {lectors && <Staff lectors={lectors} />}
        <Enrollment />
      </StaffEnrollDiv>
    </AbzacDiv>
  );
};

type StaffProps = {
  lectors: LectorsType[];
};

const Staff = ({ lectors }: StaffProps): React.ReactElement => {
  return (
    <TeachersDiv>
      <Text variant='h3_Abzac' align='start'>
        Преподаватели
      </Text>
      {lectors.map((lector) => (
        <TeachersCard teacher={lector} key={lector.name} />
      ))}
    </TeachersDiv>
  );
};

interface TeachersCardProps {
  teacher: LectorsType;
}

const TeachersCard = (props: TeachersCardProps): React.ReactElement => {
  const { teacher } = props;
  return (
    <CardDiv>
      <TeacherPic src={teacher.photo} />
      <TextDiv>
        <Text variant='h4_Abzac'>{teacher.name}</Text>
        <Text variant='abzacCardText'>{teacher.bio}</Text>
      </TextDiv>
    </CardDiv>
  );
};

const Curriculum = ({
  courses,
}: {
  courses: CoursesWithLectorsType;
}): React.ReactElement => {
  return (
    <CoursesDiv>
      <Text variant='h3_Abzac' align='start'>
        Направления обучения
      </Text>

      <Accordion.Root type='single' defaultValue='item-value-0' collapsible>
        {courses &&
          courses.map((course, index) => (
            //  <Accordion.Item>
            <AnimatedAccordionItem
              value={'item-value-' + index}
              key={'item-key-' + course.id}
            >
              <Accordion.Trigger className='AccordionTrigger'>
                <CourseCardTitle
                  format={course.format || ''}
                  duration={course.duration || ''}
                  title={course.name}
                  about={course.description ? course.description : ''}
                  teachers={course.lectors.map((item) => {
                    if (item.Lectors !== null) {
                      return item.Lectors;
                    }
                  })}
                  key={'title' + course.id}
                  price={course.price || 0}
                  discount={course.discount}
                />
              </Accordion.Trigger>
              {/* <AnimatedAccordionContent className='AccordionContent'> */}
              <Accordion.Content className='AccordionContent'>
                <CourseCard
                  format={course.format || ''}
                  about={course.description || ''}
                  duration={course.duration || ''}
                  price={course.price || 0}
                  title={course.name || ''}
                  teachers={course.lectors.map((item) => {
                    if (item.Lectors !== null) {
                      return item.Lectors;
                    }
                  })}
                  key={course.id}
                  discount={course.discount}
                />
              </Accordion.Content>
              {/* </AnimatedAccordionContent> */}
              <hr />
              {/* </Accordion.Item> */}
            </AnimatedAccordionItem>
          ))}
      </Accordion.Root>
    </CoursesDiv>
  );
};

interface CourseCardProps {
  teachers: (LectorsType | undefined)[];
  title: string;
  about: string;
  format: string;
  duration: string;
  price: number;
  discount: number;
}

const CourseCardTitle = (props: CourseCardProps): React.ReactElement => {
  const { price, title, about, discount } = props;
  return (
    <CourseCardTitleDiv>
      <CourseTextTitleDiv>
        <Text variant='courseBig'>{title}</Text>

        {about && <Text variant='abzacCardText'>{about}</Text>}
      </CourseTextTitleDiv>
      <div className='flex flex-row gap-5'>
        <div className='flex flex-col md:flex-row md:gap-5'>
          <Text variant='courseBig'>
            {Math.floor((price * (100 - discount)) / 100) + ' \u20BD'}
          </Text>
          {discount > 0 && (
            <DiscountPrice className='discPrice' variant='courseBig'>
              {price + ' \u20BD'}
            </DiscountPrice>
          )}
        </div>
        <ArrowDown className='hover:text-red-800 duration-300' />
      </div>
    </CourseCardTitleDiv>
  );
};

const CourseCard = (props: CourseCardProps): React.ReactElement => {
  const { title, format, teachers, duration, price, discount } = props;

  const [courseIsInTheCart, setCourseIsInTheCart] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  const checkTheCart = async (courseName: string) => {
    const cartID = setOrGetCartCookie()!.toString();

    const inCart = await supabase
      .from('Cart')
      .select('*')
      .eq('id', cartID)
      .eq('name', courseName);

    if (inCart.data && inCart.data?.length > 0) {
      setCourseIsInTheCart(true);
    }
  };

  useEffect(() => {
    checkTheCart(title);
  }, [buttonClicked]);

  const letorsString =
    teachers && teachers.length > 1
      ? teachers
          .map((teacher) => {
            return teacher?.name || '';
          })
          .join(', ')
      : teachers[0]?.name || '';

  return (
    <CourseCardDiv>
      <CourseTextDiv>
        <ItemsDiv>
          <Text variant='abzacCardText'>Формат: </Text>
          <Text variant='abzacCardText'>
            {teachers && teachers.length > 1 ? 'Лекторы: ' : 'Лектор: '}
          </Text>
          <Text variant='abzacCardText'>Длительность: </Text>
        </ItemsDiv>
        <ValuesDiv>
          <Text variant='abzacCardText'>{format}</Text>
          <Text variant='abzacCardText'>
            {teachers && teachers.length > 1
              ? teachers
                  .map((teacher) => {
                    return teacher?.name || '';
                  })
                  .join(', ')
              : teachers.map((teacher) => {
                  return teacher?.name || '';
                })}
          </Text>
          <Text variant='abzacCardText'>{duration}</Text>
        </ValuesDiv>
      </CourseTextDiv>
      <CoursePriceDiv>
        <ButtonsDiv>
          {!courseIsInTheCart && !buttonClicked && (
            <StyledButton
              className='cartButton'
              type='button'
              onClick={() => {
                addCourseToCart({
                  name: title,
                  lector: letorsString,
                  price: price,
                  discount: discount,
                });
                setButtonClicked(true);
              }}
            >
              Добавить в корзину
            </StyledButton>
          )}

          {(courseIsInTheCart || buttonClicked) && (
            <Link
              href={'/cart'}
              className='hover:underline hover:text-red-600 text-red-800 duration-300'
            >
              курс уже в корзине
            </Link>
          )}

          <CartPlusOne />
        </ButtonsDiv>
      </CoursePriceDiv>
    </CourseCardDiv>
  );
};

const enrollText =
  'Интенсив мастерской Абзац прошёл в 2023 году и теперь доступен в формате видеолекций (подробности ниже). Онлайн-мастерская продолжает работать в режиме факультатива, в формате личных и групповых встреч с мастерами по заявкам учащихся.';

const enrollAdress = [
  'Чтобы попасть в чат мастерской в Телеграм и узнать подробности, ',
  <br key='br' />,
  'напишите немного о себе на\u00A0',
];

const Enrollment = (): React.ReactElement => {
  return (
    <EnrollDiv>
      <Text variant='abzacText' align='start'>
        {enrollText}
      </Text>
      <Text variant='h4_Abzac' align='start'>
        {enrollAdress}
        <a href='mailto:info@chtivo.spb.ru'>info@chtivo.spb.ru</a>
      </Text>
    </EnrollDiv>
  );
};

const Trailer = (): React.ReactElement => {
  return (
    <TrailerDiv>
      <Text variant='h3_Abzac' align='start'>
        Трейлер
      </Text>
      <Video src='/videos/abzac.mp4' poster='/images/poster_abzac.png' />
    </TrailerDiv>
  );
};

export default Abzac;

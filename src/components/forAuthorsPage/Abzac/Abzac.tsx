import React from 'react';
import logoPic1920 from '@/assets/images/AbzacLogo.png';
import logoPic1440 from '@/assets/images/AbzacLogo_1440.png';
import abzacLogo1024 from '@/assets/images/AbzacLogo_1024.png';
import abzacLogo320 from '@/assets/images/AbzacLogo_320.png';
import ArrowDown from '@/assets/icons/arrow_down.svg';
import { staff, Teacher } from './Staf';
import Text from '@/components/Common/Text';
import { curriculum } from './Curriculum';
import setUUIDField from '@/utils/setUUIDField';
import {
  AbzacDiv,
  CardDiv,
  CourseCardDiv,
  CoursesDiv,
  CourseTextDiv,
  EnrollDiv,
  HeroDiv,
  StaffEnrollDiv,
  TeacherPic,
  TeachersDiv,
  TextDiv,
  TrailerDiv,
} from './styles';
import Video from '@/components/Common/Video/Video';
import * as Accordion from '@radix-ui/react-accordion';

/**
 * компонент мастерской Абзац для страницы "Авторам"
 * возвращает весь контент компонента для
 * применения с динамическим роутингом
 *
 */

const firstPar =
  'Огромная литературная семья, включающая в себя писателей, читателей, редакторов, корректоров, верстальщиков, издателей, критиков, иллюстраторов и многих других, продолжает существовать несмотря ни на что. Сколько бы ни применяли к ней цензурных кнутов, какими бы ни закармливали пряниками поп-культуры — задушить её пока не удалось никому. А чтобы этого никому не удалось и впредь, мы открываем мастерскую Абзац, призванную объединять любителей литературы и давать им новые знания, навыки, возможности, и, что важнее прочего, — друг друга.';

const Abzac = (): React.ReactElement => {
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
      <StaffEnrollDiv>
        <Staff />
        <Enrollment />
      </StaffEnrollDiv>
      <Trailer />
      <Curriculum />
    </AbzacDiv>
  );
};

const Staff = (): React.ReactElement => {
  return (
    <TeachersDiv>
      <Text variant='h3_Abzac' align='start'>
        Преподаватели
      </Text>
      {staff.map((item) => (
        <TeachersCard teacher={item} key={item.name} />
      ))}
    </TeachersDiv>
  );
};

interface TeachersCardProps {
  teacher: Teacher;
}

const TeachersCard = (props: TeachersCardProps): React.ReactElement => {
  const { teacher } = props;
  return (
    <CardDiv>
      <TeacherPic src={teacher.photo} />
      <TextDiv>
        <Text variant='h4_Abzac'>{teacher.name}</Text>
        <Text variant='abzacCardText'>{teacher.text}</Text>
      </TextDiv>
    </CardDiv>
  );
};

const curriculumWID = setUUIDField(curriculum);

const Curriculum = (): React.ReactElement => {
  return (
    <CoursesDiv>
      <Text variant='h3_Abzac' align='start'>
        Направления обучения
      </Text>

      <Accordion.Root type='single' defaultValue='item-1' collapsible>
        {curriculumWID.map((course) => (
          <Accordion.Item
            value={'item-value-' + course.key}
            key={'item-key-' + course.key}
          >
            <Accordion.Trigger>{course.title}</Accordion.Trigger>
            <Accordion.Content>
              <CourseCard
                title={course.title}
                about={course.about ? course.about : ''}
                teacher={course.lector}
                key={course.key}
              />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </CoursesDiv>
  );
};

interface CourseCardProps {
  teacher: Teacher | undefined;
  title: string;
  about?: string | undefined;
}

const CourseCard = (props: CourseCardProps): React.ReactElement => {
  const { teacher, title, about } = props;
  return (
    <CourseCardDiv>
      <ArrowDown />
      <CourseTextDiv>
        <Text variant='courseBig'>{title}</Text>

        {about && <Text variant='abzacCardText'>{about}</Text>}
      </CourseTextDiv>

      <Text variant='courseBig'>{teacher?.name}</Text>
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
      <Video src='/videos/chtivo.mp4' poster='/images/poster.png' />
    </TrailerDiv>
  );
};

export default Abzac;

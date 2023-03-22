import React from 'react';
// import setUUIDField from '@/utils/setUUIDField';
import logoPic from '@/assets/images/AbzacLogo.png';
import { CardDiv, HeroDiv, TeacherPic, TeachersDiv, TextDiv } from './styles';
// import styled from 'styled-components';
import { staff, Teacher } from './Staf';

/**
 * компонент мастерской Абзац для страницы "Авторам"
 * возвращает весь контент компонента для
 * применения с динамическим роутингом
 *
 */

// const staffWID = setUUIDField(staff);

const firstPar =
  'Огромная литературная семья, включающая в себя писателей, читателей, редакторов, корректоров, верстальщиков, издателей, критиков, иллюстраторов и многих других, продолжает существовать несмотря ни на что. Сколько бы ни применяли к ней цензурных кнутов, какими бы ни закармливали пряниками поп-культуры — задушить её пока не удалось никому. А чтобы этого никому не удалось и впредь, мы открываем мастерскую Абзац, призванную объединять любителей литературы и давать им новые знания, навыки, возможности, и, что важнее прочего, — друг друга.';

const Abzac = (): React.ReactElement => {
  return (
    <>
      <HeroDiv>
        {/* //  добавить разные картинки для разных экранов */}
        <img src={logoPic.src} alt='Мастерская Абзац' />
        {firstPar}
      </HeroDiv>
      <Staff />
    </>
  );
};

const Staff = (): React.ReactElement => {
  return (
    <>
      <h2> Преподаватели </h2>
      <TeachersDiv>
        {staff.map((item) => (
          <TeachersCard teacher={item} key={item.name} />
        ))}
      </TeachersDiv>
    </>
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
        <h3>{teacher.name}</h3>
        <p>{teacher.text}</p>
      </TextDiv>
    </CardDiv>
  );
};

export default Abzac;

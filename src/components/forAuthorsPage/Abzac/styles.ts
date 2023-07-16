// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Button from '@/components/Common/Button';

const AbzacDiv = styled.div`
  /* * {
    outline: 1px solid red;
  } */

  picture > img {
    width: 100%;
  }

  display: flex;
  flex-direction: column;
  gap: 150px;

  --padding-top: 100px;
  // --padding-sides: 96px;
  --padding-sides: 0px;
  --padding-bottom: 200px;

  padding: var(--padding-top) var(--padding-sides) var(--padding-bottom);

  @media ${breakPoints.xl} {
    --padding-top: 100px;
    // --padding-sides: 96px;
    --padding-sides: 0px;
    --padding-bottom: 200px;
  }

  @media screen and (max-width: 1200px) {
    --padding-top: 80px;
    // --padding-sides: 58px;
    --padding-sides: 0px;
    --padding-bottom: 120px;
  }

  @media ${breakPoints.lg} {
    --padding-top: 80px;
    // --padding-sides: 52px;
    --padding-sides: 0px;
    --padding-bottom: 120px;

    gap: 90px;
  }

  @media ${breakPoints.md} {
    --padding-top: 39px;
    // --padding-sides: 36px;
    --padding-sides: 0px;
    --padding-bottom: 50px;
  }

  @media ${breakPoints.smd} {
    gap: 50px;
  }

  @media ${breakPoints.sm} {
  }
`;

const HeroDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

const CardDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 50px;

  @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media screen and (max-width: 1200px) {
    gap: 30px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
    flex-direction: column;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 25px;
  }

  @media ${breakPoints.sm} {
  }
`;

const TeacherPic = styled.img`
  --size: 280px;
  width: var(--size);
  height: var(--size);

  filter: grayscale(100);
  :hover {
    filter: grayscale(0);
  }

  @media ${breakPoints.xl} {
    --size: 280px;
  }

  @media screen and (max-width: 1200px) {
    --size: 180px;
    /* align-self: center; */
  }

  @media ${breakPoints.lg} {
    --size: 180px;
    align-self: center;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const TextDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  /* @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 25px;
  }

  @media ${breakPoints.sm} {
  } */
`;

const TeachersDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 35px;

  @media ${breakPoints.xl} {
    gap: 35px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const CoursesDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 35px;

  //  правило для кнопки, которая представляет собой пункт меню-аккордиона
  > div > div > button {
    background: none;
    width: 100%;
  }

  .AccordionTrigger[data-state='open'] {
    svg {
      color: var(--main-red-100);
    }
  }

  @media ${breakPoints.xl} {
    gap: 35px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const CourseCardTitleDiv = styled.div`
  background-color: var(--main-black);

  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  gap: 50px;

  padding-bottom: 24px;

  svg {
    color: var(--main-white-80);
  }

  > h4 {
    flex-grow: 1;
    text-align: left;

    @media ${breakPoints.sm} {
      display: none;
    }
  }

  /* var(--main-white-80) */

  @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 7px;
    padding-bottom: 12px;
    /* align-items: flex-end; */
  }

  @media ${breakPoints.sm} {
    /* justify-content: flex-end; */
  }
`;

const CourseCardDiv = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  gap: 50px;

  /* border-bottom: 1px solid var(--main-white-100); */
  padding-bottom: 24px;

  /* var(--main-white-80) */

  @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 7px;
    padding-bottom: 12px;
    align-items: flex-end;
  }

  @media ${breakPoints.sm} {
  }
`;

const CourseTextDiv = styled.div`
  display: flex;
  justify-content: start;
  flex-direction: row;
  gap: 40px;
  align-items: start;
  text-align: left;

  flex-grow: 1;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
    gap: 8px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 5px;
  }

  @media ${breakPoints.sm} {
  }
`;

const ItemsDiv = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  gap: 5px;
  align-items: start;

  @media ${breakPoints.sm} {
    display: none;
  }
`;

const ValuesDiv = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  gap: 5px;
  align-items: start;

  @media ${breakPoints.sm} {
    display: none;
  }
`;

const ItemsValuesDiv = styled.div`
  display: none;

  @media ${breakPoints.sm} {
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    gap: 2px;
    align-items: start;
  }
`;

const CourseTextTitleDiv = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  gap: 8px;
  align-items: end;
  text-align: right;

  flex-grow: 1;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
    gap: 8px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 5px;
  }

  @media ${breakPoints.sm} {
    align-items: start;
    text-align: left;
  }
`;

const EnrollDiv = styled.div`
  display: flex;
  /* justify-content: space-around; */
  flex-direction: column;
  gap: 29px;

  a {
    color: var(--main-red-100);

    :hover {
      color: red;
      text-decoration: underline;
    }
  }

  @media ${breakPoints.xl} {
    gap: 36px;
  }

  @media ${breakPoints.lg} {
    gap: 40px;
  }

  @media ${breakPoints.md} {
    gap: 41px;
  }

  @media ${breakPoints.smd} {
    gap: 40px;
  }

  @media ${breakPoints.sm} {
  }
`;

const TrailerDiv = styled.div`
  display: flex;
  /* justify-content: space-around; */
  flex-direction: column;
  gap: 90px;

  > video {
    max-width: unset;
  }

  video[poster] {
    object-fit: cover;
  }

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
    gap: 70px;
  }

  @media ${breakPoints.md} {
    gap: 30px;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const StaffEnrollDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
`;

const CoursePriceDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 35px;
`;

const StyledButton = styled(Button)<{ className?: string }>`
  max-width: 900px;

  @media ${breakPoints.xl} {
    max-width: 720px;
  }

  @media ${breakPoints.lg} {
    max-width: 570px;
    height: 45px;
    min-height: 45px;
    width: 185px;
    min-width: 185px;
  }

  @media ${breakPoints.md} {
    width: 100%;
  }

  @media ${breakPoints.smd} {
    max-width: 150px;
    height: 32px;
    min-height: 32px;
    width: 150px;
    min-width: 150px;
    margin: 0 auto;
  }
`;

export {
  HeroDiv,
  CardDiv,
  TeacherPic,
  TextDiv,
  TeachersDiv,
  AbzacDiv,
  CoursesDiv,
  CourseCardDiv,
  CourseCardTitleDiv,
  CourseTextTitleDiv,
  CourseTextDiv,
  EnrollDiv,
  TrailerDiv,
  StaffEnrollDiv,
  StyledButton,
  CoursePriceDiv,
  ValuesDiv,
  ItemsDiv,
  ItemsValuesDiv,
};

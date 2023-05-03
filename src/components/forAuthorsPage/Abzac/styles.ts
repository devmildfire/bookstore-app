// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const AbzacDiv = styled.div`
  /* * {
    outline: 1px solid red;
  } */

  picture > img {
    width: 100%;
  }

  display: flex;
  flex-direction: column;
  gap: 40px;

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
  }

  @media ${breakPoints.md} {
    --padding-top: 39px;
    // --padding-sides: 36px;
    --padding-sides: 0px;  
    --padding-bottom: 50px;
  }

  @media ${breakPoints.smd} {
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

const CourseCardDiv = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  gap: 50px;

  border-bottom: 1px solid var(--main-white-100);
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
  justify-content: space-around;
  flex-direction: column;
  gap: 8px;

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

const EnrollDiv = styled.div`
  display: flex;
  /* justify-content: space-around; */
  flex-direction: column;
  gap: 64px;

  a {
    color: var(--main-red-100);
  }

  @media ${breakPoints.xl} {
    gap: 82px;
  }

  @media ${breakPoints.lg} {
    gap: 8px;
  }

  @media ${breakPoints.md} {
    gap: 41px;
  }

  @media ${breakPoints.smd} {
    gap: 22px;
  }

  @media ${breakPoints.sm} {
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
  CourseTextDiv,
  EnrollDiv,
};

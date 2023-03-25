// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const AbzacDiv = styled.div`
  * {
    outline: 1px solid red;
  }

  picture > img {
    width: 100%;
  }

  display: flex;
  flex-direction: column;
  gap: 40px;

  --padding-top: 100px;
  --padding-sides: 96px;
  --padding-bottom: 200px;

  padding: var(--padding-top) var(--padding-sides) var(--padding-bottom);

  @media ${breakPoints.xl} {
    --padding-top: 100px;
    --padding-sides: 96px;
    --padding-bottom: 200px;
  }

  @media ${breakPoints.lg} {
    --padding-top: 100px;
    --padding-sides: 52px;
    --padding-bottom: 120px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    --padding-top: 39px;
    --padding-sides: 36px;
    --padding-bottom: 50px;
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

  @media ${breakPoints.lg} {
    gap: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    gap: 25px;
    flex-direction: column;
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

  @media ${breakPoints.lg} {
    --size: 180px;
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

export { HeroDiv, CardDiv, TeacherPic, TextDiv, TeachersDiv, AbzacDiv };

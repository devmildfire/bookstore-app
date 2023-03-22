// import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const HeroDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

const CardDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    flex-direction: row;
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
`;

const TeachersDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export { HeroDiv, CardDiv, TeacherPic, TextDiv, TeachersDiv };

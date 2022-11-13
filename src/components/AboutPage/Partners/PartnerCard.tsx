import React from 'react';
import styled from 'styled-components';
import { Partner } from '@/types/partner';
import breakPoints from '@/utils/breakPoints';

const StyledCard = styled.img`
  --size: 300px;
  width: var(--size);
  height: var(--size);

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 5%;

  /* object-fit: cover; */
  object-fit: contain;
  background-color: rgba(18, 18, 18, 0.5);
  backdrop-filter: blur(8px);

  margin-bottom: 25px;

  @media ${breakPoints.xl} {
    /* --size: 280px; */
    --size: 220px;
  }

  @media ${breakPoints.lg} {
    /* --size: 250px; */
    --size: 180px;
  }

  @media ${breakPoints.sm} {
    --size: 150px;
  }
`;

// const StyledCard = styled.img`
//   display: flex;
//   justify-content: center;
//   align-items: center;

//   width: 302px;
//   height: 302px;
//   background-color: rgba(18, 18, 18, 0.5);
//   backdrop-filter: blur(8px);
//   object-fit: contain;
//   padding: 50px 20px;
//   border-radius: 4px;

//   @media ${breakPoints.xl} {
//     width: 300px;
//     height: 120px;
//   }

//   @media ${breakPoints.lg} {
//     width: 250px;
//     height: 100px;
//   }

//   @media ${breakPoints.md} {
//     width: 200px;
//     height: 80px;
//   }

//   @media ${breakPoints.sm} {
//     width: 156px;
//     height: 65px;
//   }
// `;

const PartnerCard = (props: Partner): React.ReactElement => {
  const { name, photo } = props;

  return <StyledCard src={photo} alt={name} />;
};

export default PartnerCard;

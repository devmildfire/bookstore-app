import type { NextPage } from 'next';
import React from 'react';
import styled from 'styled-components';
import stonks from '@/assets/images/Vector_Stonks.svg';
import Text from '@/components/Common/Text';
// import breakPoints from '@/utils/breakPoints';

const title = 'Инвесторам и донаторам';

const ForInvestors: NextPage = () => {
  return <StyledWrapper>
    <ToInvestors variant='h3_1Man' className='title'>
        {title}
    </ToInvestors>
    <Stonks1 as={stonks as any}/>
    <Stonks2 as={stonks as any}/>
  </StyledWrapper>;
};

const ToInvestors = styled(Text)`
  grid-area: title; 
`;

const StyledWrapper = styled.main`
  // display: flex;
  // flex-direction: column;
  * {outline: 1px solid green}

  align-items: center;

  display: grid;
  grid-template-areas: 
    "title title" 
    "content stonks2"
    "stonks1 .";
`;

const Stonks1 = styled.svg`
  grid-area: stonks1; 
  height: 20vh; 
  width: 50vw; 
`;

const Stonks2 = styled.svg`
  grid-area: stonks2; 
  height: 20vh; 
  width: 50vw; 
`;


export default ForInvestors;

import type { NextPage } from 'next';
import React from 'react';
import styled from 'styled-components';
import stonks from '@/assets/images/Vector_Stonks.svg';
// import breakPoints from '@/utils/breakPoints';

const ForInvestors: NextPage = () => {
  return <StyledWrapper>
    <Stonks1 as={stonks as any}/>
    <Stonks2 as={stonks as any}/>
  </StyledWrapper>;
};

const StyledWrapper = styled.main`
  // display: flex;
  // flex-direction: column;
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

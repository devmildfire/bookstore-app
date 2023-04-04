import * as React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import { StyledWrapper } from './styles';

interface HomeLayoutProps {
  readonly title: string;
}

const StyledTitle = styled(Text)`
  background: linear-gradient(
    180deg,
    rgba(5, 5, 5, 1) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  width: 100%;
  padding: 2rem 0;
`;

function HomeLayout(props: React.PropsWithChildren<HomeLayoutProps>) {
  const { children, title } = props;
  return (
    <StyledWrapper>
      {/* <StyledNavigation /> */}
      <StyledTitle variant='h2_1' align='center'>
        {title}
      </StyledTitle>
      {children}
    </StyledWrapper>
  );
}

export default HomeLayout;

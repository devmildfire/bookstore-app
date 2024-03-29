import * as React from 'react';
import SetsList from './SetsList';
import { StyledWrapper } from './styles';

const Sets: React.FC = () => (
  <StyledWrapper>
    <SetsList />
  </StyledWrapper>
);

export default React.memo(Sets);

import * as React from 'react';
import Text from '@/components/Common/Text';
import SetsList from './SetsList';
import { StyledWrapper } from './styles';

interface SetsProps {}

const Sets: React.FC<SetsProps> = () => (
  <StyledWrapper>
    <Text>Место для фильтров</Text>
    <SetsList />
  </StyledWrapper>
);

export default Sets;

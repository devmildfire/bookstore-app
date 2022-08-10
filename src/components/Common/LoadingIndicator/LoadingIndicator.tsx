import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledLoading, StyledWrapper } from './styles';

type LoadingIndicatorProps = ClassNameProps;

const LoadingIndicator: React.FC<LoadingIndicatorProps> = (props) => {
  return (
    <StyledWrapper {...props}>
      <StyledLoading />
    </StyledWrapper>
  );
};

export default React.memo(LoadingIndicator);

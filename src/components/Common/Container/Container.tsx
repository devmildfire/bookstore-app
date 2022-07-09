import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainer from './styles';

const Container = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<ClassNameProps>
>((props, ref) => {
  const { children, className } = props;
  return (
    <StyledContainer className={className} ref={ref}>
      {children}
    </StyledContainer>
  );
});

export default React.memo(Container);

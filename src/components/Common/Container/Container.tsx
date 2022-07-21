import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainer from './styles';

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ClassNameProps {}

const Container = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<ContainerProps>
>((props, ref) => <StyledContainer {...props} ref={ref} />);

export default React.memo(Container);

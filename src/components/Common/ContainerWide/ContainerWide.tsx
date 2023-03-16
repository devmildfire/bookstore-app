import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainerWide from './styles';

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ClassNameProps {}

const ContainerWide = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<ContainerProps>
>((props, ref) => <StyledContainerWide {...props} ref={ref} />);

export default ContainerWide;

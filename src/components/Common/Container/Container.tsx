import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainer from './styles';
import { PropsWithChildren, RefObject } from 'react';

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ClassNameProps {}

function Container(
  props: PropsWithChildren<ContainerProps>,
  ref: RefObject<HTMLDivElement>
) {
  return <StyledContainer {...props} ref={ref} />;
}

export default Container;

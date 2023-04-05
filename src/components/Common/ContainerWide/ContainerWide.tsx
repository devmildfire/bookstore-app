import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainerWide from './styles';
import { PropsWithChildren, RefObject } from 'react';

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ClassNameProps {}

function ContainerWide(
  props: PropsWithChildren<ContainerProps>,
  ref: RefObject<HTMLDivElement>
) {
  return <StyledContainerWide {...props} ref={ref} />;
}

export default ContainerWide;

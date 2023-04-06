import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainer from './styles';
import { PropsWithChildren } from 'react';

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ClassNameProps {}

function Container(
  props: PropsWithChildren<ContainerProps>,
  ref: React.Ref<HTMLDivElement>
) {
  return <StyledContainer {...props} ref={ref} />;
}

export default React.forwardRef(Container);

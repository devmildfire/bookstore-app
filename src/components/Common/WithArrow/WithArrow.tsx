import Link from 'next/link';
import React, { PropsWithChildren } from 'react';
import { ClassNameProps } from '@/types/className';
import { TextProps } from '../Text';
import { StyledArrowIcon, StyledArrowProps, StyledText } from './styles';

export interface WithArrowProps
  extends ClassNameProps,
    Partial<StyledArrowProps>,
    TextProps {}

const WithArrow = (
  props: PropsWithChildren<WithArrowProps>,
): React.ReactElement => {
  const {
    offset = '0.32em',
    position = 'bottom',
    children,
    ...textParams
  } = props;
  return (
    <StyledText {...textParams}>
      <Link href='fakePath' passHref>
        <a href='fakeHref'>{children}</a>
      </Link>
      <StyledArrowIcon offset={offset} position={position} />
    </StyledText>
  );
};

export default WithArrow;

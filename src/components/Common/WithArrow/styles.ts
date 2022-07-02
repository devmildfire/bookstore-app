import styled from 'styled-components';
import ArrowIcon from '@/assets/images/arrow.svg';
import Text from '../Text';
import { Offset, Position } from './types';

export interface StyledArrowProps {
  readonly position: Position;
  readonly offset: Offset;
}

export const StyledText = styled(Text)`
  position: relative;
`;

export const StyledArrowIcon = styled(ArrowIcon)`
  --arrowOffset: ${(props: StyledArrowProps) => props.offset};
  position: absolute;
  right: 0;
  left: 0;
  ${(props: StyledArrowProps) => props.position}: calc(0px - var(--arrowOffset));

  fill: currentColor;
`;

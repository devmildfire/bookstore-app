import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Text from '../Text';
import { StyledButton, StyledWrapper } from './styles';
import { VoidFunction } from '@/types/common';
import Cross from '../Icons/Cross';

export interface PopupHeaderProps extends ClassNameProps {
  readonly title: string;
  readonly onClose?: VoidFunction;
}

const PopupHeader: React.FC<PopupHeaderProps> = (props) => {
  const { title, className, onClose, } = props;
  return (
    <StyledWrapper className={className}>
      <Text variant='text'>{title}</Text>
      <StyledButton onClick={onClose}>
        <Cross />
      </StyledButton>
    </StyledWrapper>
  );
};

export default React.memo(PopupHeader);

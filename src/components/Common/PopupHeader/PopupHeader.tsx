import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Text from '../Text';
import { StyledButton, StyledWrapper } from './styles';

export interface PopupHeaderProps extends ClassNameProps {
  readonly title: string;
  readonly onClose: any;
}

const PopupHeader: React.FC<PopupHeaderProps> = (props) => {
  const { title, className, onClose } = props;
  return (
    <StyledWrapper className={className}>
      <Text variant='text'>{title}</Text>
      <StyledButton onClick={onClose} />
    </StyledWrapper>
  );
};

export default React.memo(PopupHeader);

import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Text from '../Text';
import { StyledWrapper } from './styles';

export interface PopupHeaderProps extends ClassNameProps {
  readonly title: string;
  readonly subtitle?: string;
}

const PopupHeader: React.FC<PopupHeaderProps> = (props) => {
  const { title, className, subtitle, } = props;
  return (
    <StyledWrapper className={className}>
      <Text variant='h3_2'>{title}</Text>
      {subtitle && (
        <Text
          variant='h3_3'
          component='p'
          fontWeight={400}
          textTransform='initial'
        >
          {subtitle}
        </Text>
      )}
    </StyledWrapper>
  );
};

export default React.memo(PopupHeader);

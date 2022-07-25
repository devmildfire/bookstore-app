import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledList } from './styles';

type Tag = 'div' | 'ul' | 'ol';

interface ListProps extends ClassNameProps {
  readonly tag?: Tag;
}

const List: React.FC<ListProps> = (props) => {
  const { children, tag, className } = props;
  return (
    <StyledList className={className} as={tag}>
      {children}
    </StyledList>
  );
};

export default List;
